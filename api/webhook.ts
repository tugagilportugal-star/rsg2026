import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { generateTicketEmail } from '../utils/email-template';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Tenta inicializar o Resend (se falhar, loga erro mas não quebra o app todo)
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.error("⚠️ RESEND_API_KEY não encontrada!");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error("❌ Faltam credenciais do Stripe (Signature ou Secret)");
      return res.status(400).send('Webhook Credentials Error');
    }

    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erro de assinatura do Webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`💰 Processando sessão: ${session.id}`);

    try {
      // 1. Salvar Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email,
          customer_name: session.customer_details?.name,
          total_amount: session.amount_total,
          status: 'paid',
        })
        .select()
        .single();

      if (orderError) {
        console.error("❌ Erro ao criar Order:", orderError);
        throw orderError;
      }

      // 2. Salvar Ticket
      const metadata = session.metadata || {};
      
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          order_id: orderData.id,
          ticket_type_id: metadata.ticket_type_id,
          attendee_name: metadata.attendee_name,
          attendee_email: session.customer_details?.email,
          attendee_phone: metadata.attendee_phone,
          attendee_company: metadata.attendee_company,
          checked_in: false,
        })
        .select()
        .single();

      if (ticketError) {
        console.error("❌ Erro ao criar Ticket:", ticketError);
        throw ticketError;
      }

      console.log(`✅ Ticket criado: ${ticketData.id}`);

      // 3. Enviar E-mail (se Resend estiver configurado)
      if (resend) {
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(ticketData.qr_code_secret);
          
          // Busca nome do bilhete
          const { data: typeData } = await supabase
            .from('ticket_types')
            .select('name')
            .eq('id', metadata.ticket_type_id)
            .single();
            
          const ticketName = typeData?.name || 'Ingresso';
          const emailDestino = session.customer_details?.email;

          console.log(`📧 Tentando enviar email para: ${emailDestino}`);

          const emailResponse = await resend.emails.send({
            // IMPORTANTE: Em teste, use SEMPRE onboarding@resend.dev
            from: 'RSG Lisbon <onboarding@resend.dev>', 
            to: emailDestino as string,
            subject: `O teu bilhete para o RSG Lisbon 2026 🎟️`,
            html: generateTicketEmail(
              metadata.attendee_name, 
              ticketName, 
              qrCodeDataUrl, 
              ticketData.id
            ),
          });

          if (emailResponse.error) {
             console.error("❌ Erro retornado pelo Resend:", emailResponse.error);
             // Não damos throw aqui para não cancelar a gravação do banco
             // O webhook retorna 200 OK mesmo se o email falhar, pois o dinheiro já entrou
          } else {
             console.log("✅ Email enviado com sucesso ID:", emailResponse.data?.id);
          }

        } catch (emailErr) {
          console.error("❌ Erro ao tentar enviar email:", emailErr);
          // Engolimos o erro do email para não dar 500 no webhook
        }
      }

    } catch (err: any) {
      console.error('❌ Erro CRÍTICO no processamento:', err);
      // Aqui sim retornamos 500 para o Stripe tentar de novo
      return res.status(500).send('Database/Processing Error');
    }
  }

  res.json({ received: true });
}
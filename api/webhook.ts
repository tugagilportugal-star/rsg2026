import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import QRCode from 'qrcode';

// ==================================================================
// CONFIGURAÇÕES DO EMAIL (Inlined para evitar erro de import no Vercel)
// ==================================================================
const generateTicketEmail = (
  name: string,
  ticketName: string,
  qrCodeDataUrl: string,
  ticketId: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: sans-serif; background-color: #f4f4f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .logo { height: 50px; margin-bottom: 20px; }
          .h1 { color: #003F59; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .p { color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
          .ticket-box { border: 2px dashed #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; background: #fafafa; }
          .qr-code { width: 200px; height: 200px; margin: 10px auto; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; }
          .highlight { color: #F47A20; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="h1">Olá, ${name}!</h1>
          <p class="p">O seu lugar no <strong>Regional Scrum Gathering Lisbon 2026</strong> está garantido.</p>
          
          <div class="ticket-box">
            <p style="margin: 0; font-weight: bold; color: #003F59;">${ticketName}</p>
            <p style="margin: 5px 0 15px 0; color: #888; font-size: 12px;">ID: ${ticketId}</p>
            
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
            
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
              Apresente este código na entrada do evento.
            </p>
          </div>

          <p class="p">
            Estamos ansiosos para te ver em Lisboa!
            <br/>Se precisares de fatura, ela será enviada num e-mail separado.
          </p>

          <div class="footer">
            <p>Enviado por TugÁgil • RSG Lisbon 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// ==================================================================
// CONFIGURAÇÃO DO WEBHOOK
// ==================================================================
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

// Inicializa Resend com verificação
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.error("⚠️ RESEND_API_KEY não encontrada!");
}

// ==================================================================
// HANDLER PRINCIPAL
// ==================================================================
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

  // Lógica de Sucesso
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
          } else {
             console.log("✅ Email enviado com sucesso ID:", emailResponse.data?.id);
          }

        } catch (emailErr) {
          console.error("❌ Erro ao tentar enviar email:", emailErr);
        }
      }

    } catch (err: any) {
      console.error('❌ Erro CRÍTICO no processamento:', err);
      return res.status(500).send('Database/Processing Error');
    }
  }

  res.json({ received: true });
}
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

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) throw new Error('Missing Stripe signature or secret');
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`💰 Pagamento recebido! Session ID: ${session.id}`);

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

      if (orderError) throw orderError;

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

      if (ticketError) throw ticketError;
      console.log(`✅ Ticket criado: ${ticketData.id}`);

      // 3. Gerar QR Code e Enviar E-mail
      const qrCodeDataUrl = await QRCode.toDataURL(ticketData.qr_code_secret);
      
      // Buscar nome do bilhete para o email
      const { data: typeData } = await supabase
        .from('ticket_types')
        .select('name')
        .eq('id', metadata.ticket_type_id)
        .single();
        
      const ticketName = typeData?.name || 'Ingresso RSG 2026';

      await resend.emails.send({
        from: 'RSG Lisbon <onboarding@resend.dev>', // Em PROD, mude para seu dominio verificado
        to: session.customer_details?.email as string,
        subject: `Seu bilhete para o RSG Lisbon 2026 chegou! 🎟️`,
        html: generateTicketEmail(
          metadata.attendee_name, 
          ticketName, 
          qrCodeDataUrl, 
          ticketData.id
        ),
      });

      console.log(`📧 E-mail enviado para: ${session.customer_details?.email}`);

    } catch (err: any) {
      console.error('❌ Erro no processamento:', err);
      return res.status(500).send('Processing Error');
    }
  }

  res.json({ received: true });
}
import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// --- TEMPLATE DE EMAIL (Embutido) ---
const generateTicketEmail = (name: string, ticketName: string, qrUrl: string, ticketId: string) => `
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; background: #f4f4f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; text-align: center;">
      <h1 style="color: #003F59;">Olá, ${name}!</h1>
      <p style="color: #666;">O teu bilhete para o <strong>RSG Lisbon 2026</strong> está aqui.</p>
      
      <div style="border: 2px dashed #e5e7eb; padding: 20px; margin: 20px 0;">
        <p style="font-weight: bold; color: #003F59; margin: 0;">${ticketName}</p>
        <p style="color: #888; font-size: 12px; margin: 5px 0;">ID: ${ticketId}</p>
        
        <!-- Imagem Direta da QuickChart -->
        <img src="${qrUrl}" alt="QR Code" width="250" height="250" style="display:block; margin: 20px auto;" />
      </div>

      <p style="color: #999; font-size: 12px;">Enviado por TugÁgil</p>
    </div>
  </body>
</html>
`;

export const config = {
  api: { bodyParser: false },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  console.log("🔵 [WEBHOOK] Iniciado");

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    console.error(`🔴 [ERRO] Assinatura inválida: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`🔵 [PASSO 1] Sessão Stripe recebida: ${session.id}`);

    try {
      // 1. Order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email,
          customer_name: session.customer_details?.name,
          total_amount: session.amount_total,
          status: 'paid',
        })
        .select().single();

      if (orderErr) throw new Error(`Erro DB Order: ${orderErr.message}`);
      console.log(`🔵 [PASSO 2] Order salva: ${order.id}`);

      // 2. Ticket
      const meta = session.metadata || {};
      const { data: ticket, error: ticketErr } = await supabase
        .from('tickets')
        .insert({
          order_id: order.id,
          ticket_type_id: meta.ticket_type_id,
          attendee_name: meta.attendee_name,
          attendee_email: session.customer_details?.email,
          attendee_phone: meta.attendee_phone,
          attendee_company: meta.attendee_company,
          checked_in: false,
        })
        .select().single();

      if (ticketErr) throw new Error(`Erro DB Ticket: ${ticketErr.message}`);
      console.log(`🔵 [PASSO 3] Ticket salvo: ${ticket.id}`);

      // 3. Email
      console.log(`🔵 [PASSO 4] A preparar envio de email...`);
      
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(ticket.qr_code_secret)}&dark=003F59&size=300&margin=1`;
      
      // Buscar nome do bilhete (Fallback se falhar)
      let ticketName = 'Ingresso';
      if (meta.ticket_type_id) {
         const { data: type } = await supabase.from('ticket_types').select('name').eq('id', meta.ticket_type_id).single();
         if (type) ticketName = type.name;
      }

      // Envio explícito com await
      const emailRes = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: session.customer_details?.email as string,
        subject: 'O teu bilhete RSG Lisbon 2026 🎟️',
        html: generateTicketEmail(meta.attendee_name, ticketName, qrUrl, ticket.id)
      });

      if (emailRes.error) {
        console.error("🔴 [ERRO RESEND API]:", emailRes.error);
      } else {
        console.log("🟢 [SUCESSO] Email enviado! ID:", emailRes.data?.id);
      }

    } catch (err: any) {
      console.error('🔴 [ERRO CRÍTICO]:', err.message);
      return res.status(500).send(err.message);
    }
  }

  res.json({ received: true });
}
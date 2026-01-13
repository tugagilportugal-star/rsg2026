import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
// Removido: import QRCode from 'qrcode'; (Não é mais necessário)

// ==================================================================
// CONFIGURAÇÕES DO EMAIL
// ==================================================================
const generateTicketEmail = (
  name: string,
  ticketName: string,
  qrCodeUrl: string, // Agora é uma URL https, não base64
  ticketId: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: sans-serif; background-color: #f4f4f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .h1 { color: #003F59; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .p { color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
          .ticket-box { border: 2px dashed #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; background: #fafafa; }
          .qr-code { width: 200px; height: 200px; margin: 10px auto; display: block; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="h1">Olá, ${name}!</h1>
          <p class="p">O seu lugar no <strong>Regional Scrum Gathering Lisbon 2026</strong> está garantido.</p>
          
          <div class="ticket-box">
            <p style="margin: 0; font-weight: bold; color: #003F59;">${ticketName}</p>
            <p style="margin: 5px 0 15px 0; color: #888; font-size: 12px;">ID: ${ticketId}</p>
            
            <!-- Imagem via URL HTTPS segura -->
            <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" width="200" height="200" />
            
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
              Apresente este código na entrada do evento.
            </p>
          </div>

          <p class="p">
            Estamos ansiosos para te ver em Lisboa!
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

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// ==================================================================
// HANDLER
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
      return res.status(400).send('Credentials Error');
    }

    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`💰 Processando: ${session.id}`);

    try {
      // 1. Order
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

      // 2. Ticket
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

      // 3. Email com QR Code (API QuickChart)
      if (resend) {
        // Gera URL pública do QR Code (Cor azul escura para combinar com a marca)
        // O secret do ticket é passado como texto
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(ticketData.qr_code_secret)}&dark=003F59&size=300&margin=1`;
        
        const { data: typeData } = await supabase
          .from('ticket_types')
          .select('name')
          .eq('id', metadata.ticket_type_id)
          .single();
          
        const ticketName = typeData?.name || 'Ingresso';

        await resend.emails.send({
          from: 'RSG Lisbon <onboarding@resend.dev>',
          to: session.customer_details?.email as string,
          subject: `O teu bilhete chegou! 🎟️`,
          html: generateTicketEmail(
            metadata.attendee_name, 
            ticketName, 
            qrCodeUrl, 
            ticketData.id
          ),
        });
      }

    } catch (err) {
      console.error('❌ Erro processamento:', err);
      return res.status(500).send('Error');
    }
  }

  res.json({ received: true });
}
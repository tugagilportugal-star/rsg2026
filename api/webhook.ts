import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import { issueInvoiceForOrder } from '../lib/invoicing/index.js';
import type { InvoiceEmailData } from '../lib/invoicing/types.js';

// ==================================================================
// 1) EMAIL - BILHETE
// ==================================================================
const generateTicketEmail = (name: string, ticketName: string, qrUrl: string, ticketId: string) => `
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; background: #f4f4f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h1 style="color: #003F59; font-size: 24px; margin-bottom: 10px;">Olá, ${name}!</h1>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">O teu lugar no <strong>Regional Scrum Gathering Lisbon 2026</strong> está garantido.</p>

      <div style="border: 2px dashed #e5e7eb; padding: 20px; border-radius: 8px; margin: 30px 0; background: #fafafa;">
        <p style="font-weight: bold; color: #003F59; margin: 0; font-size: 18px;">${ticketName}</p>
        <p style="color: #888; font-size: 12px; margin: 5px 0 15px 0;">ID: ${ticketId}</p>

        <img src="${qrUrl}" alt="QR Code" width="200" height="200" style="display:block; margin: 0 auto;" />

        <p style="font-size: 12px; color: #666; margin-top: 15px;">
          Apresenta este código na entrada do evento.
        </p>
      </div>

      <p style="color: #666; font-size: 14px;">
        Estamos ansiosos para te ver em Lisboa!
        <br/>A tua fatura foi emitida e enviada num e-mail separado.
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="color: #999; font-size: 12px; margin: 0;">Enviado por TugÁgil • RSG Lisbon 2026</p>
      </div>
    </div>
  </body>
</html>
`;

// ==================================================================
// 2) EMAIL - FATURA (ANEXO PDF)
// ==================================================================
const generateInvoiceEmail = (d: InvoiceEmailData) => `
<!DOCTYPE html>
<html lang="pt-PT">
  <body style="margin:0; padding:0; background:#f4f4f5; font-family: Arial, Helvetica, sans-serif;">
    <div style="padding:24px;">
      <div style="max-width:640px; margin:0 auto;">

        <div style="font-weight:700; font-size:18px; color:#003F59;">
          Regional Scrum Gathering Lisbon 2026
        </div>

        <div style="background:#ffffff; border-radius:14px; margin-top:16px; overflow:hidden;">
          <div style="background:#003F59; padding:18px; color:#ffffff;">
            <strong>A tua fatura está pronta 🧾</strong>
          </div>

          <div style="padding:22px; font-size:14px; color:#374151;">
            <p>Olá, <strong>${d.name}</strong>,</p>

            <p>
              Segue em anexo a fatura referente à tua compra do bilhete para o
              <strong>Regional Scrum Gathering Lisbon 2026</strong>.
            </p>

            <div style="background:#fafafa; border-radius:10px; padding:14px; margin:16px 0;">
              <p><strong>Resumo</strong></p>
              <p>Bilhete: ${d.ticketName}</p>
              <p>Nº do documento: #${d.invoiceId}</p>
              <p>Total: ${d.total} €</p>
            </div>

            ${
              d.isTest
                ? `<div style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px; border-radius:8px; font-size:12px;">
                     <strong>Nota:</strong> Este documento foi gerado em ambiente de testes e não tem validade fiscal.
                   </div>`
                : ''
            }

            <p style="margin-top:16px;">
              Se tiveres alguma dúvida, responde a este email.
            </p>

            <p style="font-size:12px; color:#6b7280; margin-top:24px;">
              TugÁgil • RSG Lisbon 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;

// precisa estar abaixo de `resend`, então deixamos como function (hoisted)
async function sendInvoicePdfByEmailResend(params: {
  to: string;
  pdfBytes: Buffer;
  invoiceId: string;
  name: string;
  ticketName: string;
  total: string;
  isTest: boolean;
}) {
  const { to, pdfBytes, invoiceId, name, ticketName, total, isTest } = params;

  return resend.emails.send({
    from: 'RSG Lisbon <onboarding@resend.dev>',
    to,
    subject: 'A tua fatura – Regional Scrum Gathering Lisbon 2026',
    html: generateInvoiceEmail({ name, ticketName, invoiceId, total, isTest }),
    attachments: [
      {
        filename: `invoice-${invoiceId}.pdf`,
        content: pdfBytes.toString('base64'),
      },
    ],
  });
}

// ==================================================================
// 3) CONFIG GERAL
// ==================================================================
export const config = { api: { bodyParser: false } };

async function buffer(readable: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

function stripeIsTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key.startsWith('sk_test_');
}

// ==================================================================
// 4) HANDLER
// ==================================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔔 Webhook hit', { ts: new Date().toISOString(), method: req.method, url: (req as any).url });

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    console.error(`❌ Signature Error: ${err.message}`);
    return res.status(400).send('Webhook Error');
  }

  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log(`💰 Processando Order: ${session.id}`);

  try {
    // 1) Salvar Order
    const { data: order, error: orderErr } = await supabase
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

    if (orderErr) throw new Error(`DB Order Error: ${orderErr.message}`);

    // 2) Salvar Ticket
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
      .select()
      .single();

    if (ticketErr) throw new Error(`DB Ticket Error: ${ticketErr.message}`);

    // 3) Buscar nome do Bilhete
    let ticketName = 'Ingresso RSG 2026';
    if (meta.ticket_type_id) {
      const { data: type } = await supabase.from('ticket_types').select('name').eq('id', meta.ticket_type_id).single();
      if (type) ticketName = type.name;
    }

    // 4) Faturação via Provider (InvoiceXpress OU Bill.pt)
    const amountEuro = (order.total_amount || 0) / 100;
    const customerCountryIso = session.customer_details?.address?.country || 'PT';

    const isTest = stripeIsTestMode();

    const invoiceResult = await issueInvoiceForOrder({
      isTest,
      customerName: order.customer_name || meta.attendee_name || 'Participante RSG',
      customerEmail: order.customer_email,
      countryIso: customerCountryIso,
      ticketName,
      amountEuro,
    });

    if (invoiceResult?.invoiceId) {
      await supabase.from('orders').update({ invoice_id: invoiceResult.invoiceId }).eq('id', order.id);

      // Se o provider devolveu PDF, enviamos por email (end-to-end)
      if (invoiceResult.pdfBytes) {
        const sendRes = await sendInvoicePdfByEmailResend({
          to: order.customer_email,
          pdfBytes: invoiceResult.pdfBytes,
          invoiceId: invoiceResult.invoiceId,
          name: order.customer_name || meta.attendee_name || 'Participante',
          ticketName,
          total: invoiceResult.total ?? amountEuro.toFixed(2),
          isTest,
        });

        if ((sendRes as any)?.error) console.error('⚠️ Resend invoice PDF error:', (sendRes as any).error);
        else console.log('📩 Email com PDF da fatura enviado.');
      }
    }

    // 5) Email do bilhete
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(ticket.qr_code_secret)}&dark=003F59&size=300&margin=1`;

    const emailRes = await resend.emails.send({
      from: 'RSG Lisbon <onboarding@resend.dev>',
      to: session.customer_details?.email as string,
      subject: 'O teu bilhete RSG Lisbon 2026 🎟️',
      html: generateTicketEmail(meta.attendee_name, ticketName, qrUrl, ticket.id),
    });

    if (emailRes.error) console.error('⚠️ Resend Error:', emailRes.error);
    else console.log('📧 Email enviado.');

    return res.json({ received: true });
  } catch (err: any) {
    console.error('❌ Critical Error:', err.message);
    return res.status(500).send('Internal Server Error');
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { issueInvoiceForOrder } from '../lib/invoicing/index.js';
import type { InvoiceEmailData } from '../lib/invoicing/types.js';

// ==================================================================
// 1) EMAIL - BILHETE
// ==================================================================
const generateTicketEmail = (
  name: string,
  ticketName: string,
  qrUrl: string,
  ticketId: string
) => `
# Olá, ${name}!

O teu lugar no Regional Scrum Gathering Lisbon 2026 está garantido.

${ticketName}

ID: ${ticketId}

Apresenta este código na entrada do evento.

Estamos ansiosos para te ver em Lisboa!
A tua fatura foi emitida e enviada num e-mail separado.

Enviado por TugÁgil • RSG Lisbon 2026
`;

// ==================================================================
// 2) EMAIL - FATURA (ANEXO PDF)
// ==================================================================
const generateInvoiceEmail = (d: InvoiceEmailData) => `
Regional Scrum Gathering Lisbon 2026

A tua fatura está pronta

Olá, ${d.name},

Segue em anexo a fatura referente à tua compra do bilhete para o Regional Scrum Gathering Lisbon 2026.

Resumo

Bilhete: ${d.ticketName}

Nº do documento: #${d.invoiceId}

Total: ${d.total} €
${
  d.isTest
    ? `
Nota: Este documento foi gerado em ambiente de testes e não tem validade fiscal.
`
    : ''
}

Se tiveres alguma dúvida, responde a este email.

TugÁgil • RSG Lisbon 2026
`;

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
    from: 'RSG Lisbon 2026 <rsg@rsglisbon.com>',
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
export const config = {
  api: { bodyParser: false },
};

async function buffer(readable: any) {
  const chunks: Buffer[] = [];
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

const resend = new Resend(process.env.RESEND_API_KEY as string);

function stripeIsTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key.startsWith('sk_test_');
}

// ==================================================================
// 4) HANDLER
// ==================================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔔 Webhook hit', {
    ts: new Date().toISOString(),
    method: req.method,
    url: (req as any).url,
  });

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Server configuration error');
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Signature Error: ${err.message}`);
    return res.status(400).send('Webhook Error');
  }

  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log(`🧾 Processando Order: ${session.id}`);

  try {
    const meta = (session.metadata || {}) as Record<string, string | undefined>;

    const ticketTypeId = meta.ticket_type_id;
    const qty = Number(meta.quantity || 1);

    const couponId = String(meta.coupon_id || '').trim();
    const couponCode = String(meta.coupon_code || '')
      .trim()
      .toUpperCase();
    const couponSingleUse =
      String(meta.coupon_single_use || '').trim().toLowerCase() === 'true';

    // País do comprador (ISO, ex: "PT")
    const customerCountryIso =
      session.customer_details?.address?.country ||
      meta.attendee_country ||
      meta.country ||
      'PT';

    // -----------------------------
    // Normalização dos campos
    // -----------------------------
    const attendeeFirstName =
      meta.attendee_first_name ||
      meta.firstName ||
      meta.first_name ||
      null;

    const attendeeLastName =
      meta.attendee_last_name ||
      meta.lastName ||
      meta.last_name ||
      null;

    const attendeeCountry =
      meta.attendee_country ||
      meta.country ||
      null;

    const attendeeJobFunction =
      meta.attendee_job_function ||
      meta.jobFunctionFinal ||
      meta.jobFunction ||
      null;

    const attendeeJobFunctionOther =
      meta.attendee_job_function_other ||
      meta.jobFunctionOther ||
      null;

    const attendeeCompany =
      meta.attendee_company ||
      meta.company ||
      null;

    const attendeePhone =
      meta.attendee_phone ||
      meta.phone ||
      null;

    const attendeeNif =
      meta.attendee_nif ||
      meta.nif ||
      null;

    const attendeeJobTitle =
      meta.attendee_job_title ||
      meta.jobTitle ||
      null;

    const attendeeTshirt =
      meta.attendee_tshirt ||
      meta.tshirt ||
      null;

    const saDataSharingConsent =
      String(meta.sa_data_sharing_consent || '').trim().toLowerCase() === 'true';

    const saMarketingConsent =
      String(meta.sa_marketing_consent || '').trim().toLowerCase() === 'true';

    const privacyConsent =
      String(meta.privacy_consent || '').trim().toLowerCase() === 'true';

    const attendeeName =
      meta.attendee_name ||
      meta.name ||
      [attendeeFirstName, attendeeLastName].filter(Boolean).join(' ').trim() ||
      session.customer_details?.name ||
      null;

    // 1) Salvar Order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        customer_country: customerCountryIso,
        total_amount: session.amount_total,
        status: 'paid',
      })
      .select()
      .single();

    if (orderErr) {
      throw new Error(`DB Order Error: ${orderErr.message}`);
    }

    // 2) Salvar Ticket
    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets')
      .insert({
        order_id: order.id,
        ticket_type_id: ticketTypeId,
        attendee_name: attendeeName,
        attendee_email: session.customer_details?.email,
        attendee_company: attendeeCompany,
        attendee_phone: attendeePhone,
        attendee_first_name: attendeeFirstName,
        attendee_last_name: attendeeLastName,
        attendee_country: attendeeCountry,
        attendee_job_function: attendeeJobFunction,
        attendee_job_function_other: attendeeJobFunctionOther,
        attendee_nif: attendeeNif,
        attendee_job_title: attendeeJobTitle,
        attendee_tshirt: attendeeTshirt,
        sa_data_sharing_consent: saDataSharingConsent,
        sa_marketing_consent: saMarketingConsent,
        privacy_consent: privacyConsent,
        checked_in: false,
      })
      .select()
      .single();

    if (ticketErr) {
      throw new Error(`DB Ticket Error: ${ticketErr.message}`);
    }

    // 2.1) Atualizar contador do lote e ativar próximo (se esgotou)
    if (ticketTypeId) {
      const { data: consumeRes, error: consumeErr } = await supabase.rpc(
        'consume_ticket_type',
        {
          p_ticket_type_id: ticketTypeId,
          p_qty: qty,
        }
      );

      if (consumeErr) {
        console.error('⚠️ consume_ticket_type RPC error:', consumeErr.message);
      } else {
        console.log('🎟️ consume_ticket_type result:', consumeRes);
      }
    } else {
      console.warn(
        '⚠️ ticket_type_id não encontrado no metadata; não atualizei quantity_sold.'
      );
    }

    // 2.2) Desativar cupão single_use após pagamento confirmado
    if (couponSingleUse && (couponId || couponCode)) {
      const query = supabase
        .from('discount_coupons')
        .update({
          active: false,
          used_at: new Date().toISOString(),
          used_by_order_id: order.id,
        })
        .eq('active', true);

      // Prefere match por ID (atómico), fallback por código
      const { error: couponErr } = couponId
        ? await query.eq('id', couponId)
        : await query.eq('code', couponCode);

      if (couponErr) {
        console.error('⚠️ Coupon deactivate error:', couponErr.message);
      } else {
        console.log(`✅ Cupão ${couponCode} desativado após pagamento confirmado.`);
      }
    }

    // 3) Buscar nome do Bilhete
    let ticketName = 'Ingresso RSG 2026';

    if (ticketTypeId) {
      const { data: type } = await supabase
        .from('ticket_types')
        .select('name')
        .eq('id', ticketTypeId)
        .single();

      if (type) {
        ticketName = type.name;
      }
    }

    // 4) Faturação via Provider
    const amountEuro = (order.total_amount || 0) / 100;
    const isTest = stripeIsTestMode();

    const invoiceResult = await issueInvoiceForOrder({
      isTest,
      customerName: order.customer_name || attendeeName || 'Participante RSG',
      customerEmail: order.customer_email,
      countryIso: customerCountryIso,
      ticketName,
      amountEuro,
    });

    if (invoiceResult?.invoiceId) {
      await supabase
        .from('orders')
        .update({ invoice_id: invoiceResult.invoiceId })
        .eq('id', order.id);

      if (invoiceResult.pdfBytes) {
        const sendRes = await sendInvoicePdfByEmailResend({
          to: order.customer_email,
          pdfBytes: invoiceResult.pdfBytes,
          invoiceId: invoiceResult.invoiceId,
          name: order.customer_name || attendeeName || 'Participante',
          ticketName,
          total: (invoiceResult as any)?.total ?? amountEuro.toFixed(2),
          isTest,
        });

        if ((sendRes as any)?.error) {
          console.error('⚠️ Resend invoice PDF error:', (sendRes as any).error);
        } else {
          console.log('📧 Email com PDF da fatura enviado.');
        }
      }
    }

    // 5) Email do bilhete
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
      ticket.qr_code_secret
    )}&dark=003F59&size=300&margin=1`;

    const emailRes = await resend.emails.send({
      from: 'RSG Lisbon 2026 <rsg@rsglisbon.com>',
      to: session.customer_details?.email as string,
      subject: 'O teu bilhete RSG Lisbon 2026 🎟️',
      html: generateTicketEmail(
        attendeeName || 'Participante',
        ticketName,
        qrUrl,
        ticket.id
      ),
    });

    if (emailRes.error) {
      console.error('⚠️ Resend Error:', emailRes.error);
    } else {
      console.log('📧 Email enviado.');
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('❌ Critical Error:', err.message);
    return res.status(500).send('Internal Server Error');
  }
}
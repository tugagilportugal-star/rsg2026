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
) => `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>O teu bilhete RSG Lisbon 2026</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#003F59;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">Regional Scrum Gathering</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;">RSG Lisbon 2026</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#003F59;font-size:22px;">O teu lugar está garantido! 🎉</h2>
          <p style="margin:0 0 24px;color:#555;font-size:16px;">Olá, <strong>${name}</strong>! O teu bilhete para o RSG Lisbon 2026 foi confirmado.</p>

          <!-- Ticket card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7fb;border:2px solid #003F59;border-radius:10px;margin-bottom:32px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 4px;color:#003F59;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Tipo de bilhete</p>
              <p style="margin:0 0 20px;color:#003F59;font-size:20px;font-weight:700;">${ticketName}</p>
              <img src="${qrUrl}" alt="QR Code" width="180" height="180" style="display:block;margin:0 auto 16px;border-radius:8px;" />
              <p style="margin:0 0 4px;color:#888;font-size:12px;">ID do bilhete</p>
              <p style="margin:0;color:#003F59;font-size:13px;font-family:monospace;word-break:break-all;">${ticketId}</p>
            </td></tr>
          </table>

          <p style="margin:0 0 12px;color:#555;font-size:15px;">📍 Apresenta o QR code na entrada do evento.</p>
          <p style="margin:0 0 32px;color:#555;font-size:15px;">🧾 A tua fatura foi emitida e enviada num e-mail separado.</p>

          <p style="margin:0;color:#888;font-size:13px;text-align:center;">Estamos ansiosos para te ver em Lisboa!</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f4f6f8;padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0;color:#aaa;font-size:12px;">TugÁgil • RSG Lisbon 2026</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ==================================================================
// 2) EMAIL - FATURA (ANEXO PDF)
// ==================================================================
const generateInvoiceEmail = (d: InvoiceEmailData) => `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A tua fatura – RSG Lisbon 2026</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#003F59;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">Regional Scrum Gathering</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;">RSG Lisbon 2026</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#003F59;font-size:22px;">A tua fatura está pronta 🧾</h2>
          <p style="margin:0 0 24px;color:#555;font-size:16px;">Olá, <strong>${d.name}</strong>! Segue em anexo a fatura referente à tua compra.</p>

          <!-- Summary card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7fb;border:1px solid #cde3ef;border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 12px;color:#003F59;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Resumo</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#555;font-size:15px;padding-bottom:8px;">Bilhete</td>
                  <td style="color:#003F59;font-size:15px;font-weight:600;text-align:right;padding-bottom:8px;">${d.ticketName}</td>
                </tr>
                <tr>
                  <td style="color:#555;font-size:15px;padding-bottom:8px;">Nº do documento</td>
                  <td style="color:#003F59;font-size:15px;font-weight:600;text-align:right;padding-bottom:8px;">#${d.invoiceId}</td>
                </tr>
                <tr style="border-top:1px solid #cde3ef;">
                  <td style="color:#003F59;font-size:16px;font-weight:700;padding-top:12px;">Total</td>
                  <td style="color:#003F59;font-size:16px;font-weight:700;text-align:right;padding-top:12px;">${d.total} €</td>
                </tr>
              </table>
            </td></tr>
          </table>

          ${d.isTest ? '<p style="margin:0 0 16px;color:#e67e22;font-size:13px;background:#fef9f0;border:1px solid #f5c97a;border-radius:6px;padding:12px;">⚠️ Documento gerado em ambiente de testes — sem validade fiscal.</p>' : ''}

          <p style="margin:0 0 0;color:#888;font-size:14px;">Se tiveres alguma dúvida, responde a este email.</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f4f6f8;padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0;color:#aaa;font-size:12px;">TugÁgil • RSG Lisbon 2026</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

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
    const includeRecording = String(meta.include_recording || '').toLowerCase() === 'true';

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
        include_recording: includeRecording,
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
      customerNif: attendeeNif || null,
      ticketName,
      includeRecording,
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
          total: invoiceResult.total,
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
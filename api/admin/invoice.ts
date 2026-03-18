import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { issueInvoiceForOrder } from '../../lib/invoicing/index.js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);
const resend = new Resend(process.env.RESEND_API_KEY);

function checkBasicAuth(req: VercelRequest): boolean {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
}

function generateInvoiceEmail(d: {
  name: string; ticketName: string; invoiceId: string; total: string; isTest: boolean;
}) {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>A tua fatura – RSG Lisbon 2026</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#003F59;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">Regional Scrum Gathering</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;">RSG Lisbon 2026</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#003F59;font-size:22px;">A tua fatura está pronta 🧾</h2>
          <p style="margin:0 0 24px;color:#555;font-size:16px;">Olá, <strong>${d.name}</strong>! Segue em anexo a fatura referente à tua compra.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7fb;border:1px solid #cde3ef;border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:24px;">
              <table width="100%">
                <tr><td style="color:#555;font-size:15px;padding-bottom:8px;">Bilhete</td><td style="color:#003F59;font-size:15px;font-weight:600;text-align:right;padding-bottom:8px;">${d.ticketName}</td></tr>
                <tr><td style="color:#555;font-size:15px;padding-bottom:8px;">Nº do documento</td><td style="color:#003F59;font-size:15px;font-weight:600;text-align:right;padding-bottom:8px;">#${d.invoiceId}</td></tr>
                <tr style="border-top:1px solid #cde3ef;"><td style="color:#003F59;font-size:16px;font-weight:700;padding-top:12px;">Total</td><td style="color:#003F59;font-size:16px;font-weight:700;text-align:right;padding-top:12px;">${d.total} €</td></tr>
              </table>
            </td></tr>
          </table>
          ${d.isTest ? '<p style="color:#e67e22;font-size:13px;background:#fef9f0;border:1px solid #f5c97a;border-radius:6px;padding:12px;">⚠️ Documento gerado em ambiente de testes — sem validade fiscal.</p>' : ''}
          <p style="margin:0;color:#888;font-size:14px;">Se tiveres alguma dúvida, responde a este email.</p>
        </td></tr>
        <tr><td style="background:#f4f6f8;padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0;color:#aaa;font-size:12px;">TugÁgil • RSG Lisbon 2026</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkBasicAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const orderId = String(req.body?.order_id || '').trim();
  const forceTestMode = req.body?.test_mode === true;
  if (!orderId) {
    return res.status(400).json({ message: 'order_id é obrigatório.' });
  }

  // Fetch order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    return res.status(404).json({ message: 'Order não encontrada.' });
  }

  if (order.invoice_id && !forceTestMode) {
    return res.status(409).json({ message: `Fatura já emitida: ${order.invoice_id}` });
  }

  // Get ticket NIF
  const { data: ticket } = await supabase
    .from('tickets')
    .select('attendee_nif')
    .eq('order_id', orderId)
    .maybeSingle();

  const includeRecording = order.include_recording === true;

  const amountEuro = (order.total_amount || 0) / 100;
  const isTest = forceTestMode || (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_');

  console.log('[admin/invoice] invoice input:', {
    orderId,
    isTest,
    forceTestMode,
    customerNif: ticket?.attendee_nif || null,
    includeRecording: order.include_recording,
    amountEuro,
  });

  const invoiceResult = await issueInvoiceForOrder({
    isTest,
    customerName: order.customer_name || 'Participante RSG',
    customerEmail: order.customer_email,
    countryIso: order.customer_country || 'PT',
    customerNif: ticket?.attendee_nif || null,
    ticketName: 'RSG Lisbon 2026',
    includeRecording,
    amountEuro,
  });

  if (!invoiceResult?.invoiceId) {
    const raw = JSON.stringify((invoiceResult as any)?.raw || {});
    return res.status(502).json({ message: `Erro ao gerar fatura: ${raw}` });
  }

  const invoiceLabel = invoiceResult.invoiceNumber || invoiceResult.invoiceId;

  // Save invoice_id and invoice_number
  await supabase
    .from('orders')
    .update({
      invoice_id: invoiceResult.invoiceId,
      invoice_number: invoiceResult.invoiceNumber ?? null,
    })
    .eq('id', orderId);

  // Send PDF email
  if (invoiceResult.pdfBytes) {
    await resend.emails.send({
      from: 'RSG Lisbon 2026 <rsg@rsglisbon.com>',
      to: order.customer_email,
      subject: 'A tua fatura – Regional Scrum Gathering Lisbon 2026',
      html: generateInvoiceEmail({
        name: order.customer_name || 'Participante',
        ticketName: includeRecording
          ? 'Bilhete de acesso ao Regional Scrum Gathering Lisbon 2026, incluindo acesso às gravações das sessões após o evento'
          : 'Bilhete de acesso ao Regional Scrum Gathering Lisbon 2026',
        invoiceId: invoiceLabel,
        total: invoiceResult.total,
        isTest,
      }),
      attachments: [{
        filename: `fatura-${invoiceLabel.replace(/[\s/]/g, '-')}.pdf`,
        content: invoiceResult.pdfBytes.toString('base64'),
      }],
    });
  }

  return res.status(200).json({
    invoiceId: invoiceResult.invoiceId,
    invoiceNumber: invoiceResult.invoiceNumber,
    total: invoiceResult.total,
  });
}

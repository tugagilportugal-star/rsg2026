import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { verifyAdminToken } from '../../lib/admin/auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);
const resend = new Resend(process.env.RESEND_API_KEY);

// ------------------------------------------------------------------
// Email templates
// ------------------------------------------------------------------
function generateTicketEmail(name: string, ticketName: string, qrUrl: string, ticketId: string) {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>🎉 Inscrição confirmada - RSG Lisbon 2026</title></head>
<body style="background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;margin:0;padding:0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f6f9fc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border:1px solid #e6ebf1;border-radius:12px;overflow:hidden;">
        <tr><td align="center" style="background-color:#003F59;padding:32px 40px;">
          <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">Regional Scrum Gathering</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;">RSG Lisbon 2026</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <h2 style="font-size:24px;font-weight:bold;color:#003F59;margin-top:0;">Olá, ${name},</h2>
          <p style="font-size:16px;line-height:26px;color:#3c4858;">O teu lugar no <a href="https://www.rsglisbon.com" style="color:#F47A20;font-weight:bold;text-decoration:none;">Regional Scrum Gathering Lisbon 2026</a> está confirmado. 🥳</p>
          <hr style="border:none;border-top:1px solid #e6ebf1;margin:32px 0;" />
          <div style="text-align:center;background:#f0f7fb;border:2px solid #003F59;border-radius:10px;padding:24px;margin-bottom:32px;">
            <h2 style="font-size:20px;font-weight:bold;color:#003F59;margin:0 0 16px;">🎟️ O Teu Bilhete</h2>
            <p style="margin:0 0 20px;color:#003F59;font-size:18px;font-weight:700;">${ticketName}</p>
            <img src="${qrUrl}" alt="QR Code do Bilhete" width="180" height="180" style="display:block;margin:0 auto 16px;border-radius:8px;" />
            <p style="margin:0 0 4px;color:#888;font-size:12px;">ID do Bilhete</p>
            <p style="margin:0;color:#003F59;font-size:13px;font-family:monospace;word-break:break-all;">${ticketId}</p>
          </div>
          <hr style="border:none;border-top:1px solid #e6ebf1;margin:32px 0;" />
          <div>
            <h2 style="font-size:20px;font-weight:bold;color:#003F59;margin:0 0 16px;">📍 Informações Práticas</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:16px;line-height:26px;color:#3c4858;">
              <tr><td width="80" style="font-weight:bold;padding-bottom:8px;">Data:</td><td style="padding-bottom:8px;">21 de Maio de 2026</td></tr>
              <tr><td width="80" style="font-weight:bold;padding-bottom:8px;">Horário:</td><td style="padding-bottom:8px;">9h00 às 20h00</td></tr>
              <tr><td width="80" style="font-weight:bold;vertical-align:top;">Local:</td><td><strong>Auditório Alto dos Moinhos</strong><br>Rua João de Freitas Branco, 1500-359<br>Lisboa, Portugal</td></tr>
            </table>
          </div>
          <hr style="border:none;border-top:1px solid #e6ebf1;margin:32px 0;" />
          <p style="font-size:15px;line-height:24px;color:#555;text-align:center;margin:0;">
            Dúvidas? Escreve para <a href="mailto:tuga@tugagil.com" style="color:#009FDA;font-weight:bold;text-decoration:none;">tuga@tugagil.com</a>.<br><br>Até breve! 👋🏼
          </p>
        </td></tr>
        <tr><td style="background:#f4f6f8;padding:24px 32px;border-top:1px solid #e6ebf1;text-align:center;">
          <p style="margin:0;color:#8898aa;font-size:12px;line-height:20px;"><strong>TugÁgil • Comunidade de Práticas</strong><br>Organizadora Oficial do RSG Lisbon 2026</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function generateInvoiceEmail(d: { name: string; ticketName: string; invoiceId: string; total: string; isTest: boolean }) {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>A tua fatura – RSG Lisbon 2026</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;border:1px solid #e6ebf1;">
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

// ------------------------------------------------------------------
// Fetch existing invoice PDF from provider
// ------------------------------------------------------------------
async function fetchInvoicePdf(invoiceId: string): Promise<Buffer | null> {
  // Try InvoiceXpress
  const account = process.env.INVOICEXPRESS_ACCOUNT_NAME;
  const apiKey  = process.env.INVOICEXPRESS_API_KEY;

  if (account && apiKey) {
    const endpoint =
      `https://${account}.app.invoicexpress.com/api/pdf/${encodeURIComponent(invoiceId)}.json` +
      `?second_copy=false&api_key=${encodeURIComponent(apiKey)}`;

    for (let attempt = 1; attempt <= 8; attempt++) {
      try {
        const resp = await fetch(endpoint, { headers: { Accept: 'application/json' } });
        const data: any = await resp.json().catch(() => ({}));
        const signedUrl = data?.pdf?.url || data?.url || null;

        if (resp.ok && signedUrl) {
          const pdfResp = await fetch(signedUrl);
          if (pdfResp.ok) return Buffer.from(await pdfResp.arrayBuffer());
          break;
        }
        if (!resp.ok && resp.status !== 202) break;
      } catch { break; }
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Try Bill.pt
  const billToken = (process.env.BILL_API_TOKEN || '').trim();
  const billBase  = (process.env.BILL_BASE_URL || 'https://app.bill.pt').replace(/\/$/, '');

  if (billToken) {
    try {
      const docResp = await fetch(`${billBase}/api/1.0/documentos/${encodeURIComponent(invoiceId)}`, {
        headers: { Authorization: `Bearer ${billToken}`, Accept: 'application/json' },
      });
      if (docResp.ok) {
        const doc: any = await docResp.json();
        const tokenDownload = doc?.token_download || doc?.documento?.token_download || null;
        if (tokenDownload) {
          const pdfResp = await fetch(
            `${billBase}/documentos/download/${encodeURIComponent(invoiceId)}/${encodeURIComponent(tokenDownload)}`
          );
          if (pdfResp.ok) return Buffer.from(await pdfResp.arrayBuffer());
        }
      }
    } catch { /* ignore */ }
  }

  return null;
}

// ------------------------------------------------------------------
// Handler
// ------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await verifyAdminToken(req.headers.authorization || '');
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { order_id, type } = req.body || {};
  if (!order_id || !['ticket', 'invoice'].includes(type)) {
    return res.status(400).json({ message: 'order_id e type (ticket|invoice) são obrigatórios.' });
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (orderErr || !order) return res.status(404).json({ message: 'Order não encontrada.' });

  // ── TICKET ──────────────────────────────────────────────────────
  if (type === 'ticket') {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('order_id', order_id);

    if (!tickets?.length) return res.status(404).json({ message: 'Nenhum bilhete encontrado para esta order.' });

    let ticketName = 'RSG Lisbon 2026';
    if (tickets[0].ticket_type_id) {
      const { data: tt } = await supabase
        .from('ticket_types')
        .select('name')
        .eq('id', tickets[0].ticket_type_id)
        .single();
      if (tt) ticketName = tt.name;
    }

    let sent = 0;
    for (const t of tickets) {
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(t.qr_code_secret)}&dark=003F59&size=300&margin=1`;
      await resend.emails.send({
        from: 'RSG Lisbon 2026 <rsg@rsglisbon.com>',
        to: t.attendee_email || order.customer_email,
        subject: '[Reenvio] O teu bilhete RSG Lisbon 2026 🎟️',
        html: generateTicketEmail(
          t.attendee_name || order.customer_name || 'Participante',
          ticketName,
          qrUrl,
          t.id
        ),
      });
      sent++;
    }

    return res.status(200).json({ message: `${sent} email(s) de bilhete reenviado(s).` });
  }

  // ── INVOICE ─────────────────────────────────────────────────────
  if (type === 'invoice') {
    if (!order.invoice_id) {
      return res.status(400).json({ message: 'Esta order não tem fatura emitida.' });
    }

    const invoiceLabel = order.invoice_number || order.invoice_id;
    const amountEuro   = (order.total_amount || 0) / 100;
    const isTest       = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_');
    const ticketLabel  = order.include_recording
      ? 'Bilhete de acesso ao RSG Lisbon 2026 (com gravações)'
      : 'Bilhete de acesso ao RSG Lisbon 2026';

    const pdfBytes = await fetchInvoicePdf(order.invoice_id);

    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
      from: 'RSG Lisbon 2026 <rsg@rsglisbon.com>',
      to: order.customer_email,
      subject: '[Reenvio] A tua fatura – Regional Scrum Gathering Lisbon 2026',
      html: generateInvoiceEmail({
        name: order.customer_name || 'Participante',
        ticketName: ticketLabel,
        invoiceId: invoiceLabel,
        total: amountEuro.toFixed(2),
        isTest,
      }),
      ...(pdfBytes ? {
        attachments: [{
          filename: `fatura-${invoiceLabel.replace(/[\s/]/g, '-')}.pdf`,
          content: pdfBytes.toString('base64'),
        }],
      } : {}),
    };

    await resend.emails.send(emailPayload);

    return res.status(200).json({
      message: `Email de fatura reenviado para ${order.customer_email}${pdfBytes ? ' (com PDF anexo)' : ' (sem PDF — não foi possível obter o ficheiro do provider)'}`,
      hasPdf: !!pdfBytes,
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { issueInvoiceForOrder } from '../lib/invoicing/index.js';
import type { InvoiceEmailData } from '../lib/invoicing/types.js';
import { notifyAdmins, type StepResult } from '../lib/notify.js';

// ==================================================================
// 1) EMAIL - BILHETE (Com o novo layout e informações)
// ==================================================================
const generateTicketEmail = (
  name: string,
  ticketName: string,
  qrUrl: string,
  ticketId: string
) => `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎉 Inscrição confirmada - RSG Lisbon 2026</title>
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e6ebf1; border-radius: 12px; overflow: hidden;">
                    <!-- Header da Marca -->
                    <tr>
                        <td align="center" style="background-color: #003F59; padding: 32px 40px;">
                            <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">Regional Scrum Gathering</p>
                            <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;">RSG Lisbon 2026</h1>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo Principal -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <h2 style="font-size: 24px; font-weight: bold; color: #003F59; margin-top: 0;">Olá, ${name},</h2>
                            <p style="font-size: 16px; line-height: 26px; color: #3c4858;">
                                O teu lugar no <a href="https://www.rsglisbon.com" style="color: #F47A20; font-weight: bold; text-decoration: none;">Regional Scrum Gathering Lisbon 2026</a> está oficialmente confirmado. 🥳
                            </p>
                            <p style="font-size: 16px; line-height: 26px; color: #3c4858;">
                                Estamos muito felizes por contar contigo neste grande encontro da comunidade ágil em Portugal. O teu bilhete (<strong>${ticketName}</strong>) garante-te acesso a uma experiência única focada em Agilidade, Inovação e Inteligência Artificial.
                            </p>

                            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;" />

                            <!-- Secção do Bilhete -->
                            <div style="text-align: center; background:#f0f7fb; border:2px solid #003F59; border-radius:10px; padding: 24px; margin-bottom: 32px;">
                                <h2 style="font-size: 20px; font-weight: bold; color: #003F59; margin: 0 0 16px;">🎟️ O Teu Bilhete</h2>
                                <p style="margin:0 0 20px;color:#003F59;font-size:18px;font-weight:700;">${ticketName}</p>
                                
                                <!-- QR CODE REAL GERADO PELO SISTEMA -->
                                <img src="${qrUrl}" alt="QR Code do Bilhete" width="180" height="180" style="display:block; margin:0 auto 16px; border-radius:8px;" />
                                
                                <p style="margin:0 0 4px;color:#888;font-size:12px;">ID do Bilhete</p>
                                <p style="margin:0;color:#003F59;font-size:13px;font-family:monospace;word-break:break-all;">${ticketId}</p>
                            </div>
                            
                            <p style="font-size: 15px; line-height: 24px; color: #555; text-align: center;">
                                No dia do evento, apresenta este QR code juntamente com o teu documento de identificação para validar a tua entrada.
                            </p>

                            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;" />

                            <!-- Informações do Evento -->
                            <div>
                                <h2 style="font-size: 20px; font-weight: bold; color: #003F59; margin: 0 0 16px;">📍 Informações Práticas</h2>
                                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 16px; line-height: 26px; color: #3c4858;">
                                    <tr><td width="80" style="font-weight:bold; padding-bottom:8px;">Data:</td><td style="padding-bottom:8px;">21 de Maio de 2026</td></tr>
                                    <tr><td width="80" style="font-weight:bold; padding-bottom:8px;">Horário:</td><td style="padding-bottom:8px;">9h00 às 20h00 <br><span style="font-size:13px; color:#888;">(Recomendamos chegada às 8h30 para credenciação)</span></td></tr>
                                    <tr><td width="80" style="font-weight:bold; vertical-align:top;">Local:</td><td><strong>Auditório Alto dos Moinhos</strong><br>Rua João de Freitas Branco, 1500-359<br>Lisboa, Portugal</td></tr>
                                </table>
                                
                                <p style="font-size: 14px; line-height: 26px; color: #009FDA; font-weight: bold; text-align: center; margin-top: 24px; background: #e6f6fc; padding: 12px; border-radius: 8px;">
                                    🚇 Metro Linha Azul à porta &nbsp;|&nbsp; 🅿️ Estacionamento facilitado
                                </p>
                            </div>

                            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;" />

                            <!-- Adicionar à Agenda & Canva -->
                            <div style="text-align: center;">
                                <h2 style="font-size: 20px; font-weight: bold; color: #003F59; margin: 0 0 16px;">Prepara a tua chegada</h2>
                                
                                <a href="https://evt.to/fcblxmtsb7bm" style="background-color: #003F59; border-radius: 6px; color: #fff; font-size: 15px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 24px; margin: 8px;">
                                    📅 Adicionar ao Calendário
                                </a>
                                
                                <a href="https://www.canva.com/design/DAHDA-8uvms/wn8Qsg2n53rO1_MCgtZK7w/edit" style="background-color: #F47A20; border-radius: 6px; color: #fff; font-size: 15px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 24px; margin: 8px;">
                                    📣 Kit Redes Sociais (Canva)
                                </a>
                            </div>

                            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;" />

                            <p style="font-size: 15px; line-height: 24px; color: #555; text-align: center; margin: 0;">
                                Se tiveres alguma dúvida, basta responderes a este e-mail ou escrever para <a href="mailto:tuga@tugagil.com" style="color: #009FDA; font-weight: bold; text-decoration: none;">tuga@tugagil.com</a>.<br><br>Até breve! 👋🏼
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Rodapé -->
                    <tr>
                        <td style="background:#f4f6f8; padding:24px 32px; border-top:1px solid #e6ebf1; text-align:center;">
                            <p style="margin:0; color:#8898aa; font-size:12px; line-height:20px;">
                                <strong>TugÁgil • Comunidade de Práticas</strong><br>
                                Organizadora Oficial do RSG Lisbon 2026
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
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
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%; border: 1px solid #e6ebf1;">
        <!-- Header -->
        <tr><td style="background:#003F59;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">Regional Scrum Gathering</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:700;">RSG Lisbon 2026</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#003F59;font-size:22px;">A tua fatura está pronta 🧾</h2>
          <p style="margin:0 0 24px;color:#555;font-size:16px;">Olá, <strong>${d.name}</strong>! Segue em anexo o documento PDF com a fatura referente à compra do teu bilhete para o evento no dia 21 de Maio de 2026.</p>

          <!-- Summary card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7fb;border:1px solid #cde3ef;border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 12px;color:#003F59;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Resumo da Transação</p>
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
                  <td style="color:#003F59;font-size:16px;font-weight:700;padding-top:12px;">Total Pago</td>
                  <td style="color:#003F59;font-size:16px;font-weight:700;text-align:right;padding-top:12px;">${d.total} €</td>
                </tr>
              </table>
            </td></tr>
          </table>

          ${d.isTest ? '<p style="margin:0 0 16px;color:#e67e22;font-size:13px;background:#fef9f0;border:1px solid #f5c97a;border-radius:6px;padding:12px;">⚠️ Documento gerado em ambiente de testes — sem validade fiscal.</p>' : ''}

          <p style="margin:0 0 0;color:#888;font-size:14px;">O bilhete com o QR Code de entrada foi enviado num e-mail separado. Se tiveres alguma dúvida, basta responderes a este e-mail.</p>
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

  // Idempotência — buscar TODOS os orders com este stripe_session_id
  const { data: existingOrders } = await supabase
    .from('orders')
    .select('id, invoice_id')
    .eq('stripe_session_id', session.id);

  if (existingOrders && existingOrders.length > 0) {
    // Verificar se algum já tem tickets (processo completo)
    for (const ord of existingOrders) {
      const { count } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', ord.id);

      if (count && count > 0) {
        console.log(`⏭️ Session ${session.id} já processada (order ${ord.id}, ${count} ticket(s)) — a ignorar retry.`);
        // Apagar os outros orders incompletos do mesmo session_id (limpeza)
        const incompleteIds = existingOrders.filter(o => o.id !== ord.id).map(o => o.id);
        if (incompleteIds.length > 0) {
          await supabase.from('orders').delete().in('id', incompleteIds);
          console.log(`🗑️ Apagados ${incompleteIds.length} order(s) incompleto(s) do mesmo session_id.`);
        }
        return res.json({ received: true, skipped: true, orderId: ord.id });
      }
    }

    // Nenhum tem tickets — apagar todos e reprocessar limpo
    const allIds = existingOrders.map(o => o.id);
    console.log(`🔄 Session ${session.id} tem ${allIds.length} order(s) incompleto(s) — a apagar todos e reprocessar.`);
    await supabase.from('orders').delete().in('id', allIds);
  }

  const steps: StepResult[] = [];
  const notifyCtx = {
    sessionId: session.id,
    buyerName: session.customer_details?.name || 'Desconhecido',
    buyerEmail: session.customer_details?.email || '',
    qty: 1,
    totalCents: session.amount_total || 0,
    currency: session.currency || 'eur',
    participants: [] as { name: string; email: string }[],
    isError: false,
    invoice: null as { number: string; email: string; name: string } | null,
  };

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

    // NIF priority: Stripe tax_id > billing_nif from form > attendee_nif (legacy)
    const stripeTaxId = (session.customer_details as any)?.tax_ids?.[0]?.value || null;
    const billingNif = meta.billing_nif || null;
    const resolvedNif = stripeTaxId || billingNif || attendeeNif || null;

    notifyCtx.qty = Number(meta.quantity || 1);

    // Parse multi-participant metadata (new format) or fall back to single-participant (legacy)
    const participantsCount = Number(meta.participants_count || 1);
    const isMulti = !!(meta.participants_count);

    type ParsedParticipant = {
      firstName: string; lastName: string; email: string; country: string;
      company: string; jobFunction: string; jobFunctionOther: string;
      industry: string; tshirt: string; saMarketingConsent: boolean;
    };

    const parsedParticipants: ParsedParticipant[] = [];
    if (isMulti) {
      for (let i = 0; i < participantsCount; i++) {
        try {
          const raw = JSON.parse(meta[`p_${i}`] || '{}');
          parsedParticipants.push({
            firstName: raw.fn || '', lastName: raw.ln || '', email: raw.em || '',
            country: raw.co || '', company: raw.cp || '', jobFunction: raw.jf || '',
            jobFunctionOther: raw.jo || '', industry: raw.iy || '',
            tshirt: raw.ts || '', saMarketingConsent: Boolean(raw.mc),
          });
        } catch {
          console.warn(`⚠️ Failed to parse participant p_${i}`);
        }
      }
    } else {
      // Legacy single-participant format
      parsedParticipants.push({
        firstName: attendeeFirstName || '', lastName: attendeeLastName || '',
        email: session.customer_details?.email || '', country: attendeeCountry || '',
        company: attendeeCompany || '', jobFunction: attendeeJobFunction || '',
        jobFunctionOther: attendeeJobFunctionOther || '',
        industry: '', tshirt: attendeeTshirt || '', saMarketingConsent,
      });
    }

    // Preencher participantes no contexto de notificação
    notifyCtx.participants = parsedParticipants.map(p => ({
      name: `${p.firstName} ${p.lastName}`.trim() || p.email,
      email: p.email,
    }));

    // 1) Salvar Order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        customer_country: customerCountryIso,
        customer_tax_id: resolvedNif,
        total_amount: session.amount_total,
        include_recording: includeRecording,
        status: 'paid',
      })
      .select()
      .single();

    if (orderErr) {
      steps.push({ step: 'Gravar Order (DB)', ok: false, detail: orderErr.message });
      throw new Error(`DB Order Error: ${orderErr.message}`);
    }
    steps.push({ step: 'Gravar Order (DB)', ok: true, detail: `order_id: ${order.id}` });

    // 2) Salvar Tickets (um por participante)
    const tickets: any[] = [];
    for (const p of parsedParticipants) {
      const fullName = `${p.firstName} ${p.lastName}`.trim() || p.email || 'Participante RSG';
      const { data: ticket, error: ticketErr } = await supabase
        .from('tickets')
        .insert({
          order_id: order.id,
          ticket_type_id: ticketTypeId,
          attendee_name: fullName,
          attendee_email: p.email || session.customer_details?.email,
          attendee_company: p.company || null,
          attendee_phone: attendeePhone,
          attendee_first_name: p.firstName || null,
          attendee_last_name: p.lastName || null,
          attendee_country: p.country || null,
          attendee_job_function: p.jobFunction || null,
          attendee_job_function_other: p.jobFunctionOther || null,
          attendee_industry: p.industry || null,
          attendee_nif: resolvedNif,
          attendee_job_title: null,
          attendee_tshirt: p.tshirt || null,
          sa_data_sharing_consent: saDataSharingConsent,
          sa_marketing_consent: p.saMarketingConsent,
          privacy_consent: privacyConsent,
          checked_in: false,
        })
        .select()
        .single();

      if (ticketErr) {
        steps.push({ step: `Gravar Ticket (${fullName})`, ok: false, detail: ticketErr.message });
        throw new Error(`DB Ticket Error: ${ticketErr.message}`);
      }
      steps.push({ step: `Gravar Ticket (${fullName})`, ok: true, detail: `ticket_id: ${ticket.id}` });
      tickets.push(ticket);
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
        steps.push({ step: 'Atualizar contador de bilhetes', ok: false, detail: consumeErr.message });
      } else {
        console.log('🎟️ consume_ticket_type result:', consumeRes);
        steps.push({ step: 'Atualizar contador de bilhetes', ok: true });
      }
    } else {
      console.warn('⚠️ ticket_type_id não encontrado no metadata; não atualizei quantity_sold.');
      steps.push({ step: 'Atualizar contador de bilhetes', ok: false, detail: 'ticket_type_id em falta' });
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

      const { error: couponErr } = couponId
        ? await query.eq('id', couponId)
        : await query.eq('code', couponCode);

      if (couponErr) {
        console.error('⚠️ Coupon deactivate error:', couponErr.message);
        steps.push({ step: `Desativar cupão (${couponCode})`, ok: false, detail: couponErr.message });
      } else {
        console.log(`✅ Cupão ${couponCode} desativado após pagamento confirmado.`);
        steps.push({ step: `Desativar cupão (${couponCode})`, ok: true });
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

    const billingName = meta.billing_name || order.customer_name || attendeeName || 'Participante RSG';
    const billingEmail = meta.billing_email || order.customer_email;

    let invoiceResult: Awaited<ReturnType<typeof issueInvoiceForOrder>>;
    try {
      invoiceResult = await issueInvoiceForOrder({
        isTest,
        customerName: billingName,
        customerEmail: billingEmail,
        countryIso: customerCountryIso,
        customerNif: resolvedNif,
        ticketName,
        includeRecording,
        amountEuro,
        quantity: parsedParticipants.length,
      });
    } catch (e: any) {
      steps.push({ step: 'Emitir fatura', ok: false, detail: e.message });
      invoiceResult = null as any;
    }
    if (invoiceResult?.invoiceId) {
      await supabase
        .from('orders')
        .update({
          invoice_id: invoiceResult.invoiceId,
          invoice_number: invoiceResult.invoiceNumber ?? null,
        })
        .eq('id', order.id);
      steps.push({ step: 'Emitir fatura', ok: true, detail: invoiceResult.invoiceNumber || invoiceResult.invoiceId });
      notifyCtx.invoice = {
        number: invoiceResult.invoiceNumber || invoiceResult.invoiceId,
        email: billingEmail,
        name: billingName,
      };

      if (invoiceResult.pdfBytes) {
        try {
          const sendRes = await sendInvoicePdfByEmailResend({
            to: order.customer_email,
            pdfBytes: invoiceResult.pdfBytes,
            invoiceId: invoiceResult.invoiceNumber || invoiceResult.invoiceId,
            name: order.customer_name || attendeeName || 'Participante',
            ticketName,
            total: invoiceResult.total,
            isTest,
          });
          if ((sendRes as any)?.error) {
            console.error('⚠️ Resend invoice PDF error:', (sendRes as any).error);
            steps.push({ step: 'Email da fatura (PDF)', ok: false, detail: String((sendRes as any).error) });
          } else {
            console.log('📧 Email com PDF da fatura enviado.');
            steps.push({ step: 'Email da fatura (PDF)', ok: true, detail: `→ ${order.customer_email}` });
          }
        } catch (e: any) {
          steps.push({ step: 'Email da fatura (PDF)', ok: false, detail: e.message });
        }
      }
    } else {
      steps.push({ step: 'Emitir fatura', ok: false, detail: 'Sem invoiceId retornado' });
    }

    // 5) Email do bilhete (um por participante)
    for (const t of tickets) {
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(t.qr_code_secret)}&dark=003F59&size=300&margin=1`;
      const recipientEmail = t.attendee_email || (session.customer_details?.email as string);
      const recipientName = t.attendee_name || 'Participante';
      try {
        const emailRes = await resend.emails.send({
          from: 'RSG Lisbon 2026 <rsg@rsglisbon.com>',
          to: recipientEmail,
          subject: 'O teu bilhete RSG Lisbon 2026 🎟️',
          html: generateTicketEmail(recipientName, ticketName, qrUrl, t.id),
        });
        if (emailRes.error) {
          console.error(`⚠️ Resend Error (ticket ${t.id}):`, emailRes.error);
          steps.push({ step: `Email bilhete (${recipientName})`, ok: false, detail: String(emailRes.error) });
        } else {
          console.log(`📧 Email enviado para ${recipientEmail}.`);
          steps.push({ step: `Email bilhete (${recipientName})`, ok: true, detail: `→ ${recipientEmail}` });
        }
      } catch (e: any) {
        steps.push({ step: `Email bilhete (${recipientName})`, ok: false, detail: e.message });
      }
    }

    await notifyAdmins(resend, steps, notifyCtx);
    return res.json({ received: true });
  } catch (err: any) {
    console.error('❌ Critical Error:', err.message);
    notifyCtx.isError = true;
    steps.push({ step: 'Erro crítico', ok: false, detail: err.message });
    await notifyAdmins(resend, steps, notifyCtx);
    return res.status(500).send('Internal Server Error');
  }
}
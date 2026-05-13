import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { issueInvoiceForOrder } from '../../lib/invoicing/index.js';
import { verifyAdminToken, logAction } from '../../lib/admin/auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await verifyAdminToken(req.headers.authorization || '');
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });
  if (admin.role !== 'superadmin') return res.status(403).json({ message: 'Apenas superadmin pode gerar faturas.' });

  // PATCH — update invoice fields before generation (country + NIF only)
  if (req.method === 'PATCH') {
    const orderId = String(req.body?.order_id || '').trim();
    if (!orderId) return res.status(400).json({ message: 'order_id é obrigatório.' });

    const { customer_country, attendee_nif } = req.body;
    const changes: Record<string, unknown> = {};

    if (customer_country !== undefined) {
      const { error } = await supabase
        .from('orders')
        .update({ customer_country: String(customer_country).trim().toUpperCase().slice(0, 2) || null })
        .eq('id', orderId);
      if (error) return res.status(500).json({ message: error.message });
      changes.customer_country = customer_country;
    }

    if (attendee_nif !== undefined) {
      const nif = String(attendee_nif || '').trim();
      const { error } = await supabase
        .from('tickets')
        .update({ attendee_nif: nif || null })
        .eq('order_id', orderId);
      if (error) return res.status(500).json({ message: error.message });
      changes.attendee_nif = nif || null;
    }

    await logAction(admin.email, 'atualizar_dados_fatura', 'order', orderId, changes);
    return res.status(200).json({ ok: true });
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

  if (order.invoice_id && !forceTestMode && !order.credit_note_id) {
    return res.status(409).json({ message: `Fatura já emitida: ${order.invoice_id}` });
  }

  // Apply and persist field overrides from modal (if provided)
  const nifOverride = req.body?.attendee_nif !== undefined
    ? (String(req.body.attendee_nif || '').trim() || null)
    : undefined;
  const countryOverride = req.body?.customer_country !== undefined
    ? (String(req.body.customer_country).trim().toUpperCase().slice(0, 2) || null)
    : undefined;

  if (countryOverride !== undefined) {
    await supabase.from('orders').update({ customer_country: countryOverride }).eq('id', orderId);
  }
  if (nifOverride !== undefined) {
    await supabase.from('tickets').update({ attendee_nif: nifOverride }).eq('order_id', orderId);
  }

  // Get ticket NIF — use override directly if provided, else read from DB
  let customerNif: string | null = null;
  if (nifOverride !== undefined) {
    customerNif = nifOverride;
  } else {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('attendee_nif')
      .eq('order_id', orderId)
      .maybeSingle();
    customerNif = ticket?.attendee_nif || null;
  }

  const includeRecording = order.include_recording === true;

  const amountEuro = (order.total_amount || 0) / 100;
  const isTest = forceTestMode || (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_');
  const countryIso = countryOverride !== undefined ? (countryOverride || 'PT') : (order.customer_country || 'PT');

  const invoiceResult = await issueInvoiceForOrder({
    isTest,
    autoFinalize: !isTest,
    customerName: order.customer_name || 'Participante RSG',
    customerEmail: order.customer_email,
    countryIso,
    customerNif,
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
  // If replacing after a credit note, preserve original invoice reference
  const invoiceUpdate: Record<string, unknown> = {
    invoice_id: invoiceResult.invoiceId,
    invoice_number: invoiceResult.invoiceNumber ?? null,
  };
  if (order.invoice_id && order.credit_note_id) {
    invoiceUpdate.original_invoice_id = order.invoice_id;
    invoiceUpdate.original_invoice_number = order.invoice_number ?? order.invoice_id;
  }
  const { error: saveError } = await supabase.from('orders').update(invoiceUpdate).eq('id', orderId);
  if (saveError) {
    console.error('❌ Falha ao guardar invoice_id na DB:', saveError);
    return res.status(500).json({ message: `Fatura criada mas falhou a guardar na DB: ${saveError.message}` });
  }

  await logAction(admin.email, 'gerar_fatura', 'order', orderId, { invoice_number: invoiceResult.invoiceNumber, invoice_id: invoiceResult.invoiceId, is_test: isTest });

  return res.status(200).json({
    invoiceId: invoiceResult.invoiceId,
    invoiceNumber: invoiceResult.invoiceNumber,
    total: invoiceResult.total,
  });
}

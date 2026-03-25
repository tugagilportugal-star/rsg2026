import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken, logAction } from '../../lib/admin/auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function safeReadJson(resp: Response): Promise<any> {
  const text = await resp.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}


function withApiToken(url: string, apiToken: string): string {
  const u = new URL(url);
  u.searchParams.set('api_token', apiToken);
  return u.toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await verifyAdminToken(req.headers.authorization || '');
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });
  if (admin.role !== 'superadmin') return res.status(403).json({ message: 'Apenas superadmin pode emitir notas de crédito.' });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const orderId = String(req.body?.order_id || '').trim();
  const motivo = String(req.body?.motivo || '').trim();

  if (!orderId) return res.status(400).json({ message: 'order_id é obrigatório.' });
  if (!motivo) return res.status(400).json({ message: 'motivo é obrigatório.' });
  if (motivo.length > 500) return res.status(400).json({ message: 'motivo demasiado longo (máx. 500 caracteres).' });

  // Fetch order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return res.status(404).json({ message: 'Order não encontrada.' });
  if (!order.invoice_id) return res.status(409).json({ message: 'Esta order não tem fatura emitida.' });
  if (order.credit_note_id) return res.status(409).json({ message: `Nota de crédito já emitida: ${order.credit_note_number || order.credit_note_id}` });

  const apiToken = (process.env.BILL_API_TOKEN || '').trim();
  if (!apiToken) return res.status(500).json({ message: 'BILL_API_TOKEN não configurado.' });

  const isProd = (process.env.VERCEL_ENV || '').toLowerCase() === 'production';
  const baseUrl = isProd ? 'https://app.bill.pt' : 'https://dev.bill.pt';
  const isTest = !isProd;

  // 1) Fetch original invoice from bill.pt to get lancamento_pai_id
  const getUrl = withApiToken(`${baseUrl}/api/1.0/documentos/${encodeURIComponent(order.invoice_id)}`, apiToken);
  const getResp = await fetch(getUrl, { headers: { Accept: 'application/json' } });
  const originalDoc = await safeReadJson(getResp);

  if (!getResp.ok) {
    console.error('❌ bill.pt get original doc error:', JSON.stringify(originalDoc));
    return res.status(502).json({ message: 'Não foi possível obter a fatura original no bill.pt.' });
  }

  const lancamentos: any[] = originalDoc?.lancamentos || [];
  if (lancamentos.length === 0) {
    return res.status(502).json({ message: 'Fatura original sem linhas — não é possível criar nota de crédito.' });
  }

  const taxPercent = Number(process.env.BILL_TAX_PERCENT ?? 0);
  const isencao = (process.env.BILL_ISENCAO || '').trim().toUpperCase();

  // 2) Build credit note produtos from original lancamentos
  const produtos = lancamentos.map((l: any) => {
    const produto: Record<string, unknown> = {
      lancamento_pai_id: l.id,
      nome: l.nome || l.descricao || 'Bilhete RSG Lisbon 2026',
      quantidade: Number(l.quantidade) || 1,
      preco_unitario: Number(l.preco_unitario) || 0,
      imposto: taxPercent,
    };
    if (taxPercent === 0 && isencao) produto.isencao = isencao;
    return produto;
  });

  // 3) Build contact from original doc
  const contato: Record<string, unknown> = {
    nome: originalDoc?.contato?.nome || order.customer_name || 'Participante RSG',
    email: order.customer_email,
    pais: order.customer_country || 'PT',
  };
  if (originalDoc?.contato?.nif) contato.nif = originalDoc.contato.nif;

  const body = {
    tipificacao: 'NC',
    contato,
    produtos,
    observacoes: motivo,
    lingua: 'pt',
    terminado: 1,
  };

  // 4) Create credit note
  const createUrl = withApiToken(`${baseUrl}/api/1.0/documentos`, apiToken);
  const createResp = await fetch(createUrl, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const createData = await safeReadJson(createResp);

  if (!createResp.ok) {
    console.error('❌ bill.pt credit note error:', JSON.stringify(createData));
    return res.status(502).json({ message: `Erro ao criar nota de crédito: ${JSON.stringify(createData)}` });
  }

  const creditNoteId = createData?.id != null ? String(createData.id) : null;
  if (!creditNoteId) return res.status(502).json({ message: 'Nota de crédito criada mas sem ID na resposta.' });

  // 5) Fetch credit note to get invoice_number
  const getNCUrl = withApiToken(`${baseUrl}/api/1.0/documentos/${encodeURIComponent(creditNoteId)}`, apiToken);
  const getNCResp = await fetch(getNCUrl, { headers: { Accept: 'application/json' } });
  const ncDoc = await safeReadJson(getNCResp);
  const creditNoteNumber: string | null = ncDoc?.invoice_number ? String(ncDoc.invoice_number) : null;

  console.log('[credit-note] created:', { creditNoteId, creditNoteNumber, isTest });

  // 6) Save to orders
  await supabase
    .from('orders')
    .update({
      credit_note_id: creditNoteId,
      credit_note_number: creditNoteNumber,
      credit_note_motivo: motivo,
    })
    .eq('id', orderId);

  await logAction(admin.email, 'emitir_nc', 'order', orderId, { motivo, nc_number: creditNoteNumber, nc_id: creditNoteId });

  return res.status(200).json({
    creditNoteId,
    creditNoteNumber,
  });
}

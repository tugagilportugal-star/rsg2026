import type { CreateInvoiceInput, CreateInvoiceResult } from './types.js';

// ==================================================================
// BILL.PT (DEV/PROD) – Adapter
// ==================================================================
// Variáveis usadas (já existentes no Vercel):
// - BILL_API_TOKEN
// - BILLING_AUTO_FINALIZE
//
// Base URL automático:
// - Preview/Development  -> https://dev.bill.pt
// - Production           -> https://app.bill.pt
//
// Objetivo:
// - Criar documento no Bill.pt
// - Obter token_download (para PDF)
// - Fazer download do PDF
// - Devolver pdfBytes para o webhook enviar via Resend
// ==================================================================

async function safeReadJson(resp: Response): Promise<any> {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function isProdEnv(): boolean {
  return (process.env.VERCEL_ENV || '').toLowerCase() === 'production';
}

function getBillBaseUrl(): string {
  return isProdEnv() ? 'https://app.bill.pt' : 'https://dev.bill.pt';
}

function withApiToken(url: string, apiToken: string): string {
  const u = new URL(url);
  u.searchParams.set('api_token', apiToken);
  return u.toString();
}

function normalizeIso(iso?: string): string {
  const cc = (iso || 'PT').toUpperCase().trim();
  return cc || 'PT';
}

function money(n: number): number {
  return Number(n.toFixed(2));
}

// ==================================================================
// ENDPOINTS (ajustar apenas aqui se necessário)
// ==================================================================
function endpoints(baseUrl: string) {
  return {
    createDocument: `${baseUrl}/api/1.0/documentos`,
    getDocument: (id: string) => `${baseUrl}/api/1.0/documentos/${encodeURIComponent(id)}`,
    finalizeDocument: (id: string) => `${baseUrl}/api/1.0/documentos/${encodeURIComponent(id)}/emitir`,
    downloadPdf: (id: string, token: string) =>
      `${baseUrl}/documentos/download/${encodeURIComponent(id)}/${encodeURIComponent(token)}`,
  };
}

// ==================================================================
// Bill.pt calls
// ==================================================================
async function billCreateDocument(params: {
  baseUrl: string;
  apiToken: string;
  customerName: string;
  customerEmail: string;
  countryIso: string;
  customerNif?: string | null;
  includeRecording?: boolean;
  ticketName: string;
  amountEuro: number;
}) {
  const ep = endpoints(params.baseUrl);

  const tipificacao = (process.env.BILL_DOC_TIPIFICACAO || 'FT').trim().toUpperCase();
  const taxPercent = Number(process.env.BILL_TAX_PERCENT ?? 0);
  const isencao = (process.env.BILL_ISENCAO || '').trim().toUpperCase();

  const descricao = params.includeRecording
    ? 'Bilhete de acesso ao Regional Scrum Gathering Lisbon 2026, incluindo acesso às gravações das sessões após o evento'
    : 'Bilhete de acesso ao Regional Scrum Gathering Lisbon 2026';

  const produto: Record<string, unknown> = {
    nome: descricao,
    quantidade: 1,
    preco_unitario: money(params.amountEuro),
    imposto: taxPercent,
  };
  if (taxPercent === 0 && isencao) {
    produto.isencao = isencao;
  }

  const contato: Record<string, unknown> = {
    nome: params.customerName || 'Participante RSG',
    email: params.customerEmail,
    pais: params.countryIso,
  };
  if (params.customerNif) {
    contato.nif = params.customerNif;
  }

  const body = {
    tipificacao,
    contato,
    produtos: [produto],
    lingua: 'pt',
    // ✅ enviar como inteiro (mais compatível que boolean)
    terminado: 1,
  };

  console.log('🧾 Bill.pt: criando documento...', {
    env: isProdEnv() ? 'prod' : 'dev',
    baseUrl: params.baseUrl,
    amountEuro: params.amountEuro,
  });

  // ✅ LOG DO PAYLOAD (NO LUGAR CERTO)
  console.log('🔎 DEBUG Bill.pt payload:', JSON.stringify(body));

  const resp = await fetch(withApiToken(ep.createDocument, params.apiToken), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await safeReadJson(resp);
  console.log('🔎 DEBUG Bill.pt create:', { ok: resp.ok, status: resp.status, statusText: resp.statusText });

  if (!resp.ok) {
    console.error('❌ Bill.pt Error (create):', JSON.stringify(data));
    return { id: null as string | null, raw: data };
  }

  const id =
    (data?.id != null ? String(data.id) : null) ||
    (data?.documento?.id != null ? String(data.documento.id) : null) ||
    (data?.data?.id != null ? String(data.data.id) : null) ||
    null;

  console.log('✅ Bill.pt: documento criado', { id });

  return { id, raw: data };
}

async function billGetDocument(params: { baseUrl: string; apiToken: string; id: string }) {
  const ep = endpoints(params.baseUrl);

  const resp = await fetch(withApiToken(ep.getDocument(params.id), params.apiToken), {
    headers: { Accept: 'application/json' },
  });

  const data = await safeReadJson(resp);
  console.log('🔎 DEBUG Bill.pt get:', { ok: resp.ok, status: resp.status, statusText: resp.statusText });

  if (!resp.ok) {
    console.error('❌ Bill.pt Error (get):', JSON.stringify(data));
    return null;
  }

  return data;
}

function extractInvoiceNumber(doc: any): string | null {
  const n = doc?.invoice_number ?? doc?.invoiceNumber ?? doc?.documento?.invoice_number ?? null;
  return n ? String(n) : null;
}

function extractTokenDownload(doc: any): string | null {
  const token = doc?.token_download ?? doc?.tokenDownload ?? doc?.documento?.token_download ?? null;
  return token ? String(token) : null;
}

function extractStatus(doc: any): string {
  const s = doc?.estado ?? doc?.status ?? doc?.documento?.estado ?? 'unknown';
  return String(s);
}

function extractTotalEuro(doc: any, fallback: number): number {
  const candidates = [
    doc?.gross_total,
    doc?.grossTotal,
    doc?.total,
    doc?.documento?.gross_total,
    doc?.documento?.total,
  ];
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c;
    if (typeof c === 'string' && c.trim() !== '' && !Number.isNaN(Number(c))) return Number(c);
  }
  return fallback;
}

async function billFinalizeDocument(params: { baseUrl: string; apiToken: string; id: string }): Promise<boolean> {
  const ep = endpoints(params.baseUrl);

  const resp = await fetch(withApiToken(ep.finalizeDocument(params.id), params.apiToken), {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

  const data = await safeReadJson(resp);
  console.log('🔎 DEBUG Bill.pt finalize:', { ok: resp.ok, status: resp.status, statusText: resp.statusText });

  if (!resp.ok) {
    console.error('❌ Bill.pt Error (finalize):', JSON.stringify(data));
    return false;
  }

  console.log('✅ Bill.pt: documento emitido/finalizado', { id: params.id });
  return true;
}

async function billDownloadPdf(params: { baseUrl: string; id: string; tokenDownload: string }): Promise<Buffer | null> {
  const ep = endpoints(params.baseUrl);
  const url = ep.downloadPdf(params.id, params.tokenDownload);

  const resp = await fetch(url);
  if (!resp.ok) {
    console.error('❌ Bill.pt PDF download error:', { status: resp.status, statusText: resp.statusText, url });
    return null;
  }

  return Buffer.from(await resp.arrayBuffer());
}

// ==================================================================
// PUBLIC EXPORT
// ==================================================================
export async function createInvoiceWithBillpt(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const apiToken = (process.env.BILL_API_TOKEN || '').trim();
  if (!apiToken) {
    console.error('⚠️ Bill.pt: BILL_API_TOKEN não configurado.');
    return { provider: 'billpt', invoiceId: null, status: null, pdfBytes: null, totalEuro: null };
  }

  const baseUrl = getBillBaseUrl();
  const countryIso = normalizeIso(input.countryIso);

  const created = await billCreateDocument({
    baseUrl,
    apiToken,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    countryIso,
    customerNif: input.customerNif,
    includeRecording: input.includeRecording,
    ticketName: input.ticketName,
    amountEuro: input.amountEuro,
  });

  if (!created.id) {
    return {
      provider: 'billpt',
      invoiceId: null,
      status: null,
      permalink: null,
      pdfBytes: null,
      totalEuro: null,
      raw: created.raw,
    };
  }

  const invoiceId = created.id;

  if (!input.isTest && input.autoFinalize) {
    await billFinalizeDocument({ baseUrl, apiToken, id: invoiceId });
  }

  const doc = await billGetDocument({ baseUrl, apiToken, id: invoiceId });

  const tokenDownload = extractTokenDownload(doc);
  const status = extractStatus(doc);
  const totalEuro = extractTotalEuro(doc, input.amountEuro);
  const invoiceNumber = extractInvoiceNumber(doc);

  let pdfBytes: Buffer | null = null;

  if (tokenDownload) {
    pdfBytes = await billDownloadPdf({ baseUrl, id: invoiceId, tokenDownload });
    if (!pdfBytes) console.warn('⚠️ Bill.pt: não consegui baixar o PDF.');
  } else {
    console.warn('⚠️ Bill.pt: token_download não encontrado no documento. Não foi possível baixar PDF.');
  }

  const permalink = doc?.permalink || doc?.documento?.permalink || null;

  return {
    provider: 'billpt',
    invoiceId,
    invoiceNumber,
    status,
    permalink,
    pdfBytes,
    totalEuro,
    raw: { created: created.raw, document: doc },
  };
}

import type { CreateInvoiceInput, CreateInvoiceResult } from './types.js';

// ==================================================================
// BILL.PT (DEV/PROD) – Adapter
// ==================================================================
// Este adapter usa SOMENTE as variáveis que já tens no Vercel:
// - BILL_API_TOKEN
// - BILLING_AUTO_FINALIZE
//
// Base URL é definido automaticamente:
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
  // Vercel define VERCEL_ENV = "production" | "preview" | "development"
  return (process.env.VERCEL_ENV || '').toLowerCase() === 'production';
}

function getBillBaseUrl(): string {
  return isProdEnv() ? 'https://app.bill.pt' : 'https://dev.bill.pt';
}

function withApiToken(url: string, apiToken: string): string {
  // Bill.pt costuma aceitar api_token na query. Se for header, ajustamos depois.
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
// ENDPOINTS (centralizados para ajustar rápido, se necessário)
// ==================================================================
// ⚠️ Se o Bill.pt usar paths diferentes, ajusta apenas aqui.
function endpoints(baseUrl: string) {
  return {
    // criar documento
    createDocument: `${baseUrl}/api/1.0/documentos`,
    // obter detalhes (para token_download)
    getDocument: (id: string) => `${baseUrl}/api/1.0/documentos/${encodeURIComponent(id)}`,
    // finalizar/emitar (se existir no teu Bill.pt)
    // se o teu Bill.pt usa outro endpoint/evento, ajustamos aqui
    finalizeDocument: (id: string) => `${baseUrl}/api/1.0/documentos/${encodeURIComponent(id)}/emitir`,
    // download PDF por token_download
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
  ticketName: string;
  amountEuro: number;
}) {
  const ep = endpoints(params.baseUrl);

  // Payload "mínimo" típico:
  // - tipificacao: tipo de documento (ex: FT/FR/etc.)
  // - contato: dados do cliente
  // - produtos: linhas
  //
  // Se no teu Bill.pt os nomes forem ligeiramente diferentes, ajustamos.
  const body = {
    tipificacao: 'FT',
    contato: {
      nome: params.customerName || 'Participante RSG',
      email: params.customerEmail,
      pais: params.countryIso,
    },
    produtos: [
      {
        nome: params.ticketName,
        quantidade: 1,
        preco_unitario: money(params.amountEuro),
        imposto: 23,
      },
    ],
    lingua: 'pt',
  };

  console.log('🧾 Bill.pt: criando documento...', {
    env: isProdEnv() ? 'prod' : 'dev',
    baseUrl: params.baseUrl,
    amountEuro: params.amountEuro,
  });

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

  // tenta achar id em formatos comuns
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
// PUBLIC EXPORT (usado pelo lib/invoicing/index.ts)
// ==================================================================
export async function createInvoiceWithBillpt(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const apiToken = (process.env.BILL_API_TOKEN || '').trim();
  if (!apiToken) {
    console.error('⚠️ Bill.pt: BILL_API_TOKEN não configurado.');
    return { provider: 'billpt', invoiceId: null, status: null, pdfBytes: null, totalEuro: null };
  }

  const baseUrl = getBillBaseUrl();
  const countryIso = normalizeIso(input.countryIso);

  // 1) criar documento
  const created = await billCreateDocument({
    baseUrl,
    apiToken,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    countryIso,
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

  // 2) opcional: finalizar (produção normalmente; em dev pode ser opcional)
  if (!input.isTest && input.autoFinalize) {
    await billFinalizeDocument({ baseUrl, apiToken, id: invoiceId });
  }

  // 3) obter token_download e baixar PDF
  // Para testes end-to-end, queremos sempre tentar PDF
  const doc = await billGetDocument({ baseUrl, apiToken, id: invoiceId });

  const tokenDownload = extractTokenDownload(doc);
  const status = extractStatus(doc);
  const totalEuro = extractTotalEuro(doc, input.amountEuro);

  let pdfBytes: Buffer | null = null;

  if (tokenDownload) {
    pdfBytes = await billDownloadPdf({ baseUrl, id: invoiceId, tokenDownload });
    if (!pdfBytes) console.warn('⚠️ Bill.pt: não consegui baixar o PDF.');
  } else {
    console.warn('⚠️ Bill.pt: token_download não encontrado no documento. Não foi possível baixar PDF.');
  }

  // permalink: se vier no payload, ótimo; senão podemos deixar null
  const permalink =
    doc?.permalink ||
    doc?.documento?.permalink ||
    null;

  return {
    provider: 'billpt',
    invoiceId,
    status,
    permalink,
    pdfBytes,
    totalEuro,
    raw: { created: created.raw, document: doc },
  };
}

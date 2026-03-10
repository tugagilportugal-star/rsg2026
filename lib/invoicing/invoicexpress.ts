import type { CreateInvoiceInput, CreateInvoiceResult } from './types.js';

// ------------------------------------------------------------
// InvoiceXpress Adapter
// - Cria invoice
// - Em TEST (Stripe test), obtém URL assinada do PDF e devolve pdfBytes
// - Em produção pode finalizar (autoFinalize) se desejado
// ------------------------------------------------------------

function isoCountryToInvoiceXpressCountryName(iso?: string): string {
  const cc = (iso || '').toUpperCase().trim();
  const map: Record<string, string> = {
    PT: 'Portugal',
    ES: 'Spain',
    FR: 'France',
    DE: 'Germany',
    IT: 'Italy',
    NL: 'Netherlands',
    BE: 'Belgium',
    LU: 'Luxembourg',
    GB: 'United Kingdom',
    IE: 'Ireland',
    US: 'United States',
    BR: 'Brazil',
  };
  return map[cc] || 'Portugal';
}

async function safeReadJson(resp: Response): Promise<any> {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

type InvoiceXpressCreateResultInternal = {
  invoiceId: string | null;
  status: string | null;
  permalink: string | null;
  totalEuro: number | null;
  raw?: any;
};

async function createInvoiceXpressInvoiceInternal(params: {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  ticketName: string;
  amountEuro: number;
  taxName?: string;
}): Promise<InvoiceXpressCreateResultInternal> {
  const account = process.env.INVOICEXPRESS_ACCOUNT_NAME;
  const apiKey = process.env.INVOICEXPRESS_API_KEY;

  if (!account || !apiKey) {
    console.error('⚠️ InvoiceXpress: INVOICEXPRESS_ACCOUNT_NAME ou INVOICEXPRESS_API_KEY não configurados.');
    return { invoiceId: null, status: null, permalink: null, totalEuro: null };
  }

  const url = `https://${account}.app.invoicexpress.com/invoices.json?api_key=${encodeURIComponent(apiKey)}`;

  const countryName = isoCountryToInvoiceXpressCountryName(params.countryIso);
  const taxName = params.taxName || process.env.INVOICEXPRESS_TAX_NAME || 'IVA23';

  const body = {
    invoice: {
      date: new Date().toLocaleDateString('pt-PT'),
      due_date: new Date().toLocaleDateString('pt-PT'),
      client: {
        name: params.customerName || 'Participante RSG',
        email: params.customerEmail,
        country: countryName,
      },
      items: [
        {
          name: params.ticketName,
          description: 'Compra online (Stripe)',
          unit_price: params.amountEuro.toFixed(2),
          quantity: '1',
          tax: { name: taxName },
        },
      ],
    },
  };

  console.log('🧾 InvoiceXpress: criando invoice...', {
    account,
    countryName,
    taxName,
    amountEuro: params.amountEuro,
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await safeReadJson(resp);
  console.log('🔎 DEBUG InvoiceXpress response:', { ok: resp.ok, status: resp.status, statusText: resp.statusText });

  if (!resp.ok) {
    console.error('❌ InvoiceXpress Error:', JSON.stringify(data));
    return { invoiceId: null, status: null, permalink: null, totalEuro: null, raw: data };
  }

  const invoiceId = data?.invoice?.id != null ? String(data.invoice.id) : null;
  const status = data?.invoice?.status ?? null;
  const permalink = data?.invoice?.permalink ?? null;

  // total pode vir como número
  const totalEuro =
    typeof data?.invoice?.total === 'number'
      ? data.invoice.total
      : typeof data?.invoice?.sum === 'number'
      ? data.invoice.sum
      : null;

  console.log('✅ InvoiceXpress: invoice criada', { invoiceId, status });

  return { invoiceId, status, permalink, totalEuro, raw: data };
}

async function finalizeInvoiceXpressInvoice(invoiceId: string): Promise<boolean> {
  const account = process.env.INVOICEXPRESS_ACCOUNT_NAME;
  const apiKey = process.env.INVOICEXPRESS_API_KEY;
  if (!account || !apiKey) return false;

  const url =
    `https://${account}.app.invoicexpress.com/invoices/${encodeURIComponent(invoiceId)}/change-state.json` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const resp = await fetch(url, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'finalized' }),
  });

  const data = await safeReadJson(resp);
  console.log('🔎 DEBUG InvoiceXpress finalize:', { ok: resp.ok, status: resp.status, statusText: resp.statusText });

  if (!resp.ok) {
    console.error('❌ InvoiceXpress finalize error:', JSON.stringify(data));
    return false;
  }

  console.log('✅ InvoiceXpress: invoice finalizada', { invoiceId });
  return true;
}

// ------------------------------------------------------------------
// INVOICEXPRESS – OBTENÇÃO DE PDF (URL ASSINADA) via /api/pdf/:id
// ------------------------------------------------------------------
async function getInvoiceXpressSignedPdfUrl(documentId: string): Promise<string | null> {
  const account = process.env.INVOICEXPRESS_ACCOUNT_NAME;
  const apiKey = process.env.INVOICEXPRESS_API_KEY;
  if (!account || !apiKey) return null;

  const endpoint =
    `https://${account}.app.invoicexpress.com/api/pdf/${encodeURIComponent(documentId)}.json` +
    `?second_copy=false&api_key=${encodeURIComponent(apiKey)}`;

  for (let attempt = 1; attempt <= 12; attempt++) {
    const resp = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    const data = await safeReadJson(resp);

    const fromPdf = data?.pdf?.url || data?.url || null;

    let fromOutput: string | null = null;
    const output = data?.output;

    if (typeof output === 'string') {
      if (output.startsWith('http')) {
        fromOutput = output;
      } else {
        try {
          const parsed = JSON.parse(output);
          fromOutput = parsed?.pdfUrl || parsed?.pdf?.url || parsed?.url || parsed?.output || null;
        } catch {
          // ignore
        }
      }
    }

    if (!fromOutput && output && typeof output === 'object') {
      fromOutput = (output as any)?.pdfUrl || (output as any)?.pdf?.url || (output as any)?.url || null;
    }

    const signedUrl = fromPdf || fromOutput;

    console.log('🔎 DEBUG InvoiceXpress generate-pdf:', {
      attempt,
      status: resp.status,
      ok: resp.ok,
      signedUrlFound: !!signedUrl,
    });

    if (resp.ok && signedUrl) return signedUrl;

    if (!resp.ok && resp.status !== 202) {
      console.error('❌ InvoiceXpress generate-pdf error:', JSON.stringify(data));
      return null;
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  return null;
}

async function downloadPdfFromUrl(url: string): Promise<Buffer | null> {
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error('❌ PDF download error:', { status: resp.status, statusText: resp.statusText });
    return null;
  }
  return Buffer.from(await resp.arrayBuffer());
}

// ==================================================================
// PUBLIC EXPORT (o teu index.ts chama isto)
// ==================================================================
export async function createInvoiceWithInvoiceXpress(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const internal = await createInvoiceXpressInvoiceInternal({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    countryIso: input.countryIso,
    ticketName: input.ticketName,
    amountEuro: input.amountEuro,
    taxName: process.env.INVOICEXPRESS_TAX_NAME || 'IVA23',
  });

  if (!internal.invoiceId) {
    return {
      provider: 'invoicexpress',
      invoiceId: null,
      status: null,
      permalink: null,
      pdfBytes: null,
      totalEuro: null,
      raw: internal.raw,
    };
  }

  // produção: finaliza se autoFinalize=true
  if (!input.isTest && input.autoFinalize) {
    await finalizeInvoiceXpressInvoice(internal.invoiceId);
  }

  // teste: baixar PDF assinado e devolver bytes
  let pdfBytes: Buffer | null = null;

  if (input.isTest) {
    const signedUrl = await getInvoiceXpressSignedPdfUrl(internal.invoiceId);
    if (!signedUrl) {
      console.warn('⚠️ InvoiceXpress: não consegui obter URL assinada do PDF.');
    } else {
      pdfBytes = await downloadPdfFromUrl(signedUrl);
      if (!pdfBytes) console.warn('⚠️ InvoiceXpress: falha ao baixar PDF.');
    }
  }

  return {
    provider: 'invoicexpress',
    invoiceId: internal.invoiceId,
    status: internal.status,
    permalink: internal.permalink,
    pdfBytes,
    totalEuro: internal.totalEuro,
    raw: internal.raw,
  };
}

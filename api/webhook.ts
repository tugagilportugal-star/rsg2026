import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ==================================================================
// 0. HELPERS
// ==================================================================
function stripeIsTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key.startsWith('sk_test_');
}

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

async function downloadInvoiceXpressDraftPdf(params: {
  invoiceId: string;
  accountId: string; // ex: 165325
  locale?: string; // ex: 'pt'
}): Promise<Buffer | null> {
  const { invoiceId, accountId, locale = 'pt' } = params;

  const url =
    `https://invoicexpress-documents-pdfs.s3.eu-west-1.amazonaws.com/production/` +
    `${accountId}/${invoiceId}/` +
    `production-${accountId}-Invoice-${invoiceId}-false-draft-${locale}-1.pdf`;

  const resp = await fetch(url);
  if (!resp.ok) {
    console.error('❌ InvoiceXpress S3 PDF download error:', {
      status: resp.status,
      statusText: resp.statusText,
      url,
    });
    return null;
  }

  const arr = await resp.arrayBuffer();
  return Buffer.from(arr);
}

// ==================================================================
// 1. TEMPLATE DE EMAIL
// ==================================================================
const generateTicketEmail = (name: string, ticketName: string, qrUrl: string, ticketId: string) => `
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; background: #f4f4f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h1 style="color: #003F59; font-size: 24px; margin-bottom: 10px;">Olá, ${name}!</h1>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">O teu lugar no <strong>Regional Scrum Gathering Lisbon 2026</strong> está garantido.</p>
      
      <div style="border: 2px dashed #e5e7eb; padding: 20px; border-radius: 8px; margin: 30px 0; background: #fafafa;">
        <p style="font-weight: bold; color: #003F59; margin: 0; font-size: 18px;">${ticketName}</p>
        <p style="color: #888; font-size: 12px; margin: 5px 0 15px 0;">ID: ${ticketId}</p>
        
        <img src="${qrUrl}" alt="QR Code" width="200" height="200" style="display:block; margin: 0 auto;" />
        
        <p style="font-size: 12px; color: #666; margin-top: 15px;">
          Apresenta este código na entrada do evento.
        </p>
      </div>

      <p style="color: #666; font-size: 14px;">
        Estamos ansiosos para te ver em Lisboa!
        <br/>A tua fatura foi emitida e enviada num e-mail separado.
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="color: #999; font-size: 12px; margin: 0;">Enviado por TugÁgil • RSG Lisbon 2026</p>
      </div>
    </div>
  </body>
</html>
`;

// ==================================================================
// TEMPLATE EMAIL – FATURA (TESTE / DRAFT)
// ==================================================================
const generateInvoiceEmail = (name: string, ticketName: string, invoiceId: string, total: string) => `
<!DOCTYPE html>
<html lang="pt-PT">
  <body style="margin:0; padding:0; background:#f4f4f5; font-family: Arial, Helvetica, sans-serif;">
    <div style="padding:24px;">
      <div style="max-width:640px; margin:0 auto;">
        
        <div style="font-weight:700; font-size:18px; color:#003F59;">
          Regional Scrum Gathering Lisbon 2026
        </div>

        <div style="background:#ffffff; border-radius:14px; margin-top:16px; overflow:hidden;">
          <div style="background:#003F59; padding:18px; color:#ffffff;">
            <strong>A tua fatura está pronta 🧾</strong>
          </div>

          <div style="padding:22px; font-size:14px; color:#374151;">
            <p>Olá, <strong>${name}</strong>,</p>

            <p>
              Segue em anexo a fatura referente à tua compra do bilhete para o
              <strong>Regional Scrum Gathering Lisbon 2026</strong>.
            </p>

            <div style="background:#fafafa; border-radius:10px; padding:14px; margin:16px 0;">
              <p><strong>Resumo</strong></p>
              <p>Bilhete: ${ticketName}</p>
              <p>Nº do documento: #${invoiceId}</p>
              <p>Total: ${total} €</p>
            </div>

            <div style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px; border-radius:8px; font-size:12px;">
              <strong>Nota:</strong> Este documento foi gerado em ambiente de testes e
              não tem validade fiscal.
            </div>

            <p style="margin-top:16px;">
              Se tiveres alguma dúvida, responde a este email.
            </p>

            <p style="font-size:12px; color:#6b7280; margin-top:24px;">
              TugÁgil • RSG Lisbon 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;

// precisa estar abaixo de `resend`, então deixamos como function (hoisted) mas usa `resend` global
async function sendInvoicePdfByEmailResend(
  to: string,
  pdfBytes: Buffer,
  invoiceId: string,
  name: string,
  ticketName: string,
  total: string
) {
  return resend.emails.send({
    from: 'RSG Lisbon <onboarding@resend.dev>',
    to,
    subject: 'A tua fatura – Regional Scrum Gathering Lisbon 2026',
    html: generateInvoiceEmail(name, ticketName, invoiceId, total),
    attachments: [
      {
        filename: `invoice-${invoiceId}.pdf`,
        content: pdfBytes.toString('base64'),
      },
    ],
  });
}

// ==================================================================
// 2. INVOICEXPRESS
// ==================================================================
type InvoiceXpressCreateResult = {
  invoiceId: string | null;
  status: string | null;
  permalink: string | null;
  raw?: any;
};

async function createInvoiceXpressInvoice(params: {
  customerName: string;
  customerEmail: string;
  countryIso?: string;
  ticketName: string;
  amountEuro: number;
  taxName?: string;
}): Promise<InvoiceXpressCreateResult> {
  const account = process.env.INVOICEXPRESS_ACCOUNT_NAME;
  const apiKey = process.env.INVOICEXPRESS_API_KEY;

  if (!account || !apiKey) {
    console.error('⚠️ InvoiceXpress: INVOICEXPRESS_ACCOUNT_NAME ou INVOICEXPRESS_API_KEY não configurados.');
    return { invoiceId: null, status: null, permalink: null };
  }

  const isTest = stripeIsTestMode();
  const url = `https://${account}.app.invoicexpress.com/invoices.json?api_key=${encodeURIComponent(apiKey)}`;

  const countryName = isoCountryToInvoiceXpressCountryName(params.countryIso);
  const taxName = params.taxName || 'IVA23';

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
    env: isTest ? 'test' : 'live',
    account,
    countryName,
    taxName,
    amountEuro: params.amountEuro,
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await safeReadJson(resp);
  console.log('🔎 DEBUG InvoiceXpress response:', { ok: resp.ok, status: resp.status, statusText: resp.statusText });

  if (!resp.ok) {
    console.error('❌ InvoiceXpress Error:', JSON.stringify(data));
    return { invoiceId: null, status: null, permalink: null, raw: data };
  }

  const invoiceId = data?.invoice?.id ? String(data.invoice.id) : null;
  const status = data?.invoice?.status || null;
  const permalink = data?.invoice?.permalink || null;

  console.log('✅ InvoiceXpress: invoice criada', { invoiceId, status });
  return { invoiceId, status, permalink, raw: data };
}

async function finalizeInvoiceXpressInvoice(invoiceId: string): Promise<boolean> {
  const account = process.env.INVOICEXPRESS_ACCOUNT_NAME;
  const apiKey = process.env.INVOICEXPRESS_API_KEY;
  if (!account || !apiKey) return false;

  const url = `https://${account}.app.invoicexpress.com/invoices/${encodeURIComponent(
    invoiceId
  )}/change-state.json?api_key=${encodeURIComponent(apiKey)}`;

  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
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
// INVOICEXPRESS – OBTENÇÃO DE PDF (URL ASSINADA)
// ------------------------------------------------------------------
// Em modo de testes / rascunho (draft), o InvoiceXpress NÃO expõe
// diretamente o PDF via API nem permite download público no S3.
// O backoffice gera o PDF de forma assíncrona e devolve uma URL
// temporária (pré-assinada) através do endpoint /api/pdf/:id.
//
// Esta função:
// - Pede ao InvoiceXpress a geração do PDF
// - Faz polling (várias tentativas) até a URL estar disponível
// - Devolve a URL assinada para download seguro do PDF
//
// Uso típico:
// - Apenas em ambiente de testes
// - Para permitir testes end-to-end (Stripe → Invoice → PDF → Email)
// - Sem finalizar a fatura nem comunicar com a Autoridade Tributária
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

    // ✅ Tenta extrair URL de vários formatos possíveis
    const fromPdf = data?.pdf?.url || data?.url || null;

    let fromOutput: string | null = null;
    const output = data?.output;

    // Caso 1: output já é uma string (muito comum)
    if (typeof output === 'string') {
      // pode ser diretamente a URL
      if (output.startsWith('http')) {
        fromOutput = output;
      } else {
        // pode ser JSON em string
        try {
          const parsed = JSON.parse(output);
          fromOutput = parsed?.pdf?.url || parsed?.url || parsed?.output || null;
        } catch {
          // ignora
        }
      }
    }

    // Caso 2: output é objeto
    if (!fromOutput && output && typeof output === 'object') {
      fromOutput = (output as any)?.pdf?.url || (output as any)?.url || null;
    }

    const signedUrl = fromPdf || fromOutput;

    console.log('🔎 DEBUG InvoiceXpress generate-pdf:', {
      attempt,
      status: resp.status,
      ok: resp.ok,
      bodyKeys: Object.keys(data || {}),
      outputType: typeof output,
      outputPreview:
        typeof output === 'string'
          ? output.slice(0, 120)
          : output
          ? JSON.stringify(output).slice(0, 120)
          : null,
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

// ==================================================================
// 3. CONFIGURAÇÃO GERAL
// ==================================================================
export const config = { api: { bodyParser: false } };

async function buffer(readable: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

// ==================================================================
// 4. HANDLER PRINCIPAL
// ==================================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔔 Webhook hit', { ts: new Date().toISOString(), method: req.method, url: (req as any).url });

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    console.error(`❌ Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log(`💰 Processando Order: ${session.id}`);

  try {
    // 1) Salvar Order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        total_amount: session.amount_total,
        status: 'paid',
      })
      .select()
      .single();

    if (orderErr) throw new Error(`DB Order Error: ${orderErr.message}`);

    // 2) Salvar Ticket
    const meta = session.metadata || {};
    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets')
      .insert({
        order_id: order.id,
        ticket_type_id: meta.ticket_type_id,
        attendee_name: meta.attendee_name,
        attendee_email: session.customer_details?.email,
        attendee_phone: meta.attendee_phone,
        attendee_company: meta.attendee_company,
        checked_in: false,
      })
      .select()
      .single();

    if (ticketErr) throw new Error(`DB Ticket Error: ${ticketErr.message}`);

    // 3) Buscar nome do Bilhete
    let ticketName = 'Ingresso RSG 2026';
    if (meta.ticket_type_id) {
      const { data: type } = await supabase
        .from('ticket_types')
        .select('name')
        .eq('id', meta.ticket_type_id)
        .single();
      if (type) ticketName = type.name;
    }

    // 4) Criar documento no InvoiceXpress
    const amountEuro = (order.total_amount || 0) / 100;
    const customerCountryIso = session.customer_details?.address?.country || 'PT';

    const ix = await createInvoiceXpressInvoice({
      customerName: order.customer_name || 'Participante RSG',
      customerEmail: order.customer_email,
      countryIso: customerCountryIso,
      ticketName,
      amountEuro,
      taxName: process.env.INVOICEXPRESS_TAX_NAME || 'IVA23',
    });

    if (ix.invoiceId) {
      await supabase.from('orders').update({ invoice_id: ix.invoiceId }).eq('id', order.id);

      const isTest = stripeIsTestMode();
      const autoFinalize = (process.env.INVOICEXPRESS_AUTO_FINALIZE || 'false').toLowerCase() === 'true';

      // produção: finaliza se desejar
      if (!isTest && autoFinalize) {
        await finalizeInvoiceXpressInvoice(ix.invoiceId);
      }

      // ------------------------------------------------------------------
      // INVOICEXPRESS – TESTES END-TO-END (PDF + EMAIL)
      // ------------------------------------------------------------------
      // Este bloco é executado APENAS em ambiente de testes (Stripe test).
      // Objetivo:.
      // - Gerar o PDF da fatura em estado "draft" (rascunho)
      // - Obter uma URL assinada temporária para o PDF (InvoiceXpress)
      // - Fazer download do PDF no backend
      // - Enviar o PDF por email ao cliente (via Resend)
      //
      // Importante:
      // - Não finaliza a fatura
      // - Não comunica com a Autoridade Tributária
      // - O documento NÃO tem validade fiscal
      //
      // Em produção:
      // - Este bloco não é executado
      // - A fatura pode ser finalizada automaticamente
      // - O envio de email pode ser feito pelo próprio InvoiceXpress
      // ------------------------------------------------------------------
      if (isTest) {
        const signedPdfUrl = await getInvoiceXpressSignedPdfUrl(ix.invoiceId);

        if (!signedPdfUrl) {
          console.warn('⚠️ Não consegui obter URL assinada do PDF (InvoiceXpress).');
        } else {
          const resp = await fetch(signedPdfUrl);
          if (!resp.ok) {
            console.error('❌ Falha ao baixar PDF assinado:', { status: resp.status, statusText: resp.statusText });
          } else {
            const pdfBytes = Buffer.from(await resp.arrayBuffer());

            const sendRes = await sendInvoicePdfByEmailResend(
              order.customer_email,
              pdfBytes,
              ix.invoiceId,
              order.customer_name || meta.attendee_name || 'Participante',
              ticketName,
              String(ix.raw?.invoice?.total ?? amountEuro.toFixed(2))
            );

            if ((sendRes as any)?.error) console.error('⚠️ Resend invoice PDF error:', (sendRes as any).error);
            else console.log('📩 Email com PDF da fatura (teste) enviado.');
          }
        }
      }

    }

    // 5) Enviar Email com Bilhete
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
      ticket.qr_code_secret
    )}&dark=003F59&size=300&margin=1`;

    const emailRes = await resend.emails.send({
      from: 'RSG Lisbon <onboarding@resend.dev>',
      to: session.customer_details?.email as string,
      subject: 'O teu bilhete RSG Lisbon 2026 🎟️',
      html: generateTicketEmail(meta.attendee_name, ticketName, qrUrl, ticket.id),
    });

    if (emailRes.error) console.error('⚠️ Resend Error:', emailRes.error);
    else console.log('📧 Email enviado.');

    return res.json({ received: true });
  } catch (err: any) {
    console.error('❌ Critical Error:', err.message);
    return res.status(500).send('Internal Server Error');
  }
}

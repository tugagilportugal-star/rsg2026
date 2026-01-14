import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
        <br/>A tua fatura/recibo foi emitida e enviada num e-mail separado (via Bill.pt).
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="color: #999; font-size: 12px; margin: 0;">Enviado por TugÁgil • RSG Lisbon 2026</p>
      </div>
    </div>
  </body>
</html>
`;

// ==================================================================
// 2. FUNÇÃO BILL.PT (DEV no Stripe Test / PROD no Stripe Live)
// ==================================================================
async function createBillPtDocument(orderData: any, ticketName: string, nif?: string, countryCode?: string) {
  const billToken = process.env.BILL_API_TOKEN;

  const stripeKeyPrefix = (process.env.STRIPE_SECRET_KEY || '').slice(0, 8);
  const isStripeTest = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');

  if (!billToken) {
    console.error('⚠️ Bill.pt: BILL_API_TOKEN não configurado.');
    return null;
  }

  const baseUrl = 'https://app.bill.pt';

  const amountEuro = orderData.total_amount / 100;

  // Tipificação:
  // - A doc do Bill mostra tipos como FT (Fatura), FR (Fatura Recibo), etc.
  // - Por default usamos FR (faz sentido para pagamento imediato).
  const tipificacao = (process.env.BILL_DOC_TIPIFICACAO || 'FR').toUpperCase();

  // IVA: se não definires, uso 23
  const taxPercent = Number(process.env.BILL_TAX_PERCENT ?? '23');
  const safeTaxPercent = Number.isFinite(taxPercent) ? taxPercent : 23;

  // Contato (cliente) - se não enviares nif/codigo, pode ficar “Consumidor Final”,
  // mas aqui vamos enviar pelo menos nome/email e opcionalmente nif.
  const contato: any = {
    nome: orderData.customer_name || 'Participante RSG',
    email: orderData.customer_email,
    pais: (countryCode || 'PT').toUpperCase(),
  };

  if (nif && nif.trim() !== '') {
    contato.nif = nif.trim();
  }

  // Payload do Bill.pt (Create Document)
  // Doc: POST api/1.0/documentos, campos principais:
  // - tipificacao
  // - contato (array)
  // - produtos (linhas)
  // - terminado (finalizar)
  const payload: any = {
    // redundância “segura”: alguns endpoints aceitam api_token no body
    api_token: billToken,

    tipificacao,
    contato,

    produtos: [
      {
        nome: ticketName,
        quantidade: 1,
        preco_unitario: amountEuro,
        imposto: safeTaxPercent, // 23 => IVA 23%
        servico: 1, // ticket é mais “serviço” do que produto físico
      },
    ],

    terminado: 1,

    observacoes: `Stripe session: ${orderData.stripe_session_id || 'N/A'}`,
    lingua: 'pt',
  };

  try {
    console.log(`🧾 Bill.pt: Criando documento para ${contato.nome} (NIF: ${contato.nif || 'N/A'})...`);

    console.log('🔎 DEBUG Bill/Stripe:', {
      stripeKeyPrefix,
      isStripeTest,
      baseUrl,
      tipificacao,
      clientCountry: contato.pais,
      hasFiscalId: !!contato.nif,
      amountEuro,
      taxPercent: safeTaxPercent,
    });

    const response = await fetch(`${baseUrl}/api/1.0/documentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billToken}`, // recomendado pela doc (header)
      },
      body: JSON.stringify(payload),
    });

    console.log('🔎 DEBUG Bill.pt response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('❌ Bill.pt Error:', JSON.stringify(result));
      return null;
    }

    const docId = result?.id;
    if (!docId) {
      console.error('❌ Bill.pt: resposta sem "id":', JSON.stringify(result));
      return null;
    }

    console.log(`✅ Bill.pt documento criado: #${docId}`);

    // Enviar por email (Bill.pt)
    const emailResp = await fetch(`${baseUrl}/api/1.0/documentos/enviar-por-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${billToken}`,
      },
      body: JSON.stringify({
        api_token: billToken,
        id: docId,
        email: orderData.customer_email,
      }),
    });

    console.log('🔎 DEBUG Bill.pt email response:', {
      ok: emailResp.ok,
      status: emailResp.status,
      statusText: emailResp.statusText,
    });

    const emailResult = await emailResp.json().catch(() => null);
    if (!emailResp.ok) {
      console.error('⚠️ Bill.pt email error:', JSON.stringify(emailResult));
      // Não bloqueia: documento foi criado, só falhou o envio
    } else {
      console.log('📨 Bill.pt: documento enviado por e-mail.');
    }

    return String(docId);
  } catch (error) {
    console.error('❌ Bill.pt Exception:', error);
    return null;
  }
}

// ==================================================================
// 3. CONFIGURAÇÃO GERAL
// ==================================================================
export const config = { api: { bodyParser: false } };

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY);

// ==================================================================
// 4. HANDLER PRINCIPAL
// ==================================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔔 Webhook hit', {
    ts: new Date().toISOString(),
    method: req.method,
    url: (req as any).url,
  });

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`💰 Processando Order: ${session.id}`);

    try {
      // 1. Salvar Order
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

      // 2. Salvar Ticket
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

      // 3. Buscar nome do Bilhete
      let ticketName = 'Ingresso RSG 2026';
      if (meta.ticket_type_id) {
        const { data: type } = await supabase.from('ticket_types').select('name').eq('id', meta.ticket_type_id).single();
        if (type) ticketName = type.name;
      }

      // 4. Criar Documento Bill.pt
      let customerNif = '';
      let customerCountry = 'PT';

      if (session.customer_details) {
        if (session.customer_details.address?.country) {
          customerCountry = session.customer_details.address.country;
        }
        // dependendo do teu setup do Stripe, tax_ids pode não vir aqui
        if ((session.customer_details as any).tax_ids && (session.customer_details as any).tax_ids.length > 0) {
          customerNif = (session.customer_details as any).tax_ids[0].value || '';
        }
      }

      // reforço: a função precisa do stripe_session_id no orderData (pra observações)
      const orderDataForBill = { ...order, stripe_session_id: session.id };

      const billDocId = await createBillPtDocument(orderDataForBill, ticketName, customerNif, customerCountry);
      if (billDocId) {
        await supabase.from('orders').update({ invoice_id: billDocId }).eq('id', order.id);
      }

      // 5. Enviar Email com Bilhete
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(ticket.qr_code_secret)}&dark=003F59&size=300&margin=1`;

      const emailRes = await resend.emails.send({
        from: 'RSG Lisbon <onboarding@resend.dev>',
        to: session.customer_details?.email as string,
        subject: 'O teu bilhete RSG Lisbon 2026 🎟️',
        html: generateTicketEmail(meta.attendee_name, ticketName, qrUrl, ticket.id),
      });

      if (emailRes.error) console.error('⚠️ Resend Error:', emailRes.error);
      else console.log('📧 Email enviado.');
    } catch (err: any) {
      console.error('❌ Critical Error:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.json({ received: true });
}

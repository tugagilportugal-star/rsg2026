import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ==================================================================
// 1. TEMPLATE DE EMAIL (QR Code e Aviso de Fatura)
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
        <br/>A tua fatura foi emitida e segue em anexo (ou num e-mail separado).
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="color: #999; font-size: 12px; margin: 0;">Enviado por TugÁgil • RSG Lisbon 2026</p>
      </div>
    </div>
  </body>
</html>
`;

// ==================================================================
// 2. FUNÇÃO VENDUS (Integração Simplificada)
// ==================================================================
async function createVendusInvoice(orderData: any, ticketName: string, nif?: string) {
  const apiKey = process.env.VENDUS_API_KEY;
  const isStripeTest = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');

  if (!apiKey) {
    console.error("⚠️ Vendus: API Key não configurada.");
    return null;
  }

  // Dados do Cliente
  const finalNif = nif || '999999990'; // Consumidor Final
  const clientName = orderData.customer_name || 'Participante RSG';
  const amountEuro = orderData.total_amount / 100;

  // Payload para criar Fatura-Recibo (FR)
  const payload = {
    mode: isStripeTest ? 'tests' : 'normal', // Automático baseado no Stripe
    type: 'FR', // Fatura-Recibo (Pagamento imediato)
    client: {
      name: clientName,
      fiscal_id: finalNif,
      email: orderData.customer_email,
      country: "PT"
    },
    items: [
      {
        reference: "RSG-TICKET",
        title: ticketName,
        qty: 1,
        gross_price: amountEuro, // Preço com IVA incluído
        tax_id: "NOR" // Código para IVA Normal (23%). Se der erro, verifique no painel do Vendus.
      }
    ],
    payments: [
      {
        id: process.env.VENDUS_PAYMENT_ID || null, // Se não tiver ID, o Vendus usa o padrão
        amount: amountEuro
      }
    ],
    output: "pdf" // Pede para retornar o link do PDF
  };

  try {
    console.log(`🧾 Vendus: A criar fatura (${isStripeTest ? 'TESTE' : 'REAL'}) para NIF ${finalNif}...`);
    
    const response = await fetch('https://www.vendus.pt/ws/v1.1/documents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(apiKey).toString('base64')
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Vendus Error:", JSON.stringify(result));
      return null;
    }

    const invoiceId = result.id;
    console.log(`✅ Fatura Vendus criada: #${invoiceId}`);
    
    // O Vendus envia por email automaticamente se configurado no painel deles,
    // mas o documento foi criado com sucesso.
    return String(invoiceId);

  } catch (error) {
    console.error("❌ Vendus Exception:", error);
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
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
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
        .select().single();

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
        .select().single();

      if (ticketErr) throw new Error(`DB Ticket Error: ${ticketErr.message}`);

      // 3. Buscar nome do Bilhete
      let ticketName = 'Ingresso RSG 2026';
      if (meta.ticket_type_id) {
         const { data: type } = await supabase.from('ticket_types').select('name').eq('id', meta.ticket_type_id).single();
         if (type) ticketName = type.name;
      }

      // 4. Gerar Fatura (Vendus)
      let customerNif = '';
      if (session.customer_details?.tax_ids && session.customer_details.tax_ids.length > 0) {
          customerNif = session.customer_details.tax_ids[0].value || '';
      }
      
      const invoiceId = await createVendusInvoice(order, ticketName, customerNif);
      
      if (invoiceId) {
          await supabase.from('orders').update({ invoice_id: invoiceId }).eq('id', order.id);
      }

      // 5. Enviar Email com Bilhete
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(ticket.qr_code_secret)}&dark=003F59&size=300&margin=1`;
      
      const emailRes = await resend.emails.send({
        from: 'RSG Lisbon <onboarding@resend.dev>', // Em PROD, mude para seu domínio
        to: session.customer_details?.email as string,
        subject: 'O teu bilhete RSG Lisbon 2026 🎟️',
        html: generateTicketEmail(meta.attendee_name, ticketName, qrUrl, ticket.id)
      });

      if (emailRes.error) console.error("⚠️ Resend Error:", emailRes.error);
      else console.log("📧 Email enviado.");

    } catch (err: any) {
      console.error('❌ Critical Error:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.json({ received: true });
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Configuração para NÃO fazer parse do JSON automaticamente
// (O Stripe precisa do corpo "cru" para validar a assinatura)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função auxiliar para ler o buffer da requisição
async function buffer(readable: any) {
  const chunks = [];
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) throw new Error('Missing Stripe signature or secret');
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Evento: Pagamento efetuado com sucesso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log(`💰 Pagamento recebido! Session ID: ${session.id}`);

    try {
      // 1. Inserir na tabela ORDERS
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email,
          customer_name: session.customer_details?.name,
          total_amount: session.amount_total, // em cêntimos
          status: 'paid',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      console.log(`✅ Order criada: ${orderData.id}`);

      // 2. Inserir na tabela TICKETS
      // Recuperamos os dados que salvamos no metadata durante o checkout
      const metadata = session.metadata || {};

      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          order_id: orderData.id,
          ticket_type_id: metadata.ticket_type_id,
          attendee_name: metadata.attendee_name,
          attendee_email: session.customer_details?.email, // ou metadata.attendee_email se tiver
          attendee_phone: metadata.attendee_phone,
          attendee_company: metadata.attendee_company,
          checked_in: false,
        });

      if (ticketError) throw ticketError;

      console.log(`✅ Ticket criado para: ${metadata.attendee_name}`);

      // AQUI NO FUTURO: Chamaremos a função de enviar E-mail e Fatura

    } catch (err: any) {
      console.error('❌ Erro ao salvar no Supabase:', err);
      // Retornamos 500 para o Stripe tentar de novo mais tarde
      return res.status(500).send('Database Error');
    }
  }

  // Retorna 200 OK para o Stripe saber que recebemos
  res.json({ received: true });
}
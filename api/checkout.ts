import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Recebemos ticketTypeId, quantity E o formData
    const { ticketTypeId, quantity = 1, formData } = req.body;

    if (!ticketTypeId) {
      return res.status(400).json({ message: 'Ticket Type ID obrigatório' });
    }

    // 1. Validar e Buscar Preço
    const { data: ticketType, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', ticketTypeId)
      .single();

    if (error || !ticketType || !ticketType.active) {
      return res.status(404).json({ message: 'Bilhete indisponível ou esgotado.' });
    }

    // 2. Criar Sessão no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `RSG Lisbon 2026 - ${ticketType.name}`,
              description: 'Acesso completo aos 2 dias de evento.',
            },
            unit_amount: ticketType.price,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      
      // ✅ O Pulo do Gato: Preenchemos o email automaticamente para o usuário
      customer_email: formData?.email, 

      tax_id_collection: { enabled: true }, // Pede NIF
      billing_address_collection: 'required', // Pede Morada (necessário para fatura correta)
      
      // ✅ Guardamos os dados do participante nos metadados para usar depois
      metadata: {
        ticket_type_id: ticketType.id,
        attendee_name: formData?.name || '',
        attendee_phone: formData?.phone || '',
        attendee_company: formData?.company || '',
        // O Stripe tem limite de keys e tamanho, evite textos longos aqui
      },

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=true#get-involved`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
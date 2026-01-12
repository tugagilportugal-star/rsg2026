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
    // 1. Receber os dados do formulário junto com o ID do bilhete
    const { ticketTypeId, quantity = 1, formData } = req.body;

    if (!ticketTypeId) {
      return res.status(400).json({ message: 'Ticket Type ID obrigatório' });
    }

    // Buscar preço no DB
    const { data: ticketType, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', ticketTypeId)
      .single();

    if (error || !ticketType || !ticketType.active) {
      return res.status(404).json({ message: 'Bilhete indisponível.' });
    }

    // 2. Criar Sessão no Stripe com METADATA
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
      
      // PRE-FILL: Já preenche o e-mail no checkout do Stripe
      customer_email: formData?.email, 

      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      
      // METADATA: Aqui guardamos os dados do participante para usar depois que pagar
      metadata: {
        ticket_type_id: ticketType.id,
        attendee_name: formData?.name || '',
        attendee_phone: formData?.phone || '',
        attendee_company: formData?.company || '',
        attendee_role: formData?.role || '',
        // O Stripe tem limite de caracteres nos metadados, então enviamos apenas o essencial
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

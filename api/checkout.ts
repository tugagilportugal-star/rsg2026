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
    // Recebemos ticketTypeId, quantity e formData (attendee_* vindo do front)
    const { ticketTypeId, quantity = 1, formData } = req.body;

    if (!ticketTypeId) {
      return res.status(400).json({ message: 'Ticket Type ID obrigatório' });
    }

    // 1) Validar e Buscar Preço
    const { data: ticketType, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', ticketTypeId)
      .single();

    if (error || !ticketType || !ticketType.active) {
      return res.status(404).json({ message: 'Bilhete indisponível ou esgotado.' });
    }

    // 2) Normalizar dados do participante (para evitar undefined e manter compatibilidade)
    const attendeeFirstName = String(formData?.attendee_first_name || '').trim();
    const attendeeLastName = String(formData?.attendee_last_name || '').trim();
    const attendeeName = `${attendeeFirstName} ${attendeeLastName}`.trim() || 'Participante RSG';

    const attendeeEmail = String(formData?.attendee_email || '').trim();
    if (!attendeeEmail) {
      return res.status(400).json({ message: 'Email do participante é obrigatório' });
    }

    const attendeeCountry = String(formData?.attendee_country || '').trim() || 'Portugal';
    const attendeeJobFunction = String(formData?.attendee_job_function || '').trim();
    const attendeeJobFunctionOther = String(formData?.attendee_job_function_other || '').trim();

    // 3) Criar Sessão no Stripe
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
          quantity,
        },
      ],
      mode: 'payment',

      // ✅ Preenche o email automaticamente
      customer_email: attendeeEmail,

      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',

      // ✅ Guardar nos metadados para o webhook gravar no Supabase
      metadata: {
        ticket_type_id: String(ticketType.id),

        // compatibilidade com o que já tinhas
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,

        // novos campos (para novas colunas em tickets)
        attendee_first_name: attendeeFirstName,
        attendee_last_name: attendeeLastName,
        attendee_country: attendeeCountry,
        attendee_job_function: attendeeJobFunction,
        attendee_job_function_other: attendeeJobFunctionOther,
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

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

type CouponRow = {
  id: string;
  code: string;
  email: string | null;
  active: boolean;
  discount_percent: number;
  single_use: boolean;
};

async function findValidCoupon(code: string, email: string): Promise<CouponRow | null> {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedCode) return null;

  if (normalizedEmail) {
    const { data: emailCoupon } = await supabase
      .from('discount_coupons')
      .select('id, code, email, active, discount_percent, single_use')
      .eq('code', normalizedCode)
      .eq('email', normalizedEmail)
      .eq('active', true)
      .maybeSingle();

    if (emailCoupon) return emailCoupon;
  }

  const { data: genericCoupon } = await supabase
    .from('discount_coupons')
    .select('id, code, email, active, discount_percent, single_use')
    .eq('code', normalizedCode)
    .is('email', null)
    .eq('active', true)
    .maybeSingle();

  return genericCoupon || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ticketTypeId, quantity = 1, formData, couponCode, includeRecording = false } = req.body;

    if (!ticketTypeId) {
      return res.status(400).json({ message: 'Ticket Type ID obrigatório' });
    }

    const { data: ticketType, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', ticketTypeId)
      .single();

    if (error || !ticketType || !ticketType.active) {
      return res.status(404).json({ message: 'Bilhete indisponível ou esgotado.' });
    }

    const truncate = (val: unknown, max = 100) => String(val || '').trim().slice(0, max);

    const attendeeFirstName = truncate(formData?.attendee_first_name);
    const attendeeLastName = truncate(formData?.attendee_last_name);
    const attendeeName = `${attendeeFirstName} ${attendeeLastName}`.trim() || 'Participante RSG';
    const attendeeEmail = truncate(formData?.attendee_email, 254);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!attendeeEmail || !emailRegex.test(attendeeEmail)) {
      return res.status(400).json({ message: 'Email do participante inválido.' });
    }

    const attendeeCountry = truncate(formData?.attendee_country, 2) || 'PT';
    const attendeeJobFunction = truncate(formData?.attendee_job_function);
    const attendeeJobFunctionOther = truncate(formData?.attendee_job_function_other);

    const attendeeNif = truncate(formData?.attendee_nif, 20);
    const attendeeCompany = truncate(formData?.attendee_company);
    const attendeeJobTitle = truncate(formData?.attendee_job_title);
    const attendeeTshirt = truncate(formData?.attendee_tshirt, 10);

    const saDataSharingConsent = Boolean(formData?.sa_data_sharing_consent);
    const saMarketingConsent = Boolean(formData?.sa_marketing_consent);
    const privacyConsent = Boolean(formData?.privacy_consent);

    const originalPrice = Number(ticketType.price);
    let finalPrice = originalPrice;
    let appliedCoupon: CouponRow | null = null;

    const normalizedCouponCode = String(couponCode || '').trim().toUpperCase();

    if (normalizedCouponCode) {
      appliedCoupon = await findValidCoupon(normalizedCouponCode, attendeeEmail);

      if (!appliedCoupon) {
        return res.status(400).json({ message: 'Cupão inválido para este email.' });
      }

      finalPrice = Math.round(originalPrice * (100 - appliedCoupon.discount_percent) / 100);
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `RSG Lisbon 2026 - ${ticketType.name}`,
            description: appliedCoupon
              ? `Acesso completo aos 2 dias de evento. Cupão ${appliedCoupon.code} aplicado.`
              : 'Acesso completo aos 2 dias de evento.',
          },
          unit_amount: finalPrice,
        },
        quantity,
      },
    ];

    if (includeRecording) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Acesso à Gravação do Evento - RSG Lisbon 2026',
            description: 'Vídeos de todas as sessões do evento.',
          },
          unit_amount: 1000,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: attendeeEmail,
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      metadata: {
        ticket_type_id: String(ticketType.id),
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_first_name: attendeeFirstName,
        attendee_last_name: attendeeLastName,
        attendee_country: attendeeCountry,
        attendee_job_function: attendeeJobFunction,
        attendee_job_function_other: attendeeJobFunctionOther,
        
        attendee_nif: attendeeNif,
        attendee_company: attendeeCompany,
        attendee_job_title: attendeeJobTitle,
        attendee_tshirt: attendeeTshirt,
        sa_data_sharing_consent: String(saDataSharingConsent),
        sa_marketing_consent: String(saMarketingConsent),
        privacy_consent: String(privacyConsent),
        
        coupon_id: appliedCoupon?.id || '',
        coupon_code: appliedCoupon?.code || '',
        coupon_discount_percent: appliedCoupon ? String(appliedCoupon.discount_percent) : '',
        coupon_single_use: appliedCoupon ? String(appliedCoupon.single_use) : '',
        include_recording: String(includeRecording),
        original_price: String(originalPrice),
        final_price: String(finalPrice),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=true#ticket-form`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
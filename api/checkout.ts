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
  discount_percent: number | null;
  discount_amount: number | null;
  recording_only: boolean;
  single_use: boolean;
};

const RECORDING_PRICE = 1000;

async function findValidCoupon(code: string, email: string): Promise<CouponRow | null> {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedCode) return null;

  if (normalizedEmail) {
    const { data: emailCoupon } = await supabase
      .from('discount_coupons')
      .select('id, code, email, active, discount_percent, discount_amount, recording_only, single_use')
      .eq('code', normalizedCode)
      .eq('email', normalizedEmail)
      .eq('active', true)
      .maybeSingle();

    if (emailCoupon) return emailCoupon;
  }

  const { data: genericCoupon } = await supabase
    .from('discount_coupons')
    .select('id, code, email, active, discount_percent, discount_amount, recording_only, single_use')
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
    const { ticketTypeId, participants, shared } = req.body;

    if (!ticketTypeId || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'Dados obrigatórios em falta.' });
    }

    const quantity = participants.length;
    if (quantity > 5) return res.status(400).json({ message: 'Máximo de 5 bilhetes por compra.' });

    const { data: ticketType, error } = await supabase
      .from('ticket_types').select('*').eq('id', ticketTypeId).single();

    if (error || !ticketType || !ticketType.active) {
      return res.status(404).json({ message: 'Bilhete indisponível ou esgotado.' });
    }

    const truncate = (val: unknown, max = 100) => String(val || '').trim().slice(0, max);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate all participant emails
    for (const p of participants) {
      const email = truncate(p.email, 254);
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: `Email inválido: ${p.email}` });
      }
    }

    const includeRecording = Boolean(shared?.include_recording);
    const couponCode = String(shared?.coupon_code || '').trim().toUpperCase();
    const billingNif = truncate(shared?.billing_nif, 20);
    const saDataSharingConsent = Boolean(shared?.sa_data_sharing_consent);
    const privacyConsent = Boolean(shared?.privacy_consent);

    // Use first participant email for coupon validation
    const firstEmail = truncate(participants[0].email, 254);

    const originalPrice = Number(ticketType.price);
    let finalTicketPrice = originalPrice;
    let finalRecordingPrice = RECORDING_PRICE;
    let appliedCoupon: CouponRow | null = null;

    if (couponCode) {
      appliedCoupon = await findValidCoupon(couponCode, firstEmail);
      if (!appliedCoupon) return res.status(400).json({ message: 'Cupão inválido para este email.' });

      if (appliedCoupon.recording_only) {
        if (includeRecording) {
          if (appliedCoupon.discount_amount != null) {
            finalRecordingPrice = Math.max(0, RECORDING_PRICE - appliedCoupon.discount_amount);
          } else if (appliedCoupon.discount_percent != null) {
            const rawDiscount = Math.round((originalPrice + RECORDING_PRICE) * appliedCoupon.discount_percent / 100);
            finalRecordingPrice = Math.max(0, RECORDING_PRICE - Math.min(rawDiscount, RECORDING_PRICE));
          }
        }
      } else {
        if (appliedCoupon.discount_amount != null) {
          finalTicketPrice = Math.max(0, originalPrice - appliedCoupon.discount_amount);
        } else if (appliedCoupon.discount_percent != null) {
          finalTicketPrice = Math.round(originalPrice * (100 - appliedCoupon.discount_percent) / 100);
        }
      }
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `RSG Lisbon 2026 - ${ticketType.name}`,
            description: appliedCoupon && !appliedCoupon.recording_only
              ? `Acesso completo aos 2 dias de evento. Cupão ${appliedCoupon.code} aplicado.`
              : 'Acesso completo aos 2 dias de evento.',
          },
          unit_amount: finalTicketPrice,
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
            description: appliedCoupon?.recording_only
              ? `Vídeos de todas as sessões do evento. Cupão ${appliedCoupon.code} aplicado.`
              : 'Vídeos de todas as sessões do evento.',
          },
          unit_amount: finalRecordingPrice,
        },
        quantity,
      });
    }

    // Encode participants as p_0, p_1, ... in metadata (max 500 chars each)
    const participantsMeta: Record<string, string> = {};
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      participantsMeta[`p_${i}`] = JSON.stringify({
        fn: truncate(p.first_name, 50),
        ln: truncate(p.last_name, 50),
        em: truncate(p.email, 100),
        co: truncate(p.country, 30),
        cp: truncate(p.company, 80),
        jf: truncate(p.job_function, 60),
        jo: truncate(p.job_function_other, 60),
        jt: truncate(p.job_title, 80),
        ts: truncate(p.tshirt, 5),
        mc: Boolean(p.sa_marketing_consent),
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: firstEmail,
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      metadata: {
        ticket_type_id: String(ticketType.id),
        participants_count: String(quantity),
        ...participantsMeta,
        billing_nif: billingNif,
        sa_data_sharing_consent: String(saDataSharingConsent),
        privacy_consent: String(privacyConsent),
        coupon_id: appliedCoupon?.id || '',
        coupon_code: appliedCoupon?.code || '',
        coupon_discount_percent: appliedCoupon?.discount_percent != null ? String(appliedCoupon.discount_percent) : '',
        coupon_discount_amount: appliedCoupon?.discount_amount != null ? String(appliedCoupon.discount_amount) : '',
        coupon_recording_only: appliedCoupon ? String(appliedCoupon.recording_only) : '',
        coupon_single_use: appliedCoupon ? String(appliedCoupon.single_use) : '',
        include_recording: String(includeRecording),
        original_price: String(originalPrice),
        final_price: String(finalTicketPrice * quantity + (includeRecording ? finalRecordingPrice * quantity : 0)),
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
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rawCode = String(req.body?.code || '').trim().toUpperCase();
    const rawEmail = String(req.body?.email || '').trim().toLowerCase();

    if (!rawCode) {
      return res.status(400).json({ valid: false, message: 'Código do cupão é obrigatório.' });
    }

    let coupon: CouponRow | null = null;

    if (rawEmail) {
      const { data: emailCoupon, error: emailError } = await supabase
        .from('discount_coupons')
        .select('id, code, email, active, discount_percent, single_use')
        .eq('code', rawCode)
        .eq('email', rawEmail)
        .eq('active', true)
        .maybeSingle();

      if (emailError) {
        return res.status(500).json({ valid: false, message: emailError.message });
      }

      if (emailCoupon) {
        coupon = emailCoupon;
      }
    }

    if (!coupon) {
      const { data: genericCoupon, error: genericError } = await supabase
        .from('discount_coupons')
        .select('id, code, email, active, discount_percent, single_use')
        .eq('code', rawCode)
        .is('email', null)
        .eq('active', true)
        .maybeSingle();

      if (genericError) {
        return res.status(500).json({ valid: false, message: genericError.message });
      }

      if (genericCoupon) {
        coupon = genericCoupon;
      }
    }

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message: 'Cupão inválido para este email.',
      });
    }

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discount_percent,
      singleUse: coupon.single_use,
      emailBound: Boolean(coupon.email),
    });
  } catch (err: any) {
    return res.status(500).json({
      valid: false,
      message: err?.message || 'Internal Server Error',
    });
  }
}
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken, logAction } from '../../lib/admin/auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function normalizeCode(code: string) {
  return String(code || '').trim().toUpperCase();
}

function normalizeEmail(email?: string | null) {
  const value = String(email || '').trim().toLowerCase();
  return value || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await verifyAdminToken(req.headers.authorization || '');
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });
  try {
    if (req.method === 'GET') {
      if (admin.role !== 'edit') return res.status(403).json({ message: 'Sem permissão de edição.' });
      const { data, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      if (admin.role !== 'edit') return res.status(403).json({ message: 'Sem permissão de edição.' });
      const {
        code,
        email,
        discount_percent,
        discount_amount,
        recording_only = false,
        single_use = true,
        active = true,
      } = req.body || {};

      const normalizedCode = normalizeCode(code);
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedCode) {
        return res.status(400).json({ error: 'Código é obrigatório.' });
      }

      const hasPercent = discount_percent !== undefined && discount_percent !== '' && discount_percent !== null;
      const hasAmount = discount_amount !== undefined && discount_amount !== '' && discount_amount !== null;

      if (!hasPercent && !hasAmount) {
        return res.status(400).json({ error: 'Indica desconto em % ou valor fixo (€).' });
      }

      let discountPercent: number | null = null;
      let discountAmountCents: number | null = null;

      if (hasPercent) {
        discountPercent = Number(discount_percent);
        if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
          return res.status(400).json({ error: 'Desconto (%) deve estar entre 1 e 100.' });
        }
      }
      if (hasAmount) {
        discountAmountCents = Math.round(Number(discount_amount) * 100);
        if (!Number.isFinite(discountAmountCents) || discountAmountCents < 1) {
          return res.status(400).json({ error: 'Valor de desconto deve ser positivo.' });
        }
      }

      const { data, error } = await supabase
        .from('discount_coupons')
        .insert({
          code: normalizedCode,
          email: normalizedEmail,
          discount_percent: discountPercent,
          discount_amount: discountAmountCents,
          recording_only: Boolean(recording_only),
          single_use: Boolean(single_use),
          active: Boolean(active),
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      await logAction(admin.email, 'criar_cupao', 'coupon', data.id, { code: data.code });
      return res.status(201).json(data);
    }

    if (req.method === 'PATCH') {
      if (admin.role !== 'edit') return res.status(403).json({ message: 'Sem permissão de edição.' });
      const {
        id,
        code,
        email,
        discount_percent,
        discount_amount,
        recording_only,
        single_use,
        active,
      } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const payload: Record<string, unknown> = {};

      if (code !== undefined) payload.code = normalizeCode(code);
      if (email !== undefined) payload.email = normalizeEmail(email);
      if (discount_percent !== undefined) {
        if (discount_percent === null || discount_percent === '') {
          payload.discount_percent = null;
        } else {
          const discount = Number(discount_percent);
          if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
            return res.status(400).json({ error: 'Desconto (%) deve estar entre 1 e 100.' });
          }
          payload.discount_percent = discount;
        }
      }
      if (discount_amount !== undefined) {
        if (discount_amount === null || discount_amount === '') {
          payload.discount_amount = null;
        } else {
          const amountCents = Math.round(Number(discount_amount) * 100);
          if (!Number.isFinite(amountCents) || amountCents < 1) {
            return res.status(400).json({ error: 'Valor de desconto deve ser positivo.' });
          }
          payload.discount_amount = amountCents;
        }
      }
      if (recording_only !== undefined) payload.recording_only = Boolean(recording_only);
      if (single_use !== undefined) payload.single_use = Boolean(single_use);
      if (active !== undefined) payload.active = Boolean(active);

      const { data: before } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('discount_coupons')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const changedKeys = Object.keys(payload);
      const beforeSnapshot = Object.fromEntries(changedKeys.map(k => [k, (before as any)?.[k]]));
      await logAction(admin.email, 'editar_cupao', 'coupon', data.id, { before: beforeSnapshot, after: payload });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      if (admin.role !== 'edit') return res.status(403).json({ message: 'Sem permissão de edição.' });
      const { id } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const { error } = await supabase
        .from('discount_coupons')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      await logAction(admin.email, 'eliminar_cupao', 'coupon', id, {});
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}

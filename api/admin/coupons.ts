import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
  try {
    if (req.method === 'GET') {
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
      const {
        code,
        email,
        discount_percent,
        single_use = true,
        active = true,
      } = req.body || {};

      const normalizedCode = normalizeCode(code);
      const normalizedEmail = normalizeEmail(email);
      const discount = Number(discount_percent);

      if (!normalizedCode) {
        return res.status(400).json({ error: 'Código é obrigatório.' });
      }

      if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
        return res.status(400).json({ error: 'Desconto deve estar entre 1 e 100.' });
      }

      const { data, error } = await supabase
        .from('discount_coupons')
        .insert({
          code: normalizedCode,
          email: normalizedEmail,
          discount_percent: discount,
          single_use: Boolean(single_use),
          active: Boolean(active),
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    }

    if (req.method === 'PATCH') {
      const {
        id,
        code,
        email,
        discount_percent,
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
        const discount = Number(discount_percent);
        if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
          return res.status(400).json({ error: 'Desconto deve estar entre 1 e 100.' });
        }
        payload.discount_percent = discount;
      }
      if (single_use !== undefined) payload.single_use = Boolean(single_use);
      if (active !== undefined) payload.active = Boolean(active);

      const { data, error } = await supabase
        .from('discount_coupons')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
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

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}

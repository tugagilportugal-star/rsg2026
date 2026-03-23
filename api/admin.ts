import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken, logAction, canEdit } from '../lib/admin/auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function getRouteParts(req: VercelRequest): string[] {
  const q = (req.query as any).route;
  if (!q) return [];

  const rawParts = Array.isArray(q) ? q : [q];

  return rawParts
    .flatMap((part) => String(part).split('/'))
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBody(req: VercelRequest) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function normalizeTicketTypeInput(body: any, partial = false) {
  const next: Record<string, unknown> = {};

  if (!partial || body?.name !== undefined) {
    const name = String(body?.name ?? '').trim();
    if (!name) {
      return { error: 'name obrigatório' };
    }
    next.name = name;
  }

  if (!partial || body?.price !== undefined) {
    const price = Number(body?.price);
    if (!Number.isFinite(price) || price < 0) {
      return { error: 'price inválido' };
    }
    next.price = price;
  }

  if (!partial || body?.currency !== undefined) {
    const currency = String(body?.currency ?? 'eur').trim().toLowerCase();
    if (!currency) {
      return { error: 'currency obrigatória' };
    }
    next.currency = currency;
  }

  if (!partial || body?.quantity_total !== undefined) {
    const quantityTotal = Number(body?.quantity_total);
    if (!Number.isInteger(quantityTotal) || quantityTotal < 0) {
      return { error: 'quantity_total inválido' };
    }
    next.quantity_total = quantityTotal;
  }

  if (!partial || body?.active !== undefined) {
    next.active = Boolean(body?.active);
  }

  if (!partial || body?.sort_order !== undefined) {
    const sortOrder = Number(body?.sort_order ?? 0);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return { error: 'sort_order inválido' };
    }
    next.sort_order = sortOrder;
  }

  return { data: next };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await verifyAdminToken(req.headers.authorization || '');
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  const parts = getRouteParts(req);
  const resource = parts[0] || '';
  const id = parts[1] || null;

  try {
    // =========================
    // LEADS
    // =========================
    if (resource === 'leads') {
      if (req.method === 'GET' && !id) {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .neq('status', 'Deleted')
          .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data || []);
      }

      if (req.method === 'PATCH' && id) {
        if (!canEdit(admin.role)) return res.status(403).json({ message: 'Sem permissão de edição.' });
        const body = parseBody(req);
        const status = body?.status;

        if (!status) {
          return res.status(400).json({ message: 'status obrigatório' });
        }

        const { data: before } = await supabase.from('leads').select('status').eq('id', id).single();

        const { data, error } = await supabase
          .from('leads')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
        await logAction(admin.email, 'atualizar_lead', 'lead', id, { before: { status: before?.status }, after: { status } });
        return res.status(200).json(data);
      }

      if (req.method === 'DELETE' && id) {
        if (!canEdit(admin.role)) return res.status(403).json({ message: 'Sem permissão de edição.' });

        const { data: before } = await supabase.from('leads').select('status').eq('id', id).single();

        const { data, error } = await supabase
          .from('leads')
          .update({ status: 'Deleted' })
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
        await logAction(admin.email, 'eliminar_lead', 'lead', id, { before: { status: before?.status }, after: { status: 'Deleted' } });
        return res.status(200).json(data);
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // =========================
    // TICKET TYPES (LOTES)
    // =========================
    if (resource === 'ticket-types') {
      if (req.method === 'GET' && !id) {
        const { data, error } = await supabase
          .from('ticket_types')
          .select('*')
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true });

        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data || []);
      }

      if (req.method === 'POST' && !id) {
        if (!canEdit(admin.role)) return res.status(403).json({ message: 'Sem permissão de edição.' });
        const body = parseBody(req);
        const normalized = normalizeTicketTypeInput(body, false);

        if ('error' in normalized) {
          return res.status(400).json({ message: normalized.error });
        }

        const payload = {
          ...normalized.data,
          quantity_sold: 0,
        };

        const { data, error } = await supabase
          .from('ticket_types')
          .insert(payload)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
        await logAction(admin.email, 'criar_lote', 'ticket_type', data.id, { name: data.name });
        return res.status(200).json(data);
      }

      if (req.method === 'PATCH' && id) {
        if (!canEdit(admin.role)) return res.status(403).json({ message: 'Sem permissão de edição.' });
        const body = parseBody(req);
        const normalized = normalizeTicketTypeInput(body, true);

        if ('error' in normalized) {
          return res.status(400).json({ message: normalized.error });
        }

        const { data: before, error: beforeError } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('id', id)
          .single();

        if (beforeError) return res.status(500).json({ message: beforeError.message });

        if (normalized.data.quantity_total !== undefined) {
          const sold = Number(before?.quantity_sold ?? 0);
          const total = Number(normalized.data.quantity_total);
          if (total < sold) {
            return res.status(400).json({
              message: 'quantity_total não pode ser inferior à quantidade já vendida',
            });
          }
        }

        const { data, error } = await supabase
          .from('ticket_types')
          .update(normalized.data)
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });

        const changedKeys = Object.keys(normalized.data);
        const beforeSnapshot = Object.fromEntries(changedKeys.map(k => [k, (before as any)?.[k]]));
        await logAction(admin.email, 'editar_lote', 'ticket_type', id, { before: beforeSnapshot, after: normalized.data });
        return res.status(200).json(data);
      }

      if (req.method === 'DELETE' && id) {
        if (!canEdit(admin.role)) return res.status(403).json({ message: 'Sem permissão de edição.' });

        const { data: before } = await supabase.from('ticket_types').select('name, active').eq('id', id).single();

        const { data, error } = await supabase
          .from('ticket_types')
          .update({ active: false })
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
        await logAction(admin.email, 'desativar_lote', 'ticket_type', id, { before: { active: before?.active }, after: { active: false } });
        return res.status(200).json(data);
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // =========================
    // ORDERS
    // =========================
    if (resource === 'orders') {
      if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data || []);
    }

    // =========================
    // TICKETS
    // =========================
    if (resource === 'tickets') {
      if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .limit(500);

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data || []);
    }

    // =========================
    // ME
    // =========================
    if (resource === 'me') {
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      return res.status(200).json(admin);
    }

    // =========================
    // AUDIT LOG (superadmin only)
    // =========================
    if (resource === 'audit-log') {
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      if (admin.role !== 'superadmin') return res.status(403).json({ message: 'Sem permissão.' });
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data || []);
    }

    // =========================
    // ADMIN USERS (superadmin only)
    // =========================
    if (resource === 'admin-users') {
      if (admin.role !== 'superadmin') return res.status(403).json({ message: 'Sem permissão.' });

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('admin_users')
          .select('email, name, role, active, created_at')
          .order('created_at', { ascending: true });
        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data || []);
      }

      if (req.method === 'POST') {
        const body = parseBody(req);
        const email = String(body?.email || '').trim().toLowerCase();
        const name = String(body?.name || '').trim() || null;
        const role = body?.role;
        if (!email) return res.status(400).json({ message: 'email obrigatório.' });
        if (!['superadmin', 'edit', 'view'].includes(role)) return res.status(400).json({ message: 'role inválido.' });
        const { data, error } = await supabase
          .from('admin_users')
          .insert({ email, name, role, active: true })
          .select()
          .single();
        if (error) return res.status(500).json({ message: error.message });
        await logAction(admin.email, 'criar_admin', 'admin_user', email, { name, role });
        return res.status(200).json(data);
      }

      if (req.method === 'PATCH' && id) {
        const body = parseBody(req);
        const payload: Record<string, unknown> = {};
        if (body?.role !== undefined) {
          if (!['superadmin', 'edit', 'view'].includes(body.role)) return res.status(400).json({ message: 'role inválido.' });
          payload.role = body.role;
        }
        if (body?.active !== undefined) payload.active = Boolean(body.active);
        if (body?.name !== undefined) payload.name = String(body.name).trim() || null;
        const { data: before } = await supabase.from('admin_users').select('role, active, name').eq('email', id).single();
        const { data, error } = await supabase
          .from('admin_users')
          .update(payload)
          .eq('email', id)
          .select()
          .single();
        if (error) return res.status(500).json({ message: error.message });
        const changedKeys = Object.keys(payload);
        const beforeSnapshot = Object.fromEntries(changedKeys.map(k => [k, (before as any)?.[k]]));
        await logAction(admin.email, 'editar_admin', 'admin_user', id, { before: beforeSnapshot, after: payload });
        return res.status(200).json(data);
      }

      if (req.method === 'DELETE' && id) {
        if (id === admin.email) return res.status(400).json({ message: 'Não podes remover a tua própria conta.' });
        const { data: before } = await supabase.from('admin_users').select('email, role').eq('email', id).single();
        const { error } = await supabase.from('admin_users').delete().eq('email', id);
        if (error) return res.status(500).json({ message: error.message });
        await logAction(admin.email, 'remover_admin', 'admin_user', id, { email: before?.email, role: before?.role });
        return res.status(200).json({ ok: true });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
}
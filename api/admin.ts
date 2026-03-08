import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function unauthorized(res: VercelResponse) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).json({ message: 'Unauthorized' });
}

function checkBasicAuth(req: VercelRequest): boolean {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;

  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');

  return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
}

function getRouteParts(req: VercelRequest): string[] {
  const q = (req.query as any).route;
  if (!q) return [];
  return Array.isArray(q) ? q : [q];
}

function parseBody(req: VercelRequest) {
  if (!req.body) return {};
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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
  if (!checkBasicAuth(req)) return unauthorized(res);

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
        const body = parseBody(req);
        const status = body?.status;

        if (!status) {
          return res.status(400).json({ message: 'status obrigatório' });
        }

        const { data, error } = await supabase
          .from('leads')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data);
      }

      if (req.method === 'DELETE' && id) {
        const { data, error } = await supabase
          .from('leads')
          .update({ status: 'Deleted' })
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
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
        return res.status(200).json(data);
      }

      if (req.method === 'PATCH' && id) {
        const body = parseBody(req);
        const normalized = normalizeTicketTypeInput(body, true);

        if ('error' in normalized) {
          return res.status(400).json({ message: normalized.error });
        }

        if (
          normalized.data.quantity_total !== undefined
        ) {
          const { data: current, error: currentError } = await supabase
            .from('ticket_types')
            .select('quantity_sold')
            .eq('id', id)
            .single();

          if (currentError) {
            return res.status(500).json({ message: currentError.message });
          }

          const sold = Number(current?.quantity_sold ?? 0);
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
        return res.status(200).json(data);
      }

      if (req.method === 'DELETE' && id) {
        const { data, error } = await supabase
          .from('ticket_types')
          .update({ active: false })
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
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
        .select(`
          *,
          orders:order_id (*),
          ticket_types:ticket_type_id (*)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data || []);
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
}
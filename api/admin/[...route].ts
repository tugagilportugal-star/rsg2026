// api/admin/[...route].ts
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

function checkBasicAuth(req: VercelRequest, res: VercelResponse): boolean {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;

  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');

  const ok =
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS;

  return !!ok;
}

function getRouteParts(req: VercelRequest): string[] {
  // /api/admin/xxxx -> aqui chega como req.query.route (string|string[])
  const q = (req.query as any).route;
  if (!q) return [];
  return Array.isArray(q) ? q : [q];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // auth
  if (!checkBasicAuth(req, res)) return unauthorized(res);

  const parts = getRouteParts(req); // ex: ['leads'] ou ['leads','<id>']
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
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const status = body?.status;

        if (!status) return res.status(400).json({ message: 'status obrigatório' });

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
    // TICKET TYPES (lotes)
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

      // criar lote
      if (req.method === 'POST' && !id) {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const payload = {
          name: body?.name ?? null,
          price: body?.price ?? null,
          currency: body?.currency ?? 'eur',
          quantity_total: body?.quantity_total ?? null,
          active: body?.active ?? false,
          sort_order: body?.sort_order ?? null,
        };

        const { data, error } = await supabase
          .from('ticket_types')
          .insert(payload)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data);
      }

      // atualizar lote
      if (req.method === 'PATCH' && id) {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const update: any = {};
        const allowed = ['name', 'price', 'currency', 'quantity_total', 'active', 'sort_order', 'quantity_sold'];
        for (const k of allowed) {
          if (body?.[k] !== undefined) update[k] = body[k];
        }

        const { data, error } = await supabase
          .from('ticket_types')
          .update(update)
          .eq('id', id)
          .select()
          .single();

        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data);
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // =========================
    // ORDERS (pagamentos)
    // =========================
    if (resource === 'orders') {
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data || []);
    }

    // =========================
    // TICKETS (bilhetes emitidos)
    // =========================
    if (resource === 'tickets') {
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

      // retorna tickets + info de order + lote
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

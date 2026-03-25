// api/admin/ticket-types.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function unauthorized(res: VercelResponse) {
  return res.status(401).json({ message: 'Unauthorized' });
}

function checkBasicAuth(req: VercelRequest): boolean {
  const expectedUser = process.env.ADMIN_USER || '';
  const expectedPass = process.env.ADMIN_PASS || '';
  const auth = (req.headers.authorization || req.headers.Authorization) as string | undefined;
  if (!expectedUser || !expectedPass) return false;
  if (!auth || !auth.startsWith('Basic ')) return false;

  const raw = auth.slice('Basic '.length);
  let decoded = '';
  try {
    decoded = Buffer.from(raw, 'base64').toString('utf8');
  } catch {
    return false;
  }

  const [u, p] = decoded.split(':');
  return u === expectedUser && p === expectedPass;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  if (!checkBasicAuth(req)) return unauthorized(res);

  try {
    // Ordena por sort_order (se existir) e depois por created_at
    const { data, error } = await supabase
      .from('ticket_types')
      .select(
        'id,name,price,currency,active,quantity_total,quantity_sold,sort_order,created_at'
      )
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ message: error.message });

    return res.status(200).json(data ?? []);
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || 'Unexpected error' });
  }
}

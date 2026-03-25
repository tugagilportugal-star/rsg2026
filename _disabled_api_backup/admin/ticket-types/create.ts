import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function isAuthorized(req: VercelRequest) {
  const hdr = req.headers.authorization || '';
  const expectedUser = process.env.ADMIN_USER || '';
  const expectedPass = process.env.ADMIN_PASS || '';
  const expected = 'Basic ' + Buffer.from(`${expectedUser}:${expectedPass}`).toString('base64');
  return hdr === expected;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const body = req.body || {};
  if (!body?.name) return res.status(400).json({ message: 'name obrigatório' });
  if (body?.price == null) return res.status(400).json({ message: 'price obrigatório' });
  if (body?.quantity_total == null) return res.status(400).json({ message: 'quantity_total obrigatório' });
  if (body?.sort_order == null) return res.status(400).json({ message: 'sort_order obrigatório' });

  const payload = {
    name: body.name,
    price: Number(body.price),
    currency: body.currency || 'eur',
    quantity_total: Number(body.quantity_total),
    quantity_sold: 0,
    active: body.active ?? true,
    sort_order: Number(body.sort_order),
  };

  const { data, error } = await supabase
    .from('ticket_types')
    .insert(payload)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.status(200).json(data);
}

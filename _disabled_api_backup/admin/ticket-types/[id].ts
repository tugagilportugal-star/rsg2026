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

  const id = String((req.query as any).id || '');
  if (!id) return res.status(400).json({ message: 'Missing id' });

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const body = req.body || {};
  const update: any = {};

  // permitir só campos esperados
  if (body.name !== undefined) update.name = body.name;
  if (body.price !== undefined) update.price = body.price;
  if (body.currency !== undefined) update.currency = body.currency;
  if (body.quantity_total !== undefined) update.quantity_total = body.quantity_total;
  if (body.active !== undefined) update.active = body.active;
  if (body.sort_order !== undefined) update.sort_order = body.sort_order;

  const { data, error } = await supabase
    .from('ticket_types')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.status(200).json(data);
}

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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('ticket_types')
    .select('id,name,price,currency,quantity_total,quantity_sold,active,sort_order,created_at')
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });

  return res.status(200).json(data || []);
}

// api/admin/tickets.ts
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
    // Query params opcionais:
    // ?limit=500
    // ?checked_in=true|false
    const limit = Math.min(Number(req.query.limit || 500), 2000);
    const checkedInRaw = (req.query.checked_in ? String(req.query.checked_in) : '').trim();

    let q = supabase
      .from('tickets')
      .select(
        [
          'id',
          'created_at',
          'order_id',
          'ticket_type_id',
          'attendee_name',
          'attendee_email',
          'attendee_company',
          'attendee_phone',
          'attendee_first_name',
          'attendee_last_name',
          'attendee_country',
          'attendee_job_function',
          'attendee_job_function_other',
          'checked_in',
          'check_in_at',
        ].join(',')
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (checkedInRaw === 'true') q = q.eq('checked_in', true);
    if (checkedInRaw === 'false') q = q.eq('checked_in', false);

    const { data, error } = await q;

    if (error) return res.status(500).json({ message: error.message });

    return res.status(200).json(data ?? []);
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || 'Unexpected error' });
  }
}

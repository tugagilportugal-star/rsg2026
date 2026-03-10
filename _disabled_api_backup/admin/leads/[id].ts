import type { VercelRequest, VercelResponse } from '@vercel/node';

/* =========================
   Basic Auth
========================= */
function isAuthorized(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return false;

  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [user, pass] = decoded.split(':');

  return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
}

const ALLOWED_STATUS = new Set(['Pending', 'InProgress', 'Completed', 'Deleted']);

/* =========================
   Handler
========================= */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Alguns clientes mandam PUT para "update"
  const method = req.method === 'PUT' ? 'PATCH' : req.method;

  if (method !== 'DELETE' && method !== 'PATCH') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ ok: false, message: 'Invalid id' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ ok: false, message: 'Server misconfigured' });
  }

  try {
    // DELETE = soft delete
    let nextStatus: string;

    if (method === 'DELETE') {
      nextStatus = 'Deleted';
    } else {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      nextStatus = body?.status;

      if (!nextStatus || typeof nextStatus !== 'string' || !ALLOWED_STATUS.has(nextStatus)) {
        return res.status(400).json({ ok: false, message: 'Invalid status' });
      }
    }

    const safeId = encodeURIComponent(id);

    const supabaseRes = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?id=eq.${safeId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ status: nextStatus }),
      }
    );

    if (!supabaseRes.ok) {
      const text = await supabaseRes.text().catch(() => '');
      console.error('Supabase update failed:', supabaseRes.status, text);
      return res.status(500).json({ ok: false, details: text });
    }

    return res.status(200).json({ ok: true, status: nextStatus });
  } catch (err) {
    console.error('Admin leads/[id] error:', err);
    return res.status(500).json({ ok: false });
  }
}

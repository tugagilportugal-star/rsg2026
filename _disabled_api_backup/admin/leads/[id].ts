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
  if (req.method !== 'DELETE' && req.method !== 'PATCH') {
    return res.status(405).json({ ok: false });
  }

  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ ok: false });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ ok: false });
  }

  try {
    // DELETE = soft delete
    let nextStatus: string | null = null;

    if (req.method === 'DELETE') {
      nextStatus = 'Deleted';
    } else {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      nextStatus = body?.status;

      if (!nextStatus || typeof nextStatus !== 'string' || !ALLOWED_STATUS.has(nextStatus)) {
        return res.status(400).json({ ok: false });
      }

      // (opcional) impedir que o admin volte de Deleted
      // se quiser permitir, remove este if
      // if (nextStatus === 'Deleted') return res.status(400).json({ ok: false });
    }

    const supabaseRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/leads?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ status: nextStatus }),
      }
    );

    if (!supabaseRes.ok) {
      const text = await supabaseRes.text().catch(() => '');
      return res.status(500).json({ ok: false, details: text });
    }

    return res.status(200).json({ ok: true, status: nextStatus });
  } catch {
    return res.status(500).json({ ok: false });
  }
}

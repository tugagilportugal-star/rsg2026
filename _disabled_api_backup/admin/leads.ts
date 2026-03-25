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

/* =========================
   Handler
========================= */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false });
  }

  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ ok: false });
  }

  try {
    // ✅ não listar Deleted
    const url =
      `${process.env.SUPABASE_URL}/rest/v1/leads` +
      `?select=*` +
      `&status=neq.Deleted` +
      `&order=created_at.desc`;

    const supabaseRes = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!supabaseRes.ok) {
      const text = await supabaseRes.text().catch(() => '');
      return res.status(500).json({ ok: false, details: text });
    }

    const data = await supabaseRes.json();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ ok: false });
  }
}

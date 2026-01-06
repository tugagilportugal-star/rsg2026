import type { VercelRequest, VercelResponse } from '@vercel/node';

function isAuthorized(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return false;

  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString('utf8');
  const idx = decoded.indexOf(':');
  if (idx < 0) return false;

  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false });

  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Debug Area"');
    return res.status(401).json({ ok: false });
  }

  const from = process.env.RESEND_FROM;
  const to = process.env.ADMIN_EMAIL;
  const key = process.env.RESEND_API_KEY;

  if (!from || !to || !key) {
    return res.status(500).json({
      ok: false,
      missing: {
        RESEND_FROM: !from,
        ADMIN_EMAIL: !to,
        RESEND_API_KEY: !key,
      },
    });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'Debug Resend (Preview)',
        html: '<p>Resend debug ok</p>',
      }),
    });

    const text = await r.text().catch(() => '');
    return res.status(r.ok ? 200 : 502).json({
      ok: r.ok,
      status: r.status,
      response: text.slice(0, 1000),
      from,
      to,
    });
  } catch (e: any) {
    return res.status(502).json({
      ok: false,
      error: String(e?.message || e),
      from,
      to,
    });
  }
}

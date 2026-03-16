import type { VercelRequest, VercelResponse } from '@vercel/node';

const WINDOW_MS = 60_000; // 1 min
const MAX_REQ = 60; // por IP / minuto

// memória simples (edge-safe o suficiente para este caso)
const hits = new Map<string, { count: number; ts: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now - entry.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }

  if (entry.count >= MAX_REQ) return false;

  entry.count += 1;
  return true;
}

export default function middleware(req: VercelRequest, res: VercelResponse) {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';

  if (!rateLimit(ip)) {
    return res.status(429).json({ ok: false });
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'none'");

  return;
}

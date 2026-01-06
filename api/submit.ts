import type { VercelRequest, VercelResponse } from '@vercel/node';

const TIMEOUT_MS = 8000;

/* =========================
   Utils
========================= */
function withTimeout<T>(promise: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

/* =========================
   Supabase
========================= */
async function saveToSupabase(payload: any): Promise<boolean> {
  try {
    const res = await withTimeout(
      fetch(`${process.env.SUPABASE_URL}/rest/v1/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      })
    );

    return res.ok;
  } catch {
    return false;
  }
}

/* =========================
   Resend
========================= */
async function sendEmail(payload: {
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const res = await withTimeout(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: payload.subject,
          html: payload.html,
        }),
      })
    );

    return res.ok;
  } catch {
    return false;
  }
}

/* =========================
   API Handler
========================= */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const {
      type,
      name,
      email,
      phone,
      company,
      role,
      expectations,
      message,
      portfolio,
      area,
    } = body || {};

    if (!type || !name || !email) {
      return res.status(400).json({ ok: false });
    }

    const submission = {
      type,
      name,
      email,
      phone: phone || null,
      company: company || null,
      role: role || null,
      expectations: expectations || null,
      message: message || null,
      portfolio: portfolio || null,
      area: area || null,
      created_at: new Date().toISOString(),
    };

    const [supabaseResult, emailResult] = await Promise.allSettled([
      saveToSupabase(submission),
      sendEmail({
        subject: `Novo contacto (${type}) – RSG Lisbon 2026`,
        html: `
          <p><b>Tipo:</b> ${type}</p>
          <p><b>Nome:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          ${phone ? `<p><b>Telefone:</b> ${phone}</p>` : ''}
          ${company ? `<p><b>Empresa:</b> ${company}</p>` : ''}
          ${role ? `<p><b>Cargo:</b> ${role}</p>` : ''}
        `,
      }),
    ]);

    const supabaseOk =
      supabaseResult.status === 'fulfilled' && supabaseResult.value === true;

    const emailOk =
      emailResult.status === 'fulfilled' && emailResult.value === true;

    const ok = supabaseOk || emailOk;

    return res.status(ok ? 200 : 502).json({ ok });
  } catch {
    return res.status(500).json({ ok: false });
  }
}

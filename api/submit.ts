import type { VercelRequest, VercelResponse } from "@vercel/node";

// Tipos do payload esperado vindo do frontend
type SubmissionPayload = {
  type: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  area?: string;
  portfolio?: string;
  message?: string;
  expectations?: string;
  status?: "Pending" | "InProgress" | "Completed" | "Deleted";
};

function json(res: VercelResponse, status: number, body: any) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function sendAdminEmail(payload: SubmissionPayload) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.warn("[EMAIL] Missing RESEND_API_KEY or ADMIN_EMAIL - skipping email");
    return;
  }

  const subject = `[RSG 2026] Novo registo: ${payload.type ?? "Lead"}`;
  const html = `
    <h2>Novo registo</h2>
    <ul>
      <li><b>Tipo:</b> ${payload.type ?? "-"}</li>
      <li><b>Nome:</b> ${payload.name ?? "-"}</li>
      <li><b>Email:</b> ${payload.email ?? "-"}</li>
      <li><b>Telefone:</b> ${payload.phone ?? "-"}</li>
      <li><b>Empresa:</b> ${payload.company ?? "-"}</li>
      <li><b>Cargo:</b> ${payload.role ?? "-"}</li>
      <li><b>Área:</b> ${payload.area ?? "-"}</li>
      <li><b>Portfolio:</b> ${payload.portfolio ?? "-"}</li>
      <li><b>Expectativas:</b> ${payload.expectations ?? "-"}</li>
      <li><b>Status:</b> ${payload.status ?? "Pending"}</li>
    </ul>
    <p><b>Mensagem:</b></p>
    <pre>${payload.message ?? "-"}</pre>
  `;

  // Ajusta o domínio/verificado no Resend conforme o que já tens aprovado.
  const from = "RSG Lisbon 2026 <no-reply@rsglisbon2026.com>";

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [ADMIN_EMAIL],
      subject,
      html,
    }),
  });

  if (!r.ok) {
    const details = await r.text().catch(() => "");
    console.error("[EMAIL] Failed to send:", details);
    return;
  }

  console.log("[EMAIL] Sent to admin");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    // Preflight CORS
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, {
      ok: false,
      error: "Server misconfigured: missing Supabase env vars",
    });
  }

  let payload: SubmissionPayload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as SubmissionPayload);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON body" });
  }

  // Validações mínimas
  if (!payload?.type || typeof payload.type !== "string") {
    return json(res, 400, { ok: false, error: "Missing field: type" });
  }
  if (!payload?.name || typeof payload.name !== "string") {
    return json(res, 400, { ok: false, error: "Missing field: name" });
  }
  if (!payload?.email || typeof payload.email !== "string") {
    return json(res, 400, { ok: false, error: "Missing field: email" });
  }

  // Força status seguro no backend
  const status: SubmissionPayload["status"] = "Pending";

  // Alinha com as colunas da tabela public.leads
  const row = {
    type: payload.type,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    company: payload.company ?? null,
    role: payload.role ?? null,
    message: payload.message ?? null,
    portfolio: payload.portfolio ?? null,
    status: "Pending",
  };

  const supabaseRes = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!supabaseRes.ok) {
    const text = await supabaseRes.text().catch(() => "");
    return json(res, 500, {
      ok: false,
      error: "Failed to save submission",
      details: text || `Supabase status ${supabaseRes.status}`,
    });
  }

  // Email (não falha o submit se der erro)
  try {
    await sendAdminEmail({ ...payload, status });
  } catch (e) {
    console.error("[EMAIL] Unexpected error:", e);
  }

  return json(res, 200, { ok: true });
}

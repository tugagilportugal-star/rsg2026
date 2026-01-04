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
};

// Helpers
function json(res: VercelResponse, status: number, body: any) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function isValidEmail(email: string) {
  // validação simples (suficiente para backend inicial)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS básico (caso uses domínio custom + preview)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });

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
  if (!payload?.email || typeof payload.email !== "string" || !isValidEmail(payload.email)) {
    return json(res, 400, { ok: false, error: "Invalid field: email" });
  }

  // Monta registro
  const row = {
    type: payload.type,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    company: payload.company ?? null,
    role: payload.role ?? null,
    area: payload.area ?? null,
    portfolio: payload.portfolio ?? null,
    message: payload.message ?? null,
    expectations: payload.expectations ?? null,
  };

  // Inserir no Supabase via REST (sem depender de SDK)
  // Isso evita instalar @supabase/supabase-js agora e mantém simples.
  const url = `${SUPABASE_URL}/rest/v1/submissions`;
  const supabaseRes = await fetch(url, {
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

  return json(res, 200, { ok: true });
}
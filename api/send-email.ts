import type { VercelRequest, VercelResponse } from "@vercel/node";

function json(res: VercelResponse, status: number, body: any) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

type Body = {
  // o frontend só manda estes campos
  submissionType?: string;
  name?: string;
  email?: string;
  message?: string;
  company?: string;
  role?: string;
  phone?: string;
  portfolio?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // vamos criar no próximo passo

  if (!RESEND_API_KEY) return json(res, 500, { ok: false, error: "Missing RESEND_API_KEY" });
  if (!ADMIN_EMAIL) return json(res, 500, { ok: false, error: "Missing ADMIN_EMAIL" });

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body;

  // Monta um email simples para o admin
  const subject = `[RSG 2026] Novo registo: ${body.submissionType ?? "Lead"}`;
  const html = `
    <h2>Novo registo</h2>
    <ul>
      <li><b>Tipo:</b> ${body.submissionType ?? "-"}</li>
      <li><b>Nome:</b> ${body.name ?? "-"}</li>
      <li><b>Email:</b> ${body.email ?? "-"}</li>
      <li><b>Telefone:</b> ${body.phone ?? "-"}</li>
      <li><b>Empresa:</b> ${body.company ?? "-"}</li>
      <li><b>Cargo:</b> ${body.role ?? "-"}</li>
      <li><b>Portfolio:</b> ${body.portfolio ?? "-"}</li>
    </ul>
    <p><b>Mensagem:</b></p>
    <pre>${body.message ?? "-"}</pre>
  `;

  const from = "RSG Lisbon 2026 <no-reply@rsglisbon2026.com>";

  const resendRes = await fetch("https://api.resend.com/emails", {
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

  if (!resendRes.ok) {
    const text = await resendRes.text().catch(() => "");
    return json(res, 500, { ok: false, error: "Failed to send email", details: text });
  }

  return json(res, 200, { ok: true });
}

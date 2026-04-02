import { Resend } from 'resend';

export type StepResult = { step: string; ok: boolean; detail?: string };

export type NotifyCtx = {
  sessionId: string;
  buyerName: string;
  buyerEmail: string;
  qty: number;
  totalCents: number;
  currency: string;
  participants: { name: string; email: string }[];
  isError: boolean;
};

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_NOTIFICATION_EMAILS || '')
    .split(',').map(e => e.trim()).filter(Boolean);
}

export async function notifyAdmins(
  resend: Resend,
  steps: StepResult[],
  ctx: NotifyCtx,
) {
  const adminEmails = getAdminEmails();
  if (!adminEmails.length) return;

  const total = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: (ctx.currency || 'eur').toUpperCase(),
  }).format(ctx.totalCents / 100);

  const icon = ctx.isError ? '🚨' : '✅';
  const subject = `${icon} RSG 2026 — ${ctx.isError ? 'ERRO' : 'Nova Venda'}: ${ctx.buyerName} · ${ctx.qty} bilhete${ctx.qty !== 1 ? 's' : ''} · ${total}`;

  const stepsHtml = steps.map(s => `
    <tr>
      <td style="padding:7px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;">${s.ok ? '✅' : '❌'}&nbsp;${s.step}</td>
      <td style="padding:7px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;color:${s.ok ? '#16a34a' : '#dc2626'};">${s.detail || ''}</td>
    </tr>`).join('');

  const participantsHtml = ctx.participants.map(p =>
    `<li style="margin-bottom:4px;">${p.name} — <a href="mailto:${p.email}" style="color:#003F59;">${p.email}</a></li>`
  ).join('');

  const html = `<div style="font-family:sans-serif;max-width:620px;margin:0 auto;color:#1f2937;">
    <div style="background:#003F59;padding:20px 28px;border-radius:10px 10px 0 0;">
      <p style="margin:0;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:.65;">Regional Scrum Gathering</p>
      <h2 style="margin:4px 0 0;color:#fff;font-size:20px;">${ctx.isError ? '🚨 Erro no Processamento' : '🎟️ Nova Venda'}</h2>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:20px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:14px;">
        <tr><td style="padding:5px 0;font-weight:600;width:130px;color:#6b7280;">Comprador</td><td>${ctx.buyerName} &lt;${ctx.buyerEmail}&gt;</td></tr>
        <tr><td style="padding:5px 0;font-weight:600;color:#6b7280;">Bilhetes</td><td>${ctx.qty}</td></tr>
        <tr><td style="padding:5px 0;font-weight:600;color:#6b7280;">Total</td><td><strong>${total}</strong></td></tr>
        <tr><td style="padding:5px 0;font-weight:600;color:#6b7280;">Stripe Session</td><td style="font-size:11px;color:#9ca3af;">${ctx.sessionId}</td></tr>
      </table>
      ${ctx.participants.length > 0 ? `<p style="font-weight:600;margin:0 0 6px;">Participantes:</p><ul style="margin:0 0 18px;padding-left:20px;font-size:13px;">${participantsHtml}</ul>` : ''}
      <p style="font-weight:600;margin:0 0 8px;">Passos do processamento:</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
        ${stepsHtml}
      </table>
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from: 'RSG Lisbon 2026 <rsg@rsglisbon.com>',
      to: adminEmails,
      subject,
      html,
    });
    console.log(`📬 Notificação admin enviada para: ${adminEmails.join(', ')}`);
  } catch (e: any) {
    console.error('⚠️ Admin notification error:', e.message);
  }
}

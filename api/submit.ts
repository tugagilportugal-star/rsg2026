import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const RESEND_FROM = process.env.RESEND_FROM || 'RSG Lisbon <no-reply@rsglisbon.com>';
const ADMIN_EMAIL = 'tugagilportugal@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const resend = new Resend(RESEND_API_KEY);

// O SEU TEMPLATE AGORA ESTÁ AQUI DENTRO (Não precisa mais ler arquivo do disco!)
const EMAIL_TEMPLATE_HTML = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"></head>
<body style="background-color: #f6f9fc; font-family: sans-serif; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc;">
        <tr><td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin: 20px auto; border-radius: 8px; border: 1px solid #e6ebf1;">
                <tr><td align="center" style="padding: 20px 0;"><img src="https://i.postimg.cc/d1j9F16j/logo-rsg-lisbon-dark.png" width="200" alt="RSG Lisbon 2026" /></td></tr>
                <tr><td style="padding: 0 32px;">
                    <h1 style="font-size: 24px; color: #001f3f;">Olá, {{name}},</h1>
                    <p style="font-size: 16px; line-height: 26px; color: #3c4858;">O seu lugar no <b>RSG Lisbon 2026</b> está confirmado! 🥳</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <h2 style="font-size: 20px; color: #001f3f;">🎟️ O Teu Bilhete</h2>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ticketId}}" alt="QR Code" />
                    </div>
                    <p style="font-size: 14px; color: #666; text-align: center;">Apresenta este QR Code no dia do evento.</p>
                </td></tr>
                <tr><td style="padding: 24px; text-align: center; font-size: 12px; color: #8898aa; border-top: 1px solid #e6ebf1;">TugÁgil Comunidade de Práticas</td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, name, email, phone, company, role, message, expectations } = body;

    // 1. Salvar no Supabase
    await supabase.from('leads').insert({ type, name, email, phone, company, role, message: message || expectations || null });

    // 2. Definir o E-mail
    let userSubject = 'Inscrição Confirmada! RSG Lisbon 2026 🚀';
    let userHtml = '';

    if (type === 'Patrocínios e Parcerias') {
        userSubject = 'Interesse em Patrocínio - RSG Lisbon 2026';
        userHtml = `<p>Olá ${name}, obrigado pelo contacto sobre parcerias!</p>`;
    } else {
        // AQUI ESTÁ A MÁGICA: Substituímos as variáveis no texto que está no código
        const ticketId = `RSG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        userHtml = EMAIL_TEMPLATE_HTML
          .replace(/{{name}}/g, name)
          .replace(/{{ticketId}}/g, ticketId);
    }

    // 3. Enviar
    const emailPromises = [
      resend.emails.send({ from: RESEND_FROM, to: email, subject: userSubject, html: userHtml })
    ];

    if (type !== 'Lista de Interessados') {
      emailPromises.push(
        resend.emails.send({ from: RESEND_FROM, to: ADMIN_EMAIL, subject: `${type}: ${name}`, html: `<p>Nova submissão de ${name} (${email})</p>` })
      );
    }

    await Promise.allSettled(emailPromises);
    return res.status(200).json({ ok: true });

  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
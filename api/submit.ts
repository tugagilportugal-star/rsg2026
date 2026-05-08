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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, name, email, phone, company, role, message, expectations } = body;

    // 1. Salvar no Supabase
    await supabase.from('leads').insert({ type, name, email, phone, company, role, message: message || expectations || null });

    // 2. Definir o E-mail
    let userSubject = '';
    let userHtml = '';

    if (type === 'Patrocínios e Parcerias') {
        userSubject = 'Interesse em Patrocínio - RSG Lisbon 2026';
        userHtml = `<p>Olá ${name}, obrigado pelo contacto sobre parcerias!</p>`;
    } else if (type === 'Priority List Sold Out' || type === 'Lista de Interessados') {
        userSubject = 'Estás na Priority List! RSG Lisbon 2026';
        userHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h2 style="color:#003F59;">Olá, ${name}!</h2>
          <p style="font-size:16px;color:#3c4858;">Ficaste registado(a) na <strong>Priority List</strong> do RSG Lisbon 2026.</p>
          <p style="font-size:16px;color:#3c4858;">Serás um dos primeiros a ser avisado(a) em caso de desistências ou novas vagas.</p>
          <p style="font-size:14px;color:#888;">Dúvidas? Responde a este email.</p>
        </div>`;
    } else {
        // Outros tipos de lead — email genérico sem bilhete
        userSubject = 'Recebemos a tua mensagem – RSG Lisbon 2026';
        userHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h2 style="color:#003F59;">Olá, ${name}!</h2>
          <p style="font-size:16px;color:#3c4858;">Recebemos a tua mensagem e entraremos em contacto em breve.</p>
        </div>`;
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
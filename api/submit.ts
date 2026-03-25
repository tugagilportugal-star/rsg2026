import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const RESEND_FROM = process.env.RESEND_FROM || 'RSG Lisbon <no-reply@rsglisbon.com>';
const ADMIN_EMAIL = 'tugagilportugal@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const resend = new Resend(RESEND_API_KEY);

function escapeHtml(str: string | null | undefined): string {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, name, email, phone, company, role, message, portfolio, expectations } = body;

    if (!type || !name || !email) return res.status(400).json({ ok: false, message: 'Missing fields' });

    // 1. Guardar no Supabase (Mantendo todos os teus campos)
    await supabase.from('leads').insert({
      type, name, email, phone, company, role, 
      message: message || expectations || null, 
      portfolio: portfolio || null 
    });

    // 2. Preparar E-mails
    let userSubject = '';
    let userHtml = '';

    if (type === 'Patrocínios e Parcerias') {
      userSubject = 'Recebemos o seu interesse em patrocinar o RSG Lisbon 2026!';
      userHtml = `<p>Olá ${name}, obrigado pelo interesse em ser parceiro.</p>`; // Aqui podes manter o teu getStyledEmail antigo se preferires
    } else if (type === 'Apoiadores') {
      userSubject = 'Obrigado pelo interesse em apoiar o RSG Lisbon 2026!';
      userHtml = `<p>Olá ${name}, recebemos a sua candidatura.</p>`;
    } else {
      // ESTE É O FLUXO DE COMPRA / LISTA PRINCIPAL (Onde entra o teu Template HTML)
      userSubject = 'Inscrição Confirmada! RSG Lisbon 2026 🚀';
      try {
        const templatePath = path.join(process.cwd(), 'api', 'email-template.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        const ticketId = `RSG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        userHtml = htmlTemplate
          .replace(/{{name}}/g, name)
          .replace(/{{ticketId}}/g, ticketId);
      } catch (e) {
        userHtml = `<p>Olá ${name}, confirmamos a tua inscrição no RSG Lisbon 2026!</p>`;
      }
    }

    // 3. Enviar E-mails (Utilizador e Admin)
    const emailPromises = [
      resend.emails.send({ from: RESEND_FROM, to: email, subject: userSubject, html: userHtml })
    ];

    if (type !== 'Lista de Interessados') {
      emailPromises.push(
        resend.emails.send({
          from: RESEND_FROM,
          to: ADMIN_EMAIL,
          subject: `${type}: ${name}`,
          html: `<p>Nova submissão de ${name} (${email}) para ${type}.</p>`
        })
      );
    }

    await Promise.allSettled(emailPromises);
    return res.status(200).json({ ok: true });

  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
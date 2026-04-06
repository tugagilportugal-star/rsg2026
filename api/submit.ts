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
        // 1. Criar o ID do bilhete
        const ticketId = `RSG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        try {
            // 2. Tentar ler o TEU ficheiro oficial que tem os links do Canva e Agenda
            const templatePath = path.join(process.cwd(), 'api', 'email-template.html');
            const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

            // 3. Aplicar os teus dados ao teu layout completo
            userHtml = htmlTemplate
                .replace(/{{name}}/g, name)
                .replace(/{{ticketId}}/g, ticketId);

            console.log("[SUCCESS] Usando o layout completo da Marina!");
        } catch (e) {
            // Plano B caso o ficheiro falhe (usa a variável simples como segurança)
            console.error("[ERROR] Falha ao ler ficheiro, usando fallback:", e);
            userHtml = `<h1>Olá ${name}</h1><p>O teu lugar está confirmado!</p>`;
        }
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
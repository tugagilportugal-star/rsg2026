import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// =======================
// ENV VARS (OBRIGATÓRIAS)
// =======================
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;

// remetentes (produção)
const RESEND_FROM =
  process.env.RESEND_FROM || 'RSG Lisbon <no-reply@rsglisbon.com>';
const RESEND_FROM_ADMIN =
  process.env.RESEND_FROM_ADMIN || RESEND_FROM;

// admin
const ADMIN_EMAIL = 'tugagilportugal@gmail.com';
const MEDIA_KIT_URL =
  'https://drive.google.com/file/d/1fBqF56U6BRa2dBEzGHWfwseAW4sQCkgx/view?usp=sharing';

// =======================
// CLIENTES
// =======================
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const resend = new Resend(RESEND_API_KEY);

// =======================
// TEMPLATE HTML
// =======================
const getStyledEmail = (
  title: string,
  bodyContent: string,
  showButton: boolean = false
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
    .header { background-color: #003F59; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { background-color: #F47A20; color: #fff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; }
    .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RSG Lisbon 2026</h1>
    </div>
    <div class="content">
      <h2 style="color:#F47A20">${title}</h2>
      ${bodyContent}

      ${
        showButton
          ? `
        <div style="text-align:center;margin-top:30px">
          <a href="${MEDIA_KIT_URL}" class="btn">Descarregar Media Kit</a>
        </div>
      `
          : ''
      }
    </div>
    <div class="footer">
      Enviado por TugÁgil • Regional Scrum Gathering Lisbon 2026
    </div>
  </div>
</body>
</html>
`;
};

// =======================
// HANDLER
// =======================
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('[SUBMIT] request received');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
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
      message,
      portfolio,
      expectations,
    } = body || {};

    if (!type || !name || !email) {
      return res
        .status(400)
        .json({ ok: false, message: 'Missing required fields' });
    }

    // =======================
    // 1. GUARDAR NO SUPABASE
    // =======================
    const { error: dbError } = await supabase.from('leads').insert({
      type,
      name,
      email,
      phone: phone || null,
      company: company || null,
      role: role || null,
      message: message || expectations || null,
      portfolio: portfolio || null,
    });

    if (dbError) {
      console.error('[SUBMIT] Supabase error', dbError);
      throw dbError;
    }

    // =======================
    // 2. PREPARAR EMAILS
    // =======================
    let userSubject = '';
    let userHtml = '';

    if (type === 'Patrocínios e Parcerias') {
      userSubject =
        'Recebemos o seu interesse em patrocinar o RSG Lisbon 2026!';
      userHtml = getStyledEmail(
        'Parceria em Análise',
        `<p>Olá <strong>${name}</strong>,</p>
         <p>Obrigado pelo interesse em patrocinar o evento.</p>
         <p>Enquanto aguarda, consulte o nosso Media Kit:</p>`,
        true
      );
    } else if (type === 'Apoiadores') {
      userSubject =
        'Obrigado pelo interesse em apoiar o RSG Lisbon 2026!';
      userHtml = getStyledEmail(
        'Candidatura Recebida',
        `<p>Olá <strong>${name}</strong>,</p>
         <p>Recebemos a sua candidatura e portfólio.</p>`,
        false
      );
    } else {
      userSubject = 'Está na lista! RSG Lisbon 2026 🚀';
      userHtml = getStyledEmail(
        'Inscrição Confirmada',
        `<p>Olá <strong>${name}</strong>,</p>
         <p>Confirmamos a sua inscrição na waitlist oficial.</p>`,
        false
      );
    }

    console.log('[EMAIL] sending', {
      user_to: email,
      user_from: RESEND_FROM,
      admin_from: RESEND_FROM_ADMIN,
      type,
    });

    const emailPromises: Promise<any>[] = [];

    // email ao utilizador
    emailPromises.push(
      resend.emails.send({
        from: RESEND_FROM,
        to: email,
        subject: userSubject,
        html: userHtml,
      })
    );

    // email ao admin
    if (type !== 'Lista de Interessados') {
      emailPromises.push(
        resend.emails.send({
          from: RESEND_FROM_ADMIN,
          to: ADMIN_EMAIL,
          subject: `${type}: ${name}`,
          html: `
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${phone || '-'}</p>
            <p><strong>Empresa:</strong> ${company || '-'}</p>
            <p><strong>Cargo:</strong> ${role || '-'}</p>
            <p><strong>Mensagem:</strong><br/>${
              message || expectations || '-'
            }</p>
          `,
        })
      );
    }

    const results = await Promise.allSettled(emailPromises);

    console.log(
      '[EMAIL] results',
      results.map((r) =>
        r.status === 'rejected'
          ? { status: 'error', reason: String(r.reason) }
          : { status: 'ok', id: (r.value as any)?.id }
      )
    );

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('[SUBMIT] fatal error', error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}

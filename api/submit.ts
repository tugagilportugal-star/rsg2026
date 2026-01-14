import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const ADMIN_EMAIL = 'tugagilportugal@gmail.com'; 
const MEDIA_KIT_URL = "https://drive.google.com/file/d/1fBqF56U6BRa2dBEzGHWfwseAW4sQCkgx/view?usp=sharing";

// Inicializar Clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const resend = new Resend(RESEND_API_KEY);

// --- FUNÇÃO PARA GERAR O LAYOUT BONITO (HTML) ---
const getStyledEmail = (title: string, bodyContent: string, showButton: boolean = false) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { background-color: #003F59; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px; }
        .button-container { text-align: center; margin-top: 30px; }
        .btn { background-color: #F47A20; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; }
        .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }
        strong { color: #003F59; }
        a.social-link { text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RSG Lisbon 2026</h1>
        </div>
        <div class="content">
          <h2 style="color: #F47A20; margin-top: 0;">${title}</h2>
          ${bodyContent}
          
          ${showButton ? `
            <div class="button-container">
              <a href="${MEDIA_KIT_URL}" class="btn">Descarregar Media Kit</a>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>Enviado por TugÁgil • Regional Scrum Gathering Lisbon 2026</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, name, email, phone, company, role, message, portfolio, expectations } = body || {};

    if (!type || !name || !email) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    // 1. SALVAR NO SUPABASE
    const { error: dbError } = await supabase
      .from('leads')
      .insert({
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
      console.error('Erro Supabase:', dbError);
      throw dbError;
    }

    // 2. PREPARAR EMAILS
    const emailPromises = [];

    // --- A. EMAIL PARA O UTILIZADOR (DESIGN BONITO) ---
    let userSubject = '';
    let userHtml = '';

    if (type === 'Patrocínios e Parcerias') {
      userSubject = 'Recebemos o seu interesse em patrocinar o RSG Lisbon 2026!';
      const content = `
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Obrigado pelo interesse em patrocinar o evento. A nossa equipa está a analisar o seu pedido e vamos entrar em contacto muito em breve.</p>
        <p>Enquanto aguarda, pode consultar o nosso Media Kit com todos os detalhes:</p>
      `;
      userHtml = getStyledEmail('Parceria em Análise', content, true);

    } else if (type === 'Apoiadores') {
      userSubject = 'Obrigado pelo interesse em apoiar o RSG Lisbon 2026!';
      const content = `
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Ficamos muito felizes com a sua vontade de contribuir com a comunidade e estar connosco no RSG Lisbon 2026.</p>
        <p>Recebemos os seus dados e o portfólio. Vamos analisar as necessidades do evento e falaremos consigo se houver um "match"!</p>
      `;
      userHtml = getStyledEmail('Candidatura Recebida', content, false);

 } else {
      // --- WAITLIST (Com Ícones Sociais) ---
      userSubject = 'Está na lista! RSG Lisbon 2026 🚀';
      const content = `
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Confirmamos a sua inscrição na <strong>Waitlist Oficial</strong>.</p>
        <p>Será o primeiro a saber quando os bilhetes "Early Bird" estiverem disponíveis.</p>
        
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;" />
        
        <p style="text-align: center; color: #666;">Acompanhe-nos nas redes sociais e fique atento(a) às novidades do evento:</p>
        
        <div class="social-icons">
          <a href="https://www.linkedin.com/showcase/scrum-gathering-regional-lisboa-2026/" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" title="LinkedIn" style="width: 36px; height: 36px;" />
          </a>
          
          <a href="https://www.instagram.com/rsglisbon/" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" title="Instagram" style="width: 36px; height: 36px;" />
          </a>
        </div>
      `;
      userHtml = getStyledEmail('Inscrição Confirmada', content, false);
    }

    // Envio Usuario
    emailPromises.push(
      resend.emails.send({
        from: 'RSG Lisbon <onboarding@resend.dev>',
        to: email,
        subject: userSubject,
        html: userHtml,
      })
    );

    // --- B. EMAIL PARA O ADMIN (NOTIFICAÇÃO SIMPLES) ---
    if (type !== 'Lista de Interessados') {
      const adminSubject = `${type}: ${name}`; 
      
      const adminHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #003F59;">Nova submissão: ${type}</h2>
          <hr/>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Telefone:</strong> ${phone}</p>
          <p><strong>Empresa:</strong> ${company || '-'}</p>
          <p><strong>Cargo:</strong> ${role || '-'}</p>
          <p><strong>Portfólio:</strong> ${portfolio || '-'}</p>
          <div style="background: #f4f4f5; padding: 15px; margin-top: 10px; border-radius: 5px;">
            <strong>Mensagem:</strong><br/>
            ${message || expectations || '-'}
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: 'RSG Bot <onboarding@resend.dev>',
          to: ADMIN_EMAIL,
          subject: adminSubject,
          html: adminHtml,
        })
      );
    }

    await Promise.allSettled(emailPromises);
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Erro API:', error);
    return res.status(500).json({ ok: false });
  }
}

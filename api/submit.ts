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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, name, email, phone, company, role, message, portfolio, expectations } = body || {};

    if (!type || !name || !email) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    // 1. SALVAR NO SUPABASE (Tabela leads)
    const { error: dbError } = await supabase
      .from('leads')
      .insert({
        type, // "Patrocínios e Parcerias", "Apoiadores" ou "Lista de Interessados"
        name,
        email,
        phone: phone || null,
        company: company || null,
        role: role || null,
        message: message || expectations || null, // Mapeia expectations da waitlist para message
        portfolio: portfolio || null,
      });

    if (dbError) {
      console.error('Erro Supabase:', dbError);
      throw dbError;
    }

    // 2. ENVIAR EMAILS (Lógica condicional)
    const emailPromises = [];

    // --- A. EMAIL PARA O UTILIZADOR (Confirmação) ---
    let userSubject = '';
    let userHtml = '';

    if (type === 'Patrocínios e Parcerias') {
      userSubject = 'Patrocínio | RSG Lisbon 2026!';
      userHtml = `
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Obrigado pelo interesse em patrocinar o Regional Scrum Gathering Lisbon 2026.</p>
        <p>A nossa equipa está a analisar o seu pedido e vamos entrar em contacto em breve para falarmos.</p>
        <p>Enquanto aguarda, aproveite para consultar o nosso <strong>Media Kit</strong> com todos os detalhes e níveis de parceria:</p>
        <p>
          <a href="${MEDIA_KIT_URL}" style="background-color: #F47A20; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Descarregar Media Kit
          </a>
        </p>
        <p>Cumprimentos,<br/>Equipa TugÁgil</p>
      `;
    } else if (type === 'Apoiadores') {
      userSubject = 'Apoio | RSG Lisbon 2026!';
      userHtml = `
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Ficamos muito felizes com a sua vontade de contribuir com a comunidade e estar connosco no RSG Lisbon 2026.</p>
        <p>Recebemos os seus dados e o link do seu portfólio. Vamos analisar as necessidades do evento e entraremos em contacto se houver um "match"!</p>
        <p>Cumprimentos,<br/>Equipa TugÁgil</p>
      `;
    } else {
      // Default: Waitlist (Lista de Interessados)
      userSubject = 'Está na lista! RSG Lisbon 2026 🚀';
      userHtml = `
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Confirmamos a sua inscrição na <strong>Waitlist Oficial</strong> do Regional Scrum Gathering Lisbon 2026.</p>
        <p>Serás o primeiro a saber quando os bilhetes "Early Bird" estiverem disponíveis com condições especiais.</p>
        <p>Até breve!<br/>Equipa TugÁgil</p>
      `;
    }

    // Enviar para o Utilizador
    emailPromises.push(
      resend.emails.send({
        from: 'RSG Lisbon <onboarding@resend.dev>', // Em PROD: usar 'no-reply@seudominio.com'
        to: email,
        subject: userSubject,
        html: userHtml,
      })
    );

    // --- B. EMAIL PARA O ADMIN (Apenas para Patrocínios e Apoiadores) ---
    // Não enviamos alerta de Waitlist para não encher a caixa de entrada
    if (type !== 'Lista de Interessados') {
      const adminSubject = `[NOVO LEAD] ${type}: ${name} - ${company || ''}`;
      const adminHtml = `
        <h2>Nova submissão recebida</h2>
        <ul>
          <li><strong>Tipo:</strong> ${type}</li>
          <li><strong>Nome:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Telefone:</strong> ${phone}</li>
          <li><strong>Empresa:</strong> ${company || '-'}</li>
          <li><strong>Cargo:</strong> ${role || '-'}</li>
          <li><strong>Portfólio:</strong> ${portfolio || '-'}</li>
        </ul>
        <h3>Mensagem:</h3>
        <p>${message || expectations || '-'}</p>
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

    // Aguarda todos os envios
    await Promise.allSettled(emailPromises);

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Erro API:', error);
    return res.status(500).json({ ok: false });
  }
}

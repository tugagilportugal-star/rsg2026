import { FormType } from '../types';
import { ASSETS } from '../config';

const LOCAL_STORAGE_KEY = 'rsg_lisbon_leads';

const saveToLocalDB = (type: FormType, data: any) => {
  const currentLeads = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  const newLead = {
    id: Date.now(),
    date: new Date().toLocaleString('pt-PT'),
    type,
    ...data,
    status: 'Captured'
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newLead, ...currentLeads]));
  return newLead;
};

export const getSubmissions = async () => {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
};

const sendEmailViaAPI = async (to: string, subject: string, html: string) => {
  console.log(`[Email Service] Enviando para: ${to}`);
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        apiKey: ASSETS.SERVICES.RESEND_API_KEY,
        from: 'onboarding@resend.dev'
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("[Email Service] Falha:", result);
      return { success: false, error: result };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("[Email Service] Erro de Rede:", error);
    return { success: false, error };
  }
};

export const saveSubmission = async (type: FormType, data: any) => {
  // 1. Salva localmente sempre para não perder dados
  saveToLocalDB(type, data);
  
  // 2. Prepara e-mail de Notificação para a Organização (Admin)
  const adminSubject = `[NOVO LEAD] ${type}: ${data.name}`;
  const adminHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #003F59; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Novo Lead RSG Lisbon 2026</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p><strong>Tipo de Conversão:</strong> ${type}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Telefone:</strong> ${data.phone || 'N/A'}</p>
        ${data.company ? `<p><strong>Empresa:</strong> ${data.company}</p>` : ''}
        ${data.message || data.expectations ? `<p><strong>Mensagem:</strong><br>${data.message || data.expectations}</p>` : ''}
      </div>
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        Este é um e-mail automático gerado pela Landing Page.
      </div>
    </div>
  `;

  // 3. Prepara e-mail de Confirmação para o Usuário
  const userSubject = `Confirmamos o seu interesse: Regional Scrum Gathering Lisbon 2026`;
  const userHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #009FDA; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Olá, ${data.name.split(' ')[0]}!</h1>
      </div>
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <p>Recebemos com sucesso o seu interesse no <strong>Regional Scrum Gathering Lisbon 2026</strong>.</p>
        <p>É incrível saber que queres fazer parte da nossa comunidade ágil em Lisboa.</p>
        <p><strong>O que acontece agora?</strong></p>
        <ul>
          <li>Ficaste registado na nossa lista prioritária.</li>
          <li>Serás o primeiro a saber quando os bilhetes "Early Bird" forem lançados.</li>
          <li>Enviaremos novidades exclusivas sobre speakers e o local do evento.</li>
        </ul>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://tugagil.com" style="background-color: #F47A20; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visitar TugÁgil</a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
        <p>Regional Scrum Gathering Lisbon 2026 | Organizado por TugÁgil</p>
        <p>Lisboa, Portugal</p>
      </div>
    </div>
  `;

  // Dispara os envios
  // NOTA: No plano gratuito (onboarding@resend.dev), o Resend só envia para o e-mail do dono da conta.
  // Por isso, se o usuário tiver um e-mail diferente, o e-mail dele pode não ser entregue até validar o domínio.
  
  const results = await Promise.all([
    sendEmailViaAPI(ASSETS.SERVICES.ADMIN_EMAIL, adminSubject, adminHtml),
    sendEmailViaAPI(data.email, userSubject, userHtml)
  ]);

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.warn("[Submission] Alguns e-mails falharam:", failed);
  }

  return { success: true };
};

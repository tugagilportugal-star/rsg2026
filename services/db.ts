
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
    status: 'Captured (Cloud Ready)'
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newLead, ...currentLeads]));
  return newLead;
};

export const getSubmissions = async () => {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
};

// --- NOVA LÓGICA DE ENVIO VIA SERVERLESS ---

const sendEmailViaAPI = async (to: string, subject: string, html: string) => {
  try {
    // Chamamos a NOSSA função, não a do Resend. 
    // O browser permite chamar o nosso próprio domínio sem erro de CORS.
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        apiKey: ASSETS.SERVICES.RESEND_API_KEY, // Em produção, isto ficaria guardado no Servidor (Environment Variables)
        from: ASSETS.SERVICES.FROM_EMAIL
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("[API Error] Falha ao comunicar com a Serverless Function:", error);
    return false;
  }
};

export const saveSubmission = async (type: FormType, data: any) => {
  saveToLocalDB(type, data);
  
  // Tenta enviar o e-mail via API interna
  await sendEmailViaAPI(
    ASSETS.SERVICES.ADMIN_EMAIL,
    `[RSG2026] Novo Lead: ${type}`,
    `<h2>Novo Lead Capturado</h2><p><strong>Nome:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p>`
  );

  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
};

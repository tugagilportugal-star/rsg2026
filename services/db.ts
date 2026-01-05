import { FormType } from '../types';
import { ASSETS } from '../config';

const supabaseUrl = ASSETS.SERVICES.SUPABASE_URL?.trim().replace(/\/$/, "");
const supabaseKey = ASSETS.SERVICES.SUPABASE_ANON_KEY?.trim();

const isSupabaseKey = supabaseKey?.startsWith("eyJ");
const hasSupabase = !!(supabaseUrl && supabaseKey && supabaseUrl.startsWith("http") && isSupabaseKey);

console.log("[DB Setup] URL:", supabaseUrl);
console.log("[DB Setup] Key presente:", !!supabaseKey);
console.log("[DB Setup] Key formato válido (Supabase):", isSupabaseKey);
console.log("[DB Setup] Supabase Habilitado:", hasSupabase);

const LOCAL_STORAGE_KEY = 'rsg_lisbon_leads';

export const getSubmissions = async () => {
  let cloudData: any[] = [];
  
  if (hasSupabase) {
    try {
      console.log("[DB] Tentando ler dados da Cloud...");
      const response = await fetch(`${supabaseUrl}/rest/v1/leads?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      console.log("[DB] Resposta leitura Cloud:", response.status);
      
      if (response.ok) {
        cloudData = await response.json();
      } else {
        const errorText = await response.text();
        console.error("[DB] Falha na resposta da Cloud:", errorText);
      }
    } catch (e) {
      console.error("[DB] Supabase Indisponível (Cloud):", e);
    }
  }

  const localData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  
  if (cloudData.length > 0) {
    return cloudData.map((d: any) => ({
      ...d,
      date: new Date(d.created_at).toLocaleString('pt-PT')
    }));
  }

  return localData;
};

export const deleteSubmission = async (id: any): Promise<void> => {
  if (hasSupabase) {
    try {
      console.log("[DB] Tentando deletar na Cloud id:", id);
      const response = await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      console.log("[DB] Resposta delete Cloud:", response.status);
    } catch (e) {
      console.error("[DB] Erro ao apagar na Cloud:", e);
    }
  }

  const currentLeads = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  const filtered = currentLeads.filter((l: any) => (l.id !== id && l.created_at !== id));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
};

export const saveSubmission = async (type: FormType, data: any) => {
  const payload = {
    type,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    company: data.company || '',
    role: data.role || data.area || '',
    message: data.message || data.expectations || '',
    portfolio: data.portfolio || '',
    created_at: new Date().toISOString()
  };

  console.log("[DB] Iniciando saveSubmission:", type);
  console.log("[DB] Payload preparado:", payload);

  if (hasSupabase) {
    try {
      console.log("[DB] Tentando POST para Supabase...");
      const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
      
      console.log("[DB] Status da Resposta Supabase:", response.status, response.statusText);
      
      if (!response.ok) {
        const errBody = await response.text();
        console.error("[DB] Erro detalhado do Supabase:", errBody);
      } else {
        console.log("[DB] Sucesso ao gravar na Cloud.");
        //  Enviar email após sucesso no Supabase
        await sendEmailNotification(type, payload);
      }
    } catch (e) {
      console.error("[DB] Erro de rede/fetch ao gravar na Cloud:", e);
    }
  } else {
    console.warn("[DB] Supabase não configurado ou chave inválida. Gravando apenas localmente.");
  }

  const currentLeads = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([{ 
    id: Date.now(), 
    date: new Date().toLocaleString('pt-PT'), 
    ...payload 
  }, ...currentLeads]));

  return { success: true };
};

//  Nova função para enviar email via Resend
const sendEmailNotification = async (type: FormType, payload: any) => {
  try {
    console.log("[EMAIL] Iniciando envio de email para:", payload.email);
    
    const emailContent = generateEmailHTML(type, payload);
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payload.email,
        subject: getEmailSubject(type),
        html: emailContent,
        apiKey: ASSETS.SERVICES.RESEND_API_KEY,
        from: ASSETS.SERVICES.FROM_EMAIL
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("[EMAIL] Erro ao enviar email:", result);
    } else {
      console.log("[EMAIL] Email enviado com sucesso:", result);
    }
  } catch (e) {
    console.error("[EMAIL] Erro catastrófico ao enviar email:", e);
  }
};

//  Função auxiliar para gerar o assunto do email
const getEmailSubject = (type: FormType): string => {
  switch (type) {
    case FormType.INTEREST:
      return ' Bem-vindo à Waitlist do RSG Lisbon 2026!';
    case FormType.SPONSOR:
      return ' Obrigado pelo seu Interesse em Patrocinar!';
    case FormType.SUPPORTER:
      return ' Obrigado por Querer Apoiar o RSG Lisbon!';
    default:
      return 'RSG Lisbon 2026 - Confirmação de Inscrição';
  }
};

//  Função auxiliar para gerar o HTML do email
const generateEmailHTML = (type: FormType, payload: any): string => {
  const baseHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #001428 0%, #0066cc 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
          .content { background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; }
          .content h2 { color: #001428; margin-top: 0; margin-bottom: 16px; font-size: 20px; }
          .content p { margin: 12px 0; font-size: 15px; line-height: 1.8; }
          .content ul { margin: 12px 0; padding-left: 20px; }
          .content li { margin: 8px 0; font-size: 15px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; padding-top: 20px; border-top: 1px solid #ddd; }
          .button { display: inline-block; padding: 12px 30px; background: #f47a20; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
          .divider { height: 1px; background: #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RSG Lisbon 2026</h1>
            <p>Regional Scrum Gathering</p>
          </div>
          <div class="content">
            <h2>Olá, ${payload.name}!</h2>
  `;

  let specificContent = '';
  
  if (type === FormType.INTEREST) {
    specificContent = `
      <p>Obrigado por se juntar à nossa Waitlist! </p>
      <p>Serás notificado(a) assim que:</p>
      <ul>
        <li>As inscrições abrirem oficialmente</li>
        <li>Novidades importantes sobre o evento forem anunciadas</li>
        <li>Ofertas exclusivas forem disponibilizadas</li>
      </ul>
      <p>Enquanto isso, segue-nos nas redes sociais para não perderes nada!</p>
    `;
  } else if (type === FormType.SPONSOR) {
    specificContent = `
      <p>Obrigado pelo interesse em patrocinar o RSG Lisbon 2026! </p>
      <p>Recebemos o teu contacto e entraremos em contacto em breve com mais detalhes sobre as oportunidades de patrocínio.</p>
      <p>Não podes esperar? Entra em contacto connosco: <strong>tuga@tugagil.com</strong></p>
    `;
  } else if (type === FormType.SUPPORTER) {
    specificContent = `
      <p>Obrigado por querer apoiar o RSG Lisbon 2026! </p>
      <p>Ficamos felizes em saber que tens interesse em colaborar! Analisaremos o teu portfólio e entraremos em contacto brevemente.</p>
      <p>Qualquer dúvida? Contacta-nos: <strong>tuga@tugagil.com</strong></p>
    `;
  }

  const closeHTML = `
            ${specificContent}
            <div class="divider"></div>
            <p style="color: #666; font-size: 14px;">
              <strong>Até 21 de Maio de 2026! </strong><br>
              TugÁgil & Regional Scrum Gathering Lisbon
            </p>
          </div>
          <div class="footer">
            <p>Regional Scrum Gathering é uma marca registada da Scrum Alliance, Inc.</p>
            <p><a href="https://tugagil.com" style="color: #0066cc; text-decoration: none;">Visita o nosso website</a></p>
            <p> 2026 TugÁgil. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return baseHTML + closeHTML;
};

export const testSupabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  if (!hasSupabase) {
    return { connected: false, error: 'Credenciais não configuradas' };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/leads?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok || response.status === 200 || response.status === 206) {
      return { connected: true };
    } else {
      const errorText = await response.text();
      return { connected: false, error: `Erro ${response.status}: ${errorText.substring(0, 100)}` };
    }
  } catch (e: any) {
    return { connected: false, error: e.message || 'Erro de conexão' };
  }
};

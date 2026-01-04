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

export { getSubmissions, deleteSubmission, saveSubmission };
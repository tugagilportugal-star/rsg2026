import { FormType } from '../types';
import { ASSETS } from '../config';

const supabaseUrl = ASSETS.SERVICES.SUPABASE_URL?.trim().replace(/\/$/, "");
const supabaseKey = ASSETS.SERVICES.SUPABASE_ANON_KEY?.trim();

// Verifica se a chave parece válida para o Supabase (começa com eyJ)
const isSupabaseKey = supabaseKey?.startsWith("eyJ");
const hasSupabase = !!(supabaseUrl && supabaseKey && supabaseUrl.startsWith("http") && isSupabaseKey);

const LOCAL_STORAGE_KEY = 'rsg_lisbon_leads';

export const getSubmissions = async () => {
  let cloudData = [];
  
  if (hasSupabase) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/leads?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        cloudData = await response.json();
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

export const deleteSubmission = async (id: any) => {
  if (hasSupabase) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
    } catch (e) {
      console.error("[DB] Erro ao apagar na Cloud:", e);
    }
  }

  const currentLeads = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  const filtered = currentLeads.filter((l: any) => (l.id === id || l.created_at === id ? false : true));
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

  if (hasSupabase) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("[DB] Erro ao gravar na Cloud:", e);
    }
  }

  // Grava localmente sempre para redundância
  const currentLeads = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([{ 
    id: Date.now(), 
    date: new Date().toLocaleString('pt-PT'), 
    ...payload 
  }, ...currentLeads]));

  return { success: true };
};
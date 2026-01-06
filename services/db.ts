import { FormType } from '../types';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

/* =========================
   PUBLIC (Forms)
========================= */
export async function saveSubmission(type: FormType, data: any): Promise<boolean> {
  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ type, ...data }),
  });

  if (!res.ok) return false;

  const body = await res.json().catch(() => null);
  return body?.ok === true;
}

/* =========================
   ADMIN (Basic Auth)
========================= */
const AUTH_KEY = 'rsg_admin_basic_auth';

function getAuthHeader(): string | null {
  return sessionStorage.getItem(AUTH_KEY);
}

export function setAuthHeader(authHeader: string) {
  sessionStorage.setItem(AUTH_KEY, authHeader);
}

export function clearAuthHeader() {
  sessionStorage.removeItem(AUTH_KEY);
}

export async function getSubmissions() {
  const auth = getAuthHeader();
  if (!auth) throw new Error('Not authenticated');

  const res = await fetch('/api/admin/leads', {
    headers: {
      Authorization: auth,
    },
  });

  if (res.status === 401) {
    clearAuthHeader();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error('Failed to load submissions');
  }

  return res.json();
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const auth = getAuthHeader();
  if (!auth) throw new Error('Not authenticated');

  const res = await fetch(`/api/admin/leads/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: auth,
    },
  });

  if (res.status === 401) {
    clearAuthHeader();
    throw new Error('Unauthorized');
  }

  return res.ok;
}

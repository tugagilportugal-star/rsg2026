import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export type AdminUser = {
  email: string;
  name: string | null;
  role: 'edit' | 'view';
};

export async function verifyAdminToken(authHeader: string): Promise<AdminUser | null> {
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user?.email) return null;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('email, name, role')
    .eq('email', user.email)
    .eq('active', true)
    .single();

  return adminUser as AdminUser | null;
}

export async function logAction(
  adminEmail: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  await supabase.from('admin_audit_log').insert({
    admin_email: adminEmail,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    details: details ?? null,
  });
}

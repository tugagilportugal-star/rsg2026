import React, { useEffect, useState } from 'react';
import { Download, Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type LeadStatus = 'Pending' | 'InProgress' | 'Completed' | 'Deleted';

type LeadRow = {
  id: string;
  created_at?: string | null;
  type?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  message?: string | null;
  portfolio?: string | null;
  status?: LeadStatus | string | null;
};

type TicketTypeRow = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity_total: number | null;
  quantity_sold: number | null;
  active: boolean | null;
  sort_order: number | null;
  created_at?: string | null;
};

type OrderRow = {
  id: string;
  created_at?: string | null;
  stripe_session_id?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  customer_country?: string | null;
  total_amount?: number | null;
  include_recording?: boolean | null;
  status?: string | null;
  invoice_id?: string | null;
  invoice_number?: string | null;
  credit_note_id?: string | null;
  credit_note_number?: string | null;
  credit_note_motivo?: string | null;
  refunded_at?: string | null;
};

type TicketRow = {
  id: string;
  created_at?: string | null;
  order_id?: string | null;
  ticket_type_id?: string | null;
  attendee_name?: string | null;
  attendee_email?: string | null;
  attendee_first_name?: string | null;
  attendee_last_name?: string | null;
  attendee_country?: string | null;
  attendee_job_function?: string | null;
  attendee_job_function_other?: string | null;
  attendee_nif?: string | null;
  attendee_company?: string | null;
  attendee_job_title?: string | null;
  attendee_tshirt?: string | null;
  sa_data_sharing_consent?: boolean | null;
  sa_marketing_consent?: boolean | null;
  privacy_consent?: boolean | null;
  checked_in?: boolean | null;
  check_in_at?: string | null;
};

type CouponRow = {
  id: string;
  code: string;
  email?: string | null;
  discount_percent: number | null;
  discount_amount: number | null;
  recording_only: boolean;
  single_use: boolean;
  active: boolean;
  created_at?: string | null;
  used_at?: string | null;
  used_by_order_id?: string | null;
};

type AuditLogRow = {
  id: string;
  created_at: string;
  admin_email: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  details?: any;
};

type AdminUserInfo = { email: string; name: string | null; role: 'edit' | 'view' };

type AdminTab = 'leads' | 'ticketTypes' | 'orders' | 'tickets' | 'coupons' | 'logs';

type TicketTypeForm = {
  name: string;
  price: string;
  currency: string;
  quantity_total: string;
  sort_order: string;
  active: boolean;
};

const STATUS_OPTIONS: LeadStatus[] = ['Pending', 'InProgress', 'Completed'];

function safe(val: unknown) {
  return val === null || val === undefined ? '' : String(val);
}

function formatDatePt(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-PT');
}


function formatMoneyEURFromCents(cents?: number | null) {
  if (cents === null || cents === undefined || Number.isNaN(Number(cents))) return '';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(cents) / 100);
}

function emptyTicketTypeForm(): TicketTypeForm {
  return {
    name: '',
    price: '',
    currency: 'eur',
    quantity_total: '',
    sort_order: '0',
    active: true,
  };
}

function toTicketTypeForm(row: TicketTypeRow): TicketTypeForm {
  return {
    name: row.name ?? '',
    price: String(row.price != null ? (row.price / 100).toFixed(2) : ''),
    currency: row.currency ?? 'eur',
    quantity_total: String(row.quantity_total ?? 0),
    sort_order: String(row.sort_order ?? 0),
    active: Boolean(row.active),
  };
}

const MOTIVOS_ESTORNO = ['Estorno por desistência da compra', 'Erro no valor faturado'];

export const AdminView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tab, setTab] = useState<AdminTab>('tickets');

  const [data, setData] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [ticketTypes, setTicketTypes] = useState<TicketTypeRow[]>([]);
  const [loadingTicketTypes, setLoadingTicketTypes] = useState(false);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<{ orderId: string; msg: string } | null>(null);

  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [creditNoteModal, setCreditNoteModal] = useState<{ orderId: string; orderLabel: string } | null>(null);
  const [creditNoteMotivo, setCreditNoteMotivo] = useState('');
  const [creditNoteCustom, setCreditNoteCustom] = useState('');
  const [generatingCreditNote, setGeneratingCreditNote] = useState(false);
  const [creditNoteError, setCreditNoteError] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState<{ orderId: string; orderLabel: string; hasCreditNote: boolean } | null>(null);
  const [refundMotivo, setRefundMotivo] = useState('');
  const [refundCustom, setRefundCustom] = useState('');
  const [markingRefund, setMarkingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)

  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponRow | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);

  const [couponForm, setCouponForm] = useState({
    code: '',
    email: '',
    discount_type: 'percent' as 'percent' | 'amount',
    discount_percent: '10',
    discount_amount: '',
    recording_only: false,
    single_use: true,
    active: true,
  });

  const [session, setSession] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [isTicketTypeModalOpen, setIsTicketTypeModalOpen] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketTypeRow | null>(null);
  const [ticketTypeForm, setTicketTypeForm] = useState<TicketTypeForm>(emptyTicketTypeForm());
  const [savingTicketType, setSavingTicketType] = useState(false);

  const token = session?.access_token ?? null;
  const authHeader = token ? `Bearer ${token}` : null;
  const canEdit = adminUser?.role === 'edit';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadAdminUser(session.access_token);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadAdminUser(session.access_token);
      } else {
        setAdminUser(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadAdminUser(accessToken: string) {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin?route=me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data);
      } else {
        setAuthError('O teu email não tem acesso ao admin. Contacta o administrador.');
        await supabase.auth.signOut();
      }
    } catch {
      setAuthError('Erro de ligação ao verificar acesso.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setAuthError(null);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  async function fetchLogs() {
    if (!authHeader) return;
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin?route=audit-log', {
        headers: { Authorization: authHeader },
      });
      if (res.ok) setLogs(await res.json());
    } finally {
      setLoadingLogs(false);
    }
  }

  async function fetchLeads() {
    if (!authHeader) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads', {
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError('Falha ao carregar leads');
        return;
      }

      const rows = (await res.json()) as LeadRow[];
      setData(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError('Erro inesperado ao carregar leads');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCoupons() {
    if (!authHeader) return;
    setLoadingCoupons(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setCoupons(data || []);
        setError(null);
      } else {
        setError(data?.error || 'Erro ao carregar coupons.');
      }
    } catch {
      setError('Erro inesperado ao carregar coupons.');
    } finally {
      setLoadingCoupons(false);
    }
  }

  async function fetchTicketTypes() {
    if (!authHeader) return;
    setLoadingTicketTypes(true);
    try {
      const res = await fetch('/api/admin/ticket-types', {
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError('Falha ao carregar lotes');
        return;
      }

      const rows = (await res.json()) as TicketTypeRow[];
      setTicketTypes(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError('Erro inesperado ao carregar lotes');
    } finally {
      setLoadingTicketTypes(false);
    }
  }

  async function fetchOrders() {
    if (!authHeader) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError('Falha ao carregar pagamentos');
        return;
      }

      const rows = (await res.json()) as OrderRow[];
      setOrders(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError('Erro inesperado ao carregar pagamentos');
    } finally {
      setLoadingOrders(false);
    }
  }

  async function generateInvoice(orderId: string) {
    if (!authHeader) return;
    setGeneratingInvoice(orderId);
    setInvoiceError(null);
    try {
      const res = await fetch('/api/admin/invoice', {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setInvoiceError({ orderId, msg: json.message || 'Erro desconhecido' });
      } else {
        await fetchOrders();
      }
    } catch (e: any) {
      setInvoiceError({ orderId, msg: e?.message || 'Erro de rede' });
    } finally {
      setGeneratingInvoice(null);
    }
  }

  async function generateCreditNote(orderId: string, motivo: string) {
    if (!authHeader) return;
    setGeneratingCreditNote(true);
    setCreditNoteError(null);
    try {
      const res = await fetch('/api/admin/credit-note', {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, motivo }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCreditNoteError(json.message || 'Erro desconhecido');
      } else {
        setCreditNoteModal(null);
        setCreditNoteMotivo('');
        setCreditNoteCustom('');
        await fetchOrders();
        await fetchTickets();
      }
    } catch (e: any) {
      setCreditNoteError(e?.message || 'Erro de rede');
    } finally {
      setGeneratingCreditNote(false);
    }
  }

  async function markAsRefunded(orderId: string, motivo?: string) {
    if (!authHeader) return;
    setMarkingRefund(true);
    setRefundError(null);
    try {
      const body: Record<string, unknown> = { order_id: orderId };
      if (motivo) body.motivo = motivo;
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setRefundError(json.message || 'Erro ao marcar estorno');
      } else {
        setRefundModal(null);
        setRefundMotivo('');
        setRefundCustom('');
        await fetchOrders();
        await fetchTickets();
      }
    } catch (e: any) {
      setRefundError(e?.message || 'Erro de rede');
    } finally {
      setMarkingRefund(false);
    }
  }

  async function fetchTickets() {
    if (!authHeader) return;
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError('Falha ao carregar tickets');
        return;
      }

      const rows = (await res.json()) as TicketRow[];
      setTickets(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError('Erro inesperado ao carregar tickets');
    } finally {
      setLoadingTickets(false);
    }
  }

  async function patchStatus(id: string, status: LeadStatus) {
    if (!authHeader) return;
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/admin/leads/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError('Falha ao atualizar status');
        return;
      }

      setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
      setError(null);
    } catch {
      setError('Erro inesperado ao atualizar status');
    } finally {
      setUpdatingId(null);
    }
  }

  async function softDeleteLead(id: string) {
    if (!authHeader) return;
    if (!confirm('Deseja marcar este lead como Deleted?')) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError('Falha ao marcar como Deleted');
        return;
      }

      setData((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
      setError(null);
    } catch {
      setError('Erro inesperado ao marcar como Deleted');
    } finally {
      setUpdatingId(null);
    }
  }

  function openCreateTicketTypeModal() {
    setEditingTicketType(null);
    setTicketTypeForm(emptyTicketTypeForm());
    setIsTicketTypeModalOpen(true);
    setError(null);
  }

  function openEditTicketTypeModal(row: TicketTypeRow) {
    setEditingTicketType(row);
    setTicketTypeForm(toTicketTypeForm(row));
    setIsTicketTypeModalOpen(true);
    setError(null);
  }

  function closeTicketTypeModal() {
    if (savingTicketType) return;
    setIsTicketTypeModalOpen(false);
    setEditingTicketType(null);
    setTicketTypeForm(emptyTicketTypeForm());
  }

  function updateTicketTypeForm<K extends keyof TicketTypeForm>(key: K, value: TicketTypeForm[K]) {
    setTicketTypeForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetCouponForm() {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      email: '',
      discount_type: 'percent',
      discount_percent: '10',
      discount_amount: '',
      recording_only: false,
      single_use: true,
      active: true,
    });
  }

  function openCreateCoupon() {
    resetCouponForm();
    setCouponModalOpen(true);
  }

  function openEditCoupon(row: CouponRow) {
    setEditingCoupon(row);
    const hasAmount = row.discount_amount != null;
    setCouponForm({
      code: row.code || '',
      email: row.email || '',
      discount_type: hasAmount ? 'amount' : 'percent',
      discount_percent: row.discount_percent != null ? String(row.discount_percent) : '10',
      discount_amount: hasAmount ? String(row.discount_amount! / 100) : '',
      recording_only: Boolean(row.recording_only),
      single_use: Boolean(row.single_use),
      active: Boolean(row.active),
    });
    setCouponModalOpen(true);
  }

  async function saveCoupon() {
    if (!authHeader) return;

    try {
      setSavingCoupon(true);

      const payload = {
        ...(editingCoupon ? { id: editingCoupon.id } : {}),
        code: couponForm.code,
        email: couponForm.email || null,
        discount_percent: couponForm.discount_type === 'percent' ? Number(couponForm.discount_percent) : null,
        discount_amount: couponForm.discount_type === 'amount' ? couponForm.discount_amount : null,
        recording_only: couponForm.recording_only,
        single_use: couponForm.single_use,
        active: couponForm.active,
      };

      const res = await fetch('/api/admin/coupons', {
        method: editingCoupon ? 'PATCH' : 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError(data?.error || 'Erro ao guardar coupon.');
        return;
      }

      setCouponModalOpen(false);
      resetCouponForm();
      fetchCoupons();
      setError(null);
    } catch {
      setError('Erro ao guardar coupon.');
    } finally {
      setSavingCoupon(false);
    }
  }

  async function deleteCoupon(id: string) {
    if (!authHeader) return;

    const confirmed = window.confirm('Tem a certeza que quer apagar este coupon?');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError(data?.error || 'Erro ao apagar coupon.');
        return;
      }

      fetchCoupons();
      setError(null);
    } catch {
      setError('Erro ao apagar coupon.');
    }
  }

  async function toggleCouponActive(row: CouponRow) {
    if (!authHeader) return;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: row.id,
          active: !row.active,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError(data?.error || 'Erro ao alterar estado do coupon.');
        return;
      }

      fetchCoupons();
      setError(null);
    } catch {
      setError('Erro ao alterar estado do coupon.');
    }
  }

  async function saveTicketType(e: React.FormEvent) {
    e.preventDefault();
    if (!authHeader) return;

    const priceEuros = Number(ticketTypeForm.price.replace(',', '.'));
    const price = Math.round(priceEuros * 100);
    const quantityTotal = Number(ticketTypeForm.quantity_total);
    const sortOrder = Number(ticketTypeForm.sort_order);

    if (!ticketTypeForm.name.trim()) {
      setError('Nome do lote é obrigatório');
      return;
    }

    if (!Number.isFinite(priceEuros) || priceEuros < 0) {
      setError('Preço inválido');
      return;
    }

    if (!Number.isInteger(quantityTotal) || quantityTotal < 0) {
      setError('Quantidade total inválida');
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setError('Ordem inválida');
      return;
    }

    setSavingTicketType(true);

    try {
      const payload = {
        name: ticketTypeForm.name.trim(),
        price,
        currency: ticketTypeForm.currency.trim().toLowerCase() || 'eur',
        quantity_total: quantityTotal,
        sort_order: sortOrder,
        active: ticketTypeForm.active,
      };

      const url = editingTicketType
        ? `/api/admin/ticket-types/${encodeURIComponent(editingTicketType.id)}`
        : '/api/admin/ticket-types';

      const method = editingTicketType ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError(json?.message || 'Falha ao guardar lote');
        return;
      }

      await fetchTicketTypes();
      closeTicketTypeModal();
      setError(null);
    } catch {
      setError('Erro inesperado ao guardar lote');
    } finally {
      setSavingTicketType(false);
    }
  }

  async function archiveTicketType(row: TicketTypeRow) {
    if (!authHeader) return;
    if (!confirm(`Deseja desativar o lote "${row.name}"?`)) return;

    setUpdatingId(row.id);

    try {
      const res = await fetch(`/api/admin/ticket-types/${encodeURIComponent(row.id)}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError(json?.message || 'Falha ao desativar lote');
        return;
      }

      await fetchTicketTypes();
      setError(null);
    } catch {
      setError('Erro inesperado ao desativar lote');
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleTicketTypeActive(row: TicketTypeRow) {
    if (!authHeader) return;

    setUpdatingId(row.id);

    try {
      const res = await fetch(`/api/admin/ticket-types/${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !row.active }),
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        await supabase.auth.signOut();
        setAdminUser(null);
        setError('Sessão expirada. Por favor volta a entrar.');
        return;
      }

      if (!res.ok) {
        setError(json?.message || 'Falha ao alterar estado do lote');
        return;
      }

      await fetchTicketTypes();
      setError(null);
    } catch {
      setError('Erro inesperado ao alterar estado do lote');
    } finally {
      setUpdatingId(null);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
    setSession(null);
    setSelected(null);
    setData([]);
    setTicketTypes([]);
    setOrders([]);
    setTickets([]);
    setCoupons([]);
    setLogs([]);
    setCouponModalOpen(false);
    setEditingCoupon(null);
    resetCouponForm();
    setError(null);
    setTab('tickets');
  };

  useEffect(() => {
    if (!adminUser) return;
    if (tab === 'leads') fetchLeads();
    if (tab === 'ticketTypes') fetchTicketTypes();
    if (tab === 'orders') { fetchOrders(); fetchTickets(); }
    if (tab === 'tickets') { fetchTickets(); fetchOrders(); }
    if (tab === 'coupons') fetchCoupons();
    if (tab === 'logs') fetchLogs();
  }, [adminUser?.email, tab]);

  function downloadCsv() {
    const escape = (v: unknown) => {
      const s = safe(v).replace(/\r?\n/g, ' ').trim();
      if (s.includes('"') || s.includes(',') || s.includes(';')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    if (tab === 'ticketTypes') {
      const headers = [
        'id',
        'sort_order',
        'name',
        'price',
        'currency',
        'quantity_total',
        'quantity_sold',
        'active',
        'created_at',
      ];

      const lines = [
        headers.join(','),
        ...ticketTypes.map((row) => headers.map((h) => escape((row as any)[h])).join(',')),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-types-rsg-2026-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (tab === 'orders') {
      const headers = [
        'id',
        'created_at',
        'status',
        'total_amount',
        'customer_name',
        'customer_email',
        'customer_country',
        'customer_nif',
        'invoice_id',
      ];

      const lines = [
        headers.join(','),
        ...orders.map((row) => headers.map((h) => escape((row as any)[h])).join(',')),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-rsg-2026-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (tab === 'tickets') {
      const headers = [
        'id',
        'created_at',
        'order_id',
        'ticket_type_id',
        'attendee_name',
        'attendee_email',
        'attendee_first_name',
        'attendee_last_name',
        'attendee_country',
        'attendee_job_function',
        'attendee_job_function_other',
        'attendee_nif',
        'attendee_company',
        'attendee_job_title',
        'attendee_tshirt',
        'sa_data_sharing_consent',
        'sa_marketing_consent',
        'privacy_consent',
        'checked_in',
        'check_in_at',
      ];

      const lines = [
        headers.join(','),
        ...tickets.map((row) => headers.map((h) => escape((row as any)[h])).join(',')),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets-rsg-2026-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (tab === 'coupons') {
      const headers = [
        'id',
        'created_at',
        'code',
        'email',
        'discount_percent',
        'single_use',
        'active',
        'used_at',
        'used_by_order_id',
      ];

      const lines = [
        headers.join(','),
        ...coupons.map((row) => headers.map((h) => escape((row as any)[h])).join(',')),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coupons-rsg-2026-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const headers = [
      'id',
      'created_at',
      'type',
      'name',
      'email',
      'phone',
      'company',
      'role',
      'portfolio',
      'status',
      'message',
    ];

    const lines = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => escape((row as any)[h])).join(',')),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-rsg-2026-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Admin</h2>
              <p className="text-sm text-gray-500">Acesso restrito</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {authError && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition"
          >
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.1c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.5-4.2 7.4-10.4 7.4-17.5z"/><path fill="#34A853" d="M24 48c6.5 0 12-2.2 16-5.9l-7.8-6c-2.2 1.5-5 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.4v6.2C6.4 42.7 14.6 48 24 48z"/><path fill="#FBBC05" d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5v-6.2H2.4C.9 16.6 0 20.2 0 24s.9 7.4 2.4 10.7l8.1-6.2z"/><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.3 30.4 0 24 0 14.6 0 6.4 5.3 2.4 13.3l8.1 6.2C12.4 13.7 17.7 9.5 24 9.5z"/></svg>
            Entrar com Google
          </button>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-2xl bg-gray-100 text-gray-600 font-semibold py-3 text-sm hover:bg-gray-200"
          >
            Voltar ao site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-4 rounded-3xl bg-gray-50 shadow-2xl overflow-hidden flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">RSG Lisbon 2026</h1>
            <p className="text-sm text-gray-500">Painel de administração</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {tab === 'ticketTypes' && (
              <button
                onClick={openCreateTicketTypeModal}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-darkBlue text-white px-4 py-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Novo lote
              </button>
            )}

            {tab === 'coupons' && (
              <button
                onClick={openCreateCoupon}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-darkBlue text-white px-4 py-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Novo coupon
              </button>
            )}

            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            <button
              onClick={() => {
                if (tab === 'leads') fetchLeads();
                if (tab === 'ticketTypes') fetchTicketTypes();
                if (tab === 'orders') fetchOrders();
                if (tab === 'tickets') fetchTickets();
                if (tab === 'coupons') fetchCoupons();
              }}
              className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-bold"
            >
              Recarregar
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-bold"
            >
              Logout
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </header>

        <div className="bg-white border-b px-6">
          <div className="flex gap-2 py-3 flex-wrap">
            {[
              { key: 'leads', label: 'Leads' },
              { key: 'ticketTypes', label: 'Lotes (Tickets)' },
              { key: 'orders', label: 'Orders (Pagamentos)' },
              { key: 'tickets', label: 'Tickets (Participantes)' },
              { key: 'coupons', label: 'Coupons' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key as AdminTab)}
                className={`px-4 py-2 rounded-xl text-sm font-black ${tab === item.key
                  ? 'bg-brand-darkBlue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {tab === 'ticketTypes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total de lotes"
                  value={String(ticketTypes.length)}
                />
                <StatCard
                  label="Lotes ativos"
                  value={String(ticketTypes.filter((t) => t.active).length)}
                />
                <StatCard
                  label="Bilhetes vendidos"
                  value={String(ticketTypes.reduce((sum, t) => sum + Number(t.quantity_sold ?? 0), 0))}
                />
                <StatCard
                  label="Disponíveis"
                  value={String(
                    ticketTypes.reduce(
                      (sum, t) =>
                        sum + Math.max(0, Number(t.quantity_total ?? 0) - Number(t.quantity_sold ?? 0)),
                      0
                    )
                  )}
                />
              </div>

              <div className="overflow-x-auto rounded-3xl bg-white border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <Th>Ordem</Th>
                      <Th>Lote</Th>
                      <Th>Preço</Th>
                      <Th>Total</Th>
                      <Th>Vendidos</Th>
                      <Th>Disponíveis</Th>
                      <Th>Estado</Th>
                      <Th>Ações</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTicketTypes ? (
                      <tr>
                        <Td colSpan={8}>A carregar lotes…</Td>
                      </tr>
                    ) : ticketTypes.length === 0 ? (
                      <tr>
                        <Td colSpan={8}>Sem lotes cadastrados.</Td>
                      </tr>
                    ) : (
                      ticketTypes.map((row) => {
                        const sold = Number(row.quantity_sold ?? 0);
                        const total = Number(row.quantity_total ?? 0);
                        const available = Math.max(0, total - sold);

                        return (
                          <tr key={row.id} className="border-t">
                            <Td>{safe(row.sort_order)}</Td>
                            <Td>
                              <div className="font-bold text-gray-900">{row.name}</div>
                              <div className="text-xs text-gray-500">{row.currency?.toUpperCase()}</div>
                            </Td>
                            <Td>{formatMoneyEURFromCents(row.price)}</Td>
                            <Td>{total}</Td>
                            <Td>{sold}</Td>
                            <Td>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${available > 0
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                                  }`}
                              >
                                {available}
                              </span>
                            </Td>
                            <Td>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${row.active
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                                  }`}
                              >
                                {row.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </Td>
                            <Td>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditTicketTypeModal(row)}
                                  className="inline-flex items-center gap-1 rounded-xl bg-gray-100 hover:bg-gray-200 px-3 py-2"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Editar
                                </button>

                                <button
                                  onClick={() => toggleTicketTypeActive(row)}
                                  disabled={updatingId === row.id}
                                  className="inline-flex items-center gap-1 rounded-xl bg-gray-100 hover:bg-gray-200 px-3 py-2 disabled:opacity-50"
                                >
                                  <Power className="w-4 h-4" />
                                  {row.active ? 'Desativar' : 'Ativar'}
                                </button>

                                <button
                                  onClick={() => archiveTicketType(row)}
                                  disabled={updatingId === row.id}
                                  className="inline-flex items-center gap-1 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remover
                                </button>
                              </div>
                            </Td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'leads' && (
            <div className="overflow-x-auto rounded-3xl bg-white border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <Th>Data</Th>
                    <Th>Tipo</Th>
                    <Th>Nome</Th>
                    <Th>Email</Th>
                    <Th>Telefone</Th>
                    <Th>Empresa</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <Td colSpan={8}>A carregar…</Td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <Td colSpan={8}>Sem leads.</Td>
                    </tr>
                  ) : (
                    data.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelected(row)}
                      >
                        <Td>{formatDatePt(row.created_at)}</Td>
                        <Td>{safe(row.type)}</Td>
                        <Td>{safe(row.name)}</Td>
                        <Td>{safe(row.email)}</Td>
                        <Td>{safe(row.phone)}</Td>
                        <Td>{safe(row.company)}</Td>
                        <Td>
                          <select
                            value={safe(row.status)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              patchStatus(row.id, e.target.value as LeadStatus);
                            }}
                            disabled={updatingId === row.id}
                            className="rounded-xl border border-gray-300 px-2 py-1"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </Td>
                        <Td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              softDeleteLead(row.id);
                            }}
                            className="text-red-600 font-bold"
                            disabled={updatingId === row.id}
                          >
                            Deleted
                          </button>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'orders' && (
            <div className="overflow-x-auto rounded-3xl bg-white border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <Th>Data</Th>
                    <Th>Cliente</Th>
                    <Th>Email</Th>
                    <Th>Total</Th>
                    <Th>Estado</Th>
                    <Th>Fatura</Th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <Td colSpan={6}>A carregar orders…</Td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <Td colSpan={6}>Sem orders.</Td>
                    </tr>
                  ) : (
                    orders.map((row) => (
                      <tr key={row.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(row)}>
                        <Td>{formatDatePt(row.created_at)}</Td>
                        <Td>{safe(row.customer_name)}</Td>
                        <Td>{safe(row.customer_email)}</Td>
                        <Td>{formatMoneyEURFromCents(row.total_amount)}</Td>
                        <Td>{safe(row.status)}</Td>
                        <Td>
                          {row.invoice_id
                            ? <span className="text-green-600 font-medium">Emitida</span>
                            : <span className="text-orange-500">Pendente</span>}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'tickets' && (
            <div className="overflow-x-auto rounded-3xl bg-white border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <Th>Data</Th>
                    <Th>Participante</Th>
                    <Th>Empresa / Cargo</Th>
                    <Th>NIF</Th>
                    <Th>T-Shirt</Th>
                    <Th>Consentimentos</Th>
                    <Th>Pagamento / Fatura</Th>
                    <Th>Check-in</Th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTickets ? (
                    <tr>
                      <Td colSpan={8}>A carregar tickets…</Td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <Td colSpan={8}>Sem tickets.</Td>
                    </tr>
                  ) : (
                    tickets.map((row) => {
                      const order = orders.find(o => o.id === row.order_id);
                      return (
                        <tr key={row.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTicket(row)}>
                          <Td>{formatDatePt(row.created_at)}</Td>
                          <Td>
                            <div className="font-medium text-gray-900">
                              {safe(row.attendee_name) ||
                                `${safe(row.attendee_first_name)} ${safe(row.attendee_last_name)}`.trim() ||
                                '—'}
                            </div>
                            <div className="text-xs text-gray-500">{safe(row.attendee_email) || '—'}</div>
                            <div className="text-xs text-gray-500">{safe(row.attendee_country) || '—'}</div>
                          </Td>
                          <Td>
                            <div>{safe(row.attendee_company) || '—'}</div>
                            <div className="text-xs text-gray-500">{safe(row.attendee_job_title) || '—'}</div>
                            <div className="text-xs text-gray-500">
                              {safe(row.attendee_job_function) || '—'}
                              {row.attendee_job_function_other ? ` · ${safe(row.attendee_job_function_other)}` : ''}
                            </div>
                          </Td>
                          <Td>{safe(row.attendee_nif) || '—'}</Td>
                          <Td>{safe(row.attendee_tshirt) || '—'}</Td>
                          <Td>
                            <div className="text-xs text-gray-700">
                              <div>Dados SA: {row.sa_data_sharing_consent ? '✔' : '—'}</div>
                              <div>Marketing SA: {row.sa_marketing_consent ? '✔' : '—'}</div>
                              <div>Privacidade: {row.privacy_consent ? '✔' : '—'}</div>
                            </div>
                          </Td>
                          <Td>
                            {order ? (
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500">{formatMoneyEURFromCents(order.total_amount)}</div>
                                {order.invoice_id
                                  ? <span className="text-xs text-green-600 font-medium">Fatura emitida</span>
                                  : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); generateInvoice(order.id); }}
                                      disabled={generatingInvoice === order.id}
                                      className="text-xs px-2 py-0.5 rounded bg-[#003F59] text-white hover:bg-[#005580] disabled:opacity-50"
                                    >
                                      {generatingInvoice === order.id ? 'A gerar…' : 'Gerar Fatura'}
                                    </button>
                                  )
                                }
                                {invoiceError?.orderId === order.id && (
                                  <div className="text-xs text-red-600 max-w-xs break-words">{invoiceError.msg}</div>
                                )}
                              </div>
                            ) : '—'}
                          </Td>
                          <Td>{row.checked_in ? `Sim · ${formatDatePt(row.check_in_at)}` : 'Não'}</Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'coupons' && (
            <div className="overflow-x-auto rounded-3xl bg-white border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <Th>Código</Th>
                    <Th>Email</Th>
                    <Th>Desconto</Th>
                    <Th>Gravação</Th>
                    <Th>Single Use</Th>
                    <Th>Ativo</Th>
                    <Th>Usado em</Th>
                    <Th>Data de uso</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCoupons ? (
                    <tr>
                      <Td colSpan={9}>A carregar coupons…</Td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <Td colSpan={9}>Sem coupons.</Td>
                    </tr>
                  ) : (
                    coupons.map((row) => (
                      <tr key={row.id} className="border-t">
                        <Td>{row.code}</Td>
                        <Td>{row.email || '—'}</Td>
                        <Td>
                          {row.discount_amount != null
                            ? `-€${(row.discount_amount / 100).toFixed(2)}`
                            : row.discount_percent != null
                            ? `-${row.discount_percent}%`
                            : '—'}
                        </Td>
                        <Td>{row.recording_only ? 'Sim' : 'Não'}</Td>
                        <Td>{row.single_use ? 'Sim' : 'Não'}</Td>
                        <Td>{row.active ? 'Ativo' : 'Inativo'}</Td>
                        <Td>{row.used_by_order_id || '—'}</Td>
                        <Td>{row.used_at ? formatDatePt(row.used_at) : '—'}</Td>
                        <Td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditCoupon(row)}
                              className="rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs font-bold"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => toggleCouponActive(row)}
                              className="rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs font-bold"
                            >
                              {row.active ? 'Desativar' : 'Ativar'}
                            </button>

                            <button
                              onClick={() => deleteCoupon(row.id)}
                              className="rounded-lg bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 text-xs font-bold"
                            >
                              Apagar
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedOrder && (() => {
          const orderTicket = tickets.find(t => t.order_id === selectedOrder.id);
          return (
            <div
              className="fixed inset-0 z-[210] bg-black/40 flex items-center justify-center p-4"
              onClick={() => setSelectedOrder(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#003F59]">Detalhes da Order</h3>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <dl className="space-y-2 text-sm">
                  {[
                    ['Data', formatDatePt(selectedOrder.created_at)],
                    ['Cliente', selectedOrder.customer_name || '—'],
                    ['Email', selectedOrder.customer_email || '—'],
                    ['NIF', orderTicket?.attendee_nif || '—'],
                    ['País', selectedOrder.customer_country || '—'],
                    ['Total', formatMoneyEURFromCents(selectedOrder.total_amount)],
                    ['Estado', selectedOrder.status || '—'],
                    ['Nº Fatura', selectedOrder.invoice_number || selectedOrder.invoice_id || 'Pendente'],
                    ['Stripe Session', selectedOrder.stripe_session_id || '—'],
                    ['ID', selectedOrder.id],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <dt className="w-28 text-gray-500 shrink-0">{label}</dt>
                      <dd className="text-gray-900 break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          );
        })()}

        {selectedTicket && (() => {
          const ticketOrder = orders.find(o => o.id === selectedTicket.order_id);
          return (
            <div
              className="fixed inset-0 z-[210] bg-black/40 flex items-center justify-center p-4"
              onClick={() => setSelectedTicket(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#003F59]">Detalhes do Ticket</h3>
                  <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <dl className="space-y-2 text-sm">
                  {([
                    ['Data', formatDatePt(selectedTicket.created_at)],
                    ['Nome', selectedTicket.attendee_name || `${selectedTicket.attendee_first_name || ''} ${selectedTicket.attendee_last_name || ''}`.trim() || '—'],
                    ['Email', selectedTicket.attendee_email || '—'],
                    ['País', selectedTicket.attendee_country || '—'],
                    ['NIF', selectedTicket.attendee_nif || '—'],
                    ['Empresa', selectedTicket.attendee_company || '—'],
                    ['Cargo', selectedTicket.attendee_job_title || '—'],
                    ['Função', selectedTicket.attendee_job_function
                      ? selectedTicket.attendee_job_function + (selectedTicket.attendee_job_function_other ? ` · ${selectedTicket.attendee_job_function_other}` : '')
                      : '—'],
                    ['T-Shirt', selectedTicket.attendee_tshirt || '—'],
                    ['Dados SA', selectedTicket.sa_data_sharing_consent ? 'Sim' : 'Não'],
                    ['Marketing SA', selectedTicket.sa_marketing_consent ? 'Sim' : 'Não'],
                    ['Privacidade', selectedTicket.privacy_consent ? 'Sim' : 'Não'],
                    ['Check-in', selectedTicket.checked_in ? `Sim · ${formatDatePt(selectedTicket.check_in_at)}` : 'Não'],
                    ['Pagamento', ticketOrder ? formatMoneyEURFromCents(ticketOrder.total_amount) : '—'],
                    ['Nº Fatura', ticketOrder?.invoice_number || ticketOrder?.invoice_id || 'Pendente'],
                    ['ID', selectedTicket.id],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <dt className="w-28 text-gray-500 shrink-0">{label}</dt>
                      <dd className="text-gray-900 break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
                {ticketOrder && (!ticketOrder.invoice_id || (ticketOrder.credit_note_id && !ticketOrder.refunded_at)) && (
                  <div className="mt-4">
                    <button
                      onClick={async () => { await generateInvoice(ticketOrder.id); setSelectedTicket(null); }}
                      disabled={generatingInvoice === ticketOrder.id}
                      className="w-full py-2 rounded-lg bg-[#003F59] text-white text-sm font-medium hover:bg-[#005580] disabled:opacity-50"
                    >
                      {generatingInvoice === ticketOrder.id ? 'A gerar fatura…' : 'Gerar Fatura'}
                    </button>
                    {invoiceError?.orderId === ticketOrder.id && (
                      <p className="text-red-600 text-xs mt-2">{invoiceError.msg}</p>
                    )}
                  </div>
                )}
                {ticketOrder?.invoice_id && !ticketOrder.credit_note_id && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        setSelectedTicket(null);
                        setCreditNoteMotivo('');
                        setCreditNoteCustom('');
                        setCreditNoteError(null);
                        setCreditNoteModal({
                          orderId: ticketOrder.id,
                          orderLabel: ticketOrder.invoice_number || ticketOrder.invoice_id || ticketOrder.id,
                        });
                      }}
                      className="w-full py-2 rounded-lg border border-orange-400 text-orange-600 text-sm font-medium hover:bg-orange-50"
                    >
                      Emitir Nota de Crédito
                    </button>
                  </div>
                )}
                {ticketOrder?.credit_note_id && (
                  <p className="mt-3 text-xs text-center text-gray-500">
                    NC emitida: <span className="font-medium text-gray-700">{ticketOrder.credit_note_number || ticketOrder.credit_note_id}</span>
                  </p>
                )}
                {ticketOrder?.invoice_id && !ticketOrder.refunded_at && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        setSelectedTicket(null);
                        setRefundError(null);
                        setRefundMotivo('');
                        setRefundCustom('');
                        setRefundModal({
                          orderId: ticketOrder.id,
                          orderLabel: ticketOrder.invoice_number || ticketOrder.invoice_id || ticketOrder.id,
                          hasCreditNote: !!ticketOrder.credit_note_id,
                        });
                      }}
                      className="w-full py-2 rounded-lg border border-red-400 text-red-600 text-sm font-medium hover:bg-red-50"
                    >
                      Emitir Estorno
                    </button>
                  </div>
                )}
                {ticketOrder?.refunded_at && (
                  <p className="mt-3 text-xs text-center text-gray-500">
                    Estornado em <span className="font-medium text-gray-700">{new Date(ticketOrder.refunded_at).toLocaleDateString('pt-PT')}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {creditNoteModal && (
          <div
            className="fixed inset-0 z-[210] bg-black/40 flex items-center justify-center p-4"
            onClick={() => { if (!generatingCreditNote) setCreditNoteModal(null); }}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#003F59]">Nota de Crédito</h3>
                <button onClick={() => setCreditNoteModal(null)} disabled={generatingCreditNote} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Fatura: <span className="font-medium text-gray-700">{creditNoteModal.orderLabel}</span>
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">Motivo</p>
                {['Troca / inclusão de NIF', 'Correção de dados do cliente', 'Estorno por desistência da compra', 'Erro no valor faturado', 'Outro'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="motivo"
                      value={opt}
                      checked={creditNoteMotivo === opt}
                      onChange={() => setCreditNoteMotivo(opt)}
                    />
                    {opt}
                  </label>
                ))}
                {creditNoteMotivo === 'Outro' && (
                  <textarea
                    className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Descreve o motivo…"
                    value={creditNoteCustom}
                    onChange={(e) => setCreditNoteCustom(e.target.value)}
                  />
                )}
              </div>
              {creditNoteError && (
                <p className="text-red-600 text-xs mb-3 break-words">{creditNoteError}</p>
              )}
              <button
                onClick={() => {
                  const motivo = creditNoteMotivo === 'Outro' ? creditNoteCustom.trim() : creditNoteMotivo;
                  if (!motivo) return;
                  generateCreditNote(creditNoteModal.orderId, motivo);
                }}
                disabled={generatingCreditNote || !creditNoteMotivo || (creditNoteMotivo === 'Outro' && !creditNoteCustom.trim())}
                className="w-full py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {generatingCreditNote ? 'A emitir…' : 'Confirmar Nota de Crédito'}
              </button>
            </div>
          </div>
        )}

        {refundModal && (
          <div
            className="fixed inset-0 z-[220] bg-black/40 flex items-center justify-center p-4"
            onClick={() => { if (!markingRefund) { setRefundModal(null); setRefundError(null); } }}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#003F59]">Emitir Estorno</h3>
                <button onClick={() => { setRefundModal(null); setRefundError(null); }} disabled={markingRefund} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Fatura: <span className="font-medium text-gray-700">{refundModal.orderLabel}</span>
              </p>
              {!refundModal.hasCreditNote && (
                <div className="mb-4">
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    Não existe nota de crédito para esta fatura. Será criada automaticamente ao validar o estorno no Stripe.
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Motivo da nota de crédito</p>
                  <div className="space-y-2">
                    {[...MOTIVOS_ESTORNO, 'Outro'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="refundMotivo"
                          value={opt}
                          checked={refundMotivo === opt}
                          onChange={() => setRefundMotivo(opt)}
                        />
                        {opt}
                      </label>
                    ))}
                    {refundMotivo === 'Outro' && (
                      <textarea
                        className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Descreve o motivo…"
                        value={refundCustom}
                        onChange={(e) => setRefundCustom(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              )}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                O sistema irá validar que o estorno foi efetuado no Stripe antes de registar.
              </div>
              {refundError && (
                <p className="text-red-600 text-xs mb-3 break-words">{refundError}</p>
              )}
              <button
                onClick={() => {
                  const motivo = refundMotivo === 'Outro' ? refundCustom.trim() : refundMotivo;
                  markAsRefunded(refundModal.orderId, !refundModal.hasCreditNote ? motivo : undefined);
                }}
                disabled={markingRefund || (!refundModal.hasCreditNote && (!refundMotivo || (refundMotivo === 'Outro' && !refundCustom.trim())))}
                className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {markingRefund ? 'A validar no Stripe…' : 'Validar e Registar Estorno'}
              </button>
            </div>
          </div>
        )}

        {couponModalOpen && (
          <div
            className="fixed inset-0 z-[210] bg-black/40 flex items-center justify-center p-4"
            onClick={() => {
              setCouponModalOpen(false);
              resetCouponForm();
            }}
          >
            <div
              className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {editingCoupon ? 'Editar coupon' : 'Novo coupon'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Defina código, email opcional, desconto e estado.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCouponModalOpen(false);
                    resetCouponForm();
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Código
                  </div>
                  <input
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                    }
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3"
                    placeholder="Ex: RSGTST20"
                  />
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Email
                  </div>
                  <input
                    value={couponForm.email}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, email: e.target.value })
                    }
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3"
                    placeholder="Opcional"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Tipo de desconto
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCouponForm({ ...couponForm, discount_type: 'percent' })}
                      className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-bold ${couponForm.discount_type === 'percent' ? 'border-brand-darkBlue bg-brand-darkBlue text-white' : 'border-gray-300 text-gray-700'}`}
                    >
                      Percentagem (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponForm({ ...couponForm, discount_type: 'amount' })}
                      className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-bold ${couponForm.discount_type === 'amount' ? 'border-brand-darkBlue bg-brand-darkBlue text-white' : 'border-gray-300 text-gray-700'}`}
                    >
                      Valor fixo (€)
                    </button>
                  </div>
                </div>

                {couponForm.discount_type === 'percent' ? (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      Desconto (%)
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={couponForm.discount_percent}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, discount_percent: e.target.value })
                      }
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      Valor de desconto (€)
                    </div>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={couponForm.discount_amount}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, discount_amount: e.target.value })
                      }
                      placeholder="Ex: 10.00"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={couponForm.recording_only}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, recording_only: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">Só para gravação</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={couponForm.single_use}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, single_use: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">Single use</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={couponForm.active}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, active: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCouponModalOpen(false);
                    resetCouponForm();
                  }}
                  className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCoupon}
                  disabled={savingCoupon}
                  className="rounded-xl bg-brand-darkBlue text-white px-4 py-2 text-sm font-bold disabled:opacity-60"
                >
                  {savingCoupon ? 'A guardar...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selected && (
          <div
            className="fixed inset-0 z-[210] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Lead</h3>
                  <p className="text-sm text-gray-500">
                    {formatDatePt(selected.created_at)} • {safe(selected.type)}
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Field label="Nome" value={safe(selected.name)} />
                <Field label="Email" value={safe(selected.email)} />
                <Field label="Telefone" value={safe(selected.phone)} />
                <Field label="Empresa" value={safe(selected.company)} />
                <Field label="Cargo" value={safe(selected.role)} />
                <Field label="Portfólio" value={safe(selected.portfolio)} />
              </div>

              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Mensagem
                </div>
                <div className="rounded-2xl bg-gray-50 border px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {safe(selected.message) || '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {isTicketTypeModalOpen && (
          <div
            className="fixed inset-0 z-[220] bg-black/40 flex items-center justify-center p-4"
            onClick={closeTicketTypeModal}
          >
            <div
              className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {editingTicketType ? 'Editar lote' : 'Novo lote'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Gere os lotes de bilhetes disponíveis para venda
                  </p>
                </div>

                <button
                  onClick={closeTicketTypeModal}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveTicketType} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome do lote"
                    value={ticketTypeForm.name}
                    onChange={(value) => updateTicketTypeForm('name', value)}
                    placeholder="Ex.: Early Bird"
                  />

                  <Input
                    label="Preço (€)"
                    value={ticketTypeForm.price}
                    onChange={(value) => updateTicketTypeForm('price', value.replace(/[^0-9.,]/g, ''))}
                    placeholder="42,80"
                  />

                  <Input
                    label="Moeda"
                    value={ticketTypeForm.currency}
                    onChange={(value) => updateTicketTypeForm('currency', value)}
                    placeholder="eur"
                  />

                  <Input
                    label="Quantidade total"
                    type="number"
                    value={ticketTypeForm.quantity_total}
                    onChange={(value) => updateTicketTypeForm('quantity_total', value)}
                    placeholder="100"
                  />

                  <Input
                    label="Ordem"
                    type="number"
                    value={ticketTypeForm.sort_order}
                    onChange={(value) => updateTicketTypeForm('sort_order', value)}
                    placeholder="0"
                  />

                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-3 rounded-2xl border border-gray-300 px-4 py-3 w-full">
                      <input
                        type="checkbox"
                        checked={ticketTypeForm.active}
                        onChange={(e) => updateTicketTypeForm('active', e.target.checked)}
                      />
                      <span className="font-medium text-gray-800">Lote ativo</span>
                    </label>
                  </div>
                </div>

                {editingTicketType && (
                  <div className="rounded-2xl bg-gray-50 border px-4 py-3 text-sm text-gray-600">
                    Vendidos: <strong>{editingTicketType.quantity_sold ?? 0}</strong>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeTicketTypeModal}
                    className="rounded-2xl bg-gray-100 text-gray-800 px-5 py-3 font-bold"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={savingTicketType}
                    className="rounded-2xl bg-brand-darkBlue text-white px-5 py-3 font-bold disabled:opacity-50"
                  >
                    {savingTicketType ? 'A guardar...' : editingTicketType ? 'Guardar alterações' : 'Criar lote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-bold text-gray-700">{children}</th>;
}

function Td({
  children,
  colSpan,
}: {
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td className="px-4 py-3 text-gray-800 align-top" colSpan={colSpan}>
      {children}
    </td>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white border p-5">
      <div className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-gray-900">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="rounded-2xl bg-gray-50 border px-4 py-3 text-sm text-gray-800">{value || '—'}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

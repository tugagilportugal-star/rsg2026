import React, { useEffect, useMemo, useState } from 'react';
import { X, Download, Trash2, Lock, User, Key } from 'lucide-react';
import { ASSETS } from '../config';

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
  customer_nif?: string | null;
  customer_country?: string | null;
  total_amount?: number | null; // cents
  status?: string | null; // paid/pending/failed...
  invoice_id?: string | null;
};

type TicketRow = {
  id: string;
  created_at?: string | null;
  order_id?: string | null;
  ticket_type_id?: string | null;

  attendee_name?: string | null;
  attendee_email?: string | null;
  attendee_company?: string | null;
  attendee_phone?: string | null;

  attendee_first_name?: string | null;
  attendee_last_name?: string | null;
  attendee_country?: string | null;
  attendee_job_function?: string | null;
  attendee_job_function_other?: string | null;

  checked_in?: boolean | null;
  check_in_at?: string | null;
};

type AdminTab = 'leads' | 'ticketTypes' | 'orders' | 'tickets';

const STATUS_OPTIONS: LeadStatus[] = ['Pending', 'InProgress', 'Completed'];

function formatDatePt(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-PT');
}

function safe(val: any) {
  return val === null || val === undefined ? '' : String(val);
}

function formatMoneyEURFromCents(cents?: number | null) {
  if (cents === null || cents === undefined) return '';
  const v = Number(cents);
  if (Number.isNaN(v)) return safe(cents);
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v / 100);
}

export const AdminView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Tabs
  const [tab, setTab] = useState<AdminTab>('leads');

  // Leads
  const [data, setData] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState<TicketTypeRow[]>([]);
  const [loadingTicketTypes, setLoadingTicketTypes] = useState(false);

  // Orders
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tickets
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const authHeader = useMemo(() => {
    if (!user || !pass) return null;
    return 'Basic ' + btoa(`${user}:${pass}`);
  }, [user, pass]);

  async function fetchLeads() {
    if (!authHeader) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads', {
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setError('Credenciais inválidas');
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

  async function fetchTicketTypes() {
    if (!authHeader) return;
    setLoadingTicketTypes(true);
    try {
      const res = await fetch('/api/admin/ticket-types', {
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setError('Credenciais inválidas / sessão expirada');
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
        setIsAuthenticated(false);
        setError('Credenciais inválidas / sessão expirada');
        return;
      }
      if (!res.ok) {
        setError('Falha ao carregar pagamentos (orders)');
        return;
      }
      const rows = (await res.json()) as OrderRow[];
      setOrders(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError('Erro inesperado ao carregar pagamentos (orders)');
    } finally {
      setLoadingOrders(false);
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
        setIsAuthenticated(false);
        setError('Credenciais inválidas / sessão expirada');
        return;
      }
      if (!res.ok) {
        setError('Falha ao carregar tickets (participantes)');
        return;
      }
      const rows = (await res.json()) as TicketRow[];
      setTickets(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError('Erro inesperado ao carregar tickets (participantes)');
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
        setIsAuthenticated(false);
        setError('Sessão expirada (401)');
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

  async function softDelete(id: string) {
    if (!authHeader) return;

    const ok = confirm('Deseja marcar este lead como Deleted?');
    if (!ok) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setError('Sessão expirada (401)');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !pass) {
      setError('Credenciais inválidas');
      return;
    }

    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser('');
    setPass('');
    setSelected(null);
    setData([]);
    setTicketTypes([]);
    setOrders([]);
    setTickets([]);
    setError(null);
    setTab('leads');
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    if (tab === 'leads') fetchLeads();
    if (tab === 'ticketTypes') fetchTicketTypes();
    if (tab === 'orders') fetchOrders();
    if (tab === 'tickets') fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authHeader, tab]);

  const downloadCsv = () => {
    // CSV muda conforme tab (pra não misturar colunas)
    if (tab === 'leads') {
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

      const escape = (v: any) => {
        const s = safe(v).replace(/\r?\n/g, ' ').trim();
        if (s.includes('"') || s.includes(',') || s.includes(';')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const lines = [
        headers.join(','),
        ...data.map((r) => headers.map((h) => escape((r as any)[h])).join(',')),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-rsg-2026-${new Date().toISOString().slice(0, 10)}.csv`;
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
        'currency',
        'stripe_session_id',
        'customer_name',
        'customer_email',
        'customer_country',
        'customer_nif',
        'invoice_id',
      ];

      const escape = (v: any) => {
        const s = safe(v).replace(/\r?\n/g, ' ').trim();
        if (s.includes('"') || s.includes(',') || s.includes(';')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const lines = [
        headers.join(','),
        ...orders.map((o) =>
          headers
            .map((h) => {
              if (h === 'currency') return 'eur';
              return escape((o as any)[h]);
            })
            .join(',')
        ),
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
        'attendee_company',
        'attendee_phone',
        'checked_in',
        'check_in_at',
      ];

      const escape = (v: any) => {
        const s = safe(v).replace(/\r?\n/g, ' ').trim();
        if (s.includes('"') || s.includes(',') || s.includes(';')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const lines = [
        headers.join(','),
        ...tickets.map((t) => headers.map((h) => escape((t as any)[h])).join(',')),
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

      const escape = (v: any) => {
        const s = safe(v).replace(/\r?\n/g, ' ').trim();
        if (s.includes('"') || s.includes(',') || s.includes(';')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const lines = [
        headers.join(','),
        ...ticketTypes.map((t) => headers.map((h) => escape((t as any)[h])).join(',')),
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
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[110] bg-brand-darkBlue/95 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto bg-brand-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-brand-blue" />
            </div>
            <h2 className="text-2xl font-black text-brand-darkBlue">Admin</h2>
            <p className="text-sm text-gray-500 mt-2">Acesso restrito</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="Utilizador"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="Password"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">{error}</div>
            )}

            <button type="submit" className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:opacity-95 transition">
              Entrar
            </button>

            <button type="button" onClick={onClose} className="w-full text-gray-500 font-bold py-2">
              Voltar ao site
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-gray-50 flex flex-col">
      <header className="bg-white border-b p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={ASSETS.TUGAGIL_LOGO} className="h-8" />
          <span className="font-black text-brand-darkBlue">RSG Lisbon 2026</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCsv}
            className="text-sm font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
            title="Exportar CSV"
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
            }}
            className="text-sm font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Recarregar
          </button>

          <button onClick={handleLogout} className="text-sm text-red-500 font-bold px-4 py-2">
            Logout
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            title="Fechar"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-2 py-3 flex-wrap">
          {[
            { key: 'leads', label: 'Leads' },
            { key: 'ticketTypes', label: 'Lotes (Tickets)' },
            { key: 'orders', label: 'Orders (Pagamentos)' },
            { key: 'tickets', label: 'Tickets (Participantes)' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as AdminTab)}
              className={`px-4 py-2 rounded-xl text-sm font-black ${
                tab === (t.key as AdminTab)
                  ? 'bg-brand-darkBlue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow overflow-auto p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
            {error}
          </div>
        )}

        {/* LEADS */}
        {tab === 'leads' && (
          <>
            {loading ? (
              <p className="text-center text-gray-400">A carregar…</p>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow border overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase border-b">
                        <th className="p-4 text-left">Data</th>
                        <th className="p-4 text-left">Tipo</th>
                        <th className="p-4 text-left">Nome</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Telefone</th>
                        <th className="p-4 text-left">Empresa</th>
                        <th className="p-4 text-left">Cargo</th>
                        <th className="p-4 text-left">Portfólio</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelected(row)}
                        >
                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{formatDatePt(row.created_at)}</td>
                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(row.type)}</td>
                          <td className="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{safe(row.name)}</td>
                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(row.email)}</td>
                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(row.phone)}</td>
                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(row.company)}</td>
                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(row.role)}</td>
                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                            {row.portfolio ? (
                              <a
                                href={row.portfolio}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-blue font-bold hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Abrir
                              </a>
                            ) : (
                              ''
                            )}
                          </td>

                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                            <select
                              className="border rounded-lg px-2 py-1 text-sm bg-white"
                              value={(row.status as any) || 'Pending'}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                patchStatus(row.id, e.target.value as LeadStatus);
                              }}
                              disabled={updatingId === row.id}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                softDelete(row.id);
                              }}
                              className="text-red-500 font-bold"
                              title="Marcar como Deleted"
                              disabled={updatingId === row.id}
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {data.length === 0 && (
                        <tr>
                          <td className="p-8 text-center text-gray-400" colSpan={10}>
                            Sem leads.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Detalhe / modal */}
                {selected && (
                  <div
                    className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                  >
                    <div
                      className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-6 border-b flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-black text-brand-darkBlue">Lead</h3>
                          <p className="text-sm text-gray-500">
                            {formatDatePt(selected.created_at)} • {safe(selected.type)}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelected(null)}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          title="Fechar"
                        >
                          <X className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      <div className="p-6 grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase text-gray-500 font-bold">Nome</label>
                          <input className="w-full border rounded-xl px-3 py-2" readOnly value={safe(selected.name)} />
                        </div>

                        <div>
                          <label className="text-xs uppercase text-gray-500 font-bold">Email</label>
                          <input className="w-full border rounded-xl px-3 py-2" readOnly value={safe(selected.email)} />
                        </div>

                        <div>
                          <label className="text-xs uppercase text-gray-500 font-bold">Telefone</label>
                          <input className="w-full border rounded-xl px-3 py-2" readOnly value={safe(selected.phone)} />
                        </div>

                        <div>
                          <label className="text-xs uppercase text-gray-500 font-bold">Empresa</label>
                          <input className="w-full border rounded-xl px-3 py-2" readOnly value={safe(selected.company)} />
                        </div>

                        <div>
                          <label className="text-xs uppercase text-gray-500 font-bold">Cargo</label>
                          <input className="w-full border rounded-xl px-3 py-2" readOnly value={safe(selected.role)} />
                        </div>

                        <div>
                          <label className="text-xs uppercase text-gray-500 font-bold">Portfólio</label>
                          <input className="w-full border rounded-xl px-3 py-2" readOnly value={safe(selected.portfolio)} />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs uppercase text-gray-500 font-bold">Mensagem</label>
                          <textarea
                            className="w-full border rounded-xl px-3 py-2 min-h-[120px]"
                            readOnly
                            value={safe(selected.message)}
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs uppercase text-gray-500 font-bold">Status</span>
                            <select
                              className="border rounded-lg px-3 py-2 text-sm bg-white"
                              value={(selected.status as any) || 'Pending'}
                              onChange={(e) => patchStatus(selected.id, e.target.value as LeadStatus)}
                              disabled={updatingId === selected.id}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => softDelete(selected.id)}
                            className="text-red-600 font-black px-4 py-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100"
                            disabled={updatingId === selected.id}
                          >
                            Marcar como Deleted
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* LOTES */}
        {tab === 'ticketTypes' && (
          <>
            {loadingTicketTypes ? (
              <p className="text-center text-gray-400">A carregar lotes…</p>
            ) : (
              <div className="bg-white rounded-xl shadow border overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase border-b">
                      <th className="p-4 text-left">Ordem</th>
                      <th className="p-4 text-left">Nome</th>
                      <th className="p-4 text-left">Preço</th>
                      <th className="p-4 text-left">Moeda</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-left">Vendidos</th>
                      <th className="p-4 text-left">Ativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketTypes.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{r.sort_order ?? ''}</td>
                        <td className="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{safe(r.name)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{r.price}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(r.currency)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{r.quantity_total ?? ''}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{r.quantity_sold ?? 0}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{r.active ? 'Sim' : 'Não'}</td>
                      </tr>
                    ))}

                    {ticketTypes.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-gray-400" colSpan={7}>
                          Sem lotes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <>
            {loadingOrders ? (
              <p className="text-center text-gray-400">A carregar pagamentos…</p>
            ) : (
              <div className="bg-white rounded-xl shadow border overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase border-b">
                      <th className="p-4 text-left">Data</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-left">Nome</th>
                      <th className="p-4 text-left">Email</th>
                      <th className="p-4 text-left">País</th>
                      <th className="p-4 text-left">NIF</th>
                      <th className="p-4 text-left">Invoice ID</th>
                      <th className="p-4 text-left">Stripe Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{formatDatePt(o.created_at)}</td>
                        <td className="p-4 text-sm font-semibold whitespace-nowrap">
                          {safe(o.status) || '—'}
                        </td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                          {formatMoneyEURFromCents(o.total_amount)}
                        </td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(o.customer_name)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(o.customer_email)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(o.customer_country)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(o.customer_nif)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(o.invoice_id)}</td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{safe(o.stripe_session_id)}</td>
                      </tr>
                    ))}

                    {orders.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-gray-400" colSpan={9}>
                          Sem pagamentos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* TICKETS */}
        {tab === 'tickets' && (
          <>
            {loadingTickets ? (
              <p className="text-center text-gray-400">A carregar participantes…</p>
            ) : (
              <div className="bg-white rounded-xl shadow border overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase border-b">
                      <th className="p-4 text-left">Data</th>
                      <th className="p-4 text-left">Check-in</th>
                      <th className="p-4 text-left">Nome</th>
                      <th className="p-4 text-left">Email</th>
                      <th className="p-4 text-left">País</th>
                      <th className="p-4 text-left">Função</th>
                      <th className="p-4 text-left">Função (Outros)</th>
                      <th className="p-4 text-left">Ticket Type ID</th>
                      <th className="p-4 text-left">Order ID</th>
                      <th className="p-4 text-left">Ticket ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{formatDatePt(t.created_at)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                          {t.checked_in ? `Sim (${formatDatePt(t.check_in_at)})` : 'Não'}
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {safe(t.attendee_name) ||
                            [t.attendee_first_name, t.attendee_last_name].filter(Boolean).join(' ')}
                        </td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(t.attendee_email)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(t.attendee_country)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(t.attendee_job_function)}</td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{safe(t.attendee_job_function_other)}</td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{safe(t.ticket_type_id)}</td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{safe(t.order_id)}</td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{safe(t.id)}</td>
                      </tr>
                    ))}

                    {tickets.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-gray-400" colSpan={10}>
                          Sem tickets.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

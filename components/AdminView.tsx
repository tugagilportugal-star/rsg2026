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

export const AdminView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

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

      // Atualiza tabela local
      setData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );

      // Atualiza detalhe aberto
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

      // Como o backend filtra Deleted, removemos da lista local também:
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
    setError(null);
  };

  useEffect(() => {
    if (isAuthenticated) fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authHeader]);

  const downloadCsv = () => {
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
      if (s.includes('"') || s.includes(',') || s.includes(';')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [
      headers.join(','),
      ...data.map((r) =>
        headers
          .map((h) => {
            const val = (r as any)[h];
            return escape(val);
          })
          .join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-rsg-2026-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[110] bg-brand-darkBlue/95 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl"
        >
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
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:opacity-95 transition"
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-gray-500 font-bold py-2"
            >
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

          <button onClick={fetchLeads} className="text-sm font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">
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

      <main className="flex-grow overflow-auto p-6">
        {loading ? (
          <p className="text-center text-gray-400">A carregar…</p>
        ) : (
          <>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
                {error}
              </div>
            )}

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
                      <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                        {formatDatePt(row.created_at)}
                      </td>

                      <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                        {safe(row.type)}
                      </td>

                      <td className="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {safe(row.name)}
                      </td>

                      <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                        {safe(row.email)}
                      </td>

                      <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                        {safe(row.phone)}
                      </td>

                      <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                        {safe(row.company)}
                      </td>

                      <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                        {safe(row.role)}
                      </td>

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
                      <h3 className="text-xl font-black text-brand-darkBlue">
                        Lead
                      </h3>
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
                      <textarea className="w-full border rounded-xl px-3 py-2 min-h-[120px]" readOnly value={safe(selected.message)} />
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
      </main>
    </div>
  );
};

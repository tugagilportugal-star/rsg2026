import React, { useEffect, useState } from 'react';
import { getSubmissions } from '../services/db';
import { deleteSubmission } from '../services/db';

import { 
  X, Download, Trash2, Lock, Key, 
  Globe, Database, Copy, Check, AlertTriangle
} from 'lucide-react';
import { ASSETS } from '../config';
import { FormType } from '../types';

export const AdminView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | FormType>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allEmailsCopied, setAllEmailsCopied] = useState(false);

  // Verificação em tempo real
  const isCloudConfigured = !!(ASSETS.SERVICES.SUPABASE_URL?.trim() && ASSETS.SERVICES.SUPABASE_ANON_KEY?.trim());

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('rsg_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSubmissions();
      setData(res);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ASSETS.SERVICES.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rsg_admin_auth', 'true');
      setError(false);
      loadData();
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Desejas remover este lead permanentemente?")) {
      await deleteSubmission(id);
      loadData();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllEmails = () => {
    const emails = filteredData.map(item => item.email).join(', ');
    navigator.clipboard.writeText(emails);
    setAllEmailsCopied(true);
    setTimeout(() => setAllEmailsCopied(false), 3000);
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = ["Data", "Tipo", "Nome", "Email", "Telefone", "Empresa", "Cargo", "Mensagem"];
    const rows = data.map(i => [
      i.date || new Date(i.created_at).toLocaleString('pt-PT'), 
      i.type, 
      i.name, 
      i.email, 
      i.phone, 
      i.company || 'N/A', 
      i.role || 'N/A', 
      (i.message || '').replace(/,/g, ';').replace(/\n/g, ' ')
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `leads_rsg_2026_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[110] bg-brand-darkBlue/98 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
          <div className="bg-brand-blue p-10 text-center text-white">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Portal Admin</h2>
            <p className="text-blue-100 text-sm mt-2 opacity-80 font-bold tracking-widest uppercase">Restrito TugÁgil</p>
          </div>
          <form onSubmit={handleLogin} className="p-10">
            <div className="relative mb-6">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduzir Senha"
                className={`w-full pl-12 pr-4 py-4 border rounded-2xl outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:ring-2 focus:ring-brand-blue'}`}
                autoFocus
              />
            </div>
            <button type="submit" className="w-full bg-brand-darkBlue text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95">
              Aceder ao Dashboard
            </button>
            <button onClick={onClose} type="button" className="w-full mt-6 text-gray-400 text-xs font-bold hover:text-gray-600 uppercase tracking-widest">Sair</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredData = activeFilter === 'ALL' ? data : data.filter(d => d.type === activeFilter);

  return (
    <div className="fixed inset-0 z-[110] bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
      <header className="bg-white border-b border-gray-200 p-5 flex flex-col md:flex-row justify-between items-center px-10 gap-6">
        <div className="flex items-center gap-5">
            <div className="bg-brand-darkBlue p-3 rounded-2xl shadow-lg">
              <img src={ASSETS.TUGAGIL_LOGO} className="h-6 w-auto" alt="TugÁgil" />
            </div>
            <div>
              <h1 className="font-black text-brand-darkBlue text-xl leading-none uppercase">Gestão de Leads</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">RSG Lisbon 2026</span>
                {isCloudConfigured ? (
                    <span className="flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black border border-emerald-200 shadow-sm">
                        <Globe className="w-3.5 h-3.5 animate-pulse"/> SUPABASE ATIVO
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black border border-amber-200 shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5"/> LOCAL STORAGE APENAS
                    </span>
                )}
              </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
              onClick={copyAllEmails}
              disabled={filteredData.length === 0}
              className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all border ${
                allEmailsCopied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-brand-blue border-brand-blue/20 hover:bg-brand-blue/5'
              } disabled:opacity-30`}
            >
                {allEmailsCopied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                {allEmailsCopied ? 'LISTA COPIADA!' : 'COPIAR EMAILS'}
            </button>
            <button 
              onClick={exportCSV} 
              disabled={data.length === 0}
              className="bg-brand-darkBlue hover:bg-black text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all disabled:opacity-30 active:scale-95"
            >
                <Download className="w-4 h-4"/> DESCARREGAR CSV
            </button>
            <button onClick={onClose} className="ml-2 p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all">
              <X className="w-8 h-8"/>
            </button>
        </div>
      </header>

      <main className="p-6 md:p-8 flex-grow overflow-hidden flex flex-col max-w-[1900px] mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total de Contactos</p>
                <p className="text-4xl font-black text-brand-darkBlue tracking-tighter">{data.length}</p>
            </div>
            <div className="col-span-1 lg:col-span-3 flex items-center gap-2 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
                <button onClick={() => setActiveFilter('ALL')} className={`flex-grow whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeFilter === 'ALL' ? 'bg-brand-darkBlue text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>TODOS OS LEADS</button>
                <button onClick={() => setActiveFilter(FormType.INTEREST)} className={`flex-grow whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeFilter === FormType.INTEREST ? 'bg-brand-blue text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>WAITLIST</button>
                <button onClick={() => setActiveFilter(FormType.SPONSOR)} className={`flex-grow whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeFilter === FormType.SPONSOR ? 'bg-brand-orange text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>PATROCÍNIOS</button>
                <button onClick={() => setActiveFilter(FormType.SUPPORTER)} className={`flex-grow whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeFilter === FormType.SUPPORTER ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>APOIADORES</button>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden flex-grow flex flex-col">
            <div className="overflow-auto flex-grow">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <th className="p-6 w-40">Data</th>
                            <th className="p-6 w-32">Categoria</th>
                            <th className="p-6">Nome Completo</th>
                            <th className="p-6">Contacto</th>
                            <th className="p-6">Empresa / Cargo</th>
                            <th className="p-6 text-right">Acções</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="p-24 text-center text-gray-400 font-bold uppercase text-xs animate-pulse">A carregar base de dados...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={6} className="p-24 text-center text-gray-300 italic">Nenhum registo encontrado para este filtro.</td></tr>
                        ) : filteredData.map((item) => (
                            <tr key={item.id || item.created_at} className="hover:bg-blue-50/40 transition-all group">
                                <td className="p-6">
                                  <span className="text-gray-900 text-[11px] font-black block">
                                    {item.date || new Date(item.created_at).toLocaleDateString('pt-PT')}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {new Date(item.created_at).toLocaleTimeString('pt-PT', {hour:'2-digit', minute:'2-digit'})}
                                  </span>
                                </td>
                                <td className="p-6">
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border tracking-wider ${
                                        item.type === FormType.SPONSOR ? 'bg-orange-50 text-brand-orange border-orange-100' :
                                        item.type === FormType.SUPPORTER ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                        'bg-blue-50 text-brand-blue border-blue-100'
                                    }`}>
                                        {item.type.split(' ')[0].toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-6 font-black text-brand-darkBlue text-sm">
                                  {item.name}
                                </td>
                                <td className="p-6">
                                    <button 
                                      onClick={() => copyToClipboard(item.email, `e-${item.id}`)}
                                      className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-brand-blue transition-colors group/copy"
                                    >
                                      {item.email}
                                      {copiedId === `e-${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 text-gray-300"/>}
                                    </button>
                                    <span className="text-[10px] text-gray-400 font-bold block mt-1">{item.phone}</span>
                                </td>
                                <td className="p-6">
                                    <span className="text-xs font-black text-gray-800 block uppercase tracking-tight">{item.company || 'PARTICULAR'}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{item.role || 'Geral'}</span>
                                </td>
                                <td className="p-6 text-right">
                                    <button 
                                      onClick={() => handleDelete(item.id || item.created_at)} 
                                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title="Apagar Lead"
                                    >
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};
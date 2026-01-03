
import React, { useEffect, useState } from 'react';
import { getSubmissions } from '../services/db';
import { X, Download, Trash2, Mail, Lock, Key, ChevronRight, AlertCircle } from 'lucide-react';
import { ASSETS } from '../config';

export const AdminView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Verificar se já existe sessão ativa
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('rsg_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getSubmissions();
    setData(res);
    setLoading(false);
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

  const clearLeads = () => {
    if(confirm("Tem certeza que deseja apagar todos os leads locais?")) {
        localStorage.removeItem('rsg_lisbon_leads');
        loadData();
    }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = ["Data", "Tipo", "Nome", "Email", "Telefone", "Empresa"];
    const rows = data.map(i => [i.date, i.type, i.name, i.email, i.phone || '', i.company || '']);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_rsg_2026.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[110] bg-brand-darkBlue/95 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
          <div className="bg-brand-blue p-8 text-center text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Área Restrita</h2>
            <p className="text-blue-100 text-sm mt-2">Introduza a chave de acesso TugÁgil</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha Administrativa"
                  autoFocus
                  className={`block w-full pl-10 pr-3 py-4 border ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all`}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  Senha incorreta. Tente novamente.
                </div>
              )}
            </div>
            
            <button 
              type="submit"
              className="w-full bg-brand-darkBlue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Aceder ao Painel
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
          
          <div className="px-8 pb-8 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Acesso Monitorizado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 flex flex-col p-4 md:p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-brand-darkBlue">Gestão RSG 2026</h2>
            <p className="text-gray-500">Captura de leads e administração do evento.</p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => {
                    sessionStorage.removeItem('rsg_admin_auth');
                    setIsAuthenticated(false);
                }} 
                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-brand-orange transition-colors"
            >
                Sair
            </button>
            <button onClick={onClose} className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500 transition-colors">
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-brand-orange">
            <span className="text-xs uppercase font-bold text-gray-400">Total Leads</span>
            <div className="text-3xl font-black text-brand-darkBlue">{data.length}</div>
          </div>
          
          <button 
            onClick={exportCSV}
            className="bg-brand-blue text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md active:scale-95"
          >
            <Download className="w-5 h-5" /> Exportar CSV
          </button>

          <button 
            onClick={clearLeads}
            className="bg-white text-red-500 border border-red-100 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all shadow-md active:scale-95"
          >
            <Trash2 className="w-5 h-5" /> Limpar Base Local
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-grow border border-gray-200 flex flex-col">
          <div className="overflow-x-auto flex-grow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Info Extra</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Carregando dados...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">Nenhum lead capturado ainda. Teste o formulário na página!</td></tr>
                ) : data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-brand-blue border border-blue-100">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-darkBlue">
                        {item.name}
                        {item.company && <div className="text-[10px] text-gray-400 font-normal">{item.company}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {item.email}</span>
                            <span className="text-[10px]">{item.phone}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={item.expectations || item.message}>
                            {item.expectations || item.message || '-'}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-xs text-center">
            <strong>Segurança Local:</strong> Os dados são armazenados no seu browser. Ao limpar a base local, os registros desaparecem deste dispositivo.
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { getSubmissions } from '../services/db';
import { X, Download, Trash2, Mail } from 'lucide-react';

export const AdminView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const res = await getSubmissions();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 flex flex-col p-4 md:p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-brand-darkBlue">Gestão RSG 2026</h2>
            <p className="text-gray-500">Captura de leads em ambiente de demonstração (LocalStorage).</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-brand-orange">
            <span className="text-xs uppercase font-bold text-gray-400">Total Leads</span>
            <div className="text-3xl font-black text-brand-darkBlue">{data.length}</div>
          </div>
          
          <button 
            onClick={exportCSV}
            className="bg-brand-blue text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md"
          >
            <Download className="w-5 h-5" /> Exportar CSV
          </button>

          <button 
            onClick={clearLeads}
            className="bg-white text-red-500 border border-red-100 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all shadow-md"
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
            <strong>Nota de Programador:</strong> Os dados acima estão guardados apenas no seu navegador atual. Em produção, conectamos este fluxo ao Supabase ou Airtable para persistência global.
        </div>
      </div>
    </div>
  );
};

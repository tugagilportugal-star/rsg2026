import React, { useEffect, useState } from 'react';
import { Section } from '../components/UIComponents';
import { Bell, Check, CheckCircle2, Sparkles, Gift } from 'lucide-react';
import { useTicketStatus } from '../hooks/useTicketStatus';

interface TicketsProps {
  onOpenTicketModal: () => void;
}

type TicketTypeData = {
  id: string; name: string; price: number; currency: string; active: boolean;
  quantity_total: number | null; quantity_sold: number | null; sort_order: number | null;
};

const WaitlistForm: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', expectations: '' });
  const[status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'Lista de Interessados', ...form }) });
      setStatus(res.ok ? 'success' : 'error');
    } catch { setStatus('error'); }
  };

  if (status === 'success') return (<div className="text-center py-6"><CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" /><p className="text-lg font-bold text-brand-darkBlue">Está na lista!</p></div>);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div><label className="block text-sm font-medium mb-1">Nome <span className="text-red-500">*</span></label><input required type="text" onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg p-2.5" /></div>
        <div><label className="block text-sm font-medium mb-1">E-mail <span className="text-red-500">*</span></label><input required type="email" onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg p-2.5" /></div>
        <div><label className="block text-sm font-medium mb-1">WhatsApp <span className="text-red-500">*</span></label><input required type="tel" onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg p-2.5" /></div>
        <div><label className="block text-sm font-medium mb-1">Empresa</label><input type="text" onChange={e => setForm({...form, company: e.target.value})} className="w-full border rounded-lg p-2.5" /></div>
      </div>
      <button type="submit" className="w-full rounded-[20px] bg-brand-orange text-white py-3 text-lg font-black mt-4">Entrar na Waitlist</button>
    </form>
  );
};

export const Tickets: React.FC<TicketsProps> = ({ onOpenTicketModal }) => {
  const { hasActiveLot, isLoading: statusLoading } = useTicketStatus();
  const [ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch('/api/get-ticket');
        if (res.ok) setTicketData(await res.json());
      } catch (err) { console.error(err); } finally { setLoadingTicket(false); }
    }
    fetchTicket();
  },[]);

  const showTicketBox = !statusLoading && hasActiveLot;

  const ticketBenefits =[
    { text: "Acesso completo ao evento", isBonus: false },
    { text: "Kit de Boas-vindas + T-Shirt Oficial", isBonus: false },
    { text: "Scrum Education Units (SEUs)", isBonus: false },
    { text: "Certificado de Participação Digital", isBonus: false },
    { text: "Acesso à gravação do evento*", isBonus: false },
    { text: <span className="font-bold">1 ano de <a href="https://www.agile-academy.com/pt/e-learning/#elearning-overview" target="_blank" rel="noreferrer" className="text-brand-orange hover:underline">Agile Academy</a> (~€249)</span>, isBonus: true },
    { text: <span className="font-bold">Acesso Kanban+ <a href="https://kanban.plus/" target="_blank" rel="noreferrer" className="text-brand-orange hover:underline">Kanban+</a> (~€85)</span>, isBonus: true }
  ];

  return (
    <Section id="tickets" className="relative overflow-hidden bg-white">
      <div className="text-center mb-8"><h2 className="text-4xl font-black text-brand-darkBlue">Garanta o seu lugar</h2></div>
      <div className="max-w-[620px] mx-auto relative">
        
        {!showTicketBox && !statusLoading && (
          <div className="relative bg-white border-2 border-brand-darkBlue rounded-[32px] p-8 shadow-xl"><WaitlistForm /></div>
        )}

        {showTicketBox && (
          <div className="w-full">
            <div className="relative bg-white border-2 border-brand-orange rounded-[32px] shadow-xl p-8">
              <div className="text-center mb-6"><div className="text-5xl font-black text-brand-darkBlue">42,80€</div></div>
              <div className="mt-4 w-full flex flex-col gap-y-3 mb-6">
                {ticketBenefits.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="rounded-full p-1.5 bg-sky-100 flex-shrink-0 mt-0.5">
                      {item.isBonus ? <Gift className="w-4 h-4 text-brand-orange" /> : <Check className="w-4 h-4 text-sky-500" />}
                    </div>
                    <div className="text-gray-600">{item.text}</div>
                  </div>
                ))}
              </div>
              <button onClick={onOpenTicketModal} disabled={loadingTicket || !ticketData?.active} className="w-full rounded-[20px] bg-brand-orange text-white py-3 text-xl font-black shadow-lg">Comprar Bilhete</button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};

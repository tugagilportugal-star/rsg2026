import React, { useEffect, useState } from 'react';
import { Section } from '../components/UIComponents';
import { Bell, Check, CheckCircle2, Sparkles, Gift } from 'lucide-react';
import { useTicketStatus } from '../hooks/useTicketStatus';
import { BonusModal } from '../components/BonusModal';

interface TicketsProps {
  onOpenTicketModal: () => void;
}

type TicketTypeData = {
  id: string;
  name: string;
  price: number;
  currency: string;
  active: boolean;
  quantity_total: number | null;
  quantity_sold: number | null;
  sort_order: number | null;
};

// ==========================================
// FORMULÁRIO DE WAITLIST (Mantido Original)
// ==========================================
const WaitlistForm: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', expectations: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Lista de Interessados', ...form }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-lg font-bold text-brand-darkBlue">Está na lista!</p>
        <p className="text-gray-500 text-sm mt-1">Será o primeiro a saber quando os bilhetes abrirem.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
          <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-brand-orange focus:border-brand-orange" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail <span className="text-red-500">*</span></label>
          <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-brand-orange focus:border-brand-orange" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp <span className="text-red-500">*</span></label>
          <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-brand-orange focus:border-brand-orange" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
          <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-brand-orange focus:border-brand-orange" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">O que mais espera encontrar no RSG 2026?</label>
        <textarea rows={2} value={form.expectations} onChange={e => setForm({ ...form, expectations: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-brand-orange focus:border-brand-orange resize-none" />
      </div>
      {status === 'error' && (
        <p className="text-red-600 text-sm">Ocorreu um erro. Tente novamente.</p>
      )}
      <button type="submit" disabled={status === 'loading'} className="w-full rounded-[20px] bg-brand-orange text-white py-3 text-lg font-black shadow-[0_10px_24px_rgba(249,115,22,0.28)] hover:opacity-95 transition disabled:opacity-60">
        {status === 'loading' ? 'A enviar...' : 'Entrar na Waitlist'}
      </button>
    </form>
  );
};

export const Tickets: React.FC<TicketsProps> = ({ onOpenTicketModal }) => {
  const { hasActiveLot, isLoading: statusLoading } = useTicketStatus();
  const [ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  
  // ESTADO PARA O POPUP DE BÓNUS
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch('/api/get-ticket');
        if (res.ok) {
          const data = await res.json();
          setTicketData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTicket(false);
      }
    }
    fetchTicket();
  },[]);

  const formatCurrency = (amount?: number, currency?: string) => {
    if (amount === undefined || amount === null || !currency) return '—';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const lotLabel = loadingTicket ? '...' : ticketData?.sort_order !== undefined && ticketData?.sort_order !== null ? `LOTE ${ticketData.sort_order}` : 'LOTE';
  const ticketName = loadingTicket ? 'A carregar...' : ticketData?.name || 'Bilhete';
  const ticketPrice = loadingTicket ? '...' : formatCurrency(ticketData?.price, ticketData?.currency);
  
  // Volta a usar a tua condição original exata
  const showTicketBox = !statusLoading && hasActiveLot;

  // Benefícios com o botão que abre o popup
  const ticketBenefits = [
    { text: "Acesso completo ao evento", isBonus: false },
    { text: "Kit de Boas-vindas + T-Shirt Oficial", isBonus: false },
    { text: "Coffee breaks premium", isBonus: false },
    { text: "Scrum Education Units (SEUs)", isBonus: false },
    { text: "Certificado de Participação Digital", isBonus: false },
    { text: "Acesso à gravação do evento*", isBonus: false },
    { 
      text: (
        <span>
          Bónus Exclusivos.{' '}
          <button 
            type="button"
            onClick={(e) => {
                e.preventDefault();
                setIsBonusModalOpen(true);
            }}
            className="text-brand-orange font-bold underline hover:text-brand-darkBlue transition-colors"
          >
            Saiba mais
          </button>
        </span>
      ), 
      isBonus: true 
    }
  ];

  return (
    <Section id="tickets" className="relative overflow-hidden bg-brand-darkBlue">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-4xl md:text-6xl font-black text-white">
          {showTicketBox ? 'Garanta o seu lugar' : 'Waitlist Oficial'}
        </h2>
        <p className="mt-3 max-w-3xl mx-auto text-lg md:text-2xl text-blue-100 leading-relaxed">
          {showTicketBox
            ? 'Participe de uma das maiores celebrações da agilidade em Portugal. Preço exclusivo para os primeiros inscritos.'
            : 'Seja o primeiro a saber quando os bilhetes abrirem. Inscreva-se na lista de espera e garanta acesso prioritário.'}
        </p>
      </div>

      <div className="max-w-[560px] md:max-w-[860px] mx-auto relative">
        {!showTicketBox && !statusLoading && (
          <div className="relative bg-white/10 border-2 border-white/30 rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.2)] px-7 md:px-8 py-6">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-4 py-1.5 text-sm md:text-base font-black tracking-wide">
                <Bell className="w-4 h-4" /> Waitlist Oficial
              </div>
            </div>
            <WaitlistForm />
          </div>
        )}

        {showTicketBox && (
          <>
            <div className="absolute top-0 right-0 z-20 bg-brand-orange text-white font-black text-base md:text-lg px-4 md:px-5 py-2 md:py-3 rounded-bl-2xl rounded-tr-2xl shadow-md">
              {lotLabel}
            </div>

            <div className="relative bg-white border-2 border-brand-orange rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] px-7 md:px-8 py-4 md:py-5">
              <div className="flex justify-center mb-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-brand-orange px-4 py-1.5 text-sm md:text-base font-black tracking-wide">
                  <Sparkles className="w-4 h-4" /> {ticketName}
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl md:text-5xl font-black text-brand-darkBlue leading-none">
                  {ticketPrice}
                </div>
              </div>

              <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-gray-100 pt-6 mb-6">
                {ticketBenefits.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-left">
                    <div className={`rounded-full p-1.5 flex-shrink-0 mt-0.5 ${item.isBonus ? 'bg-orange-100' : 'bg-sky-100'}`}>
                      {item.isBonus ? <Gift className="w-4 h-4 text-brand-orange" /> : <Check className="w-4 h-4 text-sky-500" />}
                    </div>
                    <span className={`text-base md:text-[16px] leading-snug ${item.isBonus ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 w-full">
                <button
                  onClick={onOpenTicketModal}
                  disabled={loadingTicket || !ticketData?.active}
                  className="w-full rounded-[20px] bg-brand-orange text-white py-3 text-xl md:text-2xl font-black shadow-[0_10px_24px_rgba(249,115,22,0.28)] hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingTicket ? 'A carregar...' : ticketData?.active ? 'Comprar Bilhete' : 'Lote Indisponível'}
                </button>
              </div>
              
              <div className="mt-6 text-left space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-[11px] text-gray-400 leading-tight">
                      <span className="text-red-500 font-bold">*</span> Acesso à gravação disponível por +€10,00 no momento da compra.
                  </p>
              </div>
            </div>
          </>
        )}

        {statusLoading && <div className="text-center py-12 text-white/50">A carregar...</div>}
      </div>

      <BonusModal 
        isOpen={isBonusModalOpen} 
        onClose={() => setIsBonusModalOpen(false)} 
      />
    </Section>
  );
};
import React, { useEffect, useState } from 'react';
import { Section } from '../components/UIComponents';
import { Check, Sparkles } from 'lucide-react';

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

export const Tickets: React.FC<TicketsProps> = ({ onOpenTicketModal }) => {
  const [ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch('/api/get-ticket');
        if (res.ok) {
          const data = await res.json();
          setTicketData(data);
        } else {
          console.error('Erro ao buscar lote ativo');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTicket(false);
      }
    }

    fetchTicket();
  }, []);

  const formatCurrency = (amount?: number, currency?: string) => {
    if (amount === undefined || amount === null || !currency) return '—';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const lotLabel =
    loadingTicket
      ? '...'
      : ticketData?.sort_order !== undefined && ticketData?.sort_order !== null
        ? `LOTE ${ticketData.sort_order}`
        : 'LOTE';

  const ticketName =
    loadingTicket
      ? 'A carregar...'
      : ticketData?.name || 'Bilhete';

  const ticketPrice =
    loadingTicket
      ? '...'
      : formatCurrency(ticketData?.price, ticketData?.currency);

  return (
    <Section id="tickets" className="relative overflow-hidden bg-white">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-4xl md:text-6xl font-black text-brand-darkBlue">
          Garanta o seu lugar
        </h2>

        <p className="mt-3 max-w-3xl mx-auto text-lg md:text-2xl text-gray-500 leading-relaxed">
          Participe de uma das maiores celebrações da agilidade em Portugal.
          Preço exclusivo para os primeiros inscritos.
        </p>
      </div>

      <div className="max-w-[560px] md:max-w-[620px] mx-auto relative">
        <div className="absolute top-0 right-0 z-20 bg-brand-orange text-white font-black text-base md:text-lg px-4 md:px-5 py-2 md:py-3 rounded-bl-2xl rounded-tr-2xl shadow-md">
          {lotLabel}
        </div>

        <div className="relative bg-white border-2 border-brand-orange rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] px-7 md:px-8 py-4 md:py-5">
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-brand-orange px-4 py-1.5 text-sm md:text-base font-black tracking-wide">
              <Sparkles className="w-4 h-4" />
              {ticketName}
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-brand-darkBlue leading-none">
              {ticketPrice}
            </div>
          </div>

          <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
            {[
              'Acesso completo ao evento',
              'Kit de Boas-vindas + T-Shirt Oficial',
              'Coffee breaks premium',
              'Scrum Education Units (SEUs)',
              'Certificado de Participação Digital',
              'Acesso à gravação do evento',
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-3 text-left">
                <div className="rounded-full bg-sky-100 p-1 flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <span className="text-base md:text-[17px] text-gray-700">
                  {item}{i === 5 && <span className="text-red-500">*</span>}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 w-full text-xs text-gray-400 text-center">
            <span className="text-red-500">*</span> Acesso à gravação disponível por +€10,00 no momento da compra.
          </p>

          <div className="mt-4 w-full">
            <button
              onClick={onOpenTicketModal}
              disabled={loadingTicket || !ticketData?.active}
              className="w-full rounded-[20px] bg-brand-orange text-white py-3 text-xl md:text-2xl font-black shadow-[0_10px_24px_rgba(249,115,22,0.28)] hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingTicket
                ? 'A carregar...'
                : ticketData?.active
                  ? 'Comprar Bilhete'
                  : 'Lote Indisponível'}
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-gray-400">
            Fatura com contribuinte disponível no momento da compra.
          </p>
          
        </div>
      </div>
    </Section>
  );
};

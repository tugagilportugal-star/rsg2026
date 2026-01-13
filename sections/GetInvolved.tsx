import React, { useState, useEffect } from 'react';
import { Section, Button, Input, Textarea, SuccessState } from '../components/UIComponents';
import { FormType, SponsorFormData, SupporterFormData } from '../types';
import { saveSubmission } from '../services/db';
import { Handshake, Camera, Ticket, Lock, ArrowRight, Loader2 } from 'lucide-react';

// ⚠️ SUBSTITUA PELO ID REAL DO SEU SUPABASE
const TICKET_TYPE_ID = '{"idx":0,"id":"f14c53d4-5377-49b9-b87c-980b7b0aad0f","name":"Early Bird","price":3500,"currency":"eur","quantity_total":40,"quantity_sold":0,"active":true,"created_at":"2026-01-12 16:05:26.932602+00"}'; 

interface GetInvolvedProps {
  setSponsorModalOpen: (v: boolean) => void;
  setSupporterModalOpen: (v: boolean) => void;
}

interface TicketTypeData {
  name: string;
  price: number;
  currency: string;
  active: boolean;
}

/* =========================
   MAIN SECTION (TICKET SALES & OPTIONS)
========================= */
export const GetInvolved: React.FC<GetInvolvedProps> = ({
  setSponsorModalOpen,
  setSupporterModalOpen
}) => {
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: ''
  });
  
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading'>('idle');
  const [ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/get-ticket?id=${TICKET_TYPE_ID}`);
        if (res.ok) {
          const data = await res.json();
          setTicketData(data);
        } else {
          console.error('Erro ao buscar bilhete');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTicket(false);
      }
    }

    if (TICKET_TYPE_ID) fetchTicket();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleBuyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyStatus('loading');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: TICKET_TYPE_ID,
          quantity: 1,
          formData: ticketForm
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar pagamento: ' + (data.message || 'Tente novamente.'));
        setBuyStatus('idle');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão. Verifique sua internet.');
      setBuyStatus('idle');
    }
  };

  return (
    <Section id="get-involved" className="bg-gray-50">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-4">
          Garanta o seu lugar
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          As vendas para o Regional Scrum Gathering Lisbon 2026 estão abertas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
        {/* Box Patrocínios */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border-2 border-gray-100 hover:border-brand-orange transition-all duration-300 hover:shadow-2xl flex flex-col items-center text-center shadow-lg group">
          <div className="bg-brand-orange/10 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
            <Handshake className="w-12 h-12 text-brand-orange" />
          </div>
          <h3 className="text-2xl font-bold text-brand-darkBlue mb-4">Patrocínios e Parcerias</h3>
          <p className="text-gray-600 mb-8">
            Conecte a sua marca a centenas de líderes e praticantes de agilidade em Portugal.
          </p>
          <Button
            onClick={() => setSponsorModalOpen(true)}
            variant="secondary"
            className="w-full text-lg font-bold"
          >
            Quero Patrocinar
          </Button>
        </div>

        {/* Box Apoiadores */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border-2 border-gray-100 hover:border-brand-blue transition-all duration-300 hover:shadow-2xl flex flex-col items-center text-center shadow-lg group">
          <div className="bg-brand-blue/10 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
            <Camera className="w-12 h-12 text-brand-blue" />
          </div>
          <h3 className="text-2xl font-bold text-brand-darkBlue mb-4">Apoiadores</h3>
          <p className="text-gray-600 mb-8">
            Trabalhas com fotografia, vídeo, som ou design e queres apoiar o evento?
          </p>
          <Button
            onClick={() => setSupporterModalOpen(true)}
            className="w-full text-lg font-bold bg-brand-blue text-white"
          >
            Quero Apoiar
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* 
            👇 AQUI ESTÁ A MUDANÇA: 
            Adicionei id="waitlist" e scroll-mt-28 para dar espaço do menu 
        */}
        <div 
            id="waitlist" 
            className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 relative transform hover:-translate-y-1 transition-transform duration-300 scroll-mt-32"
        >
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-brand-orange via-brand-blue to-brand-darkBlue"></div>

          <div className="p-8 md:p-12">
            {loadingTicket ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                <p className="text-gray-500">A carregar informações do bilhete...</p>
              </div>
            ) : ticketData ? (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-green-100 p-3 rounded-full">
                      <Ticket className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-brand-darkBlue">{ticketData.name}</h3>
                    <p className="text-green-600 font-bold text-lg">
                      {formatCurrency(ticketData.price, ticketData.currency)} 
                      <span className="text-sm font-normal text-gray-500"> / pessoa</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBuyTicket} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Nome do Participante"
                        required
                        value={ticketForm.name}
                        onChange={e => setTicketForm({ ...ticketForm, name: e.target.value })}
                    />
                    <Input
                        label="E-mail"
                        type="email"
                        required
                        value={ticketForm.email}
                        onChange={e => setTicketForm({ ...ticketForm, email: e.target.value })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Telemóvel / WhatsApp"
                        required
                        value={ticketForm.phone}
                        onChange={e => setTicketForm({ ...ticketForm, phone: e.target.value })}
                    />
                    <Input
                        label="Empresa (Opcional)"
                        value={ticketForm.company}
                        onChange={e => setTicketForm({ ...ticketForm, company: e.target.value })}
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                        type="submit" 
                        isLoading={buyStatus === 'loading'} 
                        className="w-full text-lg py-4 bg-brand-orange hover:bg-orange-600 shadow-lg"
                        disabled={!ticketData.active}
                    >
                        {ticketData.active ? (
                            <>Continuar para Pagamento <ArrowRight className="ml-2 w-5 h-5" /></>
                        ) : (
                            'Lote Indisponível'
                        )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                        <Lock className="w-3 h-3" />
                        Pagamento seguro via Stripe (Cartão, Multibanco, MBWay)
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-12 text-red-500">
                Não foi possível carregar as informações do bilhete.
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export const SponsorForm: React.FC = () => { return <></> };
export const SupporterForm: React.FC = () => { return <></> };

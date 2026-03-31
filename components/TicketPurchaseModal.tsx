import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from './UIComponents';
import { Lock, ShieldCheck, Ticket, Video, User, Briefcase, CreditCard } from 'lucide-react';

type TicketTypeData = { id: string; price: number; currency: string; active: boolean; };
type ParticipantForm = {
  firstName: string; lastName: string; email: string; nif: string; country: string;
  company: string; jobTitle: string; jobFunction: string; industry: string; tshirt: string; saMarketingConsent: boolean;
};

const RECORDING_PRICE = 1000;
const JOB_FUNCTIONS = ['Atendimento ao Cliente', 'Engenharia', 'Executivo', 'Financeiro', 'Recursos Humanos', 'Tecnologia da Informação', 'Jurídico', 'Marketing e Vendas', 'Operações', 'Gestão de Produtos', 'Serviços Profissionais', 'Gerenciamento de projetos', 'Pesquisa', 'Cadeia de suprimentos e manufatura', 'Treinamento e Educação', 'Outros'];
const COUNTRIES = ['Portugal', 'Espanha', 'França', 'Alemanha', 'Reino Unido', 'Brasil', 'Estados Unidos', 'Outro'];
const TSHIRTS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const TicketPurchaseModal: React.FC = () => {
  const [participant, setParticipant] = useState<ParticipantForm>({
    firstName: '', lastName: '', email: '', nif: '', country: 'Portugal',
    company: '', jobTitle: '', jobFunction: '', industry: '', tshirt: '', saMarketingConsent: false,
  });

  const [includeRecording, setIncludeRecording] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [saDataSharingConsent, setSaDataSharingConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading'>('idle');
  const [ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    fetch('/api/get-ticket')
      .then(r => r.json()).then(data => setTicketData(data))
      .catch(console.error).finally(() => setLoadingTicket(false));
  }, []);

  const updateParticipant = (patch: Partial<ParticipantForm>) => setParticipant(prev => ({ ...prev, ...patch }));

  const totalPrice = useMemo(() => {
    let p = Number(ticketData?.price || 0);
    if (includeRecording) p += RECORDING_PRICE;
    return p;
  }, [ticketData, includeRecording]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyConsent || !saDataSharingConsent) {
      alert("Por favor, aceite os termos obrigatórios marcados com *");
      return;
    }
    setBuyStatus('loading');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: ticketData?.id,
          participants: [{ ...participant, first_name: participant.firstName, last_name: participant.lastName }],
          shared: { 
            include_recording: includeRecording, 
            coupon_code: couponCode.trim(), 
            sa_data_sharing_consent: saDataSharingConsent, 
            privacy_consent: privacyConsent,
            billing_nif: participant.nif // Enviamos o NIF mas sem o bloco visual de fatura
          }
        }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } catch { setBuyStatus('idle'); alert("Erro na ligação. Tente novamente."); }
  };

  if (loadingTicket) return <div className="p-10 text-center text-brand-blue font-bold">A carregar formulário seguro...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 pb-10">
      <h2 className="text-3xl font-black text-brand-darkBlue text-center mb-8">Inscrição no Evento</h2>

      {/* 1. DADOS DO PARTICIPANTE */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand-orange font-bold mb-2">
          <User size={18} /> <span>Dados do Participante</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome *" value={participant.firstName} onChange={e => updateParticipant({ firstName: e.target.value })} required />
          <Input label="Apelido *" value={participant.lastName} onChange={e => updateParticipant({ lastName: e.target.value })} required />
        </div>
        <Input label="E-mail *" type="email" value={participant.email} onChange={e => updateParticipant({ email: e.target.value })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="NIF (opcional)" value={participant.nif} onChange={e => updateParticipant({ nif: e.target.value })} placeholder="Para a fatura" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">T-Shirt *</label>
            <select value={participant.tshirt} onChange={e => updateParticipant({ tshirt: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 bg-white text-sm" required>
              <option value="">Tamanho...</option>
              {TSHIRTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. PROFISSIONAL */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand-orange font-bold mb-2">
          <Briefcase size={18} /> <span>Informação Profissional</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Empresa" value={participant.company} onChange={e => updateParticipant({ company: e.target.value })} />
          <Input label="Cargo" value={participant.jobTitle} onChange={e => updateParticipant({ jobTitle: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
            <select value={participant.jobFunction} onChange={e => updateParticipant({ jobFunction: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 bg-white text-sm" required>
              <option value="">Seleciona...</option>
              {JOB_FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <Input label="Indústria *" value={participant.industry} onChange={e => updateParticipant({ industry: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
          <select value={participant.country} onChange={e => updateParticipant({ country: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 bg-white text-sm" required>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 3. EXTRAS & FINALIZAÇÃO */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-brand-orange font-bold mb-2">
          <CreditCard size={18} /> <span>Extras & Confirmação</span>
        </div>

        <div onClick={() => setIncludeRecording(!includeRecording)} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${includeRecording ? 'border-brand-orange bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
          <input type="checkbox" checked={includeRecording} readOnly className="w-5 h-5 accent-brand-orange" />
          <div className="flex-1">
            <p className="font-bold text-gray-800 flex items-center gap-2"><Video size={18} className="text-brand-orange" /> Gravação do Evento</p>
            <p className="text-xs text-gray-600">Acesso a todas as sessões gravadas (+€10,00)</p>
          </div>
        </div>

        <Input label="Cupão de Desconto" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Insira o seu código aqui" />

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <input type="checkbox" checked={saDataSharingConsent} onChange={e => setSaDataSharingConsent(e.target.checked)} className="mt-1 accent-brand-orange" required />
            <label className="text-[11px] text-gray-500 leading-tight">Autorizo a partilha de dados com a Scrum Alliance para emissão de SEUs. *</label>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" checked={participant.saMarketingConsent} onChange={e => updateParticipant({ saMarketingConsent: e.target.checked })} className="mt-1 accent-brand-orange" />
            <label className="text-[11px] text-gray-500 leading-tight">Autorizo a Scrum Alliance a enviar-me comunicações e ativar a assinatura gratuita.</label>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" checked={privacyConsent} onChange={e => setPrivacyConsent(e.target.checked)} className="mt-1 accent-brand-orange" required />
            <label className="text-[11px] text-gray-500 leading-tight">Aceito a Política de Privacidade do RSG Portugal 2026. *</label>
          </div>
        </div>

        <div className="bg-brand-darkBlue p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs opacity-70 uppercase">Valor Total</p>
            <p className="text-3xl font-black">{formatCurrency(totalPrice)}</p>
          </div>
          <Button type="submit" isLoading={buyStatus === 'loading'} className="w-full md:w-auto px-8 py-4 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
            <Ticket className="mr-2" size={20} /> Avançar para Pagamento
          </Button>
        </div>
        <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1"><Lock size={10} /> Pagamento Seguro via Stripe</p>
      </div>
    </form>
  );
};
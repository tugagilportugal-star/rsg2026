import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from './UIComponents';
import { CheckCircle2, Lock, ShieldCheck, Ticket, Video } from 'lucide-react';

type TicketTypeData = { id: string; name: string; price: number; currency: string; active: boolean; };
type ParticipantForm = {
  firstName: string; lastName: string; email: string; nif: string; country: string;
  company: string; jobTitle: string; jobFunction: string; jobFunctionOther: string;
  industry: string; tshirt: string; saMarketingConsent: boolean;
};

const RECORDING_PRICE = 1000;
const JOB_FUNCTIONS = ['Atendimento ao Cliente', 'Engenharia', 'Executivo', 'Financeiro', 'Recursos Humanos', 'Tecnologia da Informação', 'Jurídico', 'Marketing e Vendas', 'Operações', 'Gestão de Produtos', 'Serviços Profissionais', 'Gerenciamento de projetos', 'Pesquisa', 'Cadeia de suprimentos e manufatura', 'Treinamento e Educação', 'Outros'];
const COUNTRIES = ['Portugal', 'Espanha', 'França', 'Alemanha', 'Reino Unido', 'Brasil', 'Estados Unidos', 'Outro'];
const TSHIRTS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const fieldClass = 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue';
const selectClass = `${fieldClass} bg-white text-gray-900`;

export const TicketPurchaseModal: React.FC = () => {
  const [participant, setParticipant] = useState<ParticipantForm>({
    firstName: '', lastName: '', email: '', nif: '', country: 'Portugal',
    company: '', jobTitle: '', jobFunction: '', jobFunctionOther: '',
    industry: '', tshirt: '', saMarketingConsent: false,
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
      .then(r => r.json()).then(data => { if (data) setTicketData(data); })
      .catch(console.error).finally(() => setLoadingTicket(false));
  }, []);

  const updateParticipant = (patch: Partial<ParticipantForm>) => setParticipant(prev => ({ ...prev, ...patch }));

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount / 100);

  const totalPrice = useMemo(() => {
    let p = Number(ticketData?.price || 0);
    if (includeRecording) p += RECORDING_PRICE;
    return p;
  }, [ticketData, includeRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyConsent || !saDataSharingConsent) return;
    setBuyStatus('loading');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: ticketData?.id,
          participants: [{ ...participant, first_name: participant.firstName, last_name: participant.lastName }],
          shared: { include_recording: includeRecording, coupon_code: couponCode, sa_data_sharing_consent: saDataSharingConsent, privacy_consent: privacyConsent, billing_nif: participant.nif }
        }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } catch { setBuyStatus('idle'); }
  };

  if (loadingTicket) return <div className="py-8 text-center text-gray-500">A carregar...</div>;

  const p = participant;

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-5">
      <h3 className="text-2xl font-black text-brand-darkBlue text-center mb-6">Comprar Bilhete</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input value={p.firstName} onChange={e => updateParticipant({ firstName: e.target.value })} className={fieldClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apelido *</label>
            <input value={p.lastName} onChange={e => updateParticipant({ lastName: e.target.value })} className={fieldClass} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input type="email" value={p.email} onChange={e => updateParticipant({ email: e.target.value })} className={fieldClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF / Tax ID <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input type="text" value={p.nif} onChange={e => updateParticipant({ nif: e.target.value })} className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input type="text" value={p.company} onChange={e => updateParticipant({ company: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input type="text" value={p.jobTitle} onChange={e => updateParticipant({ jobTitle: e.target.value })} className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
            <select value={p.jobFunction} onChange={e => updateParticipant({ jobFunction: e.target.value })} className={selectClass} required>
              <option value="">Seleciona…</option>
              {JOB_FUNCTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indústria *</label>
            <input type="text" value={p.industry} onChange={e => updateParticipant({ industry: e.target.value })} className={fieldClass} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
            <select value={p.country} onChange={e => updateParticipant({ country: e.target.value })} className={selectClass}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">T-Shirt *</label>
            <select value={p.tshirt} onChange={e => updateParticipant({ tshirt: e.target.value })} className={selectClass} required>
              <option value="">Tamanho...</option>
              {TSHIRTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 my-6" />

      <div onClick={() => setIncludeRecording(!includeRecording)} className={`cursor-pointer flex items-start gap-3 rounded-lg border p-3 transition-colors ${includeRecording ? 'border-brand-orange bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
        <input type="checkbox" checked={includeRecording} readOnly className="mt-0.5 h-4 w-4 text-brand-orange border-gray-300 rounded" />
        <label className="cursor-pointer text-sm text-gray-700 leading-snug">
          <span className="flex items-center gap-1 font-semibold text-gray-800"><Video className="w-3.5 h-3.5 text-brand-orange" /> Acesso à Gravação</span>
          <span className="text-gray-500">Vídeos das sessões <span className="font-bold text-brand-orange">+€10,00</span></span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Valor total" value={formatCurrency(totalPrice)} readOnly />
        <Input label="Cupão" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Código" />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={saDataSharingConsent} onChange={e => setSaDataSharingConsent(e.target.checked)} className="mt-1 h-4 w-4 text-brand-orange" required />
          <label className="text-[11px] text-gray-500">Concordo com a partilha de dados com a Scrum Alliance para SEUs. *</label>
        </div>
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={p.saMarketingConsent} onChange={e => updateParticipant({ saMarketingConsent: e.target.checked })} className="mt-1 h-4 w-4 text-brand-blue" />
          <label className="text-[11px] text-gray-500">Autorizo a Scrum Alliance a enviar-me comunicações e ativar a assinatura gratuita.</label>
        </div>
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={privacyConsent} onChange={e => setPrivacyConsent(e.target.checked)} className="mt-1 h-4 w-4 text-brand-orange" required />
          <label className="text-[11px] text-gray-500">Aceito a Política de Privacidade do evento. *</label>
        </div>
      </div>

      <Button type="submit" isLoading={buyStatus === 'loading'} className="w-full text-lg py-4" variant="secondary">
        <Ticket className="w-5 h-5 mr-2" /> Avançar para Pagamento
      </Button>
      
      <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1"><Lock size={10} /> Pagamento Seguro via Stripe</p>
    </form>
  );
};
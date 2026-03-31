import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from './UIComponents';
import { CheckCircle2, Lock, ShieldCheck, Ticket, Video } from 'lucide-react';

type TicketTypeData = {
  id: string;
  name: string;
  price: number;
  currency: string;
  active: boolean;
};

type CouponState = {
  valid: boolean;
  code?: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  recordingOnly?: boolean;
  message?: string;
};

type ParticipantForm = {
  firstName: string;
  lastName: string;
  email: string;
  nif: string;
  country: string;
  company: string;
  jobTitle: string;
  jobFunction: string;
  jobFunctionOther: string;
  industry: string;
  tshirt: string;
  saMarketingConsent: boolean;
};

const RECORDING_PRICE = 1000;

const JOB_FUNCTIONS =[
  'Atendimento ao Cliente', 'Engenharia', 'Executivo', 'Financeiro',
  'Recursos Humanos', 'Tecnologia da Informação', 'Jurídico',
  'Marketing e Vendas', 'Operações', 'Gestão de Produtos',
  'Serviços Profissionais', 'Gerenciamento de projetos', 'Pesquisa',
  'Cadeia de suprimentos e manufatura', 'Treinamento e Educação', 'Outros',
];

const COUNTRIES =['Portugal', 'Espanha', 'França', 'Alemanha', 'Reino Unido', 'Brasil', 'Estados Unidos', 'Outro'];
const TSHIRTS =['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const emptyParticipant = (): ParticipantForm => ({
  firstName: '', lastName: '', email: '', nif: '', country: 'Portugal',
  company: '', jobTitle: '', jobFunction: '', jobFunctionOther: '',
  industry: '', tshirt: '', saMarketingConsent: false,
});

const fieldClass = 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue';
const selectClass = `${fieldClass} bg-white text-gray-900`;

export const TicketPurchaseModal: React.FC = () => {
  const[participant, setParticipant] = useState<ParticipantForm>(emptyParticipant());

  const [includeRecording, setIncludeRecording] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const[saDataSharingConsent, setSaDataSharingConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading'>('idle');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading'>('idle');
  const [couponResult, setCouponResult] = useState<CouponState | null>(null);
  const[ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    fetch('/api/get-ticket')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTicketData(data); })
      .catch(console.error)
      .finally(() => setLoadingTicket(false));
  },[]);

  const updateParticipant = (patch: Partial<ParticipantForm>) =>
    setParticipant(prev => ({ ...prev, ...patch }));

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);

  const originalPrice = Number(ticketData?.price || 0);

  const pricePerTicket = useMemo(() => {
    let p = originalPrice;
    if (couponResult?.valid && !couponResult.recordingOnly) {
      if (couponResult.discountAmount != null) p = Math.max(0, originalPrice - couponResult.discountAmount);
      else if (couponResult.discountPercent != null) p = Math.round(originalPrice * (100 - couponResult.discountPercent) / 100);
    }
    return p;
  }, [originalPrice, couponResult]);

  const recordingPrice = useMemo(() => {
    if (!includeRecording) return 0;
    let p = RECORDING_PRICE;
    if (couponResult?.valid && couponResult.recordingOnly) {
      if (couponResult.discountAmount != null) p = Math.max(0, RECORDING_PRICE - couponResult.discountAmount);
      else if (couponResult.discountPercent != null) {
        const rawDiscount = Math.round((originalPrice + RECORDING_PRICE) * couponResult.discountPercent / 100);
        p = Math.max(0, RECORDING_PRICE - Math.min(rawDiscount, RECORDING_PRICE));
      }
    }
    return p;
  },[includeRecording, couponResult, originalPrice]);

  const totalPrice = pricePerTicket + recordingPrice;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    const email = participant.email.trim().toLowerCase();
    if (!code) return;
    setCouponStatus('loading');
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.valid) {
        setCouponResult({ valid: false, message: 'Cupão inválido.' });
        return;
      }
      if (data.recordingOnly && !includeRecording) {
        setCouponResult({ valid: false, message: 'Cupão aplica-se apenas à gravação. Ative a gravação.' });
        return;
      }
      let discountLabel: string;
      if (data.recordingOnly) {
        const rawDiscount = data.discountAmount != null ? data.discountAmount : Math.round((originalPrice + RECORDING_PRICE) * (data.discountPercent / 100));
        discountLabel = `-${formatCurrency(Math.min(rawDiscount, RECORDING_PRICE), 'eur')}`;
      } else {
        discountLabel = data.discountAmount != null ? `-${formatCurrency(data.discountAmount, 'eur')}` : `-${data.discountPercent}%`;
      }
      setCouponResult({
        valid: true, code: data.code,
        discountPercent: data.discountPercent, discountAmount: data.discountAmount,
        recordingOnly: data.recordingOnly,
        message: `Cupão aplicado: ${discountLabel}${data.recordingOnly ? ' na gravação' : ''}`,
      });
    } catch {
      setCouponResult({ valid: false, message: 'Cupão inválido.' });
    } finally {
      setCouponStatus('idle');
    }
  };

  const isComplete = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email.trim());
    return participant.firstName.trim() && participant.lastName.trim() && emailOk && participant.tshirt &&
           participant.jobFunction && participant.industry.trim() && participant.country &&
           (participant.jobFunction !== 'Outros' || participant.jobFunctionOther.trim()) &&
           saDataSharingConsent && privacyConsent;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete()) {
      setShowErrors(true);
      return;
    }
    setBuyStatus('loading');
    try {
      if (!ticketData?.id) {
        alert('A carregar bilhete. Tente novamente.');
        setBuyStatus('idle');
        return;
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: ticketData.id,
          participants:[{
            first_name: participant.firstName.trim(),
            last_name: participant.lastName.trim(),
            email: participant.email.trim(),
            country: participant.country,
            company: participant.company.trim(),
            job_function: participant.jobFunction,
            job_function_other: participant.jobFunction === 'Outros' ? participant.jobFunctionOther.trim() : '',
            job_title: participant.jobTitle.trim(),
            industry: participant.industry.trim(),
            tshirt: participant.tshirt,
            sa_marketing_consent: participant.saMarketingConsent,
          }],
          shared: {
            include_recording: includeRecording,
            coupon_code: couponResult?.valid ? couponCode.trim().toUpperCase() : '',
            billing_nif: participant.nif.trim(),
            billing_name: `${participant.firstName} ${participant.lastName}`.trim(),
            billing_name_type: participant.company.trim() ? 'company' : 'participant',
            billing_email: participant.email.trim(),
            sa_data_sharing_consent: saDataSharingConsent,
            privacy_consent: privacyConsent,
          },
        }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar pagamento: ' + (data?.message || 'Tente novamente.'));
        setBuyStatus('idle');
      }
    } catch {
      alert('Erro de conexão. Verifique a sua internet.');
      setBuyStatus('idle');
    }
  };

  if (loadingTicket) return <div className="py-8 text-center text-gray-500">A carregar informações do bilhete...</div>;
  if (!ticketData) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">Não foi possível carregar as informações do bilhete.</div>;

  const errClass = (invalid: boolean) => invalid
    ? 'mt-1 block w-full border border-red-500 rounded-md shadow-sm p-2 text-sm focus:ring-red-500 focus:border-red-500'
    : fieldClass;

  const p = participant;

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-5">
      
      <h3 className="text-2xl font-black text-brand-darkBlue text-center mb-6">
        Comprar Bilhete
      </h3>

      {showErrors && !isComplete() && (
        <div className="bg-red-50 border border-red-400 rounded-lg px-3 py-2 text-center">
          <span className="text-red-600 text-sm font-medium">Por favor, preencha os campos obrigatórios.</span>
        </div>
      )}

      {/* Dados Pessoais */}
      <div className="space-y-4">
        
        {/* Nome + Apelido */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-red-500">*</span></label>
            <input value={p.firstName} onChange={e => updateParticipant({ firstName: e.target.value })} className={errClass(showErrors && !p.firstName.trim())} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apelido <span className="text-red-500">*</span></label>
            <input value={p.lastName} onChange={e => updateParticipant({ lastName: e.target.value })} className={errClass(showErrors && !p.lastName.trim())} />
          </div>
        </div>

        {/* Email + NIF */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail <span className="text-red-500">*</span></label>
            <input type="email" value={p.email} onChange={e => { updateParticipant({ email: e.target.value }); setCouponResult(null); }} className={errClass(showErrors && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF / Tax ID <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input type="text" maxLength={9} pattern="\d{9}" placeholder="Ex: 323380603" value={p.nif} onChange={e => updateParticipant({ nif: e.target.value.replace(/\D/g, '') })} className={fieldClass} />
          </div>
        </div>

        {/* Empresa + Cargo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input type="text" value={p.company} onChange={e => updateParticipant({ company: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input type="text" value={p.jobTitle} onChange={e => updateParticipant({ jobTitle: e.target.value })} className={fieldClass} />
          </div>
        </div>

        {/* Função + Indústria */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função <span className="text-red-500">*</span></label>
            <select value={p.jobFunction} onChange={e => updateParticipant({ jobFunction: e.target.value, jobFunctionOther: '' })} className={showErrors && !p.jobFunction ? `${selectClass} border-red-500` : selectClass}>
              <option value="">Seleciona…</option>
              {JOB_FUNCTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indústria <span className="text-red-500">*</span></label>
            <input type="text" value={p.industry} onChange={e => updateParticipant({ industry: e.target.value })} placeholder="Ex: Tecnologia, Saúde..." className={errClass(showErrors && !p.industry.trim())} />
          </div>
        </div>

        {p.jobFunction === 'Outros' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qual a sua função? <span className="text-red-500">*</span></label>
            <input value={p.jobFunctionOther} onChange={e => updateParticipant({ jobFunctionOther: e.target.value })} className={errClass(showErrors && !p.jobFunctionOther.trim())} />
          </div>
        )}

        {/* País + T-Shirt */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País <span className="text-red-500">*</span></label>
            <select value={p.country} onChange={e => updateParticipant({ country: e.target.value })} className={selectClass}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">T-Shirt <span className="text-red-500">*</span></label>
            <select value={p.tshirt} onChange={e => updateParticipant({ tshirt: e.target.value })} className={showErrors && !p.tshirt ? `${selectClass} border-red-500` : selectClass}>
              <option value="" disabled>Tamanho...</option>
              {TSHIRTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

      </div>

      <hr className="border-gray-100 my-6" />

      {/* Secção de Gravação */}
      <div onClick={() => setIncludeRecording(v => !v)} className={`cursor-pointer flex items-start gap-3 rounded-lg border p-3 transition-colors ${includeRecording ? 'border-brand-orange bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
        <input type="checkbox" checked={includeRecording} onChange={e => setIncludeRecording(e.target.checked)} onClick={e => e.stopPropagation()} className="mt-0.5 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange" />
        <label className="cursor-pointer text-sm text-gray-700 leading-snug">
          <span className="flex items-center gap-1 font-semibold text-gray-800"><Video className="w-3.5 h-3.5 text-brand-orange" /> Acesso à Gravação do Evento</span>
          <span className="text-gray-500">Vídeos de todas as sessões <span className="font-bold text-brand-orange">+€10,00</span></span>
        </label>
      </div>

      {/* Valores e Cupão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Valor total" value={ticketData ? formatCurrency(totalPrice, ticketData.currency) : '—'} readOnly />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cupão de Desconto</label>
          <div className="flex gap-2">
            <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }} placeholder="Código" className="flex-1 block border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" />
            <button type="button" onClick={handleApplyCoupon} disabled={couponStatus === 'loading' || !couponCode.trim()} className="rounded-md border border-gray-300 px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-60 text-sm font-medium text-brand-orange">
              {couponStatus === 'loading' ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponResult?.message && (
            <div className={`mt-2 flex items-center gap-2 text-sm ${couponResult.valid ? 'text-green-700' : 'text-red-700'}`}>
              {couponResult.valid && <CheckCircle2 className="w-4 h-4" />}<span>{couponResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Termos & Privacidade */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-brand-darkBlue font-bold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-orange" /> Termos & Privacidade
        </div>
        <div className="space-y-3">
          
          <div className={`flex items-start p-3 rounded-lg border transition-colors ${showErrors && !saDataSharingConsent ? 'bg-red-50 border-red-400' : 'bg-gray-50 border-gray-200'}`}>
            <input id="saConsent1" type="checkbox" checked={saDataSharingConsent} onChange={e => setSaDataSharingConsent(e.target.checked)} className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <label htmlFor="saConsent1" className="ml-3 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-red-500">*</span> Concordo que o Organizador pode partilhar as informações pessoais com a Scrum Alliance para análise e emissão de SEUs. Consulte a <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">Política da Scrum Alliance</a>.
            </label>
          </div>

          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input id="saMarketing" type="checkbox" checked={p.saMarketingConsent} onChange={e => updateParticipant({ saMarketingConsent: e.target.checked })} className="mt-1 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue flex-shrink-0" />
            <label htmlFor="saMarketing" className="ml-3 text-xs text-gray-600 leading-relaxed">
              Gostava de uma assinatura gratuita de 2 anos da Scrum Alliance*! Autorizo a transferência dos meus dados à Scrum Alliance (EUA) para ativação. <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">Política da Scrum Alliance</a>. <span className="text-gray-400 block mt-1">*Oferta não disponível para quem já possui assinatura.</span>
            </label>
          </div>

          <div className={`flex items-start p-3 rounded-lg border transition-colors ${showErrors && !privacyConsent ? 'bg-red-50 border-red-500' : 'border-transparent'}`}>
            <input id="privacy" type="checkbox" checked={privacyConsent} onChange={e => setPrivacyConsent(e.target.checked)} className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
              <span className="font-bold text-red-500">*</span> Estou de acordo com a <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">Política de Privacidade</a> do evento.
            </label>
          </div>

        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">Pagamento seguro via Stripe. Os dados para a Fatura Oficial com NIF serão solicitados na página seguinte.</p>
      </div>

      <Button type="submit" isLoading={buyStatus === 'loading'} className="w-full text-lg py-4" variant="secondary" disabled={!ticketData?.active}>
        <Ticket className="w-5 h-5 mr-2" />
        {ticketData?.active ? 'Avançar para Pagamento' : 'Lote Indisponível'}
      </Button>
    </form>
  );
};
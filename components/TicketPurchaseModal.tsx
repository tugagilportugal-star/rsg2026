import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from './UIComponents';
import { CheckCircle2, Lock, ShieldCheck, Ticket, Video } from 'lucide-react';

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
  country: string;
  company: string;
  jobTitle: string;
  jobFunction: string;
  jobFunctionOther: string;
  tshirt: string;
  saMarketingConsent: boolean;
};

const RECORDING_PRICE = 1000;

const JOB_FUNCTIONS = [
  'Atendimento ao Cliente', 'Engenharia', 'Executivo', 'Financeiro',
  'Recursos Humanos', 'Tecnologia da Informação', 'Jurídico',
  'Marketing e Vendas', 'Operações', 'Gestão de Produtos',
  'Serviços Profissionais', 'Gerenciamento de projetos', 'Pesquisa',
  'Cadeia de suprimentos e manufatura', 'Treinamento e Educação',
  'Indústria de trabalho', 'Outros',
];

const COUNTRIES = ['Portugal', 'Espanha', 'França', 'Alemanha', 'Reino Unido', 'Brasil', 'Estados Unidos', 'Outro'];
const TSHIRTS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const emptyParticipant = (): ParticipantForm => ({
  firstName: '', lastName: '', email: '', country: 'Portugal',
  company: '', jobTitle: '', jobFunction: '', jobFunctionOther: '',
  tshirt: '', saMarketingConsent: false,
});

const fieldClass = 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue';
const selectClass = `${fieldClass} bg-white text-gray-900`;

export const TicketPurchaseModal: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [participants, setParticipants] = useState<ParticipantForm[]>([emptyParticipant()]);
  const [activeTab, setActiveTab] = useState(0);

  const [includeRecording, setIncludeRecording] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [billingNif, setBillingNif] = useState('');
  const [billingNameType, setBillingNameType] = useState<'participant' | 'company'>('participant');
  const [billingNameIndex, setBillingNameIndex] = useState(0);
  const [billingNameCompany, setBillingNameCompany] = useState('');
  const [billingEmailIndex, setBillingEmailIndex] = useState(0);
  const [billingEmailOther, setBillingEmailOther] = useState('');
  const [saDataSharingConsent, setSaDataSharingConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading'>('idle');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading'>('idle');
  const [couponResult, setCouponResult] = useState<CouponState | null>(null);
  const [ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    fetch('/api/get-ticket')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTicketData(data); })
      .catch(console.error)
      .finally(() => setLoadingTicket(false));
  }, []);

  const handleQuantityChange = (q: number) => {
    const clamped = Math.max(1, Math.min(5, q));
    setQuantity(clamped);
    setParticipants(prev => {
      if (clamped > prev.length) return [...prev, ...Array(clamped - prev.length).fill(null).map(emptyParticipant)];
      return prev.slice(0, clamped);
    });
    if (activeTab >= clamped) setActiveTab(clamped - 1);
  };

  const updateParticipant = (index: number, patch: Partial<ParticipantForm>) =>
    setParticipants(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p));

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

  const recordingPricePerPerson = useMemo(() => {
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
  }, [includeRecording, couponResult, originalPrice]);

  const recordingPrice = recordingPricePerPerson * quantity;
  const totalPrice = pricePerTicket * quantity + recordingPrice;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    const email = participants[0]?.email.trim().toLowerCase() || '';
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
        setCouponResult({ valid: false, message: 'Este cupão aplica-se apenas à gravação. Ativa a opção de gravação para usá-lo.' });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          participants: participants.map(p => ({
            first_name: p.firstName.trim(),
            last_name: p.lastName.trim(),
            email: p.email.trim(),
            country: p.country,
            company: p.company.trim(),
            job_function: p.jobFunction,
            job_function_other: p.jobFunction === 'Outros' ? p.jobFunctionOther.trim() : '',
            job_title: p.jobTitle.trim(),
            tshirt: p.tshirt,
            sa_marketing_consent: p.saMarketingConsent,
          })),
          shared: {
            include_recording: includeRecording,
            coupon_code: couponResult?.valid ? couponCode.trim().toUpperCase() : '',
            billing_nif: billingNif.trim(),
            billing_name: resolvedBillingName,
            billing_email: resolvedBillingEmail,
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
  if (!ticketData) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
      Não foi possível carregar as informações do bilhete.
    </div>
  );

  const p = participants[activeTab] || participants[0];

  // Valores resolvidos para faturação
  const resolvedBillingName = billingNameType === 'company'
    ? billingNameCompany
    : `${participants[billingNameIndex]?.firstName || ''} ${participants[billingNameIndex]?.lastName || ''}`.trim();
  const resolvedBillingEmail = billingEmailIndex < participants.length
    ? participants[billingEmailIndex]?.email || ''
    : billingEmailOther;

  const isParticipantComplete = (pt: ParticipantForm) => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pt.email.trim());
    return pt.firstName.trim() && pt.lastName.trim() && emailOk && pt.tshirt &&
      (pt.jobFunction !== 'Outros' || pt.jobFunctionOther.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4">

      {/* Linha 1: título centralizado (X fica absoluto via Modal) */}
      <h3 className="text-xl font-bold text-brand-darkBlue text-center pr-8 mb-3">
        Comprar {quantity > 1 ? 'Bilhetes' : 'Bilhete'}
      </h3>

      {/* Linha 2: quantidade à esquerda + tabs à direita */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm text-gray-500">Qtd:</span>
          <button type="button" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-colors font-bold text-lg leading-none">−</button>
          <span className="w-5 text-center font-bold text-brand-darkBlue">{quantity}</span>
          <button type="button" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= 5}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-colors font-bold text-lg leading-none">+</button>
        </div>

        {/* Tabs dos participantes à direita da quantidade */}
        {quantity > 1 && (
          <div className="flex gap-1 overflow-x-auto flex-1">
            {participants.map((pt, i) => (
              <button key={i} type="button" onClick={() => setActiveTab(i)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                  i === activeTab
                    ? 'bg-brand-orange text-white'
                    : isParticipantComplete(pt)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {isParticipantComplete(pt) ? '✓ ' : ''}{pt.firstName || `P${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulário do participante activo */}
      <div className="space-y-4">
        {quantity > 1 && (
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Participante {activeTab + 1} de {quantity}
          </p>
        )}

        {/* Nome + Apelido */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome" required value={p.firstName}
            onChange={e => updateParticipant(activeTab, { firstName: e.target.value })} />
          <Input label="Apelido" required value={p.lastName}
            onChange={e => updateParticipant(activeTab, { lastName: e.target.value })} />
        </div>

        {/* Email + T-Shirt */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="E-mail" type="email" required value={p.email}
            onChange={e => {
              updateParticipant(activeTab, { email: e.target.value });
              if (activeTab === 0) setCouponResult(null);
            }} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              T-Shirt <span className="text-red-500">*</span>
            </label>
            <select required value={p.tshirt} onChange={e => updateParticipant(activeTab, { tshirt: e.target.value })}
              className={selectClass}>
              <option value="" disabled>Tamanho...</option>
              {TSHIRTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Empresa + Cargo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Empresa</label>
            <input type="text" value={p.company} onChange={e => updateParticipant(activeTab, { company: e.target.value })}
              className={fieldClass} />
            {/* Copiar empresa de outro participante */}
            {participants.some((pt, i) => i !== activeTab && pt.company.trim()) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {participants.map((pt, i) => i !== activeTab && pt.company.trim() ? (
                  <button key={i} type="button"
                    onClick={() => updateParticipant(activeTab, { company: pt.company })}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-brand-orange hover:text-white transition-colors">
                    ↩ {pt.firstName || `P${i + 1}`}: {pt.company}
                  </button>
                ) : null)}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cargo</label>
            <input type="text" value={p.jobTitle} onChange={e => updateParticipant(activeTab, { jobTitle: e.target.value })}
              className={fieldClass} />
          </div>
        </div>

        {/* Função + País */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Função</label>
            <select value={p.jobFunction}
              onChange={e => updateParticipant(activeTab, { jobFunction: e.target.value, jobFunctionOther: '' })}
              className={selectClass}>
              <option value="">Seleciona…</option>
              {JOB_FUNCTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">País</label>
            <select value={p.country} onChange={e => updateParticipant(activeTab, { country: e.target.value })}
              className={selectClass}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {p.jobFunction === 'Outros' && (
          <Input label="Qual a sua função?" required value={p.jobFunctionOther}
            onChange={e => updateParticipant(activeTab, { jobFunctionOther: e.target.value })} />
        )}

        {/* Marketing consent (opcional, por participante) */}
        <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
          <input id={`mc-${activeTab}`} type="checkbox" checked={p.saMarketingConsent}
            onChange={e => updateParticipant(activeTab, { saMarketingConsent: e.target.checked })}
            className="mt-1 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue flex-shrink-0" />
          <label htmlFor={`mc-${activeTab}`} className="ml-3 text-xs text-gray-600 leading-relaxed">
            Gostava de uma assinatura gratuita de 2 anos da Scrum Alliance*! Para permitir que a
            Scrum Alliance me envie um convite por e-mail para ativar minha assinatura, concordo
            com a transferência das minhas informações pessoais de acordo com a{' '}
            <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-brand-blue font-bold hover:underline">Política de Privacidade da Scrum Alliance</a>.
          </label>
        </div>
      </div>

      {/* Secção partilhada — gravação, valor, cupão, NIF */}
      <div onClick={() => setIncludeRecording(v => !v)}
        className={`cursor-pointer flex items-start gap-3 rounded-lg border p-3 transition-colors ${
          includeRecording ? 'border-brand-orange bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}>
        <input id="includeRecording" type="checkbox" checked={includeRecording}
          onChange={e => setIncludeRecording(e.target.checked)}
          onClick={e => e.stopPropagation()}
          className="mt-0.5 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange" />
        <label htmlFor="includeRecording" className="cursor-pointer text-sm text-gray-700 leading-snug">
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <Video className="w-3.5 h-3.5 text-brand-orange" /> Acesso à Gravação do Evento
          </span>
          <span className="text-gray-500">
            Vídeos de todas as sessões{' '}
            <span className="font-bold text-brand-orange">+€10,00/pessoa</span>
            {quantity > 1 && (
              <span className="text-gray-400"> = {ticketData ? formatCurrency(recordingPricePerPerson * quantity, ticketData.currency) : ''}</span>
            )}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Valor total"
          value={ticketData ? formatCurrency(totalPrice, ticketData.currency) : '—'}
          readOnly
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cupão de Desconto</label>
          <div className="flex gap-2">
            <input type="text" value={couponCode}
              onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
              placeholder="Código do cupão"
              className="flex-1 block border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" />
            <button type="button" onClick={handleApplyCoupon}
              disabled={couponStatus === 'loading' || !couponCode.trim()}
              className="rounded-md border border-gray-300 px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-60 text-sm font-medium text-brand-orange whitespace-nowrap">
              {couponStatus === 'loading' ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponResult?.message && (
            <div className={`mt-2 flex items-center gap-2 text-sm ${couponResult.valid ? 'text-green-700' : 'text-red-700'}`}>
              {couponResult.valid && <CheckCircle2 className="w-4 h-4" />}
              <span>{couponResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dados de faturação */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="text-sm font-semibold text-brand-darkBlue">Dados para Fatura</div>

        {/* Nome na fatura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome na fatura</label>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setBillingNameType('participant')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${billingNameType === 'participant' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Pessoa física
            </button>
            <button type="button" onClick={() => setBillingNameType('company')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${billingNameType === 'company' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Empresa
            </button>
          </div>
          {billingNameType === 'participant' ? (
            <select value={billingNameIndex} onChange={e => setBillingNameIndex(Number(e.target.value))} className={selectClass}>
              {participants.map((pt, i) => (
                <option key={i} value={i}>
                  {`${pt.firstName} ${pt.lastName}`.trim() || `Participante ${i + 1}`}
                </option>
              ))}
            </select>
          ) : (
            <input type="text" value={billingNameCompany} onChange={e => setBillingNameCompany(e.target.value)}
              placeholder="Nome da empresa" className={fieldClass} />
          )}
        </div>

        {/* Email para fatura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email para fatura</label>
          <select
            value={billingEmailIndex < participants.length ? billingEmailIndex : participants.length}
            onChange={e => setBillingEmailIndex(Number(e.target.value))}
            className={selectClass}>
            {participants.map((pt, i) => (
              <option key={i} value={i}>
                {pt.email || `Participante ${i + 1}`}{i === 0 ? ' (principal)' : ''}
              </option>
            ))}
            <option value={participants.length}>Outro email…</option>
          </select>
          {billingEmailIndex >= participants.length && (
            <input type="email" value={billingEmailOther} onChange={e => setBillingEmailOther(e.target.value)}
              placeholder="email@exemplo.com" className={`${fieldClass} mt-2`} />
          )}
        </div>

        {/* NIF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIF / Tax ID <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <input type="text" value={billingNif} onChange={e => setBillingNif(e.target.value)}
            placeholder="Ex: 808392190" className={fieldClass} />
          <p className="mt-1 text-xs text-gray-400">Pode também preencher ou alterar no Stripe durante o pagamento.</p>
        </div>
      </div>

      {/* Termos & Privacidade */}
      <div className="pt-4 mt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-brand-darkBlue font-bold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-orange" />
          Termos & Privacidade
        </div>
        <div className="space-y-3">
          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input id="saConsent1" type="checkbox" required checked={saDataSharingConsent}
              onChange={e => setSaDataSharingConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <label htmlFor="saConsent1" className="ml-3 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-red-500">*</span> Concordo que o Organizador (TugÁgil)
              pode partilhar as informações pessoais dos participantes com a Scrum Alliance exclusivamente
              para fins de análise de dados internos e emissão de SEUs. Consulte a{' '}
              <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer"
                className="text-brand-blue font-bold hover:underline">Política de Privacidade da Scrum Alliance</a>.
            </label>
          </div>

          <div className="flex items-start">
            <input id="privacy" type="checkbox" required checked={privacyConsent}
              onChange={e => setPrivacyConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
              <span className="font-bold text-red-500">*</span> Estou de acordo com a{' '}
              <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo/edit?usp=sharing"
                target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">
                Política de Privacidade de Dados
              </a>{' '}
              do evento{quantity > 1 ? ' e confirmo que todos os participantes autorizaram o tratamento dos seus dados' : ''}.
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">Pagamento seguro via Stripe</p>
      </div>

      {(() => {
        const isEmpty = (pt: ParticipantForm) => !pt.firstName.trim() && !pt.lastName.trim() && !pt.email.trim();
        const firstIncomplete = participants.findIndex(pt => isEmpty(pt));
        if (firstIncomplete !== -1) {
          return (
            <Button type="button" className="w-full text-lg" variant="secondary"
              onClick={() => setActiveTab(firstIncomplete)}>
              Preencher Participante {firstIncomplete + 1}
            </Button>
          );
        }
        return (
          <Button type="submit" isLoading={buyStatus === 'loading'} className="w-full text-lg"
            variant="secondary" disabled={!ticketData.active}>
            <Ticket className="w-5 h-5 mr-2" />
            {ticketData.active ? 'Avançar para Pagamento' : 'Lote Indisponível'}
          </Button>
        );
      })()}
    </form>
  );
};

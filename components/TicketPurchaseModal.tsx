import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  jobFunction: string;
  jobFunctionOther: string;
  industry: string;
  tshirt: string;
  saMarketingConsent: boolean;
};

const RECORDING_PRICE = 1000;

const JOB_FUNCTIONS = [
  'Atendimento ao Cliente', 'Engenharia', 'Executivo', 'Financeiro',
  'Recursos Humanos', 'Tecnologia da Informação', 'Jurídico',
  'Marketing e Vendas', 'Operações', 'Gestão de Produtos',
  'Serviços Profissionais', 'Gerenciamento de projetos', 'Pesquisa',
  'Cadeia de suprimentos e manufatura', 'Treinamento e Educação', 'Outros',
];

const COUNTRIES = ['Portugal', 'Espanha', 'França', 'Alemanha', 'Reino Unido', 'Brasil', 'Estados Unidos', 'Outro'];
const TSHIRTS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const emptyParticipant = (): ParticipantForm => ({
  firstName: '', lastName: '', email: '', country: 'Portugal',
  company: '', jobFunction: '', jobFunctionOther: '',
  industry: '', tshirt: '', saMarketingConsent: false,
});

const iMatch = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const fieldClass = 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue';
const selectClass = `${fieldClass} bg-white text-gray-900`;

// Dropdown customizado com fallback para todas as opções quando sem correspondência
type ComboInputProps = {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (val: string) => void;
  onBlurEmpty?: () => void;
  options: string[];
  placeholder?: string;
  className?: string;
  type?: string;
  id?: string;
};
const ComboInput: React.FC<ComboInputProps> = ({
  value, onChange, onSelect, onBlurEmpty, options, placeholder, className, type = 'text', id,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? options.filter(o => o.toLowerCase().includes(value.toLowerCase()))
    : options;
  const shown = filtered.length > 0 ? filtered : options;

  return (
    <div ref={containerRef} className="relative">
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => { if (options.length > 0) setOpen(true); }}
        onBlur={e => {
          if (containerRef.current?.contains(e.relatedTarget as Node)) return;
          setOpen(false);
          if (!value.trim()) onBlurEmpty?.();
        }}
        id={id}
        className={className}
      />
      {open && shown.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
          {shown.map((opt, i) => (
            <li key={i}
              onMouseDown={e => { e.preventDefault(); onChange(opt); onSelect?.(opt); setOpen(false); }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-brand-orange">
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const TicketPurchaseModal: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [participants, setParticipants] = useState<ParticipantForm[]>([emptyParticipant()]);
  const [activeTab, setActiveTab] = useState(0);

  const [includeRecording, setIncludeRecording] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [billingNif, setBillingNif] = useState('');
  const [billingNameType, setBillingNameType] = useState<'participant' | 'company'>('participant');
  const [billingNameValue, setBillingNameValue] = useState('');
  const [billingEmailIndex, setBillingEmailIndex] = useState(0);
  const [billingEmailOther, setBillingEmailOther] = useState('');
  const [saDataSharingConsent, setSaDataSharingConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading'>('idle');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading'>('idle');
  const [couponResult, setCouponResult] = useState<CouponState | null>(null);
  const [ticketData, setTicketData] = useState<TicketTypeData | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  // Quando scrollTarget muda, aguarda re-render e centra o campo no ecrã
  // Quando scrollTarget muda, aguarda re-render, centra o campo e foca-o
  useEffect(() => {
    if (!scrollTarget) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(scrollTarget);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
      setScrollTarget(null);
    }, 80);
    return () => clearTimeout(timer);
  }, [scrollTarget]);

  // Auto-comuta para "Empresa" se o valor actual de faturação coincidir com uma empresa entretanto preenchida
  useEffect(() => {
    if (billingNameType === 'participant' && billingNameValue.trim()) {
      const companies = participants.map(pt => pt.company.trim()).filter(Boolean);
      if (companies.some(c => iMatch(c, billingNameValue))) setBillingNameType('company');
    }
  }, [participants.map(pt => pt.company).join('\x00')]);

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
    setShowErrors(false);
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

  // Sequência ordenada de campos obrigatórios — retorna o primeiro inválido
  const getFirstInvalidField = (): { id: string; tab: number } | null => {
    for (let i = 0; i < participants.length; i++) {
      const pt = participants[i];
      if (!pt.firstName.trim())                                          return { id: `p${i}-firstName`,        tab: i };
      if (!pt.lastName.trim())                                           return { id: `p${i}-lastName`,         tab: i };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pt.email.trim()))         return { id: `p${i}-email`,            tab: i };
      if (!pt.tshirt)                                                    return { id: `p${i}-tshirt`,           tab: i };
      if (!pt.company.trim())                                            return { id: `p${i}-company`,          tab: i };
      if (!pt.jobFunction)                                               return { id: `p${i}-jobFunction`,      tab: i };
      if (pt.jobFunction === 'Outros' && !pt.jobFunctionOther.trim())   return { id: `p${i}-jobFunctionOther`, tab: i };
      if (!pt.industry.trim())                                           return { id: `p${i}-industry`,         tab: i };
      if (!pt.country)                                                   return { id: `p${i}-country`,          tab: i };
    }
    if (!saDataSharingConsent) return { id: 'saConsent1', tab: -1 };
    if (!privacyConsent)       return { id: 'privacy',    tab: -1 };
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = getFirstInvalidField();
    if (invalid) {
      setShowErrors(true);
      if (invalid.tab !== -1) setActiveTab(invalid.tab);
      setScrollTarget(invalid.id);
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
          participants: participants.map(p => ({
            first_name: p.firstName.trim(),
            last_name: p.lastName.trim(),
            email: p.email.trim(),
            country: p.country,
            company: p.company.trim(),
            job_function: p.jobFunction,
            job_function_other: p.jobFunction === 'Outros' ? p.jobFunctionOther.trim() : '',
            industry: p.industry.trim(),
            tshirt: p.tshirt,
            sa_marketing_consent: p.saMarketingConsent,
          })),
          shared: {
            include_recording: includeRecording,
            coupon_code: couponResult?.valid ? couponCode.trim().toUpperCase() : '',
            billing_nif: billingNif.trim(),
            billing_name: resolvedBillingName,
            billing_name_type: billingNameType,
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
  const billingNameSuggestion = billingNameType === 'participant'
    ? `${participants[0]?.firstName || ''} ${participants[0]?.lastName || ''}`.trim()
    : participants.map(pt => pt.company.trim()).filter(Boolean)[0] || '';
  const billingNameOptions = billingNameType === 'participant'
    ? participants.map(pt => `${pt.firstName} ${pt.lastName}`.trim()).filter(Boolean)
    : [...new Set(participants.map(pt => pt.company).filter(Boolean))];
  const resolvedBillingName = billingNameValue || billingNameSuggestion;
  const resolvedBillingEmail = billingEmailIndex < participants.length
    ? participants[billingEmailIndex]?.email || ''
    : billingEmailOther;

  const isParticipantComplete = (pt: ParticipantForm) => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pt.email.trim());
    return pt.firstName.trim() && pt.lastName.trim() && emailOk && pt.tshirt &&
      pt.company.trim() && pt.jobFunction && pt.industry.trim() && pt.country &&
      (pt.jobFunction !== 'Outros' || pt.jobFunctionOther.trim());
  };

  const participantHasData = (pt: ParticipantForm) =>
    !!(pt.firstName.trim() || pt.lastName.trim() || pt.email.trim() || pt.tshirt || pt.company.trim());

  const errClass = (invalid: boolean) => invalid
    ? 'mt-1 block w-full border border-red-500 rounded-md shadow-sm p-2 text-sm focus:ring-red-500 focus:border-red-500'
    : fieldClass;

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4">

      {/* Linha 1: título centralizado (X fica absoluto via Modal) */}
      <h3 className="text-xl font-bold text-brand-darkBlue text-center pr-8 mb-3">
        Comprar {quantity > 1 ? 'Bilhetes' : 'Bilhete'}
      </h3>

      {/* Linha 2: quantidade + abas tipo pasta */}
      <div className="flex items-end gap-3">
        <div className="flex items-center gap-1.5 shrink-0 pb-1.5">
          <span className="text-sm text-gray-500">Qtd:</span>
          <button type="button" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-colors font-bold text-lg leading-none">−</button>
          <span className="w-5 text-center font-bold text-brand-darkBlue">{quantity}</span>
          <button type="button" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= 5}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-colors font-bold text-lg leading-none">+</button>
        </div>

        {quantity > 1 && (
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {participants.map((pt, i) => {
              const complete = isParticipantComplete(pt);
              const hasData = participantHasData(pt);
              const isActive = i === activeTab;
              const prefix = complete ? '✓ ' : hasData ? '! ' : '';
              const tabCls = isActive
                ? 'bg-white border-orange-200 text-brand-orange z-10'
                : complete
                  ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                  : hasData && showErrors
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : hasData
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100';
              return (
                <button key={i} type="button" onClick={() => setActiveTab(i)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-t-lg border-t border-l border-r -mb-px transition-colors whitespace-nowrap relative ${tabCls}`}>
                  {prefix}{pt.firstName || `P${i + 1}`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Banner de erro — campos em falta no tab activo */}
      {showErrors && !isParticipantComplete(p) && (
        <div className="bg-red-50 border border-red-400 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-red-600 text-sm font-medium">
            Preenche os campos obrigatórios assinalados a vermelho
            {quantity > 1 ? ` do Participante ${activeTab + 1}` : ''}.
          </span>
        </div>
      )}

      {/* Formulário do participante activo */}
      <div className={quantity > 1
        ? 'space-y-4 border border-orange-200 rounded-b-xl rounded-tr-xl p-4 bg-white relative'
        : 'space-y-4'}>

        {/* Nome + Apelido */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-red-500">*</span></label>
            <input id={`p${activeTab}-firstName`} value={p.firstName} onChange={e => updateParticipant(activeTab, { firstName: e.target.value })}
              className={errClass(showErrors && !p.firstName.trim())} />
            {showErrors && !p.firstName.trim() && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apelido <span className="text-red-500">*</span></label>
            <input id={`p${activeTab}-lastName`} value={p.lastName} onChange={e => updateParticipant(activeTab, { lastName: e.target.value })}
              className={errClass(showErrors && !p.lastName.trim())} />
            {showErrors && !p.lastName.trim() && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
          </div>
        </div>

        {/* Email + T-Shirt */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail <span className="text-red-500">*</span></label>
            <input id={`p${activeTab}-email`} type="email" value={p.email}
              onChange={e => { updateParticipant(activeTab, { email: e.target.value }); if (activeTab === 0) setCouponResult(null); }}
              className={errClass(showErrors && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()))} />
            {showErrors && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()) && <p className="text-xs text-red-500 mt-1">Email inválido</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              T-Shirt <span className="text-red-500">*</span>
            </label>
            <select id={`p${activeTab}-tshirt`} value={p.tshirt} onChange={e => updateParticipant(activeTab, { tshirt: e.target.value })}
              className={showErrors && !p.tshirt ? `${selectClass} border-red-500 focus:ring-red-500 focus:border-red-500` : selectClass}>
              <option value="" disabled>Tamanho...</option>
              {TSHIRTS.map(s => <option key={s}>{s}</option>)}
            </select>
            {showErrors && !p.tshirt && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
          </div>
        </div>

        {/* Empresa + Função */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa <span className="text-red-500">*</span></label>
            {(() => {
              const otherCompanies = [...new Set(participants.filter((_, i) => i !== activeTab).map(pt => pt.company).filter(Boolean))];
              const companySuggestion = otherCompanies[0] || '';
              const isInvalid = showErrors && !p.company.trim();
              return (
                <>
                  <ComboInput
                    id={`p${activeTab}-company`}
                    value={p.company}
                    onChange={val => updateParticipant(activeTab, { company: val })}
                    onBlurEmpty={() => { if (companySuggestion) updateParticipant(activeTab, { company: companySuggestion }); }}
                    options={otherCompanies}
                    placeholder={companySuggestion || 'Nome da empresa'}
                    className={isInvalid
                      ? 'mt-1 block w-full border border-red-500 rounded-md shadow-sm p-2 text-sm focus:ring-red-500 focus:border-red-500'
                      : fieldClass}
                  />
                  {isInvalid && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
                </>
              );
            })()}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função <span className="text-red-500">*</span></label>
            <select id={`p${activeTab}-jobFunction`} value={p.jobFunction}
              onChange={e => updateParticipant(activeTab, { jobFunction: e.target.value, jobFunctionOther: '' })}
              className={showErrors && !p.jobFunction ? `${selectClass} border-red-500 focus:ring-red-500 focus:border-red-500` : selectClass}>
              <option value="">Seleciona…</option>
              {JOB_FUNCTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
            {showErrors && !p.jobFunction && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
          </div>
        </div>

        {p.jobFunction === 'Outros' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qual a sua função? <span className="text-red-500">*</span></label>
            <input id={`p${activeTab}-jobFunctionOther`} value={p.jobFunctionOther} onChange={e => updateParticipant(activeTab, { jobFunctionOther: e.target.value })}
              className={errClass(showErrors && !p.jobFunctionOther.trim())} />
            {showErrors && !p.jobFunctionOther.trim() && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
          </div>
        )}

        {/* Indústria + País */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indústria <span className="text-red-500">*</span></label>
            <input id={`p${activeTab}-industry`} type="text" value={p.industry}
              onChange={e => updateParticipant(activeTab, { industry: e.target.value })}
              placeholder="Ex: Tecnologia, Saúde…"
              className={errClass(showErrors && !p.industry.trim())} />
            {showErrors && !p.industry.trim() && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País <span className="text-red-500">*</span></label>
            <select id={`p${activeTab}-country`} value={p.country}
              onChange={e => updateParticipant(activeTab, { country: e.target.value })}
              className={selectClass}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

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
            <button type="button" onClick={() => {
              setBillingNameType('participant');
              // Limpa só se o valor era claramente um nome de empresa de um participante
              const companies = participants.map(pt => pt.company.trim()).filter(Boolean);
              if (companies.some(c => iMatch(c, billingNameValue))) setBillingNameValue('');
            }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${billingNameType === 'participant' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Pessoa física
            </button>
            <button type="button" onClick={() => {
              setBillingNameType('company');
              // Limpa só se o valor era claramente um nome de pessoa dos participantes
              const names = participants.map(pt => `${pt.firstName} ${pt.lastName}`.trim()).filter(Boolean);
              if (names.some(n => iMatch(n, billingNameValue))) setBillingNameValue('');
            }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${billingNameType === 'company' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Empresa
            </button>
          </div>
          <ComboInput
            value={billingNameValue}
            onChange={val => {
              setBillingNameValue(val);
              const companies = participants.map(pt => pt.company.trim()).filter(Boolean);
              if (companies.some(c => iMatch(c, val))) setBillingNameType('company');
            }}
            onSelect={val => {
              const companies = participants.map(pt => pt.company.trim()).filter(Boolean);
              if (companies.some(c => iMatch(c, val))) setBillingNameType('company');
            }}
            onBlurEmpty={() => { if (billingNameSuggestion) setBillingNameValue(billingNameSuggestion); }}
            options={billingNameOptions}
            placeholder={billingNameSuggestion || (billingNameType === 'participant' ? 'Nome do participante' : 'Nome da empresa')}
            className={fieldClass}
          />
        </div>

        {/* Email para fatura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email para fatura</label>
          <ComboInput
            type="email"
            value={resolvedBillingEmail}
            onChange={val => {
              const match = participants.findIndex(pt => pt.email.trim() === val.trim());
              if (match !== -1) { setBillingEmailIndex(match); }
              else { setBillingEmailIndex(participants.length); setBillingEmailOther(val); }
            }}
            options={participants.filter(pt => pt.email.trim()).map(pt => pt.email)}
            placeholder="email@exemplo.com"
            className={fieldClass}
          />
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
          <div className={`flex items-start p-3 rounded-lg border transition-colors ${showErrors && !saDataSharingConsent ? 'bg-red-50 border-red-400 border-red-500' : 'bg-gray-50 border-gray-200'}`}>
            <input id="saConsent1" type="checkbox" checked={saDataSharingConsent}
              onChange={e => setSaDataSharingConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <div className="ml-3">
              <label htmlFor="saConsent1" className="text-xs text-gray-600 leading-relaxed">
                <span className="font-bold text-red-500">*</span> Concordo que o Organizador (TugÁgil)
                pode partilhar as informações pessoais dos participantes com a Scrum Alliance exclusivamente
                para fins de análise de dados internos e emissão de SEUs. Consulte a{' '}
                <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer"
                  className="text-brand-blue font-bold hover:underline">Política de Privacidade da Scrum Alliance</a>.
              </label>
              {showErrors && !saDataSharingConsent && (
                <p className="text-xs text-red-600 font-medium mt-1">Consentimento obrigatório para continuar.</p>
              )}
            </div>
          </div>

          <div className={`flex items-start p-3 rounded-lg border transition-colors ${showErrors && !privacyConsent ? 'bg-red-50 border-red-500' : 'border-transparent'}`}>
            <input id="privacy" type="checkbox" checked={privacyConsent}
              onChange={e => setPrivacyConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <div className="ml-3">
              <label htmlFor="privacy" className="text-sm text-gray-600">
                <span className="font-bold text-red-500">*</span> Estou de acordo com a{' '}
                <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo/edit?usp=sharing"
                  target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">
                  Política de Privacidade de Dados
                </a>{' '}
                do evento{quantity > 1 ? ' e confirmo que todos os participantes autorizaram o tratamento dos seus dados' : ''}.
              </label>
              {showErrors && !privacyConsent && (
                <p className="text-xs text-red-600 font-medium mt-1">Consentimento obrigatório para continuar.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">Pagamento seguro via Stripe</p>
      </div>

      {(() => {
        // Se há participante incompleto noutro tab, guia directamente para lá
        const firstOtherBad = participants.findIndex((pt, i) => i !== activeTab && !isParticipantComplete(pt));
        if (firstOtherBad !== -1) {
          return (
            <Button type="button" className="w-full text-lg" variant="secondary"
              onClick={() => {
                setShowErrors(true);
                setActiveTab(firstOtherBad);
                const inv = getFirstInvalidField();
                if (inv) setScrollTarget(inv.id);
              }}>
              Completar Participante {firstOtherBad + 1}
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

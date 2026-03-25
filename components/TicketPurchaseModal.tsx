import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from './UIComponents';
import { CheckCircle2, ChevronLeft, ChevronRight, Lock, ShieldCheck, Ticket, Users, Video } from 'lucide-react';

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

type SharedForm = {
  includeRecording: boolean;
  couponCode: string;
  billingNif: string;
  saDataSharingConsent: boolean;
  privacyConsent: boolean;
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

function selectClass() {
  return 'w-full bg-white text-gray-900 border-gray-300 rounded-md p-2 border shadow-sm focus:ring-brand-blue focus:border-brand-blue text-sm';
}

export const TicketPurchaseModal: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [quantity, setQuantity] = useState(1);
  const [participants, setParticipants] = useState<ParticipantForm[]>([emptyParticipant()]);
  const [currentP, setCurrentP] = useState(0);
  const [shared, setShared] = useState<SharedForm>({
    includeRecording: true, couponCode: '', billingNif: '',
    saDataSharingConsent: false, privacyConsent: false,
  });

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
    setQuantity(q);
    setParticipants(prev => {
      if (q > prev.length) return [...prev, ...Array(q - prev.length).fill(null).map(emptyParticipant)];
      return prev.slice(0, q);
    });
    setCurrentP(0);
  };

  const updateParticipant = (index: number, patch: Partial<ParticipantForm>) => {
    setParticipants(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p));
  };

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
    if (!shared.includeRecording) return 0;
    let p = RECORDING_PRICE;
    if (couponResult?.valid && couponResult.recordingOnly) {
      if (couponResult.discountAmount != null) p = Math.max(0, RECORDING_PRICE - couponResult.discountAmount);
      else if (couponResult.discountPercent != null) {
        const rawDiscount = Math.round((originalPrice + RECORDING_PRICE) * couponResult.discountPercent / 100);
        p = Math.max(0, RECORDING_PRICE - Math.min(rawDiscount, RECORDING_PRICE));
      }
    }
    return p;
  }, [shared.includeRecording, couponResult, originalPrice]);

  const totalPrice = pricePerTicket * quantity + recordingPrice;

  const handleApplyCoupon = async () => {
    const code = shared.couponCode.trim().toUpperCase();
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
      if (data.recordingOnly && !shared.includeRecording) {
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

  const handleSubmit = async () => {
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
            include_recording: shared.includeRecording,
            coupon_code: couponResult?.valid ? shared.couponCode.trim().toUpperCase() : '',
            billing_nif: shared.billingNif.trim(),
            sa_data_sharing_consent: shared.saDataSharingConsent,
            privacy_consent: shared.privacyConsent,
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

  // ─── Validation helpers ───────────────────────────────────────────────────
  const isParticipantValid = (p: ParticipantForm) => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim());
    return p.firstName.trim() && p.lastName.trim() && emailOk && p.tshirt &&
      (p.jobFunction !== 'Outros' || p.jobFunctionOther.trim());
  };

  const allParticipantsValid = participants.every(isParticipantValid);
  const sharedValid = shared.saDataSharingConsent && shared.privacyConsent;

  // ─── Loading / error states ───────────────────────────────────────────────
  if (loadingTicket) return <div className="py-8 text-center text-gray-500">A carregar informações do bilhete...</div>;
  if (!ticketData) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
      Não foi possível carregar as informações do bilhete.
    </div>
  );

  // ─── Step indicator ───────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-5">
      {([1, 2, 3, 4] as const).map(s => (
        <React.Fragment key={s}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            s < step ? 'bg-green-500 text-white' : s === step ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-400'
          }`}>{s < step ? '✓' : s}</div>
          {s < 4 && <div className={`h-0.5 w-6 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  // ─── STEP 1: Quantity ─────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="text-left space-y-5">
      <StepIndicator />
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-brand-darkBlue font-bold text-base mb-1">
          <Users className="w-5 h-5 text-brand-orange" /> Quantos bilhetes?
        </div>
        <p className="text-sm text-gray-500">Podes comprar até 5 bilhetes numa única compra.</p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => quantity > 1 && handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-500 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-colors"
        >−</button>
        <span className="w-16 text-center text-4xl font-black text-brand-darkBlue">{quantity}</span>
        <button
          type="button"
          onClick={() => quantity < 5 && handleQuantityChange(quantity + 1)}
          disabled={quantity >= 5}
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-500 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-colors"
        >+</button>
      </div>

      <div className="text-center text-sm text-gray-500">
        {quantity === 1
          ? 'Bilhete individual'
          : `${quantity} bilhetes — ${formatCurrency(originalPrice * quantity, ticketData.currency)}`}
      </div>

      <Button variant="secondary" className="w-full text-lg" onClick={() => setStep(2)}>
        Avançar <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );

  // ─── STEP 2: Per-participant form ─────────────────────────────────────────
  if (step === 2) {
    const p = participants[currentP];
    const isLast = currentP === quantity - 1;
    const pValid = isParticipantValid(p);

    return (
      <div className="text-left space-y-4">
        <StepIndicator />

        {/* Participant tabs */}
        {quantity > 1 && (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {participants.map((pt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentP(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  i === currentP
                    ? 'bg-brand-orange text-white'
                    : isParticipantValid(pt)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isParticipantValid(pt) ? '✓ ' : ''}{pt.firstName || `Participante ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        <div className="text-sm font-semibold text-brand-darkBlue">
          Participante {currentP + 1} de {quantity}
        </div>

        {/* Nome + Apelido */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nome" required value={p.firstName}
            onChange={e => updateParticipant(currentP, { firstName: e.target.value })} />
          <Input label="Apelido" required value={p.lastName}
            onChange={e => updateParticipant(currentP, { lastName: e.target.value })} />
        </div>

        {/* Email */}
        <Input label="E-mail" type="email" required value={p.email}
          onChange={e => {
            updateParticipant(currentP, { email: e.target.value });
            if (currentP === 0) setCouponResult(null);
          }} />

        {/* Empresa + Cargo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input type="text" value={p.company} onChange={e => updateParticipant(currentP, { company: e.target.value })}
              className="mt-0 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input type="text" value={p.jobTitle} onChange={e => updateParticipant(currentP, { jobTitle: e.target.value })}
              className="mt-0 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" />
          </div>
        </div>

        {/* Função + País */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
            <select value={p.jobFunction}
              onChange={e => updateParticipant(currentP, { jobFunction: e.target.value, jobFunctionOther: '' })}
              className={selectClass()}>
              <option value="">Seleciona…</option>
              {JOB_FUNCTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <select value={p.country} onChange={e => updateParticipant(currentP, { country: e.target.value })}
              className={selectClass()}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {p.jobFunction === 'Outros' && (
          <Input label="Qual a sua função?" required value={p.jobFunctionOther}
            onChange={e => updateParticipant(currentP, { jobFunctionOther: e.target.value })} />
        )}

        {/* T-Shirt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamanho T-Shirt <span className="text-red-500">*</span>
          </label>
          <select required value={p.tshirt} onChange={e => updateParticipant(currentP, { tshirt: e.target.value })}
            className={selectClass()}>
            <option value="" disabled>Selecione um tamanho...</option>
            {TSHIRTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Marketing consent (optional, per participant) */}
        <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
          <input id={`mc-${currentP}`} type="checkbox" checked={p.saMarketingConsent}
            onChange={e => updateParticipant(currentP, { saMarketingConsent: e.target.checked })}
            className="mt-1 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue flex-shrink-0" />
          <label htmlFor={`mc-${currentP}`} className="ml-3 text-xs text-gray-600 leading-relaxed">
            Gostava de uma assinatura gratuita de 2 anos da Scrum Alliance! Para permitir que a Scrum Alliance envie
            um convite por e-mail, concordo com a transferência das minhas informações pessoais de acordo com a{' '}
            <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer"
              className="text-brand-blue font-bold hover:underline">Política de Privacidade da Scrum Alliance</a>.
          </label>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" type="button"
            onClick={() => currentP > 0 ? setCurrentP(currentP - 1) : setStep(1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {currentP > 0 ? 'Anterior' : 'Voltar'}
          </Button>
          {isLast ? (
            <Button variant="secondary" className="flex-1" type="button"
              disabled={!allParticipantsValid} onClick={() => setStep(3)}>
              Avançar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" type="button"
              disabled={!pValid} onClick={() => setCurrentP(currentP + 1)}>
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── STEP 3: Shared data ──────────────────────────────────────────────────
  if (step === 3) return (
    <div className="text-left space-y-4">
      <StepIndicator />

      {/* Recording */}
      <div
        onClick={() => setShared(s => ({ ...s, includeRecording: !s.includeRecording }))}
        className={`cursor-pointer flex items-start gap-3 rounded-lg border p-3 transition-colors ${
          shared.includeRecording ? 'border-brand-orange bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}
      >
        <input id="includeRecording" type="checkbox" checked={shared.includeRecording}
          onChange={e => setShared(s => ({ ...s, includeRecording: e.target.checked }))}
          onClick={e => e.stopPropagation()}
          className="mt-0.5 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
        <label htmlFor="includeRecording" className="cursor-pointer text-sm text-gray-700 leading-snug">
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <Video className="w-3.5 h-3.5 text-brand-orange" /> Acesso à Gravação do Evento
          </span>
          <span className="text-gray-500">Vídeos de todas as sessões <span className="font-bold text-brand-orange">+€10,00</span></span>
        </label>
      </div>

      {/* Coupon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cupão de Desconto</label>
        <div className="flex gap-2">
          <input type="text" value={shared.couponCode}
            onChange={e => { setShared(s => ({ ...s, couponCode: e.target.value.toUpperCase() })); setCouponResult(null); }}
            placeholder="Código do cupão"
            className="flex-1 block border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" />
          <button type="button" onClick={handleApplyCoupon}
            disabled={couponStatus === 'loading' || !shared.couponCode.trim()}
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

      {/* Billing NIF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          NIF / Tax ID para fatura <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <input type="text" value={shared.billingNif}
          onChange={e => setShared(s => ({ ...s, billingNif: e.target.value }))}
          placeholder="Ex: 808392190"
          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-blue focus:border-brand-blue" />
        <p className="mt-1 text-xs text-gray-400">Pode também preencher ou alterar no Stripe durante o pagamento.</p>
      </div>

      {/* Consents */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3 text-brand-darkBlue font-bold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-orange" /> Termos & Privacidade
        </div>
        <div className="space-y-3">
          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input id="saConsent1" type="checkbox" required checked={shared.saDataSharingConsent}
              onChange={e => setShared(s => ({ ...s, saDataSharingConsent: e.target.checked }))}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <label htmlFor="saConsent1" className="ml-3 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-red-500">*</span> Concordo que o Organizador (TugÁgil) pode partilhar
              as informações pessoais dos participantes com a Scrum Alliance exclusivamente para fins de análise de
              dados internos e emissão de SEUs. Consulte a{' '}
              <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer"
                className="text-brand-blue font-bold hover:underline">Política de Privacidade da Scrum Alliance</a>.
            </label>
          </div>

          <div className="flex items-start">
            <input id="privacy" type="checkbox" required checked={shared.privacyConsent}
              onChange={e => setShared(s => ({ ...s, privacyConsent: e.target.checked }))}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange flex-shrink-0" />
            <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
              <span className="font-bold text-red-500">*</span> Estou de acordo com a{' '}
              <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo/edit?usp=sharing"
                target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">
                Política de Privacidade de Dados
              </a>{' '}do evento e confirmo que todos os participantes desta compra autorizaram o tratamento dos seus dados.
            </label>
          </div>
        </div>
      </div>

      {/* Total preview */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700 flex justify-between items-center">
        <span>{quantity} bilhete{quantity > 1 ? 's' : ''}{shared.includeRecording ? ' + gravação' : ''}</span>
        <span className="font-bold text-brand-darkBlue text-base">
          {ticketData ? formatCurrency(totalPrice, ticketData.currency) : '—'}
        </span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" type="button" onClick={() => setStep(2)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button variant="secondary" className="flex-1" type="button"
          disabled={!sharedValid} onClick={() => setStep(4)}>
          Avançar <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // ─── STEP 4: Summary + Payment ────────────────────────────────────────────
  return (
    <div className="text-left space-y-4">
      <StepIndicator />

      <h3 className="font-bold text-brand-darkBlue text-base">Resumo da compra</h3>

      {/* Participants list */}
      <div className="space-y-2">
        {participants.map((p, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {i + 1}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">{p.firstName} {p.lastName}</div>
              <div className="text-xs text-gray-500 truncate">{p.email}</div>
            </div>
            <div className="ml-auto text-xs text-gray-400 flex-shrink-0">{p.tshirt}</div>
          </div>
        ))}
      </div>

      {/* Order details */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 text-sm">
        <div className="flex justify-between px-3 py-2">
          <span className="text-gray-500">{quantity}× {ticketData.name}</span>
          <span className="text-gray-800">{formatCurrency(pricePerTicket * quantity, ticketData.currency)}</span>
        </div>
        {shared.includeRecording && (
          <div className="flex justify-between px-3 py-2">
            <span className="text-gray-500 flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Gravação</span>
            <span className="text-gray-800">{formatCurrency(recordingPrice, ticketData.currency)}</span>
          </div>
        )}
        {couponResult?.valid && (
          <div className="flex justify-between px-3 py-2 text-green-700">
            <span>Cupão {couponResult.code}</span>
            <span>aplicado</span>
          </div>
        )}
        <div className="flex justify-between px-3 py-2 font-bold text-brand-darkBlue">
          <span>Total</span>
          <span>{formatCurrency(totalPrice, ticketData.currency)}</span>
        </div>
      </div>

      {shared.billingNif && (
        <p className="text-xs text-gray-500">NIF para fatura: <strong>{shared.billingNif}</strong></p>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">Pagamento seguro via Stripe. Será redirecionado para a página de pagamento.</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" type="button" onClick={() => setStep(3)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button variant="secondary" className="flex-1 text-lg" type="button"
          isLoading={buyStatus === 'loading'} disabled={!ticketData.active || buyStatus === 'loading'}
          onClick={handleSubmit}>
          <Ticket className="w-5 h-5 mr-2" />
          {ticketData.active ? 'Pagar agora' : 'Lote Indisponível'}
        </Button>
      </div>
    </div>
  );
};

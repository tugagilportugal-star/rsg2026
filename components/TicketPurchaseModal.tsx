import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from './UIComponents';
import { CheckCircle2, Lock, ShieldCheck, Ticket, TicketPercent, Video } from 'lucide-react';

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

const RECORDING_PRICE = 1000; // €10,00 em cêntimos

export const TicketPurchaseModal: React.FC = () => {
  const [ticketForm, setTicketForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nif: '',
    company: '',
    jobTitle: '',
    jobFunction: '',
    jobFunctionOther: '',
    country: 'Portugal',
    tshirt: '',
    couponCode: '',
    saDataSharingConsent: false,
    saMarketingConsent: false,
    privacyConsent: false,
  });

  const [includeRecording, setIncludeRecording] = useState(true);
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading'>('idle');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading'>('idle');
  const [couponResult, setCouponResult] = useState<CouponState | null>(null);

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
          console.error('Erro ao buscar bilhete');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTicket(false);
      }
    }

    fetchTicket();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const originalPrice = Number(ticketData?.price || 0);

  const finalPrice = useMemo(() => {
    if (!ticketData) return 0;
    let ticketPrice = originalPrice;
    let recordingPrice = includeRecording ? RECORDING_PRICE : 0;

    if (couponResult?.valid) {
      if (couponResult.recordingOnly) {
        if (includeRecording) {
          if (couponResult.discountAmount != null) {
            recordingPrice = Math.max(0, RECORDING_PRICE - couponResult.discountAmount);
          } else if (couponResult.discountPercent != null) {
            recordingPrice = Math.round(RECORDING_PRICE * (100 - couponResult.discountPercent) / 100);
          }
        }
      } else {
        if (couponResult.discountAmount != null) {
          ticketPrice = Math.max(0, originalPrice - couponResult.discountAmount);
        } else if (couponResult.discountPercent != null) {
          ticketPrice = Math.round(originalPrice * (100 - couponResult.discountPercent) / 100);
        }
      }
    }

    return ticketPrice + recordingPrice;
  }, [ticketData, couponResult, originalPrice, includeRecording]);

  const handleApplyCoupon = async () => {
    const code = ticketForm.couponCode.trim().toUpperCase();
    const email = ticketForm.email.trim().toLowerCase();

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
        setCouponResult({
          valid: false,
          message: 'Este cupão aplica-se apenas à gravação. Seleciona a opção de gravação para usar o desconto.',
        });
        return;
      }

      const discountLabel = data.discountAmount != null
        ? `-${formatCurrency(data.discountAmount, 'eur')}`
        : `-${data.discountPercent}%`;
      const recordingSuffix = data.recordingOnly ? ' na gravação' : '';

      setCouponResult({
        valid: true,
        code: data.code,
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        recordingOnly: data.recordingOnly,
        message: `Cupão aplicado: ${discountLabel}${recordingSuffix}`,
      });
    } catch (err) {
      console.error(err);
      setCouponResult({ valid: false, message: 'Cupão inválido.' });
    } finally {
      setCouponStatus('idle');
    }
  };

  const handleBuyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyStatus('loading');

    try {
      if (!ticketData?.id) {
        alert('Ainda estamos a carregar o lote de bilhetes. Tenta novamente em alguns segundos.');
        setBuyStatus('idle');
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: ticketData.id,
          quantity: 1,
          couponCode: couponResult?.valid ? ticketForm.couponCode.trim().toUpperCase() : '',
          includeRecording,
          formData: {
            attendee_first_name: ticketForm.firstName.trim(),
            attendee_last_name: ticketForm.lastName.trim(),
            attendee_email: ticketForm.email.trim(),
            attendee_country: ticketForm.country,
            attendee_job_function: ticketForm.jobFunction,
            attendee_job_function_other:
              ticketForm.jobFunction === 'Outros'
                ? ticketForm.jobFunctionOther.trim()
                : '',
            attendee_nif: ticketForm.nif.trim(),
            attendee_company: ticketForm.company.trim(),
            attendee_job_title: ticketForm.jobTitle.trim(),
            attendee_tshirt: ticketForm.tshirt,
            sa_data_sharing_consent: ticketForm.saDataSharingConsent,
            sa_marketing_consent: ticketForm.saMarketingConsent,
            privacy_consent: ticketForm.privacyConsent,
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
    } catch (err) {
      console.error(err);
      alert('Erro de conexão. Verifique a sua internet.');
      setBuyStatus('idle');
    }
  };

  if (loadingTicket) {
    return <div className="py-8 text-center text-gray-500">A carregar informações do bilhete...</div>;
  }

  if (!ticketData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
        Não foi possível carregar as informações do bilhete.
      </div>
    );
  }

  return (
    <form onSubmit={handleBuyTicket} className="text-left space-y-4">

      {/* Nome + Apelido */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nome"
          required
          value={ticketForm.firstName}
          onChange={(e) => setTicketForm({ ...ticketForm, firstName: e.target.value })}
        />
        <Input
          label="Apelido"
          required
          value={ticketForm.lastName}
          onChange={(e) => setTicketForm({ ...ticketForm, lastName: e.target.value })}
        />
      </div>

      {/* E-mail */}
      <Input
        label="E-mail"
        type="email"
        required
        value={ticketForm.email}
        onChange={(e) => {
          setTicketForm({ ...ticketForm, email: e.target.value });
          setCouponResult(null);
        }}
      />

      {/* NIF + Empresa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">NIF <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            minLength={9}
            maxLength={9}
            pattern="\d{9}"
            title="O NIF deve conter exatamente 9 números"
            value={ticketForm.nif}
            onChange={(e) => setTicketForm({ ...ticketForm, nif: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue"
            placeholder="Ex: 808392190"
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) e.preventDefault();
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Empresa</label>
          <input
            type="text"
            value={ticketForm.company}
            onChange={(e) => setTicketForm({ ...ticketForm, company: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Função + País */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Função</label>
          <select
            value={ticketForm.jobFunction}
            onChange={(e) =>
              setTicketForm({
                ...ticketForm,
                jobFunction: e.target.value,
                jobFunctionOther: e.target.value === 'Outros' ? ticketForm.jobFunctionOther : '',
              })
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue"
          >
            <option value="">Seleciona…</option>
            <option>Atendimento ao Cliente</option>
            <option>Engenharia</option>
            <option>Executivo</option>
            <option>Financeiro</option>
            <option>Recursos Humanos</option>
            <option>Tecnologia da Informação</option>
            <option>Jurídico</option>
            <option>Marketing e Vendas</option>
            <option>Operações</option>
            <option>Gestão de Produtos</option>
            <option>Serviços Profissionais</option>
            <option>Gerenciamento de projetos</option>
            <option>Pesquisa</option>
            <option>Cadeia de suprimentos e manufatura</option>
            <option>Treinamento e Educação</option>
            <option>Indústria de trabalho</option>
            <option>Outros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">País</label>
          <select
            value={ticketForm.country}
            onChange={(e) => setTicketForm({ ...ticketForm, country: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue"
          >
            <option>Portugal</option>
            <option>Espanha</option>
            <option>França</option>
            <option>Alemanha</option>
            <option>Reino Unido</option>
            <option>Brasil</option>
            <option>Estados Unidos</option>
            <option>Outro</option>
          </select>
        </div>
      </div>

      {ticketForm.jobFunction === 'Outros' && (
        <Input
          label="Sua função:"
          required
          value={ticketForm.jobFunctionOther}
          onChange={(e) => setTicketForm({ ...ticketForm, jobFunctionOther: e.target.value })}
        />
      )}

      {/* T-Shirt + Gravação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamanho T-Shirt <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full bg-white text-gray-900 border-gray-300 rounded-md p-2 border shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            value={ticketForm.tshirt}
            onChange={(e) => setTicketForm({ ...ticketForm, tshirt: e.target.value })}
          >
            <option value="" disabled>Selecione um tamanho...</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>

        <div
          onClick={() => setIncludeRecording(!includeRecording)}
          className={`cursor-pointer flex items-start gap-3 rounded-lg border p-3 mt-0 md:mt-6 transition-colors ${
            includeRecording
              ? 'border-brand-orange bg-orange-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
        >
          <input
            id="includeRecording"
            type="checkbox"
            checked={includeRecording}
            onChange={(e) => setIncludeRecording(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange"
          />
          <label htmlFor="includeRecording" className="cursor-pointer text-sm text-gray-700 leading-snug">
            <span className="flex items-center gap-1 font-semibold text-gray-800">
              <Video className="w-3.5 h-3.5 text-brand-orange" />
              Acesso à Gravação
            </span>
            <span className="text-gray-500">Vídeos de todas as sessões <span className="font-bold text-brand-orange">+€10,00</span></span>
          </label>
        </div>
      </div>

      {/* Valor + Cupom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Valor"
          value={formatCurrency(finalPrice, ticketData.currency)}
          readOnly
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cupom de Desconto</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ticketForm.couponCode}
              onChange={(e) => {
                setTicketForm({ ...ticketForm, couponCode: e.target.value.toUpperCase() });
                setCouponResult(null);
              }}
              placeholder="Cupom de desconto"
              className="flex-1 block border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponStatus === 'loading'}
              className="rounded-md border border-gray-300 px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-60"
              title="Aplicar cupom"
              aria-label="Aplicar cupom"
            >
              <TicketPercent className="w-5 h-5 text-brand-orange" />
            </button>
          </div>
          {couponResult?.message && (
            <div
              className={`mt-2 flex items-center gap-2 text-sm ${
                couponResult.valid ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {couponResult.valid && <CheckCircle2 className="w-4 h-4" />}
              <span>{couponResult.message}</span>
            </div>
          )}
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
            <input
              id="saConsent1"
              type="checkbox"
              required
              checked={ticketForm.saDataSharingConsent}
              onChange={(e) => setTicketForm({ ...ticketForm, saDataSharingConsent: e.target.checked })}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange"
            />
            <label htmlFor="saConsent1" className="ml-3 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-red-500">*</span> Concordo que o Organizador (TugÁgil)
              pode partilhar as minhas informações pessoais com a Scrum Alliance exclusivamente
              para fins de análise de dados internos da Scrum Alliance. Também concordo em receber
              e-mails da Scrum Alliance sobre eventos ágeis, oportunidades de aprendizado e outros
              tópicos relacionados. Consulte a{' '}
              <a
                href="https://www.scrumalliance.org/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue font-bold hover:underline"
              >
                Política de Privacidade da Scrum Alliance
              </a>.
            </label>
          </div>

          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              id="saConsent2"
              type="checkbox"
              checked={ticketForm.saMarketingConsent}
              onChange={(e) => setTicketForm({ ...ticketForm, saMarketingConsent: e.target.checked })}
              className="mt-1 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
            />
            <label htmlFor="saConsent2" className="ml-3 text-xs text-gray-600 leading-relaxed">
              Gostava de uma assinatura gratuita de 2 anos da Scrum Alliance*! Para permitir que a
              Scrum Alliance me envie um convite por e-mail para ativar minha assinatura, concordo
              com a transferência das minhas informações pessoais pelos organizadores deste evento
              para a Scrum Alliance, Inc., e com o processamento das minhas informações pessoais pela
              Scrum Alliance, de acordo com a{' '}
              <a
                href="https://www.scrumalliance.org/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue font-bold hover:underline"
              >
                Política de Privacidade da Scrum Alliance
              </a>.
            </label>
          </div>

          <div className="flex items-start">
            <input
              id="privacy"
              type="checkbox"
              required
              checked={ticketForm.privacyConsent}
              onChange={(e) => setTicketForm({ ...ticketForm, privacyConsent: e.target.checked })}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange"
            />
            <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
              <span className="font-bold text-red-500">*</span> Estou de acordo com a{' '}
              <a
                href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue font-bold hover:underline"
              >
                Política de Privacidade de Dados
              </a>{' '}
              do evento.
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">Pagamento seguro via Stripe</p>
      </div>

      <Button
        type="submit"
        isLoading={buyStatus === 'loading'}
        className="w-full text-lg"
        variant="secondary"
        disabled={!ticketData.active}
      >
        <Ticket className="w-5 h-5 mr-2" />
        {ticketData.active ? 'Avançar para Pagamento' : 'Lote Indisponível'}
      </Button>
    </form>
  );
};

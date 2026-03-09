import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from './UIComponents';
import { CheckCircle2, Lock, TicketPercent } from 'lucide-react';

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
  discountPercent?: number;
  message?: string;
};

export const TicketPurchaseModal: React.FC = () => {
  const [ticketForm, setTicketForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: 'Portugal',
    jobFunction: '',
    jobFunctionOther: '',
    couponCode: '',
  });

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
    if (!couponResult?.valid || !couponResult.discountPercent) return originalPrice;
    return Math.round(originalPrice * (100 - couponResult.discountPercent) / 100);
  }, [ticketData, couponResult, originalPrice]);

  const handleApplyCoupon = async () => {
    const code = ticketForm.couponCode.trim().toUpperCase();
    const email = ticketForm.email.trim().toLowerCase();

    if (!code) {
      setCouponResult({ valid: false, message: 'Introduz um cupão.' });
      return;
    }

    if (!email) {
      setCouponResult({ valid: false, message: 'Preenche primeiro o email.' });
      return;
    }

    setCouponStatus('loading');

    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });

      const data = await res.json();

      if (!res.ok || !data?.valid) {
        setCouponResult({
          valid: false,
          message: data?.message || 'Cupão inválido.',
        });
        return;
      }

      setCouponResult({
        valid: true,
        code: data.code,
        discountPercent: data.discountPercent,
        message: `Cupão aplicado: -${data.discountPercent}%`,
      });
    } catch (err) {
      console.error(err);
      setCouponResult({
        valid: false,
        message: 'Erro ao validar cupão.',
      });
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
    <form onSubmit={handleBuyTicket} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Primeiro Nome"
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          País
        </label>
        <select
          value={ticketForm.country}
          onChange={(e) => setTicketForm({ ...ticketForm, country: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Função de trabalho
        </label>
        <select
          value={ticketForm.jobFunction}
          onChange={(e) =>
            setTicketForm({
              ...ticketForm,
              jobFunction: e.target.value,
              jobFunctionOther: e.target.value === 'Outros' ? ticketForm.jobFunctionOther : '',
            })
          }
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
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

      {ticketForm.jobFunction === 'Outros' && (
        <Input
          label="Qual é a sua função?"
          required
          value={ticketForm.jobFunctionOther}
          onChange={(e) => setTicketForm({ ...ticketForm, jobFunctionOther: e.target.value })}
        />
      )}

      <Input
        label="Valor"
        value={formatCurrency(finalPrice, ticketData.currency)}
        readOnly
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cupom
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ticketForm.couponCode}
            onChange={(e) => {
              setTicketForm({ ...ticketForm, couponCode: e.target.value.toUpperCase() });
              setCouponResult(null);
            }}
            placeholder="Código do cupom"
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={couponStatus === 'loading'}
            className="rounded-xl border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-60"
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

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Pagamento seguro via Stripe
        </p>
      </div>

      <Button
        type="submit"
        isLoading={buyStatus === 'loading'}
        className="w-full"
        variant="secondary"
        disabled={!ticketData.active}
      >
        {ticketData.active ? 'Continuar para Pagamento' : 'Lote Indisponível'}
      </Button>
    </form>
  );
};
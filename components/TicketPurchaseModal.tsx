import React, { useEffect, useState } from 'react';
import { Button, Input } from './UIComponents';
import { Lock } from 'lucide-react';

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

export const TicketPurchaseModal: React.FC = () => {
  const [ticketForm, setTicketForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: 'Portugal',
    jobFunction: '',
    jobFunctionOther: '',
  });

  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading'>('idle');
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
    return (
      <div className="py-8 text-center text-gray-500">
        A carregar informações do bilhete...
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
        Não foi possível carregar as informações do bilhete.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-black text-brand-darkBlue">
          {ticketData.name}
        </h3>
        <p className="mt-2 text-5xl font-black text-brand-orange">
          {formatCurrency(ticketData.price, ticketData.currency)}
          <span className="text-lg font-medium text-gray-500"> / pessoa</span>
        </p>
      </div>

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
          onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
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
    </div>
  );
};
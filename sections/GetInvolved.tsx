import React, { useState, useEffect } from 'react';
import { Section, Button, Input, Textarea, SuccessState } from '../components/UIComponents';
import { FormType, SponsorFormData, SupporterFormData } from '../types';
import { saveSubmission } from '../services/db';
import { Handshake, Camera, Ticket, Lock, ArrowRight, Loader2, FileText } from 'lucide-react';

// ⚠️ SUBSTITUA PELO ID REAL DO SEU SUPABASE SE NECESSÁRIO
//const TICKET_TYPE_ID = 'f14c53d4-5377-49b9-b87c-980b7b0aad0f';

interface GetInvolvedProps {
  setSponsorModalOpen: (v: boolean) => void;
  setSupporterModalOpen: (v: boolean) => void;
}

interface TicketTypeData {
  id: string;
  name: string;
  price: number;
  currency: string;
  active: boolean;
  quantity_total: number | null;
  quantity_sold: number | null;
  sort_order: number | null;
}


/* =========================
   MAIN SECTION (TICKET SALES)
========================= */
export const GetInvolved: React.FC<GetInvolvedProps> = ({
  setSponsorModalOpen,
  setSupporterModalOpen
}) => {
  // Estado para o formulário de compra de bilhete
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

  // 1. Buscar dados via API Proxy (Seguro, sem chaves no front)
  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/get-ticket`);
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

      // 2. Chamar API de Checkout
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ aqui é o payload certo (sem "body dentro do body")
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
              ticketForm.jobFunction === 'Outros' ? ticketForm.jobFunctionOther.trim() : '',
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
        {/* Box VENDA DE BILHETES */}
        <div
          id="ticket-form"
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
                      label="Primeiro nome"
                      required
                      value={ticketForm.firstName}
                      onChange={(e) => setTicketForm({ ...ticketForm, firstName: e.target.value })}
                    />
                    <Input
                      label="Sobrenome"
                      required
                      value={ticketForm.lastName}
                      onChange={(e) => setTicketForm({ ...ticketForm, lastName: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Endereço de email"
                    type="email"
                    required
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">País</label>
                      <select
                        required
                        value={ticketForm.country}
                        onChange={(e) => setTicketForm({ ...ticketForm, country: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      >
                        <option value="Portugal">Portugal</option>
                        <option value="Spain">Espanha</option>
                        <option value="France">França</option>
                        <option value="Germany">Alemanha</option>
                        <option value="United Kingdom">Reino Unido</option>
                        <option value="Brazil">Brasil</option>
                        <option value="United States">Estados Unidos</option>
                        <option value="Other">Outro</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Função de trabalho
                      </label>
                      <select
                        required
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
                        <option value="" disabled>Seleciona…</option>
                        <option value="Atendimento ao Cliente">Atendimento ao Cliente</option>
                        <option value="Engenharia">Engenharia</option>
                        <option value="Executivo">Executivo</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                        <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                        <option value="Jurídico">Jurídico</option>
                        <option value="Marketing e Vendas">Marketing e Vendas</option>
                        <option value="Operações">Operações</option>
                        <option value="Gestão de Produtos">Gestão de Produtos</option>
                        <option value="Serviços Profissionais">Serviços Profissionais</option>
                        <option value="Gerenciamento de projetos">Gerenciamento de projetos</option>
                        <option value="Pesquisa">Pesquisa</option>
                        <option value="Cadeia de suprimentos e manufatura">Cadeia de suprimentos e manufatura</option>
                        <option value="Treinamento e Educação">Treinamento e Educação</option>
                        <option value="Indústria de trabalho">Indústria de trabalho</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                  </div>

                  {ticketForm.jobFunction === 'Outros' && (
                    <Input
                      label="Qual?"
                      required
                      value={ticketForm.jobFunctionOther}
                      onChange={(e) => setTicketForm({ ...ticketForm, jobFunctionOther: e.target.value })}
                    />
                  )}

                  <div className="pt-4">
                    <Button
                      type="submit"
                      isLoading={buyStatus === 'loading'}
                      className="w-full text-lg py-4 bg-brand-orange hover:bg-orange-600 shadow-lg"
                      disabled={
                        !ticketData?.active ||
                        (ticketForm.jobFunction === 'Outros' && !ticketForm.jobFunctionOther.trim())
                      }
                    >
                      {ticketData?.active ? (
                        <>
                          Continuar para Pagamento <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      ) : (
                        'Lote Indisponível'
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                      <Lock className="w-3 h-3" />
                      Pagamento seguro via Stripe
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

/* =========================
   SPONSOR FORM COMPONENT
========================= */
export const SponsorForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const MEDIA_KIT_URL = "https://drive.google.com/file/d/1fBqF56U6BRa2dBEzGHWfwseAW4sQCkgx/view?usp=sharing";

  const [formData, setFormData] = useState<SponsorFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    companySize: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const ok = await saveSubmission(FormType.SPONSOR, formData);

    if (ok) {
      setStatus('success');
    } else {
      setStatus('idle');
      setError(
        'Ocorreu um erro. Tente novamente mais tarde ou contacte tugagilportugal@gmail.com'
      );
    }
  };

  if (status === 'success') {
    return <SuccessState message="Recebemos o seu interesse em patrocinar!" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Seu Nome"
        required
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="E-mail Corporativo"
        type="email"
        required
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        label="Empresa"
        required
        value={formData.company}
        onChange={e => setFormData({ ...formData, company: e.target.value })}
      />
      <Textarea
        label="Mensagem"
        value={formData.message}
        onChange={e => setFormData({ ...formData, message: e.target.value })}
      />

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Ainda não viu as opções? <br />
          <a
            href={MEDIA_KIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue font-bold hover:underline"
          >
            Aceda ao nosso Media Kit aqui
          </a>{' '}
          e descubra como a sua organização pode ser parte do RSG Lisbon 2026.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={status === 'loading'} className="w-full" variant="secondary">
        Enviar Solicitação
      </Button>
    </form>
  );
};

/* =========================
   SUPPORTER FORM COMPONENT
========================= */
export const SupporterForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SupporterFormData>({
    name: '',
    email: '',
    phone: '',
    area: '',
    portfolio: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const ok = await saveSubmission(FormType.SUPPORTER, formData);

    if (ok) {
      setStatus('success');
    } else {
      setStatus('idle');
      setError(
        'Ocorreu um erro. Tente novamente mais tarde ou contacte tuga@tugagil.com'
      );
    }
  };

  if (status === 'success') {
    return <SuccessState message="Obrigado pelo interesse em apoiar o RSG Lisbon 2026!" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome Completo"
        required
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="E-mail"
        type="email"
        required
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        label="Portfólio (Link)"
        required
        value={formData.portfolio}
        onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
      />
      <Textarea
        label="Como gostaria de colaborar?"
        required
        value={formData.message}
        onChange={e => setFormData({ ...formData, message: e.target.value })}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={status === 'loading'} className="w-full">
        Candidatar-me
      </Button>
    </form>
  );
};

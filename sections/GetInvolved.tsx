import React, { useState } from 'react';
import { Section, Button, Input, Textarea, SuccessState } from '../components/UIComponents';
import { FormType, InterestFormData, SponsorFormData, SupporterFormData } from '../types';
import { saveSubmission } from '../services/db';
import { Handshake, Camera, BellRing, ArrowRight } from 'lucide-react';

interface GetInvolvedProps {
  setSponsorModalOpen: (v: boolean) => void;
  setSupporterModalOpen: (v: boolean) => void;
}

/* =========================
   WAITLIST FORM
========================= */
export const GetInvolved: React.FC<GetInvolvedProps> = ({
  setSponsorModalOpen,
  setSupporterModalOpen
}) => {
  const [formData, setFormData] = useState<InterestFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    expectations: '',
    gdpr: false
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const ok = await saveSubmission(FormType.INTEREST, formData);

    if (ok) {
      setStatus('success');
    } else {
      setStatus('idle');
      setError(
        'Ocorreu um erro. Tente novamente mais tarde ou contacte tugagilportugal@gmail.com'
      );
    }
  };

  return (
    <Section id="get-involved" className="bg-gray-50">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-4">
          Queres fazer parte do RSG 2026?
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Existem várias formas de construir este futuro connosco. Escolha a que melhor se adapta ao seu perfil.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
        {/* Box Patrocínios - Hover Laranja */}
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

        {/* Box Apoiadores - Hover Azul */}
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

      <div className="max-w-2xl mx-auto">
        {/* Box Waitlist - Barra Multicolorida */}
        <div className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
          {/* Barra Decorativa Topo */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-brand-orange via-brand-blue to-brand-darkBlue"></div>

          {status === 'success' ? (
            <SuccessState
              message="Obrigado pelo seu interesse! Você será notificado assim que as inscrições abrirem."
              onReset={() => {
                setStatus('idle');
                setError(null);
              }}
            />
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-10 pt-2">
                <div className="bg-gray-100 p-3 rounded-full mb-4">
                  <BellRing className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Waitlist Oficial</h3>
                <p className="text-gray-500">Seja o primeiro a saber das novidades e bilhetes.</p>
              </div>
      
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
                label="WhatsApp"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Empresa"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
              />
              <Textarea
                label="O que mais espera encontrar no RSG 2026?"
                value={formData.expectations}
                onChange={e => setFormData({ ...formData, expectations: e.target.value })}
              />

              {/* GDPR */}
              <div className="flex items-start">
                <input
                  id="gdpr"
                  type="checkbox"
                  required
                  checked={formData.gdpr}
                  onChange={e => setFormData({ ...formData, gdpr: e.target.checked })}
                  className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded"
                />
                <label htmlFor="gdpr" className="ml-3 text-sm text-gray-600">
                  Aceito a{' '}
                  <a href="#" className="text-brand-blue font-bold">
                    Política de Privacidade
                  </a>.
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
                  {error}
                </div>
              )}

              <Button type="submit" isLoading={status === 'loading'} className="w-full">
                Entrar na Waitlist <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
            </>
          )}
        </div>
      </div>
    </Section>
  );
};

/* =========================
   SPONSOR FORM
========================= */
export const SponsorForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

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
   SUPPORTER FORM
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
        'Ocorreu um erro. Tente novamente mais tarde ou contacte tugagilportugal@gmail.com'
      );
    }
  };

  if (status === 'success') {
    return <SuccessState message="Obrigado por querer apoiar o RSG!" />;
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

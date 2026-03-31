import React, { useState } from 'react';
import { Section, Button, Input, Textarea, SuccessState } from '../components/UIComponents';
import { FormType, SponsorFormData, SupporterFormData } from '../types';
import { saveSubmission } from '../services/db';
import { Handshake, Camera, FileText } from 'lucide-react';

interface GetInvolvedProps {
  setSponsorModalOpen: (v: boolean) => void;
  setSupporterModalOpen: (v: boolean) => void;
}

export const GetInvolved: React.FC<GetInvolvedProps> = ({
  setSponsorModalOpen,
  setSupporterModalOpen,
}) => {
  return (
    <Section id="get-involved" className="bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue">
          Envolve-te no evento
        </h2>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
          Junta-te ao RSG Lisbon 2026 como patrocinador ou apoiador e ajuda-nos
          a criar uma experiência memorável para a comunidade ágil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6">
            <Handshake className="w-7 h-7 text-brand-orange" />
          </div>

          <h3 className="text-2xl font-black text-brand-darkBlue mb-4">
            Patrocínios e Parcerias
          </h3>

          <p className="text-gray-600 mb-8 flex-1">
            Conecte a sua marca a centenas de líderes e praticantes de agilidade
            em Portugal.
          </p>

          <Button
            onClick={() => setSponsorModalOpen(true)}
            variant="secondary"
            className="w-full text-lg font-bold"
          >
            Quero Patrocinar
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
            <Camera className="w-7 h-7 text-brand-blue" />
          </div>

          <h3 className="text-2xl font-black text-brand-darkBlue mb-4">
            Apoiadores
          </h3>

          <p className="text-gray-600 mb-8 flex-1">
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
    </Section>
  );
};

/* ========================= SPONSOR FORM COMPONENT ========================= */

export const SponsorForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const MEDIA_KIT_URL =
    'https://drive.google.com/file/d/162ktlhFkYjvE90nH3ZAiW_kLQGrdI04o/view?usp=sharing';

  const [formData, setFormData] = useState<SponsorFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    companySize: '',
    message: '',
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
    return (
      <SuccessState message="Obrigado pelo seu interesse em patrocinar o RSG Lisbon 2026!" />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome Completo"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <Input
        label="E-mail"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <Input
        label="Empresa"
        required
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
      />

      <Textarea
        label="Mensagem"
        required
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Ainda não viu as opções?
          <br />
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

      <Button
        type="submit"
        isLoading={status === 'loading'}
        className="w-full"
        variant="secondary"
      >
        Enviar Solicitação
      </Button>
    </form>
  );
};

/* ========================= SUPPORTER FORM COMPONENT ========================= */

export const SupporterForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SupporterFormData>({
    name: '',
    email: '',
    phone: '',
    area: '',
    portfolio: '',
    message: '',
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
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <Input
        label="E-mail"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <Input
        label="Portfólio (Link)"
        required
        value={formData.portfolio}
        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
      />

      <Textarea
        label="Como gostaria de colaborar?"
        required
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
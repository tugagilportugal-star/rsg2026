import React, { useState } from 'react';
import { Section, Button, Input, Textarea, SuccessState } from '../components/UIComponents';
import { FormType, SponsorFormData, SupporterFormData } from '../types';
import { saveSubmission } from '../services/db';
import { Handshake, Camera, FileText } from 'lucide-react';

export const GetInvolved: React.FC = () => {
  return null;
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
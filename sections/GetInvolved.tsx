import React from 'react';
import { Section, Button } from '../components/UIComponents';
import { Handshake, Camera } from 'lucide-react';


interface GetInvolvedProps {
  setSponsorModalOpen: (v: boolean) => void;
  setSupporterModalOpen: (v: boolean) => void;
}




/* =========================
   MAIN SECTION (TICKET SALES)
========================= */
export const GetInvolved: React.FC<GetInvolvedProps> = ({
  setSponsorModalOpen,
  setSupporterModalOpen
}) => {


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

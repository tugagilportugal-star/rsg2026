import React, { useState } from 'react';
import { Button, Input, SuccessState } from './UIComponents';
import { Ticket, ShieldCheck } from 'lucide-react';

interface TicketFormProps {
  onSuccess?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nif: '',
    tshirt: '',
    saConsent1: false,
    saConsent2: false,
    privacy: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Aqui, no futuro, faremos a chamada para o Stripe Checkout.
    // Para já, em ambiente de teste, simulamos um sucesso após 1.5s
    setTimeout(() => {
      setStatus('success');
      if (onSuccess) onSuccess();
    }, 1500);
  };

  if (status === 'success') {
    return (
      <SuccessState 
        message="Dados validados com sucesso! Em produção, o utilizador seria redirecionado para o Stripe agora." 
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      
      {/* Dados Pessoais */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nome"
          required
          value={formData.firstName}
          onChange={e => setFormData({ ...formData, firstName: e.target.value })}
        />
        <Input
          label="Apelido"
          required
          value={formData.lastName}
          onChange={e => setFormData({ ...formData, lastName: e.target.value })}
        />
      </div>

      <Input
        label="E-mail (Para envio do bilhete)"
        type="email"
        required
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Contribuinte / NIF (Opcional)"
          value={formData.nif}
          onChange={e => setFormData({ ...formData, nif: e.target.value })}
        />
        
        {/* T-Shirt Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamanho da T-Shirt <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full bg-white text-gray-900 border-gray-300 rounded-md p-3 border shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            value={formData.tshirt}
            onChange={e => setFormData({ ...formData, tshirt: e.target.value })}
          >
            <option value="" disabled>Selecione um tamanho...</option>
            <option value="XS">XS (Extra Small)</option>
            <option value="S">S (Small)</option>
            <option value="M">M (Medium)</option>
            <option value="L">L (Large)</option>
            <option value="XL">XL (Extra Large)</option>
            <option value="XXL">XXL (Double Extra Large)</option>
          </select>
        </div>
      </div>

      {/* Separador Legal */}
      <div className="pt-4 mt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-brand-darkBlue font-bold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-orange" />
            Termos & Privacidade
        </div>

        <div className="space-y-4">
          {/* RGPD Scrum Alliance 1 (Obrigatório) */}
          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              id="saConsent1"
              type="checkbox"
              required
              checked={formData.saConsent1}
              onChange={e => setFormData({ ...formData, saConsent1: e.target.checked })}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange"
            />
            <label htmlFor="saConsent1" className="ml-3 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-red-500">*</span> Concordo que o Organizador (TugÁgil) pode compartilhar as minhas informações pessoais com a Scrum Alliance exclusivamente para fins de análise de dados internos da Scrum Alliance. Também concordo em receber e-mails da Scrum Alliance sobre eventos ágeis, oportunidades de aprendizagem e outros tópicos relacionados.{' '}
              <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">
                Política de Privacidade da Scrum Alliance
              </a>.
            </label>
          </div>

          {/* RGPD Scrum Alliance 2 (Opcional) */}
          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              id="saConsent2"
              type="checkbox"
              checked={formData.saConsent2}
              onChange={e => setFormData({ ...formData, saConsent2: e.target.checked })}
              className="mt-1 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
            />
            <label htmlFor="saConsent2" className="ml-3 text-xs text-gray-600 leading-relaxed">
              Gostava de uma assinatura gratuita de 2 anos da Scrum Alliance*! Para permitir que a Scrum Alliance me envie um convite por e-mail para ativar a minha assinatura, concordo com a transferência das minhas informações pessoais pelos organizadores deste evento para a Scrum Alliance, Inc., uma organização sem fins lucrativos localizada nos Estados Unidos, e com o processamento das minhas informações pessoais pela Scrum Alliance.{' '}
              <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">
                Política de Privacidade da Scrum Alliance
              </a>.
              <br/><span className="text-gray-400 mt-1 block">*Oferta não disponível para quem já possui uma assinatura ativa da Scrum Alliance.</span>
            </label>
          </div>

          {/* Políticas de Privacidade RSG/TugÁgil (Obrigatório) */}
          <div className="flex items-start">
            <input
              id="privacy"
              type="checkbox"
              required
              checked={formData.privacy}
              onChange={e => setFormData({ ...formData, privacy: e.target.checked })}
              className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange"
            />
            <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
              <span className="font-bold text-red-500">*</span> Aceito a{' '}
              <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo/edit?tab=t.0#heading=h.pqcupvajo6ql" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold hover:underline">
                Política de Privacidade
              </a> do evento.
            </label>
          </div>
        </div>
      </div>

      <Button type="submit" isLoading={status === 'loading'} className="w-full text-lg mt-6">
        <Ticket className="w-5 h-5 mr-2" />
        Avançar para Pagamento
      </Button>
    </form>
  );
};

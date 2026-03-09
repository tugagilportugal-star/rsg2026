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
    company: '',
    jobTitle: '',
    tshirt: '',
    saConsent1: false,
    saConsent2: false,
    privacy: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulação de sucesso
    setTimeout(() => {
      setStatus('success');
      if (onSuccess) onSuccess();
    }, 1500);
  };

  if (status === 'success') {
    return (
      <SuccessState 
        message="Dados validados com sucesso! Em produção, o utilizador seria redirecionado para a página de pagamento agora." 
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
        label="E-mail"
        type="email"
        required
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />

      {/* NIF com validação de 9 dígitos */}
      <div>
        <label className="block text-sm font-medium text-gray-700">NIF (9 dígitos)</label>
        <input
          type="text"
          required
          minLength={9}
          maxLength={9}
          pattern="\d{9}"
          title="O NIF deve conter exatamente 9 números"
          value={formData.nif}
          onChange={e => setFormData({ ...formData, nif: e.target.value })}
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
        />
      </div>

      {/* Novos campos: Empresa e Cargo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Empresa</label>
          <input
            type="text"
            value={formData.company}
            onChange={e => setFormData({ ...formData, company: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cargo</label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue"
          />
        </div>
      </div>
        
      {/* T-Shirt Select */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tamanho T-Shirt <span className="text-red-500">*</span>
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

      {/* Separador Legal */}
      <div className="pt-4 mt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-brand-darkBlue font-bold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-orange" />
            Termos & Privacidade
        </div>

        <div className="space-y-4">
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
              <span className="font-bold text-red-500">*</span> Concordo que o Organizador (TugÁgil) pode compartilhar as minhas informações pessoais com a Scrum Alliance exclusivamente para fins de análise de dados internos da Scrum Alliance...
            </label>
          </div>

          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              id="saConsent2"
              type="checkbox"
              checked={formData.saConsent2}
              onChange={e => setFormData({ ...formData, saConsent2: e.target.checked })}
              className="mt-1 h-4 w-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
            />
            <label htmlFor="saConsent2" className="ml-3 text-xs text-gray-600 leading-relaxed">
              Gostava de uma assinatura gratuita de 2 anos da Scrum Alliance*!
            </label>
          </div>

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
              <span className="font-bold text-red-500">*</span> Aceito a Política de Privacidade do evento.
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

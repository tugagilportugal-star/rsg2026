import React, { useState } from 'react';
import { Button, Input, SuccessState } from './UIComponents';
import { Ticket, ShieldCheck } from 'lucide-react';

interface TicketFormProps {
  onSuccess?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const[status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', nif: '', company: '', role: '',
    tshirt: '', saConsent1: false, saConsent2: false, privacy: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      if (onSuccess) onSuccess();
    }, 1500);
  };

  if (status === 'success') {
    return <SuccessState message="Dados validados com sucesso! Em produção, o utilizador seria redirecionado para o Stripe agora." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nome" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
        <Input label="Apelido" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
      </div>
      <Input label="E-mail (Para envio do bilhete)" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Empresa (Opcional)" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
        <Input label="Função (Opcional)" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Contribuinte / NIF (Opcional)" value={formData.nif} maxLength={9} pattern="\d{9}" title="Exatamente 9 números." placeholder="Ex: 323380603" onChange={e => setFormData({ ...formData, nif: e.target.value.replace(/\D/g, '') })} />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho da T-Shirt <span className="text-red-500">*</span></label>
          <select required className="w-full bg-white text-gray-900 border-gray-300 rounded-md p-3 border shadow-sm focus:ring-brand-blue" value={formData.tshirt} onChange={e => setFormData({ ...formData, tshirt: e.target.value })}>
            <option value="" disabled>Selecione...</option>
            <option value="XS">XS</option><option value="S">S</option><option value="M">M</option>
            <option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
          </select>
        </div>
      </div>
      <div className="pt-4 mt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-brand-darkBlue font-bold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-orange" /> Termos & Privacidade
        </div>
        <div className="space-y-4">
          <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input id="saConsent1" type="checkbox" required checked={formData.saConsent1} onChange={e => setFormData({ ...formData, saConsent1: e.target.checked })} className="mt-1 h-4 w-4 text-brand-orange rounded" />
            <label htmlFor="saConsent1" className="ml-3 text-xs text-gray-600 leading-relaxed"><span className="font-bold text-red-500">*</span> Concordo em partilhar informações com a Scrum Alliance para análise interna. <a href="https://www.scrumalliance.org/privacy-policy" target="_blank" rel="noreferrer" className="text-brand-blue font-bold hover:underline">Política de Privacidade</a>.</label>
          </div>
          <div className="flex items-start">
            <input id="privacy" type="checkbox" required checked={formData.privacy} onChange={e => setFormData({ ...formData, privacy: e.target.checked })} className="mt-1 h-4 w-4 text-brand-orange rounded" />
            <label htmlFor="privacy" className="ml-3 text-sm text-gray-600"><span className="font-bold text-red-500">*</span> Aceito a <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo" target="_blank" rel="noreferrer" className="text-brand-blue font-bold hover:underline">Política de Privacidade</a> do evento.</label>
          </div>
        </div>
      </div>
      <Button type="submit" isLoading={status === 'loading'} className="w-full text-lg mt-6"><Ticket className="w-5 h-5 mr-2" /> Avançar</Button>
    </form>
  );
};


import React, { useState } from 'react';
import { Section, Button, Input, Textarea, SuccessState } from '../components/UIComponents';
import { FormType, InterestFormData, SponsorFormData, SupporterFormData } from '../types';
import { saveSubmission } from '../services/db';
import { Handshake, Camera, BellRing, ArrowRight } from 'lucide-react';

interface GetInvolvedProps {
    setSponsorModalOpen: (v: boolean) => void;
    setSupporterModalOpen: (v: boolean) => void;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // 1. Salva no Banco de Dados (Supabase)
      await saveSubmission(FormType.INTEREST, formData);
      
      // 2. Dispara e-mail via EmailJS (Cenário Wix)
      // await sendEmailConfirmation(formData);

      setStatus('success');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar. Tente novamente.');
      setStatus('idle');
    }
  };

  return (
    <Section id="get-involved" className="bg-gray-50">
      <h2 className="text-3xl md:text-5xl font-black text-center text-brand-darkBlue mb-4">
        Queres fazer parte do RSG 2026?
      </h2>
      <p className="text-center text-gray-500 mb-16 text-lg">Existem várias formas de construir este futuro connosco.</p>

      {/* Cards Row */}
      <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
        {/* Sponsors */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 flex flex-col items-center text-center shadow-lg hover:shadow-2xl hover:border-brand-orange transition-all duration-300 group">
            <div className="bg-brand-orange/10 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Handshake className="w-12 h-12 text-brand-orange" />
            </div>
            <h3 className="text-2xl font-bold text-brand-darkBlue mb-4">Patrocínios e Parcerias</h3>
            <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                Conecte a <span className="font-bold text-brand-darkBlue">SUA EMPRESA</span> a centenas de <span className="font-bold text-brand-darkBlue">PROFISSIONAIS</span> agilistas. Torne-se um patrocinador e tenha destaque no RSG Lisbon 2026.
            </p>
            <Button onClick={() => setSponsorModalOpen(true)} variant="secondary" className="w-full text-lg font-bold group-hover:bg-brand-orange group-hover:text-white">
                Quero Patrocinar
            </Button>
        </div>

        {/* Supporters */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 flex flex-col items-center text-center shadow-lg hover:shadow-2xl hover:border-brand-blue transition-all duration-300 group">
            <div className="bg-brand-blue/10 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-12 h-12 text-brand-blue" />
            </div>
            <h3 className="text-2xl font-bold text-brand-darkBlue mb-4">Apoiadores</h3>
            <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                Trabalhas com fotografia, vídeo, som, catering ou social media, e queres nos apoiar a construir uma experiência incrível?
            </p>
            <Button onClick={() => setSupporterModalOpen(true)} className="w-full text-lg font-bold bg-brand-blue hover:bg-blue-700 text-white">
                Quero Apoiar
            </Button>
        </div>
      </div>

      {/* Interest List Form Area */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 border border-gray-100 relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-brand-blue"></div>
            
            {status === 'success' ? (
                <SuccessState 
                    message="Obrigado pelo seu interesse! Você será notificado assim que as inscrições abrirem."
                    onReset={() => setStatus('idle')}
                />
            ) : (
                <>
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="bg-gray-100 p-3 rounded-full mb-4">
                            <BellRing className="w-6 h-6 text-gray-700" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">Inscreva-se na Waitlist</h3>
                        <p className="text-gray-500">Garanta o seu lugar na fila da frente. Seja o primeiro a saber das novidades.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input 
                                label="Nome Completo" 
                                required 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <Input 
                                label="E-mail" 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input 
                                label="Telemóvel / WhatsApp" 
                                placeholder="+351 9xx xxx xxx" 
                                required
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                            <Input 
                                label="Empresa (Opcional)"
                                value={formData.company}
                                onChange={e => setFormData({...formData, company: e.target.value})}
                            />
                        </div>
                        <Textarea 
                            label="O que mais espera encontrar no RSG 2026?" 
                            placeholder="Diga-nos os temas ou speakers que gostaria de ver..."
                            value={formData.expectations}
                            onChange={e => setFormData({...formData, expectations: e.target.value})}
                        />
                        
                        <div className="flex items-start mb-6">
                            <input 
                                id="gdpr" 
                                type="checkbox" 
                                required 
                                checked={formData.gdpr}
                                onChange={e => setFormData({...formData, gdpr: e.target.checked})}
                                className="mt-1 h-4 w-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange" 
                            />
                            <label htmlFor="gdpr" className="ml-3 text-sm text-gray-600 leading-tight">
                                Aceito a <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo/edit?usp=sharing" target="_blank" className="text-brand-blue font-bold hover:underline">Política de Privacidade</a> e o tratamento dos meus dados para comunicações do evento.
                            </label>
                        </div>

                        <Button type="submit" isLoading={status === 'loading'} className="w-full py-4 text-lg font-bold shadow-brand-orange/20">
                            Garantir meu lugar na Waitlist
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </form>
                </>
            )}
        </div>
      </div>
    </Section>
  );
};

// --- Form Components for Modals ---

export const SponsorForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [formData, setFormData] = useState<SponsorFormData>({
        name: '', email: '', phone: '', company: '', role: '', companySize: '', message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        await saveSubmission(FormType.SPONSOR, formData);
        setStatus('success');
    };

    if (status === 'success') return <SuccessState message="Recebemos o seu interesse em patrocinar! A nossa equipa entrará em contacto muito em breve." />;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Seu Nome" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="E-mail Corporativo" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input label="Telefone / WhatsApp" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Nome da Empresa" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                <Input label="Cargo" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho da Empresa</label>
                <select 
                    className="block w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-brand-blue focus:border-brand-blue"
                    required
                    value={formData.companySize}
                    onChange={e => setFormData({...formData, companySize: e.target.value})}
                >
                    <option value="">Selecione uma opção...</option>
                    <option value="1-50">1-50 colaboradores</option>
                    <option value="51-200">51-200 colaboradores</option>
                    <option value="201-500">201-500 colaboradores</option>
                    <option value="+500">+500 colaboradores</option>
                </select>
            </div>
            <Textarea label="Mensagem Adicional (Opcional)" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
            <Button type="submit" isLoading={status === 'loading'} className="w-full" variant="secondary">Enviar Solicitação de Patrocínio</Button>
        </form>
    );
};

export const SupporterForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [formData, setFormData] = useState<SupporterFormData>({
        name: '', email: '', phone: '', area: '', portfolio: '', message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        await saveSubmission(FormType.SUPPORTER, formData);
        setStatus('success');
    };

    if (status === 'success') return <SuccessState message="Obrigado por querer apoiar o RSG! Vamos analisar o seu perfil e entraremos em contacto." />;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome Completo" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="E-mail" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input label="Telefone / WhatsApp" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área de Apoio</label>
                <select 
                    className="block w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-brand-blue focus:border-brand-blue"
                    required
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                >
                    <option value="">Selecione sua especialidade...</option>
                    <option value="fotografia">Fotografia</option>
                    <option value="video">Vídeo / Edição</option>
                    <option value="som">Som e Luz</option>
                    <option value="social">Social Media</option>
                    <option value="design">Design / Brindes</option>
                    <option value="outro">Outros</option>
                </select>
            </div>
            <Input label="Link de Portfólio / Site" placeholder="https://..." required value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} />
            <Textarea label="Como gostaria de colaborar?" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
            <Button type="submit" isLoading={status === 'loading'} className="w-full">Candidatar-me como Apoiador</Button>
        </form>
    );
};

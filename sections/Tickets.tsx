import React, { useState } from 'react';
import { Section } from '../components/UIComponents';
import { Check, CheckCircle2, Gift } from 'lucide-react';
import { BonusModal } from '../components/BonusModal';

// Esta é a peça que faltava para o Vercel não dar erro:
interface TicketsProps {
  onOpenTicketModal?: () => void;
}

// Adicionamos { onOpenTicketModal } aqui para o App.tsx ficar feliz
export const Tickets: React.FC<TicketsProps> = ({ onOpenTicketModal }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', expectations: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Priority List Sold Out', ...form }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const benefits = [
    "Acesso completo ao evento",
    "Kit de Boas-vindas + T-Shirt",
    "Coffee breaks premium",
    "Scrum Education Units (SEUs)",
    "Certificado Digital",
    "Acesso à gravação*"
  ];

  return (
<<<<<<< HEAD
    <Section id="tickets" className="relative overflow-hidden bg-gray-50">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-4xl md:text-6xl font-black text-brand-darkBlue">
          {showTicketBox ? 'Garanta o seu lugar' : 'Waitlist Oficial'}
        </h2>
        <p className="mt-3 max-w-3xl mx-auto text-lg md:text-2xl text-gray-500 leading-relaxed">
          {showTicketBox
            ? 'Participe de uma das maiores celebrações da agilidade em Portugal. Preço exclusivo para os primeiros inscritos.'
            : 'Seja o primeiro a saber quando os bilhetes abrirem. Inscreva-se na lista de espera e garanta acesso prioritário.'}
        </p>
      </div>

      <div className="max-w-[560px] md:max-w-[860px] mx-auto relative">
        {!showTicketBox && !statusLoading && (
          <div className="relative bg-white border-2 border-brand-darkBlue rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] px-7 md:px-8 py-6">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-brand-darkBlue px-4 py-1.5 text-sm md:text-base font-black tracking-wide">
                <Bell className="w-4 h-4" /> Waitlist Oficial
              </div>
            </div>
            <WaitlistForm />
=======
    <Section id="tickets" className="bg-brand-darkBlue py-20">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* CARTÃO ÚNICO DE PRIORITY LIST */}
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden relative p-8 md:p-12">
          
          {/* TAG SOLD OUT */}
          <div className="flex justify-center mb-6">
            <span className="bg-red-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">
              # SOLD OUT
            </span>
>>>>>>> Marina-Ajustes
          </div>

          {/* CABEÇALHO */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-brand-darkBlue mb-4">
              Priority List
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Lugares esgotados em tempo recorde! Inscreve-te para teres prioridade absoluta em caso de desistências ou novas vagas.
            </p>
          </div>

          {/* FORMULÁRIO */}
          {status === 'success' ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-bold text-brand-darkBlue">Estás na lista!</p>
              <p className="text-gray-500 mt-2">Avisaremos assim que surgir uma vaga.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Nome Completo *" className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-brand-orange" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input required type="email" placeholder="E-mail *" className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-brand-orange" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input required type="tel" placeholder="WhatsApp *" className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-brand-orange" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <input type="text" placeholder="Empresa" className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-brand-orange" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>
              <textarea rows={2} placeholder="O que mais esperas encontrar no RSG 2026?" className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-brand-orange resize-none" value={form.expectations} onChange={e => setForm({...form, expectations: e.target.value})} />
              
              <button type="submit" disabled={status === 'loading'} className="w-full bg-brand-orange text-white py-4 rounded-2xl text-lg font-black shadow-lg hover:scale-[1.02] transition-transform">
                {status === 'loading' ? 'A processar...' : 'Entrar na Priority List'}
              </button>
            </form>
          )}

          {/* SECÇÃO DE BENEFÍCIOS */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-6 text-center">
              O que o teu bilhete incluirá:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-orange flex-shrink-0" />
                  <span className="text-gray-600 text-xs font-medium">{benefit}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <button type="button" onClick={() => setIsBonusModalOpen(true)} className="text-brand-orange text-xs font-bold underline hover:text-brand-darkBlue transition-colors">
                  Bónus Exclusivos. Ver mais
                </button>
              </div>
            </div>
<<<<<<< HEAD
          </>
        )}

        {statusLoading && <div className="text-center py-12 text-gray-400">A carregar...</div>}
=======
          </div>
          
          <p className="mt-8 text-[9px] text-gray-400 text-center uppercase tracking-widest">
            Limitado à capacidade do auditório
          </p>
        </div>
>>>>>>> Marina-Ajustes
      </div>

      <BonusModal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} />
    </Section>
  );
};
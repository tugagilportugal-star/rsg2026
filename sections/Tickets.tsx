import React, { useState } from 'react';
import { Section } from '../components/UIComponents';
import { Check, Gift } from 'lucide-react';
import { BonusModal } from '../components/BonusModal';

export const Tickets: React.FC = () => {
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  const benefits = [
    "Acesso completo ao evento",
    "Kit de Boas-vindas + T-Shirt",
    "Coffee breaks premium",
    "Scrum Education Units (SEUs)",
    "Certificado Digital",
    "Acesso à gravação*"
  ];

  return (
    <Section id="tickets" className="bg-brand-darkBlue py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden relative p-8 md:p-12">
          
          <div className="flex justify-center mb-6">
            <span className="bg-red-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">
              # SOLD OUT
            </span>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-brand-darkBlue mb-4">
              Bilhetes Esgotados
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Lugares esgotados em tempo recorde! Obrigado a todos que se inscreveram para o RSG Lisbon 2026.
            </p>
          </div>

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
          </div>
          <p className="mt-8 text-[9px] text-gray-400 text-center uppercase tracking-widest">
            Limitado à capacidade do auditório
          </p>
        </div>
      </div>
      <BonusModal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} />
    </Section>
  );
};
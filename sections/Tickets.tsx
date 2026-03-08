import React from 'react';
import { Section } from '../components/UIComponents';
import { Check, Info, Sparkles, Tag } from 'lucide-react';

type Props = {
  onBuyClick: () => void;
};

export const Tickets: React.FC<Props> = ({ onBuyClick }) => {
  return (
    <Section id="tickets" className="relative overflow-hidden bg-white">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-4xl md:text-6xl font-black text-brand-darkBlue">
          Garante o teu lugar
        </h2>

        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-2xl text-gray-500 leading-relaxed">
          Participe de uma das maiores celebrações da agilidade em Portugal.
          Preço exclusivo para os primeiros inscritos.
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative">
        <div className="absolute top-0 right-0 z-20 bg-brand-orange text-white font-black text-lg px-5 py-3 rounded-bl-2xl rounded-tr-2xl shadow-md rotate-0">
          LOTE 1
        </div>

          <div className="relative bg-white border-2 border-brand-orange rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] px-8 md:px-10 py-10 md:py-12">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-brand-orange px-5 py-2 text-sm md:text-base font-black tracking-wide">
              <Sparkles className="w-4 h-4" />
        text-5xl md:text-6xl
            </div>
          </div>

          <div className="text-center">
            <div className="text-5xl md:text-6xl font-black text-brand-darkBlue leading-none">
              42,80€
            </div>
          </div>

          <div className="mt-10 max-w-2xl mx-auto space-y-5">
            {[
              'Acesso completo ao evento',
              'Kit de Boas-vindas + T-Shirt Oficial',
              'Coffee Break Premium',
              'Scrum Education Units (SEUs) by Scrum Alliance',
              'Certificado de Participação Digital',
            ].map((item) => (
              <div key={item} className="flex items-start gap-4 text-left">
                <div className="mt-1 rounded-full bg-sky-100 p-1.5 flex-shrink-0">
                  <Check className="w-4 h-4 text-sky-500" />
                </div>
                <span className="text-lg text-gray-700 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <button
              onClick={onBuyClick}
              className="w-full rounded-[20px] bg-brand-orange text-white py-4 text-xl font-black shadow-[0_10px_30px_rgba(249,115,22,0.35)] hover:opacity-95 transition"
            >
              Comprar Bilhete
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
};
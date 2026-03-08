import React from 'react';
import { Section } from '../components/UIComponents';
import { Check, Sparkles, Tag } from 'lucide-react';

type Props = {
  onBuyClick: () => void;
};

export const Tickets: React.FC<Props> = ({ onBuyClick }) => {
  return (
    <Section id="tickets" className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-lightBlue/20 via-white to-white pointer-events-none" />

      <div className="relative z-10 text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 text-brand-orange px-4 py-2 text-sm font-bold mb-4">
          <Sparkles className="w-4 h-4" />
          Bilhetes já disponíveis
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue">
          Garante o teu lugar
        </h2>

        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Participe de uma das maiores celebrações da agilidade em Portugal.
          Preço exclusivo para os primeiros inscritos.
        </p>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="relative rounded-[32px] border border-brand-orange/20 bg-white shadow-2xl p-8 md:p-10">
          <div className="absolute -top-4 left-8 inline-flex items-center gap-2 rounded-full bg-brand-orange text-white px-4 py-2 text-sm font-black shadow-lg">
            <Tag className="w-4 h-4" />
            Lote 1
          </div>

          <div className="text-center pt-4">
            <h3 className="text-3xl md:text-4xl font-black text-brand-darkBlue">
              Early Bird Ticket
            </h3>

            <div className="mt-4 text-5xl md:text-6xl font-black text-brand-orange">
              42,80€
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Fatura com contribuinte disponível no momento da compra.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {[
              'Acesso completo ao evento',
              'Kit de Boas-vindas + T-Shirt Oficial',
              'Coffee Break Premium',
              'Scrum Education Units (SEUs) by Scrum Alliance',
              'Certificado de Participação Digital',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-left">
                <div className="mt-0.5 rounded-full bg-green-100 p-1">
                  <Check className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onBuyClick}
            className="mt-8 w-full rounded-2xl bg-brand-darkBlue text-white py-4 text-lg font-black hover:opacity-95 transition"
          >
            Comprar Bilhete
          </button>
        </div>
      </div>
    </Section>
  );
};
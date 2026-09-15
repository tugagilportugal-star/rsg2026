import React from 'react';
import { Section } from '../components/UIComponents';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { ASSETS } from '../config';

export const NextEvent: React.FC = () => {
  return (
    <Section className="bg-brand-darkBlue relative overflow-hidden py-20">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url('${ASSETS.GROUP_PHOTO_BG}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-darkBlue via-brand-darkBlue/95 to-brand-darkBlue"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <span className="inline-block border border-brand-orange text-brand-orange rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-6">
          Próximo na Agenda TugÁgil
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          A agilidade em Portugal não fica por aqui.
        </h2>

        <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-4">
          Gostou do RSG Lisbon 2026? Então não perca o <span className="text-white font-bold">TugÁgil Experience Gaia 2026</span>.
        </p>
        <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          Não pôde participar no RSG Lisbon 2026? Então não deixe de agarrar a oportunidade de viver o <span className="text-white font-bold">TugÁgil Experience Gaia 2026</span> — desta vez, a comunidade encontra-se no Norte de Portugal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-blue-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-orange" />
            <span className="font-bold">21 de Novembro de 2026</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-white/20"></div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-orange" />
            <span className="font-bold">Vila Nova de Gaia, Portugal</span>
          </div>
        </div>

        <a
          href="https://experience.tugagil.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-10 py-4 bg-brand-orange hover:bg-white hover:text-brand-orange text-white text-lg font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Conhecer o TugÁgil Experience Gaia 2026
          <ArrowUpRight className="w-5 h-5" />
        </a>
      </div>
    </Section>
  );
};

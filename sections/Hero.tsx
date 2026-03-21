import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { MapPin, Calendar, ArrowDown } from 'lucide-react';
import { ASSETS } from '../config';
import { useTicketStatus } from '../hooks/useTicketStatus';

export const Hero: React.FC = () => {
  const timeLeft = useCountdown('2026-05-21T00:00:00');
  const { hasActiveLot } = useTicketStatus();

  return (
    <section 
      id="hero" 
      className="relative min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed text-white overflow-hidden pt-16"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 31, 63, 0.6), rgba(0, 10, 20, 0.9)), url('${ASSETS.HERO_BG}')`
      }}
    >
      {/* Badge Flutuante */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-center pointer-events-none">
        <div 
           className="mt-24 bg-brand-darkBlue/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2"
        >
           <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">
             Official Scrum Alliance Event
           </span>
        </div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto flex flex-col items-center justify-center flex-grow pt-32">
        
        {/* LOGO E "ORGANIZADO POR" */}
        <div className="flex flex-col items-center mb-6 animate-fade-in-up">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-4">
                ORGANIZADO POR
            </span>
            <a 
                href="https://www.tugagil.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform duration-300"
                title="Visitar TugÁgil"
            >
                <img 
                    src={ASSETS.TUGAGIL_LOGO} 
                    alt="TugÁgil" 
                    className="h-12 md:h-16 w-auto object-contain drop-shadow-2xl"
                />
            </a>
        </div>

        {/* TÍTULO PRINCIPAL (Agora tudo Branco) */}
        <div className="flex flex-col items-center leading-none mb-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter drop-shadow-xl">
              Regional Scrum
            </h1>
            {/* Removido o gradiente, agora é text-white */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter drop-shadow-xl pb-2">
              Gathering
            </h1>
        </div>

        {/* LISBON 2026 */}
        <div className="text-2xl md:text-4xl lg:text-5xl text-gray-200 font-light uppercase tracking-[0.4em] md:tracking-[0.6em] mb-8 drop-shadow-lg pl-2">
          LISBON 2026
        </div>

        {/* TAGLINE */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium drop-shadow-md">
          A maior celebração da agilidade em Portugal. Reserve a data.
        </p>

        {/* CONTADOR */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 mb-12 w-full md:w-auto">
          {[
            { label: 'Dias', value: timeLeft.days },
            { label: 'Horas', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Segs', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-3 md:p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl min-w-[70px] md:min-w-[100px]">
              <span className="text-xl md:text-3xl font-black text-brand-orange">{String(item.value).padStart(2, '0')}</span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-1 text-gray-400 font-bold">{item.label}</span>
            </div>
          ))}
        </div>

        {/* DATA E LOCAL */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-10 bg-white/5 p-4 md:px-12 md:py-4 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-blue" />
            <span className="text-base md:text-lg font-bold">21 Maio 2026</span>
          </div>
          <div className="hidden md:block h-5 w-px bg-white/20"></div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-brand-blue" />
            <span className="text-base md:text-lg font-bold">Auditório Alto dos Moinhos - Lisboa, Portugal</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-10 py-4 bg-brand-orange text-white font-black text-lg uppercase tracking-widest rounded-full shadow-[0_20px_40px_rgba(244,122,32,0.4)] hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-transparent hover:border-orange-300/30 bg-clip-padding mb-24"
        >
          {hasActiveLot ? 'Garanta o seu Lugar' : 'Entrar na Waitlist'}
        </button>
      </div>
      
      <div className="absolute bottom-10 animate-bounce text-white/30 hidden md:block">
        <ArrowDown className="w-8 h-8" />
      </div>
    </section>
  );
};

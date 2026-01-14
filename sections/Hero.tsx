import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { MapPin, Calendar, ArrowDown } from 'lucide-react';
import { ASSETS } from '../config';

export const Hero: React.FC = () => {
  const timeLeft = useCountdown('2026-05-21T00:00:00');

  return (
    <section 
      id="hero" 
      className="relative min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed text-white overflow-hidden pt-16"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 31, 63, 0.6), rgba(0, 10, 20, 0.9)), url('${ASSETS.HERO_BG}')`
      }}
    >
      {/* Badge Flutuante (Opcional) */}
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
            <img 
                src={ASSETS.TUGAGIL_LOGO} 
                alt="TugÁgil" 
                className="h-12 md:h-16 w-auto object-contain drop-shadow-2xl"
            />
        </div>

        {/* TÍTULO PRINCIPAL */}
        <div className="flex flex-col items-center leading-none mb-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter drop-shadow-xl">
              Regional Scrum
            </h1>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter drop-shadow-xl pb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009FDA] via-[#009FDA] to-[#F47A20]">
                Gathering
              </span>
            </h1>
        </div>

        {/* LISBOA 2026 */}
        <div className="text-2xl md:text-4xl lg:text-5xl text-gray-200 font-light uppercase tracking-[0.4em] md:tracking-[0.6em] mb-10 drop-shadow-lg pl-2">
          LISBON 2026
        </div>

        {/* TAGLINE */}
        <p className="text-lg md:text-2xl text-gray-300 mb-14 max-w-3xl mx-auto font-medium drop-shadow-md">
          A maior celebração da agilidade em Portugal. Reserve a data.
        </p>

        {/* CONTADOR MAIOR */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 mb-14 w-full md:w-auto">
          {[
            { label: 'Dias', value: timeLeft.days },
            { label: 'Horas', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Segs', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl min-w-[80px] md:min-w-[130px]">
              {/* Aumentado para text-5xl em desktop */}
              <span className="text-3xl md:text-5xl font-black text-brand-orange">{String(item.value).padStart(2, '0')}</span>
              <span className="text-xs md:text-sm uppercase tracking-widest mt-2 text-gray-400 font-bold">{item.label}</span>
            </div>
          ))}
        </div>

        {/* DATA E LOCAL MAIORES */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-16 mb-12 bg-white/5 p-6 md:px-16 md:py-6 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-brand-blue" />
            {/* Aumentado para text-2xl */}
            <span className="text-xl md:text-2xl font-bold">21 Maio 2026</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-white/20"></div>
          <div className="flex items-center gap-4">
            <MapPin className="w-6 h-6 md:w-8 md:h-8 text-brand-blue" />
            {/* Aumentado para text-2xl */}
            <span className="text-xl md:text-2xl font-bold">Lisboa, Portugal</span>
          </div>
        </div>

        {/* CTA MAIOR */}
        <button 
          onClick={() => document.getElementById('get-involved')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-12 py-5 md:px-16 md:py-6 bg-brand-orange text-white font-black text-xl md:text-2xl uppercase tracking-widest rounded-full shadow-[0_20px_40px_rgba(244,122,32,0.4)] hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-transparent hover:border-orange-300/30 bg-clip-padding mb-32"
        >
          Garante o teu Lugar
        </button>
      </div>
      
      <div className="absolute bottom-10 animate-bounce text-white/30 hidden md:block">
        <ArrowDown className="w-10 h-10" />
      </div>
    </section>
  );
};

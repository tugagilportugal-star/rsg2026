import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { MapPin, Calendar, ArrowDown } from 'lucide-react';
import { ASSETS } from '../config';

export const Hero: React.FC = () => {
  const timeLeft = useCountdown('2026-05-21T00:00:00');

  return (
    <section 
        id="hero" 
        // Alterado para bg-scroll no mobile e bg-fixed no desktop para melhor compatibilidade e visibilidade da imagem
        className="relative min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed text-white overflow-x-hidden"
        style={{
            // Reduzida a opacidade do gradiente (de 0.7/0.9 para 0.5/0.8) para a imagem aparecer mais
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('${ASSETS.HERO_BG}')`
        }}
    >
      
      {/* Top Branding */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-center">
        <div className="bg-brand-darkBlue/80 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10 shadow-lg mt-4 md:mt-0">
           <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs md:text-sm">
             Official Scrum Alliance Event
           </span>
        </div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto animate-fade-in-up flex flex-col items-center justify-center flex-grow pt-32 pb-32">
        
        {/* Powered By TugÁgil - Moved Above Title */}
        <div className="flex flex-col items-center justify-center mb-6 animate-fade-in-up">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-300 mb-2 font-semibold shadow-black drop-shadow-md">
                Powered by
            </span>
            <a 
                href="https://tugagil.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 hover:scale-105 transition-all duration-300"
            >
                <img 
                    src={ASSETS.TUGAGIL_LOGO} 
                    alt="Powered by TugÁgil" 
                    className="h-10 md:h-14 w-auto object-contain drop-shadow-md"
                />
            </a>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-tight tracking-tight drop-shadow-xl">
          Regional Scrum Gathering <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-white">Lisbon 2026</span>
        </h1>

        <p className="text-xl md:text-3xl text-gray-100 mb-12 max-w-4xl mx-auto font-light drop-shadow-md">
          O maior encontro da comunidade ágil em Portugal está de volta.
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 md:gap-8 max-w-4xl mx-auto mb-10 w-full md:w-auto">
          {[
            { label: 'Dias', value: timeLeft.days },
            { label: 'Horas', value: timeLeft.hours },
            { label: 'Minutos', value: timeLeft.minutes },
            { label: 'Segundos', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-3 md:p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl min-w-[70px] md:min-w-[120px]">
              <span className="text-2xl md:text-6xl font-bold font-mono text-brand-orange">{String(item.value).padStart(2, '0')}</span>
              <span className="text-[10px] md:text-sm uppercase tracking-wider mt-1 md:mt-2 text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Location & Date Badge */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-12 text-lg md:text-2xl font-semibold bg-brand-darkBlue/50 p-4 rounded-2xl backdrop-blur-sm border border-white/5 inline-flex">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-blue" />
            <span className="tracking-wide">Mai 2026</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-white/20"></div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-brand-blue" />
            <span className="tracking-wide">Lisboa, Portugal</span>
          </div>
        </div>

        <div className="flex justify-center pb-4">
             <button onClick={() => document.getElementById('get-involved')?.scrollIntoView()} className="group relative px-8 py-4 bg-brand-orange text-white font-extrabold text-xl rounded-full overflow-hidden shadow-[0_0_20px_rgba(244,122,32,0.5)] transition-transform hover:scale-105 active:scale-95">
                <span className="relative z-10 uppercase tracking-widest">Save the Date</span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-orange-600/50"></div>
             </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce text-white/50 hidden md:block">
        <ArrowDown className="w-8 h-8" />
      </div>
    </section>
  );
};
import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { MapPin, Calendar, ArrowDown } from 'lucide-react';
import { ASSETS } from '../config';

export const Hero: React.FC = () => {
  const timeLeft = useCountdown('2026-05-21T00:00:00');

  return (
    <section 
        id="hero" 
<<<<<<< HEAD
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
=======
        className="relative min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed text-white overflow-hidden"
        style={{
            backgroundImage: `linear-gradient(rgba(0, 20, 40, 0.75), rgba(0, 10, 20, 0.9)), url('${ASSETS.HERO_BG}')`
        }}
    >
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-center">
        <div className="bg-brand-darkBlue/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg mt-4">
           <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">
>>>>>>> 80a3747 (Design final e limpeza de módulos para RSG Lisbon 2026)
             Official Scrum Alliance Event
           </span>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col items-center justify-center flex-grow pt-20">
        <div className="flex flex-col items-center mb-10 animate-fade-in-up">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4 font-bold">
                Organizado por
            </span>
            <img 
                src={ASSETS.TUGAGIL_LOGO} 
                alt="TugÁgil" 
                className="h-12 md:h-16 w-auto object-contain drop-shadow-xl"
            />
        </div>

        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight tracking-tighter drop-shadow-2xl">
>>>>>>> 80a3747 (Design final e limpeza de módulos para RSG Lisbon 2026)
          Regional Scrum Gathering <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-white">Lisbon 2026</span>
        </h1>

<<<<<<< HEAD
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
=======
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium drop-shadow-md">
          A maior celebração da agilidade em Portugal regressa às margens do Tejo.
        </p>

        <div className="grid grid-cols-4 gap-4 md:gap-8 mb-16 w-full md:w-auto">
          {[
            { label: 'Dias', value: timeLeft.days },
            { label: 'Horas', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Segs', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl min-w-[80px] md:min-w-[120px]">
              <span className="text-2xl md:text-5xl font-black text-brand-orange">{String(item.value).padStart(2, '0')}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-widest mt-2 text-gray-400 font-bold">{item.label}</span>
>>>>>>> 80a3747 (Design final e limpeza de módulos para RSG Lisbon 2026)
            </div>
          ))}
        </div>

<<<<<<< HEAD
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
=======
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-12 bg-white/5 p-4 md:px-12 md:py-6 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-brand-blue" />
            <span className="text-lg md:text-xl font-bold">21 Maio 2026</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-white/20"></div>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-brand-blue" />
            <span className="text-lg md:text-xl font-bold">Lisboa, Portugal</span>
          </div>
        </div>

        <button 
          onClick={() => document.getElementById('get-involved')?.scrollIntoView()}
          className="px-12 py-5 bg-brand-orange text-white font-black text-xl uppercase tracking-widest rounded-full shadow-[0_20px_40px_rgba(244,122,32,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          Reserve o seu Lugar
        </button>
      </div>
      
      <div className="absolute bottom-10 animate-bounce text-white/20 hidden md:block">
        <ArrowDown className="w-10 h-10" />
>>>>>>> 80a3747 (Design final e limpeza de módulos para RSG Lisbon 2026)
      </div>
    </section>
  );
};
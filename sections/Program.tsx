import React from 'react';
import { Section } from '../components/UIComponents';
import { BrainCircuit, Network, Cpu, Mic2 } from 'lucide-react';

export const Program: React.FC = () => {
  const tracks = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-brand-orange" />,
      title: "Leadership & Coaching",
      description: "O lado humano da agilidade. Sessões dedicadas a desbloquear o potencial de equipas, navegar conflitos e liderar transformações culturais profundas.",
      highlight: "Inspirado em Coaching Agile Teams"
    },
    {
      icon: <Network className="w-8 h-8 text-brand-blue" />,
      title: "Flow & Business Agility",
      description: "Do caos à previsibilidade. Estratégias para gerir dependências em escala, otimizar fluxos de valor e alinhar a execução técnica aos objetivos de negócio.",
      highlight: "Foco em Outcomes e Escala"
    },
    {
      icon: <Cpu className="w-8 h-8 text-purple-500" />,
      title: "Technical Excellence & QA",
      description: "A agilidade não existe sem engenharia sólida. Práticas de DevOps, arquiteturas escaláveis e estratégias de qualidade para sustentar a inovação contínua.",
      highlight: "Engenharia de Alta Performance"
    }
  ];

  return (
    <Section id="program" className="bg-white">
      <div className="text-center mb-16">
        <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs block mb-3">
          Agenda 2026
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6">
          The Program
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Um programa desenhado para oferecer uma visão 360º da agilidade moderna. 
          Conectamos estratégia, liderança e engenharia num único palco.
        </p>
      </div>

      {/* Grid de Trilhas / Temas */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {tracks.map((track, idx) => (
          <div key={idx} className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              {track.icon}
            </div>
            <h3 className="text-xl font-bold text-brand-darkBlue mb-3">
              {track.title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
              {track.description}
            </p>
            <div className="inline-block bg-white border border-gray-200 text-xs font-bold text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider">
              {track.highlight}
            </div>
          </div>
        ))}
      </div>

      {/* Teaser do Keynote (Sem citar Lyssa ainda, mas preparando o terreno) */}
      <div className="max-w-4xl mx-auto bg-brand-darkBlue rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-orange rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-brand-blue rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-brand-orange font-bold uppercase tracking-widest text-xs mb-4">
                <Mic2 className="w-4 h-4" />
                Opening Keynote
            </div>
            <h3 className="text-2xl md:text-4xl font-black mb-6">
              Uma voz global da Transformação Ágil
            </h3>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Estamos a trazer a Lisboa uma das maiores referências mundiais em Coaching e Liderança Ágil. 
              Prepare-se para uma abertura que vai redefinir a sua perspectiva sobre equipas de alta performance.
            </p>
            
            <button 
                className="text-white border-b border-brand-orange pb-1 hover:text-brand-orange transition-colors font-bold"
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
                Inscreva-se na Waitlist para saber primeiro
            </button>
        </div>
      </div>
    </Section>
  );
};

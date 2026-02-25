import React from 'react';
import { Section } from '../components/UIComponents';
import { Mic2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Program: React.FC = () => {
  const tracks = [
    {
      id: "01",
      title: "Leadership & Coaching",
      description: "O lado humano da agilidade. Sessões dedicadas a desbloquear o potencial de equipas, navegar conflitos e liderar transformações culturais profundas.",
      tags: ["Transformação", "Cultura", "Pessoas"]
    },
    {
      id: "02",
      title: "Flow & Business Agility",
      description: "Do caos à previsibilidade. Estratégias para gerir dependências em escala, otimizar fluxos de valor e alinhar a execução técnica aos objetivos de negócio.",
      tags: ["Estratégia", "Escala", "Metrics"]
    },
    {
      id: "03",
      title: "Technical Excellence",
      description: "A agilidade não existe sem engenharia sólida. Práticas de DevOps, arquiteturas escaláveis e estratégias de qualidade para sustentar a inovação contínua.",
      tags: ["DevOps", "QA", "Arquitetura"]
    }
  ];

  return (
    <Section id="program" className="bg-brand-darkBlue relative overflow-hidden py-24">
      
      {/* Background Decorativo (Luzes de Fundo) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-24">
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-brand-orange font-bold tracking-[0.2em] uppercase text-[10px] mb-6 backdrop-blur-md">
            Programação 2026
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Content Tracks
          </h2>
          <p className="text-blue-200/80 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Três pilares fundamentais. Uma conferência desenhada para conectar 
            <span className="text-white font-medium"> Estratégia</span>, 
            <span className="text-white font-medium"> Liderança</span> e 
            <span className="text-white font-medium"> Engenharia</span>.
          </p>
        </div>

        {/* Lista de Tracks (Cards com Destaque Azul/Laranja) */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {tracks.map((track) => (
            <div key={track.id} className="group relative flex flex-col h-full">
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-brand-blue/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex-grow bg-gradient-to-br from-white/5 to-brand-blue/10 border border-white/10 group-hover:border-brand-blue/50 p-8 rounded-3xl transition-all duration-300 backdrop-blur-sm group-hover:-translate-y-2">
                
                {/* Número Gigante em Laranja */}
                <div className="absolute -top-6 -right-4 text-8xl font-black text-brand-orange opacity-20 group-hover:opacity-40 transition-opacity select-none z-0">
                   {track.id}
                </div>

                <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-brand-blue transition-colors">
                      {track.title}
                    </h3>
                    
                    <div className="h-1 w-12 bg-brand-orange mb-6 rounded-full"></div>

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                      {track.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {track.tags.map((tag) => (
                        <span key={tag} className="text-[11px] font-bold tracking-wider text-brand-blue uppercase bg-brand-darkBlue/50 border border-brand-blue/30 px-3 py-1.5 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Destaque Keynote (Estilo "Palco Principal") */}
        <div className="relative rounded-3xl p-1 bg-gradient-to-r from-brand-orange via-brand-orange/50 to-brand-blue/50 shadow-[0_0_50px_rgba(244,122,32,0.15)]">
            <div className="absolute top-0 right-0 bg-white text-brand-darkBlue font-black text-xs px-3 py-1 rounded-bl-xl z-20 uppercase tracking-widest">
                Confirmed
            </div>

            <div className="bg-brand-darkBlue rounded-[20px] p-8 md:p-14 relative overflow-hidden">
                {/* Background radial para foco */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(244,122,32,0.08),transparent_50%)]"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    
                    {/* Ícone de Microfone com Círculos Concêntricos */}
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-brand-orange/20 rounded-full animate-ping"></div>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-orange to-red-500 flex items-center justify-center shadow-2xl border-4 border-brand-darkBlue relative z-10">
                            <Mic2 className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-grow">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-brand-orange font-bold text-sm uppercase tracking-widest mb-3">
                            <CheckCircle2 className="w-4 h-4" />
                            Opening Keynote
                        </div>
                        
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                            Liderança & Agile Coaching Global
                        </h3>
                        
                        <p className="text-gray-300 mb-8 max-w-2xl text-lg font-light">
                            Estamos a trazer a Lisboa uma das maiores referências mundiais em Coaching e Liderança Ágil.
                            Prepare-se para uma abertura que vai redefinir a sua perspectiva sobre equipas de alta performance.
                          
                        </p>

                        <button 
                            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group inline-flex items-center gap-3 bg-white text-brand-darkBlue px-8 py-3 rounded-full font-bold hover:bg-brand-orange hover:text-white transition-all duration-300 shadow-lg"
                        >
                            Quero saber quem é
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </Section>
  );
};

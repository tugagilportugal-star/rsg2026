import React from 'react';
import { Section } from '../components/UIComponents';
import { Mic2, ArrowRight } from 'lucide-react';

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
    <Section id="program" className="bg-brand-darkBlue relative overflow-hidden">
      {/* Background Decorativo Sutil */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center mb-20">
          <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs block mb-4">
            Pilares de Conhecimento
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Trilhas de Conteúdos
          </h2>
          <p className="text-blue-100/80 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            A estrutura do evento foi desenhada para conectar estratégia, liderança e engenharia. 
            Perspectivas distintas, um único objetivo: <span className="text-white font-medium">Excelência.</span>
          </p>
        </div>

        {/* Lista de Tracks (Estilo Corporate/List) */}
        <div className="grid lg:grid-cols-3 gap-6 mb-20 max-w-7xl mx-auto">
          {tracks.map((track) => (
            <div key={track.id} className="group relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300">
              
              <div className="flex items-start justify-between mb-6">
                 <span className="text-4xl font-black text-white/20 group-hover:text-brand-orange/50 transition-colors">
                    {track.id}
                 </span>
                 <div className="h-px w-12 bg-white/20 mt-4"></div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-blue transition-colors">
                {track.title}
              </h3>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-8 min-h-[80px]">
                {track.description}
              </p>

              {/* Tags minimalistas */}
              <div className="flex flex-wrap gap-2">
                {track.tags.map((tag) => (
                  <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-brand-blue bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Destaque Keynote (Visual Diferente - Gold/Premium) */}
        <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-r from-gray-900 to-brand-darkBlue border border-white/10 rounded-3xl p-1 overflow-hidden">
                <div className="absolute inset-0 bg-brand-orange/5"></div>
                
                <div className="relative bg-black/20 backdrop-blur-xl rounded-[20px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    
                    {/* Ícone ou Elemento Visual à Esquerda */}
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full bg-brand-orange flex items-center justify-center shadow-[0_0_30px_rgba(244,122,32,0.4)]">
                            <Mic2 className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Texto */}
                    <div className="flex-grow text-center md:text-left">
                        <div className="text-brand-orange font-bold text-xs uppercase tracking-widest mb-2">
                            Opening Keynote
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Liderança & Agile Coaching Global
                        </h3>
                        <p className="text-gray-400 mb-6 text-sm md:text-base">
                            Estamos a trazer a Lisboa uma das maiores referências mundiais em Coaching e Liderança Ágil. 
                            Prepare-se para uma abertura que vai redefinir a sua perspectiva sobre equipas de alta performance.
                        </p>
                        <button 
                            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex items-center text-white font-bold border-b-2 border-brand-orange pb-1 hover:text-brand-orange transition-colors group"
                        >
                            Garanta o seu lugar na Waitlist
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>
            </div>
        </div>

      </div>
    </Section>
  );
};

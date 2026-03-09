import React from 'react';
import { Section } from '../components/UIComponents';
import { Mic2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Program: React.FC = () => {
  const dimensions = [
    {
      id: "01",
      title: "Liderança & Pessoas",
      description: "Numa era de aceleração e burnout, voltamos ao essencial: as pessoas. Ferramentas para líderes navegarem a complexidade, gerirem a carga cognitiva das equipas e construírem resiliência emocional.",
      tags: ["Cognitive Load", "Humanity", "Culture"]
    },
    {
      id: "02",
      title: "Fluxo & Design Organizacional",
      description: "Como estruturar organizações para o fluxo rápido? Da gestão de dependências às interações entre equipas, desenhamos sistemas para entregar valor contínuo e alinhar estratégia à execução.",
      tags: ["Fast Flow", "Systems Thinking", "Scale"]
    },
    {
      id: "03",
      title: "Gestão e Estratégia de Inovação & Qualidade",
      description: "O mito vs. a realidade. Como a Inteligência Artificial está a redefinir a estratégia de qualidade, automação e engenharia. Casos reais de governança e inovação tecnológica.",
      tags: ["AI Governance", "Modern QA", "Future-Fit"]
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
            O Foco de 2026
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">
            Dimensões Centrais
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-4">
              A estrutura do evento foi desenhada para conectar <span className="text-brand-orange">Agilidade</span>, <span className="text-brand-orange">Inovação</span> e <span className="text-orange-400">Inteligência Artificial</span>.
            </p>
          </div>
        </div>

        {/* Lista de Dimensões (Layout Anterior com Números Grandes) */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {dimensions.map((item) => (
            <div key={item.id} className="group relative flex flex-col h-full">
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-brand-blue/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex-grow bg-gradient-to-br from-white/5 to-brand-blue/10 border border-white/10 group-hover:border-brand-blue/50 p-8 rounded-3xl transition-all duration-300 backdrop-blur-sm group-hover:-translate-y-2">
                
                {/* Número Gigante em Laranja */}
                <div className="absolute -top-6 -right-4 text-8xl font-black text-brand-orange opacity-20 group-hover:opacity-40 transition-opacity select-none z-0">
                   {item.id}
                </div>

                <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="h-1 w-12 bg-brand-orange mb-6 rounded-full"></div>

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {item.tags.map((tag) => (
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

        {/* Destaque Keynote (Layout Palco - Sem nomes) */}
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
                        
                        <p className="text-gray-300 mb-8 max-w-2xl text-lg font-light leading-relaxed">
                            Uma das figuras fundadoras do movimento ágil vem a Lisboa para nos guiar através da era da aceleração. 
                            Uma keynote sobre o impacto massivo que podemos ter num mundo em transformação exponencial.
                            <br/>
                        </p>

                        <button 
                            onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group inline-flex items-center gap-3 bg-white text-brand-darkBlue px-8 py-3 rounded-full font-bold hover:bg-brand-orange hover:text-white transition-all duration-300 shadow-lg"
                        >
                            Garanta o teu lugar
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

import React from 'react';
import { Section } from '../components/UIComponents';
import { Mic2, ArrowRight, CheckCircle2, Users, GitMerge, Bot } from 'lucide-react';

export const Program: React.FC = () => {
  const dimensions = [
    {
      id: "01",
      icon: <Users className="w-6 h-6 text-brand-orange" />,
      title: "Human Systems & Leadership",
      description: "Numa era de aceleração e burnout, voltamos ao essencial: as pessoas. Ferramentas para líderes navegarem a complexidade, gerirem a carga cognitiva das equipas e construírem resiliência emocional.",
      tags: ["Cognitive Load", "Humanity", "Coaching"]
    },
    {
      id: "02",
      icon: <GitMerge className="w-6 h-6 text-brand-blue" />,
      title: "Flow & Organizational Design",
      description: "Como estruturar organizações para o fluxo rápido? Da gestão de dependências (Flight Levels) às interações entre equipas (Team Topologies), desenhamos sistemas para entregar valor contínuo.",
      tags: ["Fast Flow", "Systems Thinking", "Scale"]
    },
    {
      id: "03",
      icon: <Bot className="w-6 h-6 text-purple-400" />,
      title: "AI Innovation & Quality Strategy",
      description: "O mito vs. a realidade. Como a Inteligência Artificial está a redefinir a estratégia de qualidade, automação e engenharia. Casos reais de governança e inovação tecnológica.",
      tags: ["AI Governance", "Modern QA", "Future-Fit"]
    }
  ];

  return (
    <Section id="program" className="bg-brand-darkBlue relative overflow-hidden py-24">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-24">
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-brand-orange font-bold tracking-[0.2em] uppercase text-[10px] mb-6 backdrop-blur-md">
            Dimensões 2026
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">
            Core Dimensions
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-4">
              A estrutura do evento foi desenhada para conectar <span className="text-brand-orange">Agilidade</span>, <span className="text-brand-blue">Inovação</span> e <span className="text-purple-400">Inteligência Artificial</span>.
            </p>
            <p className="text-blue-200/60 text-lg font-light leading-relaxed">
              Uma resposta sistémica aos desafios da era da aceleração, integrando fluxo organizacional, estratégia tecnológica e a insubstituível capacidade humana.
            </p>
          </div>
        </div>

        {/* Lista de Dimensões */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {dimensions.map((item) => (
            <div key={item.id} className="group relative flex flex-col h-full">
              
              <div className="absolute inset-0 bg-brand-blue/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex-grow bg-gradient-to-br from-white/5 to-brand-blue/5 border border-white/10 group-hover:border-brand-blue/30 p-8 rounded-3xl transition-all duration-300 backdrop-blur-sm group-hover:-translate-y-2">
                
                {/* Cabeçalho do Card */}
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-brand-blue/20 transition-colors">
                        {item.icon}
                    </div>
                    <span className="text-4xl font-black text-white/10 group-hover:text-brand-orange/20 transition-colors select-none">
                        {item.id}
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-blue transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold tracking-wider text-brand-blue uppercase bg-brand-darkBlue/80 border border-brand-blue/20 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Destaque Keynote - Lyssa Adkins */}
        <div className="relative rounded-3xl p-px bg-gradient-to-r from-brand-orange via-red-500 to-purple-600 shadow-[0_0_60px_rgba(244,122,32,0.15)]">
            <div className="absolute top-0 right-0 bg-white text-brand-darkBlue font-black text-[10px] px-4 py-1.5 rounded-bl-xl z-20 uppercase tracking-widest">
                Confirmed • Opening Keynote
            </div>

            <div className="bg-brand-darkBlue rounded-[23px] p-8 md:p-12 relative overflow-hidden h-full">
                {/* Efeito de palco */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(244,122,32,0.1),transparent_60%)]"></div>

                <div className="relative z-10 grid md:grid-cols-[auto_1fr] gap-10 items-center">
                    
                    {/* Foto/Avatar Placeholder ou Ícone */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-orange/30 rounded-full blur-2xl animate-pulse-slow"></div>
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-brand-orange/50 flex items-center justify-center overflow-hidden relative shadow-2xl">
                             {/* 
                                Se tiver a foto dela, pode colocar aqui. 
                                Por enquanto mantive o ícone para seguir o padrão visual.
                             */}
                            <Mic2 className="w-12 h-12 text-white/80" />
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                            Lyssa Adkins
                        </h3>
                        <p className="text-brand-orange font-bold text-sm uppercase tracking-wider mb-6">
                            Author of "Coaching Agile Teams" • Systems Coach
                        </p>
                        
                        <p className="text-gray-300 mb-8 max-w-2xl text-lg font-light leading-relaxed">
                            "What if we were made for this time?" <br/>
                            Uma das figuras fundadoras do movimento ágil vem a Lisboa para nos guiar através da era da aceleração. Uma keynote sobre o impacto massivo que podemos ter num mundo em transformação exponencial.
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <button 
                                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group inline-flex items-center gap-2 bg-white text-brand-darkBlue px-6 py-3 rounded-full font-bold hover:bg-brand-orange hover:text-white transition-all duration-300"
                            >
                                Inscreva-se na Waitlist
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <a 
                                href="https://lyssaadkins.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/30 transition-all"
                            >
                                Conhecer Lyssa
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </Section>
  );
};

import React from 'react';
import { Section } from '../components/UIComponents';
import { ArrowRight } from 'lucide-react';

interface ProgramProps {
  onOpenTicketModal: () => void;
}

export const Program: React.FC<ProgramProps> = ({ onOpenTicketModal }) => {
  const dimensions =[
    {
      id: "01",
      title: "Liderança & Pessoas",
      description: "Numa era de aceleração e burnout, voltamos ao essencial: as pessoas. Ferramentas para líderes navegarem a complexidade, gerirem a carga cognitiva das equipas e construírem resiliência emocional."
    },
    {
      id: "02",
      title: "Fluxo & Design Organizacional",
      description: "Como estruturar organizações para o fluxo rápido? Da gestão de dependências às interações entre equipas, desenhamos sistemas para entregar valor contínuo e alinhar estratégia à execução."
    },
    {
      id: "03",
      title: "Gestão e Estratégia de Qualidade & Inovação",
      description: "O mito vs. a realidade. Como a Inteligência Artificial está a redefinir a estratégia de qualidade, automação e engenharia. Casos reais de governança e inovação tecnológica."
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
            O foco de 2026
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

        {/* Lista de Dimensões (Sem as tags) */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
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

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                      {item.description}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

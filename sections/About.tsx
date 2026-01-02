import React from 'react';
import { Section } from '../components/UIComponents';
import { Compass, Sun, Users, Zap, ExternalLink } from 'lucide-react';
import { ASSETS } from '../config';

export const About: React.FC = () => {
  return (
    <>
      {/* What is RSG - Elaborate Design */}
      <section id="about" className="py-20 md:py-32 relative overflow-hidden bg-white">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-geometric opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Grid Layout Restored: lg:grid-cols-2 makes it side-by-side only on large screens, stacked on tablets */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Title */}
            <div className="relative">
               <h2 className="text-4xl md:text-6xl font-black mb-8 text-brand-darkBlue leading-tight">
                 O que é o <br/>
                 <span className="text-brand-blue">Regional Scrum Gathering?</span>
               </h2>
               <div className="w-24 h-2 bg-brand-orange mb-8 rounded-full"></div>
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl -z-10"></div>
            </div>

            {/* Right Column: Content Box */}
            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-blue-100">
               <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                 O Regional Scrum Gathering é um evento oficial da <span className="font-bold text-brand-blue">Scrum Alliance®</span>, presente em dezenas cidades pelo mundo, com o propósito de aproximar a comunidade ágil, promover aprendizagem contínua e fortalecer conexões reais.
               </p>
               
               <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                 É um espaço para aprender, partilhar práticas, conectar comunidades e inspirar quem trabalha com agilidade, produtos e transformação organizacional.
               </p>

               <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
                 A edição de 2026 marca a <span className="font-bold text-brand-orange">terceira vez</span> que Portugal recebe este encontro, e queremos torná-la a maior e mais impactante até agora.
               </p>
               
               <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 pt-8 gap-6">
                  <div>
                    <span className="block text-4xl font-black text-brand-darkBlue">3ª</span>
                    <span className="text-sm font-bold text-brand-orange uppercase tracking-wider">Edição em Portugal</span>
                  </div>
                  <div className="italic text-brand-darkBlue font-bold text-right text-lg">
                    "Um encontro. Uma comunidade. <br/> Infinitas possibilidades."
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Lisbon - Dynamic Background using config with enhanced overlay */}
      <section 
        // Bg-scroll no mobile ajuda a imagem a aparecer melhor do que fixed
        className="py-24 relative text-white bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed"
        style={{
            // Opacidade reduzida de 0.9/0.95 para 0.7/0.9
            backgroundImage: `linear-gradient(rgba(0, 30, 60, 0.7), rgba(0, 10, 20, 0.9)), url('${ASSETS.LISBON_BG}')`
        }}
      >
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="md:w-2/3 lg:w-1/2 animate-fade-in-up">
              <div className="inline-block px-4 py-1 bg-brand-orange/20 border border-brand-orange/50 rounded-full mb-4">
                 <span className="text-brand-orange font-bold text-sm tracking-widest uppercase">Destino 2026</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8">Por que Lisboa?</h2>
              
              <p className="text-xl md:text-2xl font-light leading-relaxed mb-8 text-gray-200">
                O cenário ideal para acolher a comunidade ágil global. Lisboa não é apenas uma cidade, é um ecossistema.
              </p>

              {/* Data Citation Block */}
              <div className="mb-12 p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:border-brand-orange/40 transition-colors">
                  <p className="text-gray-100 text-lg font-medium leading-relaxed mb-2">
                     Lisboa é considerada uma das cidades europeias mais promissoras ao nível de ecossistema tecnológico.
                  </p>
                  <a 
                    href="https://dealroom.co/tech-ecosystem-index-2025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-bold text-brand-orange hover:text-white uppercase tracking-wider transition-colors"
                  >
                     Fonte: Global Tech Ecosystem Index 2025, Dealroom
                     <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <Zap className="w-8 h-8 text-brand-orange mt-1 flex-shrink-0" />
                    <div>
                       <h3 className="font-bold text-lg">Hub de Inovação</h3>
                       <p className="text-sm text-gray-300 mt-1">Uma das capitais tecnológicas que mais cresce na Europa.</p>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <Compass className="w-8 h-8 text-brand-blue mt-1 flex-shrink-0" />
                    <div>
                       <h3 className="font-bold text-lg">Acessível</h3>
                       <p className="text-sm text-gray-300 mt-1">Conectividade global, transportes fáceis e localização estratégica.</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <Users className="w-8 h-8 text-brand-orange mt-1 flex-shrink-0" />
                    <div>
                       <h3 className="font-bold text-lg">Multicultural</h3>
                       <p className="text-sm text-gray-300 mt-1">Um ponto de encontro diverso onde todas as vozes são ouvidas.</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <Sun className="w-8 h-8 text-brand-blue mt-1 flex-shrink-0" />
                    <div>
                       <h3 className="font-bold text-lg">Vibrante</h3>
                       <p className="text-sm text-gray-300 mt-1">Clima incrível, gastronomia rica e uma energia contagiante.</p>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </section>
    </>
  );
};
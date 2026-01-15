import React from 'react';
import { Sun, Zap, Users, Globe, ExternalLink } from 'lucide-react';
import { ASSETS } from '../config';

export const About: React.FC = () => {
  return (
    <>
      {/* --- PRIMEIRA SECÇÃO: O QUE É --- */}
      <section id="about" className="py-20 md:py-32 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-geometric opacity-30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center text-center lg:text-left">
            <div className="relative">
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-brand-darkBlue leading-tight">
                 O que é o <br/>
                 <span className="text-brand-blue">Regional Scrum Gathering?</span>
               </h2>
               <div className="w-24 h-2 bg-brand-orange mb-8 rounded-full mx-auto lg:mx-0"></div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-blue-100 text-left">
               <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                 O Regional Scrum Gathering é um evento oficial da <span className="font-bold text-brand-blue">Scrum Alliance®</span>, presente em dezenas de cidades pelo mundo.
               </p>
               <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
                 É um espaço para aprender, partilhar práticas e inspirar quem trabalha com agilidade.
               </p>
               <div className="flex items-center justify-between border-t border-gray-200 pt-8">
                  <div>
                    <span className="block text-4xl font-black text-brand-darkBlue">3ª</span>
                    <span className="text-sm font-bold text-brand-orange uppercase tracking-wider">Edição em Portugal</span>
                  </div>
                  <div className="italic text-brand-darkBlue font-bold text-right text-lg">"Conectar comunidades."</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEGUNDA SECÇÃO: POR QUE LISBOA? (REESTRUTURADA) --- */}
      <section 
        className="py-24 relative text-white bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url('${ASSETS.LISBON_BG}')` }}
      >
        {/* Overlay Azul da Marca (DarkBlue) com transparência forte para leitura */}
        <div className="absolute inset-0 bg-brand-darkBlue/90"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           
           {/* Cabeçalho da Secção */}
           <div className="mb-12">
              <span className="inline-block border border-brand-orange text-brand-orange rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
                Destino 2026
              </span>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Por que Lisboa?</h2>
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                O cenário ideal para acolher a comunidade ágil global. 
                Lisboa não é apenas uma cidade, é um ecossistema.
              </p>
           </div>

           {/* Grid de Conteúdo */}
           <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              {/* Coluna Esquerda: Cartão de Destaque (Citação) */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                 <p className="text-2xl md:text-3xl font-medium leading-normal mb-8 text-white">
                   Lisboa é considerada uma das cidades europeias mais promissoras ao nível de ecossistema tecnológico.
                 </p>
                 <a 
                   href="https://dealroom.co/tech-ecosystem-index-2025" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-brand-orange font-bold text-xs uppercase tracking-widest hover:underline hover:text-white transition-colors"
                 >
                   Fonte: Global Tech Ecosystem Index 2025, Dealroom
                   <ExternalLink className="w-4 h-4" />
                 </a>
              </div>

              {/* Coluna Direita: Grid de Características */}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12 pt-4">
                 
                 {/* Feature 1 */}
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-brand-orange">
                       <Zap className="w-6 h-6" />
                       <h3 className="font-bold text-xl text-white">Hub de Inovação</h3>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Uma das capitais tecnológicas que mais cresce na Europa.
                    </p>
                 </div>

                 {/* Feature 2 */}
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-brand-blue">
                       <Globe className="w-6 h-6" />
                       <h3 className="font-bold text-xl text-white">Acessível</h3>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Conectividade global, transportes fáceis e localização estratégica.
                    </p>
                 </div>

                 {/* Feature 3 */}
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-brand-orange">
                       <Users className="w-6 h-6" />
                       <h3 className="font-bold text-xl text-white">Multicultural</h3>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Um ponto de encontro diverso onde todas as vozes são ouvidas.
                    </p>
                 </div>

                 {/* Feature 4 */}
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-brand-blue">
                       <Sun className="w-6 h-6" />
                       <h3 className="font-bold text-xl text-white">Vibrante</h3>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Clima incrível, gastronomia rica e uma energia contagiante.
                    </p>
                 </div>

              </div>
           </div>
        </div>
      </section>
    </>
  );
};

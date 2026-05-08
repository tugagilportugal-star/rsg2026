import React from 'react';
import { Sun, Zap, Users, Globe, ExternalLink, MapPin, Train, Car } from 'lucide-react';
import { ASSETS } from '../config';

export const About: React.FC = () => {
  return (
    <>
      {/* --- PRIMEIRA SECÇÃO: O QUE É --- */}
      <section id="about" className="py-20 md:py-32 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-geometric opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center text-center lg:text-left">
            <div className="relative">
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-brand-darkBlue leading-tight">
                 O que é o <br/>
                 <span className="text-brand-orange">Regional Scrum Gathering?</span>
               </h2>
               <div className="w-24 h-2 bg-brand-orange mb-8 rounded-full mx-auto lg:mx-0"></div>
            </div>
            <div className="bg-gray-50 p-8 md:p-10 rounded-3xl shadow-lg border border-gray-200 text-left">
               <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
                 O Regional Scrum Gathering é um evento oficial da {' '}
                 <a
                   href="https://www.scrumalliance.org/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="font-bold text-brand-orange hover:underline"
                 >
                   Scrum Alliance®
                 </a>
                 , presente em dezenas de cidades pelo mundo.
               </p>
               <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                 É um espaço para aprender, partilhar práticas e inspirar quem trabalha com agilidade, inovação e tecnologia.
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

      {/* --- SEGUNDA SECÇÃO: LISBOA & LOCAL DO EVENTO --- */}
      <section className="py-24 relative bg-brand-darkBlue">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

           <div className="mb-16 text-center lg:text-left">
              <span className="inline-block border border-brand-orange text-brand-orange rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
                Destino 2026
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Onde será o RSG Lisbon 2026</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Unimos a energia de um dos maiores ecossistemas tecnológicos da Europa à máxima conveniência para os nossos participantes.
              </p>
           </div>

           <div className="grid lg:grid-cols-12 gap-10 items-stretch">

              {/* --- CARD DO LOCAL (Destaque Principal) --- */}
              <div className="lg:col-span-7 bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-lg flex flex-col justify-between relative overflow-hidden group">
                 <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-orange/20 rounded-full blur-[80px] group-hover:bg-brand-orange/30 transition-colors duration-500"></div>

                 <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-brand-orange rounded-2xl shadow-lg">
                        <MapPin className="w-8 h-8 text-white" />
                     </div>
                     <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                        Auditório Alto<br/>dos Moinhos
                     </h3>
                   </div>

                   <p className="text-blue-100 mb-10 text-lg border-b border-white/20 pb-6">
                     R. João de Freitas Branco, 1500-359 Lisboa, Portugal
                   </p>

                   <div className="space-y-8">
                     {/* Vantagem: Metro */}
                     <div className="flex items-start gap-5">
                       <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex-shrink-0 mt-1">
                         <Train className="w-6 h-6 text-brand-blue" />
                       </div>
                       <div>
                         <h4 className="font-bold text-xl text-white mb-2">Linha Azul à Porta</h4>
                         <p className="text-blue-100 leading-relaxed text-sm md:text-base">
                           Acessibilidade máxima. O auditório está localizado na própria estação de metro do Alto dos Moinhos. Pode chegar ao evento sem sequer ter de sair à rua.
                         </p>
                       </div>
                     </div>

                     {/* Vantagem: Estacionamento */}
                     <div className="flex items-start gap-5">
                       <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex-shrink-0 mt-1">
                         <Car className="w-6 h-6 text-brand-orange" />
                       </div>
                       <div>
                         <h4 className="font-bold text-xl text-white mb-2">Estacionamento Facilitado</h4>
                         <p className="text-blue-100 leading-relaxed text-sm md:text-base">
                           Para quem prefere conduzir, a zona envolvente conta com parques e múltiplas áreas de estacionamento de fácil acesso.
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="mt-12 pt-8 border-t border-white/20 relative z-10">
                   <a
                     href="https://www.google.com/maps/search/?api=1&query=Auditório+Alto+dos+Moinhos+Lisboa"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-brand-orange hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
                   >
                     Ver no Google Maps <ExternalLink className="w-4 h-4" />
                   </a>
                 </div>
              </div>

              {/* --- CARD DA CIDADE (Hub Tecnológico) --- */}
              <div className="lg:col-span-5 flex flex-col justify-center gap-8">
                <div className="bg-white/10 border border-white/20 rounded-3xl p-8 shadow-sm hover:bg-white/15 transition-colors duration-300">
                  <h4 className="font-black text-white text-2xl mb-4">Por que Lisboa?</h4>
                  <p className="text-blue-100 leading-relaxed mb-6 font-light">
                    Lisboa é considerada uma das cidades europeias mais promissoras ao nível de ecossistema tecnológico, atraindo talento e inovação global.
                  </p>
                  <a
                    href="https://dealroom.co/tech-ecosystem-index-2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-widest hover:underline hover:text-white transition-colors"
                  >
                    Global Tech Ecosystem Index <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white/10 border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
                     <Zap className="w-6 h-6 text-brand-orange mb-3" />
                     <h4 className="font-bold text-white mb-1">Hub de Inovação</h4>
                     <p className="text-xs text-blue-100">Capital tecnológica em rápido crescimento.</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
                     <Globe className="w-6 h-6 text-brand-blue mb-3" />
                     <h4 className="font-bold text-white mb-1">Conexão Global</h4>
                     <p className="text-xs text-blue-100">Infraestrutura e aeroporto estratégico.</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
                     <Users className="w-6 h-6 text-brand-orange mb-3" />
                     <h4 className="font-bold text-white mb-1">Multicultural</h4>
                     <p className="text-xs text-blue-100">Ponto de encontro diverso e inclusivo.</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 p-5 rounded-2xl hover:bg-white/20 transition-colors">
                     <Sun className="w-6 h-6 text-brand-blue mb-3" />
                     <h4 className="font-bold text-white mb-1">Vibrante</h4>
                     <p className="text-xs text-blue-100">Clima excelente e cultura acolhedora.</p>
                  </div>
                </div>
              </div>

           </div>
        </div>
      </section>
    </>
  );
};

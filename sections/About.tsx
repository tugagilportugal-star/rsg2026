import React from 'react';
import { Sun, Zap } from 'lucide-react';
import { ASSETS } from '../config';

export const About: React.FC = () => {
  return (
    <>
      <section id="about" className="py-20 md:py-32 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-geometric opacity-30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* 
             ALTERAÇÃO: items-center alinha verticalmente o Título com o Box.
             text-center lg:text-left garante que no mobile fique centralizado e no desktop alinhado à esquerda.
          */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center text-center lg:text-left">
            
            <div className="relative">
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-brand-darkBlue leading-tight">
                 O que é o <br/>
                 <span className="text-brand-blue">Regional Scrum Gathering?</span>
               </h2>
               {/* A barra laranja também centraliza no mobile (mx-auto) e esquerda no desktop (lg:mx-0) */}
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

      <section className="py-24 relative text-white bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `linear-gradient(rgba(0, 30, 60, 0.75), rgba(0, 10, 20, 0.9)), url('${ASSETS.LISBON_BG}')` }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="md:w-2/3 lg:w-1/2">
              <h2 className="text-4xl md:text-6xl font-bold mb-8">Por que Lisboa?</h2>
              <p className="text-xl md:text-2xl font-light leading-relaxed mb-8 text-gray-200">
                O cenário ideal para acolher a comunidade ágil global.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <Zap className="w-8 h-8 text-brand-orange flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-white">Inovação</h3>
                      <p className="text-sm text-gray-300">Hub tecnológico em crescimento.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <Sun className="w-8 h-8 text-brand-blue flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-white">Vibe Única</h3>
                      <p className="text-sm text-gray-300">Cultura, sol e hospitalidade.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </>
  );
};

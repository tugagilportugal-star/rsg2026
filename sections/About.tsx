import React from 'react';

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
    </>
  );
};

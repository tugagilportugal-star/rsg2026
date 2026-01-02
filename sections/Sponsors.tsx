import React from 'react';
import { Section } from '../components/UIComponents';
import { ASSETS } from '../config';

interface SponsorsProps {
    onOpenSponsorModal: () => void;
}

export const Sponsors: React.FC<SponsorsProps> = ({ onOpenSponsorModal }) => {
  return (
    <Section className="bg-white border-t border-gray-100">
      <div className="text-center">
        <span className="text-sm font-bold tracking-[0.3em] text-gray-400 uppercase mb-8 block">Patrocinador Oficial</span>
        
        <div className="flex justify-center mb-10 transform hover:scale-105 transition-transform duration-500">
            <a 
                href="https://www.scrumalliance.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-72 md:w-96 block"
                aria-label="Visit Scrum Alliance Website"
            >
                 <img 
                    src={ASSETS.SPONSOR_LOGO}
                    alt="Scrum Alliance" 
                    className="w-full h-auto drop-shadow-lg"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
                <div className="hidden text-5xl font-black text-brand-darkBlue tracking-tighter">
                    ScrumAlliance<span className="text-brand-orange text-6xl">.</span>
                </div>
            </a>
        </div>

        <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="px-4 bg-white text-lg text-gray-500 font-medium">Oportunidades</span>
            </div>
        </div>

        <div className="mt-12 p-8 md:p-12 bg-gradient-to-br from-brand-darkBlue to-brand-blue rounded-3xl shadow-2xl text-white max-w-5xl mx-auto overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-black mb-6">Quer a sua empresa aqui?</h3>
                <p className="text-xl md:text-2xl text-blue-100 mb-10 font-light max-w-3xl mx-auto">
                    Junte-se a nós e conecte a sua empresa a <span className="font-bold text-white">líderes e praticantes de agilidade</span> em Portugal.
                </p>
                <button 
                    onClick={onOpenSponsorModal}
                    className="px-10 py-4 bg-brand-orange hover:bg-white hover:text-brand-orange text-white text-lg md:text-xl font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                    Torne-se um Patrocinador do RSG Lisbon 2026
                </button>
            </div>
        </div>
      </div>
    </Section>
  );
};
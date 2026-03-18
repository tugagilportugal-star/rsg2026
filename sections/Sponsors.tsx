import React from 'react';
import { Section } from '../components/UIComponents';
import { ASSETS } from '../config';
import { Download } from 'lucide-react';

interface SponsorsProps {
    onOpenSponsorModal: () => void;
}

// Interface para os dados do patrocinador
interface Sponsor {
  name: string;
  logo: string;
  url: string;
}

export const Sponsors: React.FC<SponsorsProps> = ({ onOpenSponsorModal }) => {
  const MEDIA_KIT_URL = "https://drive.google.com/file/d/1fBqF56U6BRa2dBEzGHWfwseAW4sQCkgx/view?usp=sharing";

  // --- LISTAS DE PATROCINADORES ---
  
  const goldSponsors: Sponsor[] = [];
  const silverSponsors: Sponsor[] = [];

  const bronzeSponsors: Sponsor[] =[
    { 
      name: "Ateliê de Software", 
      logo: ASSETS.ATELIE_LOGO,
      url: "https://atelie.software/" 
    },
    {
       name: "Tabaqueira", 
       logo: ASSETS.TABAQUEIRA_LOGO,
       url: "https://www.pmi.com/markets/portugal/pt/sobre-nos-portugal/"  
    },
  ];
  // --- COMUNIDADES APOIADORAS ---
  const communitySupporters: Sponsor[] =[
    {
      name: "Geek Girls Portugal",
      logo: "https://i.postimg.cc/y8HJw0xb/Geek-Girls-Portugal.jpg",
      url: "https://geekgirlsportugal.pt/"
    },
    {
      name: "Agile Academy",
      logo: "https://i.postimg.cc/02mCfzjY/Agile-Academy.png", 
      url: "https://www.agile-academy.com/pt/" 
    }
  ];

  return (
    <Section id="sponsors" className="bg-white border-t border-gray-200">
      <div className="text-center max-w-6xl mx-auto">
        
        {/* --- OFFICIAL SPONSOR (SCRUM ALLIANCE) --- */}
        <div className="mb-20">
            <span className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-8 block">
              Official Sponsor
            </span>
            
            <div className="flex justify-center transform hover:scale-105 transition-transform duration-500">
                <a 
                    href="https://www.scrumalliance.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-64 md:w-80 block"
                    aria-label="Visit Scrum Alliance Website"
                >
                    <img 
                        src={ASSETS.SPONSOR_LOGO}
                        alt="Scrum Alliance" 
                        className="w-full h-auto drop-shadow-md"
                    />
                </a>
            </div>
        </div>

        {/* --- GOLD SPONSORS --- */}
        {goldSponsors.length > 0 && (
          <div className="mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-yellow-600 uppercase mb-8 block">
              Gold Sponsors
            </span>
            <div className="flex flex-wrap justify-center gap-12 items-center">
              {goldSponsors.map((sponsor, idx) => (
                <a 
                  key={idx} 
                  href={sponsor.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="h-20 md:h-24 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100 hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* --- SILVER SPONSORS --- */}
        {silverSponsors.length > 0 && (
          <div className="mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-8 block">
              Silver Sponsors
            </span>
            <div className="flex flex-wrap justify-center gap-10 items-center">
              {silverSponsors.map((sponsor, idx) => (
                <a 
                  key={idx} 
                  href={sponsor.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="h-16 md:h-20 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100 hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* --- BRONZE SPONSORS --- */}
        {bronzeSponsors.length > 0 && (
          <div className="mb-20">
            <span className="text-xs font-bold tracking-[0.2em] text-orange-700 uppercase mb-8 block">
              Bronze Sponsors
            </span>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {bronzeSponsors.map((sponsor, idx) => (
                <a 
                  key={idx} 
                  href={sponsor.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100"
                  title={`Visitar ${sponsor.name}`}
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="h-12 md:h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        {/* --- COMMUNITY SUPPORTERS --- */}
        {communitySupporters.length > 0 && (
          <div className="mb-20">
            <span className="text-xs font-bold tracking-[0.2em] text-brand-blue uppercase mb-8 block">
              Community Supporters
            </span>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 items-center">
              {communitySupporters.map((sponsor, idx) => (
                <a 
                  key={idx} 
                  href={sponsor.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  /* FIXAMOS o tamanho do cartão: h-24 (altura) e w-48 (largura) para todos serem iguais */
                  className="group bg-white rounded-xl hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100 flex items-center justify-center h-24 w-48 p-4"
                  title={`Visitar ${sponsor.name}`}
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    /* FIXAMOS a imagem para ocupar o espaço total uniformemente */
                    className="h-14 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* SEPARADOR */}
        <div className="mb-16 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="px-4 bg-white text-lg text-gray-500 font-medium">Oportunidades</span>
            </div>
        </div>

        {/* CARTÃO "QUER A SUA EMPRESA AQUI?" */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-brand-darkBlue to-brand-blue rounded-3xl shadow-2xl text-white max-w-5xl mx-auto overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-3xl md:text-4xl font-black mb-6">Quer a sua empresa aqui?</h3>
                
                <p className="text-xl md:text-2xl text-blue-100 mb-8 font-light max-w-3xl mx-auto">
                    Junte-se a nós e conecte a sua empresa a <span className="font-bold text-white">líderes e praticantes de agilidade</span> em Portugal.
                </p>

                <a 
                    href={MEDIA_KIT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-10 border-b border-blue-200/30 hover:border-white pb-1 group"
                >
                    <Download className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="font-medium">Consulte o nosso Media Kit e descubra as vantagens de ser parceiro</span>
                </a>

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

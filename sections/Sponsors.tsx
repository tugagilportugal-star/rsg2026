import React from 'react';
import { Section } from '../components/UIComponents';
import { ASSETS } from '../config';

interface Sponsor {
  name: string;
  logo: string;
  url: string;
  customClass?: string;
  // Nova propriedade para controlar o tamanho da imagem internamente
  logoClass?: string; 
}

export const Sponsors: React.FC = () => {
  // --- LISTAS DE PATROCINADORES ---
  const goldSponsors: Sponsor[] = [];
  const silverSponsors: Sponsor[] = [];

  const bronzeSponsors: Sponsor[] = [
    { name: "Ateliê de Software", logo: ASSETS.ATELIE_LOGO, url: "https://atelie.software/" },
    { name: "Tabaqueira", logo: ASSETS.TABAQUEIRA_LOGO, url: "https://www.pmi.com/markets/portugal/pt/sobre-nos-portugal/" },
    { name: "Sonae - MC Digital", logo: "/assets/SONAE-MC-Digital.png", url: "https://mc.sonae.pt/" },
    { name: "Noesis Portugal", logo: "/assets/Noesis.jpeg", url: "https://www.noesis.pt/" },
    { 
      name: "ISQe", 
      logo: "/assets/ISQe.png", 
      url: "https://isqe.com/",
      logoClass: "max-h-8 md:max-h-9" 
    }
  ];

  const communitySupporters: Sponsor[] = [
    { name: "Geek Girls Portugal", logo: "/assets/Geek-Girls-Portugal.jpg", url: "https://geekgirlsportugal.pt/" },
    { name: "Agile Academy", logo: "/assets/Agile-Academy.png", url: "https://www.agile-academy.com/pt/", customClass: "h-11 md:h-14" },
    { name: "Ladies that UX Lisbon", logo: "/assets/Ladies-that-UX-Lisbon.jpeg", url: "https://www.linkedin.com/company/ladies-that-ux-lisbon/" },
    { name: "GDG Lisbon", logo: "/assets/GDG.png", url: "https://www.linkedin.com/company/gdglisbon/" }
  ];

  return (
    <Section id="sponsors" className="bg-white border-t border-gray-200">
      <div className="text-center max-w-6xl mx-auto px-4">
        
        {/* --- PATROCINADOR OFICIAL --- */}
        <div className="mb-24">
            <span className="text-sm font-bold tracking-[0.3em] text-gray-400 uppercase mb-10 block">
              Patrocinador Oficial
            </span>
            <div className="flex justify-center transform hover:scale-105 transition-transform duration-500">
                <a href="https://www.scrumalliance.org/" target="_blank" rel="noopener noreferrer" className="w-64 md:w-96 block">
                    <img src={ASSETS.SPONSOR_LOGO} alt="Scrum Alliance" className="w-full h-auto drop-shadow-sm" />
                </a>
            </div>
        </div>

        {/* --- GOLD SPONSORS --- */}
        {goldSponsors.length > 0 && (
          <div className="mb-20">
            <span className="text-sm font-bold tracking-[0.2em] text-yellow-600 uppercase mb-10 block">Patrocinadores Gold</span>
            <div className="flex flex-wrap justify-center gap-12 items-center">
              {goldSponsors.map((sponsor, idx) => (
                <a key={idx} href={sponsor.url} target="_blank" rel="noopener noreferrer" className="group">
                  <img src={sponsor.logo} alt={sponsor.name} className={`h-20 md:h-24 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100 hover:scale-105 ${sponsor.customClass || ''}`} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* --- SILVER SPONSORS --- */}
        {silverSponsors.length > 0 && (
          <div className="mb-20">
            <span className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-10 block">Patrocinadores Silver</span>
            <div className="flex flex-wrap justify-center gap-10 items-center">
              {silverSponsors.map((sponsor, idx) => (
                <a key={idx} href={sponsor.url} target="_blank" rel="noopener noreferrer" className="group">
                  <img src={sponsor.logo} alt={sponsor.name} className={`h-16 md:h-20 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100 hover:scale-105 ${sponsor.customClass || ''}`} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* --- PATROCINADORES BRONZE --- */}
        <div className="mb-24">
            <span className="text-sm font-bold tracking-[0.2em] text-orange-700 uppercase mb-12 block">
                Patrocinadores Bronze
            </span>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
              {bronzeSponsors.map((sponsor, idx) => (
                <a 
                  key={idx} 
                  href={sponsor.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group bg-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-center h-28 w-[45%] md:w-64 p-6"
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className={`w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100 ${sponsor.logoClass || 'max-h-12 md:max-h-14'} ${sponsor.customClass || ''}`} 
                  />
                </a>
              ))}
            </div>
        </div>

        {/* --- COMUNIDADES APOIADORAS --- */}
        <div className="mb-24">
            <span className="text-sm font-bold tracking-[0.2em] text-brand-blue uppercase mb-12 block">
                Comunidades Apoiadoras
            </span>
            <div className="flex flex-wrap justify-center gap-4 md:gap-10 items-center">
              {communitySupporters.map((sponsor, idx) => (
                <a 
                  key={idx} 
                  href={sponsor.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group bg-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-center h-28 w-[45%] md:w-60 p-6"
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className={`max-h-14 md:max-h-16 w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100 ${
                      sponsor.customClass ? sponsor.customClass : 'transform hover:scale-105'
                    }`} 
                  />
                </a>
              ))}
            </div>
        </div>
      </div>
    </Section>
  );
};
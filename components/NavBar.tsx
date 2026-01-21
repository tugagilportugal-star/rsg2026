import React, { useState, useEffect } from 'react';
import { ASSETS } from '../config';
import { Menu, X, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'O EVENTO', href: '#about' },
    { label: 'EXPERIÊNCIA', href: '#features' },
    { label: 'SPEAKERS', href: '#speakers' },
    { label: 'RECAP 2025', href: '#recap' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-darkBlue/95 backdrop-blur-md shadow-lg py-2 border-b border-white/10'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* --- ESQUERDA: APENAS LOGO RSG (Aumentado e visível no mobile) --- */}
            <div className="flex items-center">
              <a href="#hero" className="hover:scale-105 transition-transform" title="Voltar ao início">
                 {/* Aumentado de h-14 para h-16 (mobile) e h-20 (desktop) */}
                 <img 
                   src={ASSETS.RSG_LOGO_2026} 
                   alt="RSG Lisbon 2026" 
                   className="h-16 sm:h-20 w-auto object-contain"
                 />
              </a>
            </div>

            {/* --- DIREITA (DESKTOP) --- */}
            <div className="hidden xl:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-bold text-white uppercase tracking-wider hover:text-brand-orange transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <a
                href="#get-involved"
                className="bg-brand-orange text-white text-sm font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
              >
                Garanta o teu lugar
              </a>


              <div className="h-10 w-px bg-white/20"></div>

              <a 
                  href="https://www.scrumalliance.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform group"
                  title="Scrum Alliance"
              >
                 <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 h-12 flex items-center justify-center min-w-[120px]">
                    <img src={ASSETS.SCRUM_ALLIANCE_LOGO} alt="Scrum Alliance" className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
                 </div>
              </a>
            </div>

            {/* --- MOBILE TRIGGER --- */}
            <div className="xl:hidden flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Abrir Menu"
                >
                    <Menu className="w-8 h-8" />
                </button>
            </div>

          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-[60] bg-brand-darkBlue/98 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Mobile */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
             <img src={ASSETS.RSG_LOGO_2026} alt="RSG Lisbon" className="h-12 w-auto" />
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
               aria-label="Fechar Menu"
             >
               <X className="w-8 h-8" />
             </button>
        </div>

        {/* Links (Centro) */}
        <div className="flex-grow flex flex-col items-center justify-center gap-8 p-6 overflow-y-auto">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold text-white uppercase tracking-widest hover:text-brand-orange transition-colors"
              >
                {link.label}
              </a>
            ))}

            <a
              href="#get-involved"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 bg-brand-orange text-white text-lg font-black uppercase tracking-widest px-10 py-4 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              Garanta a sua participação
            </a>
        </div>

        {/* Footer Mobile */}
        <div className="p-8 bg-black/20 flex flex-col items-center gap-4 border-t border-white/10">
             <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Organização</span>
             <div className="flex items-center gap-6">
                <a href="https://www.tugagil.com/" target="_blank" rel="noopener noreferrer">
                    <img src={ASSETS.TUGAGIL_LOGO} alt="TugÁgil" className="h-8 object-contain hover:opacity-80 transition-opacity" />
                </a>
                <div className="h-6 w-px bg-white/20"></div>
                <a 
                    href="https://www.scrumalliance.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-wider hover:text-white"
                >
                    Scrum Alliance <ExternalLink className="w-4 h-4" />
                </a>
             </div>
        </div>
      </div>
    </>
  );
};

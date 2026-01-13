import React, { useState, useEffect } from 'react';
import { ASSETS } from '../config';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'O EVENTO', href: '#about' },
    { label: 'EXPERIÊNCIA', href: '#features' },
    { label: 'SPEAKERS', href: '#speakers' },
    { label: 'RECAP 2025', href: '#recap' }, // Aponta para a secção de vídeo/números
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-darkBlue/95 backdrop-blur-md shadow-lg py-2 border-b border-white/10'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* --- ESQUERDA: LOGOS --- */}
          <div className="flex items-center gap-6">
            {/* Logo TugÁgil */}
            <a href="#hero" className="hover:opacity-80 transition-opacity">
              <img 
                src={ASSETS.TUGAGIL_LOGO} 
                alt="TugÁgil" 
                className="h-10 w-auto"
              />
            </a>

            {/* Divisor Vertical */}
            <div className="h-10 w-px bg-white/20 hidden sm:block"></div>

            {/* Logo RSG 2026 */}
            <a href="#hero" className="hidden sm:block hover:scale-105 transition-transform" title="Voltar ao início">
               <div className="bg-white rounded-lg p-1 h-14 w-14 flex items-center justify-center overflow-hidden">
                  <img 
                    src={ASSETS.RSG_LOGO_2026} 
                    alt="RSG Lisbon 2026" 
                    className="w-full h-full object-contain"
                  />
               </div>
            </a>
          </div>

          {/* --- DIREITA: MENU + WAITLIST + SA LOGO --- */}
          <div className="flex items-center gap-8">
            
            {/* Links de Texto */}
            <div className="hidden xl:flex items-center gap-6">
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

            {/* Botão WAITLIST (Aponta para o formulário) */}
            <div className="hidden md:flex items-center">
                <a
                href="#get-involved"
                className="bg-brand-orange text-white text-sm font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
                >
                Waitlist
                </a>
            </div>

            {/* Divisor Vertical */}
            <div className="h-10 w-px bg-white/20 hidden md:block"></div>

            {/* Logo Scrum Alliance (Mais pequeno e com tooltip) */}
            <a 
                href="https://www.scrumalliance.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block hover:scale-105 transition-transform group"
                title="Scrum Alliance" // Tooltip nativo do navegador
            >
               <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 h-12 flex items-center justify-center min-w-[120px]">
                  <img 
                    src={ASSETS.SCRUM_ALLIANCE_LOGO} 
                    alt="Scrum Alliance" 
                    className="h-6 w-auto object-contain brightness-0 invert opacity-90" 
                  />
               </div>
            </a>

            {/* Menu Mobile */}
            <div className="xl:hidden flex items-center">
                <button className="text-white p-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

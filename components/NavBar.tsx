import React, { useState, useEffect } from 'react';
import { ASSETS } from '../config';
import { Menu, X, ExternalLink } from 'lucide-react'; // Ícones para o menu mobile

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

  // Bloquear o scroll da página quando o menu mobile estiver aberto
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
            
            {/* --- ESQUERDA: LOGOS --- */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Logo TugÁgil */}
              <a href="#hero" className="hover:opacity-80 transition-opacity">
                <img 
                  src={ASSETS.TUGAGIL_LOGO} 
                  alt="TugÁgil" 
                  className="h-8 sm:h-10 w-auto"
                />
              </a>

              {/* Divisor Vertical */}
              <div className="h-8 sm:h-10 w-px bg-white/20 hidden sm:block"></div>

              {/* Logo RSG 2026 */}
              <a href="#hero" className="hidden sm:block hover:scale-105 transition-transform" title="Voltar ao início">
                 <img 
                   src={ASSETS.RSG_LOGO_2026} 
                   alt="RSG Lisbon 2026" 
                   className="h-12 sm:h-14 w-auto object-contain"
                 />
              </a>
            </div>

            {/* --- DIREITA: MENU DESKTOP --- */}
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

              {/* Botão WAITLIST */}
              <a
                href="#waitlist"
                className="bg-brand-orange text-white text-sm font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
              >
                Waitlist
              </a>

              <div className="h-10 w-px bg-white/20"></div>

              {/* Logo Scrum Alliance */}
              <a 
                  href="https://www.scrumalliance.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform group"
                  title="Scrum Alliance"
              >
                 <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 h-12 flex items-center justify-center min-w-[120px]">
                    <img 
                      src={ASSETS.SCRUM_ALLIANCE_LOGO} 
                      alt="Scrum Alliance" 
                      className="h-6 w-auto object-contain brightness-0 invert opacity-90" 
                    />
                 </div>
              </a>
            </div>

            {/* --- MENU MOBILE TRIGGER (HAMBURGUER) --- */}
            <div className="xl:hidden flex items-center gap-4">
                {/* Logo RSG Mobile (Se quiser mostrar no mobile ao lado do menu, descomente a linha abaixo) */}
                {/* <img src={ASSETS.RSG_LOGO_2026} alt="RSG" className="h-10 w-auto object-contain" /> */}

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

      {/* --- MOBILE MENU OVERLAY (TELA CHEIA) --- */}
      <div 
        className={`fixed inset-0 z-[60] bg-brand-darkBlue/98 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          
          {/* Cabeçalho do Menu Mobile */}
          <div className="flex justify-between items-center mb-12">
             <img src={ASSETS.RSG_LOGO_2026} alt="RSG Lisbon" className="h-12 w-auto" />
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
               aria-label="Fechar Menu"
             >
               <X className="w-8 h-8" />
             </button>
          </div>

          {/* Links de Navegação */}
          <div className="flex flex-col gap-6 items-center flex-grow justify-center">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)} // Fecha o menu ao clicar
                className="text-2xl font-black text-white uppercase tracking-widest hover:text-brand-orange transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="w-16 h-1 bg-white/10 rounded-full my-4"></div>

            <a
              href="#waitlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold text-brand-orange uppercase tracking-wider hover:text-white transition-colors"
            >
              Inscreva-se na Waitlist
            </a>
          </div>

          {/* Rodapé do Menu Mobile */}
          <div className="mt-auto flex flex-col items-center gap-6 pb-8">
             <a 
                href="https://www.scrumalliance.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-wider hover:text-white"
             >
                Scrum Alliance <ExternalLink className="w-4 h-4" />
             </a>
             <img src={ASSETS.TUGAGIL_LOGO} alt="TugÁgil" className="h-8 opacity-50" />
          </div>

        </div>
      </div>
    </>
  );
};

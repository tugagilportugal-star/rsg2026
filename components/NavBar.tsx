import React, { useState, useEffect } from 'react';
import { ASSETS } from '../config';
import { Menu, X, ArrowUp } from 'lucide-react';

export const Navbar: React.FC<{ onOpenTicketModal?: () => void }> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 500);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'O EVENTO', href: '#about' },
    { label: 'EXPERIÊNCIA', href: '#features' },
    { label: 'PROGRAMA', href: '#program' },
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
            
            {/* LOGO */}
            <div className="flex items-center">
              <a 
                href="https://www.scrumalliance.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform" 
              >
                 <img 
                   src={ASSETS.RSG_LOGO_2026} 
                   alt="RSG Lisbon 2026" 
                   className="h-12 sm:h-16 w-auto object-contain"
                 />
              </a>
            </div>

            {/* LINKS DE NAVEGAÇÃO (DESKTOP) */}
            <div className="hidden xl:flex items-center gap-10">
              <div className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-bold text-white uppercase tracking-widest hover:text-brand-orange transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* MOBILE TRIGGER */}
            <div className="xl:hidden flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <Menu className="w-8 h-8" />
                </button>
            </div>

          </div>
        </div>
      </nav>

      {/* BOTÃO VOLTAR AO TOPO */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 p-3 rounded-full bg-brand-orange text-white shadow-lg transition-all duration-500 transform hover:bg-orange-600 hover:scale-110 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* MOBILE MENU OVERLAY */}
      <div 
        className={`fixed inset-0 z-[60] bg-brand-darkBlue/98 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
             <img src={ASSETS.RSG_LOGO_2026} alt="RSG Lisbon" className="h-10 w-auto" />
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
             >
               <X className="w-8 h-8" />
             </button>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center gap-10 p-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold text-white uppercase tracking-[0.2em] hover:text-brand-orange transition-colors"
              >
                {link.label}
              </a>
            ))}
        </div>
      </div>
    </>
  );
};
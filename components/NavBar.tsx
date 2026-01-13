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
    { label: 'RECAP 2025', href: '#recap' }, // Assumindo que a secção Recap existe
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-darkBlue/95 backdrop-blur-md shadow-lg py-3 border-b border-white/10'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
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
            <div className="h-8 w-px bg-white/30 hidden sm:block"></div>

            {/* Logo RSG (Badge Quadrado) */}
            {/* Nota: Estou usando o SPONSOR_LOGO como placeholder. 
                Se tiveres o logo quadrado branco específico do RSG, substitui a URL aqui. */}
            <a href="#hero" className="hover:opacity-80 transition-opacity hidden sm:block">
               <div className="bg-white rounded-lg p-1 h-12 w-12 flex items-center justify-center">
                  {/* Simulação visual do logo quadrado branco da imagem */}
                  <img 
                    src={ASSETS.SPONSOR_LOGO} 
                    alt="RSG Lisbon" 
                    className="h-auto w-full object-contain"
                  />
               </div>
            </a>
          </div>

          {/* --- CENTRO: LINKS DE NAVEGAÇÃO --- */}
          <div className="hidden lg:flex items-center gap-8">
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

          {/* --- DIREITA: AÇÕES --- */}
          <div className="hidden md:flex items-center gap-6">
            {/* Link Scrum Alliance (Mantido antes do botão conforme pedido) */}
            <a
              href="https://www.scrumalliance.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-white uppercase tracking-wider hover:text-brand-orange transition-colors"
            >
              Scrum Alliance
            </a>

            {/* Botão WAITLIST */}
            <a
              href="#get-involved"
              className="bg-brand-orange text-white text-sm font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
            >
              Waitlist
            </a>
          </div>

          {/* MENU MOBILE (Hambúrguer simples para mobile) */}
          <div className="md:hidden flex items-center">
             <button className="text-white p-2">
               {/* Ícone de menu simples */}
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

import React, { useState, useEffect } from 'react';

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
    { label: 'Sobre', href: '#about' },
    { label: 'Características', href: '#features' },
    { label: 'Patrocinadores', href: '#sponsors' },
    { label: 'Registo', href: '#get-involved' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Scrum Alliance', href: 'https://www.scrumalliance.org/', external: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-darkBlue/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3'
          : 'bg-transparent py-6 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO / TÍTULO */}
          <div className="flex items-center">
            <a
              href="#hero"
              className="text-xl font-black tracking-tight text-white hover:opacity-80 transition-opacity"
              aria-label="Ir para o topo"
            >
              RSG Lisbon 2026
            </a>
          </div>

          {/* LINKS DESKTOP */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={`
                  text-sm font-bold px-4 py-2 rounded-full transition-all duration-300
                  flex items-center gap-2
                  ${
                    isScrolled
                      ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }
                  ${link.external ? 'border border-white/20 hover:border-white/40' : 'border border-transparent'}
                `}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* MENU MOBILE (Hambúrguer simples caso precise no futuro, por enquanto oculto em mobile) */}
          <div className="md:hidden">
             {/* Se quiser adicionar menu mobile depois, é aqui */}
          </div>
        </div>
      </div>
    </nav>
  );
};

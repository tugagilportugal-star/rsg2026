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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-darkBlue/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3'
          : 'bg-transparent py-5 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a
              href="#hero"
              className="text-xl font-black tracking-tight text-white hover:opacity-90 transition-opacity"
              aria-label="Ir para o topo"
            >
              RSG Lisbon 2026
            </a>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            {[
              { label: 'Sobre', href: '#about' },
              { label: 'Características', href: '#features' },
              { label: 'Patrocinadores', href: '#sponsors' },
              { label: 'Registo', href: '#get-involved' },
              { label: 'FAQ', href: '#faq' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <a
              href="https://www.scrumalliance.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-bold transition px-5 py-2.5 rounded-full border ${
                 isScrolled 
                 ? 'bg-brand-blue border-brand-blue text-white hover:bg-white hover:text-brand-blue' 
                 : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-brand-darkBlue'
              }`}
            >
              Scrum Alliance
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

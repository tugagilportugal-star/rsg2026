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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2 shadow-sm'
          : 'bg-transparent py-4 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Logo muda de cor ou opacidade dependendo do fundo */}
            <a
              href="#hero"
              className={`text-xl font-black tracking-tight transition-colors ${
                isScrolled ? 'text-brand-darkBlue' : 'text-white'
              }`}
              aria-label="Ir para o topo"
            >
              RSG Lisbon 2026
            </a>
          </div>

          <div className="hidden md:flex space-x-8">
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
                className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                  isScrolled ? 'text-gray-700' : 'text-gray-200'
                }`}
              >
                {link.label}
              </a>
            ))}
            
            <a
              href="https://www.scrumalliance.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-bold transition px-4 py-2 rounded-full ${
                 isScrolled 
                 ? 'bg-brand-blue text-white hover:bg-brand-darkBlue' 
                 : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
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

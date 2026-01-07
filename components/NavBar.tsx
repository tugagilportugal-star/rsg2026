import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a
              href="#hero"
              className="text-xl font-bold text-brand-blue hover:opacity-90 transition-opacity"
              aria-label="Ir para o topo"
            >
              RSG Lisbon 2026
            </a>
          </div>

          <div className="hidden md:flex space-x-8">
            <a href="#about" className="text-gray-700 hover:text-brand-blue transition-colors">
              Sobre
            </a>
            <a href="#features" className="text-gray-700 hover:text-brand-blue transition-colors">
              Características
            </a>
            <a href="#sponsors" className="text-gray-700 hover:text-brand-blue transition-colors">
              Patrocinadores
            </a>
            <a href="#get-involved" className="text-gray-700 hover:text-brand-blue transition-colors">
              Registo
            </a>
            <a href="#faq" className="text-gray-700 hover:text-brand-blue transition-colors">
              FAQ
            </a>
            <a
              href="https://www.scrumalliance.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-orange transition"
            >
              Scrum Alliance
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

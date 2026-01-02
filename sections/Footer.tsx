import React from 'react';
import { Linkedin, Instagram, Mail, Globe } from 'lucide-react';
import { ASSETS } from '../config';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-darkBlue text-white py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Organization */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-brand-orange mb-6 uppercase tracking-wider">Organização</h4>
            
            <div className="flex flex-col items-start">
                <a 
                    href="https://tugagil.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mb-2"
                    aria-label="Visitar site da TugÁgil"
                >
                    <img 
                        src={ASSETS.TUGAGIL_LOGO} 
                        alt="TugÁgil" 
                        className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
                    />
                </a>
                <span className="text-sm text-white font-light opacity-90">Comunidade de Práticas</span>

                {/* TugÁgil Social Media & Web */}
                <div className="flex space-x-3 mt-4">
                    <a 
                        href="https://www.linkedin.com/company/tugagil/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 bg-white/10 rounded-full hover:bg-[#0077b5] transition-colors"
                        aria-label="LinkedIn TugÁgil"
                    >
                        <Linkedin className="w-5 h-5" />
                    </a>
                    <a 
                        href="https://www.instagram.com/tugagil/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 bg-white/10 rounded-full hover:bg-gradient-to-tr hover:from-[#f09433] hover:to-[#bc1888] transition-colors"
                        aria-label="Instagram TugÁgil"
                    >
                        <Instagram className="w-5 h-5" />
                    </a>
                    <a 
                        href="https://tugagil.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 bg-white/10 rounded-full hover:bg-brand-orange transition-colors"
                        aria-label="Website TugÁgil"
                    >
                        <Globe className="w-5 h-5" />
                    </a>
                </div>
            </div>
          </div>

          {/* Sitemap */}
          <div className="md:col-span-1">
             <h4 className="text-lg font-bold text-brand-orange mb-6 uppercase tracking-wider">Explorar</h4>
             <ul className="space-y-3 text-gray-300">
                <li><button onClick={() => scrollTo('hero')} className="hover:text-white hover:translate-x-1 transition-all">Início</button></li>
                <li><button onClick={() => scrollTo('about')} className="hover:text-white hover:translate-x-1 transition-all">Sobre o Evento</button></li>
                <li><button onClick={() => scrollTo('get-involved')} className="hover:text-white hover:translate-x-1 transition-all">Patrocine</button></li>
                <li><button onClick={() => scrollTo('get-involved')} className="hover:text-white hover:translate-x-1 transition-all">Inscreva-se</button></li>
             </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-brand-orange mb-6 uppercase tracking-wider">Contacto</h4>
            <a href="mailto:tuga@tugagil.com" className="flex items-center text-gray-300 hover:text-white transition-colors group mb-4">
                <Mail className="w-5 h-5 mr-3 group-hover:text-brand-blue" />
                tuga@tugagil.com
            </a>
            <div className="flex space-x-4 mt-6">
                <a 
                    href="https://www.linkedin.com/showcase/scrum-gathering-regional-lisboa-2026/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-white/10 rounded-full hover:bg-[#0077b5] transition-colors"
                    aria-label="LinkedIn RSG Lisbon"
                >
                    <Linkedin className="w-5 h-5" />
                </a>
                <a 
                    href="https://www.instagram.com/rsglisbon/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-white/10 rounded-full hover:bg-gradient-to-tr hover:from-[#f09433] hover:to-[#bc1888] transition-colors"
                    aria-label="Instagram RSG Lisbon"
                >
                    <Instagram className="w-5 h-5" />
                </a>
             </div>
          </div>

          {/* Legal */}
          <div className="md:col-span-1 text-sm text-gray-400">
             <h4 className="text-lg font-bold text-brand-orange mb-6 uppercase tracking-wider">Legal</h4>
             <div className="space-y-3">
                <p>Copyright © 2025 TugÁgil</p>
                <p>
                    <a href="https://docs.google.com/document/d/1RQVsJYgjLgXwsFr1g-lpjxfkUTuPk0EaHCpoo9k-boo/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-gray-600 underline-offset-4">Política de Privacidade</a>
                </p>
                <p className="text-xs text-gray-600 mt-4">
                    Regional Scrum Gathering® is a registered trademark of Scrum Alliance, Inc.
                </p>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
import React, { useState } from 'react';
import { agenda2026 } from '../data/agendaData';
import { ChevronDown, ChevronUp, Clock, Globe } from 'lucide-react';

export const AgendaPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="pt-32 bg-brand-darkBlue min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
            Agenda <span className="text-brand-orange">2026</span>
          </h1>
          <p className="text-gray-400 text-lg">Um dia de imersão no futuro da agilidade.</p>
        </header>

        <div className="space-y-4">
          {agenda2026.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${openItem === item.id ? 'ring-1 ring-brand-orange bg-white/[0.08]' : ''}`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full text-left p-6 flex items-start justify-between gap-4 group"
              >
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="flex items-center gap-1.5 text-brand-orange font-bold text-sm">
                      <Clock className="w-4 h-4" /> 
                      {/* REMOVIDO O ITEM.END DAQUI */}
                      {item.start}
                    </span>
                    {item.language && (
                      <span className="text-[10px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {item.language}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors">
                    {item.title}
                  </h3>
                  {item.speaker && <p className="text-gray-400 font-medium mt-1">{item.speaker}</p>}
                </div>
                <div className="mt-2">
                  {openItem === item.id ? <ChevronUp className="text-brand-orange" /> : <ChevronDown className="text-white/20" />}
                </div>
              </button>

              {/* Só mostra o conteúdo extra se houver descrição ou bio */}
              {openItem === item.id && (item.description || item.speakerBio) && (
                <div className="px-6 pb-6 animate-fadeIn border-t border-white/5 pt-6">
                  {item.description && (
                    <div className="mb-6">
                      <h4 className="text-brand-orange text-xs font-black uppercase tracking-widest mb-2">Sobre a Talk</h4>
                      <p className="text-gray-200 leading-relaxed">{item.description}</p>
                    </div>
                  )}
                  {item.speakerBio && (
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Bio do Speaker</h4>
                      <p className="text-gray-400 text-sm italic leading-relaxed">{item.speakerBio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
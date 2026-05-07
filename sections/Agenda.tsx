import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Star, X, Volume2 } from 'lucide-react';

// 1. Definição estrita dos idiomas aceitos
type LanguageType = "en" | "pt";

const LanguageBadge: React.FC<{ language?: LanguageType }> = ({ language }) => {
  if (!language) return null;
  
  const isEn = language === 'en';
  
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 bg-white/10 text-white rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
        <Volume2 size={10} className={isEn ? "text-blue-400" : "text-brand-orange"} />
        <span>{isEn ? '🇬🇧 English' : '🇵🇹 Português'}</span>
      </span>
    </div>
  );
};

interface SpeakerBio {
  name: string;
  bio: string;
}

interface AgendaSlot {
  time: string;
  endTime?: string;
  title: string;
  speaker?: string | string[];
  speakerImage?: string | string[];
  description?: string;
  type: 'talk' | 'event' | 'break';
  isKeynote?: boolean;
  keynoteType?: 'Opening' | 'Closing';
  language?: LanguageType;
  bios?: SpeakerBio[];
}

export const AgendaPage: React.FC = () => {
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    
    if (nav) nav.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    return () => { 
      if (nav) nav.style.display = 'flex'; 
      if (footer) footer.style.display = 'block';
    };
  }, []);

  const agenda: AgendaSlot[] = [
    { time: "08:30", title: "Check-in & Receção", type: 'event' },
    { 
      time: "09:15", endTime: "09:30", title: "Boas Vindas: Abertura TugÁgil", type: 'talk', 
      speakerImage: "/assets/TugÁgil.png", 
      description: "O arranque oficial do RSG Lisbon 2026! A equipa do TugÁgil dá as boas-vindas à comunidade." 
    },
    { 
      time: "09:30", endTime: "10:00", title: "QA na era da IA: o que mudou, e o que continua a falhar?", 
      speaker: "Joana Silva", speakerImage: "/assets/Joana-Silva.png", type: 'talk', language: 'pt',
      description: "O que mudou (de verdade), o que funciona e o que é mito? Uma análise prática com casos reais sobre IA no suporte à estratégia de testes.",
      bios: [{ name: "Joana Silva", bio: "Engineering Leader with 8+ years of experience..." }]
    },
    { 
      time: "10:05", endTime: "10:50", title: "Agilists and our world work: what if we were made for this time?", 
      speaker: "Lyssa Adkins", speakerImage: "/assets/Lyssa-Adkins.png", type: 'talk', 
      isKeynote: true, keynoteType: 'Opening', language: 'en',
      description: "We are in the age of acceleration, facing exponential changes...",
      bios: [{ name: "Lyssa Adkins", bio: "Lyssa Adkins is an author, systems coach..." }]
    },
    { time: "10:55", endTime: "11:20", title: "☕ Coffee Break & Networking", type: 'event' },
    { 
      time: "11:25", endTime: "11:55", title: "People & Future: Redesenhar o trabalho em equipa", 
      speaker: "Patrícia Alves", speakerImage: "/assets/Patricia-Sousa.png", type: 'talk', language: 'pt',
      description: "E se o futuro do trabalho depender de coragem para mudar como pensamos equipas?",
      bios: [{ name: "Patrícia Alves", bio: "Patrícia lidera transformações em People..." }]
    },   
    { 
      time: "12:00", endTime: "12:50", title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
      speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
      speakerImage: ["/assets/Matheus.png", "/assets/Coca-Pitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
      type: 'talk', language: 'pt',
      description: "Um debate sem filtros sobre as tensões entre automação acelerada e agilidade humana.",
      bios: [{ name: "Painelistas", bio: "Matheus Haddad, Coca Pitzer, Anabela Ferreira e Ricardo Fernandes." }]
    },
    { time: "13:00", endTime: "14:20", title: "🍴 Almoço", type: 'event' }, 
    { time: "14:20", endTime: "14:30", title: "☕ Coffee & Networking", type: 'event' },
    {
      time: "14:35", endTime: "15:05", title: "Satisficing: How to Succeed at Scale", 
      speaker: "David Anderson", speakerImage: "/assets/David-Anderson.png", type: 'talk', language: 'en',
      description: "Optimizing large organizations requires network science and satisficing...",
      bios: [{ name: "David Anderson", bio: "Originator of the Kanban Method..." }]
    },
    { 
      time: "15:10", endTime: "15:40", title: "Let IT Flow: Flight Levels Dependency Management", 
      speaker: "Ricardo Caldas", speakerImage: "/assets/Ricardo-Caldas.png", type: 'talk', language: 'pt',
      description: "Ricardo partilhará aprendizagens reais sobre como tratar dependências como um problema de sistema.",
      bios: [{ name: "Ricardo Caldas", bio: "Ricardo atua na interseção entre produto e agilidade..." }]
    },
    { 
      time: "15:45", endTime: "16:25", title: "Direction, Flow, and Commitment", 
      speaker: ["Paulo Caroli", "Manuel Pais"],
      speakerImage: ["/assets/Paulo-Caroli.png", "/assets/Manuel-Pais.png"],
      type: 'talk', language: 'pt',
      description: "Manuel Pais and Paulo Caroli explore how Strategic OKRs and Team Topologies connect direction and flow.",
      bios: [{ name: "Caroli & Pais", bio: "Autores da Lean Inception e Team Topologies." }]
    },
    { time: "16:25", endTime: "16:50", title: "☕ Coffee Break & Networking", type: 'event' },
    { 
      time: "16:55", endTime: "17:25", title: "Transformar para Entregar: a evolução ágil nos CTT", 
      speaker: ["César Ribeiro", "Carlos Paz"],
      speakerImage: ["/assets/Cesar-Ribeiro.png", "/assets/Carlos-Paz.png"],
      type: 'talk', language: 'pt',
      description: "Transformar os CTT foi além de seguir frameworks; foi navegar tensões reais.",
      bios: [{ name: "César & Carlos", bio: "Líderes de transformação nos CTT." }]
    },
    { 
      time: "17:30", endTime: "18:00", title: "Real World Product Management", 
      speaker: "Sara Cruz", speakerImage: "/assets/Sara-Cruz.png", type: 'talk', language: 'pt',
      description: "O gap entre a cultura de produto perfeita e a realidade.",
      bios: [{ name: "Sara Cruz", bio: "Especialista com passagens pela OutSystems e Farfetch." }]
    },
    { 
      time: "18:05", endTime: "18:45", title: "Agilidade sem humanos? O futuro da liderança", 
      speaker: "Nadia Miranda", speakerImage: "/assets/Nadia-Miranda.png", type: 'talk', 
      isKeynote: true, keynoteType: 'Closing', language: 'pt',
      description: "Como manter a agilidade viva através da essência humana.",
      bios: [{ name: "Nadia Miranda", bio: "IT Director e mentora no Portuguese Women in Tech." }]
    },
    { time: "18:45", endTime: "18:50", title: "Encerramento", type: 'event' },
  ];

  const filteredAgenda = agenda.filter(slot => {
    if (filter === 'morning') return slot.time < "13:00";
    if (filter === 'afternoon') return slot.time >= "13:00";
    return true;
  });

  return (
    <div className="relative min-h-screen bg-white pb-20 z-[100]">
      <Link 
        to="/" 
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 bg-brand-darkBlue text-white px-6 py-3 rounded-full shadow-2xl hover:bg-brand-orange transition-all duration-300"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-bold text-sm">Voltar para Home</span>
      </Link>

      <header className="pt-24 pb-10 px-4 text-center">
        <h1 className="text-5xl font-black text-brand-darkBlue mb-2 tracking-tighter">AGENDA <span className="text-brand-orange">2026</span></h1>
        <p className="text-gray-500 font-medium text-sm max-w-md mx-auto mb-8">
          Agilidade, Inovação e IA: o impacto real no dia a dia.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          {['morning', 'afternoon', 'all'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)} 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === f ? 'bg-brand-darkBlue text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f.toUpperCase() === 'ALL' ? 'VER TUDO' : f === 'morning' ? 'MANHÃ' : 'TARDE'}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-3">
        {filteredAgenda.map((slot, index) => {
          const isExpandable = !!(slot.description || slot.bios);
          
          return (
            <div 
              key={index}
              onClick={() => isExpandable && setOpenSlot(openSlot === index ? null : index)}
              className={`flex flex-col p-5 rounded-2xl border transition-all ${
                slot.type === 'talk' 
                  ? 'bg-brand-darkBlue border-transparent text-white shadow-md cursor-pointer' 
                  : 'bg-gray-50 border-gray-100 text-brand-darkBlue'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col min-w-[70px]">
                  <span className="font-bold text-base tabular-nums">{slot.time}</span>
                  {slot.endTime && (
                    <span className="text-[10px] font-medium opacity-50 tabular-nums">{slot.endTime}</span>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        {slot.isKeynote && (
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-brand-orange">
                            <Star className="w-2.5 h-2.5 fill-brand-orange" /> {slot.keynoteType} Keynote
                          </span>
                        )}
                        <LanguageBadge language={slot.language} />
                      </div>
                      <h3 className="text-base font-bold leading-tight">
                        {slot.title}
                      </h3>
                      {slot.speaker && (
                        <p className={`text-xs mt-1 font-bold uppercase tracking-wider ${slot.type === 'talk' ? 'text-brand-orange' : 'text-gray-500'}`}>
                          {Array.isArray(slot.speaker) ? slot.speaker.join(' & ') : slot.speaker}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 mt-2 sm:mt-0">
                      {slot.speakerImage && (
                        <div className="flex -space-x-2 items-center">
                          {Array.isArray(slot.speakerImage) ? (
                            slot.speakerImage.map((img, i) => (
                              <img key={i} src={img} alt="Speaker" className="w-10 h-10 rounded-full border-2 border-brand-orange object-cover bg-brand-darkBlue shadow-sm" />
                            ))
                          ) : (
                            <img src={slot.speakerImage} alt="Logo" className={`w-10 h-10 rounded-full border-2 border-brand-orange object-cover ${slot.title.includes('TugÁgil') ? 'bg-white p-1' : 'bg-brand-darkBlue'}`} />
                          )}
                        </div>
                      )}
                      {isExpandable && (
                        <div className={slot.type === 'talk' ? 'text-white/50' : 'text-gray-400'}>
                          {openSlot === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {openSlot === index && isExpandable && (
                <div className="mt-5 pt-5 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                  {slot.description && (
                    <div className="mb-5">
                      <h4 className="text-[9px] uppercase tracking-widest text-brand-orange font-bold mb-2">Sobre a Sessão</h4>
                      <p className="text-sm leading-relaxed opacity-80" dangerouslySetInnerHTML={{ __html: slot.description }} />
                    </div>
                  )}
                  {slot.bios && (
                    <div className="space-y-3">
                      {slot.bios.map((person, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="font-bold text-xs text-brand-orange mb-1">{person.name}</p>
                          <p className="text-[11px] opacity-70 leading-relaxed" dangerouslySetInnerHTML={{ __html: person.bio }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
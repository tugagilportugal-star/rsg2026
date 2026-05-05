import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Star, X } from 'lucide-react';

const FlagIcon = ({ lang }: { lang: string }) => {
  const flagCode = lang === '🇵🇹' ? 'pt' : 'gb';
  return (
    <img 
      src={`https://flagcdn.com/w40/${flagCode}.png`} 
      alt={lang}
      className="w-5 h-5 rounded-full object-cover inline-block ml-2 border border-white/20 shadow-sm"
    />
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
  language?: string;
  bios?: SpeakerBio[];
}

export const AgendaPage: React.FC = () => {
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';
    return () => { if (nav) nav.style.display = 'flex'; };
  }, []);

  const agenda: AgendaSlot[] = [
    { time: "08:30", title: "Welcome: Check-in & Receção", type: 'event' },
    { 
      time: "09:10", endTime: "09:25", title: "Boas Vindas: Abertura TugÁgil", type: 'talk', 
      speakerImage: "/assets/TugÁgil.png", 
      description: "O arranque oficial da jornada RSG Lisbon 2026." 
    },
    { 
      time: "09:30", endTime: "10:00", title: "QA na era da IA: o que mudou, e o que continua a falhar?", 
      speaker: "Joana Silva", speakerImage: "/assets/Joana-Silva.png", type: 'talk', language: '🇵🇹',
      description: "Uma análise crítica sobre como a Inteligência Artificial está a transformar os processos de qualidade.",
      bios: [{ name: "Joana Silva", bio: "Director of Quality Assurance com vasta experiência em automação." }]
    },
    { 
      time: "10:05", endTime: "10:50", title: "Agilists and our world work: what if we were made for this time?", 
      speaker: "Lyssa Adkins", speakerImage: "/assets/Lyssa-Adkins.png", type: 'talk', 
      isKeynote: true, keynoteType: 'Opening', language: '🇬🇧',
      description: "Lyssa explora como as competências nativas dos agilistas são o que o mundo mais necessita.",
      bios: [{ name: "Lyssa Adkins", bio: "Internationally recognized thought leader in Agile Coaching." }]
    },
    { time: "10:55", endTime: "11:15", title: "☕ Coffee Break & Networking", type: 'event' },
    { 
      time: "11:20", endTime: "11:50", title: "People & Future: Redesenhar o trabalho em equipa fora do mundo tech", 
      speaker: "Patrícia Alves", speakerImage: "/assets/Patricia-Sousa.png", type: 'talk', language: '🇵🇹',
      description: "E se o futuro do trabalho depender de mais coragem para mudar como pensamos equipas?",
      bios: [{ name: "Patrícia Alves", bio: "Líder de transformações em People ligando talento e cultura." }]
    },   
    { 
      time: "11:55", endTime: "12:45", title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
      speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
      speakerImage: ["/assets/Matheus.png", "/assets/Coca-Pitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
      type: 'talk', language: '🇵🇹',
      description: "Um debate sem filtros sobre as tensões entre automação e agilidade humana.",
      bios: [
        { name: "Matheus Haddad - Moderador", bio: "Fundador da Estratégia Ágil." },
        { name: "Coca Pitzer", bio: "Enterprise Agile Consultant." },
        { name: "Anabela Ferreira", bio: "Agile Coach experiente." },
        { name: "Ricardo Fernandes", bio: "Especialista em agilidade organizacional." }
      ]
    },
    { time: "13:00", endTime: "14:15", title: "🍴 Almoço", type: 'event' },
    { 
      time: "14:20", endTime: "14:50", title: "Satisficing: How to Succeed at Scale", 
      speaker: "David Anderson", speakerImage: "/assets/David-Anderson.png", type: 'talk', language: '🇬🇧',
      description: "Application of network science and the concept of satisficing.",
      bios: [{ name: "David Anderson", bio: "Originator of the Kanban Method." }]
    },
    { 
      time: "14:55", endTime: "15:25", title: "Let IT Flow: Delivering More Features using Flight Levels Dependency Management", 
      speaker: "Ricardo Caldas", speakerImage: "/assets/Ricardo-Caldas.png", type: 'talk', language: '🇵🇹',
      description: "Tratar dependências como um problema de sistema.",
      bios: [{ name: "Ricardo Caldas", bio: "Focado em outcomes e fluxo de valor." }]
    },
    { 
      time: "15:30", endTime: "16:10", title: "Direction, Flow, and Commitment: Strategy, Team Design, and Team Ownership", 
      speaker: ["Paulo Caroli", "Manuel Pais"],
      speakerImage: ["/assets/Paulo-Caroli.png", "/assets/Manuel-Pais.png"],
      type: 'talk', language: '🇵🇹',
      description: "Strategic OKRs, Team Topologies, e Team OKRs como um único sistema.",
      bios: [
        { name: "Paulo Caroli", bio: "Criador da Lean Inception & Team OKRs." },
        { name: "Manuel Pais", bio: "Co-author of 'Team Topologies'." }
      ]
    },
    { time: "16:10", endTime: "16:30", title: "☕ Coffee Break & Networking", type: 'event' },
    { 
      time: "16:35", endTime: "17:05", title: "Transformar para Entregar: a evolução ágil nos CTT", 
      speaker: ["César Ribeiro", "Carlos Paz"],
      speakerImage: ["/assets/Cesar-Ribeiro.png", "/assets/Carlos-Paz.png"],
      type: 'talk', language: '🇵🇹',
      description: "A jornada de transformação dos CTT.",
      bios: [
        { name: "César Ribeiro", bio: "Head of IT Governance nos CTT." },
        { name: "Carlos Paz", bio: "Especialista em gestão de tecnologia." }
      ]
    },
    { 
      time: "17:10", endTime: "17:40", title: "Real World Product Management", 
      speaker: "Sara Cruz", speakerImage: "/assets/Sara-Cruz.png", type: 'talk', language: '🇵🇹',
      description: "O gap entre a cultura de produto perfeita e o dia a dia.",
      bios: [{ name: "Sara Cruz", bio: "Especialista em equipas de produto de alta performance." }]
    },
    { 
      time: "17:45", endTime: "18:25", title: "Agilidade sem humanos? O futuro da liderança na era da IA", 
      speaker: "Nadia Miranda", speakerImage: "/assets/Nadia-Miranda.png", type: 'talk', 
      isKeynote: true, keynoteType: 'Closing', language: '🇵🇹',
      description: "O papel do líder quando a tecnologia assume o processamento.",
      bios: [{ name: "Nadia Miranda", bio: "Líder em Transformação Digital e IT Director." }]
    },
    { time: "18:25", endTime: "18:30", title: "Encerramento", type: 'event' },
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
          Agilidade, Inovação e IA: o impacto real no dia a dia das organizações.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setFilter('morning')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'morning' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500'}`}>MANHÃ</button>
          <button onClick={() => setFilter('afternoon')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'afternoon' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500'}`}>TARDE</button>
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'all' ? 'bg-brand-darkBlue text-white' : 'bg-gray-100 text-gray-500'}`}>VER TUDO</button>
          {openSlot !== null && (
            <button onClick={() => setOpenSlot(null)} className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-100 transition-all">
              <X size={14} /> FECHAR TUDO
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-3">
        {filteredAgenda.map((slot, index) => {
          const isExpandable = slot.description || slot.bios;
          
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
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-grow overflow-hidden">
                      {slot.isKeynote && (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-brand-orange mb-1">
                          <Star className="w-2.5 h-2.5 fill-brand-orange" /> {slot.keynoteType} Keynote
                        </span>
                      )}
                      <h3 className="text-base font-bold leading-tight truncate-2-lines flex items-center">
                        {slot.title} {slot.language && <FlagIcon lang={slot.language} />}
                      </h3>
                      {slot.speaker && (
                        <p className={`text-xs mt-1 font-bold uppercase tracking-wider ${slot.type === 'talk' ? 'text-brand-orange' : 'text-gray-500'}`}>
                          {Array.isArray(slot.speaker) ? slot.speaker.join(' & ') : slot.speaker}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {slot.speakerImage && (
                        <div className="flex -space-x-2 items-center mr-1">
                          {Array.isArray(slot.speakerImage) ? (
                            slot.speakerImage.map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt="Speaker" 
                                className="w-10 h-10 rounded-full border-2 border-brand-orange object-cover bg-brand-darkBlue shadow-sm" 
                              />
                            ))
                          ) : (
                            <img 
                              src={slot.speakerImage} 
                              alt="Logo" 
                              className={`w-10 h-10 rounded-full border-2 border-brand-orange object-cover ${slot.title.includes('TugÁgil') ? 'bg-white p-1' : 'bg-brand-darkBlue shadow-sm'}`} 
                            />
                          )}
                        </div>
                      )}
                      
                      {isExpandable && (
                        <div className={slot.type === 'talk' ? 'text-white/50' : 'text-gray-300'}>
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
                      <p className="text-sm leading-relaxed opacity-80">{slot.description}</p>
                    </div>
                  )}
                  {slot.bios && (
                    <div className="space-y-3">
                      {slot.bios.map((person, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="font-bold text-xs text-brand-orange mb-1">{person.name}</p>
                          <p className="text-[11px] opacity-70 leading-relaxed">{person.bio}</p>
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
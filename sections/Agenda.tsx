import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Star } from 'lucide-react';

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
  keynoteType?: 'opening' | 'closing';
  language?: '🇵🇹' | '🇬🇧';
  bios?: SpeakerBio[];
}

export const AgendaPage: React.FC = () => {
  const [openSlot, setOpenSlot] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';
    return () => { if (nav) nav.style.display = 'flex'; };
  }, []);

  const agenda: AgendaSlot[] = [
    { 
      time: "08:30", 
      title: "Welcome: Check-In & Receção", 
      type: 'event'
    },
    { 
      time: "09:10", 
      endTime: "09:25",
      title: "Boas vindas: Abertura TugÁgil", 
      type: 'talk',
      speakerImage: "/assets/TugÁgil.png",
      description: "O arranque oficial da jornada RSG Lisbon 2026 pela equipa TugÁgil."
    },
    { 
      time: "09:30",
      endTime: "10:00", 
      title: "QA na era da IA: o que mudou e o que continua a falhar.", 
      speaker: "Joana Silva", 
      speakerImage: "/assets/Joana-Silva.png",
      type: 'talk',
      language: '🇵🇹',
      description: "Uma análise crítica sobre como a Inteligência Artificial está a transformar os processos de qualidade.",
      bios: [{ name: "Joana Silva", bio: "Director of Quality Assurance com vasta experiência em automação e liderança de equipas." }]
    },
    { 
      time: "10:05", 
      endTime: "10:50",
      title: "Agilists and Our World Work: What if we were made for this time?", 
      speaker: "Lyssa Adkins", 
      speakerImage: "/assets/Lyssa-Adkins.png",
      type: 'talk',
      isKeynote: true,
      keynoteType: 'opening',
      language: '🇬🇧',
      description: "Lyssa explora como as competências nativas dos agilistas são as que o mundo atual mais necessita.",
      bios: [{ name: "Lyssa Adkins", bio: "Internationally recognized thought leader in Agile Coaching. Author of 'Coaching Agile Teams'." }]
    },
    { 
      time: "10:55", 
      endTime: "11:15",
      title: "Coffee Break & Networking", 
      type: 'event',
    },
    { 
      time: "11:20", 
      endTime: "11:50",
      title: "People & Future: Redesenhar o trabalho em equipa fora do mundo \"tech\"", 
      speaker: "Patrícia Alves", 
      speakerImage: "/assets/Patricia-Sousa.png",
      type: 'talk',
      language: '🇵🇹',
      description: "Como redesenhar equipas fora do contexto tecnológico tradicional.",
      bios: [{ name: "Patrícia Alves", bio: "Líder de transformações em People que ligam talento e cultura." }]
    },   
    { 
      time: "11:55",
      endTime: "12:45", 
      title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
      speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
      speakerImage: ["/assets/Matheus.png", "/assets/Coca-Pitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
      type: 'talk',
      language: '🇵🇹',
      description: "Um debate sem filtros sobre as tensões entre automação e agilidade humana. Será a IA uma ferramenta de libertação ou um novo silo?",
      bios: [
        { name: "Matheus Haddad - Moderador", bio: "Fundador da Estratégia Ágil." },
        { name: "Coca Pitzer", bio: "Enterprise Agile Consultant." },
        { name: "Anabela Ferreira", bio: "Agile Coach experiente." },
        { name: "Ricardo Fernandes", bio: "Especialista em agilidade organizacional." }
      ]
    },
    { 
      time: "13:00", 
      endTime: "14:15",
      title: "Almoço", 
      type: 'event',
    },
    { 
      time: "14:20", 
      endTime: "14:50",
      title: "Satisficing: How to Succeed at Scale", 
      speaker: "David Anderson", 
      speakerImage: "/assets/David-Anderson.png",
      type: 'talk',
      language: '🇬🇧',
      description: "Aplicação da ciência de redes e do conceito de satisficing em larga escala.",
      bios: [{ name: "David Anderson", bio: "Originator of the Kanban Method." }]
    },
    { 
      time: "14:55", 
      endTime: "15:25",
      title: "Let IT Flow: Delivering More Features using Flight Levels Dependency Management", 
      speaker: "Ricardo Caldas", 
      speakerImage: "/assets/Ricardo-Caldas.png",
      type: 'talk',
      language: '🇵🇹',
      description: "Tratar dependências como um problema de sistema utilizando Flight Levels.",
      bios: [{ name: "Ricardo Caldas", bio: "Focado em outcomes e fluxo de valor." }]
    },
    { 
      time: "15:30", 
      endTime: "16:10",
      title: "Direction, Flow, and Commitment", 
      speaker: ["Paulo Caroli", "Manuel Pais"],
      speakerImage: ["/assets/Paulo-Caroli.png", "/assets/Manuel-Pais.png"],
      type: 'talk',
      language: '🇵🇹',
      description: "Conexão entre Strategic OKRs, Team Topologies e Team OKRs.",
      bios: [
        { name: "Paulo Caroli", bio: "Criador da Lean Inception." },
        { name: "Manuel Pais", bio: "Co-author of 'Team Topologies'." }
      ]
    },
    { 
      time: "16:10", 
      endTime: "16:30",
      title: "Coffee Break & Networking", 
      type: 'event',
    },
    { 
      time: "16:35", 
      endTime: "17:05",
      title: "Transformar para Entregar: a evolução ágil nos CTT", 
      speaker: ["César Ribeiro", "Carlos Paz"],
      speakerImage: ["/assets/Cesar-Ribeiro.png", "/assets/Carlos-Paz.png"],
      type: 'talk',
      language: '🇵🇹',
      description: "Partilha sobre a jornada de transformação dos CTT.",
      bios: [
        { name: "César Ribeiro", bio: "Head of IT Governance nos CTT." },
        { name: "Carlos Paz", bio: "Especialista em tecnologia." }
      ]
    },
    { 
      time: "17:10", 
      endTime: "17:40",
      title: "Real World Product Management", 
      speaker: "Sara Cruz", 
      speakerImage: "/assets/Sara-Cruz.png",
      type: 'talk',
      language: '🇵🇹',
      description: "O gap entre a cultura de produto e a realidade do dia a dia.",
      bios: [{ name: "Sara Cruz", bio: "Especialista em equipas de produto." }]
    },
    { 
      time: "17:45", 
      endTime: "18:25",
      title: "Agilidade sem humanos? O futuro da liderança na era da IA", 
      speaker: "Nadia Miranda", 
      speakerImage: "/assets/Nadia-Miranda.png",
      type: 'talk',
      isKeynote: true,
      keynoteType: 'closing',
      language: '🇵🇹',
      description: "O papel do líder na era da Inteligência Artificial.",
      bios: [{ name: "Nadia Miranda", bio: "Líder em Transformação Digital." }]
    },
    { 
      time: "18:25", 
      endTime: "18:30",
      title: "Encerramento", 
      type: 'event',
    },
  ];

  return (
    <div className="relative min-h-screen bg-white pb-20 z-[100]">
      <Link 
        to="/" 
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 bg-brand-darkBlue text-white px-6 py-3 rounded-full shadow-2xl hover:bg-brand-orange transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Voltar para Home</span>
      </Link>

      <header className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-6xl font-black text-brand-darkBlue mb-4 tracking-tighter uppercase">AGENDA <span className="text-brand-orange">2026</span></h1>
        <p className="text-xl text-brand-darkBlue font-medium max-w-2xl mx-auto opacity-80 italic">
          Agilidade, Inovação e IA: o impacto real no dia a dia das organizações.
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {agenda.map((slot, index) => {
          const isExpandable = slot.description || (slot.bios && slot.bios.length > 0);
          
          return (
            <div 
              key={index}
              onClick={() => isExpandable && setOpenSlot(openSlot === index ? null : index)}
              className={`group flex flex-col p-8 rounded-3xl border border-gray-100 transition-all duration-300 shadow-sm hover:shadow-md bg-white text-brand-darkBlue ${isExpandable ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start gap-8">
                <div className="flex flex-col min-w-[100px] pt-1">
                  <span className="font-black text-2xl tabular-nums text-brand-darkBlue tracking-tight">{slot.time}</span>
                  {slot.endTime && (
                    <span className="text-sm font-bold text-gray-300 tabular-nums uppercase">{slot.endTime}</span>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-grow space-y-2">
                      {slot.isKeynote && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-2">
                          <Star className="w-3 h-3 fill-brand-orange" />
                          <span>{slot.keynoteType === 'opening' ? 'Opening Keynote' : 'Closing Keynote'}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-3">
                        <h3 className="text-xl font-black leading-tight tracking-tight uppercase group-hover:text-brand-orange transition-colors">
                          {slot.title}
                        </h3>
                        {slot.language && (
                          <span className="text-xl filter drop-shadow-sm">{slot.language}</span>
                        )}
                      </div>

                      {slot.speaker && (
                        <p className="text-sm font-bold text-brand-orange uppercase tracking-widest">
                          {Array.isArray(slot.speaker) ? slot.speaker.join(' • ') : slot.speaker}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      {slot.speakerImage && (
                        <div className="flex -space-x-4 items-center">
                          {Array.isArray(slot.speakerImage) ? (
                            slot.speakerImage.map((img, i) => (
                              <img key={i} src={img} alt="Speaker" className="w-14 h-14 rounded-full border-[3px] border-white shadow-lg object-cover ring-2 ring-brand-orange" />
                            ))
                          ) : (
                            <img 
                              src={slot.speakerImage} 
                              alt="Speaker" 
                              className={`w-16 h-16 rounded-full border-[3px] border-white shadow-lg object-cover ring-2 ring-brand-orange ${slot.title.includes('TugÁgil') ? 'bg-white p-2 object-contain ring-brand-darkBlue/10' : ''}`} 
                            />
                          )}
                        </div>
                      )}
                      {isExpandable && (
                        <div className="p-2 rounded-full bg-gray-50 group-hover:bg-brand-orange/10 transition-colors">
                          {openSlot === index ? <ChevronUp size={24} className="text-brand-orange" /> : <ChevronDown size={24} className="text-gray-300 group-hover:text-brand-orange" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {openSlot === index && isExpandable && (
                <div className="mt-8 pt-8 border-t border-gray-50 space-y-8 animate-in fade-in slide-in-from-top-4">
                  {slot.description && (
                    <div className="max-w-3xl">
                      <h4 className="text-[11px] uppercase tracking-[0.2em] text-brand-orange font-black mb-4">Sobre a Sessão</h4>
                      <p className="text-base leading-relaxed text-gray-500 font-medium">{slot.description}</p>
                    </div>
                  )}
                  {slot.bios && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {slot.bios.map((person, i) => (
                        <div key={i} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                          <h4 className="font-black text-sm text-brand-darkBlue uppercase tracking-wider mb-2">{person.name}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed font-medium">{person.bio}</p>
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
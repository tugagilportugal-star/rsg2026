import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface SpeakerBio {
  name: string;
  bio: string;
}

interface AgendaSlot {
  time: string;
  endTime?: string; // Novo campo para o horário de término
  title: string;
  speaker?: string | string[];
  speakerImage?: string | string[];
  description?: string;
  type: 'talk' | 'event' | 'break';
  isKeynote?: boolean;
  language?: 'PT' | 'EN';
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
      title: "Welcome: Check-in & Receção", 
      type: 'event'
    },
    { 
      time: "09:10", 
      endTime: "09:30",
      title: "Boas Vindas: Abertura TugÁgil", 
      type: 'talk',
      speakerImage: "/assets/TugÁgil.png",
      description: "O arranque oficial da jornada RSG Lisbon 2026 pela equipa TugÁgil."
    },
    { 
      time: "09:30",
      endTime: "10:05", 
      title: "QA na era da IA: o que mudou, e o que continua a falhar?", 
      speaker: "Joana Silva", 
      speakerImage: "/assets/Joana-Silva.png",
      type: 'talk',
      language: 'PT',
      description: "Uma análise crítica sobre como a Inteligência Artificial está a transformar os processos de qualidade e onde os humanos continuam a ser o elo indispensável.",
      bios: [{ name: "Joana Silva", bio: "Director of Quality Assurance com vasta experiência em automação e liderança de equipas de qualidade em contextos de transformação digital acelerada." }]
    },
    { 
      time: "10:05", 
      endTime: "10:55",
      title: "Agilists and our world work: what if we were made for this time?", 
      speaker: "Lyssa Adkins", 
      speakerImage: "/assets/Lyssa-Adkins.png",
      type: 'talk',
      isKeynote: true,
      language: 'EN',
      description: "Lyssa explora como as competências nativas dos agilistas são precisamente as que o mundo atual mais necessita para navegar na incerteza.",
      bios: [{ name: "Lyssa Adkins", bio: "Internationally recognized thought leader in Agile Coaching. Author of 'Coaching Agile Teams', she has spent the last decades helping leaders navigate complex environments." }]
    },
    { 
      time: "10:55", 
      endTime: "11:20",
      title: "☕ Coffee Break & Networking", 
      type: 'event',
    },
    { 
      time: "11:20", 
      endTime: "11:55",
      title: "People & Future: Redesenhar o trabalho em equipa fora do mundo tech", 
      speaker: "Patrícia Alves", 
      speakerImage: "/assets/Patricia-Sousa.png",
      type: 'talk',
      language: 'PT',
      description: "Patrícia desafia o óbvio: e se o futuro do trabalho não depender de mais processos, mas de mais coragem para mudar como pensamos equipas?",
      bios: [{ name: "Patrícia Alves", bio: "Patrícia lidera transformações em People que ligam talento, tecnologia, dados e cultura para criar equipas ágeis e preparadas para o futuro." }]
    },   
    { 
      time: "11:55",
      endTime: "12:45", 
      title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
      speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
      speakerImage: ["/assets/Matheus.png", "/assets/Coca-Pitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
      type: 'talk',
      description: "Um debate sem filtros sobre as tensões entre automação e agilidade humana. Será a IA uma ferramenta de libertação ou um novo silo?",
      bios: [
        { name: "Matheus Haddad - Moderador", bio: "Fundador da Estratégia Ágil e criador do Feedback Canvas." },
        { name: "Coca Pitzer", bio: "Enterprise Agile Consultant focada em transformações sistémicas." },
        { name: "Anabela Ferreira", bio: "Agile Coach experiente na implementação de frameworks ágeis em larga escala." },
        { name: "Ricardo Fernandes", bio: "Especialista em agilidade organizacional com foco em métricas de fluxo." }
      ]
    },
    { 
      time: "12:45", 
      endTime: "14:20",
      title: "🍴 Pausa para o Almoço", 
      type: 'event',
    },
    { 
      time: "14:20", 
      endTime: "14:55",
      title: "Satisficing: How to Succeed at Scale", 
      speaker: "David Anderson", 
      speakerImage: "/assets/David-Anderson.png",
      type: 'talk',
      language: 'EN',
      description: "Optimizing the performance of large scale organizations requires the application of network science and the concept of satisficing.",
      bios: [{ name: "David Anderson", bio: "David is the originator of the Kanban Method and co-creator of the Kanban Maturity Model." }]
    },
    { 
      time: "14:55", 
      endTime: "15:30",
      title: "Let IT Flow: Delivering More Features using Flight Levels Dependency Management", 
      speaker: "Ricardo Caldas", 
      speakerImage: "/assets/Ricardo-Caldas.png",
      type: 'talk',
      language: 'PT',
      description: "Ricardo partilhará aprendizagens, desafios e impactos concretos obtidos ao tratar dependências como um problema de sistema.",
      bios: [{ name: "Ricardo Caldas", bio: "Atua há vários anos na interseção entre produto, agilidade e gestão, com forte foco em outcomes e fluxo de valor." }]
    },
    { 
      time: "15:30", 
      endTime: "16:25",
      title: "☕ Coffee Break & 🤝 Networking Special", 
      type: 'event',
      description: "Um momento para conexões. Teremos sorteios exclusivos de parceiros e speakers, e dinâmicas para fortalecer o networking entre os participantes.",
    },
    { 
      time: "16:25", 
      endTime: "17:10",
      title: "Direction, Flow, and Commitment: Strategy, Team Design, and Team Ownership Must Work as One System", 
      speaker: ["Paulo Caroli", "Manuel Pais"],
      speakerImage: ["/assets/Paulo-Caroli.png", "/assets/Manuel-Pais.png"],
      type: 'talk',
      language: 'PT',
      description: "Exploração de como Strategic OKRs, Team Topologies, e Team OKRs conectam direção, fluxo e ownership.",
      bios: [
        { name: "Paulo Caroli", bio: "Paulo Caroli é autor best-seller e criador da Lean Inception e do Team OKRs." },
        { name: "Manuel Pais", bio: "Co-author of the industry changing book “Team Topologies”." }
      ]
    },
    { 
      time: "17:10", 
      endTime: "17:45",
      title: "Transformar para Entregar: a evolução ágil nos CTT", 
      speaker: ["César Ribeiro", "Carlos Paz"],
      speakerImage: ["/assets/Cesar-Ribeiro.png", "/assets/Carlos-Paz.png"],
      type: 'talk',
      description: "Uma partilha sem filtros sobre a jornada de transformação dos CTT e o impacto de alinhar Flight Levels e produto.",
      bios: [
        { name: "César Ribeiro", bio: "Head of IT Governance nos CTT – Correios de Portugal." },
        { name: "Carlos Paz", bio: "Especialista em gestão de tecnologia e transformação digital." }
      ]
    },
    { 
      time: "17:45", 
      endTime: "18:20",
      title: "Real World Product Management", 
      speaker: "Sara Cruz", 
      speakerImage: "/assets/Sara-Cruz.png",
      type: 'talk',
      language: 'PT',
      description: "Sara explora o gap entre a 'cultura de produto perfeita' e as trincheiras do dia a dia.",
      bios: [{ name: "Sara Cruz", bio: "Especialista em crescer equipas de produto de alta performance e elevar a maturidade digital." }]
    },
    { 
      time: "18:20", 
      endTime: "19:00",
      title: "Agilidade sem humanos? O futuro da liderança na era da IA", 
      speaker: "Nadia Miranda", 
      speakerImage: "/assets/Nadia-Miranda.png",
      type: 'talk',
      isKeynote: true,
      language: 'PT',
      description: "Reflexão sobre o papel do líder quando a tecnologia assume o processamento e o humano assume o propósito.",
      bios: [{ name: "Nadia Miranda", bio: "Líder em Transformação Digital e IT Director. Doutorada em gestão." }]
    },
    { 
      time: "19:00", 
      endTime: "19:20",
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
        <h1 className="text-6xl font-black text-brand-darkBlue mb-4 tracking-tighter">AGENDA <span className="text-brand-orange">2026</span></h1>
        <p className="text-xl text-brand-darkBlue font-medium max-w-2xl mx-auto opacity-80 italic">
          Agilidade, Inovação e IA: o impacto real no dia a dia das organizações.
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-3">
        {agenda.map((slot, index) => {
          const isExpandable = slot.description || slot.bios;
          
          return (
            <div 
              key={index}
              onClick={() => isExpandable && setOpenSlot(openSlot === index ? null : index)}
              className={`flex flex-col p-6 rounded-2xl border transition-all ${
                slot.type === 'talk' 
                  ? 'bg-brand-darkBlue border-transparent text-white shadow-md cursor-pointer hover:bg-[#0a1f3d]' 
                  : 'bg-gray-50 border-gray-100 text-brand-darkBlue'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col min-w-[80px]">
                  <span className="font-bold text-lg tabular-nums">{slot.time}</span>
                  {slot.endTime && (
                    <span className="text-xs font-medium text-gray-400 tabular-nums">até {slot.endTime}</span>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-grow">
                      {slot.isKeynote && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-1">
                          <Star className="w-3 h-3 fill-brand-orange" /> Keynote
                        </span>
                      )}
                      <h3 className="text-lg font-bold leading-tight">
                        {slot.title}
                        {slot.language && (
                          <span className="ml-3 text-[9px] px-1.5 py-0.5 rounded border border-white/20 bg-white/10">
                            {slot.language}
                          </span>
                        )}
                      </h3>
                      {slot.speaker && (
                        <p className={`text-sm mt-1 font-medium ${slot.type === 'talk' ? 'text-brand-orange' : 'text-gray-500'}`}>
                          {Array.isArray(slot.speaker) ? slot.speaker.join(' & ') : slot.speaker}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {slot.speakerImage && (
                        <div className="flex -space-x-3 items-center">
                          {Array.isArray(slot.speakerImage) ? (
                            slot.speakerImage.map((img, i) => (
                              <img key={i} src={img} alt="Speaker" className="w-10 h-10 rounded-full border-2 border-brand-darkBlue object-cover bg-white" />
                            ))
                          ) : (
                            <img 
                              src={slot.speakerImage} 
                              alt="Logo" 
                              className={`w-12 h-12 object-contain ${slot.title.includes('TugÁgil') ? 'bg-white p-1 rounded-lg' : 'rounded-full border-2 border-brand-orange object-cover'}`} 
                            />
                          )}
                        </div>
                      )}
                      
                      {isExpandable && (
                        <div className={slot.type === 'talk' ? 'text-white/50' : 'text-gray-300'}>
                          {openSlot === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTEÚDO EXPANSÍVEL (DESCRIÇÃO + BIOS) */}
              {openSlot === index && isExpandable && (
                <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                  {slot.description && (
                    <div className="mb-6">
                      <h4 className="text-[10px] uppercase tracking-widest text-brand-orange font-bold mb-2">Sobre a Sessão</h4>
                      <p className="text-sm leading-relaxed opacity-90">{slot.description}</p>
                    </div>
                  )}
                  
                  {slot.bios && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-widest text-brand-orange font-bold">Speakers</h4>
                      {slot.bios.map((person, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <p className="font-bold text-sm mb-1">{person.name}</p>
                          <p className="text-xs opacity-80 leading-relaxed">{person.bio}</p>
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
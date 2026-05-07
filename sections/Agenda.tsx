import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Star, X, Volume2 } from 'lucide-react';

// --- COMPONENTES AUXILIARES ---

const LanguageBadge: React.FC<{ language?: string }> = ({ language }) => {
  if (!language) return null;
  
  const lang = language.toLowerCase();
  const isEn = lang.includes('en') || lang.includes('gb') || lang.includes('🇬🇧');

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 bg-white/10 text-white rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
        <Volume2 size={10} className="text-brand-orange" />
        <span>{isEn ? 'Talk in English' : 'Palestra em Português'}</span>
      </span>
    </div>
  );
};

// --- INTERFACES ---

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
      description: "O arranque oficial do RSG Lisbon 2026! A equipa do TugÁgil dá as boas-vindas à comunidade. Prepare-se para um dia de conexões e muitos insights!" 
    },
    { 
      time: "09:30", endTime: "10:00", title: "QA na era da IA: o que mudou, e o que continua a falhar?", 
      speaker: "Joana Silva", speakerImage: "/assets/Joana-Silva.png", type: 'talk', language: 'pt',
      description: "O que mudou (de verdade), o que funciona e o que é mito? Uma análise prática com casos reais e ferramentas sobre IA no suporte à estratégia de testes e automação assistida. A Joana irá partilhar sobre a qualidade em produtos com componentes de IA, focando em riscos, governance e nas aprendizagens que realmente trazem resultados em ambientes complexos.",
      bios: [{ name: "Joana Silva", bio: "Engineering Leader with 8+ years of experience driving software quality across complex systems. She has a proven track record in building high-performing teams, defining tech strategies, and fostering innovation. Expert at aligning technical execution with business goals, she is also a public speaker and academic teacher focused on scalable, reliable solutions." }]
    },
    { 
      time: "10:05", endTime: "10:50", title: "Agilists and our world work: what if we were made for this time?", 
      speaker: "Lyssa Adkins", speakerImage: "/assets/Lyssa-Adkins.png", type: 'talk', 
      isKeynote: true, keynoteType: 'Opening', language: 'en',
      description: "We are in the age of acceleration, facing exponential changes and planetary-scale challenges. As agilists with key super skills and global influence, Lyssa asks: <strong>What if we were made for this time?</strong> This keynote explores why agility is no accident and how we are uniquely positioned to meet today’s paradigm shifts and make a massively positive impact on the world.",
      bios: [{ name: "Lyssa Adkins", bio: "Lyssa Adkins is an author, systems coach, and a foundational figure in the agile movement, best known for the industry-defining book <i>Coaching Agile Teams</i>. She specializes in expanding a leader’s cognitive, emotional, and energetic range to navigate high-stakes complexity. Today, she helps leaders become <strong>Future-Fit</strong>, unknotting systemic blockers to allow new growth to take root." }]
    },
    { time: "10:55", endTime: "11:20", title: "☕ Coffee Break & Networking", type: 'event' },
    { 
      time: "11:25", endTime: "11:55", title: "Transformar para Entregar: a evolução ágil nos CTT", 
      speaker: ["César Ribeiro", "Carlos Paz"],
      speakerImage: ["/assets/Cesar-Ribeiro.png", "/assets/Carlos-Paz.png"],
      type: 'talk', language: 'pt',
      description: "Transformar os CTT foi além de seguir frameworks; foi navegar tensões reais e decisões imperfeitas. César e Carlos partilharão onde a jornada ganhou tração e onde travou, revelando o impacto de alinhar Flight Levels, produto e governance ao mesmo tempo. Uma talk sem fórmulas mágicas, focada na realidade, aprendizagens e reflexões para quem vive transformações em escala.",
      bios: [
        { name: "César Ribeiro", bio: "Head of IT Governance nos CTT, é responsável pela definição e evolução do modelo operativo de IT. Com mais de 30 anos de experiência em sistemas de informação, tem liderado iniciativas de transformação organizacional baseadas em princípios Lean e Agile, focadas num modelo estruturado de governação e gestão de portfólio orientado à criação de valor." },
        { name: "Carlos Paz", bio: "Especialista em gestão de tecnologia, transformação digital e agilidade em escala. Com ampla experiência na evolução de modelos operativos e melhoria de fluxo em ambientes complexos, apoia organizações na criação de formas de trabalho eficazes, conectando estratégia, liderança e entrega de valor de forma prática e sustentável." }
      ]
    },   
    { 
      time: "12:00", endTime: "12:50", title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
      speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
      speakerImage: ["/assets/Matheus.png", "/assets/Coca-Pitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
      type: 'talk', language: 'pt',
      description: "Um debate sem filtros sobre as tensões entre automação acelerada e agilidade humana. Estaremos a delegar a nossa capacidade crítica a algoritmos ou a usar a tecnologia para finalmente focar no que é estratégico? Os painelistas irão explorar se a IA é o fim dos métodos tradicionais ou o catalisador que faltava. No fim, quem está realmente a conduzir o fluxo: o humano ou o prompt?",
      bios: [
        { name: "Matheus Haddad - Moderador", bio: "Autor do livro Feedback Canvas e Fundador do Ateliê de Software. Com foco em alinhar cultura organizacional e resultados de negócio, Matheus apoia líderes na criação de modelos de gestão adaptáveis, combinando visão humanista com eficiência operacional para navegar na complexidade moderna." },
        { name: "Coca Pitzer", bio: "Enterprise Agile Consultant e mentora de transformações organizacionais. Com vasta experiência em ambientes corporativos de larga escala, a Coca foca-se no redesenho de fluxos de valor e no desenvolvimento de lideranças capazes de sustentar agilidade e inovação contínua." },
        { name: "Anabela Ferreira", bio: "Anabela trabalha na interseção entre pessoas, tecnologia e mudança, apoiando líderes a navegar em ambientes complexos. Acredita que a verdadeira vantagem competitiva reside na forma como as equipas pensam e colaboram, e não apenas na tecnologia que utilizam." },
        { name: "Ricardo Fernandes", bio: "Leadership & Team Coach and Founder of Growing Centuries, helping organizations improve focus and decision-making in complex environments. With 15+ years of experience in companies like Nokia, Mercedes-Benz.io and Tekever, he focuses on execution and communication in technical teams." }
      ]
    },
    { time: "13:00", endTime: "14:20", title: "🍴 Almoço", type: 'event' }, 
    { time: "14:20", endTime: "14:30", title: "☕ Coffee & Networking", type: 'event' },
    {
      time: "14:35", endTime: "15:05", title: "Satisficing: How to Succeed at Scale", 
      speaker: "David Anderson", speakerImage: "/assets/David-Anderson.png", type: 'talk', language: 'en',
      description: "Optimizing large organizations requires network science and <strong>satisficing</strong>—adapting locally to provide sufficient capability. Instead of rigid scaling frameworks or top-down transformations, view your organization as a network of services. Wire it for adaptation and let it evolve to achieve the best fit for global optimization.",
      bios: [{ name: "David Anderson", bio: "Originator of the Kanban Method and CEO of Mauvius Group. With 30+ years of experience at companies including IBM and Microsoft, David is a management innovator and co-creator of the Kanban Maturity Model and Fit-for-Purpose Framework, focusing on leadership development for knowledge-driven organizations." }]
    },
    { 
      time: "15:10", endTime: "15:40", title: "People & Future: Redesenhar o trabalho em equipa fora do mundo tech", 
      speaker: "Patrícia Alves", speakerImage: "/assets/Patricia-Sousa.png", type: 'talk', language: 'pt',
      description: "E se o futuro do trabalho depender de coragem para mudar como pensamos equipas? Patrícia traz uma visão real de transformação fora do mundo tech, onde a IA se torna colega e o foco muda de <strong>qual é o meu papel</strong> para <strong>que problemas resolvo</strong>. Uma partilha sobre como relações baseadas em confiança e segurança psicológica são o verdadeiro motor da mudança, provando que o maior risco é continuar a trabalhar como sempre.",
      bios: [{ name: "Patrícia Alves", bio: "Patrícia lidera transformações em People ligando talento, tecnologia e cultura. Implementou Agile em contextos não tecnológicos, organizando equipas em Sprints e PODs de inovação para posicionar o talento como parceiro estratégico. A sua abordagem combina Product Thinking e foco em mindset, defendendo que o sucesso de qualquer transformação nasce da co-criação e da evolução contínua das pessoas." }]
    },
    { 
      time: "15:45", endTime: "16:25", title: "Direction, Flow, and Commitment: Strategy, Team Design, and Team Ownership must work as One System", 
      speaker: ["Paulo Caroli", "Manuel Pais"],
      speakerImage: ["/assets/Paulo-Caroli.png", "/assets/Manuel-Pais.png"],
      type: 'talk', language: 'pt',
      description: "Many organizations define strategy or reorganize teams, yet outcomes don’t improve because strategy, team design, and commitment are often disconnected. Manuel Pais and Paulo Caroli explore how Strategic OKRs, Team Topologies, and Team OKRs connect direction, flow, and ownership to help organizations deliver real outcomes instead of just outputs.",
      bios: [
        { name: "Paulo Caroli", bio: "Paulo Caroli é autor best-seller e criador da Lean Inception e do Team OKRs. Há mais de três décadas ajuda organizações ao redor do mundo a transformar ideias em produtos de valor, conectando estratégia, discovery e delivery através de práticas ágeis e colaborativas que potenciam resultados reais e alinhamento organizacional." },
        { name: "Manuel Pais", bio: "Co-author of the book Team Topologies, Manuel is on a mission to make work more humane and businesses more valuable. He is an expert in fast flow and has helped Fortune 500 companies via strategic assessments. He also led the creation of the Team Topologies Academy and the Teamperature model for managing team cognitive load." }
      ]
    },
    { time: "16:25", endTime: "16:50", title: "☕ Coffee Break & Networking", type: 'event' },
    { 
      time: "16:55", endTime: "17:25", title: "Let IT Flow: Delivering More Features using Flight Levels Dependency Management", 
      speaker: "Ricardo Caldas", speakerImage: "/assets/Ricardo-Caldas.png", type: 'talk', language: 'pt',
      description: "Ricardo partilhará aprendizagens reais, desafios e impactos concretos obtidos ao tratar dependências como um problema de sistema e não apenas de equipas. O objetivo é mostrar como desbloquear o fluxo em contextos de escala e como a gestão sistémica pode transformar a previsibilidade e a entrega de valor em ambientes complexos.",
      bios: [{ name: "Ricardo Caldas", bio: "Ricardo atua na interseção entre produto, agilidade e gestão, com foco em outcomes e melhoria sistémica. Como Product Owner na VWGDS, utiliza práticas avançadas de gestão de fluxo e Flight Levels Dependency Management para otimizar entregas em ambientes de elevada dependência. Possui ampla experiência em liderança de equipas e transformação organizacional em contextos internacionais." }]
    },
    { 
      time: "17:30", endTime: "18:00", title: "Real World Product Management", 
      speaker: "Sara Cruz", speakerImage: "/assets/Sara-Cruz.png", type: 'talk', language: 'pt',
      description: "O gap entre a <i>cultura de produto perfeita</i> e a realidade pode ser desafiante, mas o sucesso nasce da evolução incremental. Com exemplos reais de empresas como OutSystems e Farfetch, Sara explora como transformar o caos de wishlists em intenção estratégica através de evidências e factos. Uma sessão para aprender a equilibrar dados e empatia, provando que é possível mover a agilhas hoje, sem esperar pelas condições ideais.",
      bios: [{ name: "Sara Cruz", bio: "Sara soma 15 anos de experiência em Engenharia, Design e Produto, com passagens empresas como OutSystems e Farfetch, gerindo produtos para 4 milhões de utilizadores. Especialista em equipas de alta performance e maturidade digital em contextos complexos, acredita que a cultura de produto é uma conquista diária baseada em dados e empatia." }]
    },
    { 
      time: "18:05", endTime: "18:45", title: "Agilidade sem humanos? O futuro da liderança na era da IA", 
      speaker: "Nadia Miranda", speakerImage: "/assets/Nadia-Miranda.png", type: 'talk', 
      isKeynote: true, keynoteType: 'Closing', language: 'pt',
      description: "Nádia Miranda convida-nos a olhar para o que resta quando os algoritmos assumem o processamento. Esta sessão conecta as peças soltas da transformação, da estratégia e da IA, elevando o debate para o nível da liderança consciente. Como manter a agilidade viva através da essência humana e qual o papel do líder num futuro onde a eficiência é automatizada, mas o propósito continua a ser uma escolha nossa?",
      bios: [{ name: "Nadia Miranda", bio: "Doutorada em Engenharia Informática e IT Director com vasta experiência em Transformação Digital e Marketing, Nádia é uma <strong>mulher de fazer acontecer</strong>. Autora de obras como <i>Women in Tech e não só!</i> e mentora no Portuguese Women in Tech, combina o rigor académico com uma liderança dinâmica e multicultural, defendendo que nem o céu é o limite para quem sabe gerir o tempo e cuidar das pessoas." }]
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
        <p className="text-gray-500 font-medium text-sm max-w-md mx-auto mb-8">Agilidade, Inovação e IA: o impacto real no dia a dia das organizações.</p>
        
        <div className="flex flex-wrap justify-center gap-2">
          {['morning', 'afternoon', 'all'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)} 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === f ? 'bg-brand-darkBlue text-white shadow-lg' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f === 'morning' ? 'MANHÃ' : f === 'afternoon' ? 'TARDE' : 'VER TUDO'}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {filteredAgenda.map((slot, index) => {
          const isExpandable = !!(slot.description || slot.bios);
          
          return (
            <div 
              key={index}
              onClick={() => isExpandable && setOpenSlot(openSlot === index ? null : index)}
              className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                slot.type === 'talk' 
                  ? 'bg-brand-darkBlue border-transparent text-white shadow-md cursor-pointer hover:shadow-xl' 
                  : 'bg-gray-50 border-gray-100 text-brand-darkBlue'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className="flex flex-col min-w-[70px]">
                  <span className="font-bold text-lg tabular-nums">{slot.time}</span>
                  {slot.endTime && <span className="text-[10px] font-medium opacity-50 tabular-nums">{slot.endTime}</span>}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        {slot.isKeynote && (
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-orange">
                            <Star className="w-2.5 h-2.5 fill-brand-orange" /> {slot.keynoteType} Keynote
                          </span>
                        )}
                        <LanguageBadge language={slot.language} />
                      </div>
                      <h3 className="text-lg font-bold leading-tight mb-1">{slot.title}</h3>
                      {slot.speaker && (
                        <p className={`text-xs font-bold uppercase tracking-wider ${slot.type === 'talk' ? 'text-brand-orange' : 'text-gray-500'}`}>
                          {Array.isArray(slot.speaker) ? slot.speaker.join(' & ') : slot.speaker}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {slot.speakerImage && (
                        <div className="flex -space-x-3 items-center">
                          {Array.isArray(slot.speakerImage) ? (
                            slot.speakerImage.map((img, i) => (
                              <img key={i} src={img} className="w-12 h-12 rounded-full border-2 border-brand-orange object-cover shadow-sm" alt="Speaker" />
                            ))
                          ) : (
                            <img src={slot.speakerImage} className={`w-12 h-12 rounded-full border-2 border-brand-orange object-cover ${slot.title.includes('TugÁgil') ? 'bg-white p-1' : ''}`} alt="Speaker" />
                          )}
                        </div>
                      )}
                      {isExpandable && (
                        <div className="opacity-40">
                          {openSlot === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {openSlot === index && isExpandable && (
                <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4">
                  {slot.description && (
                    <div className="mb-6">
                      <h4 className="text-[10px] uppercase tracking-widest text-brand-orange font-black mb-3">Sinopse</h4>
                      <p className="text-sm leading-relaxed opacity-90" dangerouslySetInnerHTML={{ __html: slot.description }} />
                    </div>
                  )}
                  {slot.bios && (
                    <div className="grid grid-cols-1 gap-3">
                      {slot.bios.map((person, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <p className="font-black text-xs text-brand-orange mb-1.5 uppercase">{person.name}</p>
                          <p className="text-[11px] opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: person.bio }} />
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
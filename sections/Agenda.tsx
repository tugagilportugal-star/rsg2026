import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Coffee, Utensils, Sparkles, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface SpeakerBio {
  name: string;
  bio: string;
}

interface AgendaSlot {
  time: string;
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
      type: 'event',
      description: "Prepara o teu documento de identificação com foto para validar a tua entrada e receber o kit exclusivo do RSG Lisbon 2026. Estaremos à tua espera!"
    },
    { 
      time: "09:15", 
      title: "Boas Vindas: Abertura TugÁgil", 
      type: 'talk',
      speakerImage: "/assets/Tugagil.png",
      description: "O arranque oficial da jornada RSG Lisbon 2026 pela equipa TugÁgil."
    },
    { 
      time: "09:30", 
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
      title: "☕ Coffee Break & Networking", 
      type: 'event',
      description: "Pausa para café e partilha de ideias entre a comunidade."
    },
    { 
      time: "11:20", 
      title: "People & Future: Redesenhar o trabalho em equipa fora do mundo tech", 
      speaker: "Patrícia Alvez", 
      speakerImage: "/assets/Patricia-Sousa.png",
      type: 'talk',
      language: 'PT',
      description: "Patrícia desafia o óbvio: e se o futuro do trabalho não depender de mais processos, mas de mais coragem para mudar como pensamos equipas? Fora do mundo tech, onde o Agile ainda soa a “importado”, traz uma visão crua e real de transformação.",
      bios: [{ name: "Patrícia Alves", bio: "Patrícia lidera transformações em People que ligam talento, tecnologia, dados e cultura para criar equipas ágeis e preparadas para o futuro. Nos últimos anos, transformou Talent Acquisition implementando Agile em contextos não tecnológicos." }]
    },   
    { 
      time: "11:55", 
      title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
      speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
      speakerImage: ["/assets/Matheus.png", "/assets/Coca-Pitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
      type: 'talk',
      description: "Um debate sem filtros sobre as tensões entre automação e agilidade humana. Será a IA uma ferramenta de libertação ou um novo silo?",
      bios: [
        { name: "Matheus Haddad - Moderador", bio: "Fundador da Estratégia Ágil e criador do Feedback Canvas. Especialista em cultura organizacional e dinâmicas de equipa." },
        { name: "Coca Pitzer", bio: "Enterprise Agile Consultant focada em transformações sistémicas e na evolução de modelos de gestão para a nova economia." },
        { name: "Anabela Ferreira", bio: "Agile Coach experiente na implementação de frameworks ágeis em larga escala e no desenvolvimento de liderança servidora." },
        { name: "Ricardo Fernandes", bio: "Especialista em agilidade organizacional com foco em métricas de fluxo e eficiência operacional em ambientes complexos." }
      ]
    },
    { time: "12:45", 
      title: "Fecho da Manhã", 
      type: 'event',
      description: "Encerramento dos painéis da manhã e pausa para o almoço. Aproveita para recarregar energias e preparar-te para uma tarde de conteúdo intenso!", 
    },
    { 
      time: "13:00", 
      title: "🍴 Pausa para o Almoço", 
      type: 'event',
      description: "Pausa para o almoço e recarregar energias. Aproveita o momento para se reunir e trocar ideias com os outros participantes.",
    },
    { 
      time: "14:15", 
      title: "Retorno Almoço",  
      type: 'event',
      description: "Hora de voltar e se preparar para a segunda metade do dia, que promete ser tão inspiradora quanto a manhã!",
    },
    { 
      time: "14:20", 
      title: "Satisficing: How to Succeed at Scale", 
      speaker: "David Anderson", 
      speakerImage: "/assets/David-Anderson.png",
      type: 'talk',
      language: 'EN',
      description: "Optimizing the performance of large scale organizations requires the application of network science and the concept of satisficing - adapting locally to provide satisfactory and sufficient levels of capability, viewing the whole organization as a network of services and satisficing locally in order to optimize globally. Large scale business agility isn't achieved through scaling frameworks, organizational design, or large scale transformation initiatives. Instead wire your organization for adaptation and let it evolve to achieve the best fit.",
      bios: [{ name: "David Anderson", bio: "David is a management innovator, author, and CEO of Mauvius Group, the parent organization of Kanban University and Kanban+. He is the originator of the Kanban Method and co-creator of the Kanban Maturity Model, Fit-for-Purpose Framework, and Enterprise Services Planning." }]
    },
    { 
      time: "14:55", 
      title: "Let IT Flow: Delivering More Features using Flight Levels Dependency Management", 
      speaker: "Ricardo Caldas", 
      speakerImage: "/assets/Ricardo-Caldas.png",
      type: 'talk',
      language: 'PT',
      description: "Ricardo partilhará aprendizagens, desafios e impactos concretos obtidos ao tratar dependências como um problema de sistema e não apenas de equipas, mostrando como desbloquear fluxo em contextos de escala.",
      bios: [{ name: "Ricardo Caldas", bio: "Ricardo possui ampla experiência em produtos digitais, liderança de equipas e transformação organizacional em contextos complexos e internacionais. Atua há vários anos na interseção entre produto, agilidade e gestão, com forte foco em outcomes, fluxo de valor e melhoria sistémica." }]
    },
    { 
      time: "15:30", 
      title: "☕ Coffee Break & 🤝 Networking Special", 
      type: 'event',
      description: "Um momento para conexões. Teremos sorteios exclusivos de parceiros e speakers, e dinâmicas para fortalecer o networking entre os participantes. Aproveite este momento para trocar ideias, fazer novas conexões e talvez até encontrar o teu próximo desafio profissional!",
    },
   { 
      time: "16:25", 
      title: "Direction, Flow, and Commitment: Strategy, Team Design, and Team Ownership Must Work as One System", 
      speaker: ["Paulo Caroli", "Manuel Pais"],
      speakerImage: ["/assets/Paulo-Caroli.png", "/assets/Manuel-Pais.png"],
      type: 'talk',
      language: 'PT',
      description: "Many organizations define strategy or reorganize teams, yet outcomes don’t improve. Why? Because strategy, team design, and team commitment are often disconnected. In this talk, Manuel Pais and Paulo Caroli explore how Strategic OKRs, Team Topologies, and Team OKRs connect direction, flow, and ownership to help organizations deliver real outcomes.",
      bios: [
        { name: "Paulo Caroli", bio: "Paulo Caroli é autor best-seller e criador da Lean Inception e do Team OKRs. Há mais de três décadas trabalha com equipas e organizações ao redor do mundo ajudando a transformar ideias em produtos de valor, conectando estratégia, discovery e delivery com práticas ágeis e colaborativas." },
        { name: "Manuel Pais", bio: "Co-author of the industry changing book “Team Topologies”, Manuel is on a mission to both make work more humane and businesses more valuable to customers. He is delivers motivational keynotes and practical masterclasses on the principles and practices for fast flow that resonate across the organization, from C-level executives to the teams on the ground." }
      ]
    },
    { 
      time: "17:10", 
      title: "Transformar para Entregar: a evolução ágil nos CTT", 
      speaker: ["César Ribeiro", "Carlos Paz"],
      speakerImage: ["/assets/Cesar-Ribeiro.png", "/assets/Carlos-Paz.png"],
      type: 'talk',
      description: "Uma partilha sem filtros sobre a jornada de transformação dos CTT. César e Carlos abordam as tensões reais, decisões imperfeitas e o impacto de alinhar Flight Levels e produto em contextos logísticos de grande escala.",
      bios: [
        { name: "César Ribeiro", bio: "Atualmente, César está como Head of IT Governance nos CTT – Correios de Portugal, onde é responsável pela definição, implementação e evolução do modelo operativo de IT, assegurando o alinhamento entre a estratégia organizacional e a execução tecnológica. Nos últimos anos, tem liderado iniciativas de transformação organizacional baseadas na adoção de princípios Lean e Agile, enquadradas num modelo estruturado de governação e gestão de portfólio orientado à criação de valor." },
        { name: "Carlos Paz", bio: " Carlos é especialista em gestão de tecnologia, transformação digital e agilidade em escala, com ampla experiência no desenvolvimento de equipas, evolução de modelos operativos e melhoria de fluxo em ambientes complexos. Atua apoiando organizações na criação de formas de trabalho mais eficazes, conectando estratégia, liderança e entrega de valor de forma prática e sustentável." }
      ]
    },
    { 
      time: "17:45", 
      title: "Real World Product Management", 
      speaker: "Sara Cruz", 
      speakerImage: "/assets/Sara-Cruz.png",
      type: 'talk',
      language: 'PT',
      description: "Sara explora o gap entre a 'cultura de produto perfeita' e as trincheiras do dia a dia. Mostra como transformar wishlists em intenção estratégica, equilibrando dados e empatia para construir produtos que geram valor real.",
      bios: [{ name: "Sara Cruz", bio: "Sara soma 15 anos de experiência em tecnologia, unindo percursos em Engenharia, Design e Gestão de Produto. Com passagens por referências como OutSystems, Farfetch, Autodoc e Wells, geriu produtos com mais de 4 milhões de utilizadores e receitas superiores a 2 mil milhões de euros. Especialista em crescer equipas de produto de alta performance e elevar a maturidade digital em contextos complexos, ela acredita que a cultura de produto é uma conquista diária ganha com dados, factos e empatia." }
      ]
    },
    { 
      time: "18:20", 
      title: "Agilidade sem humanos? O futuro da liderança na era da IA", 
      speaker: "Nadia Miranda", 
      speakerImage: "/assets/Nadia-Miranda.png",
      type: 'talk',
      isKeynote: true,
      language: 'PT',
      description: "Nesta talk final, Nadia conecta os pontos do dia para refletir sobre o papel do líder quando a tecnologia assume o processamento e o humano assume o propósito.",
      bios: [{ name: "Nadia Miranda", bio: "Líder em Transformação Digital e IT Director. Doutorada em gestão, foca a sua investigação no impacto da IA na liderança e no capital humano das organizações." }]
    },
    { 
      time: "19:00", 
      title: "Encerramento & Happy Hour", 
      type: 'event',
      description: "O momento de celebrar as conexões feitas. Encerramos o dia com um espaço de convívio descontraído para fortalecer os laços criados durante o evento e brindar ao sucesso da nossa comunidade."
    },
  ];

  return (
    <div className="relative min-h-screen bg-white pb-20 z-[100]">
      <Link 
        to="/" 
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 bg-brand-darkBlue text-white px-6 py-3 rounded-full shadow-2xl hover:bg-brand-orange transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Voltar para a Home</span>
      </Link>

      <header className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-6xl font-black text-brand-darkBlue mb-4 tracking-tighter">AGENDA <span className="text-brand-orange">2026</span></h1>
        <p className="text-xl text-brand-darkBlue font-medium max-w-2xl mx-auto opacity-80 italic">
          Agilidade, Inovação e IA: o impacto real no dia a dia das organizações.
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {agenda.map((slot, index) => (
          <div 
            key={index}
            onClick={() => slot.bios && setOpenSlot(openSlot === index ? null : index)}
            className={`flex flex-col p-6 rounded-3xl border transition-all ${
              slot.type === 'talk' 
                ? 'bg-brand-darkBlue border-transparent text-white shadow-lg cursor-pointer' 
                : 'bg-gray-50 border-gray-100 text-brand-darkBlue'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 min-w-[90px]">
                <Clock className={`w-4 h-4 ${slot.type === 'talk' ? 'text-brand-orange' : 'text-brand-blue'}`} />
                <span className="font-bold tabular-nums">{slot.time}</span>
              </div>

              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-grow pr-4">
                    {slot.isKeynote && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-1">
                        <Star className="w-3 h-3 fill-brand-orange" /> Keynote Session
                      </span>
                    )}
                    <h3 className="text-lg font-bold leading-tight flex items-center gap-2">
                      {slot.title}
                      {slot.language && (
                        <span className="text-[9px] px-2 py-0.5 rounded-md border border-white/20 bg-white/10 uppercase">
                          {slot.language}
                        </span>
                      )}
                    </h3>
                    
                    {/* DESCRIÇÃO SEMPRE VISÍVEL */}
                    {slot.description && (
                      <p className={`text-sm mt-2 font-medium leading-relaxed ${slot.type === 'talk' ? 'text-blue-100/90' : 'text-brand-darkBlue/80'}`}>
                        {slot.description}
                      </p>
                    )}
                  </div>

                  {slot.speakerImage && (
                    <div className="flex -space-x-3 items-center flex-shrink-0">
                      {Array.isArray(slot.speakerImage) ? (
                        slot.speakerImage.map((img, i) => (
                          <img key={i} src={img} alt="Speaker" className="w-12 h-12 rounded-full border-2 border-brand-darkBlue object-cover" />
                        ))
                      ) : (
                        <img src={slot.speakerImage} alt="Speaker" className="w-14 h-14 rounded-full border-2 border-brand-orange object-cover shadow-md" />
                      )}
                    </div>
                  )}
                  
                  {slot.bios && (
                    <div className="text-brand-orange">
                      {openSlot === index ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACORDEÃO PARA BIOS */}
            {openSlot === index && slot.bios && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                {slot.bios.map((person, i) => (
                  <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="font-bold text-brand-orange text-sm mb-2 uppercase tracking-wide">{person.name}</h4>
                    <p className="text-[13px] text-blue-50 leading-relaxed opacity-90">
                      {person.bio}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Coffee, Utensils, Gift, Users, Sparkles } from 'lucide-react';

// Tipagem para organizar os slots
interface AgendaSlot {
  time: string;
  title: string;
  speaker?: string | string[];
  speakerImage?: string | string[]; 
  description?: string;
  type: 'talk' | 'event' | 'break';
  isKeynote?: boolean;
  language?: 'PT' | 'EN'; // Novo campo para o idioma
}

export const Agenda: React.FC = () => {
  // Garante que a página abre no topo
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const agenda: AgendaSlot[] = [
    { time: "08:30", title: "Welcome: Check-in & Receção", type: 'event' },
    { time: "09:15", title: "Boas Vindas: Abertura TugÁgil", type: 'event' },
    { 
      time: "09:30", 
      title: "QA na era da IA: o que mudou, e o que continua a falhar?", 
      speaker: "Joana Silva", 
      speakerImage: "/assets/Joana-Silva.png",
      description: "Uma análise honesta sobre os desafios atuais do QA, mesmo com as novas ferramentas de IA à disposição.",
      type: 'talk',
      language: 'PT'
    },
    { 
      time: "10:05", 
      title: "Agilists and our world work: what if we were made for this time?", 
      speaker: "Lyssa Adkins", 
      speakerImage: "/assets/Lyssa-Adkins.png",
      description: "A profound exploration of our role as agilists in a world that needs our skills more than ever.",
      type: 'talk',
      isKeynote: true,
      language: 'EN'
    },
    { time: "10:55", title: "☕ Coffee Break & Networking", description: "Um momento para conexões.", type: 'break' },
    { 
      time: "11:20", 
      title: "People & Future: Redesenhar o trabalho em equipa fora do mundo tech", 
      speaker: "Patrícia Alves", 
      speakerImage: "/assets/Patricia-Sousa.png",
      description: "Explorando como os princípios ágeis podem transformar equipas em setores tradicionais, promovendo colaboração e inovação além da tecnologia.",
      type: 'talk',
      language: 'PT'
    },
    { 
      time: "11:55", 
      title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
      speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
      speakerImage: ["/assets/Matheus.png", "/assets/Coca-Pitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
      description: "Uma discussão profunda sobre os impactos da IA na agilidade e como podemos adaptar nossas práticas.",
      type: 'talk',
      language: 'PT',
      isKeynote: true,
    },
    { time: "12:45", title: "Fecho da Manhã:", description: "Encerramento da primeira parte do dia.", type: 'event' },
    { time: "13:00", title: "🍴 Pausa para Almoço", description: "Um momento para reenergizar.", type: 'break' },
    { 
      time: "14:20", 
      title: "Satisficing: How to Succeed at Scale", 
      speaker: "David Anderson", 
      speakerImage: "/assets/David-Anderson.png",
      description: "A practical guide to achieving success at scale by embracing the concept of satisficing, balancing perfection with pragmatism.",
      type: 'talk',
      language: 'EN'
    },
    { 
      time: "14:55", 
      title: "Let IT Flow: Delivering More Features using Flight Levels Dependency Management", 
      speaker: "Ricardo Caldas", 
      speakerImage: "/assets/Ricardo-Caldas.png",
      description: "Explorando estratégias para entregar mais funcionalidades usando gerenciamento de dependências com Flight Levels.",
      type: 'talk',
      language: 'PT'
    },
    { 
      time: "15:30", 
      title: "☕ Coffee Break & 🤝 Networking Experience", 
      description: "Um momento para conexões. Teremos sorteios de parceiros e speakers, além de dinâmicas para fortalecer a nossa comunidade.",
      type: 'break',
    },
    { 
      time: "16:25", 
      title: "Direction, Flow, and Commitment: Strategy, Team Design, and Team Ownership Must Work as One System", 
      speaker: ["Paulo Caroli", "Manuel Pais"],
      speakerImage: ["/assets/Paulo-Caroli.png", "/assets/Manuel-Pais.png"],
      description: "A deep dive into how strategy, team design, and ownership must align to create a cohesive system that drives direction, flow, and commitment.",
      type: 'talk', 
      language: 'PT'
    },
    { 
      time: "17:10", 
      title: "Transformar para Entregar: a evolução ágil nos CTT", 
      speaker: ["César Ribeiro", "Carlos Paz"],
      speakerImage: ["/assets/Cesar-Ribeiro.png", "/assets/Carlos-Paz.png"],
      description: "Uma análise sobre como a agilidade está evoluindo nos CTT e os desafios associados.",
      type: 'talk',
      language: 'PT'
    },
    { 
      time: "17:45", 
      title: "Real World Product Management", 
      speaker: "Sara Cruz", 
      speakerImage: "/assets/Sara-Cruz.png",
      description: "Uma análise sobre como a gestão de produtos pode ser aplicada no mundo real.",
      type: 'talk',
      language: 'PT'
    },
    { 
      time: "18:20", 
      title: "Agilidade sem humanos? O futuro da liderança na era da IA", 
      speaker: "Nadia Miranda", 
      speakerImage: "/assets/Nadia-Miranda.png",
      description: "Uma análise sobre o impacto da IA na liderança e como as equipas podem se adaptar a essa nova realidade.",
      type: 'talk',
      language: 'PT'
    },
    { time: "19:00", title: "Encerramento & Happy Hour", description: "Celebração do fim do evento e Networking.", type: 'event' },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Botão Voltar Flutuante */}
      <Link 
        to="/" 
        className="fixed top-8 right-8 z-50 flex items-center gap-2 bg-brand-darkBlue text-white px-6 py-3 rounded-full shadow-2xl hover:bg-brand-orange transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Voltar para a Home</span>
      </Link>

      {/* Header da Agenda */}
      <header className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-6xl font-black text-brand-darkBlue mb-4">AGENDA <span className="text-brand-orange">2026</span></h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
          Agilidade, Inovação e IA: o impacto no dia a dia das organizações.
        </p>
      </header>

      {/* Listagem da Agenda */}
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {agenda.map((slot, index) => (
          <div 
            key={index}
            className={`flex items-center gap-6 p-6 rounded-3xl border transition-all ${
              slot.type === 'talk' 
                ? 'bg-brand-darkBlue border-transparent text-white shadow-lg' 
                : 'bg-gray-50 border-gray-100 text-brand-darkBlue'
            }`}
          >
            {/* Hora */}
            <div className="flex items-center gap-2 min-w-[100px]">
              <Clock className={`w-4 h-4 ${slot.type === 'talk' ? 'text-brand-orange' : 'text-gray-400'}`} />
              <span className="font-bold tabular-nums">{slot.time}</span>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  {slot.isKeynote && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-1 block">Keynote Session</span>
                  )}
                  <h3 className={`text-lg font-bold leading-tight ${slot.type === 'talk' ? 'text-white' : 'text-brand-darkBlue'}`}>
                    {slot.title}
                  </h3>
                  {slot.speaker && (
                    <p className={`text-sm mt-1 ${slot.type === 'talk' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {Array.isArray(slot.speaker) ? slot.speaker.join(' & ') : slot.speaker}
                    </p>
                  )}
                  {slot.description && (
                    <p className="text-sm mt-2 text-blue-100/80 max-w-xl">{slot.description}</p>
                  )}
                </div>

                {/* Fotos dos Speakers à Direita */}
                {slot.speakerImage && (
                  <div className="flex -space-x-3 items-center">
                    {Array.isArray(slot.speakerImage) ? (
                      slot.speakerImage.map((img, i) => (
                        <img key={i} src={img} alt="Speaker" className="w-12 h-12 rounded-full border-2 border-brand-darkBlue object-cover" />
                      ))
                    ) : (
                      <img src={slot.speakerImage} alt="Speaker" className="w-14 h-14 rounded-full border-2 border-brand-orange object-cover" />
                    )}
                  </div>
                )}

                {/* Ícones para Momentos Extra */}
                {!slot.speakerImage && slot.type !== 'talk' && (
                  <div className="text-gray-300">
                    {slot.type === 'break' && slot.title.includes('Almoço') ? <Utensils className="w-6 h-6" /> : 
                     slot.type === 'break' ? <Coffee className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
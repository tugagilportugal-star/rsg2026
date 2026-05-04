import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Coffee, Utensils, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SpeakerBio {
  name: string;
  bio: string;
  role?: string;
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
  bios?: SpeakerBio[]; // Nova propriedade para o acordeão
}

export const Agenda: React.FC = () => {
  const [openSlot, setOpenSlot] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Esconder a navbar global se ela existir por ID (ajuste técnico rápido)
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
      type: 'talk', // Alterado para 'talk' para ficar azul
      speakerImage: "/assets/Tugagil.png",
      description: "Início oficial da jornada RSG Lisbon 2026 pela equipa TugÁgil."
    },
    { 
      time: "09:30", 
      title: "QA na era da IA: o que mudou, e o que continua a falhar?", 
      speaker: "Joana Silva", 
      speakerImage: "/assets/Joana-Silva.png",
      type: 'talk',
      language: 'PT',
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
      bios: [{ name: "Lyssa Adkins", bio: "Internationally recognized thought leader in Agile Coaching. Author of 'Coaching Agile Teams', she has spent the last decades helping leaders navigate complex environments." }]
    },
    { 
        time: "11:55", 
        title: "Mesa Redonda: A IA está a matar ou salvar a agilidade?", 
        speaker: ["Matheus Haddad", "Coca Pitzer", "Anabela Ferreira", "Ricardo Fernandes"],
        speakerImage: ["/assets/Matheus.png", "/assets/cocapitzer.png", "/assets/Anabela-Ferreira.png", "/assets/Ricardo-Fernandes.png"],
        type: 'talk',
        bios: [
          { name: "Matheus Haddad - Moderador", bio: "Fundador da Estratégia Ágil e criador do Feedback Canvas. Especialista em cultura organizacional e dinâmicas de equipa." },
          { name: "Coca Pitzer", bio: "Enterprise Agile Consultant focada em transformações sistémicas e na evolução de modelos de gestão para a nova economia." },
          { name: "Anabela Ferreira", bio: "Agile Coach experiente na implementação de frameworks ágeis em larga escala e no desenvolvimento de liderança servidora." },
          { name: "Ricardo Fernandes", bio: "Especialista em agilidade organizacional com foco em métricas de fluxo e eficiência operacional em ambientes complexos." }
        ]
    },
    // ... incluir os outros slots seguindo o mesmo padrão de bios
    { 
      time: "18:20", 
      title: "Agilidade sem humanos? O futuro da liderança na era da IA", 
      speaker: "Nadia Miranda", 
      speakerImage: "/assets/Nadia-Miranda.png",
      type: 'talk',
      bios: [{ name: "Nadia Miranda", bio: "Líder em Transformação Digital e IT Director. Doutorada em gestão, foca a sua investigação no impacto da IA na liderança e no capital humano das organizações." }]
    },
    { time: "19:00", title: "Encerramento & Happy Hour", type: 'event' },
  ];

  const toggleAccordion = (index: number) => {
    setOpenSlot(openSlot === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-white pb-20 z-[100]">
      {/* Botão Voltar Flutuante */}
      <Link 
        to="/" 
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 bg-brand-darkBlue text-white px-6 py-3 rounded-full shadow-2xl hover:bg-brand-orange transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Voltar para a Home</span>
      </Link>

      <header className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-6xl font-black text-brand-darkBlue mb-4 tracking-tighter">AGENDA <span className="text-brand-orange">2026</span></h1>
        <p className="text-xl text-brand-darkBlue font-medium max-w-2xl mx-auto opacity-80">
          Agilidade, Inovação e IA: o impacto real no dia a dia das organizações.
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {agenda.map((slot, index) => (
          <div 
            key={index}
            onClick={() => slot.bios && toggleAccordion(index)}
            className={`flex flex-col p-6 rounded-3xl border transition-all ${
              slot.type === 'talk' 
                ? 'bg-brand-darkBlue border-transparent text-white shadow-lg cursor-pointer' 
                : 'bg-gray-50 border-gray-100 text-brand-darkBlue'
            }`}
          >
            <div className="flex items-center gap-6">
              {/* Hora */}
              <div className="flex items-center gap-2 min-w-[90px]">
                <Clock className={`w-4 h-4 ${slot.type === 'talk' ? 'text-brand-orange' : 'text-brand-blue'}`} />
                <span className="font-bold tabular-nums">{slot.time}</span>
              </div>

              {/* Título e Speakers */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-grow pr-4">
                    {slot.isKeynote && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-1 block">Keynote Session</span>
                    )}
                    <h3 className="text-lg font-bold leading-tight">
                      {slot.title}
                    </h3>
                    {slot.description && (
                      <p className={`text-sm mt-2 font-medium ${slot.type === 'talk' ? 'text-blue-100/90' : 'text-brand-darkBlue/80'}`}>
                        {slot.description}
                      </p>
                    )}
                  </div>

                  {/* Fotos */}
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

            {/* Acordeão com Bios */}
            {openSlot === index && slot.bios && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-fadeIn">
                {slot.bios.map((person, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl">
                    <h4 className="font-bold text-brand-orange text-sm mb-1">{person.name}</h4>
                    <p className="text-sm text-blue-50 leading-relaxed italic opacity-90">
                      "{person.bio}"
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
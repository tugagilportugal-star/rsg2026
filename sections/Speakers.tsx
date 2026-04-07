import React from 'react';
import { Section } from '../components/UIComponents';
import { Linkedin, Sparkles, UserCircle2 } from 'lucide-react';

interface SpeakerData {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin: string;
  isRevealed: boolean;
}

export const Speakers: React.FC = () => {
  
  // ==========================================
  // 1. KEYNOTES (Destaque Principal)
  // ==========================================
  const keynotes: SpeakerData[] =[
    {
      id: "k1",
      name: "Lyssa Adkins",
      role: "Author of Coaching Agile Teams",
      image: "https://i.postimg.cc/htmyQzQ1/Lyssa-Adkins.png", 
      linkedin: "https://www.linkedin.com/in/lyssaadkins/",
      isRevealed: true
    },
    {
      id: "k2",
      name: "TBA",
      role: "Global Leader",
      image: "",
      linkedin: "",
      isRevealed: false
    },
  ];

  // ==========================================
  // 2. SPEAKERS, PAINÉIS E MODERADORES
  // ==========================================
  const speakers: SpeakerData[] =[
    {
      id: "s1",
      name: "Ricardo Caldas",
      role: "Product Owner",
      image: "/assets/Ricardo-Caldas.png",
      linkedin: "https://www.linkedin.com/in/ricardo-caldas/",
      isRevealed: true
    },
    {
      id: "s2",
      name: "Joana Silva",
      role: "Director of Quality Assurance",
      image: "/assets/Joana-Silva.png",
      linkedin: "https://www.linkedin.com/in/joanacssilva/",
      isRevealed: true
    },
    {
      id: "s3",
      name: "Manuel Pais",
      role: "Co-author of Team Topologies",
      image: "/assets/Manuel-Pais.png",
      linkedin: "https://www.linkedin.com/in/manuelpais/",
      isRevealed: true
    },
    {
      id: "s4",
      name: "Paulo Caroli",
      role: "Author of Lean Inception & Team OKRs",
      image: "/assets/Paulo-Caroli.png",
      linkedin: "https://www.linkedin.com/in/paulocaroli/",
      isRevealed: true
    },
    {
      id: "s5",
      name: "Patrícia Sousa",
      role: "Talent & People Transformation Leader",
      image: "/assets/Patricia-Sousa.png",
      linkedin: "https://www.linkedin.com/in/patriciaalvessousa/",
      isRevealed: true
    },
    {
      id: "s6",
      name: "Ricardo Fernandes",
      role: "Enterprise Consultant",
      image: "/assets/Ricardo-Fernandes.png",
      linkedin: "https://www.linkedin.com/in/ricardo-fernandes-agile/",
      isRevealed: true
    },
    // Placeholders para manter a grelha de 10 speakers planeados (total: 4 reais + 6 TBA)
    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `tba-${i+5}`,
      name: "Revealing Soon",
      role: "Agile Practitioner",
      image: "",
      linkedin: "",
      isRevealed: false
    }))
  ];

  // ==========================================
  // COMPONENTES DE RENDERIZAÇÃO (CARDS)
  // ==========================================

  // Card para Keynote
  const KeynoteCard = ({ data }: { data: SpeakerData }) => {
    if (!data.isRevealed) {
      return (
        // Adicionado: w-full max-w-[400px] mx-auto
        <div className="relative overflow-hidden rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 aspect-[4/5] w-full max-w-[400px] mx-auto flex flex-col items-center justify-center text-center p-8 group transition-all duration-300 hover:bg-gray-100">
           <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <UserCircle2 className="w-10 h-10 text-gray-400" />
           </div>
           <h3 className="text-xl font-black text-gray-400 mb-2">Keynote</h3>
           <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">A anunciar brevemente</p>
        </div>
      );
    }

    return (
      // Adicionado: w-full max-w-[400px] mx-auto
      <div className="group relative overflow-hidden rounded-[2rem] aspect-[4/5] w-full max-w-[400px] mx-auto shadow-xl">
        <img 
          src={data.image} 
          alt={data.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradiente para garantir leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkBlue via-brand-darkBlue/40 to-transparent opacity-90"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-1 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" /> Keynote
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{data.name}</h3>
            <p className="text-brand-orange font-bold text-sm mb-1">{data.role}</p>
            
            {data.linkedin && (
              <a 
                href={data.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors text-white mt-4"
                aria-label={`LinkedIn de ${data.name}`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
        </div>
      </div>
    );
  };

  // Card para Speaker Standard
  const SpeakerCard = ({ data }: { data: SpeakerData }) => {
    if (!data.isRevealed) {
      return (
        <div className="flex flex-col items-center text-center group">
          <div className="w-full aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-4 transition-colors group-hover:bg-gray-100">
             <UserCircle2 className="w-12 h-12 text-gray-300 mb-2" />
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Em Breve</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center text-center group">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-md border border-gray-100">
          <img 
            src={data.image} 
            alt={data.name} 
            // O efeito grayscale -> color no hover é um clássico premium
            className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105"
          />
          {/* O link do linkedin aparece sobre a foto no hover */}
          {data.linkedin && (
            <a 
              href={data.linkedin} 
              target="_blank" 
              rel="noreferrer" 
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-brand-darkBlue text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-brand-blue shadow-lg"
              aria-label={`LinkedIn de ${data.name}`}
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
        </div>
        
        <h4 className="font-bold text-xl text-brand-darkBlue mb-1">{data.name}</h4>
        <p className="text-sm font-medium text-brand-orange mb-1">{data.role}</p>
      </div>
    );
  };

  return (
    <Section id="speakers" className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-20">
          <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs block mb-3">
            O Line-Up
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6 tracking-tight">
            Keynotes & Speakers
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Grandes nomes da agilidade, inovação e inteligência artificial.
            <br/> <span className="text-brand-blue font-semibold">Mais oradores serão anunciados em breve.</span>
          </p>
        </div>

        {/* 1. Secção de Keynotes */}
        <div className="mb-24">
            <h3 className="text-2xl font-black text-brand-darkBlue mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-3">
                <Sparkles className="text-brand-orange w-6 h-6" />
                Keynotes
            </h3>
            {/* Ajuste de Grelha: justify-items-center para que os cards (que agora têm limite de largura) fiquem sempre bem centrados nas colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                {keynotes.map(keynote => (
                    <KeynoteCard key={keynote.id} data={keynote} />
                ))}
            </div>
        </div>

        {/* 2. Secção de Speakers */}
        <div>
            <h3 className="text-2xl font-black text-brand-darkBlue mb-10 text-center md:text-left">
                Speakers
            </h3>
            {/* Grelha de Speakers: 2 no telemóvel, 3 no tablet, 5 no desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
                {speakers.map(speaker => (
                    <SpeakerCard key={speaker.id} data={speaker} />
                ))}
            </div>
        </div>

      </div>
    </Section>
  );
};

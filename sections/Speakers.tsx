import React from 'react';
import { Section } from '../components/UIComponents';
import { Linkedin, Sparkles, UserCircle2 } from 'lucide-react';

interface SpeakerData {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  isRevealed: boolean;
  isEnglish?: boolean;
}

export const Speakers: React.FC = () => {
  
  const keynotes: SpeakerData[] = [
    {
      id: "k1",
      name: "Lyssa Adkins",
      role: "Author of Coaching Agile Teams",
      image: "/assets/Lyssa-Adkins.png", 
      linkedin: "https://www.linkedin.com/in/lyssaadkins/",
      isRevealed: true,
      isEnglish: true
    },
    {
      id: "k2",
      name: "David Anderson",
      role: "Originator of the Kanban Method",
      image: "/assets/David-Anderson.png",
      linkedin: "https://www.linkedin.com/in/agilemanagement/",
      isRevealed: true,
      isEnglish: true
    }
  ];

  const speakers: SpeakerData[] = [
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
      role: "Author of Lean Inception",
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
      isRevealed: true,
    },
    {
      id: "s6",
      name: "Ricardo Fernandes",
      role: "Enterprise Consultant",
      image: "/assets/Ricardo-Fernandes.png",
      linkedin: "https://www.linkedin.com/in/ricardofernandes/",
      isRevealed: true 
    },
    {
      id: "s7",
      name: "Coca Pitzer",
      role: "Enterprise Agile Strategist",
      image: "/assets/Coca-Pitzer.png",
      linkedin: "https://www.linkedin.com/in/cocapitzer/",
      isRevealed: true 
    },
    ...Array.from({ length: 4 }).map((_, i) => ({
      id: `tba-${i+7}`,
      name: "Revealing Soon",
      role: "Agile Practitioner",
      image: "",
      linkedin: "",
      isRevealed: false
    }))
  ];

  const KeynoteCard = ({ data }: { data: SpeakerData }) => {
    if (!data.isRevealed) {
      return (
        <div className="relative overflow-hidden rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 aspect-[3/4] w-full max-w-[320px] mx-auto flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
           <UserCircle2 className="w-8 h-8 text-gray-400 mb-4" />
           <h3 className="text-lg font-black text-gray-400 mb-2">Keynote</h3>
           <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">A anunciar brevemente</p>
        </div>
      );
    }

    return (
      <div className="group relative overflow-hidden rounded-[2rem] aspect-[3/4] w-full max-w-[320px] mx-auto shadow-xl bg-brand-darkBlue">
        <img 
          src={data.image} 
          alt={data.name} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkBlue via-brand-darkBlue/40 to-transparent opacity-90"></div>
        
        {data.isEnglish && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-20 border border-white/20">
                <span className="text-2xl">🇬🇧</span>
            </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col items-start text-left z-10">
            <span className="inline-flex items-center gap-1 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                <Sparkles className="w-3 h-3" /> Keynote
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight">{data.name}</h3>
            <p className="text-brand-orange font-bold text-xs mb-1">{data.role}</p>
            
            {data.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors text-white mt-2">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
        </div>
      </div>
    );
  };

  const SpeakerCard = ({ data }: { data: SpeakerData }) => {
    if (!data.isRevealed) {
      return (
        <div className="flex flex-col items-center text-center group">
          <div className="w-full aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-4 transition-colors group-hover:bg-gray-100">
              <UserCircle2 className="w-10 h-10 text-gray-300 mb-2" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Em Breve</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center text-center group">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-md border border-gray-100 bg-gray-100">
          <img 
            src={data.image} 
            alt={data.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            {data.linkedin && (
                <a href={data.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-brand-darkBlue text-white flex items-center justify-center hover:bg-[#0077b5] shadow-lg transition-colors">
                    <Linkedin className="w-4 h-4" />
                </a>
            )}
          </div>
        </div>
        
        {/* FONTES ORIGINAIS RESTAURADAS AQUI */}
        <h4 className="font-bold text-lg text-brand-darkBlue mb-1">{data.name}</h4>
        <p className="text-xs font-medium text-brand-orange mb-1">{data.role}</p>
      </div>
    );
  };

  return (
    <Section id="speakers" className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs block mb-3">O Line-Up</span>
          <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6 tracking-tight">Speakers 2026</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            As mentes que estão a redefinir a agilidade, liderança e engenharia a nível global.
            <br/> <span className="text-brand-blue font-semibold">Mais oradores anunciados em breve.</span>
          </p>
        </div>

        <div className="mb-24">
            <h3 className="text-2xl font-black text-brand-darkBlue mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-3">
                <Sparkles className="text-brand-orange w-6 h-6" /> Featured Keynotes
            </h3>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                {keynotes.map(keynote => (
                    <KeynoteCard key={keynote.id} data={keynote} />
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-black text-brand-darkBlue mb-10 text-center md:text-left">Speakers & Panelists</h3>
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
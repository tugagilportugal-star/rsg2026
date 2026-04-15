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
      name: "Nadia Miranda",
      role: "IT Director & Digital Transformation Leader",
      image: "/assets/Nadia-Miranda.png",
      linkedin: "https://www.linkedin.com/in/n%C3%A1dia-miranda-phd-master-managt-b1b30367/",
      isRevealed: false
    }
  ];

  const speakers: SpeakerData[] = [
    { id: "s1", name: "Ricardo Caldas", role: "Product Owner", image: "/assets/Ricardo-Caldas.png", linkedin: "https://www.linkedin.com/in/ricardo-caldas/", isRevealed: true },
    { id: "s2", name: "Joana Silva", role: "Director of Quality Assurance", image: "/assets/Joana-Silva.png", linkedin: "https://www.linkedin.com/in/joanacssilva/", isRevealed: true },
    { id: "s3", name: "Manuel Pais", role: "Co-author of Team Topologies", image: "/assets/Manuel-Pais.png", linkedin: "https://www.linkedin.com/in/manuelpais/", isRevealed: true },
    { id: "s4", name: "Paulo Caroli", role: "Author of Lean Inception and Team OKRs", image: "/assets/Paulo-Caroli.png", linkedin: "https://www.linkedin.com/in/paulocaroli/", isRevealed: true },
    { id: "s5", name: "Patrícia Sousa", role: "Talent & People Transformation Leader", image: "/assets/Patricia-Sousa.png", linkedin: "https://www.linkedin.com/in/patriciaalvessousa/", isRevealed: true },
    { id: "s6", name: "Ricardo Fernandes", role: "Enterprise Consultant", image: "/assets/Ricardo-Fernandes.png", linkedin: "https://www.linkedin.com/in/ricardofernandes/", isRevealed: true },
    { id: "s7", name: "Coca Pitzer", role: "Enterprise Agile Consultant", image: "/assets/Coca-Pitzer.png", linkedin: "https://www.linkedin.com/in/cocapitzer/", isRevealed: true },
    { id: "s8", name: "David Anderson", role: "Originator of the Kanban Method", image: "/assets/David-Anderson.png", linkedin: "https://www.linkedin.com/in/agilemanagement/", isRevealed: true, isEnglish: true },
    { id: "s9", name: "César Ribeiro", role: "Head of IT Governance", image: "/assets/Cesar-Ribeiro.png", linkedin: "https://www.linkedin.com/in/cesar-ribeiro-b07aa14b/", isRevealed: true },
    { id: "s10", name: "Carlos Paz", role: "Agile Coach", image: "/assets/Carlos-Paz.png", linkedin: "https://www.linkedin.com/in/carloseduardolopespaz/", isRevealed: true},
    { id: "s11", name: "Anabela Ferreira", role: "Agile Coach", image: "/assets/Anabela-Ferreira.png", linkedin: "https://www.linkedin.com/in/anabelaferreira/", isRevealed: true },
    { id: "s12", name: "Matheus Haddad", role: "Author of Feedback Canvas", image: "/assets/Matheus.png", linkedin: "https://www.linkedin.com/in/matheushaddad/", isRevealed: true },
        
    ...Array.from({ length: 2 }).map((_, i) => ({
      id: `tba-${i+9}`,
      name: "Revealing Soon",
      role: "Agile Practitioner",
      image: "",
      linkedin: "",
      isRevealed: false
    }))
  ];

  const KeynoteCard = ({ data }: { data: SpeakerData }) => {
    // ESTADO "EM BREVE" DO KEYNOTE
    if (!data.isRevealed) {
      return (
        <div className="w-full max-w-[320px] aspect-[3/4] rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <UserCircle2 className="w-8 h-8 text-gray-300" />
          </div>
          <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Keynote</span>
          <span className="text-gray-300 text-[10px] uppercase font-medium">A anunciar brevemente</span>
        </div>
      );
    }

    return (
      <div className="group relative overflow-hidden rounded-[2rem] aspect-[3/4] w-full max-w-[320px] shadow-xl bg-brand-darkBlue">
        <img 
          src={data.image} 
          alt={data.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkBlue via-brand-darkBlue/40 to-transparent opacity-90"></div>
        
        {data.isEnglish && (
          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1 group/flag">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-xl transition-transform group-hover/flag:scale-110 border-2 border-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" className="w-full h-full"><rect width="60" height="60" fill="#012169"/><path d="M0 0l60 60M60 0L0 60" stroke="#fff" strokeWidth="12"/><path d="M0 0l60 60M60 0L0 60" stroke="#C8102E" strokeWidth="8"/><path d="M30 0v60M0 30h60" stroke="#fff" strokeWidth="20"/><path d="M30 0v60M0 30h60" stroke="#C8102E" strokeWidth="12"/></svg>
            </div>
            <span className="opacity-0 group-hover/flag:opacity-100 transition-opacity duration-200 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
              Talk em Inglês
            </span>
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
          {/* TAG ENGLISH NOS SPEAKERS */}
          {data.isEnglish && (
            <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1 group/flag">
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-md transition-transform group-hover/flag:scale-110 border-2 border-white/60">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" className="w-full h-full"><rect width="60" height="60" fill="#012169"/><path d="M0 0l60 60M60 0L0 60" stroke="#fff" strokeWidth="12"/><path d="M0 0l60 60M60 0L0 60" stroke="#C8102E" strokeWidth="8"/><path d="M30 0v60M0 30h60" stroke="#fff" strokeWidth="20"/><path d="M30 0v60M0 30h60" stroke="#C8102E" strokeWidth="12"/></svg>
              </div>
              <span className="opacity-0 group-hover/flag:opacity-100 transition-opacity duration-200 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                Talk em Inglês
              </span>
            </div>
          )}
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
        <h4 className="font-bold text-lg text-brand-darkBlue mb-1">{data.name}</h4>
        <p className="text-xs font-medium text-brand-orange mb-1 leading-tight">{data.role}</p>
      </div>
    );
  };

  return (
    <Section id="speakers" className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Título da Secção */}
        <div className="text-center mb-20">
          <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs block mb-3">Line-Up</span>
          <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6 tracking-tight">Speakers 2026</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Grandes nomes da agilidade, inovação e inteligência artificial.
            <br/> <span className="text-brand-blue font-semibold">Mais oradores serão anunciados em breve.</span>
          </p>
        </div>

        {/* SECÇÃO KEYNOTES */}
        <div className="mb-24 w-full">
          <h3 className="text-2xl font-black text-brand-darkBlue mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-3 tracking-tighter">
            <Sparkles className="text-brand-orange w-6 h-6" /> Keynotes
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 w-full">
            {keynotes.map(keynote => (
              <KeynoteCard key={keynote.id} data={keynote} />
            ))}
          </div>
        </div>

        {/* SECÇÃO SPEAKERS */}
        <div>
          <h3 className="text-2xl font-black text-brand-darkBlue mb-10 text-center md:text-left tracking-tighter">
            Speakers
          </h3>
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
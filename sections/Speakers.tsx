import React from 'react';
import { Section } from '../components/UIComponents';
import { Sparkles, Linkedin } from 'lucide-react';

// --- ESTRUTURA DE DADOS (PREPARADA PARA O FUTURO) ---
interface Speaker {
  name: string;
  role: string;
  company: string;
  image: string;
  linkedin?: string;
  isKeynote?: boolean; // Se true, aparece em destaque
}

export const Speakers: React.FC = () => {
  
  // --- LISTA DE SPEAKERS ---
  // DICA: Quando tiver oradores, preencha esta lista.
  // Enquanto a lista estiver vazia, o site mostra o card "Em Construção".
  const speakers: Speaker[] = [
    /* EXEMPLO DE COMO PREENCHER (Remova os comentários para ativar):
    {
      name: "Nome do Keynote",
      role: "Global Agile Lead",
      company: "Spotify",
      image: "https://i.pravatar.cc/300?img=1", // Link da foto
      linkedin: "https://linkedin.com/in/...",
      isKeynote: true
    },
    {
      name: "Maria Silva",
      role: "Scrum Master",
      company: "Farfetch",
      image: "https://i.pravatar.cc/300?img=5",
      linkedin: "https://linkedin.com/in/..."
    },
    */
  ];

  // Separa Keynotes de Speakers normais
  const keynotes = speakers.filter(s => s.isKeynote);
  const regularSpeakers = speakers.filter(s => !s.isKeynote);
  const hasSpeakers = speakers.length > 0;

  return (
    <Section id="speakers" className="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-4">
          Speakers
        </h2>
        <p className="text-gray-500 text-lg italic">
          Os grandes nomes da agilidade mundial vão reunir-se aqui.
        </p>
      </div>

      {/* --- MODO: EM CONSTRUÇÃO (Se não houver speakers) --- */}
      {!hasSpeakers && (
        <div className="max-w-3xl mx-auto bg-gray-50/50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
           <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-brand-orange" />
           </div>
           
           <h3 className="text-2xl md:text-3xl font-bold text-gray-400 mb-4">
             Line-up em construção
           </h3>
           
           <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
             Estamos a preparar uma seleção incrível de oradores e keynotes para celebrar esta edição histórica.
           </p>

           <span className="inline-block bg-blue-50 text-brand-blue px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase">
             Novidades em Breve
           </span>
        </div>
      )}

      {/* --- MODO: LISTA DE SPEAKERS (Ativa automaticamente se houver dados) --- */}
      {hasSpeakers && (
        <div className="space-y-16">
          
          {/* KEYNOTES (Destaque) */}
          {keynotes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {keynotes.map((speaker, idx) => (
                <div key={idx} className="group relative w-full max-w-md text-center">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-6 shadow-xl">
                    <img 
                      src={speaker.image} 
                      alt={speaker.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-darkBlue/90 via-transparent to-transparent opacity-80"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 text-left">
                        <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                            Keynote
                        </span>
                        <h3 className="text-2xl font-bold text-white mb-1">{speaker.name}</h3>
                        <p className="text-gray-300 text-sm">{speaker.role} @ {speaker.company}</p>
                    </div>
                  </div>
                  {speaker.linkedin && (
                    <a href={speaker.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:underline">
                      <Linkedin className="w-4 h-4" /> Conectar
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SPEAKERS REGULARES (Grid) */}
          {regularSpeakers.length > 0 && (
            <div>
               {keynotes.length > 0 && <h3 className="text-2xl font-bold text-center text-brand-darkBlue mb-10">Oradores Convidados</h3>}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {regularSpeakers.map((speaker, idx) => (
                    <div key={idx} className="text-center group">
                      <div className="relative mb-4 overflow-hidden rounded-xl aspect-square shadow-md border border-gray-100">
                        <img 
                          src={speaker.image} 
                          alt={speaker.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                      </div>
                      <h4 className="font-bold text-lg text-brand-darkBlue">{speaker.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{speaker.role}</p>
                      <p className="text-xs text-brand-orange font-semibold uppercase tracking-wide mb-3">{speaker.company}</p>
                      
                      {speaker.linkedin && (
                        <a href={speaker.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors">
                          <Linkedin className="w-5 h-5 mx-auto" />
                        </a>
                      )}
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
};

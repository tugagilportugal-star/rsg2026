import React from 'react';
import { Section } from '../components/UIComponents';
import { Globe2, Mic, Users, Coffee, Rocket, Heart, BrainCircuit } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    { 
        icon: <Globe2 className="w-8 h-8 text-white" />, 
        title: "Keynotes Globais",
        desc: "Vozes que moldam o futuro da agilidade no mundo.",
        color: "bg-blue-500" 
    },
    { 
        icon: <BrainCircuit className="w-8 h-8 text-white" />, 
        title: "Workshops",
        desc: "Mão na massa. Esqueça a teoria, venha pela prática.",
        color: "bg-orange-500" 
    },
    { 
        icon: <Users className="w-8 h-8 text-white" />, 
        title: "Open Space",
        desc: "A agenda é sua. Discussões orgânicas e problemas reais.",
        color: "bg-indigo-500" 
    },
    { 
        icon: <Rocket className="w-8 h-8 text-white" />, 
        title: "Carreira & Futuro",
        desc: "Tendências de mercado, IA e novos papéis ágeis.",
        color: "bg-purple-500" 
    },
    { 
        icon: <Coffee className="w-8 h-8 text-white" />, 
        title: "Networking Intencional",
        desc: "Conexões que vão muito além da troca de cartões.",
        color: "bg-teal-500" 
    },
    { 
        icon: <Mic className="w-8 h-8 text-white" />, 
        title: "Talks Disruptivas",
        desc: "Ideias que desafiam o status quo das organizações.",
        color: "bg-pink-500" 
    },
    { 
        icon: <Heart className="w-8 h-8 text-white" />, 
        title: "Vibe Única",
        desc: "Um ambiente seguro, diverso e incrivelmente acolhedor.",
        color: "bg-red-500" 
    },
  ];

  return (
    <Section id="features" className="bg-gray-50 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6 tracking-tight">
          O que esperar em 2026?
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
          Esqueça os eventos corporativos tradicionais. Estamos a desenhar uma experiência <span className="text-brand-orange font-bold">visceral</span>, feita de pessoas para pessoas. 
          <br/><span className="text-brand-blue">Energia alta, impacto profundo.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100">
            <div className={`absolute top-0 left-0 w-full h-1 ${feature.color}`}></div>
            <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors">{feature.title}</h3>
            <p className="text-gray-600 font-medium leading-relaxed">
                {feature.desc}
            </p>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-50 rounded-tl-full -z-10 group-hover:bg-gray-100 transition-colors"></div>
          </div>
        ))}
        
        {/* Call to Action Card */}
        <div className="relative bg-brand-darkBlue rounded-2xl p-8 shadow-lg flex flex-col justify-center items-center text-center text-white overflow-hidden group">
            <div className="absolute inset-0 bg-brand-blue/20 group-hover:bg-brand-blue/30 transition-colors"></div>
            <h3 className="text-2xl font-bold mb-4 relative z-10">E muito mais...</h3>
            <p className="text-blue-100 mb-6 relative z-10">Surpresas que só quem estiver lá vai viver.</p>
            <button 
                onClick={() => document.getElementById('get-involved')?.scrollIntoView()}
                className="relative z-10 px-6 py-2 border-2 border-brand-orange text-brand-orange font-bold rounded-full hover:bg-brand-orange hover:text-white transition-colors"
            >
                Garanta o seu lugar
            </button>
        </div>
      </div>
    </Section>
  );
};

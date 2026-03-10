import React from 'react';
import { Section } from '../components/UIComponents';
import { Globe2, Mic, Users, Coffee, Rocket, Heart, BrainCircuit } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    { 
        icon: <Globe2 className="w-8 h-8 text-white" />, 
        title: "Keynotes Globais",
        desc: "Vozes que moldam o futuro da agilidade no mundo, trazendo tendências internacionais diretamente para Lisboa.",
        color: "bg-blue-500" 
    },
    { 
        icon: <Users className="w-8 h-8 text-white" />, 
        title: "Open Space",
        desc: "A agenda é sua. Discussões orgânicas e resolução de problemas reais.",
        color: "bg-orange-500" 
    },
    { 
        icon: <Rocket className="w-8 h-8 text-white" />, 
        title: "Inovação",
        desc: "Descubra novas formas de trabalho, ferramentas e frameworks que estão a revolucionar equipas de alta performance.",
        color: "bg-purple-500" 
    },
    { 
        icon: <Coffee className="w-8 h-8 text-white" />, 
        title: "Networking",
        desc: "Conecte-se com profissionais durante pausas pensadas para fomentar parcerias e trocas de experiências.",
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
        title: "Comunidade",
        desc: "Sinta a energia da comunidade TugÁgil. Um ambiente seguro, diverso e acolhedor para partilhar sucessos e vulnerabilidades.",
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
        <p className="text-xl md:text-2xl text-gray-600 max-w-5xl mx-auto font-medium leading-relaxed">
          Estamos a desenhar uma experiência<span className="text-brand-orange font-bold">feita de pessoas para pessoas</span>. 
          É muito mais do que um evento: é um <span className="text-brand-blue font-bold">catalisador de mudança</span> para a sua carreira e para a sua organização.
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
                onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative z-10 px-6 py-2 border-2 border-brand-orange text-brand-orange font-bold rounded-full hover:bg-brand-orange hover:text-white transition-colors"
            >
                Garanta o seu lugar
            </button>
        </div>
      </div>
    </Section>
  );
};

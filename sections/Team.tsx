import React from 'react';
import { Section } from '../components/UIComponents';
import { Linkedin } from 'lucide-react';

// Interface sem 'role', conforme ajustamos antes
interface TeamMember {
  name: string;
  image: string;
  linkedin: string;
}

export const Team: React.FC = () => {
  const team: TeamMember[] = [
    {
      name: "Raquel Bartz Alves",
      image: "https://ui-avatars.com/api/?name=Raquel+Bartz&background=003F59&color=fff&size=400", 
      linkedin: "https://www.linkedin.com/in/raquelbartz/" 
    },
    {
      name: "Sylvia Grec",
      image: "https://ui-avatars.com/api/?name=Sylvia+Grec&background=003F59&color=fff&size=400",
      linkedin: "#"
    },
    {
      name: "Marina Bittencourt",
      image: "https://ui-avatars.com/api/?name=Marina+Bittencourt&background=003F59&color=fff&size=400",
      linkedin: "#"
    },
    {
      name: "Fábio Castro",
      image: "https://ui-avatars.com/api/?name=Fabio+Castro&background=003F59&color=fff&size=400",
      linkedin: "#"
    },
    {
      name: "Cristiane Alves",
      image: "https://ui-avatars.com/api/?name=Cristiane+Alves&background=003F59&color=fff&size=400",
      linkedin: "#"
    },
    {
      name: "Alex Seles",
      image: "https://ui-avatars.com/api/?name=Alex+Seles&background=003F59&color=fff&size=400",
      linkedin: "#"
    }
  ];

  return (
    <Section id="team" className="bg-gray-50 border-t border-gray-200">
      <div className="text-center mb-16">
        <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs block mb-3">
          Quem faz acontecer
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-brand-darkBlue mb-4">
          Equipa Organizadora
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Voluntários apaixonados dedicados a trazer a melhor experiência de agilidade para Lisboa.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 max-w-5xl mx-auto">
        {team.map((member, idx) => (
          <div key={idx} className="group text-center w-36 md:w-48">
            
            {/* FOTO REDONDA COLORIDA */}
            <div className="relative mb-4 mx-auto w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border-4 border-white group-hover:border-brand-orange">
              {/* Removi a classe 'grayscale' daqui */}
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover transition-all duration-500"
              />
              
              {/* Overlay LinkedIn */}
              <a 
                href={member.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 bg-brand-darkBlue/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Linkedin className="w-8 h-8 text-white" />
              </a>
            </div>

            <h3 className="text-sm md:text-base font-bold text-brand-darkBlue mb-1 leading-tight px-2">
              {member.name}
            </h3>
          </div>
        ))}
      </div>
    </Section>
  );
};

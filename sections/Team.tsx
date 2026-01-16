import React from 'react';
import { Section } from '../components/UIComponents';
import { Linkedin } from 'lucide-react';

// Interface
interface TeamMember {
  name: string;
  image: string;
  linkedin: string;
}

export const Team: React.FC = () => {
  // Atualizei os links dos avatares para terem fundo branco e letras azuis
  // para simular o visual "clean" que pediu.
  const team: TeamMember[] = [
    {
      name: "Raquel Bartz Alves",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQHNYJcfE1tMgA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1723208803857?e=1770249600&v=beta&t=PwnNIeJY8i8Vn3py47Aqj97iqzpTuPqVGTchGbY9hls", 
      linkedin: "https://www.linkedin.com/in/raquelbartzalves/" 
    },
    {
      name: "Sylvia Grec",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQHywipy3ibcXw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729957721637?e=1770249600&v=beta&t=0ONjBDVWVEl2_EbPPHHIfofu-YFyaBHdrcyT1Nom7p4",
      linkedin: "https://www.linkedin.com/in/sylvia-grec/"
    },
    {
      name: "Marina Bittencourt",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQG9oIELLf4Dbg/profile-displayphoto-shrink_200_200/B4DZbGhns9GwAY-/0/1747087425210?e=1770249600&v=beta&t=i2EpuqSl3x6syZD557WkFv1lzzGH2t4PuBL8_c6WQ74",
      linkedin: "https://www.linkedin.com/in/marinarosabittencourt/"
    },
    {
      name: "Fábio Castro",
      image: "https://media.licdn.com/dms/image/v2/C4D03AQE1SYdxYjYsRw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1625589311192?e=1770249600&v=beta&t=bquxs1CeiJtf-IAiMpJ44q0TwGACUnL8G2AI9grF1jE",
      linkedin: "https://www.linkedin.com/in/frmcastro/"
    },
    {
      name: "Cristiane Alves",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQFZkXbThpxVNA/profile-displayphoto-scale_200_200/B4DZlYAQ2mHwAY-/0/1758118088750?e=1770249600&v=beta&t=aqin8h9qT6rF5BeN57Q3lK_HNK5xcw_L-TjioYSTDPA",
      linkedin: "https://www.linkedin.com/in/cristiane-mendes-alves-pmp%C2%AE-psm-i-psk-i-okrcp-5a243b4/"
    },
    {
      name: "Alex Seles",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQEUBcD8_Ixbew/profile-displayphoto-scale_200_200/B4DZrL0YB9IkAY-/0/1764356097405?e=1770249600&v=beta&t=t00duNRQQ4pTqNJ1o4V47AsgxxK34NLKFRYvV2FXVDo",
      linkedin: "https://www.linkedin.com/in/alex-seles/"
    }
  ];

  return (
    <Section id="team" className="bg-gray-50 border-t border-gray-200">
      <div className="text-center mb-16">
        <span className="text-brand-orange font-bold tracking-[0.2em] uppercase text-xs block mb-3">
          Quem faz acontecer o RSG Lisbon 2026
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-brand-darkBlue mb-4">
          Equipa Organizadora
        </h2>
        {/* Frase Atualizada */}
        <p className="text-gray-500 max-w-2xl mx-auto">
          Voluntários apaixonados dedicados a trazer a melhor experiência de agilidade e inovação para Lisboa.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 max-w-5xl mx-auto">
        {team.map((member, idx) => (
          <div key={idx} className="group text-center w-36 md:w-48">
            
            {/* 
               FOTO REDONDA 
               - bg-white: Fundo branco
               - border-brand-blue: Borda Azul da marca
            */}
            <div className="relative mb-4 mx-auto w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border-[3px] border-brand-blue bg-white">
              
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
                className="absolute inset-0 bg-brand-darkBlue/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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

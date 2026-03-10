import React from 'react';
import { Section } from '../components/UIComponents';
import { Target, TrendingUp, Users, Lightbulb, CheckCircle2, Globe2 } from 'lucide-react';

export const WhyAttend: React.FC = () => {
  
  const audience = [
    {
      role: "Agile Coaches & Scrum Masters",
      goal: "Que procuram ir além da equipa e influenciar a organização a nível sistémico."
    },
    {
      role: "Líderes & Executivos",
      goal: "Que precisam de alinhar estratégia com execução e navegar a era da IA."
    },
    {
      role: "Product Managers & Owners",
      goal: "Focados em deixar de gerir tickets para começar a gerir valor e fluxo."
    },
    {
      role: "Consultores de Transformação",
      goal: "Que buscam novas ferramentas para desbloquear resistências culturais."
    }
  ];

  const reasons = [
    {
      icon: <Globe2 className="w-6 h-6 text-brand-blue" />,
      title: "Network",
      desc: "Não é apenas networking. É conectar-se com uma comunidade que partilha os mesmos desafios complexos que você."
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-brand-orange" />,
      title: "Insights Acionáveis",
      desc: "Teoria sem prática é apenas filosofia. Saia com ferramentas aplicáveis no seu dia a dia (Flight Levels, Team Topologies, AI Strategy)."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: "Carreira à Prova de Futuro",
      desc: "Num mercado em retração, o conhecimento em IA, Liderança Adaptativa e Eficiência de Fluxo é o maior diferencial competitivo que pode ter."
    }
  ];

  return (
    <Section className="bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* COLUNA DA ESQUERDA: QUEM DEVE IR */}
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6 leading-tight">
              Para quem é este evento
            </h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              O RSG Lisbon não é para quem procura receitas mágicas. É para profissionais que querem elevar o nível da agilidade e criar impacto real nas suas organizações.
            </p>

            <div className="space-y-6">
              {audience.map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue group-hover:text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-darkBlue text-lg">{item.role}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.goal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUNA DA DIREITA: PORQUÊ PARTICIPAR (Cards) */}
          <div className="relative">
            {/* Elemento Decorativo de Fundo */}
            <div className="absolute inset-0 bg-gray-50 rounded-[40px] -rotate-3 transform scale-95 -z-10"></div>
            
            <div className="bg-brand-darkBlue rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                {/* Círculo decorativo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <h3 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
                   Por que participar do RSG Lisbon 2026?
                </h3>

                <div className="space-y-8">
                    {reasons.map((reason, idx) => (
                        <div key={idx} className="flex gap-5">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
                                {reason.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">{reason.title}</h4>
                                <p className="text-blue-100/70 text-sm leading-relaxed">
                                    {reason.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
};

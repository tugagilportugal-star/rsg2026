import React from 'react';
import { Section } from '../components/UIComponents';
import { Check, Info, Sparkles, Tag, Gift } from 'lucide-react';

interface TicketsProps {
  onOpenTicketModal: () => void;
}

export const Tickets: React.FC<TicketsProps> = ({ onOpenTicketModal }) => {
  
  // Transformámos a propriedade 'text' para aceitar elementos React (links) em vez de apenas texto simples
  const ticketBenefits: { text: React.ReactNode; isBonus: boolean }[] =[
    { text: "Acesso completo ao evento", isBonus: false },
    { text: "Kit de Boas-vindas + T-Shirt Oficial", isBonus: false },
    { text: "Coffee breaks premium", isBonus: false },
    { text: "Scrum Education Units (SEUs)", isBonus: false },
    { text: "Certificado de Participação Digital", isBonus: false },
    { text: "Acesso à gravação do evento*", isBonus: false },
    { 
      text: (
        <>
          1 ano de <a href="https://www.agile-academy.com/pt/e-learning/#elearning-overview" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-300 hover:decoration-brand-orange hover:text-brand-orange transition-colors">Agile Academy</a> (Valor real: ~€299)
        </>
      ), 
      isBonus: true 
    },
    { 
      text: (
        <>
          Acesso anual ao plano Essentials da plataforma <a href="https://kanban.plus/" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-300 hover:decoration-brand-orange hover:text-brand-orange transition-colors">Kanban+</a> (Valor real: ~€140)
        </>
      ), 
      isBonus: true 
    }
  ];

  return (
    <Section id="tickets" className="bg-gray-50 py-24 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6 tracking-tight">
          Garanta o seu lugar
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Participe na maior celebração da agilidade em Portugal. 
          Preço exclusivo para os primeiros inscritos.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-brand-orange relative transform hover:-translate-y-1 transition-transform duration-300">
          
          {/* Badge "Lote 1" */}
          <div className="absolute top-0 right-0">
             <div className="bg-brand-orange text-white text-xs font-black uppercase py-1 px-8 transform rotate-45 translate-x-8 translate-y-4 shadow-sm">
                Lote 1
             </div>
          </div>

          <div className="p-8 md:p-10 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" />
                Early Bird
            </div>

            <div className="flex flex-col items-center justify-center mb-2">
                <span className="text-5xl md:text-6xl font-black text-brand-darkBlue tracking-tight">
                    42,80€
                </span>
            </div>
            
            {/* Lista de Benefícios */}
            <ul className="space-y-4 text-left mb-8">
                {ticketBenefits.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${item.isBonus ? 'bg-brand-orange/10' : 'bg-brand-blue/10'}`}>
                            {/* Troca de ícone e cor caso seja Bónus */}
                            {item.isBonus ? (
                                <Gift className="w-3 h-3 text-brand-orange stroke-[3]" />
                            ) : (
                                <Check className="w-3 h-3 text-brand-blue stroke-[3]" />
                            )}
                        </div>
                        <span className={`text-sm leading-snug ${item.isBonus ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                            {item.text}
                        </span>
                    </li>
                ))}
            </ul>

            <button 
                onClick={onOpenTicketModal}
                className="w-full bg-brand-orange text-white font-black text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Comprar Bilhete
                <Tag className="w-5 h-5" />
            </button>
            
            {/* Notas Legais e Disclaimers */}
            <div className="mt-6 text-left space-y-3 border-t border-gray-100 pt-4">
                <p className="text-[10px] text-gray-400 leading-tight">
                    <span className="text-gray-500 font-bold">*</span> Acesso à gravação disponível por +€10,00 no momento da compra.
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">
                    <span className="text-gray-500 font-bold">**</span> Os bónus exclusivos (Agile Academy e Kanban+) são ativados diretamente pelo participante após o evento. <span className="font-semibold text-gray-500">Zero partilha de dados</span> da nossa parte, garantindo a sua total privacidade.
                </p>
            </div>
          </div>
        </div>

        {/* Efeito de "Sombra" colorida atrás */}
        <div className="absolute -inset-4 bg-gradient-to-b from-brand-orange/20 to-brand-blue/20 rounded-[2.5rem] blur-xl -z-10"></div>
      </div>
      
      {/* Disclaimer Fatura */}
      <div className="text-center mt-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
         <Info className="w-4 h-4" />
         <span>Fatura com contribuinte disponível no momento da compra.</span>
      </div>

    </Section>
  );
};

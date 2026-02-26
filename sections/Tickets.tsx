import React from 'react';
import { Section } from '../components/UIComponents';
import { Check, Info, Sparkles, Tag } from 'lucide-react';

export const Tickets: React.FC = () => {
  
  // Função temporária para simular a compra levando à Waitlist/Formulário
  const handleBuy = () => {
    const waitlistElement = document.getElementById('waitlist');
    if (waitlistElement) {
        waitlistElement.scrollIntoView({ behavior: 'smooth' });
        // Opcional: focar no campo de nome
        setTimeout(() => document.getElementById('name')?.focus(), 800);
    }
  };

  return (
    <Section id="tickets" className="bg-gray-50 py-24 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-brand-darkBlue mb-6 tracking-tight">
          Garante o teu lugar
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Participe de uma das maiores celebrações da agilidade em Portugal. 
          Preço exclusivo para os primeiros inscritos.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-brand-orange relative transform hover:-translate-y-1 transition-transform duration-300">
          
          {/* Badge "Lote 1" (Estilo "Ahora" do benchmark) */}
          <div className="absolute top-0 right-0">
             <div className="bg-brand-orange text-white text-xs font-black uppercase py-1 px-8 transform rotate-45 translate-x-8 translate-y-4 shadow-sm">
                Lote 1
             </div>
          </div>

          <div className="p-8 md:p-10 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" />
                Early Bird Ticket
            </div>

            <div className="flex flex-col items-center justify-center mb-2">
                <span className="text-5xl md:text-6xl font-black text-brand-darkBlue tracking-tight">
                    42,80€
                </span>
                <span className="text-gray-400 font-medium text-sm mt-1">
                    + IVA (23%)
                </span>
            </div>

            {/* Lista de Benefícios */}
            <ul className="space-y-4 text-left mb-10">
                {[
                    "Acesso completo ao evento",
                    "Kit de Boas-vindas + T-Shirt Oficial",
                    "Coffee Break Premium",
                    "Scrum Education Units (SEUs) by Scrum Alliance", // Benefício Extra 1
                    "Certificado de Participação Digital" // Benefício Extra 2
                ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue/10 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-brand-blue stroke-[3]" />
                        </div>
                        <span className="text-gray-600 text-sm font-medium">{item}</span>
                    </li>
                ))}
            </ul>

            <button 
                onClick={handleBuy}
                className="w-full bg-brand-orange text-white font-black text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Comprar Bilhete
                <Tag className="w-5 h-5" />
            </button>
            
            </p>
          </div>
        </div>

        {/* Efeito de "Sombra" colorida atrás */}
        <div className="absolute -inset-4 bg-gradient-to-b from-brand-orange/20 to-brand-blue/20 rounded-[2.5rem] blur-xl -z-10"></div>
      </div>
      
      {/* Disclaimer IVA */}
      <div className="text-center mt-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
         <Info className="w-4 h-4" />
         <span>Fatura com contribuinte disponível no momento da compra.</span>
      </div>

    </Section>
  );
};

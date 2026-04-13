import React, { useState } from 'react';
import { Section } from '../components/UIComponents';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ: React.FC<{ onOpenTicketModal: () => void }> = ({ onOpenTicketModal }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqData =[
        {
            question: "Qual o valor dos ingressos?",
            answer: (
                <>
                    Os bilhetes já se encontram disponíveis para compra online! Pode consultar os valores e garantir o seu lugar{' '}
                    <button onClick={onOpenTicketModal} className="text-brand-blue font-bold hover:underline">aqui</button>.
                    <br/><br/>
                    Se pretende trazer a sua equipa ou posicionar a sua empresa num dos maiores eventos de agilidade em Portugal, oferecemos condições especiais para compras em lote e pacotes de patrocínio. Envie-nos uma mensagem através da{' '}
                    <button onClick={() => document.getElementById('sponsors')?.scrollIntoView({ behavior: 'smooth' })} className="text-brand-blue font-bold hover:underline">secção de parcerias</button> 
                    {' '}ou um e-mail diretamente para <a href="mailto:tuga@tugagil.com" className="text-brand-orange font-bold hover:underline">tuga@tugagil.com</a>. Teremos todo o gosto em lhe apresentar nossas condições e desenhar o que melhor enquadra para a sua organização.
                </>
            )
        },
        {
            question: "Existem descontos para membros da Scrum Alliance?",
            answer: "Sim! Os membros ativos da Scrum Alliance têm direito a um desconto exclusivo de 10% no valor do bilhete. O código promocional é partilhado diretamente através das comunicações oficiais da Scrum Alliance. Basta inserir o código no campo indicado durante o processo de compra, aqui no site oficial."
        },
        {
            question: "Onde será o evento?",
            answer: "O evento terá lugar no Auditório Alto dos Moinhos, na vibrante cidade de Lisboa. Escolhemos este espaço para unir a energia de um dos maiores ecossistemas tecnológicos da Europa à máxima conveniência para os nossos participantes: tem a Linha Azul do metro literalmente à porta e facilidade de estacionamento nas imediações."
        },
        {
            question: "Qual a data do evento?",
            answer: "21 de Maio de 2026. Reserve na sua agenda!"
        },
        {
            question: "O evento será em inglês ou português?",
            answer: "Como um evento internacional, teremos sessões em ambos os idiomas. O RSG Lisbon preza pela multiculturalidade, por isso espere keynotes globais em inglês, mas também trilhas e talks locais em português."
        },
        {
            question: "Para quem é este evento?",
            answer: "Para Scrum Masters, Agile Coaches, Product Managers e Owners, Líderes, Executivos e Consultores de Transformação. Acima de tudo, o RSG Lisbon é o espaço ideal para qualquer pessoa apaixonada por transformação organizacional, inovação e novas formas de trabalho, que procure elevar o nível da agilidade e criar um impacto real nas suas organizações."
        }
    ];

    return (
        <Section id="faq" className="bg-brand-darkBlue">
            <h2 className="text-3xl font-bold text-center text-white mb-12">Perguntas Frequentes</h2>
            <div className="max-w-3xl mx-auto space-y-4">
                {faqData.map((item, index) => (
                    <div key={index} className="border border-white/20 rounded-lg overflow-hidden">
                        <button
                            className="w-full flex justify-between items-center p-5 text-left bg-white/10 hover:bg-white/20 transition-colors focus:outline-none"
                            onClick={() => toggleAccordion(index)}
                        >
                            <span className="font-semibold text-white">{item.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-brand-orange flex-shrink-0 ml-4" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-white/60 flex-shrink-0 ml-4" />
                            )}
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out ${
                                openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="p-5 bg-white/5 text-blue-100 leading-relaxed border-t border-white/10">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

import React, { useState } from 'react';
import { Section } from '../components/UIComponents';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
    {
        question: "Qual o valor dos ingressos?",
        answer: "Os valores ainda não estão definidos, mas inscreva-se na nossa Waitlist para manter-se informado(a), ser notificado(a) primeiro e ter acesso a condições especiais antes da abertura oficial das vendas."
    },
    {
        question: "Existem descontos para membros da Scrum Alliance?",
        answer: "Sim. Membros da Scrum Alliance têm direito a um desconto exclusivo de 10% no valor do ingresso. O código promocional e as instruções para aplicar o desconto serão disponibilizados no momento da abertura das inscrições."
    },
    {
        question: "Onde será o evento?",
        answer: "Na vibrante cidade de Lisboa! Estamos neste momento a escolher um local que forneça a estrutura adequada para fornecer uma experiência incrível para todos, com fácil acesso via transporte público ou carro, e com uma infraestrutura moderna."
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
        answer: "Scrum Masters, Product Owners, Agile Coaches, Líderes, Desenvolvedores. Acima de tudo, o RSG Lisbon é para qualquer pessoa interessada em transformação organizacional, inovação e novas formas de trabalho."
    }
];

export const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Section id="faq" className="bg-white border-t border-gray-100">
            <h2 className="text-3xl font-bold text-center text-brand-darkBlue mb-12">Perguntas Frequentes</h2>
            <div className="max-w-3xl mx-auto space-y-4">
                {faqData.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            className="w-full flex justify-between items-center p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
                            onClick={() => toggleAccordion(index)}
                        >
                            <span className="font-semibold text-gray-800">{item.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-brand-orange" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out ${
                                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="p-5 bg-white text-gray-600 leading-relaxed border-t border-gray-200">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

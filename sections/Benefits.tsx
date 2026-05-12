import React from 'react';
import { Section } from '../components/UIComponents';
import { Gift, Database, GraduationCap, Mail, Ticket } from 'lucide-react';

export const BenefitsPage: React.FC = () => {
  return (
    <div className="pt-20">
      <Section id="benefits-hero" className="bg-brand-darkBlue text-white py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">
            Benefícios Exclusivos
          </h1>
          <p className="text-xl text-gray-300">
            Como participante do RSG Lisbon 2026, tens acesso a ofertas especiais dos nossos parceiros para continuares a tua jornada de aprendizagem.
          </p>
        </div>
      </Section>

      <Section id="benefits-grid" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARD AGILE ACADEMY */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-colors">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="text-brand-blue w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Agile Academy</h3>
            <p className="text-gray-600 mb-6 flex-grow">
              1 ano de acesso gratuito à suite premium de e-learning. Inclui Masterclasses de Product Owner, Scrum Master e muito mais.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-sm font-bold uppercase text-gray-500 mb-2">Como ativar:</p>
              <p className="text-sm text-gray-700">Envia um e-mail para <strong>team@agile-academy.com</strong> com o assunto "Agile Academy Gift + RSG Lisbon" e o teu nome completo e e-mail.</p>
            </div>
            <a href="https://www.agile-academy.com/pt/" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-6 rounded-full border-2 border-brand-blue text-brand-blue font-bold text-center hover:bg-blue-50 transition-colors">
              Visitar Site
            </a>
          </div>

          {/* CARD KANBAN+ */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-colors">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
              <Database className="text-brand-orange w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Kanban Plus</h3>
            <p className="text-gray-600 mb-6 flex-grow">
              Plataforma completa com FlowMetrics, FlowBoards e modelos de maturidade Evolve.
            </p>
            <div className="bg-brand-orange/10 border border-brand-orange/20 p-4 rounded-xl mb-6">
              <p className="text-sm font-bold uppercase text-brand-orange mb-2">Acesso ao Voucher:</p>
              <p className="text-sm text-gray-800 font-medium text-center italic">
                "O código de acesso exclusivo será anunciado e distribuído durante o dia do evento."
              </p>
            </div>
            <a href="https://kanban.plus/" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-6 rounded-full border-2 border-brand-orange text-brand-orange font-bold text-center hover:bg-orange-50 transition-colors">
              Saber Mais
            </a>
          </div>

          {/* CARD MASTERCLASS */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-colors">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <Ticket className="text-purple-600 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Masterclass Pais & Caroli</h3>
            <p className="text-gray-600 mb-6 flex-grow">
              10% de desconto acumulável na Masterclass "Combining Team Topologies, Team OKRs and Lean Inception".
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-sm font-bold uppercase text-gray-500 mb-2">Como obter o desconto:</p>
              <p className="text-sm text-gray-700 font-medium">Apresenta o teu comprovativo de inscrição no RSG Lisbon 2026 aos autores.</p>
            </div>
            <a href="https://caroli.org/agenda/" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-6 rounded-full border-2 border-gray-300 text-gray-700 font-bold text-center hover:bg-gray-100 transition-colors"> 
            Ver Detalhes
            </a>
          </div>

        </div>
      </Section>
    </div>
  );
};
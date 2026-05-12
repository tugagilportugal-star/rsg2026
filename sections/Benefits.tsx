import React from 'react';
import { ArrowLeft, GraduationCap, Database, Ticket, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BenefitsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Botão Flutuante para Voltar */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-50 bg-brand-darkBlue text-white p-3 rounded-full shadow-lg hover:bg-brand-orange transition-all flex items-center gap-2 group"
      >
        <ArrowLeft size={20} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold uppercase text-xs">
          Voltar para Home
        </span>
      </Link>

      {/* HERO DA PÁGINA */}
      <section className="bg-brand-darkBlue py-24 text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Benefícios Exclusivos
          </h1>
          <p className="text-xl text-gray-400">
            Ofertas especiais para os participantes do RSG Lisbon 2026.
          </p>
        </div>
      </section>

      {/* GRID DE CARDS */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARD AGILE ACADEMY */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-all group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 transition-colors">
              <GraduationCap className="text-brand-blue w-8 h-8 group-hover:text-brand-orange" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Agile Academy</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="line-through text-gray-400 text-lg">€249</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Grátis</span>
            </div>
            <p className="text-gray-600 mb-6 flex-grow">
              Um ano de acesso gratuito à suite premium de e-learning com masterclasses de Product Owner, Agile Leader e Scrum Master.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Como ativar:</p>
              <p className="text-gray-700">Envia um e-mail para <strong>team@agile-academy.com</strong> com o assunto "Agile Academy Gift + RSG Lisbon".</p>
            </div>
            <a href="https://www.agile-academy.com/pt/" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-6 rounded-full border-2 border-brand-blue text-brand-blue font-bold text-center hover:bg-brand-blue hover:text-white transition-all">
              Visitar Site
            </a>
          </div>

          {/* CARD KANBAN+ */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-all group">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 transition-colors">
              <Database className="text-brand-orange w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Kanban Plus</h3>
            <p className="text-gray-600 mb-6 flex-grow mt-4">
              Acesso a FlowMetrics, FlowBoards e modelos de maturidade para gestão de fluxo de trabalho.
            </p>
            <div className="bg-brand-orange/5 border border-brand-orange/20 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-800 font-medium text-center italic">
                "O código de acesso exclusivo será anunciado durante no dia do evento."
              </p>
            </div>
            <a href="https://kanban.plus/" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-6 rounded-full border-2 border-brand-orange text-brand-orange font-bold text-center hover:bg-brand-orange hover:text-white transition-all">
              Saiba Mais
            </a>
          </div>

          {/* CARD MASTERCLASS */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-all group">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 transition-colors">
              <Ticket className="text-purple-600 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Masterclass Manuel Pais & Paulo Caroli</h3>
            <p className="text-gray-600 mb-6 flex-grow">
              10% de desconto acumulável na Masterclass "Combining Team Topologies, Team OKRs and Lean Inception". A Masterclass será em Lisboa, no dia seguinte ao RSG Lisbon, no dia 22 de Maio de 2026.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
              <p className="font-bold text-gray-500 uppercase text-xs mb-1">Como obter:</p>
              <p className="text-gray-700">Apresenta o teu comprovativo de inscrição no RSG Lisbon aos autores.</p>
            </div>
            <a href="https://caroli.org/agenda/" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-6 rounded-full bg-brand-darkBlue text-white font-bold text-center hover:bg-brand-orange transition-all">
              Detalhes Masterclass
            </a>
          </div>

        </div>
      </section>
    </div>
  );
};
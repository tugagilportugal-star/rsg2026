import React from 'react';
import { ArrowLeft, GraduationCap, Database, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BenefitsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Botão Flutuante */}
      <Link to="/" className="fixed top-10 right-10 z-50 bg-brand-orange text-white py-3 px-6 rounded-full shadow-xl hover:bg-brand-darkBlue transition-all flex items-center gap-2 font-bold"
>
  <ArrowLeft size={20} />
  <span>Voltar para Home</span>
</Link>

      {/* Hero Section */}
      <section className="bg-brand-darkBlue py-24 text-white px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
          Benefícios Exclusivos
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Benefícios exclusivos para os participantes do Regional Scrum Gathering Lisbon 2026 para potencializar a tua jornada de aprendizagem e evolução contínua.
        </p>
      </section>

      {/* Grid de Benefícios */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARD AGILE ACADEMY */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-all group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 transition-colors">
              <GraduationCap className="text-brand-blue w-8 h-8 group-hover:text-brand-orange" />
            </div>
            <div className="min-h-[80px] flex flex-col justify-start">
            <h3 className="text-2xl font-bold mb-2">Agile Academy</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="line-through text-gray-400 text-lg">€249</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Grátis</span>
            </div>
            </div>

            <p className="text-gray-600 mb-6 flex-grow">
              1 ano de acesso gratuito à suite premium de e-learning com masterclasses de Product Owner, Agile Leader e Scrum Master.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
              <p className="font-bold text-gray-500 uppercase text-[10px] mb-1 tracking-wider">Como ativar:</p>
              <p className="text-gray-700 leading-tight">
                Envia e-mail para <strong>team@agile-academy.com</strong> com o assunto "Agile Academy Gift + RSG Lisbon" com o teu nome completo e e-mail.
              </p>
            </div>
            <a href="https://www.agile-academy.com/pt/" target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-full border-2 border-brand-blue text-brand-blue font-bold text-center hover:bg-brand-blue hover:text-white transition-all text-sm uppercase">
              Visitar Site
            </a>
          </div>

          {/* CARD KANBAN+ */}
<div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-all group">
  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 transition-colors">
    <Database className="text-brand-orange w-8 h-8" />
  </div>
  <div className="min-h-[80px] flex flex-col justify-start">
  <h3 className="text-2xl font-bold mb-2">Kanban Plus</h3>
  <div className="flex items-center gap-2 mb-4">
    <span className="line-through text-gray-400 text-lg">€19,50</span>
    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Grátis</span>
  </div>
  </div>

  <p className="text-gray-600 mb-6 flex-grow">
    1 mês de acesso gratuito à plataforma Kanban+ no plano <strong>Enterprise Transformation</strong>. Inclui FlowMetrics, FlowBoards e modelos de maturidade Evolve.
  </p>

  <div className="bg-brand-orange/5 border border-brand-orange/20 p-4 rounded-xl mb-6">
    <p className="text-sm text-gray-800 font-medium text-center italic leading-relaxed">
      "O código de acesso será informado durante o evento. Esteja atento(a)!"
    </p>
  </div>

  <a 
    href="https://kanban.plus/" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="w-full py-3 rounded-full border-2 border-brand-orange text-brand-orange font-bold text-center hover:bg-brand-orange hover:text-white transition-all text-sm uppercase"
  >
    Saiba Mais
  </a>
</div>

          {/* CARD MASTERCLASS */}
          <div className="border-2 border-gray-100 rounded-3xl p-8 flex flex-col h-full hover:border-brand-orange transition-all group">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 transition-colors">
              <Ticket className="text-purple-600 w-8 h-8" />
            </div>
            <div className="min-h-[80px] flex flex-col justify-start">
            <h3 className="text-2xl font-bold mb-4">Masterclass Manuel Pais & Paulo Caroli</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="line-through text-gray-400 text-lg">€182</span>
    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">163,80€</span>
  </div>
  </div>
            <p className="text-gray-600 mb-6 flex-grow">
              10% de desconto acumulável na Masterclass Combining Team Topologies, Team OKRs & Lean Inception. O evento acontecerá em Lisboa, no dia seguinte ao RSG Lisbon 2026, no dia 22 de Maio de 2026.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
              <p className="font-bold text-gray-500 uppercase text-[10px] mb-1 tracking-wider">Como obter:</p>
              <p className="text-gray-700 leading-tight">Para garantir o teu desconto exclusivo, apresenta o teu comprovativo de inscrição do RSG Lisbon 2026 aos autores.</p>
            </div>
            <a href="https://ti.to/manuel-filipe-nunes-pais/pais-caroli-masterclass-onsite-may-2026" target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-full border-2 border-brand-darkBlue text-brand-darkBlue font-bold text-center hover:bg-brand-darkBlue hover:text-white transition-all text-sm uppercase">
              Detalhes Masterclass
            </a>
          </div>

        </div>
      </section>
    </div>
  );
};
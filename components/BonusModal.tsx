import React from 'react';
import { X, Gift, ShieldCheck, ExternalLink, GraduationCap, LayoutDashboard } from 'lucide-react';
interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusModal: React.FC<BonusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-darkBlue/80 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white pt-8 px-8 pb-4 z-10 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-brand-orange/10 p-2 rounded-lg">
              <Gift className="text-brand-orange w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-brand-darkBlue tracking-tight">Bónus Exclusivos</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Como participante do <strong>RSG Lisbon 2026</strong>, a sua jornada não termina no evento. Preparámos um ecossistema de aprendizagem contínua para elevar a sua carreira.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Bloco Agile Academy */}
            <div className="flex flex-col p-6 rounded-3xl bg-blue-50 border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="text-brand-blue w-6 h-6" />
                  <h3 className="font-black text-brand-darkBlue text-xl">Agile Academy</h3>
                </div>
              </div>
              
              <div className="mb-4 inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-blue-100 self-start">
                <span className="text-gray-400 line-through text-xs font-bold">249€</span>
                <span className="text-green-600 text-xs font-black">FREE</span>
              </div>

              <p className="text-sm text-gray-600 mb-6 flex-grow">
                Acesso ilimitado à biblioteca de E-Learning de uma das academias mais prestigiadas da Europa. Conteúdos ministrados por instrutores certificados pela <strong>Scrum Alliance</strong> e <strong>Kanban University</strong>.
              </p>
              
              <ul className="space-y-2 mb-6 text-xs font-bold text-brand-blue uppercase tracking-wider">
                <li>• 1 Ano de Assinatura Gratuita</li>
                <li>• Cursos de Scrum, Kanban e Liderança</li>
              </ul>
              
              <a href="https://www.agile-academy.com/pt/e-learning/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white text-brand-blue border border-brand-blue/20 py-3 rounded-xl font-bold text-sm hover:bg-brand-blue hover:text-white transition-all">
                Conhecer Cursos <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Bloco Kanban+ */}
            <div className="flex flex-col p-6 rounded-3xl bg-orange-50 border border-orange-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="text-brand-orange w-6 h-6" />
                  <h3 className="font-black text-brand-darkBlue text-xl">Kanban+</h3>
                </div>
              </div>

              <div className="mb-4 inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-orange-100 self-start">
                <span className="text-gray-400 line-through text-xs font-bold">85€</span>
                <span className="text-green-600 text-xs font-black">FREE</span>
              </div>

              <p className="text-sm text-gray-600 mb-6 flex-grow">
                O ecossistema definitivo para praticantes do Método Kanban. Uma plataforma centralizada com recursos exclusivos para otimizar fluxos de trabalho e eficiência de equipas.
              </p>
              
              <ul className="space-y-2 mb-6 text-xs font-bold text-brand-orange uppercase tracking-wider">
                <li>• 1 Ano de Acesso Gratuito</li>
                <li>• Biblioteca de Conteúdo & Ferramentas</li>
              </ul>
              
              <a href="https://kanban.plus/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white text-brand-orange border border-brand-orange/20 py-3 rounded-xl font-bold text-sm hover:bg-brand-orange hover:text-white transition-all">
                Explorar Plataforma <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

          {/* Rodapé de Privacidade */}
          <div className="mt-10 p-4 bg-gray-50 rounded-2xl flex items-start gap-4 border border-gray-100">
            <ShieldCheck className="text-green-600 w-10 h-10 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Privacidade dos Dados</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Os bónus são ativados diretamente por si após o evento. O <strong>TugÁgil</strong>, organizador do <strong>RSG Lisbon 2026</strong>, não partilha os seus dados com terceiros, garantindo total controlo sobre a sua ativação e privacidade.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-0">
          <button onClick={onClose} className="w-full bg-brand-darkBlue text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-blue transition-colors shadow-lg">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
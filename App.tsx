import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Program } from './sections/Program';
import { WhyAttend } from './sections/WhyAttend';
import { Tickets } from './sections/Tickets';
import { Sponsors } from './sections/Sponsors';
import { Speakers } from './sections/Speakers';
import { GetInvolved, SponsorForm, SupporterForm } from './sections/GetInvolved';
import { Recap } from './sections/Recap';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Team } from './sections/Team';
import { Modal, SuccessState } from './components/UIComponents';
import { AdminView } from './components/AdminView';
import { Settings } from 'lucide-react';
import { TicketPurchaseModal } from './components/TicketPurchaseModal';
import { TicketStatusProvider } from './hooks/useTicketStatus';

const App: React.FC = () => {
  const[isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const[isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const isAdminRoute = window.location.pathname === '/admin';

  if (!isAdminRoute && window.location.hash.includes('access_token=')) {
    window.location.replace('/admin' + window.location.hash);
    return null;
  }

  if (isAdminRoute) {
    return <AdminView onClose={() => { window.location.href = '/'; }} />;
  }

  const checkUrl = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setSuccessModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (query.get('canceled')) {
      alert('A compra foi cancelada.');
    }
  }, []);

  useEffect(() => {
    checkUrl();
  },[checkUrl]);

  // Função simplificada para abrir o modal sem repetir código
  const openTicket = () => setTicketModalOpen(true);

  return (
    <TicketStatusProvider>
      <div className="bg-white">
        <Navbar onOpenTicketModal={openTicket} />

        <main>
          <Hero onOpenTicketModal={openTicket} />
          <About />
          <Features onOpenTicketModal={openTicket} />
          <Program onOpenTicketModal={openTicket} />
          <WhyAttend />
          <Tickets onOpenTicketModal={openTicket} />
          <Speakers />
          <Recap onOpenTicketModal={openTicket} />
          <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
          <FAQ onOpenTicketModal={openTicket} />
          <Team />
        </main>

        <Footer />

        {/* Botão Admin Escondido */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => (window.location.href = '/admin')}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-darkBlue hover:text-white flex items-center justify-center transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Modals Secundários */}
        <Modal isOpen={isSponsorModalOpen} onClose={() => setSponsorModalOpen(false)} title="Patrocinador">
          <SponsorForm />
        </Modal>

        <Modal isOpen={isSupporterModalOpen} onClose={() => setSupporterModalOpen(false)} title="Apoiador">
          <SupporterForm />
        </Modal>

        <Modal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} title="Pagamento Confirmado!">
          <SuccessState message="O seu bilhete está garantido! Você receberá um e-mail com o QR Code e a fatura em breve." />
        </Modal>

        {/* Modal CUSTOMIZADO para a Venda de Bilhetes (Tamanho corrigido: max-w-2xl) */}
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Fundo escuro */}
            <div className="fixed inset-0 transition-opacity bg-brand-darkBlue/80 backdrop-blur-sm" onClick={() => setTicketModalOpen(false)}></div>
            
            {/* Caixa do formulário com tamanho ajustado */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              <button onClick={() => setTicketModalOpen(false)} className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-gray-500 hover:bg-brand-darkBlue hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="overflow-y-auto p-6 md:p-8 w-full">
                <TicketPurchaseModal />
              </div>

            </div>
          </div>
        )}

      </div>
    </TicketStatusProvider>
  );
};

export default App;
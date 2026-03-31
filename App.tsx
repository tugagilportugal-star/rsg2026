import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';

import { Navbar } from './components/NavBar';
import { TicketStatusProvider } from './hooks/useTicketStatus';
import { Modal, SuccessState } from './components/UIComponents';
import { AdminView } from './components/AdminView';
import { TicketPurchaseModal } from './components/TicketPurchaseModal';

import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Speakers } from './sections/Speakers';
import { Sponsors } from './sections/Sponsors';
import { Recap } from './sections/Recap';
import { Tickets } from './sections/Tickets';
import { GetInvolved, SponsorForm, SupporterForm } from './sections/GetInvolved';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Team } from './sections/Team';
import { Program } from './sections/Program';
import { WhyAttend } from './sections/WhyAttend';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const isAdminRoute = window.location.pathname === '/admin';

  // After Google OAuth, Supabase redirects to site root with #access_token in the hash.
  // Detect this and redirect to /admin so the AdminView can process the token.
  if (!isAdminRoute && window.location.hash.includes('access_token=')) {
    window.location.replace('/admin' + window.location.hash);
    return null;
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get('success')) {
      setSuccessModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (query.get('canceled')) {
      alert('A compra foi cancelada.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (isAdminRoute) {
    return <AdminView onClose={() => { window.location.href = '/'; }} />;
  }

  return (
    <TicketStatusProvider>
    <>
      <Navbar onOpenTicketModal={() => setTicketModalOpen(true)} />

      <main>
        <Hero onOpenTicketModal={() => setTicketModalOpen(true)} />
        <Tickets onOpenTicketModal={() => setTicketModalOpen(true)} />
        <About />
        <Features onOpenTicketModal={() => setTicketModalOpen(true)} />
        <Program onOpenTicketModal={() => setTicketModalOpen(true)} />
        <WhyAttend />
        <Speakers />
        <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
        <Recap onOpenTicketModal={() => setTicketModalOpen(true)} />
        <FAQ onOpenTicketModal={() => setTicketModalOpen(true)} />
        <Team />
        <Footer />
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => { window.location.href = '/admin'; }}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-darkBlue hover:text-white transition flex items-center justify-center opacity-50 hover:opacity-100 shadow-sm"
          aria-label="Admin"
          title="Admin Area"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            
            {/* Fundo escuro (fecha o modal ao clicar fora) */}
            <div 
              className="fixed inset-0 transition-opacity bg-brand-darkBlue/80 backdrop-blur-sm" 
              onClick={() => setTicketModalOpen(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            {/* Caixa do Modal - max-w-4xl para dar muito espaço ao formulário! */}
            <div className="relative inline-block w-full max-w-4xl align-bottom transition-all transform bg-white rounded-[2rem] shadow-2xl sm:my-8 sm:align-middle text-left">
              
              {/* Botão Fechar (X) */}
              <button
                onClick={() => setTicketModalOpen(false)}
                className="absolute top-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              {/* O formulário do staff fica aqui dentro, com scroll caso o ecrã seja pequeno */}
              <div className="p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
                <TicketPurchaseModal />
              </div>

            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isSponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
        title="Torne-se um Patrocinador"
      >
        <SponsorForm />
      </Modal>

      <Modal
        isOpen={isSupporterModalOpen}
        onClose={() => setSupporterModalOpen(false)}
        title="Torne-se um Apoiador"
      >
        <SupporterForm />
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Pagamento Confirmado!"
      >
        <SuccessState
          message="O seu pagamento foi confirmado com sucesso. Verifique o seu e-mail para os próximos detalhes."
          onReset={() => setSuccessModalOpen(false)}
        />
      </Modal>
    </>
    </TicketStatusProvider>
  );
};

export default App;

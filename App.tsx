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
        <FAQ />
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

      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Comprar Bilhete"
        size="lg"
      >
        <TicketPurchaseModal />
      </Modal>

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

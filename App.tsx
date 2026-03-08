import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';

import { Navbar } from './components/NavBar';
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

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);

  // Modal de sucesso da compra
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  // Admin por rota direta
  const isAdminRoute = window.location.pathname === '/admin';

  if (isAdminRoute) {
    return <AdminView onClose={() => { window.location.href = '/'; }} />;
  }

  // Verificar retorno do Stripe ao carregar
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get('success')) {
      setSuccessModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (query.get('canceled')) {
      alert('A compra foi cancelada.');
    }
  }, []);

  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <Features />
        <Speakers />
        <Sponsors />
        <Recap />

        <Tickets onBuyClick={() => setTicketModalOpen(true)} />

        <GetInvolved
          setSponsorModalOpen={setSponsorModalOpen}
          setSupporterModalOpen={setSupporterModalOpen}
        />

        <FAQ />
        <Team />
        <Footer />
      </main>

      {/* FAB Admin escondido */}
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

      {/* Modals */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Comprar Bilhete"
      >
        <TicketPurchaseModal onSuccess={() => setTicketModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isSponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
        title="Torne-se um Patrocinador"
      >
        <SponsorForm onSuccess={() => setSponsorModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isSupporterModalOpen}
        onClose={() => setSupporterModalOpen(false)}
        title="Torne-se um Apoiador"
      >
        <SupporterForm onSuccess={() => setSupporterModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Pagamento Confirmado!"
      >
        <SuccessState onClose={() => setSuccessModalOpen(false)} />
      </Modal>
    </>
  );
};

export default App;
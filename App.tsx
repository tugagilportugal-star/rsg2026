import React, { useState, useEffect } from 'react';
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
import { TicketForm } from './components/TicketForm';
import { TicketStatusProvider } from './hooks/useTicketStatus';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const isAdminRoute = window.location.pathname === '/admin';

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
    }
  }, []);

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
          <WhyAttend onOpenTicketModal={openTicket} />
          <Tickets onOpenTicketModal={openTicket} />
          <Speakers />
          <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
          <Recap />
          <FAQ />
          <Team />
        </main>

        <Footer />

        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => (window.location.href = '/admin')}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-darkBlue hover:text-white flex items-center justify-center transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        <Modal isOpen={isSponsorModalOpen} onClose={() => setSponsorModalOpen(false)} title="Patrocinador">
          <SponsorForm />
        </Modal>

        <Modal isOpen={isSupporterModalOpen} onClose={() => setSupporterModalOpen(false)} title="Apoiador">
          <SupporterForm />
        </Modal>

        <Modal isOpen={isTicketModalOpen} onClose={() => setTicketModalOpen(false)} title="Early Bird Ticket">
          <TicketForm />
        </Modal>

        <Modal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} title="Pagamento Confirmado!">
          <SuccessState message="O seu bilhete está garantido! Você receberá um e-mail com o QR Code e a fatura em breve." />
        </Modal>
      </div>
    </TicketStatusProvider>
  );
};

export default App;

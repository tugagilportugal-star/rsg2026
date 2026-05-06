import React, { useState, useEffect, useCallback } from 'react';
// 1. Importar as peças do Router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Program } from './sections/Program';
import { WhyAttend } from './sections/WhyAttend';
import { Tickets } from './sections/Tickets';
import { Sponsors } from './sections/Sponsors';
import { Speakers } from './sections/Speakers';
import { GetInvolved, SponsorForm } from './sections/GetInvolved';
import { Recap } from './sections/Recap';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Team } from './sections/Team';
import { Modal, SuccessState } from './components/UIComponents';
import { AdminView } from './components/AdminView';
import { Settings } from 'lucide-react';
import { TicketPurchaseModal } from './components/TicketPurchaseModal';
import { TicketStatusProvider } from './hooks/useTicketStatus';
import { AgendaPage } from './sections/Agenda';

// Criamos um componente para a Home para não poluir o App.tsx
const HomePage: React.FC<{ openTicket: () => void, setSponsorModalOpen: (v: boolean) => void }> = ({ openTicket, setSponsorModalOpen }) => (
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
);

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const isAdminRoute = window.location.pathname === '/admin';

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
  }, [checkUrl]);

  if (!isAdminRoute && window.location.hash.includes('access_token=')) {
    window.location.replace('/admin' + window.location.hash);
    return null;
  }

  if (isAdminRoute) {
    return <AdminView onClose={() => { window.location.href = '/'; }} />;
  }

  return (
    <TicketStatusProvider>
      {/* 2. Envolver tudo no Router */}
      <Router>

          {/* 3. Definir as Rotas */}
          <Routes>
            <Route path="/agenda" element={<AgendaPage />} />
          </Routes>

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

          {/* Teus Modals mantêm-se exatamente iguais */}
          <Modal isOpen={isSponsorModalOpen} onClose={() => setSponsorModalOpen(false)} title="Patrocinador">
            <SponsorForm />
          </Modal>

          <Modal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} title="Pagamento Confirmado!">
            <SuccessState message="O seu bilhete está garantido! Você receberá um e-mail com o QR Code e a fatura em breve." />
          </Modal>
      </Router>
    </TicketStatusProvider>
  );
};

export default App;
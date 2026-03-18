import React, { useState, useEffect } from 'react';
import { Navbar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Program } from './sections/Program';
import { Tickets } from './sections/Tickets';
import { Sponsors } from './sections/Sponsors';
import { GetInvolved, SponsorForm, SupporterForm } from './sections/GetInvolved';
import { Recap } from './sections/Recap';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Team } from './sections/Team';
import { Modal, SuccessState } from './components/UIComponents';
import { AdminView } from './components/AdminView';
import { Settings } from 'lucide-react';
import { TicketPurchaseModal } from './components/TicketPurchaseModal';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const[isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const isAdminRoute = window.location.pathname === '/admin';
  if (isAdminRoute) {
    return <AdminView onClose={() => { window.location.href = '/'; }} />;
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
  }, []); // <--- Aqui estava o erro TS1135 e TS1005

  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      {/* Secção de Tickets com a função de abrir o Modal */}
      <Tickets onOpenTicketModal={() => setTicketModalOpen(true)} />
      <About />
      <Features />
      <Program />
      <Recap />      
      <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
      <GetInvolved
        setSponsorModalOpen={setSponsorModalOpen}
        setSupporterModalOpen={setSupporterModalOpen}
      />
      <FAQ />
      <Team />
      <Footer />

      {/* Botão Admin Escondido - Agora dentro da div principal */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => (window.location.href = '/admin')}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-darkBlue hover:text-white flex items-center justify-center transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </div> // <--- Fechamento da div principal
  );
}; // <--- Fechamento do componente App

export default App;

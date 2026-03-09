import React, { useState, useEffect } from 'react';
import { Navbar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Program } from './sections/Program';
import { WhyAttend } from './sections/WhyAttend';
import { Tickets } from './sections/Tickets';
import { Sponsors } from './sections/Sponsors';
import { Recap } from './sections/Recap';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Team } from './sections/Team';
import { Modal, SuccessState } from './components/UIComponents';
import { AdminView } from './components/AdminView';
import { Settings } from 'lucide-react';
import { TicketForm } from './components/TicketForm';

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
  }, []); // Aqui fechamos o useEffect corretamente com o array de dependências vazio.

  return (
    <div className="bg-white">
      {/* ... resto do seu código ... */}
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Program />
      <WhyAttend />
      
      {/* Secção de Tickets com a função de abrir o Modal */}
      <Tickets onOpenTicketModal={() => setTicketModalOpen(true)} />
      
      <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
      <Recap />

      <GetInvolved
        setSponsorModalOpen={setSponsorModalOpen}
        setSupporterModalOpen={setSupporterModalOpen}
      />

      <FAQ />
      <Team />
      <Footer />

      {/* Botão Admin Escondido */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => (window.location.href = '/admin')}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-darkBlue hover:text-white transition flex items-center justify-center opacity-50 hover:opacity-100 shadow-sm"
          aria-label="Admin"
          title="Admin Area"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Modal: Patrocinador */}
      <Modal
        isOpen={isSponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
        title="Torne-se um Patrocinador"
      >
        <SponsorForm />
      </Modal>

      {/* Modal: Apoiador */}
      <Modal
        isOpen={isSupporterModalOpen}
        onClose={() => setSupporterModalOpen(false)}
        title="Torne-se um Apoiador"
      >
        <SupporterForm />
      </Modal>

      {/* Modal NOVO: Venda de Bilhetes */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Early Bird Ticket"
      >
        <TicketForm />
      </Modal>

      {/* Modal: Sucesso */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Pagamento Confirmado!"
      >
        <SuccessState 
          message="O seu bilhete está garantido! Você receberá um e-mail com o QR Code e a fatura em breve." 
        />
      </Modal>
    </div>
); // Fecha o return
}; // FECHA O COMPONENTE APP (Faltava esta chave!)

export default App;

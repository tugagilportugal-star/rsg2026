import React, { useState, useEffect } from 'react';
import { Navbar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Speakers } from './sections/Speakers';
import { Sponsors } from './sections/Sponsors';
import { Recap } from './sections/Recap';
import { GetInvolved, SponsorForm, SupporterForm } from './sections/GetInvolved';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Modal, SuccessState } from './components/UIComponents'; // Importei SuccessState
import { AdminView } from './components/AdminView';
import { ArrowUp, Send, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  
  // Novo estado para o Modal de Sucesso de Compra
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  
  const [showFab, setShowFab] = useState(false);

  // ✅ Admin só por rota
  const isAdminRoute = window.location.pathname === '/admin';
  if (isAdminRoute) {
    return (
      <AdminView
        onClose={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  useEffect(() => {
    // 1. Lógica do Scroll (FAB)
    const handleScroll = () => {
      setShowFab(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);

    // 2. Lógica de Retorno do Stripe (?success=true)
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setSuccessModalOpen(true);
      // Limpa a URL para não reabrir se der refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Opcional: Tratar cancelamento
    if (query.get('canceled')) {
      alert('A compra foi cancelada. Se tiver dúvidas, entre em contato.');
    }

    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white">
      <Navbar />

      <Hero />
      <About />
      <Features />
      <Speakers />
      <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
      <Recap />

      <GetInvolved
        setSponsorModalOpen={setSponsorModalOpen}
        setSupporterModalOpen={setSupporterModalOpen}
      />

      <FAQ />
      <Footer />

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button
          onClick={() => (window.location.href = '/admin')}
          className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition"
          aria-label="Admin"
        >
          <Settings className="w-5 h-5" />
        </button>

        {showFab && (
          <button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition"
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <a
          href="#get-involved"
          className="w-12 h-12 rounded-full bg-brand-orange text-white shadow-lg flex items-center justify-center hover:opacity-90 transition"
          aria-label="Contato"
        >
          <Send className="w-5 h-5" />
        </a>
      </div>

      {/* Modals */}
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

      {/* ✅ MODAL DE SUCESSO DO BILHETE */}
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
  );
};

export default App;
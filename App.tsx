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
import { Modal } from './components/UIComponents';
import { AdminView } from './components/AdminView';
import { ArrowUp, Send, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
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
    const handleScroll = () => {
      setShowFab(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
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
        {/* Admin shortcut -> /admin */}
        <button
          onClick={() => (window.location.href = '/admin')}
          className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition"
          aria-label="Admin"
          title="Admin"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Scroll to top */}
        {showFab && (
          <button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition"
            aria-label="Voltar ao topo"
            title="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* Quick contact (exemplo) */}
        <a
          href="#get-involved"
          className="w-12 h-12 rounded-full bg-brand-orange text-white shadow-lg flex items-center justify-center hover:opacity-90 transition"
          aria-label="Contato"
          title="Contato"
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
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Sponsors } from './sections/Sponsors';
import { Recap } from './sections/Recap';
import { GetInvolved, SponsorForm, SupporterForm } from './sections/GetInvolved';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Modal } from './components/UIComponents';
import { AdminView } from './components/AdminView';
import { Settings } from 'lucide-react';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isAdminViewOpen, setAdminViewOpen] = useState(false);

  // Comando secreto: Pressione "A + D + M" juntos para abrir a área administrativa
  useEffect(() => {
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (keys['a'] && keys['d'] && keys['m']) {
        setAdminViewOpen(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand-orange selection:text-white">
      
      <Hero />
      <About />
      <Features />
      <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
      <Recap />
      <GetInvolved 
        setSponsorModalOpen={setSponsorModalOpen}
        setSupporterModalOpen={setSupporterModalOpen}
      />
      <FAQ />
      <Footer />

      {/* Admin Toggle Button (Discreto no rodapé) */}
      <button 
        onClick={() => setAdminViewOpen(true)}
        className="fixed bottom-4 left-4 p-2 text-gray-300 hover:text-brand-blue transition-colors z-40 opacity-20 hover:opacity-100"
        title="Admin Area"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Admin Dashboard */}
      {isAdminViewOpen && <AdminView onClose={() => setAdminViewOpen(false)} />}

      {/* Popups de Formulários Nativos */}
      <Modal 
        isOpen={isSponsorModalOpen} 
        onClose={() => setSponsorModalOpen(false)}
        title="Torne-se um Patrocinador"
      >
        <SponsorForm onClose={() => setSponsorModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isSupporterModalOpen} 
        onClose={() => setSupporterModalOpen(false)}
        title="Torne-se um Apoiador"
      >
        <SupporterForm onClose={() => setSupporterModalOpen(false)} />
      </Modal>

    </main>
  );
};

export default App;

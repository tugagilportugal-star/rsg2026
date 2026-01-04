import React, { useState } from 'react';
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
import { Settings } from 'lucide-react';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isAdminViewOpen, setAdminViewOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />
      
      <Hero />
      <About />
      <Features />
      <Speakers />
      <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
      <Recap />
      
      <div id="registration-section">
        <GetInvolved 
          setSponsorModalOpen={setSponsorModalOpen}
          setSupporterModalOpen={setSupporterModalOpen}
        />
      </div>
      
      <FAQ />
      <Footer />

      {/* Acesso ao Admin para Diagnóstico */}
      <button 
        onClick={() => setAdminViewOpen(true)}
        className="fixed bottom-4 left-4 p-2 text-gray-400 hover:text-brand-blue opacity-20 hover:opacity-100 transition-all z-[60]"
        title="Admin Diagnostic"
      >
        <Settings size={20} />
      </button>

      {/* Modais de Formulários */}
      <Modal 
        isOpen={isSponsorModalOpen} 
        onClose={() => setSponsorModalOpen(false)} 
        title="Torne-se Patrocinador"
      >
        <SponsorForm onClose={() => setSponsorModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isSupporterModalOpen} 
        onClose={() => setSupporterModalOpen(false)} 
        title="Seja um Apoiador"
      >
        <SupporterForm onClose={() => setSupporterModalOpen(false)} />
      </Modal>

      {/* View de Administração */}
      {isAdminViewOpen && <AdminView onClose={() => setAdminViewOpen(false)} />}
    </main>
  );
};

export default App;
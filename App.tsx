
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
import { Settings, ArrowUp, Send } from 'lucide-react';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isAdminViewOpen, setAdminViewOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // FAB aparece após 500px de scroll
      setShowFab(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);

    // Atalho Secreto TugÁgil: A + D + M
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const scrollToWaitlist = () => {
    const section = document.getElementById('registration-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand-orange selection:text-white">
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

      {/* Admin Stealth Entry */}
      <button 
        onClick={() => setAdminViewOpen(true)}
        className="fixed bottom-4 left-4 p-3 text-gray-200 hover:text-brand-blue transition-all z-[60] opacity-5 hover:opacity-100 focus:outline-none"
        aria-label="Admin Portal"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Floating Action Button (FAB) */}
      <div className={`fixed bottom-8 right-8 flex flex-col gap-4 z-[80] transition-all duration-700 ease-in-out transform ${showFab ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-4 bg-white text-brand-darkBlue rounded-full shadow-2xl border border-gray-100 hover:bg-gray-50 transition-all hover:-translate-y-1 active:scale-90"
          title="Voltar ao topo"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <button 
          onClick={scrollToWaitlist}
          className="flex items-center gap-3 px-8 py-5 bg-brand-orange text-white rounded-full shadow-[0_20px_40px_rgba(244,122,32,0.5)] font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all group"
        >
          <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <span>Garantir Vaga</span>
        </button>
      </div>

      {isAdminViewOpen && <AdminView onClose={() => setAdminViewOpen(false)} />}

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
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Features } from './sections/Features';
import { Program } from './sections/Program';
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
import { TicketPurchaseModal } from './components/TicketPurchaseModal';
import { WhyAttend } from './sections/WhyAttend';
import { TicketStatusProvider } from './hooks/useTicketStatus';

const App: React.FC = () => {
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSupporterModalOpen, setSupporterModalOpen] = useState(false);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const[isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const isAdminRoute = window.location.pathname === '/admin';

  // After Google OAuth, Supabase redirects to site root with #access_token in the hash.
  // Detect this and redirect to /admin so the AdminView can process the token.
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

  return (
    <TicketStatusProvider>
      <Navbar onOpenTicketModal={() => setTicketModalOpen(true)} />

      <main>
        <Hero onOpenTicketModal={() => setTicketModalOpen(true)} />
        <Tickets onOpenTicketModal={() => setTicketModalOpen(true)} />
        <About />
        <Features onOpenTicketModal={() => setTicketModalOpen(true)} />
        <Program onOpenTicketModal={() => setTicketModalOpen(true)} />
        <WhyAttend />
        <Speakers />
        <Sponsors onOpenSponsorModal={() => setSponsorModalOpen(true)} />
        <Recap onOpenTicketModal={() => setTicketModalOpen(true)} />
        <FAQ onOpenTicketModal={() => setTicketModalOpen(true)} />
        <Team />
        <Footer />
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => (window.location.href = '/admin')}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-darkBlue hover:text-white flex items-center justify-center transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {isTicketModalOpen && (
        <TicketPurchaseModal 
          onClose={() => setTicketModalOpen(false)} 
        />
      )}
    </TicketStatusProvider>
  );
};

export default App;

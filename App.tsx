import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Program } from './sections/Program';
import { Sponsors } from './sections/Sponsors';
import { Speakers } from './sections/Speakers';
import { GetInvolved } from './sections/GetInvolved';
import { Recap } from './sections/Recap';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Team } from './sections/Team';
import { NextEvent } from './sections/NextEvent';
import { AdminView } from './components/AdminView';
import { Settings } from 'lucide-react';
import { TicketStatusProvider } from './hooks/useTicketStatus';
import { AgendaPage } from './sections/Agenda';
import { BenefitsPage } from './sections/Benefits';

/* ========================= COMPONENTE HOME ========================= */
const HomePage: React.FC = () => (
  <main>
    <Hero />
    <About />
    <Program />
    <Speakers />
    <Recap />
    <Sponsors />
    <GetInvolved />
    <FAQ />
    <Team />
    <NextEvent />
  </main>
);

/* ========================= COMPONENTE APP ========================= */
const App: React.FC = () => {
  const isAdminRoute = window.location.pathname === '/admin';

  if (!isAdminRoute && window.location.hash.includes('access_token=')) {
    window.location.replace('/admin' + window.location.hash);
    return null;
  }

  if (isAdminRoute) {
    return <AdminView onClose={() => { window.location.href = '/'; }} />;
  }

  return (
    <TicketStatusProvider>
      <Router>
        <div className="relative min-h-screen bg-white">
          
          
          {/* Remove o Navbar daqui de cima */}

<Routes>
  <Route path="/" element={
    <>
      <Navbar /> {/* O Navbar agora só existe na Home */}
      <HomePage />
    </>
  } />

  <Route path="/agenda" element={<AgendaPage />} />
  <Route path="/beneficios-exclusivos" element={<BenefitsPage />} />
</Routes>

          {/* Botão Admin */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => (window.location.href = '/admin')}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-darkBlue hover:text-white flex items-center justify-center transition-colors shadow-lg"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </Router>
    </TicketStatusProvider>
  );
};

export default App;
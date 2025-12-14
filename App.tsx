import React, { useState } from 'react';
import { useStore } from './store';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreatePetition } from './pages/CreatePetition';
import { LegalCalendar } from './pages/LegalCalendar';
import { LaborCalculator } from './pages/LaborCalculator';
import { CriminalCalculator } from './pages/CriminalCalculator';
import { PrescriptionCalculator } from './pages/PrescriptionCalculator';
import { ProcessHistory } from './pages/ProcessHistory';
import { FilingLinks } from './pages/FilingLinks';
import { Layout } from './components/Layout';
import { LegalDisclaimerModal } from './components/LegalDisclaimer';

const App: React.FC = () => {
  const { user } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Auth Guard
  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'create-petition':
        return <CreatePetition onComplete={() => setCurrentPage('dashboard')} />;
      case 'calendar':
        return <LegalCalendar />;
      case 'labor-calculator':
        return <LaborCalculator />;
      case 'criminal-calculator':
        return <CriminalCalculator />;
      case 'prescription-calculator':
        return <PrescriptionCalculator />;
      case 'process-history':
        return <ProcessHistory />;
      case 'filing-links':
        return <FilingLinks />;
      case 'settings':
        return <div className="text-slate-500 p-8">Configurações em desenvolvimento...</div>;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <LegalDisclaimerModal />
      <div className={!user.acceptedLegalDisclaimer ? 'filter blur-sm pointer-events-none select-none' : ''}>
        <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
          {renderPage()}
        </Layout>
      </div>
    </>
  );
};

export default App;
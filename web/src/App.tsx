import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar, Footer } from './components/layout';
import { WhatsAppButton } from './components/ui';

import Accueil from './pages/Accueil';
import APropos from './pages/APropos';
import Services from './pages/Services';
import Tarifs from './pages/Tarifs';
import Realisations from './pages/Realisations';
import Galerie from './pages/Galerie';
import Equipe from './pages/Equipe';
import Contact from './pages/Contact';
import Reservation from './pages/Reservation';
import AvisClient from './pages/AvisClient';

function Simple404() {
  useEffect(() => {
    document.title = "404 - Page non trouvée";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page non trouvée</h1>
      <Link 
        to="/" 
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#E91E8C] hover:bg-pink-600 transition-colors"
      >
        Retour vers l'accueil
      </Link>
    </div>
  );
}

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Accueil';

    switch (path) {
      case '/': title = 'Accueil'; break;
      case '/a-propos': title = 'À propos'; break;
      case '/services': title = 'Services'; break;
      case '/tarifs': title = 'Tarifs'; break;
      case '/realisations': title = 'Réalisations'; break;
      case '/galerie': title = 'Galerie'; break;
      case '/equipe': title = 'Équipe'; break;
      case '/contact': title = 'Contact'; break;
      case '/reservation': title = 'Réservation'; break;
      case '/avis': title = 'Laissez votre avis'; break;
      case '/404': title = 'Page introuvable'; break;
      default: title = 'Accueil';
    }

    document.title = `KPL SERVICES | ${title}`;
  }, [location]);

  return null;
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', backgroundColor: '#f9fafb', color: '#111827', textAlign: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>Service Indisponible</h1>
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#4b5563' }}>
          Impossible de contacter le serveur. Veuillez contacter le propriétaire du site, merci.
        </p>
      </div>
    </div>
  );
}

export default App;

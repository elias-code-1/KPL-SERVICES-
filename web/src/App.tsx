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
    <Router>
      <TitleUpdater />
      <Routes>
        <Route path="/avis" element={<AvisClient />} />
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/services" element={<Services />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/realisations" element={<Realisations />} />
          <Route path="/galerie" element={<Galerie />} />
          <Route path="/equipe" element={<Equipe />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reservation" element={<Reservation />} />
        </Route>
        <Route path="*" element={<Simple404 />} />
      </Routes>
    </Router>
  );
}

export default App;

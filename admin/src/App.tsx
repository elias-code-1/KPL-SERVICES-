import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UpdatePassword from './pages/UpdatePassword';
import Reservations from './pages/Reservations';
import Messages from './pages/Messages';
import AdminRealisations from './pages/Realisations';
import AdminGalerie from './pages/Galerie';
import Temoignages from './pages/Temoignages';
import Parametres from './pages/Parametres';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Admin';

    switch (path) {
      case '/': title = 'Login'; break;
      case '/dashboard': title = 'Dashboard'; break;
      case '/reservations': title = 'Réservations'; break;
      case '/messages': title = 'Messages'; break;
      case '/realisations': title = 'Réalisations'; break;
      case '/galerie': title = 'Galerie'; break;
      case '/temoignages': title = 'Témoignages'; break;
      case '/parametres': title = 'Paramètres'; break;
      default: title = 'Admin';
    }

    document.title = `KPL Admin | ${title}`;
  }, [location]);

  return null;
}

function AdminLayoutWrapper() {
  return (
    <>
      <Helmet>
        <link rel="manifest" href="/manifest-admin.json" />
        <meta name="theme-color" content="#E91E8C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KPL Admin" />
      </Helmet>
      <Outlet />
    </>
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

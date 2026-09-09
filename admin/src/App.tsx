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
    <Router>
      <TitleUpdater />
      <Routes>
        <Route element={<AdminLayoutWrapper />}>
          <Route path="/" element={<Login />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/realisations" element={<AdminRealisations />} />
            <Route path="/galerie" element={<AdminGalerie />} />
            <Route path="/temoignages" element={<Temoignages />} />
            <Route path="/parametres" element={<Parametres />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Terminos } from './pages/Terminos';
import { Privacidad } from './pages/Privacidad';
import Presentacion from './pages/presentacion';
import Deck from './pages/deck';
import Plataforma from './pages/plataforma';

function Layout() {
  const location = useLocation();
  const path = location.pathname.toLowerCase().replace(/\/$/, '');
  const isPresentacion = path === '/presentacion' || path === '/presentaci%c3%b3n' || path === '/presentación';
  const isDeck = path === '/deck';
  const isPlataforma = path.startsWith('/plataforma');

  useEffect(() => {
    if (location.pathname !== '/' || !window.location.hash.includes('type=recovery')) return;
    window.location.replace(`/plataforma/login${window.location.hash}`);
  }, [location.pathname]);

  if (isPresentacion) {
    return (
      <Routes>
        <Route path="*" element={<Presentacion />} />
      </Routes>
    );
  }

  if (isDeck) {
    return (
      <Routes>
        <Route path="*" element={<Deck />} />
      </Routes>
    );
  }

  if (isPlataforma) {
    return (
      <Routes>
        <Route path="/plataforma/*" element={<Plataforma />} />
      </Routes>
    );
  }

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terminos-y-condiciones" element={<Terminos />} />
          <Route path="/politica-de-privacidad" element={<Privacidad />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

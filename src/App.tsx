import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Terminos } from './pages/Terminos';
import { Privacidad } from './pages/Privacidad';
import Presentacion from './pages/presentacion';

function Layout() {
  const location = useLocation();
  const isPresentacion = location.pathname.toLowerCase() === '/presentacion' || location.pathname.toLowerCase() === '/presentaci%c3%b3n' || location.pathname.toLowerCase() === '/presentación';

  if (isPresentacion) {
    return (
      <Routes>
        <Route path="*" element={<Presentacion />} />
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

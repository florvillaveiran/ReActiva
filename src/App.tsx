/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CostoOculto } from './components/CostoOculto';
import { Solucion } from './components/Solucion';
import { Resultados } from './components/Resultados';
import { Metodo } from './components/Metodo';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />
      <Hero />
      <CostoOculto />
      <Solucion />
      <Resultados />
      <Metodo />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

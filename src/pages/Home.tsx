import React from 'react';
import { Hero } from '../components/Hero';
import { CostoOculto } from '../components/CostoOculto';
import { Solucion } from '../components/Solucion';
import { Resultados } from '../components/Resultados';
import { Metodo } from '../components/Metodo';
import { FAQ } from '../components/FAQ';
import { CTA } from '../components/CTA';

export const Home = () => {
  return (
    <>
      <Hero />
      <CostoOculto />
      <Solucion />
      <Resultados />
      <Metodo />
      <FAQ />
      <CTA />
    </>
  );
};

import { useState, useEffect, useCallback, useRef, type TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '../presentacion/components/Hero';
import WhatIs from '../presentacion/components/WhatIs';
import SedentaryCost from '../presentacion/components/SedentaryCost';
import Benefits from '../presentacion/components/Benefits';
import Contact from '../presentacion/components/Contact';
import Ecosystem from './components/Ecosystem';
import { ChevronUp, ChevronDown } from 'lucide-react';
import '../presentacion/index.css';
import './index.css';

const slides = [
  { id: 'inicio', component: Hero },
  { id: 'que-es', component: WhatIs },
  { id: 'costo', component: SedentaryCost },
  { id: 'ecosistema', component: Ecosystem },
  { id: 'beneficios', component: Benefits },
  { id: 'contacto', component: Contact },
];

function Deck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentSlide) return;
    if (index < 0 || index >= slides.length) return;

    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsAnimating(true);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    // La navegación horizontal deja libre el desplazamiento vertical del contenido.
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX < 0) nextSlide();
    else prevSlide();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    let lastScrollTime = 0;
    const scrollThreshold = 1000; // ms between scrolls

    const handleWheel = (e: WheelEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastScrollTime < scrollThreshold) return;

      if (e.deltaY > 30) {
        nextSlide();
        lastScrollTime = currentTime;
      } else if (e.deltaY < -30) {
        prevSlide();
        lastScrollTime = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [nextSlide, prevSlide]);

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const CurrentComponent = slides[currentSlide].component;

  return (
    <div
      id="presentacion-root"
      className="deck-root fixed inset-0 bg-brand-cream overflow-hidden font-sans selection:bg-brand-primary/20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Bar (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full h-1 md:h-1.5 z-50 bg-slate-100/50">
        <motion.div 
          className="h-full bg-brand-primary rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
      </div>

      <AnimatePresence 
        initial={false} 
        custom={direction}
        onExitComplete={() => setIsAnimating(false)}
      >
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: 'spring', stiffness: 200, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="deck-slide absolute inset-0 w-full h-full outline-none overflow-hidden"
        >
          <CurrentComponent />
        </motion.div>
      </AnimatePresence>

      <nav className="deck-navigation" aria-label="Navegación del deck">
        <button
          type="button"
          onClick={prevSlide}
          disabled={currentSlide === 0 || isAnimating}
          aria-label="Diapositiva anterior"
        >
          <ChevronUp aria-hidden="true" />
        </button>
        <div className="deck-navigation-dots" aria-label={`Diapositiva ${currentSlide + 1} de ${slides.length}`}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === currentSlide ? 'is-active' : ''}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              aria-label={`Ir a la diapositiva ${index + 1}`}
              aria-current={index === currentSlide ? 'step' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1 || isAnimating}
          aria-label="Diapositiva siguiente"
        >
          <ChevronDown aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

export default Deck;

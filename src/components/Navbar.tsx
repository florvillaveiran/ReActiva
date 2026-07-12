import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-neutral-100/90 backdrop-blur-md shadow-sm py-3 md:py-4 border-b border-neutral-200/50' : 'bg-transparent py-4 md:py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        <Logo scrolled={scrolled} />
        
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: 'Beneficios', href: '#beneficios' },
            { name: 'Programa', href: '#programa' },
            { name: 'Resultados', href: '#resultados' },
            { name: 'FAQ', href: '#faq' }
          ].map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`font-medium transition-colors hover:text-[#10b981] ${scrolled ? 'text-slate-700' : 'text-white'}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        <a 
          href="#bienestar"
          className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${scrolled ? 'bg-[#1A1A1A] text-white hover:bg-slate-800' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}`}
        >
          Comenzar prueba
        </a>
      </div>
    </nav>
  );
};

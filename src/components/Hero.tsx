import React from 'react';
import { Play, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
      {/* Background Image with slow zoom */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80" 
          alt="Equipo trabajando" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
          >
            Un equipo activo es <span className="text-[#10b981]">imparable</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10 max-w-xl"
          >
            Y su salud, tu mejor inversión. Transformamos la rutina laboral con pausas activas 100% online, 3 días por semana, efectivas y fáciles de aplicar.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <motion.a 
              href="#bienestar"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-[#10b981] text-white font-semibold text-lg hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              Activa tu prueba de 15 días <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a 
              href="#metodo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-white/10 text-white font-semibold text-lg hover:bg-white/20 backdrop-blur-md border border-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> Ver cómo funciona
            </motion.a>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300 mb-12"
          >
            {[
              "Prueba gratuita",
              "Sin compromiso",
              "Resultados inmediatos"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

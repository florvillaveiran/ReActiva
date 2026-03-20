import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export const Resultados = () => {
  return (
    <section id="resultados" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h4 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Lo que dicen nuestros clientes</h4>
            <h3 className="text-3xl md:text-4xl font-serif italic text-slate-800">
              Transformando la felicidad de tu equipo
            </h3>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pt-12 pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            {[
              {
                name: "María González",
                role: "Desarrolladora Senior",
                text: "Paso muchas horas sentada y siempre terminaba molida. Estas pausas me ayudan un montón. Me estiro, respiro y vuelvo con otra cabeza.",
                color: "bg-[#10b981]/5"
              },
              {
                name: "Roberto Paz",
                role: "CEO Tech Solutions",
                text: "Implementamos Reactiva y el cambio en el humor del equipo fue inmediato. Es una inversión mínima para el impacto que genera en la productividad.",
                color: "bg-[#10b981]/10"
              },
              {
                name: "Lucía Méndez",
                role: "HR Manager",
                text: "Buscábamos algo simple y efectivo. El seguimiento automático nos permite ver quiénes participan y cómo mejora el clima mes a mes.",
                color: "bg-[#C1E9D2]/10"
              }
            ].map((testimonio, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`${testimonio.color} min-w-[85vw] md:min-w-0 snap-center rounded-[2rem] p-8 md:p-10 border border-slate-100 relative group hover:scale-[1.02] transition-all duration-500 flex flex-col`}
              >
                <div className="absolute -top-6 left-8 md:left-10 w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-700 italic leading-relaxed text-base md:text-lg mb-8 pt-4">
                  "{testimonio.text}"
                </p>
                <div className="mt-auto">
                  <h5 className="font-bold text-slate-900">{testimonio.name}</h5>
                  <p className="text-sm text-slate-500">{testimonio.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Mobile Scroll Indicator */}
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-slate-200"></div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Monitor, DollarSign, RefreshCw, Zap, Heart, Shield, Smile } from 'lucide-react';

export const CostoOculto = () => {
  const [isReactiva, setIsReactiva] = useState(true);

  const problema = [
    { icon: Brain, title: "Mayor fatiga mental o física", desc: "El sedentarismo genera agotamiento constante", colSpan: "md:col-span-2", bg: "bg-rose-50", text: "text-rose-500" },
    { icon: Monitor, title: "+ 4 horas sentado", desc: "Baja concentración y rendimiento cognitivo", colSpan: "md:col-span-1", bg: "bg-rose-50", text: "text-rose-500" },
    { icon: DollarSign, title: "Dolencias frecuentes", desc: "Problemas musculoesqueléticos por malas posturas", colSpan: "md:col-span-1", bg: "bg-rose-50", text: "text-rose-500" },
    { icon: RefreshCw, title: "Dificultad para desconectar", desc: "El trabajo remoto dificulta la separación entre vida laboral y personal", colSpan: "md:col-span-2", bg: "bg-rose-50", text: "text-rose-500" },
  ];

  const solucion = [
    { icon: Zap, title: "Energía renovada", desc: "Equipos más activos, enfocados y productivos", colSpan: "md:col-span-2", bg: "bg-emerald-50", text: "text-emerald-500" },
    { icon: Heart, title: "Cuerpo sin tensiones", desc: "Reducción de molestias durante la jornada", colSpan: "md:col-span-1", bg: "bg-emerald-50", text: "text-emerald-500" },
    { icon: Shield, title: "Equipos que eligen quedarse", desc: "Mayor comodidad y compromiso", colSpan: "md:col-span-1", bg: "bg-emerald-50", text: "text-emerald-500" },
    { icon: Smile, title: "Desconexión real", desc: "Pausas que resetean la mente y mejoran el clima", colSpan: "md:col-span-2", bg: "bg-emerald-50", text: "text-emerald-500" },
  ];

  const currentData = isReactiva ? solucion : problema;

  return (
    <section id="beneficios" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header & Toggle */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-10"
          >
            El costo oculto del <span className="text-slate-400 line-through decoration-red-500 decoration-4">sedentarismo</span>
          </motion.h2>

          {/* Big Toggle Switch */}
          <div className="inline-flex items-center p-1.5 bg-white rounded-full border border-slate-200 shadow-sm relative">
            <div 
              className={`absolute inset-y-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-500 ease-spring ${isReactiva ? 'left-[50%] bg-emerald-500' : 'left-1.5 bg-red-500'}`}
            ></div>
            <button 
              onClick={() => setIsReactiva(false)}
              className={`relative z-10 px-8 py-3 rounded-full font-semibold text-sm transition-colors duration-300 ${!isReactiva ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Sin Reactiva
            </button>
            <button 
              onClick={() => setIsReactiva(true)}
              className={`relative z-10 px-8 py-3 rounded-full font-semibold text-sm transition-colors duration-300 ${isReactiva ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Con Reactiva
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {currentData.map((card, i) => (
              <motion.div 
                key={card.title}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`${card.colSpan === 'md:col-span-2' ? 'col-span-2' : 'col-span-1'} bg-white rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-xl transition-shadow border border-slate-100 flex flex-col group`}
              >
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${card.bg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-5 h-5 md:w-7 md:h-7 ${card.text}`} />
                </div>
                <h3 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3 leading-tight">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-lg">{card.desc}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

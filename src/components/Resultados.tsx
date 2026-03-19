import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Heart, Users, RefreshCw, Check, MessageCircle } from 'lucide-react';

export const Resultados = () => {
  const cards = [
    { icon: TrendingUp, title: "Más energía durante la jornada", desc: "Equipos más enfocados y productivos." },
    { icon: Heart, title: "Menos días perdidos", desc: "Bienestar físico que reduce el ausentismo." },
    { icon: Users, title: "Mejor clima laboral", desc: "Más satisfacción y motivación real." },
    { icon: RefreshCw, title: "Mayor estabilidad del equipo", desc: "Se retiene más talento." },
  ];

  return (
    <section id="resultados" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6"
          >
            Resultados reales en <span className="text-[#10b981]">equipos reales</span>
          </motion.h2>
          <p className="text-lg text-slate-600">
            Datos verificables de empresas que ya transformaron su cultura laboral
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-32">
          {cards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-500 group ${
                i === 0 ? 'bg-[#10b981]/10 col-span-2 md:col-span-2' : 
                i === 1 ? 'bg-[#10b981]/10 col-span-1 md:col-span-1' :
                i === 2 ? 'bg-[#C1E9D2]/20 col-span-1 md:col-span-1' :
                'bg-[#FDF8E9] col-span-2 md:col-span-2 md:col-start-2'
              }`}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white flex items-center justify-center mb-4 md:mb-6 shadow-sm group-hover:rotate-6 transition-transform">
                <card.icon className={`w-6 h-6 md:w-8 md:h-8 ${
                  i === 0 ? 'text-[#10b981]' : 
                  i === 1 ? 'text-[#10b981]' :
                  i === 2 ? 'text-[#C1E9D2]' :
                  'text-slate-400'
                }`} />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 leading-tight">{card.title}</h3>
              <div className="flex items-start gap-2 text-left mt-auto">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

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

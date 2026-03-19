import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Clock, TrendingUp, Calendar } from 'lucide-react';

export const CTA = () => {
  return (
    <>
      <section id="contacto" className="py-32 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-slate-900 to-[#1A1A1A]"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#10b981] blur-[100px]"
          ></motion.div>
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h2 
            id="bienestar"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight scroll-mt-20"
          >
            ¿Querés transformar el <br className="hidden md:block" />
            <span className="text-[#10b981]">bienestar</span> de tu equipo?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto"
          >
            Probalo gratis por 15 días. Resultados visibles y comprobados.
          </motion.p>
          
          <motion.a 
            href="https://api.leadconnectorhq.com/widget/booking/PWtEmck2ZotUUEZHg6Nm"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.2 }}
            className="px-10 py-5 rounded-full bg-[#10b981] text-white font-bold text-xl hover:bg-[#059669] transition-colors flex items-center justify-center gap-3 mx-auto mb-20 shadow-2xl shadow-emerald-900/50"
          >
            Agendá tu reunión gratuita <ArrowRight className="w-6 h-6" />
          </motion.a>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle2, title: "Sin compromiso", desc: "Cancela cuando quieras" },
              { icon: Clock, title: "15 días gratis", desc: "Experiencia completa" },
              { icon: TrendingUp, title: "Resultados inmediatos", desc: "Visibles en los primeros 15 días" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-[#10b981]" />
                </div>
                <h4 className="font-bold text-white text-lg mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

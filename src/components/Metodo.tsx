import React from 'react';
import { motion } from 'motion/react';
import { Search, FileText, Lightbulb, RefreshCw } from 'lucide-react';

export const Metodo = () => {
  const steps = [
    { num: "01", icon: Search, title: "Primer contacto", desc: "Tenemos una primera entrevista con tu equipo para entender su dinámica y hábitos." },
    { num: "02", icon: FileText, title: "Diagnóstico e Informe", desc: "Identificamos las necesidades específicas para planificar de manera efectiva tu plan personalizado." },
    { num: "03", icon: Lightbulb, title: "Implementación", desc: "Diseñamos y lanzamos el Programa Saludable con seguimientos y reportes diarios." },
    { num: "04", icon: RefreshCw, title: "Reevaluación constante", desc: "Analizamos el feedback de tus empleados y ajustamos el programa para un mejor rendimiento." },
  ];

  return (
    <section id="metodo" className="py-32 bg-[#1A1A1A] text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            Cómo lo hacemos: <span className="text-[#10b981]">MÉTODO REACTIVA</span>
          </motion.h2>
          <p className="text-lg text-slate-400">Un proceso simple, escalable y sin barreras diseñado para el éxito.</p>
        </div>

        {/* Sticky Stacking Cards */}
        <div className="max-w-4xl mx-auto relative pb-24">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="sticky bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10 mb-8 flex flex-col md:flex-row items-start md:items-center gap-8"
              style={{ 
                top: `calc(15vh + ${i * 20}px)`, 
                zIndex: i 
              }}
            >
              <div className="text-6xl md:text-8xl font-black text-white/5 tracking-tighter shrink-0">
                {step.num}
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-[#10b981]/20 flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-[#10b981]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-lg text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { motion } from 'motion/react';
import { Handshake, FileText, Lightbulb, RotateCcw, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Primer Contacto",
    desc: "Análisis inicial de necesidades y cultura organizacional.",
    icon: Handshake
  },
  {
    num: "02",
    title: "Informe",
    desc: "Diagnóstico detallado y propuesta de ruta de salud.",
    icon: FileText
  },
  {
    num: "03",
    title: "Solución",
    desc: "Implementación de programas y pausas activas personalizadas.",
    icon: Lightbulb,
    active: true
  },
  {
    num: "04",
    title: "Reevaluación",
    desc: "Medición de impacto y optimización continua del plan.",
    icon: RotateCcw
  }
];

export default function Methodology() {
  return (
    <section className="h-full py-8 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-center bg-brand-cream overflow-hidden">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <span className="inline-block py-1.5 px-4 rounded-full bg-brand-primary-container/20 text-brand-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4">
          MÉTODO RE-ACTIVA
        </span>
        <h2 className="font-display text-4xl md:text-5xl text-brand-on-surface mb-3 font-bold tracking-tight">Metodología</h2>
        <p className="font-sans text-base md:text-lg text-brand-on-surface-variant max-w-2xl font-medium">
          Un proceso cíclico diseñado para integrar la vitalidad en el flujo de trabajo.
        </p>
      </motion.div>

      {/* 4-Step Methodology Timeline */}
      <div className="relative mb-6">
        {/* Connecting Line (Desktop) */}
        <div className="absolute top-[28px] left-0 w-full h-0.5 bg-brand-primary-container/30 hidden md:block"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className={`w-14 h-14 rounded-full transition-all duration-300 mb-3 relative z-20 flex items-center justify-center shadow-md border-2 border-white
                ${step.active ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary'}`}
              >
                <step.icon size={28} />
                <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border border-white">
                   {step.num}
                </div>
              </div>
              <h3 className="font-display text-base text-brand-on-surface mb-1 font-bold">{step.title}</h3>
              <p className="font-sans text-brand-on-surface-variant text-xs px-2 leading-relaxed font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Card Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-50"
        >
          <div className="flex items-center gap-2 text-brand-primary mb-3">
            <CheckCircle2 size={20} />
            <h4 className="font-display text-lg font-bold">Eficiencia Comprobada</h4>
          </div>
          <p className="font-sans text-brand-on-surface-variant text-sm md:text-base mb-6 leading-relaxed font-medium">
            Cada paso está diseñado para ser mínimamente invasivo pero altamente efectivo, potenciando el ritmo laboral.
          </p>
          <div className="flex flex-wrap gap-2">
            {['CIENCIA', 'PERSONALIZACIÓN', 'RESULTADOS'].map((tag, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[24px] overflow-hidden aspect-video shadow-xl"
        >
          <img 
            alt="Team collaborating" 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    </section>
  );
}

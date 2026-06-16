import { motion } from 'motion/react';
import { Zap, Target, Smile, Rocket } from 'lucide-react';

const benefits = [
  {
    label: "Más energía",
    icon: Zap,
    color: "text-[#F9A825]",
    bg: "bg-[#FFF8E1]",
  },
  {
    label: "Más foco",
    icon: Target,
    color: "text-[#1E88E5]",
    bg: "bg-[#E3F2FD]",
  },
  {
    label: "Mayor bienestar",
    icon: Smile,
    color: "text-brand-primary",
    bg: "bg-[#E0F2F1]",
  },
  {
    label: "Más productividad",
    icon: Rocket,
    color: "text-[#26A69A]",
    bg: "bg-[#E0F2F1]",
  },
];

export default function Solution() {
  return (
    <section className="h-full px-4 md:px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-8 md:py-10">
      <div className="max-w-5xl w-full flex flex-col items-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-12"
        >
          <span className="text-brand-primary font-bold text-[8px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-3 block">NUESTRA SOLUCIÓN</span>
          <h2 className="font-display text-2xl md:text-6xl text-[#0B1B3D] font-bold tracking-tight">
            ¿Qué ofrece <span className="text-brand-primary">ReAct<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>va</span>?
          </h2>
        </motion.div>

        {/* Radial Hub */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-2xl mx-auto mb-6 md:mb-12"
        >
          {/* Center Circle — ReActiva */}
          <div className="flex justify-center mb-0">
            <div className="relative">
              {/* Decorative ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute -inset-3 md:-inset-5 rounded-full border-2 border-dashed border-brand-primary/15"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -inset-6 md:-inset-10 rounded-full border border-brand-primary/8"
              />
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-brand-primary flex items-center justify-center shadow-2xl relative z-10">
                <span className="font-display text-white font-bold text-sm md:text-xl tracking-tight">
                  ReAct<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.15em] h-[0.15em] bg-white rounded-full"></span></span>va
                </span>
              </div>
            </div>
          </div>

          {/* Benefit Items around center */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-10">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Connector line (desktop) */}
                <div className="hidden md:block w-px h-4 bg-brand-primary/15 mb-2" />
                
                <div className={`w-11 h-11 md:w-16 md:h-16 ${item.bg} rounded-full flex items-center justify-center mb-2 md:mb-3 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className={item.color} size={20} />
                </div>
                <span className="font-display text-sm md:text-base font-bold text-[#0B1B3D] tracking-tight">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-3xl"
        >
          <div className="relative bg-white rounded-[20px] md:rounded-[32px] p-5 md:p-8 shadow-lg border border-slate-50 text-center">
            {/* Accent bar */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-12 md:w-16 h-1 bg-brand-primary rounded-b-full" />
            
            <p className="font-display text-sm md:text-xl text-[#0B1B3D] font-bold leading-snug md:leading-relaxed tracking-tight">
              "Cuando las personas se sienten mejor, trabajan mejor.{' '}
              <span className="text-brand-primary">Y cuando trabajan mejor, toda la empresa crece.</span>"
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

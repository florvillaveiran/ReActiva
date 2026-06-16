import { motion } from 'motion/react';
import { Zap, Target, Smile, Rocket, ChevronDown } from 'lucide-react';

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
          className="text-center mb-6 md:mb-10"
        >
          <span className="text-brand-primary font-bold text-[8px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-3 block">NUESTRA SOLUCIÓN</span>
          <h2 className="font-display text-2xl md:text-6xl text-[#0B1B3D] font-bold tracking-tight">
            ¿Qué camb<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>a ReAct<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>va en tu equ<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>po?
          </h2>
        </motion.div>

        {/* Vertical Flow */}
        <div className="flex flex-col items-center mb-6 md:mb-10">
          {benefits.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="flex flex-col items-center"
            >
              {/* Benefit item */}
              <div className="flex items-center gap-2.5 md:gap-3 group">
                <div className={`w-10 h-10 md:w-14 md:h-14 ${item.bg} rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className={item.color} size={20} />
                </div>
                <span className="font-display text-base md:text-xl font-bold text-[#0B1B3D] tracking-tight">{item.label}</span>
              </div>

              {/* Arrow connector (not after last item) */}
              {index < benefits.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 + 0.08 }}
                  className="flex flex-col items-center my-1.5 md:my-2 origin-top"
                >
                  <div className="w-px h-5 md:h-7 bg-brand-primary/25" />
                  <ChevronDown size={14} className="text-brand-primary/40 -mt-1" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

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
              "Cuando las personas recuperan energía durante la jornada, trabajan con mayor concentración,{' '}
              <span className="text-brand-primary">disfrutan más su trabajo y generan mejores resultados.</span>"
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

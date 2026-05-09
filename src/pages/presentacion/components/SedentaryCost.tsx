import { motion } from 'motion/react';
import { Brain, Timer, Activity, ZapOff, TriangleAlert } from 'lucide-react';

const risks = [
  {
    icon: Brain,
    title: "Mayor fatiga mental",
    desc: "Reducción del flujo sanguíneo cerebral.",
    color: "bg-red-100",
    onColor: "text-red-600"
  },
  {
    icon: Timer,
    title: "+4 horas sentado",
    desc: "Punto crítico para el metabolismo muscular.",
    color: "bg-red-100",
    onColor: "text-red-600"
  },
  {
    icon: Activity,
    title: "Dolencias musculares",
    desc: "Tensión acumulada en cuello y lumbares.",
    color: "bg-red-100",
    onColor: "text-red-600"
  },
  {
    icon: ZapOff,
    title: "Dificultad para desconectar",
    desc: "El sedentarismo está vinculado a mayores niveles de estrés residual post-laboral.",
    color: "bg-red-100",
    onColor: "text-red-600"
  }
];

export default function SedentaryCost() {
  return (
    <section className="h-full px-4 md:px-6 flex items-center justify-center bg-brand-cream overflow-hidden py-8 md:py-10">
      <div className="max-w-7xl w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8 items-center">
        
        {/* Text Section */}
        <div className="lg:col-span-5 flex flex-col gap-2 md:gap-4 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl sm:text-4xl md:text-6xl text-[#0B1B3D] tracking-tight mb-1 md:mb-4 font-bold">
              El Costo del Sedentar<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>smo
            </h2>
            <p className="font-sans text-[13px] sm:text-base md:text-lg text-brand-on-surface-variant max-w-lg mb-2 md:mb-6 leading-tight">
              La inactividad prolongada no es solo un hábito, es una barrera invisible que compromete tu vitalidad diaria.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 md:gap-2">
            {risks.map((risk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm border border-slate-50 flex items-center gap-3 md:gap-4"
              >
                <div className={`${risk.color} ${risk.onColor} w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0`}>
                  <risk.icon size={14} md:size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-on-surface text-[13px] md:text-base leading-tight">{risk.title}</h4>
                  <p className="text-[10px] md:text-sm text-brand-on-surface-variant/70 font-medium leading-tight">{risk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visual Impact Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 order-1 lg:order-2 relative w-full"
        >
          <div className="overflow-hidden rounded-[20px] md:rounded-[32px] shadow-2xl relative max-h-[20vh] sm:max-h-[35vh] md:max-h-none">
            <img 
              alt="Person sleeping at desk" 
              className="w-full h-full object-cover" 
              src="/sedentarismo-costo.jpg" 
            />
            {/* Warning Overlay Label */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-3 left-3 md:bottom-6 md:left-6 bg-white/90 backdrop-blur-md px-3 md:px-4 py-1 md:py-2 rounded-lg flex items-center gap-2 border border-white/40 shadow-xl"
            >
              <TriangleAlert className="text-brand-primary" size={10} md:size={12} />
              <span className="font-bold text-brand-on-surface text-[9px] md:text-xs">Riesgo Ergonómico Detectado</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

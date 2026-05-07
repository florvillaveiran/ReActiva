import { motion } from 'motion/react';
import { DollarSign, Clock, Zap, Target, LineChart, ArrowLeftRight } from 'lucide-react';

const comparisonData = [
  {
    label: "Costo",
    icon: DollarSign,
    trad: { title: "Alto costo", desc: "Inversión significativa por sesión presencial." },
    digital: { title: "Menor y escalable", desc: "Llega a toda la organización sin costos lineales." }
  },
  {
    label: "Tiempo",
    icon: Clock,
    trad: { title: "20-30 min tiempo", desc: "Logística compleja y traslados internos." },
    digital: { title: "5-8 min tiempo", desc: "Micro-pausas efectivas sin perder enfoque." }
  },
  {
    label: "Flujo",
    icon: Zap,
    trad: { title: "Cortan la jornada", desc: "Interrupción del flujo de trabajo creativo." },
    digital: { title: "Se integran", desc: "Diseñado para fluir con el ritmo laboral." }
  },
  {
    label: "Ritmo",
    icon: Target,
    trad: { title: "Baja frecuencia", desc: "Eventos aislados sin continuidad real." },
    digital: { title: "Alta y sostenida frecuencia", desc: "Generación de hábitos diarios y duraderos." }
  },
  {
    label: "Datos",
    icon: LineChart,
    trad: { title: "Difícil medición", desc: "Retorno de inversión (ROI) opaco y subjetivo." },
    digital: { title: "Medible y reportable", desc: "Analítica en tiempo real para decisiones RRHH." }
  }
];

export default function Comparison() {
  return (
    <section className="h-full px-4 md:px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-8 md:py-10">
      <div className="max-w-7xl w-full flex flex-col h-full max-h-[85vh] md:max-h-none">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-3 md:mb-8 shrink-0"
        >
          <span className="inline-block py-1 md:py-1.5 px-3 md:px-4 rounded-full bg-[#E0F2F1] text-brand-primary font-bold text-[8px] md:text-xs uppercase tracking-widest mb-2 md:mb-4 border border-brand-primary/10">
            EFICIENCIA CORPORATIVA
          </span>
          <h2 className="font-display text-2xl md:text-6xl text-brand-on-surface font-bold mb-1 md:mb-4 tracking-tight">Virtual gana siempre.</h2>
          <p className="font-sans text-[13px] md:text-lg text-brand-on-surface-variant max-w-2xl mx-auto font-medium leading-tight">
            La brecha entre el bienestar tradicional y la productividad moderna se cierra con tecnología.
          </p>
        </motion.div>

        <div className="flex-grow overflow-y-auto pr-1 md:pr-0 pb-10 md:pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-2 md:gap-4 items-stretch">
            
            {/* Traditional Column */}
            <div className="lg:col-span-5 space-y-1.5">
               <h3 className="font-display italic text-sm md:text-lg text-brand-on-surface-variant/40 mb-1 md:mb-3 pl-2">Tradicional</h3>
               {comparisonData.map((item, i) => (
                  <div key={i} className="bg-white/50 md:bg-white p-2 md:p-3 rounded-xl flex items-center gap-3 md:gap-4 border border-slate-50 shadow-sm min-h-[50px] md:min-h-[70px]">
                     <div className="bg-slate-50 p-1.5 md:p-2 rounded-lg text-brand-on-surface-variant/30">
                        <item.icon size={14} md:size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-brand-on-surface text-[12px] md:text-base mb-0.5">{item.trad.title}</h4>
                        <p className="text-[9px] md:text-xs text-brand-on-surface-variant/60 font-medium leading-tight">{item.trad.desc}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Center Column - Labels (Desktop Only) */}
            <div className="hidden lg:flex lg:col-span-1 relative flex-col space-y-2">
               <div className="absolute top-12 bottom-4 w-px bg-slate-100 left-1/2 -translate-x-1/2 z-0"></div>
               <h3 className="font-display text-lg mb-3 invisible">Label</h3>
               {comparisonData.map((item, i) => (
                  <div key={i} className="min-h-[70px] flex items-center justify-center relative z-10">
                     <span className="bg-white py-1.5 px-3 md:px-4 rounded-full text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-widest border border-brand-primary/20 shadow-sm">
                        {item.label}
                     </span>
                  </div>
               ))}
            </div>

            {/* Digital Column */}
            <div className="lg:col-span-5 space-y-1.5 mt-2 lg:mt-0">
               <h3 className="font-display font-bold text-sm md:text-lg text-brand-primary mb-1 md:mb-3 pl-2">Digital-First</h3>
               {comparisonData.map((item, i) => (
                  <div key={i} className="bg-white p-2 md:p-3 rounded-xl flex items-center gap-3 md:gap-4 border-slate-100 border shadow-md min-h-[50px] md:min-h-[70px]">
                     <div className="bg-[#E0F2F1] p-1.5 md:p-2 rounded-lg text-brand-primary">
                        <item.icon size={14} md:size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-brand-on-surface text-[12px] md:text-base mb-0.5">{item.digital.title}</h4>
                        <p className="text-[9px] md:text-xs text-brand-on-surface-variant/60 font-medium leading-tight">{item.digital.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

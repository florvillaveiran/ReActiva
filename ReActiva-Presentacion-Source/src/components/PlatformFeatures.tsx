import { motion } from 'motion/react';
import { CalendarRange, Timer, LineChart, BellRing, UserCheck, Play, Accessibility } from 'lucide-react';

export default function PlatformFeatures() {
  return (
    <section className="h-full px-6 flex flex-col justify-center bg-brand-cream overflow-hidden py-10">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 md:gap-6">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-brand-primary">
            <Timer className="animate-pulse" size={18} />
            <span className="font-bold text-xs md:text-sm uppercase tracking-widest">MÓDULO DE BIENESTAR</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-brand-on-surface font-bold leading-tight tracking-tight">
            Pausas Activas + Seguimiento
          </h2>
          <p className="font-sans text-base md:text-lg text-brand-on-surface-variant max-w-2xl leading-relaxed font-medium">
            Impulsamos la vitalidad laboral a través de micro-hábitos. Menos sedentarismo, más energía.
          </p>
        </motion.header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Platform Mockup Visual */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="lg:col-span-8 relative overflow-hidden rounded-[32px] bg-white shadow-xl border border-slate-50 min-h-[300px]"
          >
            <div className="absolute inset-0">
               <img 
                alt="Plataforma propia dashboard" 
                className="w-full h-full object-cover" 
                src="/plataforma-propia.png" 
              />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/40 shadow-xl"
              >
                <LineChart className="text-brand-primary" size={16} />
                <span className="font-bold text-brand-on-surface text-sm tracking-tight">Uso de plataforma propia</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <motion.div 
              className="bg-[#E0F2F1] p-6 lg:p-10 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm h-1/2"
            >
              <h4 className="font-display text-5xl text-brand-primary mb-2 font-bold tracking-tight">3 veces</h4>
              <p className="font-bold text-brand-primary/60 uppercase tracking-widest text-xs">POR SEMANA</p>
            </motion.div>

            <motion.div 
              className="bg-white py-6 lg:p-10 rounded-[32px] border border-slate-50 shadow-lg flex flex-col items-center justify-center text-center h-1/2"
            >
              <h4 className="font-display text-5xl text-brand-on-surface mb-2 font-bold tracking-tight">5 a 10 min</h4>
              <p className="font-bold text-brand-on-surface-variant/60 uppercase tracking-widest text-xs">POR SESIÓN</p>
            </motion.div>
          </div>
        </div>

        {/* Feature Icons Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: LineChart, label: "Seguimiento Real", desc: "Dashboard para RRHH con métricas." },
            { icon: BellRing, label: "Notificaciones", desc: "Alertas no invasivas al movimiento." },
            { icon: Accessibility, label: "Ejercicios Validados", desc: "Rutinas por especialistas." }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              className="bg-white rounded-xl border border-slate-50 shadow-sm p-4 flex items-center gap-4 transition-all cursor-default"
            >
              <div className="p-2 bg-[#E0F2F1] rounded-lg text-brand-primary">
                <feat.icon size={16} />
              </div>
              <div>
                 <p className="font-bold text-brand-on-surface text-sm">{feat.label}</p>
                 <p className="text-xs text-brand-on-surface-variant/70 leading-tight font-medium">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

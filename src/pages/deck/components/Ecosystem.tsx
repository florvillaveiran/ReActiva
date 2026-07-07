import { motion } from 'motion/react';
import { Play, Brain, Lightbulb, BarChart3, CheckCircle2, MonitorPlay, HeartHandshake, Leaf, TrendingUp } from 'lucide-react';

const leftFeatures = [
  {
    title: 'Microentrenamientos',
    text: 'Videos de 3 a 8 minutos diseñados para integrarse en la jornada laboral.',
    icon: MonitorPlay,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'ReActiva Academia',
    text: 'Cursos y contenidos prácticos sobre salud, ergonomía, hábitos, descanso y más.',
    icon: Brain,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'ReActiva Tips',
    text: 'Consejos breves y accionables cada semana para crear hábitos saludables.',
    icon: Lightbulb,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
];

const rightFeatures = [
  {
    title: 'Reportes para RRHH',
    text: 'Métricas de participación, adherencia e impacto para tomar mejores decisiones.',
    icon: BarChart3,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Seguimiento automático',
    text: 'Recordatorios, formularios y monitoreo continuo sin aumentar la carga de RRHH.',
    icon: CheckCircle2,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Espacio laboral',
    text: 'Evaluación del puesto de trabajo y recomendaciones para mejorar ergonomía y bienestar.',
    icon: HeartHandshake,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
];

export default function Ecosystem() {
  return (
    <section className="h-full overflow-hidden bg-brand-cream px-5 py-6 md:px-10 md:py-7 flex flex-col justify-center items-center">
      <div className="presentation-safe mx-auto flex h-full max-w-[1300px] flex-col items-center justify-between w-full relative">
        
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center pt-4 md:pt-8 w-full z-10"
        >
          <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.32em] text-brand-primary">
            EL ECOSISTEMA REACTIVA
          </span>
          <h2 className="font-display text-[2.2rem] md:text-[3.2rem] font-bold leading-tight text-[#0B1B3D]">
            Una plataforma. <span className="text-brand-primary">Todo el bienestar</span> de tu equipo.
          </h2>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 w-full flex items-center justify-center relative mt-8 mb-12">
          
          {/* Laptop Mockup (Center) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-[80%] max-w-[500px] xl:max-w-[550px] mx-auto drop-shadow-2xl"
          >
            {/* Screen border */}
            <div className="bg-[#1A1A1A] p-2 md:p-3 rounded-t-[20px] md:rounded-t-[30px] w-full aspect-[16/10] relative shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-[1px] border-[#333]">
              {/* Webcam dot */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#333]"></div>
              
              {/* Screen content */}
              <div className="bg-white w-full h-full rounded-[10px] md:rounded-[18px] overflow-hidden">
                <img 
                  src="/plataforma-propia.png" 
                  alt="Plataforma ReActiva" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            
            {/* Keyboard base */}
            <div className="w-[115%] -ml-[7.5%] h-3 md:h-5 bg-[#333] rounded-b-[10px] md:rounded-b-[20px] relative shadow-2xl border-t-[1px] border-[#444]">
              {/* Trackpad notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1.5 md:h-2 bg-[#222] rounded-b-md"></div>
            </div>
          </motion.div>

          {/* Left Features */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-8 md:gap-12 w-full max-w-[320px] z-20 hidden lg:flex">
            {leftFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex items-start gap-4 text-right"
              >
                <div className="flex-1">
                  <h3 className="font-display font-bold text-[#0B1B3D] text-[1.1rem] leading-tight mb-1">{feature.title}</h3>
                  <p className="text-[#45516A] text-[0.85rem] leading-snug">{feature.text}</p>
                </div>
                <div className={`flex-shrink-0 w-14 h-14 rounded-full ${feature.bg} flex items-center justify-center border border-emerald-100 shadow-sm relative`}>
                  <feature.icon className={feature.color} size={24} strokeWidth={2} />
                  {/* Connector Line */}
                  <div className="absolute right-[-40px] top-1/2 h-[1px] w-[40px] bg-emerald-200" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Features */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-8 md:gap-12 w-full max-w-[320px] z-20 hidden lg:flex">
            {rightFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex items-start gap-4"
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-full ${feature.bg} flex items-center justify-center border border-emerald-100 shadow-sm relative`}>
                  <feature.icon className={feature.color} size={24} strokeWidth={2} />
                  {/* Connector Line */}
                  <div className="absolute left-[-40px] top-1/2 h-[1px] w-[40px] bg-emerald-200" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-[#0B1B3D] text-[1.1rem] leading-tight mb-1">{feature.title}</h3>
                  <p className="text-[#45516A] text-[0.85rem] leading-snug">{feature.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Mobile Features List (visible only on small screens) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden mb-10 overflow-y-auto pr-2">
           {[...leftFeatures, ...rightFeatures].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-white p-4 rounded-[16px] shadow-sm border border-slate-100"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${feature.bg} flex items-center justify-center border border-emerald-100`}>
                  <feature.icon className={feature.color} size={20} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-[#0B1B3D] text-[1rem] leading-tight mb-1">{feature.title}</h3>
                  <p className="text-[#45516A] text-[0.8rem] leading-snug">{feature.text}</p>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Footer Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pb-4 md:pb-8 w-full flex justify-center z-10"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 bg-white px-8 py-4 rounded-full shadow-[0_12px_30px_rgba(11,27,61,0.08)] border border-slate-100">
            <div className="flex items-center gap-3">
               <div className="bg-emerald-100 p-1.5 rounded-full text-brand-primary">
                 <Leaf size={18} />
               </div>
               <span className="font-display font-bold text-[#0B1B3D] text-[1.05rem]">
                  Bienestar para tu <span className="text-brand-primary">equipo.</span>
               </span>
            </div>
            <div className="hidden md:block w-[1px] h-8 bg-slate-200"></div>
            <div className="flex items-center gap-3">
               <div className="bg-emerald-100 p-1.5 rounded-full text-brand-primary">
                 <TrendingUp size={18} />
               </div>
               <span className="font-display font-bold text-[#0B1B3D] text-[1.05rem]">
                  Resultados para tu <span className="text-brand-primary">empresa.</span>
               </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

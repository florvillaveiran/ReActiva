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
              
              {/* Screen content - Recreated New Dashboard UI */}
              <div className="bg-[#F8FAFC] w-full h-full rounded-[10px] md:rounded-[18px] overflow-hidden flex text-left font-sans">
                {/* Sidebar */}
                <div className="w-[22%] bg-white h-full border-r border-slate-100 flex flex-col pt-3 md:pt-4">
                   <div className="flex items-center gap-1.5 mb-4 md:mb-6 px-3 md:px-4">
                     <img src="/logo-reactiva-dark.png" alt="ReActiva" className="h-3 md:h-5 object-contain" />
                   </div>
                   
                   <div className="flex flex-col gap-1 md:gap-2 px-2 md:px-3 text-[0.4rem] md:text-[0.65rem] text-slate-500 font-medium">
                     <div className="flex items-center gap-2 text-brand-primary bg-emerald-50 border border-emerald-200 p-1.5 md:p-2 rounded-lg">
                       <Play className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Mi Programa
                     </div>
                     <div className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-slate-50 rounded-lg">
                       <TrendingUp className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Mi Progreso
                     </div>
                     <div className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-slate-50 rounded-lg">
                       <Lightbulb className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> ReActiva Tips
                     </div>
                     <div className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-slate-50 rounded-lg">
                       <Brain className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Academia ReActiva
                     </div>
                   </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-2 md:p-4 flex flex-col h-full overflow-hidden">
                   
                   {/* Top Header */}
                   <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-3 mb-2 md:mb-3 shadow-sm border border-slate-100 flex justify-between items-center">
                     <div className="flex items-center gap-2 md:gap-3">
                       <div className="text-[0.8rem] md:text-xl">👋</div>
                       <h1 className="text-[0.55rem] md:text-[0.95rem] font-bold text-slate-900 leading-tight">¡Hola, Equipo!</h1>
                     </div>
                     
                     <div className="flex items-center gap-4 md:gap-8">
                       <div className="text-center">
                         <div className="text-[0.35rem] md:text-[0.55rem] font-bold text-slate-400 tracking-wider">PROGRESO</div>
                         <div className="text-[0.65rem] md:text-xl font-bold text-brand-primary leading-none">85%</div>
                       </div>
                       
                       <div className="flex gap-1 md:gap-1.5">
                         <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[0.35rem] md:text-[0.6rem] font-bold">L</div>
                         <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[0.35rem] md:text-[0.6rem] font-bold">M</div>
                         <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[0.35rem] md:text-[0.6rem] font-bold">V</div>
                       </div>
                     </div>
                   </div>
                   
                   {/* Video Area */}
                   <div className="flex-1 bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
                     
                     {/* Video Player Mockup */}
                     <div className="flex-1 bg-slate-900 relative group overflow-hidden">
                       {/* Abstract placeholder background instead of the photo */}
                       <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center opacity-80">
                         {/* Play Button */}
                         <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 cursor-pointer">
                           <Play className="text-white w-4 h-4 md:w-6 md:h-6 ml-1" fill="currentColor" />
                         </div>
                       </div>
                       
                       {/* Overlay info */}
                       <div className="absolute bottom-0 left-0 w-full p-3 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                         <div className="inline-block bg-brand-primary text-white text-[0.35rem] md:text-[0.65rem] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full mb-1 md:mb-2 uppercase tracking-wider">
                           Recomendado ahora
                         </div>
                         <h2 className="text-white text-[0.8rem] md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-md">Respiración consciente</h2>
                         <div className="flex items-center gap-1 md:gap-2 text-white/90 text-[0.45rem] md:text-[0.85rem]">
                           <span>🕒</span> 9 min de bienestar para tu cuerpo
                         </div>
                       </div>
                     </div>
                     
                     
                   </div>
                </div>
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

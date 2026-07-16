import { motion } from 'motion/react';
import {
  BarChart3,
  Brain,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  Lightbulb,
  MonitorPlay,
  TrendingUp,
} from 'lucide-react';

const leftFeatures = [
  {
    title: 'Microentrenamientos',
    text: 'Videos de 3 a 8 minutos disenados para integrarse en la jornada laboral.',
    icon: MonitorPlay,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'ReActiva Academia',
    text: 'Cursos y contenidos practicos sobre salud, ergonomia, habitos, descanso y mas.',
    icon: Brain,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'ReActiva Tips',
    text: 'Consejos breves y accionables cada semana para crear habitos saludables.',
    icon: Lightbulb,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
];

const rightFeatures = [
  {
    title: 'Reportes para RRHH',
    text: 'Metricas de participacion, adherencia e impacto para tomar mejores decisiones.',
    icon: BarChart3,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Seguimiento automatico',
    text: 'Recordatorios, formularios y monitoreo continuo sin aumentar la carga de RRHH.',
    icon: CheckCircle2,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Espacio laboral',
    text: 'Evaluacion del puesto de trabajo y recomendaciones para mejorar ergonomia y bienestar.',
    icon: HeartHandshake,
    color: 'text-brand-primary',
    bg: 'bg-emerald-50',
  },
];

function DashboardScreen() {
  return (
    <svg
      className="deck-dashboard-screen block h-full w-full bg-[#F7FAF8]"
      viewBox="0 0 960 576"
      role="img"
      aria-label="Panel ReActiva con una recomendación de respiración consciente"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="deckFeatureGlow" cx="72%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#126C40" stopOpacity="0.48" />
          <stop offset="55%" stopColor="#071426" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#050816" />
        </radialGradient>
      </defs>

      <rect width="960" height="576" fill="#F7FAF8" />
      <rect width="238" height="576" fill="#FFFFFF" />
      <line x1="238" y1="0" x2="238" y2="576" stroke="#E8EEF0" />

      <image href="/logo-reactiva-dark.png" x="28" y="28" width="180" height="54" preserveAspectRatio="xMinYMid meet" />

      <rect x="28" y="116" width="182" height="62" rx="16" fill="#EAFBF3" stroke="#B8EED4" />
      <text x="55" y="153" fill="#126C40" fontSize="17" fontWeight="800">▷</text>
      <text x="88" y="153" fill="#126C40" fontSize="18" fontWeight="800">Mi Programa</text>
      <text x="55" y="231" fill="#64748B" fontSize="18" fontWeight="700">↗</text>
      <text x="88" y="231" fill="#64748B" fontSize="18" fontWeight="700">Mi Progreso</text>
      <Lightbulb x={48} y={287} width={22} height={22} color="#64748B" strokeWidth={2} />
      <text x="88" y="306" fill="#64748B" fontSize="18" fontWeight="700">ReActiva Tips</text>
      <Brain x={48} y={358} width={22} height={22} color="#64748B" strokeWidth={2} />
      <text x="88" y="374" fill="#64748B" fontSize="18" fontWeight="700">
        <tspan x="88" dy="0">Academia</tspan>
        <tspan x="88" dy="22">ReActiva</tspan>
      </text>

      <rect x="276" y="36" width="640" height="132" rx="30" fill="#FFFFFF" stroke="#EEF2F3" />
      <circle cx="346" cy="102" r="39" fill="#FFF5CE" />
      <text x="346" y="112" textAnchor="middle" fill="#ECA100" fontSize="31" fontWeight="900">H</text>
      <text x="399" y="92" fill="#081126" fontSize="27" fontWeight="900">
        <tspan x="399" dy="0">Hola,</tspan>
        <tspan x="399" dy="31">Equipo!</tspan>
      </text>
      <text x="615" y="81" fill="#94A3B8" fontSize="13" fontWeight="900" letterSpacing="3">PROGRESO</text>
      <text x="615" y="124" fill="#126C40" fontSize="43" fontWeight="900">85%</text>
      <circle cx="770" cy="102" r="28" fill="#126C40" />
      <circle cx="837" cy="102" r="28" fill="#126C40" />
      <circle cx="898" cy="102" r="28" fill="#F0F4F7" />
      <text x="770" y="110" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">L</text>
      <text x="837" y="110" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">M</text>
      <text x="898" y="110" textAnchor="middle" fill="#94A3B8" fontSize="18" fontWeight="900">V</text>

      <rect x="276" y="194" width="640" height="330" rx="30" fill="url(#deckFeatureGlow)" />
      <rect x="320" y="238" width="310" height="44" rx="22" fill="#16834E" />
      <text x="475" y="267" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900" letterSpacing="4">RECOMENDADO AHORA</text>
      <text x="320" y="388" fill="#FFFFFF" fontSize="50" fontWeight="900" letterSpacing="-2">
        <tspan x="320" dy="0">Respiración</tspan>
        <tspan x="320" dy="54">consciente</tspan>
      </text>
      <circle cx="339" cy="483" r="20" fill="#FFFFFF" fillOpacity="0.14" />
      <text x="339" y="491" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">5</text>
      <text x="374" y="491" fill="#E7EDF5" fontSize="21" fontWeight="800">min de bienestar para tu cuerpo</text>
    </svg>
  );
}

export default function Ecosystem() {
  return (
    <section className="deck-ecosystem flex h-full flex-col items-center justify-center overflow-hidden bg-brand-cream px-5 py-6 md:px-10 md:py-7">
      <div className="presentation-safe relative mx-auto flex h-full w-full max-w-[1300px] flex-col items-center justify-between">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="z-10 w-full pt-4 text-center md:pt-8"
        >
          <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.32em] text-brand-primary">
            EL ECOSISTEMA REACTIVA
          </span>
          <h2 className="font-display text-[2.2rem] font-bold leading-tight text-[#0B1B3D] md:text-[3.2rem]">
            Una plataforma. <span className="text-brand-primary">Todo el bienestar</span> de tu equipo.
          </h2>
        </motion.header>

        <div className="relative mb-12 mt-8 flex w-full flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto w-[80%] max-w-[500px] drop-shadow-2xl xl:max-w-[550px]"
          >
            <div className="relative aspect-[16/10] w-full rounded-t-[20px] border border-[#333] bg-[#1A1A1A] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)] md:rounded-t-[30px] md:p-3">
              <div className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#333]" />
              <DashboardScreen />
            </div>

            <div className="relative -ml-[7.5%] h-3 w-[115%] rounded-b-[10px] border-t border-[#444] bg-[#333] shadow-2xl md:h-5 md:rounded-b-[20px]">
              <div className="absolute left-1/2 top-0 h-1.5 w-16 -translate-x-1/2 rounded-b-md bg-[#222] md:h-2 md:w-24" />
            </div>
          </motion.div>

          <div className="absolute left-0 top-1/2 z-20 hidden w-full max-w-[320px] -translate-y-1/2 flex-col gap-8 md:gap-12 lg:flex">
            {leftFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex items-start gap-4 text-right"
              >
                <div className="flex-1">
                  <h3 className="font-display mb-1 text-[1.1rem] font-bold leading-tight text-[#0B1B3D]">{feature.title}</h3>
                  <p className="text-[0.85rem] leading-snug text-[#45516A]">{feature.text}</p>
                </div>
                <div className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-emerald-100 ${feature.bg} shadow-sm`}>
                  <feature.icon className={feature.color} size={24} strokeWidth={2} />
                  <div className="absolute right-[-40px] top-1/2 h-px w-[40px] bg-emerald-200" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute right-0 top-1/2 z-20 hidden w-full max-w-[320px] -translate-y-1/2 flex-col gap-8 md:gap-12 lg:flex">
            {rightFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex items-start gap-4"
              >
                <div className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-emerald-100 ${feature.bg} shadow-sm`}>
                  <feature.icon className={feature.color} size={24} strokeWidth={2} />
                  <div className="absolute left-[-40px] top-1/2 h-px w-[40px] bg-emerald-200" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display mb-1 text-[1.1rem] font-bold leading-tight text-[#0B1B3D]">{feature.title}</h3>
                  <p className="text-[0.85rem] leading-snug text-[#45516A]">{feature.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-10 grid w-full grid-cols-1 gap-6 overflow-y-auto pr-2 md:grid-cols-2 lg:hidden">
          {[...leftFeatures, ...rightFeatures].map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 rounded-[16px] border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-emerald-100 ${feature.bg}`}>
                <feature.icon className={feature.color} size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-display mb-1 text-[1rem] font-bold leading-tight text-[#0B1B3D]">{feature.title}</h3>
                <p className="text-[0.8rem] leading-snug text-[#45516A]">{feature.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="z-10 flex w-full justify-center pb-4 md:pb-8"
        >
          <div className="flex flex-col items-center justify-center gap-3 rounded-full border border-slate-100 bg-white px-8 py-4 shadow-[0_12px_30px_rgba(11,27,61,0.08)] md:flex-row md:gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-1.5 text-brand-primary">
                <Leaf size={18} />
              </div>
              <span className="font-display text-[1.05rem] font-bold text-[#0B1B3D]">
                Bienestar para tu <span className="text-brand-primary">equipo.</span>
              </span>
            </div>
            <div className="hidden h-8 w-px bg-slate-200 md:block" />
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-1.5 text-brand-primary">
                <TrendingUp size={18} />
              </div>
              <span className="font-display text-[1.05rem] font-bold text-[#0B1B3D]">
                Resultados para tu <span className="text-brand-primary">empresa.</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import {
  BarChart3,
  Brain,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  Lightbulb,
  MonitorPlay,
  Play,
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
    <div className="grid h-full w-full grid-cols-[25%_1fr] overflow-hidden rounded-[10px] bg-[#F7FAF8] text-left font-sans md:rounded-[18px]">
      <aside className="flex min-w-0 flex-col border-r border-slate-100 bg-white px-[3.8%] py-[6%]">
        <img
          src="/logo-reactiva-dark.png"
          alt="ReActiva"
          className="mb-[18%] h-[8%] w-fit max-w-[92%] object-contain"
        />

        <nav className="flex flex-col gap-[5%] text-[0.42rem] font-bold text-slate-500 md:text-[0.56rem]">
          <div className="flex items-center gap-[8%] rounded-[10px] border border-emerald-100 bg-emerald-50 px-[10%] py-[9%] text-brand-primary">
            <Play className="h-[1em] w-[1em] shrink-0" />
            <span className="truncate">Mi Programa</span>
          </div>
          <div className="flex items-center gap-[8%] px-[10%] py-[7%]">
            <TrendingUp className="h-[1em] w-[1em] shrink-0" />
            <span className="truncate">Mi Progreso</span>
          </div>
          <div className="flex items-center gap-[8%] px-[10%] py-[7%]">
            <Lightbulb className="h-[1em] w-[1em] shrink-0" />
            <span className="truncate">ReActiva Tips</span>
          </div>
          <div className="flex items-center gap-[8%] px-[10%] py-[7%]">
            <Brain className="h-[1em] w-[1em] shrink-0" />
            <span className="leading-tight">Academia ReActiva</span>
          </div>
        </nav>
      </aside>

      <main className="flex min-w-0 flex-col gap-[5%] p-[5%]">
        <div className="flex h-[28%] items-center justify-between rounded-[18px] border border-slate-100 bg-white px-[5%] shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
          <div className="flex min-w-0 items-center gap-[7%]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF7D8] text-[0.85rem] font-black text-[#F0A400] md:h-11 md:w-11 md:text-[1.15rem]">
              H
            </div>
            <h1 className="min-w-0 text-[0.62rem] font-black leading-tight text-slate-950 md:text-[0.95rem]">
              Hola,<br className="hidden md:block" /> Equipo!
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-center">
              <p className="mb-0.5 text-[0.32rem] font-black tracking-[0.18em] text-slate-400 md:text-[0.46rem]">
                PROGRESO
              </p>
              <p className="text-[0.9rem] font-black leading-none text-brand-primary md:text-[1.45rem]">85%</p>
            </div>
            <div className="flex gap-1 md:gap-1.5">
              {['L', 'M', 'V'].map((day, index) => (
                <span
                  key={day}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.45rem] font-black md:h-7 md:w-7 md:text-[0.65rem] ${
                    index < 2 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[20px] bg-[#071022] p-[7%] shadow-[0_10px_25px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(18,108,64,0.34),transparent_38%),linear-gradient(135deg,#071022_0%,#050816_100%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <span className="w-fit rounded-full bg-brand-primary px-3 py-1 text-[0.42rem] font-black uppercase tracking-[0.16em] text-white md:text-[0.62rem]">
              Recomendado ahora
            </span>
            <div>
              <h2 className="mb-2 max-w-[88%] text-[1.05rem] font-black leading-[0.96] tracking-tight text-white md:text-[1.85rem]">
                Respiracion consciente
              </h2>
              <p className="flex items-center gap-2 text-[0.5rem] font-bold text-slate-200 md:text-[0.78rem]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 md:h-5 md:w-5">
                  5
                </span>
                min de bienestar para tu cuerpo
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Ecosystem() {
  return (
    <section className="flex h-full flex-col items-center justify-center overflow-hidden bg-brand-cream px-5 py-6 md:px-10 md:py-7">
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

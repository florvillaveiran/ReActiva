import { motion } from 'motion/react';
import { Clock, DollarSign, LineChart, Target, Zap } from 'lucide-react';

const comparisonData = [
  {
    label: 'Costo',
    icon: DollarSign,
    trad: { title: 'Alto costo', desc: 'Inversión significativa por sesión presencial.' },
    digital: { title: 'Menor y escalable', desc: 'Llega a toda la organización sin costos lineales.' },
  },
  {
    label: 'Tiempo',
    icon: Clock,
    trad: { title: '20-30 min tiempo', desc: 'Logística compleja y traslados internos.' },
    digital: { title: '5-10 min tiempo', desc: 'Micro-pausas efectivas sin perder enfoque.' },
  },
  {
    label: 'Flujo',
    icon: Zap,
    trad: { title: 'Cortan la jornada', desc: 'Interrupción del flujo de trabajo creativo.' },
    digital: { title: 'Se integran', desc: 'Diseñado para fluir con el ritmo laboral.' },
  },
  {
    label: 'Ritmo',
    icon: Target,
    trad: { title: 'Baja frecuencia', desc: 'Eventos aislados sin continuidad real.' },
    digital: { title: 'Alta y sostenida frecuencia', desc: 'Generación de hábitos diarios y duraderos.' },
  },
  {
    label: 'Datos',
    icon: LineChart,
    trad: { title: 'Difícil medición', desc: 'Retorno de inversión (ROI) opaco y subjetivo.' },
    digital: { title: 'Medible y reportable', desc: 'Analítica en tiempo real para decisiones RRHH.' },
  },
];

export default function Comparison() {
  return (
    <section className="h-full overflow-hidden bg-brand-cream px-5 py-7 md:px-10 md:py-8">
      <div className="mx-auto flex h-full max-w-[1380px] flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-7 shrink-0 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-brand-primary/10 bg-[#E0F2F1] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-primary">
            EFICIENCIA CORPORATIVA
          </span>
          <h2 className="mb-4 font-display text-[3.7rem] font-bold leading-none tracking-tight text-[#0B1B3D]">
            V<span className="relative inline-block">ı<span className="absolute left-1/2 top-[0.13em] h-[0.18em] w-[0.18em] -translate-x-1/2 rounded-full bg-brand-primary" /></span>rtual gana s<span className="relative inline-block">ı<span className="absolute left-1/2 top-[0.13em] h-[0.18em] w-[0.18em] -translate-x-1/2 rounded-full bg-brand-primary" /></span>empre.
          </h2>
          <p className="mx-auto max-w-3xl text-xl font-medium leading-tight text-brand-on-surface-variant">
            La brecha entre el bienestar tradicional y la productividad moderna se cierra con tecnología.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-stretch gap-5 overflow-y-auto pb-4 pr-1 lg:grid-cols-11 lg:overflow-visible lg:pr-0">
          <div className="space-y-2 lg:col-span-5">
            <h3 className="mb-4 pl-2 font-display text-xl italic text-brand-on-surface-variant/40">
              Tradicional
            </h3>
            {comparisonData.map((item, i) => (
              <div
                key={i}
                className="flex min-h-[82px] items-center gap-4 rounded-2xl border border-slate-50 bg-white p-4 shadow-sm"
              >
                <div className="rounded-xl bg-slate-50 p-2.5 text-brand-on-surface-variant/30">
                  <item.icon size={22} />
                </div>
                <div>
                  <h4 className="mb-0.5 text-lg font-bold text-brand-on-surface">{item.trad.title}</h4>
                  <p className="text-sm font-medium leading-tight text-brand-on-surface-variant/60">
                    {item.trad.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative hidden flex-col space-y-2 lg:col-span-1 lg:flex">
            <div className="absolute bottom-4 left-1/2 top-12 z-0 w-px -translate-x-1/2 bg-slate-100" />
            <h3 className="mb-4 font-display text-xl invisible">Label</h3>
            {comparisonData.map((item, i) => (
              <div key={i} className="relative z-10 flex min-h-[82px] items-center justify-center">
                <span className="rounded-full border border-brand-primary/20 bg-white px-4 py-2 text-sm font-bold uppercase tracking-widest text-brand-primary shadow-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-2 lg:col-span-5 lg:mt-0">
            <h3 className="mb-4 pl-2 font-display text-xl font-bold text-brand-primary">
              Digital-First
            </h3>
            {comparisonData.map((item, i) => (
              <div
                key={i}
                className="flex min-h-[82px] items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-md"
              >
                <div className="rounded-xl bg-[#E0F2F1] p-2.5 text-brand-primary">
                  <item.icon size={22} />
                </div>
                <div>
                  <h4 className="mb-0.5 text-lg font-bold text-brand-on-surface">{item.digital.title}</h4>
                  <p className="text-sm font-medium leading-tight text-brand-on-surface-variant/60">
                    {item.digital.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

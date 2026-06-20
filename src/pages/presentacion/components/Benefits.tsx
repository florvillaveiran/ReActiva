import { motion } from 'motion/react';
import { Activity, Brain, ShieldCheck, TrendingUp } from 'lucide-react';

const metrics = [
  {
    icon: TrendingUp,
    value: '+10%',
    label: 'en productividad\nlaboral',
    color: 'text-[#0B9B54]',
    bg: 'bg-[#E7F8EF]',
  },
  {
    icon: Activity,
    value: '-15%',
    label: 'en ausentismo\nlaboral',
    color: 'text-[#0B8F4A]',
    bg: 'bg-[#E7F8EF]',
  },
  {
    icon: Brain,
    value: '-25%',
    label: 'en errores\noperativos',
    color: 'text-[#2563EB]',
    bg: 'bg-[#EAF2FF]',
  },
  {
    icon: ShieldCheck,
    value: '-30%',
    label: 'en fatiga\nfísica y mental',
    color: 'text-[#0B9B54]',
    bg: 'bg-[#E7F8EF]',
  },
];

export default function Benefits() {
  return (
    <section className="h-full overflow-hidden bg-brand-cream px-5 py-7 md:px-10 md:py-8">
      <div className="presentation-safe mx-auto flex h-full max-w-[1240px] flex-col items-center">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center md:mb-7"
        >
          <span className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.32em] text-brand-primary">
            IMPACTO EN TU EMPRESA
          </span>
          <span className="mx-auto mb-5 block h-0.5 w-10 rounded-full bg-brand-primary" />
          <h2 className="font-display text-[2.2rem] font-bold leading-[1.05] tracking-tight text-[#0B1B3D] md:text-[3.55rem]">
            Resultados medibles. <span className="text-[#10A64A]">Impacto real.</span>
          </h2>
          <p className="mt-4 text-[1rem] font-bold leading-tight text-[#5D6678] md:text-[1.25rem]">
            El bienestar no solo se siente: también se mide.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-[1030px] rounded-[28px] border border-slate-200 bg-white px-8 py-7 shadow-[0_16px_38px_rgba(11,27,61,0.06)] md:px-10 md:py-8"
        >
          <h3 className="mb-7 text-center text-[0.82rem] font-bold uppercase tracking-[0.32em] text-[#2563EB] md:text-[0.92rem]">
            IMPACTO MEDIDO EN ORGANIZACIONES
          </h3>

          <div className="grid grid-cols-4 divide-x divide-slate-200">
            {metrics.map((metric, index) => (
              <div key={metric.value} className="flex flex-col items-center px-4 text-center">
                <div className={`mb-5 flex h-[92px] w-[92px] items-center justify-center rounded-full ${metric.bg}`}>
                  <metric.icon className={metric.color} size={38} strokeWidth={2.1} />
                </div>
                <div className={`font-display text-[3.45rem] font-bold leading-none tracking-tight ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="mt-5 whitespace-pre-line font-display text-[1.08rem] font-bold leading-tight text-[#0B1B3D]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid w-full max-w-[840px] grid-cols-[1fr_1px_1fr] items-center rounded-[22px] border border-slate-100 bg-white px-8 py-4 shadow-[0_16px_34px_rgba(11,27,61,0.07)]"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#078A43] text-white">
              <Activity size={25} strokeWidth={2.2} />
            </div>
            <p className="font-display text-base font-bold leading-tight text-[#0B1B3D]">
              Bienestar que impulsa resultados.
              <br />
              Resultados que hacen <span className="text-[#10A64A]">crecer tu empresa.</span>
            </p>
          </div>
          <div className="h-12 w-px bg-slate-200" />
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F8EF] text-[#10A64A]">
              <ShieldCheck size={25} strokeWidth={2.1} />
            </div>
            <p className="font-display text-base font-bold leading-tight text-[#0B1B3D]">
              Impacto <span className="text-[#10A64A]">medible.</span>
              <br />
              Decisiones con <span className="text-[#10A64A]">datos reales.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import {
  BarChart3,
  Leaf,
  Target,
  TrendingUp,
  User,
  UsersRound,
  Zap,
} from 'lucide-react';

const outcomes = [
  {
    title: 'Potencial\nhumano',
    text: 'Fortalece capacidades y\ndesempeño diario.',
    icon: Zap,
    color: 'text-[#F5B400]',
    bg: 'bg-[#FFF8E1]',
    dot: 'bg-[#F5B400]',
  },
  {
    title: 'Foco',
    text: 'Mejor concentración,\nmenos distracciones.',
    icon: Target,
    color: 'text-[#2588FF]',
    bg: 'bg-[#EAF3FF]',
    dot: 'bg-[#4BA3FF]',
  },
  {
    title: 'Bienestar',
    text: 'Equipos más sanos,\nmotivados y conectados.',
    icon: Leaf,
    color: 'text-[#12A951]',
    bg: 'bg-[#E9F8EE]',
    dot: 'bg-[#12A951]',
  },
  {
    title: 'Productividad',
    text: 'Más rendimiento,\nmejores resultados.',
    icon: TrendingUp,
    color: 'text-[#A855F7]',
    bg: 'bg-[#F5EAFE]',
    dot: 'bg-[#B262FF]',
  },
];

function GreenConnector() {
  return (
    <svg
      className="absolute left-0 top-1/2 hidden h-[36px] w-[155px] -translate-x-full -translate-y-1/2 lg:block"
      viewBox="0 0 155 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 18H55C75 18 75 4 96 4H140"
        stroke="#0BA64A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M140 4L150 14M140 4L150 -6"
        stroke="#0BA64A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 7)"
      />
    </svg>
  );
}

export default function Solution() {
  return (
    <section className="h-full overflow-hidden bg-brand-cream px-5 py-6 md:px-10 md:py-7">
      <div className="presentation-safe mx-auto flex h-full max-w-[1250px] flex-col items-center">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-3 text-center md:mb-4"
        >
          <span className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.32em] text-brand-primary md:text-[0.68rem]">
            NUESTRA SOLUCIÓN
          </span>
          <span className="mx-auto mb-2 block h-0.5 w-7 rounded-full bg-brand-primary" />
          <h2 className="font-display text-[2rem] font-bold leading-[1.02] tracking-tight text-[#0B1B3D] md:text-[3.25rem]">
            Impulsa equipos
            <br />
            que <span className="text-[#10A64A]">rinden mejor</span>
          </h2>
        </motion.header>

        <div className="grid w-full flex-1 grid-cols-1 items-center gap-4 lg:grid-cols-[330px_1fr] lg:gap-[155px]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mx-auto flex h-[300px] w-full max-w-[310px] flex-col items-center justify-center rounded-[24px] border-2 border-[#10A64A] bg-[#F5FFF8] text-center shadow-[0_22px_42px_rgba(16,166,74,0.08)] md:h-[330px]"
          >
            <div className="mb-6 flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#DDF5E7]">
              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#10A64A] text-white shadow-[0_12px_20px_rgba(16,166,74,0.25)]">
                <User size={29} strokeWidth={2.2} />
              </div>
            </div>
            <h3 className="font-display text-[1.4rem] font-bold leading-tight text-[#0B1B3D] md:text-[1.55rem]">
              Plataforma propia
            </h3>
            <p className="mt-4 max-w-[220px] text-[0.95rem] font-medium leading-relaxed text-[#45516A]">
              Tecnología de bienestar para impulsar a tu equipo
            </p>
          </motion.div>

          <div className="flex flex-col gap-2.5 md:gap-3">
            {outcomes.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative grid min-h-[68px] grid-cols-[78px_1fr_1px_1fr] items-center rounded-[18px] bg-white px-4 shadow-[0_14px_34px_rgba(11,27,61,0.07)]"
              >
                <GreenConnector />
                <span className={`absolute left-[39px] top-[-4px] h-1.5 w-1.5 rounded-full ${item.dot}`} />
                <div className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full bg-white shadow-[0_10px_26px_rgba(11,27,61,0.06)]">
                  <div className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${item.bg}`}>
                    <item.icon className={item.color} size={23} strokeWidth={2.1} />
                  </div>
                </div>
                <h3 className="whitespace-pre-line font-display text-[1.05rem] font-bold leading-tight text-[#0B1B3D]">
                  {item.title}
                </h3>
                <div className="h-9 w-px bg-slate-200" />
                <p className="whitespace-pre-line pl-6 text-[0.82rem] font-medium leading-relaxed text-[#2F3A51]">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="mt-4 grid w-full max-w-[760px] grid-cols-[1fr_1px_1fr] items-center rounded-[18px] bg-white px-7 py-3.5 shadow-[0_16px_34px_rgba(11,27,61,0.07)]"
        >
          <div className="flex items-center justify-center gap-4">
            <UsersRound className="text-[#10A64A]" size={27} strokeWidth={2} />
            <p className="font-display text-base font-bold text-[#0B1B3D]">
              Bienestar para las <span className="text-[#10A64A]">personas.</span>
            </p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="flex items-center justify-center gap-4">
            <BarChart3 className="text-[#10A64A]" size={29} strokeWidth={2} />
            <p className="font-display text-base font-bold text-[#0B1B3D]">
              Resultados para la <span className="text-[#10A64A]">empresa.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

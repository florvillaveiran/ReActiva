import { motion } from 'motion/react';
import { UserRound, AlarmClock, Stethoscope, TrendingUp, BookOpen } from 'lucide-react';

const stats = [
  {
    icon: UserRound,
    value: 'Hasta 50%',
    desc: 'de los trabajadores de oficina reportan dolor musculoesquelético.',
    color: 'bg-red-50',
    onColor: 'text-red-600',
    border: 'border-red-100',
  },
  {
    icon: AlarmClock,
    value: '65–75%',
    desc: 'de la jornada laboral transcurre en posición sentada.',
    color: 'bg-amber-50',
    onColor: 'text-amber-600',
    border: 'border-amber-100',
  },
  {
    icon: Stethoscope,
    value: '60–80%',
    desc: 'de quienes presentan dolor continúan trabajando con molestias (presentismo).',
    color: 'bg-orange-50',
    onColor: 'text-orange-600',
    border: 'border-orange-100',
  },
  {
    icon: TrendingUp,
    value: 'Hasta 3×',
    desc: 'más costo: el presentismo puede generar mayores pérdidas que el ausentismo.',
    color: 'bg-rose-50',
    onColor: 'text-rose-600',
    border: 'border-rose-100',
  },
];

export default function SedentaryCost() {
  return (
    <section className="h-full px-4 md:px-6 flex items-center justify-center bg-brand-cream overflow-hidden py-8 md:py-10">
      <div className="max-w-7xl w-full flex flex-col lg:grid lg:grid-cols-12 gap-5 md:gap-8 items-center">

        {/* Left: Text + Stats */}
        <div className="lg:col-span-6 flex flex-col gap-3 md:gap-5 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl text-[#0B1B3D] tracking-tight mb-1 md:mb-3 font-bold leading-tight">
              El costo del sedentarismo
            </h2>
            <p className="font-sans text-[13px] sm:text-base md:text-lg text-brand-on-surface-variant max-w-lg leading-snug">
              El sedentarismo impacta <span className="font-semibold text-brand-on-surface">silenciosamente</span> el bienestar y el rendimiento de los equipos.
            </p>
          </motion.div>

          {/* Stat blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white p-3 md:p-4 rounded-2xl shadow-sm border ${stat.border} flex flex-col gap-2`}
              >
                {/* Icon + value in a row */}
                <div className="flex items-center gap-2">
                  <div className={`${stat.color} ${stat.onColor} w-8 h-8 rounded-xl flex items-center justify-center shrink-0`}>
                    <stat.icon size={15} />
                  </div>
                  <span className={`font-display font-bold text-lg md:text-2xl ${stat.onColor} leading-none`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-[11px] md:text-sm text-brand-on-surface-variant font-medium leading-snug">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footnote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-1.5 pt-1"
          >
            <BookOpen size={11} className="text-brand-on-surface-variant/50 shrink-0 mt-0.5" />
            <p className="text-[9px] md:text-[11px] text-brand-on-surface-variant/60 font-medium leading-snug italic">
              Datos basados en revisiones sistemáticas sobre comportamiento sedentario y salud ocupacional.
            </p>
          </motion.div>
        </div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-6 order-1 lg:order-2 relative w-full"
        >
          <div className="overflow-hidden rounded-[20px] md:rounded-[32px] shadow-2xl relative max-h-[22vh] sm:max-h-[30vh] md:max-h-none">
            <img
              alt="Trabajador agotado frente al escritorio — fatiga laboral"
              className="w-full h-full object-cover"
              src="/sedentarismo-costo.jpg"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3D]/40 via-transparent to-transparent" />
            {/* Floating label */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="absolute bottom-3 left-3 md:bottom-5 md:left-5 bg-white/90 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl flex items-center gap-2 border border-white/40 shadow-xl"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
              <span className="font-bold text-brand-on-surface text-[9px] md:text-xs tracking-wide">
                Fatiga laboral silenciosa
              </span>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

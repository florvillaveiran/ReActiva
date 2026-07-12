import { motion } from 'motion/react';
import {
  UserMinus,
  Monitor,
  Briefcase,
  TrendingUp,
  Zap,
  Brain,
  BarChart2,
  BriefcaseMedical,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Building2,
} from 'lucide-react';

const mainStat = {
  value: 'Hasta 3x',
  label: 'mayores pérdidas que el ausentismo',
};

const secondaryStats = [
  {
    icon: UserMinus,
    value: '50%',
    label: 'dolor musculoesquelético',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: Monitor,
    value: '65-75%',
    label: 'posición sentada',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Briefcase,
    value: '60-80%',
    label: 'trabajan con molestias',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
];

export default function SedentaryCost() {
  return (
    <section className="h-full px-5 md:px-10 py-8 md:py-10 flex items-center justify-center bg-[#FDFBF9] overflow-hidden">
      <div className="presentation-safe max-w-[1240px] w-full flex flex-col gap-2.5 mt-4 md:mt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center md:text-left shrink-0"
        >
          <h2 className="font-display text-[1.95rem] leading-[1.05] md:text-[2.95rem] text-[#0B1B3D] tracking-tight mb-1 font-bold">
            El costo del sedentar<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>smo
          </h2>
          <p className="font-sans text-[0.92rem] md:text-base text-gray-600 font-medium leading-tight">
            Un problema silencioso que impacta todos los días en tu empresa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_auto_0.82fr] items-stretch gap-4 lg:gap-5 w-full relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[28px] md:rounded-[30px] px-6 py-4 md:px-8 md:py-4 w-full"
          >
            <h3 className="text-red-500 text-[10px] md:text-xs font-bold tracking-[0.18em] mb-3 md:mb-4 text-center uppercase">
              Datos que no podemos ignorar
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-5 md:gap-6 rounded-[22px] bg-red-50/70 border border-red-100 px-5 py-3.5 md:px-6 md:py-3.5">
                <div className="w-14 h-14 md:w-[60px] md:h-[60px] rounded-full bg-white text-red-600 flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp size={27} strokeWidth={1.6} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[2.5rem] md:text-[3rem] font-bold text-red-600 leading-none tracking-tight">
                    {mainStat.value}
                  </span>
                  <span className="text-[#0B1B3D] text-sm md:text-base font-bold leading-tight mt-1">
                    {mainStat.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {secondaryStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-5 rounded-2xl bg-white border border-slate-100 px-5 py-2.5 md:px-6 md:py-3">
                    <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                      <stat.icon size={21} strokeWidth={1.6} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-3xl md:text-[1.95rem] font-bold ${stat.color} leading-none tracking-tight`}>
                        {stat.value}
                      </span>
                      <span className="text-[#0B1B3D] text-[0.84rem] md:text-[0.92rem] font-bold leading-snug mt-0.5">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="hidden lg:flex self-center items-center justify-center w-11 h-11 rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] shrink-0 z-10"
          >
            <ArrowRight className="text-red-600" size={20} strokeWidth={3} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[28px] md:rounded-[30px] px-5 py-5 md:px-6 md:py-6 w-full flex flex-col min-h-[390px] lg:max-w-[420px] justify-self-center"
          >
            <h3 className="text-green-700 text-[10px] md:text-xs font-bold tracking-[0.18em] mb-4 md:mb-5 text-center uppercase">
              Lo que le cuesta a tu empresa
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="flex items-center gap-3.5 md:gap-4 w-full max-w-[245px]">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center shrink-0">
                  <Zap size={23} strokeWidth={1.6} />
                </div>
                <span className="text-lg md:text-xl font-bold text-[#0B1B3D]">Menos energía</span>
              </div>

              <ArrowDown className="text-gray-300 my-2" size={17} strokeWidth={2} />

              <div className="flex items-center gap-3.5 md:gap-4 w-full max-w-[245px]">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Brain size={23} strokeWidth={1.6} />
                </div>
                <span className="text-lg md:text-xl font-bold text-[#0B1B3D]">Menos foco</span>
              </div>

              <ArrowDown className="text-gray-300 my-2" size={17} strokeWidth={2} />

              <div className="flex items-center gap-3.5 md:gap-4 w-full max-w-[245px]">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <BarChart2 size={23} strokeWidth={1.6} />
                </div>
                <span className="text-lg md:text-xl font-bold text-[#0B1B3D] leading-tight">Menor rendimiento</span>
              </div>

              <div className="w-full max-w-[280px] h-10 relative mt-2 mb-0 flex justify-center">
                <svg width="220" height="40" viewBox="0 0 220 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M110 0 V18" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M35 18 H185" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M35 18 V36" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M185 18 V36" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M30 31 L35 36 L40 31" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M180 31 L185 36 L190 31" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="flex justify-between w-full max-w-[315px] px-2">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 mb-1.5">
                    <BriefcaseMedical size={23} strokeWidth={1.6} />
                  </div>
                  <span className="text-sm md:text-base font-bold text-[#0B1B3D] text-center leading-tight">Más ausentismo</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 mb-1.5">
                    <RefreshCw size={23} strokeWidth={1.6} />
                  </div>
                  <span className="text-sm md:text-base font-bold text-[#0B1B3D] text-center leading-tight">Mayor rotación</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-[1120px] mx-auto mt-4 md:mt-5 bg-[#F3F6F4] rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row items-center sm:justify-center gap-3 md:gap-4 border border-gray-100 shrink-0"
        >
          <div className="w-9 h-9 rounded-full border-2 border-green-600 bg-transparent text-green-600 flex items-center justify-center shrink-0">
            <Building2 size={18} strokeWidth={2} />
          </div>
          <p className="text-[#0B1B3D] text-sm md:text-base font-medium text-center sm:text-left">
            El sedentarismo no solo afecta a las personas.{' '}
            <span className="text-red-600 font-bold">También afecta los resultados.</span>
          </p>
        </motion.div>

        <p className="text-center text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">
          * Datos basados en revisiones sistemáticas sobre comportamiento sedentario y salud ocupacional.
        </p>
      </div>
    </section>
  );
}

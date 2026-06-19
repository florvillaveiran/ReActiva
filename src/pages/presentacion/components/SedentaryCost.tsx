import { motion } from 'motion/react';
import { 
  UserMinus, Monitor, Briefcase, TrendingUp, 
  Zap, Brain, BarChart2, BriefcaseMedical, RefreshCw, 
  ArrowRight, ArrowDown, Building2, BookOpen 
} from 'lucide-react';

export default function SedentaryCost() {
  return (
    <section className="min-h-screen px-4 md:px-8 py-12 flex flex-col items-center justify-center bg-[#FDFBF9] overflow-hidden">
      <div className="max-w-[1200px] w-full flex flex-col gap-8 md:gap-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center md:text-left"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-[56px] text-[#0B1B3D] tracking-tight mb-3 font-bold">
            El costo del sedentarismo
          </h2>
          <p className="font-sans text-lg md:text-2xl text-gray-600 font-medium">
            Un problema silencioso que impacta todos los días en tu empresa.
          </p>
        </motion.div>

        {/* Main Content: Cards */}
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 w-full relative">
          
          {/* Left Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 md:p-10 w-full"
          >
            <h3 className="text-red-500 text-sm md:text-sm font-bold tracking-[0.15em] mb-8 text-center uppercase">
              Datos que no podemos ignorar
            </h3>
            <div className="flex flex-col gap-8">
              {/* Stat 1 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <UserMinus size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-red-600 mb-1 leading-none">50%</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    de los trabajadores de oficina reportan dolor musculoesquelético.
                  </span>
                </div>
              </div>
              {/* Stat 2 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Monitor size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-orange-500 mb-1 leading-none">65–75%</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    de la jornada laboral transcurre en posición sentada.
                  </span>
                </div>
              </div>
              {/* Stat 3 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Briefcase size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-amber-500 mb-1 leading-none">60–80%</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    de quienes presentan dolor continúan trabajando con molestias (presentismo).
                  </span>
                </div>
              </div>
              {/* Stat 4 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-red-600 mb-1 leading-none">Hasta 3x</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    más costo: el presentismo puede generar mayores pérdidas que el ausentismo.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Middle Arrow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="hidden lg:flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] shrink-0 z-10"
          >
            <ArrowRight className="text-red-600" size={24} strokeWidth={3} />
          </motion.div>

          {/* Right Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 md:p-10 w-full flex flex-col h-full min-h-[580px]"
          >
            <h3 className="text-green-700 text-sm md:text-sm font-bold tracking-[0.15em] mb-12 text-center uppercase">
              Lo que le cuesta a tu empresa
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {/* Flow Items */}
              <div className="flex items-center gap-5 w-full max-w-[280px]">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center shrink-0">
                  <Zap size={28} strokeWidth={1.5} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B1B3D]">Menos energía</span>
              </div>
              
              <ArrowDown className="text-gray-300 my-4" size={20} strokeWidth={2} />
              
              <div className="flex items-center gap-5 w-full max-w-[280px]">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Brain size={28} strokeWidth={1.5} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B1B3D]">Menos foco</span>
              </div>

              <ArrowDown className="text-gray-300 my-4" size={20} strokeWidth={2} />

              <div className="flex items-center gap-5 w-full max-w-[280px]">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <BarChart2 size={28} strokeWidth={1.5} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B1B3D]">Menor rendimiento</span>
              </div>

              {/* Forked Arrow SVG */}
              <div className="w-full max-w-[340px] h-14 relative mt-4 mb-2 flex justify-center">
                <svg width="260" height="50" viewBox="0 0 260 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M130 0 V20" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M40 20 H220" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M40 20 V45" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M220 20 V45" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                  {/* Left arrow head */}
                  <path d="M35 40 L40 45 L45 40" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Right arrow head */}
                  <path d="M215 40 L220 45 L225 40" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Fork Results */}
              <div className="flex justify-between w-full max-w-[380px] px-2">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 mb-3">
                    <BriefcaseMedical size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-[17px] md:text-xl font-bold text-[#0B1B3D] text-center leading-tight">Más ausentismo</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 mb-3">
                    <RefreshCw size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-[17px] md:text-xl font-bold text-[#0B1B3D] text-center leading-tight">Mayor rotación</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full bg-[#F3F6F4] rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center sm:justify-center gap-4 md:gap-5 border border-gray-100"
        >
          <div className="w-12 h-12 rounded-full border-2 border-green-600 bg-transparent text-green-600 flex items-center justify-center shrink-0">
            <Building2 size={24} strokeWidth={2} />
          </div>
          <p className="text-[#0B1B3D] text-base md:text-xl font-medium text-center sm:text-left">
            El sedentarismo no solo afecta a las personas.{' '}
            {/* The user specifically requested this to be red */}
            <span className="text-red-600 font-bold">También afecta los resultados.</span>
          </p>
        </motion.div>

        {/* Footnote */}
        <div className="w-full flex items-center justify-between pb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen size={14} className="shrink-0" />
            <span className="text-[11px] md:text-xs font-medium italic">
              Datos basados en revisiones sistemáticas sobre comportamiento sedentario y salud ocupacional.
            </span>
          </div>
          <div className="hidden md:block">
            <span className="font-display font-bold text-xl text-green-600">Re<span className="text-[#0B1B3D]">Activa</span></span>
          </div>
        </div>

      </div>
    </section>
  );
}


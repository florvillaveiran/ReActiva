import { motion } from 'motion/react';
import { 
  TrendingUp, Activity, Brain, BatteryCharging, 
  Zap, Handshake, ArrowRight, ArrowDown, 
  BookOpen, ShieldCheck, BarChart2
} from 'lucide-react';

export default function Benefits() {
  return (
    <section className="min-h-screen px-4 md:px-8 py-12 flex flex-col items-center justify-center bg-[#FDFBF9] overflow-hidden">
      <div className="max-w-[1200px] w-full flex flex-col gap-8 md:gap-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center flex flex-col items-center"
        >
          <span className="text-green-700 font-bold text-sm tracking-[0.2em] uppercase mb-2">
            IMPACTO EN TU EMPRESA
          </span>
          <div className="w-8 h-[2px] bg-green-600 mb-6 rounded-full"></div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-[52px] text-[#0B1B3D] tracking-tight mb-4 font-bold leading-tight">
            Resultados que se ven. <span className="text-green-600">Números que mejoran.</span>
          </h2>
          <p className="font-sans text-lg md:text-[22px] text-gray-600 font-medium">
            Con ReActiva, el bienestar se transforma en <span className="text-green-600 font-bold">impacto real</span> para tu negocio.
          </p>
        </motion.div>

        {/* Main Content: Cards */}
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 w-full relative">
          
          {/* Left Card: Impacto Operativo (El Flujo) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 md:p-10 w-full flex flex-col h-full min-h-[580px]"
          >
            <h3 className="text-green-700 text-sm md:text-sm font-bold tracking-[0.15em] mb-12 text-center uppercase">
              El impacto en el trabajo diario
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {/* Flow Items */}
              <div className="flex items-center gap-5 w-full max-w-[280px]">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center shrink-0">
                  <Zap size={28} strokeWidth={1.5} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B1B3D]">Más energía</span>
              </div>
              
              <ArrowDown className="text-gray-300 my-4" size={20} strokeWidth={2} />
              
              <div className="flex items-center gap-5 w-full max-w-[280px]">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Brain size={28} strokeWidth={1.5} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B1B3D]">Mejor foco</span>
              </div>

              <ArrowDown className="text-gray-300 my-4" size={20} strokeWidth={2} />

              <div className="flex items-center gap-5 w-full max-w-[280px]">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <Handshake size={28} strokeWidth={1.5} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B1B3D]">Mayor engagement</span>
              </div>

              {/* Forked Arrow SVG */}
              <div className="w-full max-w-[340px] h-14 relative mt-4 mb-2 flex justify-center">
                <svg width="260" height="50" viewBox="0 0 260 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M130 0 V20" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M40 20 H220" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M40 20 V45" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M220 20 V45" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
                  {/* Left arrow head */}
                  <path d="M35 40 L40 45 L45 40" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Right arrow head */}
                  <path d="M215 40 L220 45 L225 40" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Fork Results */}
              <div className="flex justify-between w-full max-w-[380px] px-2">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mb-3">
                    <TrendingUp size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-[17px] md:text-xl font-bold text-[#0B1B3D] text-center leading-tight">Mejor<br/>performance</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mb-3">
                    <ShieldCheck size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-[17px] md:text-xl font-bold text-[#0B1B3D] text-center leading-tight">Menor<br/>rotación</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Middle Connector */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="hidden lg:flex flex-col items-center justify-center z-10 shrink-0"
          >
            <div className="bg-white rounded-full w-14 h-14 shadow-[0_4px_20px_rgb(0,0,0,0.08)] flex items-center justify-center border border-gray-50">
              <ArrowRight size={24} className="text-green-600" strokeWidth={3} />
            </div>
          </motion.div>

          {/* Right Card: Resultados Medibles (KPIs) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 md:p-10 w-full"
          >
            <h3 className="text-blue-600 text-sm md:text-sm font-bold tracking-[0.15em] mb-8 text-center uppercase">
              Impacto medido en organizaciones
            </h3>
            <div className="flex flex-col gap-8">
              {/* Stat 1 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-[#0B1B3D] mb-1 leading-none">+10%</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    de aumento directo en la <strong>productividad laboral</strong> de los equipos.
                  </span>
                </div>
              </div>
              {/* Stat 2 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Activity size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-emerald-600 mb-1 leading-none">-15%</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    de reducción sistemática en el <strong>ausentismo laboral</strong>.
                  </span>
                </div>
              </div>
              {/* Stat 3 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Brain size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-[#0B1B3D] mb-1 leading-none">-25%</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    menos de <strong>errores operativos</strong> asociados al cansancio y falta de foco.
                  </span>
                </div>
              </div>
              {/* Stat 4 */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <BatteryCharging size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-3xl md:text-[38px] font-bold text-emerald-600 mb-1 leading-none">-30%</span>
                  <span className="text-gray-700 text-sm md:text-[15px] font-medium leading-snug">
                    de reducción en reportes de <strong>fatiga física y mental</strong>.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Banner - Split Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Left part */}
          <div className="flex-1 flex items-center justify-center gap-5 w-full">
            <div className="w-14 h-14 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0">
              <BarChart2 size={32} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-lg md:text-[21px] font-bold text-[#0B1B3D] leading-tight">
                Bienestar que impulsa resultados.
              </p>
              <p className="text-lg md:text-[21px] font-bold text-[#0B1B3D] leading-tight">
                Resultados que hacen <span className="text-green-600">crecer tu empresa.</span>
              </p>
            </div>
          </div>
          
          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-gray-200"></div>
          
          {/* Right part */}
          <div className="flex-1 flex items-center justify-center gap-5 w-full">
            <div className="w-14 h-14 rounded-full border-2 border-green-200 bg-green-50 text-green-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-lg md:text-[21px] font-bold text-[#0B1B3D] leading-tight">
                Impacto <span className="text-green-600">medible.</span>
              </p>
              <p className="text-lg md:text-[21px] font-bold text-[#0B1B3D] leading-tight">
                Decisiones con <span className="text-green-600">datos reales.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footnote */}
        <div className="w-full flex items-center justify-between pb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen size={14} className="shrink-0" />
            <span className="text-[11px] md:text-xs font-medium italic">
              Benchmarks basados en revisiones sistemáticas y meta-análisis de programas de bienestar corporativo.
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

import { motion } from 'motion/react';
import { TrendingUp, Calendar, RefreshCcw, Heart } from 'lucide-react';

export default function Benefits() {
  return (
    <section className="h-full px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-10">
      <div className="max-w-7xl w-full">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mb-8"
        >
          <span className="text-brand-primary font-bold text-xs md:text-sm uppercase tracking-widest mb-3 block">IMPACTO REAL</span>
          <h2 className="font-display text-5xl md:text-6xl text-brand-on-surface font-bold mb-4 tracking-tight">Beneficios comprobados.</h2>
          <p className="font-sans text-base md:text-lg text-brand-on-surface-variant max-w-2xl font-medium">
            Nuestra metodología "Active Vitality" transforma la dinámica corporativa con resultados medibles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="md:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-50 flex flex-col lg:flex-row overflow-hidden"
          >
             <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                   <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-[#2E7D32] mb-6">
                      <TrendingUp size={20} />
                   </div>
                   <h3 className="font-display text-3xl font-bold mb-4 tracking-tight">Mejora la productividad.</h3>
                   <p className="text-brand-on-surface-variant text-sm md:text-base font-medium leading-relaxed mb-6">
                      Un equipo revitalizado rinde hasta un 25% más en tareas críticas. Las pausas activas optimizan el enfoque.
                   </p>
                </div>
                <div>
                   <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div className="w-[85%] h-full bg-brand-primary"></div>
                   </div>
                   <p className="text-[#2E7D32] font-bold text-xs uppercase tracking-widest text-right">85% Eficiencia</p>
                </div>
             </div>
             <div className="lg:w-2/5 h-full min-h-[200px]">
                <img src="/beneficios.jpg" alt="Checklist" className="w-full h-full object-cover" />
             </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-50 flex flex-col justify-between"
          >
             <div>
                <div className="w-10 h-10 bg-[#FCE4EC] rounded-xl flex items-center justify-center text-pink-600 mb-6">
                   <Calendar size={20} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 tracking-tight leading-tight">Reducción del ausentismo.</h3>
                <p className="text-brand-on-surface-variant text-sm font-medium leading-relaxed">
                   Disminuye las bajas por estrés y fatiga crónica mediante bienestar preventivo.
                </p>
             </div>

          </motion.div>

          {/* Card 3 */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-50 flex flex-col justify-between"
          >
             <div>
                <div className="w-10 h-10 bg-[#E0F2F1] rounded-xl flex items-center justify-center text-[#26A69A] mb-6">
                   <RefreshCcw size={20} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 tracking-tight leading-tight">Menor rotación anual.</h3>
                <p className="text-brand-on-surface-variant text-sm font-medium leading-relaxed">
                   Fomenta el compromiso y la lealtad de la organización.
                </p>
             </div>
             <div className="mt-6 flex items-center -space-x-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#C8E6C9] flex items-center justify-center text-brand-primary text-[9px] font-bold">
                  +42
                </div>
             </div>
          </motion.div>

          {/* Card 4 - Green Card */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="bg-brand-primary p-8 rounded-[32px] shadow-xl text-white flex flex-col justify-between relative overflow-hidden md:col-span-2"
          >
             <div className="absolute top-0 right-0 p-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                   <Heart size={20} />
                </div>
             </div>
             <div className="max-w-md">
                <h3 className="font-display text-3xl font-bold mb-4 tracking-tight">Mayor percepción positiva.</h3>
                <p className="opacity-80 text-sm md:text-base font-medium leading-relaxed">
                   Mejora el clima laboral y la imagen de marca empleadora.
                </p>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

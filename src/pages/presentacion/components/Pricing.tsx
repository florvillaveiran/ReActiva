import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';

const pricingLevels = [
  { teamSize: "Hasta 20 emp.", price: "USD 600", note: "" },
  { teamSize: "Hasta 60 emp.", price: "USD 1.530", note: "" },
  { teamSize: "Hasta 100 emp.", price: "USD 2.250", note: "" },
  { teamSize: "Hasta 150 emp.", price: "USD 2.925", note: "" },
  { teamSize: "Hasta +150 emp.", price: "Personalizado", note: "CONSULTAR", isCustom: true }
];

export default function Pricing() {
  return (
    <section className="h-full px-4 md:px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-6 md:py-10">
      <div className="max-w-7xl w-full flex flex-col h-full max-h-[85vh] md:max-h-none overflow-y-auto pr-1 md:pr-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start pb-10 md:pb-0">
          
          {/* Info Column */}
          <div className="lg:col-span-5 space-y-3 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl md:text-6xl text-brand-primary font-bold mb-2 md:mb-8 tracking-tight uppercase">PLANES Y PRECIOS</h2>
              
              {/* Promo Card */}
              <div className="bg-[#FCE4EC] p-2.5 md:p-4 rounded-[16px] md:rounded-[28px] border border-pink-100 flex items-center gap-3 md:gap-4 relative overflow-hidden mb-3 md:mb-6">
                 <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm relative z-10 shrink-0">
                    <Star fill="currentColor" size={14} md:size={20} />
                 </div>
                 <div className="relative z-10">
                    <h3 className="font-bold text-pink-900 text-base md:text-xl mb-0.5 uppercase">2 semanas GRATIS</h3>
                    <p className="text-pink-600 font-bold text-[8px] md:text-xs tracking-wide uppercase">SIN COMPROMISO</p>
                 </div>
              </div>

              <p className="font-sans text-[13px] md:text-lg text-brand-on-surface-variant max-w-sm mb-4 md:mb-10 leading-tight md:leading-relaxed font-medium">
                Invierta en el activo más valioso de su empresa: su gente.
              </p>

              <div className="space-y-1.5 md:space-y-3">
                 {[
                   "Acceso total a la plataforma",
                   "Métricas en tiempo real",
                   "Soporte prioritario 24/7"
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-2 md:gap-3 text-brand-on-surface-variant font-bold text-[11px] md:text-sm">
                      <div className="w-4 h-4 md:w-5 md:h-5 bg-brand-primary rounded-full flex items-center justify-center text-white shrink-0">
                         <Check size={9} md:size={12} strokeWidth={4} />
                      </div>
                      {feat}
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>

          {/* Pricing Table Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white rounded-[20px] md:rounded-[32px] shadow-2xl border border-slate-50 overflow-hidden"
          >
            {/* Table Header */}
            <div className="bg-brand-primary p-2.5 md:p-5 px-5 md:px-8 flex justify-between items-center text-white font-bold text-[9px] md:text-sm uppercase tracking-widest">
               <span>ESCALA DE EQUIPO</span>
               <span>INVERSIÓN MENSUAL</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 uppercase">
               {pricingLevels.map((lvl) => (
                 <div key={lvl.teamSize} className={`px-5 md:px-8 py-2.5 md:py-4 flex justify-between items-center group hover:bg-slate-50 transition-colors`}>
                    <div className="flex items-center gap-2 md:gap-2.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#C8E6C9]"></div>
                       <span className="font-bold text-slate-700 text-[13px] md:text-lg tracking-tight">{lvl.teamSize}</span>
                    </div>
                    <div className="text-right">
                       {lvl.note && <span className="text-[7px] md:text-[10px] font-bold text-slate-300 block mb-0.5 tracking-widest">{lvl.note}</span>}
                       <span className={`text-[15px] md:text-2xl font-bold tracking-tighter ${lvl.isCustom ? 'text-brand-primary' : 'text-slate-700'}`}>
                          {lvl.price}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

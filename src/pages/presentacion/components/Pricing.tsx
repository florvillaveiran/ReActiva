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
    <section className="h-full px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-10">
      <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info Column */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-5xl md:text-6xl text-brand-primary font-bold mb-8 tracking-tight uppercase">PLANES Y PRECIOS</h2>
              
              {/* Promo Card */}
              <div className="bg-[#FCE4EC] p-4 rounded-[28px] border border-pink-100 flex items-center gap-4 relative overflow-hidden mb-6">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm relative z-10 shrink-0">
                    <Star fill="currentColor" size={20} />
                 </div>
                 <div className="relative z-10">
                    <h3 className="font-bold text-pink-900 text-xl mb-1 uppercase">2 semanas GRATIS</h3>
                    <p className="text-pink-600 font-bold text-xs tracking-wide uppercase">SIN COMPROMISO</p>
                 </div>
              </div>

              <p className="font-sans text-base md:text-lg text-brand-on-surface-variant max-w-sm mb-10 leading-relaxed font-medium">
                Invierta en el activo más valioso de su empresa: su gente.
              </p>

              <div className="space-y-3">
                 {[
                   "Acceso total a la plataforma",
                   "Métricas en tiempo real",
                   "Soporte prioritario 24/7"
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3 text-brand-on-surface-variant font-bold text-sm">
                      <div className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center text-white">
                         <Check size={12} strokeWidth={4} />
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
            className="lg:col-span-7 bg-white rounded-[32px] shadow-2xl border border-slate-50 overflow-hidden"
          >
            {/* Table Header */}
            <div className="bg-brand-primary p-5 px-8 flex justify-between items-center text-white font-bold text-sm uppercase tracking-widest">
               <span>ESCALA DE EQUIPO</span>
               <span>INVERSIÓN MENSUAL</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 uppercase">
               {pricingLevels.map((lvl) => (
                 <div key={lvl.teamSize} className={`px-8 py-4 flex justify-between items-center group hover:bg-slate-50 transition-colors ${lvl.highlight ? 'bg-slate-50/50' : ''}`}>
                    <div className="flex items-center gap-2.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#C8E6C9]"></div>
                       <span className="font-bold text-slate-700 text-lg tracking-tight">{lvl.teamSize}</span>
                    </div>
                    <div className="text-right">
                       {lvl.note && <span className="text-[10px] font-bold text-slate-300 block mb-0.5 tracking-widest">{lvl.note}</span>}
                       <span className={`text-2xl font-bold tracking-tighter ${lvl.highlight || lvl.isCustom ? 'text-brand-primary' : 'text-slate-700'}`}>
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

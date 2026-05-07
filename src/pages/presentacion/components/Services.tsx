import { motion } from 'motion/react';
import { Users, Search, Check, Clock } from 'lucide-react';

export default function Services() {
  return (
    <section className="h-full px-4 md:px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-4 md:py-6">
      <div className="max-w-7xl w-full flex flex-col h-full max-h-[85vh] md:max-h-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2 md:mb-4 shrink-0"
        >
          <h2 className="font-display text-2xl md:text-6xl text-brand-on-surface font-bold mb-1 md:mb-2 tracking-tight">Servicios opcionales.</h2>
          <p className="font-sans text-[13px] md:text-lg text-brand-on-surface-variant max-w-2xl font-medium leading-tight">
            Complementa tu programa con soluciones diseñadas para profundizar en el impacto y la personalización.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 overflow-y-auto md:overflow-visible pr-1 md:pr-0 pb-10 md:pb-0">
          {/* Service 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-3.5 md:p-6 rounded-[20px] md:rounded-[32px] shadow-sm border border-slate-50 relative flex flex-col"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
               <div className="w-7 h-7 md:w-10 md:h-10 bg-[#E8F5E9] rounded-lg md:rounded-xl flex items-center justify-center text-[#2E7D32]">
                  <Search size={14} md:size={20} />
               </div>
                <span className="px-1.5 py-0.5 md:py-1 rounded-full bg-slate-50 text-slate-400 text-[7px] md:text-9px] font-bold tracking-widest uppercase">1-on-1 Focus</span>
             </div>
              <h3 className="font-display text-base md:text-xl font-bold mb-0.5 md:mb-2 text-brand-on-surface">Consultas Individuales</h3>
              <p className="text-brand-on-surface-variant text-[11px] md:text-sm font-medium leading-tight md:leading-relaxed mb-2 md:mb-4">
               Atención personalizada dirigida a abordar necesidades específicas de salud.
              </p>
              <ul className="space-y-1 md:space-y-2 mb-2 md:mb-4 flex-grow font-medium text-brand-on-surface-variant">
                 <li className="flex items-center gap-2 text-[10px] md:text-sm"><Check size={12} md:size={14} className="text-[#2E7D32]" /> Sesiones 1 a 1</li>
                 <li className="flex items-center gap-2 text-[10px] md:text-sm"><Check size={12} md:size={14} className="text-[#2E7D32]" /> Plan personalizado de acción</li>
                 <li className="flex items-center gap-2 text-[10px] md:text-sm"><Check size={12} md:size={14} className="text-[#2E7D32]" /> Seguimiento clínico</li>
              </ul>
            <div className="rounded-[12px] md:rounded-[20px] overflow-hidden aspect-[4/1] md:aspect-[3/1]">
               <img src="/consultas-individuales.jpg" alt="Consultas individuales de kinesiología" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Service 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-3.5 md:p-6 rounded-[20px] md:rounded-[32px] shadow-sm border border-slate-50 relative flex flex-col"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
               <div className="w-7 h-7 md:w-10 md:h-10 bg-[#FCE4EC] rounded-lg md:rounded-xl flex items-center justify-center text-pink-600">
                  <Users size={14} md:size={20} />
               </div>
                <span className="px-1.5 py-0.5 md:py-1 rounded-full bg-slate-50 text-slate-400 text-[7px] md:text-9px] font-bold tracking-widest uppercase">Team Training</span>
             </div>
              <h3 className="font-display text-base md:text-xl font-bold mb-0.5 md:mb-2 text-brand-on-surface">Capacitaciones en Bienestar</h3>
              <p className="text-brand-on-surface-variant text-[11px] md:text-sm font-medium leading-tight md:leading-relaxed mb-2 md:mb-4">
               Formación grupal dinámica para fomentar una cultura de salud.
              </p>
              <ul className="space-y-1 md:space-y-2 mb-2 md:mb-4 flex-grow font-medium text-brand-on-surface-variant">
                 <li className="flex items-center gap-2 text-[10px] md:text-sm"><Check size={12} md:size={14} className="text-pink-600" /> Talleres sincrónicos</li>
                 <li className="flex items-center gap-2 text-[10px] md:text-sm"><Check size={12} md:size={14} className="text-pink-600" /> Contenido adaptado al rubro</li>
                 <li className="flex items-center gap-2 text-[10px] md:text-sm"><Check size={12} md:size={14} className="text-pink-600" /> Grabaciones 24/7</li>
              </ul>
            <div className="rounded-[12px] md:rounded-[20px] overflow-hidden aspect-[4/1] md:aspect-[3/1]">
               <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" alt="Training" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

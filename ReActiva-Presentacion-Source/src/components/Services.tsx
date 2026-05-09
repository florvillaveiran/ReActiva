import { motion } from 'motion/react';
import { Users, Search, Check, Clock } from 'lucide-react';

export default function Services() {
  return (
    <section className="h-full px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-4">
      <div className="max-w-7xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4"
        >
          <h2 className="font-display text-5xl md:text-6xl text-brand-on-surface font-bold mb-2 tracking-tight">Servicios opcionales.</h2>
          <p className="font-sans text-base md:text-lg text-brand-on-surface-variant max-w-2xl font-medium">
            Complementa tu programa con soluciones diseñadas para profundizar en el impacto y la personalización del cuidado de tus colaboradores.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-5 md:p-6 rounded-[32px] shadow-sm border border-slate-50 relative flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-[#2E7D32]">
                  <Search size={20} />
               </div>
                <span className="px-2 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-bold tracking-widest uppercase">1-on-1 Focus</span>
             </div>
             <h3 className="font-display text-xl font-bold mb-2 text-brand-on-surface">Consultas Individuales</h3>
             <p className="text-brand-on-surface-variant text-sm font-medium leading-relaxed mb-4">
               Atención personalizada dirigida a abordar necesidades específicas de salud y rendimiento.
             </p>
             <ul className="space-y-2 mb-4 flex-grow font-medium text-brand-on-surface-variant">
                <li className="flex items-center gap-2 text-xs md:text-sm"><Check size={14} className="text-[#2E7D32]" /> Sesiones 1 a 1 con especialista</li>
                <li className="flex items-center gap-2 text-xs md:text-sm"><Check size={14} className="text-[#2E7D32]" /> Plan personalizado de acción</li>
                <li className="flex items-center gap-2 text-xs md:text-sm"><Check size={14} className="text-[#2E7D32]" /> Seguimiento de progreso clínico</li>
             </ul>
            <div className="rounded-[20px] overflow-hidden aspect-[3/1]">
               <img src="/consultas-individuales.jpg" alt="Consultas individuales de kinesiología" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Service 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 md:p-6 rounded-[32px] shadow-sm border border-slate-50 relative flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-[#FCE4EC] rounded-xl flex items-center justify-center text-pink-600">
                  <Users size={20} />
               </div>
                <span className="px-2 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-bold tracking-widest uppercase">Team Training</span>
             </div>
             <h3 className="font-display text-xl font-bold mb-2 text-brand-on-surface">Capacitaciones en Bienestar</h3>
             <p className="text-brand-on-surface-variant text-sm font-medium leading-relaxed mb-4">
               Formación grupal dinámica para fomentar una cultura de salud dentro de los equipos de trabajo.
             </p>
             <ul className="space-y-2 mb-4 flex-grow font-medium text-brand-on-surface-variant">
                <li className="flex items-center gap-2 text-xs md:text-sm"><Check size={14} className="text-pink-600" /> Talleres sincrónicos interactivos</li>
                <li className="flex items-center gap-2 text-xs md:text-sm"><Check size={14} className="text-pink-600" /> Contenido adaptado al rubro</li>
                <li className="flex items-center gap-2 text-xs md:text-sm"><Check size={14} className="text-pink-600" /> Grabaciones disponibles 24/7</li>
             </ul>
            <div className="rounded-[20px] overflow-hidden aspect-[3/1]">
               <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" alt="Training" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

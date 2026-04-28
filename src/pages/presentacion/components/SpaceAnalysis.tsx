import { motion } from 'motion/react';
import { Ruler, LayoutGrid, Layers, Accessibility } from 'lucide-react';

export default function SpaceAnalysis() {
  return (
    <section className="h-full px-6 flex flex-col items-center justify-center bg-brand-cream relative overflow-hidden py-10">
      <div className="max-w-7xl w-full flex flex-col gap-6 md:gap-8">
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="space-y-2"
        >
          <div className="flex items-center gap-2 text-[#2E7D32]">
            <span className="font-bold text-xs md:text-sm uppercase tracking-widest bg-[#E8F5E9] px-3 py-1.5 rounded">BONUS INCLUIDO</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-brand-on-surface font-bold leading-[1] tracking-tight">
            Análisis del Espacio
          </h2>
          <p className="font-sans text-base md:text-lg text-brand-on-surface-variant max-w-2xl font-medium">
            La vitalidad comienza en tu entorno. Ergo-vitalidad para tu productividad sostenible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Main Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-[32px] overflow-hidden shadow-2xl relative bg-black">
              <img 
                alt="Workspace analysis" 
                className="w-full aspect-video object-cover opacity-80" 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Checklist */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Postura", icon: Accessibility },
              { label: "Configuración escritorio", icon: LayoutGrid },
              { label: "Organización", icon: Layers }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-50 flex items-center justify-between group cursor-default"
              >
                <div className="flex items-center gap-3">
                   <div className="text-brand-primary">
                      <item.icon size={18} />
                   </div>
                   <span className="font-bold text-brand-on-surface text-base">{item.label}</span>
                </div>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="mt-4 bg-brand-primary text-white py-5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl text-base"
            >
              EVALUACIÓN ERGONÓMICA <Ruler size={20} />
            </motion.button>
          </div>
        </div>

        {/* Tips Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div>
              <span className="text-brand-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2 block">DATO CLAVE</span>
              <p className="text-sm text-brand-on-surface-variant font-medium leading-relaxed">
                Una mala postura reduce tu capacidad pulmonar hasta un 30%.
              </p>
            </div>
            <div className="md:border-l border-slate-100 md:pl-6">
              <span className="text-brand-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2 block">TIP DE ORO</span>
              <p className="text-sm text-brand-on-surface-variant font-medium leading-relaxed">
                Distancia monitor: largo de tu brazo.
              </p>
            </div>
            <div className="md:border-l border-slate-100 md:pl-6">
              <span className="text-brand-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2 block">VITALIDAD</span>
              <p className="text-sm text-brand-on-surface-variant font-medium leading-relaxed">
                Agrega una planta natural para oxigenar.
              </p>
            </div>
        </div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import { Mail, MessageCircle, Globe, Instagram, Leaf, Heart } from 'lucide-react';

export default function Contact() {
  return (
    <section className="h-full px-6 flex flex-col justify-center items-center bg-[#F9F8F3] overflow-hidden py-10 relative">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-[#C8E6C9] text-brand-primary font-bold text-xs uppercase tracking-widest mb-6">
              ÚLTIMO PASO
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-brand-primary font-bold leading-tight mb-6 tracking-tight">
              ¿Avanzamos Juntos?
            </h2>
            <p className="font-sans text-base md:text-lg text-brand-on-surface-variant max-w-2xl font-medium leading-relaxed">
              Estamos listos para diseñar tu plan de Vitalidad Activa.
            </p>
          </motion.div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Mail, label: "EMAIL", type: "single", value: "info@metodoreactiva.com", href: "mailto:info@metodoreactiva.com" },
              { icon: MessageCircle, label: "WHATSAPP", type: "multi", values: [{ text: "+54 9 261 342-8552", href: "https://wa.me/5492613428552" }, { text: "+61 473 913 485", href: "https://wa.me/61473913485" }] },
              { icon: Globe, label: "WEB", type: "single", value: "metodoreactiva.com", href: "https://metodoreactiva.com" },
              { icon: Instagram, label: "INSTAGRAM", type: "single", value: "@reactiva.kinesio", href: "https://instagram.com/reactiva.kinesio" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-[#E0F2F1] rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                   <item.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">{item.label}</p>
                  {item.type === "single" ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-700 text-sm break-all hover:text-brand-primary transition-colors block">
                      {item.value}
                    </a>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {item.values?.map((v, j) => (
                        <a key={j} href={v.href} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-700 text-sm break-all hover:text-brand-primary transition-colors block">
                          {v.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Card Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-5 relative"
        >
          {/* Main Card */}
          <div className="bg-white rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center relative max-w-sm mx-auto">
            <div className="w-16 h-16 bg-[#C8E6C9] rounded-full flex items-center justify-center text-brand-primary mb-6">
              <Leaf size={32} fill="currentColor" />
            </div>

            <h3 className="font-display text-2xl font-bold text-brand-primary mb-3">Re-Activa</h3>
            <p className="italic text-slate-500 font-medium text-base leading-relaxed mb-8 px-2 italic">
              "Impulsando el movimiento que tu empresa necesita."
            </p>

            <div className="w-full rounded-[24px] overflow-hidden shadow-xl aspect-[4/5] max-w-[260px]">
              <img 
                src="/contacto.jpg" 
                alt="Clase online de movimiento" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

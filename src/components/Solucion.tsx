import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Mail, Users, BarChart3, ArrowRight } from 'lucide-react';

export const Solucion = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    { 
      icon: Clock, 
      title: "Pausas activas 3 días por semana", 
      desc: "2 pausas por día de 5-10 minutos cada una. Diseñadas para no interrumpir el flujo de trabajo y reactivar la energía.", 
      image: "/pausas-activas.png" 
    },
    { 
      icon: Mail, 
      title: "Videos asincrónicos por email", 
      desc: "Contenido enviado automáticamente para que cada miembro del equipo lo haga a su propio ritmo y tiempo.", 
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80" 
    },
    { 
      icon: Users, 
      title: "Sin ropa deportiva ni equipamiento", 
      desc: "Ejercicios discretos adaptados al espacio de trabajo, ya sea en la oficina o en home office.", 
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" 
    },
    { 
      icon: BarChart3, 
      title: "Seguimiento automático", 
      desc: "Formularios y reportes mensuales para RRHH. Medimos el impacto real en el bienestar del equipo.", 
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" 
    },
  ];

  return (
    <section id="programa" className="py-24 bg-[#FDF8E9]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6"
          >
            Dale a tu equipo lo que <span className="text-[#10b981]">realmente necesita</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Tabs */}
          <div className="space-y-4">
            {features.map((feature, i) => (
              <div
                key={i}
                onMouseEnter={() => setActiveTab(i)}
                onClick={() => setActiveTab(i)}
                className={`w-full text-left p-5 md:p-6 rounded-3xl transition-all duration-300 border cursor-default ${
                  activeTab === i 
                    ? 'bg-white border-[#10b981]/20 shadow-md' 
                    : 'bg-white/50 border-transparent hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    activeTab === i ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg md:text-xl font-bold mb-2 ${activeTab === i ? 'text-[#10b981]' : 'text-slate-900'}`}>
                      {feature.title}
                    </h3>
                    <AnimatePresence initial={false}>
                      {activeTab === i && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-4">
                            {feature.desc}
                          </p>
                          {/* Mobile Image */}
                          <div className="lg:hidden w-full aspect-video rounded-2xl overflow-hidden mb-2">
                            <img 
                              src={feature.image} 
                              alt={feature.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Image Reveal (Hidden on mobile) */}
          <div className="hidden lg:block relative aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeTab}
                src={features[activeTab].image}
                alt={features[activeTab].title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <motion.a 
                href="#metodo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold border border-white/30 hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                Ver programa completo <ArrowRight className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

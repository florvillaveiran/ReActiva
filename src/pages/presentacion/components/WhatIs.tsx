import { motion } from 'motion/react';
import { BicepsFlexed, Brain, Zap } from 'lucide-react';

const cardData = [
  {
    title: "Previene dolores",
    description: "Optimiza la postura y reduce la tensión muscular durante la jornada.",
    icon: BicepsFlexed,
    bgColor: "bg-[#C8E6C9]",
    iconColor: "text-brand-primary",
    accentColor: "bg-brand-tertiary-container"
  },
  {
    title: "Reduce estrés",
    description: "Técnicas de relajación diseñadas para aliviar la fatiga mental y mejorar el bienestar emocional.",
    icon: Brain,
    bgColor: "bg-[#E3F2FD]",
    iconColor: "text-[#1E88E5]",
    accentColor: "bg-blue-200"
  },
  {
    title: "Mejora el rendimiento",
    description: "Recupera la energía y el enfoque con movimientos dinamizadores.",
    icon: Zap,
    bgColor: "bg-[#E0F2F1]",
    iconColor: "text-[#26A69A]",
    accentColor: "bg-brand-tertiary-container"
  }
];

export default function WhatIs() {
  return (
    <section className="relative h-full flex flex-col items-center justify-center px-4 md:px-10 py-6 md:py-10 overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2 md:mb-8 max-w-2xl"
        >
          <h2 className="font-display text-2xl md:text-6xl text-brand-primary mb-1 md:mb-4 font-bold tracking-tight">
            ¿Qué es <span className="text-[#0B1B3D]">ReAct<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>va</span>?
          </h2>
          <p className="font-sans text-[13px] md:text-lg text-brand-on-surface-variant font-medium leading-tight">
            Un programa integral de bienestar con ejercicios personalizados, guiados y adaptados al entorno laboral.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full max-h-[65vh] md:max-h-none overflow-y-auto md:overflow-visible pr-1 md:pr-0 pb-10 md:pb-0">
          {cardData.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 md:p-8 rounded-[20px] md:rounded-[32px] flex flex-col items-center text-center shadow-lg border border-slate-100"
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 ${card.bgColor} rounded-full flex items-center justify-center mb-3 md:mb-6`}>
                <card.icon className={`${card.iconColor}`} size={20} md:size={24} />
              </div>
              <h3 className="font-display text-lg md:text-2xl font-bold mb-1 md:mb-3 text-brand-on-surface">{card.title}</h3>
              <div className={`w-8 h-1 ${card.accentColor} rounded-full mb-2 md:mb-4 opacity-50`}></div>
              <p className="text-brand-on-surface-variant font-sans leading-tight md:leading-relaxed text-[13px] md:text-base">{card.description}</p>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}

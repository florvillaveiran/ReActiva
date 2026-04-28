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
    bgColor: "bg-[#FCE4EC]",
    iconColor: "text-pink-600",
    accentColor: "bg-brand-primary-container"
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
    <section className="relative h-full flex flex-col items-center justify-center px-6 md:px-10 py-10 overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 max-w-2xl"
        >
          <h2 className="font-display text-5xl md:text-6xl text-brand-primary mb-4 font-bold tracking-tight">¿Qué es Re-Activa?</h2>
          <p className="font-sans text-base md:text-lg text-brand-on-surface-variant font-medium">
            Un programa integral de bienestar con ejercicios personalizados, guiados y adaptados al entorno laboral.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {cardData.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[32px] flex flex-col items-center text-center shadow-lg border border-slate-100"
            >
              <div className={`w-14 h-14 ${card.bgColor} rounded-full flex items-center justify-center mb-6`}>
                <card.icon className={`${card.iconColor}`} size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3 text-brand-on-surface">{card.title}</h3>
              <div className={`w-10 h-1 ${card.accentColor} rounded-full mb-4 opacity-50`}></div>
              <p className="text-brand-on-surface-variant font-sans leading-relaxed text-base">{card.description}</p>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}

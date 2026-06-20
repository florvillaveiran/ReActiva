import { motion } from 'motion/react';
import { Rocket, Target, Zap } from 'lucide-react';

const cardData = [
  {
    title: 'Potencial humano',
    description: 'Fortalecemos las capacidades de las personas para mejorar su desempeño laboral y bienestar diario.',
    icon: Zap,
    bgColor: 'bg-[#FFF1D7]',
    iconColor: 'text-[#F5A400]',
    accentColor: 'bg-[#F7C75A]',
  },
  {
    title: 'Más foco',
    description: 'Actividades para despejar la mente, mejorar la atención y la claridad.',
    icon: Target,
    bgColor: 'bg-[#DCEEFF]',
    iconColor: 'text-[#1087FF]',
    accentColor: 'bg-[#9FD0F4]',
  },
  {
    title: 'Más productividad',
    description: 'Promovemos equipos más activos, motivados y eficientes.',
    icon: Rocket,
    bgColor: 'bg-[#D8F4EF]',
    iconColor: 'text-[#12AFA5]',
    accentColor: 'bg-[#FF9AA6]',
  },
];

export default function WhatIs() {
  return (
    <section className="relative h-full flex flex-col items-center justify-center px-5 md:px-10 py-8 md:py-12 overflow-hidden">
      <div className="relative z-10 w-full max-w-[1600px] flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 md:mb-6 max-w-3xl"
        >
          <h2 className="font-display text-[1.95rem] leading-[1.05] md:text-[3.45rem] text-brand-primary mb-2 font-bold tracking-tight">
            ¿Qué es <span className="text-[#0B1B3D]">ReActiva</span>?
          </h2>
          <p className="font-sans text-[0.92rem] md:text-[1.05rem] text-[#172033] font-medium leading-tight max-w-3xl">
            Un programa integral de bienestar con ejercicios personalizados, guiados y
            <br className="hidden md:block" /> adaptados al entorno laboral.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-7xl">
          {cardData.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white min-h-[210px] md:min-h-[295px] px-5 py-7 md:px-8 md:py-8 rounded-[22px] md:rounded-[32px] flex flex-col items-center justify-center text-center shadow-lg border border-slate-100"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 ${card.bgColor} rounded-full flex items-center justify-center mb-5 md:mb-6`}>
                <card.icon className={`${card.iconColor}`} size={22} strokeWidth={2.4} />
              </div>
              <h3 className="font-display text-xl md:text-2xl leading-tight font-bold mb-3 text-black">{card.title}</h3>
              <div className={`w-8 h-1 ${card.accentColor} rounded-full mb-4 opacity-70`} />
              <p className="text-black font-sans leading-relaxed text-[0.95rem] md:text-base max-w-[350px]">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

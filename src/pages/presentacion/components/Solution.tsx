import React from 'react';
import { motion } from 'motion/react';
import { Zap, Target, Leaf, TrendingUp, ArrowRight, Users, BarChart } from 'lucide-react';

const steps = [
  {
    title: "Energía",
    desc: "Más vitalidad para dar lo mejor cada día.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    dot: "bg-yellow-400"
  },
  {
    title: "Foco",
    desc: "Mejor concentración, menos distracciones.",
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-50",
    dot: "bg-blue-400"
  },
  {
    title: "Bienestar",
    desc: "Equipos más sanos, motivados y conectados.",
    icon: Leaf,
    color: "text-green-600",
    bg: "bg-green-50",
    dot: "bg-green-500"
  },
  {
    title: "Productividad",
    desc: "Más rendimiento, mejores resultados.",
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-50",
    dot: "bg-purple-400"
  }
];

export default function Solution() {
  return (
    <section className="min-h-screen px-4 md:px-8 py-12 flex flex-col justify-center items-center bg-[#FDFBF9] overflow-hidden">
      <div className="max-w-[1200px] w-full flex flex-col items-center relative z-10">
        
        {/* Top Label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-6"
        >
          <span className="text-green-700 font-bold text-sm tracking-[0.2em] uppercase">Nuestra solución</span>
          <div className="w-8 h-[2px] bg-green-600 mt-2 rounded-full"></div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-[64px] text-[#0B1B3D] font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            ReActiva impulsa equipos<br />
            que <span className="text-green-600">rinden mejor</span>
          </h2>
        </motion.div>

        {/* Center Glow and Logo Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative w-full flex flex-col items-center mb-12"
        >
          {/* Subtle Green Arc Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/60 via-transparent to-transparent -z-10 rounded-[100%] blur-xl pointer-events-none"></div>
          
          <h3 className="font-display text-4xl lg:text-5xl font-bold tracking-tight mb-2">
            <span className="text-green-600">Re</span><span className="text-[#0B1B3D]">Activa</span>
          </h3>
          <div className="flex flex-col items-center mt-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600 mb-1"></div>
            <div className="w-px h-8 bg-gradient-to-b from-green-500 to-transparent"></div>
          </div>
        </motion.div>

        {/* Flow Nodes */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8 w-full mb-16 relative">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex flex-col items-center w-full max-w-[240px]"
              >
                <div className="relative mb-6">
                  {/* Subtle dot above the circle */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${step.dot}`}></div>
                  
                  {/* Circle Icon */}
                  <div className="w-32 h-32 rounded-full bg-white shadow-[0_10px_40px_rgb(0,0,0,0.06)] flex items-center justify-center border border-gray-50 relative z-10">
                    <div className={`w-[88px] h-[88px] rounded-full ${step.bg} flex items-center justify-center`}>
                      <step.icon className={step.color} size={40} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
                
                <h4 className="text-2xl font-bold text-[#0B1B3D] mb-3">{step.title}</h4>
                <p className="text-gray-600 text-[15px] text-center leading-relaxed px-4">
                  {step.desc}
                </p>
              </motion.div>

              {/* Arrow Connector */}
              {idx < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="hidden lg:flex items-center justify-center h-32 shrink-0"
                >
                  {/* Render a thin custom green arrow */}
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 12H38M38 12L28 2M38 12L28 22" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-5xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Left part */}
          <div className="flex-1 flex items-center justify-center gap-5">
            <Users className="text-green-600" size={36} strokeWidth={1.5} />
            <p className="text-xl md:text-2xl lg:text-[26px] font-bold text-[#0B1B3D]">
              Bienestar para las <span className="text-green-600">personas.</span>
            </p>
          </div>
          
          {/* Divider */}
          <div className="hidden md:block w-px h-14 bg-gray-200"></div>
          
          {/* Right part */}
          <div className="flex-1 flex items-center justify-center gap-5">
            <BarChart className="text-green-600" size={36} strokeWidth={1.5} />
            <p className="text-xl md:text-2xl lg:text-[26px] font-bold text-[#0B1B3D]">
              Resultados para la <span className="text-green-600">empresa.</span>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

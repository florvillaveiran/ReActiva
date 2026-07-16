import { motion } from 'motion/react';
import { TrendingUp, Heart } from 'lucide-react';

export default function Hero() {
  return (
    <section className="deck-hero relative w-full h-full flex items-center justify-center overflow-hidden px-4 md:px-10 py-6 md:py-10">
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-10 items-center">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 flex flex-col space-y-1 md:space-y-4 items-center md:items-start text-center md:text-left"
        >
          <img 
            src="/logo-reactiva-dark.png" 
            alt="ReActiva" 
            className="h-20 sm:h-24 md:h-28 lg:h-[110px] w-auto object-contain"
          />
          <h2 className="font-display text-xl sm:text-3xl md:text-6xl text-brand-on-surface-variant font-medium max-w-[15ch] sm:max-w-none">
            Bienestar laboral en movimiento.
          </h2>
        </motion.div>

        {/* Visual Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-6 relative w-full max-w-[240px] sm:max-w-[400px] md:max-w-[550px]"
        >
          <div className="relative w-full aspect-square mx-auto">
            {/* Main Hero Image with Mask */}
            <div className="absolute inset-0 bg-white p-2 md:p-3 rounded-[24px] md:rounded-[40px] shadow-xl shadow-black/5">
              <div className="w-full h-full rounded-[18px] md:rounded-[30px] overflow-hidden">
                <img 
                   alt="Modern office activity" 
                   className="w-full h-full object-cover" 
                   src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000" 
                   referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

export default function Benefits() {
  return (
    <section className="h-full px-4 md:px-6 flex flex-col justify-center items-center bg-brand-cream overflow-hidden py-8 md:py-10">
      <div className="max-w-7xl w-full flex flex-col h-full max-h-[85vh] md:max-h-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-3 md:mb-6 shrink-0"
        >
          <span className="text-brand-primary font-bold text-[8px] md:text-sm uppercase tracking-widest mb-1.5 md:mb-3 block">IMPACTO REAL</span>
          <h2 className="font-display text-2xl md:text-6xl text-[#0B1B3D] font-bold mb-1 md:mb-3 tracking-tight">
            Benef<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>c<span className="relative inline-block">ı<span className="absolute top-[0.13em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-brand-primary rounded-full"></span></span>os comprobados.
          </h2>
          <p className="font-sans text-[13px] md:text-lg text-brand-on-surface-variant max-w-2xl font-medium leading-tight">
            Programas de bienestar laboral han demostrado impactos positivos en el desempeño y bienestar de los equipos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4 overflow-y-auto pr-1 md:pr-0 pb-4 md:pb-0">

          {/* Card 1 — Productividad (col-span-2 + imagen) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-white rounded-[20px] md:rounded-[32px] shadow-sm border border-slate-50 flex flex-col lg:flex-row overflow-hidden"
          >
            <div className="p-4 md:p-8 flex-1 flex flex-col justify-between">
              <div>

                <div className="font-display text-2xl md:text-4xl font-bold text-[#2E7D32] mb-0.5 md:mb-1 tracking-tight">↑ 3–10%</div>
                <h3 className="font-display text-base md:text-2xl font-bold mb-1 md:mb-3 tracking-tight text-[#0B1B3D]">Mejora de la productividad.</h3>
                <p className="text-brand-on-surface-variant text-[11px] md:text-base font-medium leading-tight md:leading-relaxed mb-3 md:mb-5">
                  Incremento observado en programas de promoción de la salud laboral.
                </p>
              </div>
            </div>
            <div className="lg:w-2/5 h-[100px] md:h-full lg:min-h-[200px]">
              <img src="/beneficios.jpg" alt="Beneficios comprobados" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Card 2 — Ausentismo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 md:p-8 rounded-[20px] md:rounded-[32px] shadow-sm border border-slate-50 flex flex-col justify-between"
          >
            <div>

              <div className="font-display text-2xl md:text-3xl font-bold text-[#2E7D32] mb-0.5 tracking-tight">↓ 1–15%</div>
              <h3 className="font-display text-base md:text-2xl font-bold mb-1.5 md:mb-2 tracking-tight leading-tight text-[#0B1B3D]">Reducción del ausentismo.</h3>
              <p className="text-brand-on-surface-variant text-[11px] md:text-sm font-medium leading-tight md:leading-relaxed">
                Disminución reportada en programas de bienestar organizacional.
              </p>
            </div>
          </motion.div>

          {/* Card 3 — Fatiga */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 md:p-8 rounded-[20px] md:rounded-[32px] shadow-sm border border-slate-50 flex flex-col justify-between"
          >
            <div>

              <div className="font-display text-2xl md:text-3xl font-bold text-[#26A69A] mb-0.5 tracking-tight">↓ hasta 30%</div>
              <h3 className="font-display text-base md:text-2xl font-bold mb-1.5 md:mb-2 tracking-tight leading-tight text-[#0B1B3D]">Menor fatiga física y mental.</h3>
              <p className="text-brand-on-surface-variant text-[11px] md:text-sm font-medium leading-tight md:leading-relaxed">
                Mayor energía y recuperación durante la jornada laboral.
              </p>
            </div>
          </motion.div>

          {/* Card 4 — Bloque verde inferior (col-span-2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-brand-primary p-4 md:p-8 rounded-[20px] md:rounded-[32px] shadow-xl text-white flex flex-col justify-between relative overflow-hidden md:col-span-2"
          >

            <div className="max-w-lg">
              <div className="font-display text-2xl md:text-4xl font-bold mb-0.5 md:mb-1 tracking-tight opacity-90">↓ 10–25%</div>
              <h3 className="font-display text-lg md:text-2xl font-bold mb-1 md:mb-3 tracking-tight">Menos errores asociados a la fatiga.</h3>
              <p className="opacity-80 text-[11px] md:text-base font-medium leading-tight md:leading-relaxed">
                Equipos más atentos, enfocados y con mejor desempeño diario.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-1.5 mt-2 md:mt-3 shrink-0"
        >
          <BookOpen size={10} className="text-brand-on-surface-variant/50 shrink-0 mt-0.5" />
          <p className="text-[9px] md:text-[11px] text-brand-on-surface-variant/60 font-medium leading-snug italic">
            Datos obtenidos de revisiones sistemáticas y meta-análisis internacionales sobre programas de bienestar laboral.
          </p>
        </motion.div>

      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';

const pricingLevels = [
  { 
    teamSize: "Hasta 20 emp.", 
    monthlyPrice: "USD 600", 
    discountedPrice: "USD 1.620", 
    discountedMonthly: "USD 540",
    note: "" 
  },
  { 
    teamSize: "Hasta 60 emp.", 
    monthlyPrice: "USD 1.530", 
    discountedPrice: "USD 4.131", 
    discountedMonthly: "USD 1.377",
    note: "" 
  },
  { 
    teamSize: "Hasta 100 emp.", 
    monthlyPrice: "USD 2.250", 
    discountedPrice: "USD 6.075", 
    discountedMonthly: "USD 2.025",
    note: "" 
  },
  { 
    teamSize: "Hasta 150 emp.", 
    monthlyPrice: "USD 2.925", 
    discountedPrice: "USD 7.899", 
    discountedMonthly: "USD 2.633",
    note: "" 
  },
  { 
    teamSize: "+ de 150 emp.", 
    monthlyPrice: "Personalizado", 
    discountedPrice: "Consultar", 
    discountedMonthly: "",
    note: "CONSULTAR", 
    isCustom: true 
  }
];

export default function Pricing() {
  return (
    <section className="min-h-screen px-4 md:px-8 py-12 flex flex-col justify-center items-center bg-[#FDFBF9] overflow-hidden">
      <div className="max-w-[1200px] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Info Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-5xl md:text-6xl lg:text-[72px] text-[#0B1B3D] font-bold mb-8 tracking-tight uppercase leading-[1.05]">
                PLANES Y<br/>PRECIOS
              </h2>
              
              {/* Promo Card */}
              <div className="bg-[#FBE4ED] px-4 py-4 rounded-full flex items-center gap-4 relative overflow-hidden mb-8 shadow-sm">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D81B60] shadow-sm shrink-0">
                     <Star fill="currentColor" size={24} />
                  </div>
                  <div className="flex flex-col justify-center pt-0.5">
                     <h3 className="font-bold text-[#880E4F] text-lg md:text-[19px] uppercase tracking-wide leading-none mb-1.5">
                       2 SEMANAS DE PRUEBA PILOTO
                     </h3>
                     <p className="text-[#D81B60] font-bold text-[11px] md:text-xs uppercase tracking-wider leading-none">
                       SIN COSTO
                     </p>
                  </div>
              </div>

              <p className="font-sans text-lg md:text-[21px] text-[#4B5563] max-w-sm mb-10 leading-snug font-medium">
                Invierta en el activo más valioso de su empresa: el humano.
              </p>

              <div className="space-y-4">
                 {[
                   "Acceso total a la plataforma",
                   "Métricas en tiempo real",
                   "Soporte prioritario 24/7"
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3 text-[#374151] font-bold text-base md:text-lg">
                      <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center text-white shrink-0">
                         <Check size={16} strokeWidth={3} />
                      </div>
                      {feat}
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>

          {/* Pricing Table Column */}
          <div className="lg:col-span-7 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] shadow-[0_12px_40px_rgb(0,0,0,0.06)] overflow-hidden border border-gray-100"
            >
              {/* Table Header */}
              <div className="bg-green-700 p-5 px-8 grid grid-cols-12 gap-2 md:gap-4 items-center text-white font-bold text-xs md:text-[13px] uppercase tracking-widest">
                 <span className="col-span-4">EQUIPO DE HASTA</span>
                 <span className="col-span-4 text-center">INVERSIÓN MENSUAL</span>
                 <span className="col-span-4 text-right">PROGRAMA 90 DÍAS</span>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col uppercase">
                 {pricingLevels.map((lvl, index) => (
                   <div key={lvl.teamSize} className={`px-8 py-5 md:py-6 grid grid-cols-12 gap-2 md:gap-4 items-center ${index % 2 === 1 ? 'bg-[#F9FAFB]' : 'bg-white'}`}>
                      <div className="col-span-4 flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-200 shrink-0"></div>
                         <span className="font-bold text-[#4B5563] text-[15px] md:text-lg tracking-tight whitespace-nowrap">{lvl.teamSize}</span>
                      </div>
                      <div className="col-span-4 text-center">
                         <span className={`text-[15px] md:text-[19px] font-bold tracking-tight ${lvl.isCustom ? 'text-green-700' : 'text-[#1F2937]'}`}>
                            {lvl.monthlyPrice}
                            {!lvl.isCustom && <span className="text-xs md:text-[13px] text-gray-400 font-bold ml-1 tracking-tight">/ MES</span>}
                         </span>
                      </div>
                      <div className="col-span-4 text-right font-bold tracking-tight">
                         {lvl.isCustom ? (
                           <span className="text-[15px] md:text-xl text-[#4B5563]">
                              {lvl.discountedPrice}
                           </span>
                         ) : (
                           <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                              <span className="text-[15px] md:text-[20px] text-green-700">
                                 {lvl.discountedPrice}
                              </span>
                              <span className="text-[10px] md:text-[13px] text-gray-400 font-medium normal-case italic shrink-0">
                                 ({lvl.discountedMonthly}/mes)
                              </span>
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
            
            {/* Footnote */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-5 px-4"
            >
              <p className="text-gray-400 italic text-sm md:text-[15px]">
                Precios expresados a valor MEP.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

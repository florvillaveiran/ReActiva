import { motion } from 'motion/react';
import { Globe, Instagram, Leaf, Mail, MessageCircle } from 'lucide-react';

const contacts = [
  {
    icon: Mail,
    label: 'EMAIL',
    type: 'single',
    value: 'info@metodoreactiva.com',
    href: 'mailto:info@metodoreactiva.com',
  },
  {
    icon: MessageCircle,
    label: 'WHATSAPP',
    type: 'multi',
    values: [
      { text: '+54 9 261 342-8552', href: 'https://wa.me/5492613428552' },
      { text: '+54 9 261 724-0431', href: 'https://wa.me/5492617240431' },
    ],
  },
  {
    icon: Globe,
    label: 'WEB',
    type: 'single',
    value: 'metodoreactiva.com',
    href: 'https://metodoreactiva.com',
  },
  {
    icon: Instagram,
    label: 'INSTAGRAM',
    type: 'single',
    value: '@reactiva.kinesio',
    href: 'https://instagram.com/reactiva.kinesio',
  },
];

export default function Contact() {
  return (
    <section className="deck-contact h-full overflow-hidden bg-[#F9F8F3] px-5 py-8 md:px-10 md:py-10">
      <div className="presentation-safe mx-auto grid h-full max-w-[1250px] grid-cols-1 items-center gap-8 lg:grid-cols-[1.35fr_0.75fr] lg:gap-14">
        <div className="space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-[3.6rem] font-bold leading-none tracking-tight text-[#0B1B3D] md:text-[6rem]">
              Muchas gracias
            </h2>
            <h3 className="mt-5 font-display text-[2.3rem] font-bold leading-tight tracking-tight text-[#0B1B3D] md:text-[3.15rem]">
              ¿Avanzamos juntos?
            </h3>
            <p className="mt-3 text-[1.08rem] font-medium leading-tight text-brand-on-surface-variant md:text-[1.25rem]">
              Estamos listos para diseñar tu plan ReActiva.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {contacts.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex min-h-[78px] items-center gap-5 rounded-[28px] bg-white px-5 shadow-[0_10px_24px_rgba(11,27,61,0.08)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E0F2F1] text-brand-primary">
                  <item.icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-widest text-slate-300">
                    {item.label}
                  </p>
                  {item.type === 'single' ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block break-all text-[1rem] font-bold leading-tight text-[#0B1B3D] transition-colors hover:text-brand-primary"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {item.values?.map((v) => (
                        <a
                          key={v.text}
                          href={v.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[1rem] font-bold leading-tight text-[#0B1B3D] transition-colors hover:text-brand-primary"
                        >
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

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto w-full max-w-[360px]"
        >
          <div className="flex flex-col items-center rounded-[36px] bg-white px-8 py-8 text-center shadow-[0_22px_50px_rgba(11,27,61,0.09)]">
            <div className="mb-7 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#C8E6C9] text-brand-primary">
              <Leaf size={32} fill="currentColor" strokeWidth={1.8} />
            </div>

            <h3 className="font-display text-[1.65rem] font-bold text-brand-primary">Re-Activa</h3>
            <p className="mt-5 max-w-[260px] text-[1.08rem] font-medium italic leading-relaxed text-slate-500">
              "Impulsando el movimiento que tu empresa necesita."
            </p>

            <div className="mt-8 w-full max-w-[260px] overflow-hidden rounded-[22px] shadow-xl">
              <img
                src="/contacto.jpg"
                alt="Clase online de movimiento"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

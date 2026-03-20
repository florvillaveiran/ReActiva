import React, { useState } from 'react';
import { MessageCircle, ChevronDown, ArrowRight } from 'lucide-react';

export const FAQ = () => {
  const faqs = [
    {
      q: "¿Es una actividad presencial u online?",
      a: "Es 100% online a través de nuestra propia plataforma. No es necesario que un profesor asista físicamente a la empresa; el equipo accede a videos guiados asincrónicos diseñados para realizarse en cualquier momento y lugar."
    },
    {
      q: "¿Hay que hacer lugar o cambiarse de ropa?",
      a: "No, para nada. Los ejercicios están diseñados para realizarse con la misma ropa de trabajo y en el mismo escritorio o espacio donde se encuentren, sin necesidad de equipamiento adicional."
    },
    {
      q: "¿Funciona tanto en home office como en la oficina?",
      a: "Sí, el formato digital permite que cada colaborador realice su pausa activa sin importar dónde esté trabajando, garantizando que todo el equipo reciba el mismo beneficio."
    },
    {
      q: "¿La prueba es realmente gratuita?",
      a: "Sí, ofrecemos 15 días de prueba sin costo para que puedan experimentar el impacto real en la energía y el clima del equipo antes de tomar una decisión."
    },
    {
      q: "¿Cuánto tiempo toman las pausas activas?",
      a: "Cada pausa dura entre 5 y 10 minutos. Están pensadas para ser breves y efectivas, reactivando el cuerpo sin interrumpir el flujo productivo de la jornada."
    },
    {
      q: "¿Cómo miden los resultados?",
      a: "Utilizamos formularios de seguimiento y reportes mensuales que enviamos a RRHH. Medimos niveles de energía, reducción de molestias físicas y satisfacción general del equipo."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-neutral-100">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-8 h-8 text-slate-400" />
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>
          <p className="text-lg text-slate-600">Resolvemos las dudas más comunes sobre Reactiva</p>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === i ? 'border-[#10b981]/30 shadow-md' : 'border-slate-100 shadow-sm hover:border-[#10b981]/20'}`}
            >
              <button 
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-slate-900 pr-8">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-[#10b981]' : ''}`} />
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-60 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-slate-600">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-slate-600 mb-2">¿Tenés otra pregunta que no está aquí?</p>
          <a href="#bienestar" className="text-[#10b981] font-semibold hover:text-[#059669] inline-flex items-center gap-1">
            Escribinos directamente <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

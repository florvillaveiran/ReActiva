import React from 'react';
import { CalendarCheck, Clock, Sparkles } from 'lucide-react';

const CALENDLY_EVENT_URL = 'https://calendly.com/tohmefrancisco/30min?hide_event_type_details=1&hide_gdpr_banner=1&locale=es-ES&primary_color=00bfa6';

export const Agendar = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto w-full max-w-6xl px-5 py-5 lg:py-7">
        <a href="/" className="mb-5 inline-flex">
          <img src="/logo-reactiva-dark.png" alt="ReActiva" className="h-10 w-auto rounded-xl bg-white px-3 py-1.5" />
        </a>

        <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
              <Sparkles size={13} />
              Prueba piloto sin costo
            </div>

            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight lg:text-4xl">
              Agendá una reunión con ReActiva
            </h1>

            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              En 30 minutos te mostramos cómo ReActiva ayuda a cuidar el bienestar del equipo con microentrenamientos, datos claros y seguimiento para RRHH.
            </p>

            <div className="grid gap-2.5">
              {[
                { icon: <Clock size={16} />, title: '30 minutos', text: 'Una reunión breve y concreta.' },
                { icon: <CalendarCheck size={16} />, title: 'Sin costo', text: 'Ideal para evaluar una prueba piloto.' },
                { icon: <Sparkles size={16} />, title: 'Con foco en tu empresa', text: 'Vemos horarios, perfiles y necesidades reales.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-0.5 text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-400">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="h-[560px] overflow-hidden rounded-[1.35rem] bg-white shadow-xl shadow-black/25">
            <iframe
              title="Agendar reunión con ReActiva"
              src={CALENDLY_EVENT_URL}
              className="block rounded-[1.35rem]"
              scrolling="no"
              style={{
                border: 0,
                height: 660,
                width: '126%',
                transform: 'scale(0.85)',
                transformOrigin: 'top left',
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

import React from 'react';

export const Terminos = () => {
  return (
    <div className="pt-32 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Términos y Condiciones</h1>
          <p className="text-sm text-slate-500 mb-8">Última actualización: 23 de marzo de 2026</p>

          <div className="space-y-8 text-slate-600 leading-relaxed">
            <p className="text-lg">Bienvenido/a a ReActiva. Al utilizar nuestra plataforma, aceptás los siguientes términos y condiciones.</p>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Descripción del servicio</h2>
              <p>ReActiva ofrece pausas activas virtuales, contenido de bienestar y seguimiento del estado físico y general de los usuarios dentro del ámbito laboral.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Uso de la plataforma</h2>
              <p className="mb-3">El usuario se compromete a:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Utilizar la plataforma de manera responsable</li>
                <li>No compartir accesos con terceros</li>
                <li>No utilizar el contenido con fines comerciales sin autorización</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Responsabilidad</h2>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>ReActiva no reemplaza atención médica profesional</li>
                <li>Los ejercicios son de baja intensidad y de uso general</li>
                <li>Cada usuario es responsable de realizar los ejercicios según su condición física</li>
              </ul>
              <div className="bg-emerald-50 text-emerald-800 p-5 rounded-xl flex gap-3 items-start">
                <span className="text-xl">👉</span>
                <p className="font-medium">Recomendamos consultar con un profesional de la salud en caso de dudas o condiciones médicas.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Propiedad intelectual</h2>
              <p>Todo el contenido (videos, textos, ejercicios, materiales) es propiedad de ReActiva y no puede ser reproducido sin autorización.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Modificaciones</h2>
              <p>ReActiva puede modificar estos términos en cualquier momento. Se notificará en la plataforma o vía email.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Cancelación del servicio</h2>
              <p>Las empresas o usuarios pueden dejar de utilizar el servicio en cualquier momento. Las condiciones comerciales serán acordadas previamente con cada empresa.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

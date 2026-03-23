import React from 'react';

export const Privacidad = () => {
  return (
    <div className="pt-32 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Política de Privacidad</h1>
          <p className="text-sm text-slate-500 mb-8">Última actualización: 23 de marzo de 2026</p>
          
          <div className="space-y-8 text-slate-600 leading-relaxed text-lg">
            <p className="text-lg">En ReActiva valoramos y protegemos la información personal de nuestros usuarios.</p>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Información que recopilamos</h2>
              <p className="mb-3">Podemos recopilar:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Nombre y apellido</li>
                <li>Email</li>
                <li>Teléfono</li>
                <li>Información laboral (empresa, área, etc.)</li>
                <li>Respuestas a formularios (bienestar, molestias, energía, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Uso de la información</h2>
              <p className="mb-3">Utilizamos la información para:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personalizar las pausas activas</li>
                <li>Mejorar la experiencia del usuario</li>
                <li>Generar reportes para empresas (de forma agregada)</li>
                <li>Contactar al usuario si es necesario</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Confidencialidad</h2>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>No vendemos ni compartimos datos personales con terceros</li>
                <li>Los datos se usan únicamente con fines internos del servicio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Reportes a empresas</h2>
              <p>Las empresas reciben información agregada y anónima, nunca datos individuales sensibles sin consentimiento.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Seguridad</h2>
              <p>Implementamos medidas de seguridad para proteger la información de accesos no autorizados.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Derechos del usuario</h2>
              <p className="mb-3">El usuario puede:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Solicitar acceso a sus datos</li>
                <li>Pedir corrección o eliminación</li>
                <li>Darse de baja del servicio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cookies (si aplica)</h2>
              <p>Podemos utilizar cookies para mejorar la experiencia dentro de la plataforma.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

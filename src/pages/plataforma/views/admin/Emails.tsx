import React, { useState } from 'react';
import { Mail, Clock, MessageSquare, Send, AlarmClock } from 'lucide-react';

export const Emails: React.FC = () => {
  // Recordatorio antes de la pausa
  const [minutosAntes, setMinutosAntes] = useState(15);
  const [mensajeManana, setMensajeManana] = useState('¡Buenos días! Es hora de tu primera pausa activa del día. Tómate 5 minutos para recargar energía.');
  const [mensajeTarde, setMensajeTarde] = useState('¡Hola! Un último esfuerzo. Despeja tu mente con esta breve pausa activa de la tarde.');

  // Seguimiento si no hicieron la pausa
  const [minutosDespues, setMinutosDespues] = useState(30);
  const [mensajeFollowupManana, setMensajeFollowupManana] = useState('Vimos que no pudiste hacer tu pausa esta mañana. Todavía estás a tiempo — tómate 5 minutos y volvé a tu día con más energía.');
  const [mensajeFollowupTarde, setMensajeFollowupTarde] = useState('Sabemos que el día se complica. Aún podés cerrar la jornada con tu pausa activa de la tarde. Te toma menos de lo que pensás.');

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3rem)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Emails Automáticos</h2>
        <button className="btn-primary" style={{ gap: '0.5rem' }}>
          <Save size={18} /> Guardar Configuración
        </button>
      </div>

      {/* ─── Sección 1: Recordatorio antes de la pausa ──────────────────── */}
      <div style={{ marginBottom: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="var(--primary-color)" /> Recordatorio antes de la pausa
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', flex: 1, minHeight: 0 }}>
          {/* Tiempo de envío (antes) */}
          <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary-color)" />
              Tiempo de Envío
            </h3>
            <p className="text-sm text-muted" style={{ marginBottom: '1rem', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Minutos antes de la hora habilitada del video.
            </p>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Anticipación</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="number"
                  className="input-field"
                  value={minutosAntes}
                  onChange={(e) => setMinutosAntes(Number(e.target.value))}
                  style={{ width: '90px', backgroundColor: 'var(--bg-secondary-color)', border: 'none' }}
                />
                <span className="font-medium" style={{ fontSize: '0.85rem' }}>minutos antes</span>
              </div>
            </div>
          </div>

          {/* Mensajes (antes) */}
          <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontSize: '0.88rem' }}>
                  <Mail size={14} /> Recordatorio Mañana
                </h4>
                <textarea
                  className="input-field"
                  value={mensajeManana}
                  onChange={(e) => setMensajeManana(e.target.value)}
                  style={{ resize: 'none', backgroundColor: 'var(--bg-secondary-color)', border: 'none', fontSize: '0.85rem', flex: 1, minHeight: '90px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', display: 'flex', alignItems: 'center' }}>
                    <Send size={12} /> Enviar prueba
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontSize: '0.88rem' }}>
                  <Mail size={14} /> Recordatorio Tarde
                </h4>
                <textarea
                  className="input-field"
                  value={mensajeTarde}
                  onChange={(e) => setMensajeTarde(e.target.value)}
                  style={{ resize: 'none', backgroundColor: 'var(--bg-secondary-color)', border: 'none', fontSize: '0.85rem', flex: 1, minHeight: '90px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', display: 'flex', alignItems: 'center' }}>
                    <Send size={12} /> Enviar prueba
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sección 2: Seguimiento si no hicieron la pausa ──────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlarmClock size={16} color="#9333ea" /> Seguimiento si no hicieron la pausa
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', flex: 1, minHeight: 0 }}>
          {/* Tiempo de envío (después) */}
          <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlarmClock size={18} color="#9333ea" />
              Tiempo de Envío
            </h3>
            <p className="text-sm text-muted" style={{ marginBottom: '1rem', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Minutos después de la hora habilitada para quienes no hicieron la pausa.
            </p>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Tiempo de espera</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="number"
                  className="input-field"
                  value={minutosDespues}
                  onChange={(e) => setMinutosDespues(Number(e.target.value))}
                  style={{ width: '90px', backgroundColor: 'var(--bg-secondary-color)', border: 'none' }}
                />
                <span className="font-medium" style={{ fontSize: '0.85rem' }}>minutos después</span>
              </div>
            </div>
          </div>

          {/* Mensajes (después) */}
          <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontSize: '0.88rem' }}>
                  <Mail size={14} /> Seguimiento Mañana
                </h4>
                <textarea
                  className="input-field"
                  value={mensajeFollowupManana}
                  onChange={(e) => setMensajeFollowupManana(e.target.value)}
                  style={{ resize: 'none', backgroundColor: 'var(--bg-secondary-color)', border: 'none', fontSize: '0.85rem', flex: 1, minHeight: '90px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', display: 'flex', alignItems: 'center' }}>
                    <Send size={12} /> Enviar prueba
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontSize: '0.88rem' }}>
                  <Mail size={14} /> Seguimiento Tarde
                </h4>
                <textarea
                  className="input-field"
                  value={mensajeFollowupTarde}
                  onChange={(e) => setMensajeFollowupTarde(e.target.value)}
                  style={{ resize: 'none', backgroundColor: 'var(--bg-secondary-color)', border: 'none', fontSize: '0.85rem', flex: 1, minHeight: '90px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', display: 'flex', alignItems: 'center' }}>
                    <Send size={12} /> Enviar prueba
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pequeño workaround para que lucide Save funcione aquí
const Save = ({ size }: { size: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;

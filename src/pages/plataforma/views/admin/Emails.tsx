import React, { useState } from 'react';
import { Mail, Clock, MessageSquare, Send, Bell } from 'lucide-react';

export const Emails: React.FC = () => {
  const [minutosAntes, setMinutosAntes] = useState(15);
  const [mensajeManana, setMensajeManana] = useState('¡Buenos días! Es hora de tu primera pausa activa del día. Tómate 5 minutos para recargar energía.');
  const [mensajeTarde, setMensajeTarde] = useState('¡Hola! Un último esfuerzo. Despeja tu mente con esta breve pausa activa de la tarde.');

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Emails Automáticos</h2>
        <button className="btn-primary" style={{ gap: '0.5rem' }}>
          <Save size={20} /> Guardar Configuración
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Panel Configuración General */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--primary-color)" />
              Tiempo de Envío
            </h3>
            
            <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
              Define cuántos minutos antes de la hora habilitada del video se enviará el recordatorio.
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Minutos de anticipación</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="number" 
                  className="input-field" 
                  value={minutosAntes} 
                  onChange={(e) => setMinutosAntes(Number(e.target.value))}
                  style={{ width: '100px', backgroundColor: 'var(--bg-secondary-color)', border: 'none' }} 
                />
                <span className="font-medium">minutos</span>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '2rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} /> Tips para Emails
             </h3>
             <ul className="text-sm" style={{ color: '#15803d', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Usa un tono humano y cercano.</li>
                <li>Mantén el mensaje corto y directo.</li>
                <li>Motiva a la acción sin presionar.</li>
             </ul>
          </div>
        </div>

        {/* Panel de Mensajes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={22} color="var(--primary-color)" />
              Personalización de Mensajes
            </h3>

            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                <Mail size={16} /> Recordatorio Mañana
              </h4>
              <textarea 
                className="input-field" 
                rows={4} 
                value={mensajeManana}
                onChange={(e) => setMensajeManana(e.target.value)}
                style={{ resize: 'none', backgroundColor: 'var(--bg-secondary-color)', border: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <Send size={14} /> Enviar prueba
                </button>
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
                <Mail size={16} /> Recordatorio Tarde
              </h4>
              <textarea 
                className="input-field" 
                rows={4} 
                value={mensajeTarde}
                onChange={(e) => setMensajeTarde(e.target.value)}
                style={{ resize: 'none', backgroundColor: 'var(--bg-secondary-color)', border: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <Send size={14} /> Enviar prueba
                </button>
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

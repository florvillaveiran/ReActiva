import React, { useState } from 'react';
import { Calendar, Clock, Video, Save, Plus, ChevronRight } from 'lucide-react';

const mockDiasActivos = [
  { dia: 'Lunes', fecha: '2026-05-25', completado: true },
  { dia: 'Miércoles', fecha: '2026-05-27', completado: false },
  { dia: 'Viernes', fecha: '2026-05-29', completado: false },
];

export const Contenido: React.FC = () => {
  const [selectedDia, setSelectedDia] = useState<string>('Lunes');

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Gestión de Contenidos</h2>
        <button className="btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={20} /> Nuevo Mes
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Panel Izquierdo: Calendario / Días */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--primary-color)" />
              Mes Actual
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mockDiasActivos.map((d) => (
                <button
                  key={d.dia}
                  onClick={() => setSelectedDia(d.dia)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: selectedDia === d.dia ? 'rgba(0, 194, 168, 0.1)' : 'transparent',
                    border: `1px solid ${selectedDia === d.dia ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    color: selectedDia === d.dia ? 'var(--primary-color)' : 'var(--text-color)',
                    fontWeight: selectedDia === d.dia ? 600 : 500,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span>{d.dia}</span>
                    <span className="text-sm" style={{ color: selectedDia === d.dia ? 'var(--primary-color)' : 'var(--text-muted)' }}>{d.fecha}</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Configuración del Día */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>
              Configuración: {selectedDia}
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ marginBottom: '1rem' }}>Empresa Asignada</label>
              <select className="input-field" style={{ backgroundColor: 'var(--bg-secondary-color)', border: 'none' }}>
                <option value="all">Todas las empresas (Global)</option>
                <option value="empresa1">Empresa Alpha</option>
                <option value="empresa2">Empresa Beta</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              
              {/* Bloque Mañana */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                  Bloque Mañana
                </h4>
                
                <div className="form-group">
                  <label className="form-label text-sm"><Video size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Link del Video</label>
                  <input type="text" className="input-field" placeholder="https://vimeo.com/..." defaultValue="https://vimeo.com/123456" />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label text-sm"><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Hora de Habilitación</label>
                  <input type="time" className="input-field" defaultValue="08:00" />
                </div>
              </div>

              {/* Bloque Tarde */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
                  Bloque Tarde
                </h4>
                
                <div className="form-group">
                  <label className="form-label text-sm"><Video size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Link del Video</label>
                  <input type="text" className="input-field" placeholder="https://vimeo.com/..." defaultValue="https://vimeo.com/789012" />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label text-sm"><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Hora de Habilitación</label>
                  <input type="time" className="input-field" defaultValue="15:00" />
                </div>
                
                <p className="text-sm text-muted" style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                  * El bloque tarde permanecerá bloqueado hasta que el usuario complete el bloque de la mañana.
                </p>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
              <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

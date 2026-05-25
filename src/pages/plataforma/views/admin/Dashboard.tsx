import React, { useState, useMemo } from 'react';
import { Users, Activity, HeartPulse, Sparkles, Smile } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Mock data base
const dataGlobal = [
  { name: 'Lun', participacion: 85 },
  { name: 'Mar', participacion: 80 },
  { name: 'Mié', participacion: 90 },
  { name: 'Jue', participacion: 85 },
  { name: 'Vie', participacion: 95 },
];

const dataEmpresa1 = [
  { name: 'Lun', participacion: 95 },
  { name: 'Mar', participacion: 85 },
  { name: 'Mié', participacion: 95 },
  { name: 'Jue', participacion: 90 },
  { name: 'Vie', participacion: 98 },
];

const dataEmpresa2 = [
  { name: 'Lun', participacion: 65 },
  { name: 'Mar', participacion: 60 },
  { name: 'Mié', participacion: 75 },
  { name: 'Jue', participacion: 70 },
  { name: 'Vie', participacion: 80 },
];

export const AdminDashboard: React.FC = () => {
  const [empresaId, setEmpresaId] = useState('all');
  const [mensaje, setMensaje] = useState('¡Excelente semana equipo! Recuerden tomar pausas activas.');
  
  const sugerirMensaje = () => {
    const opciones = [
      "¡Vamos con toda la energía esta semana!",
      "Tu bienestar es nuestra prioridad. ¡Toma tu pausa activa!",
      "Un cuerpo en movimiento es una mente más productiva."
    ];
    setMensaje(opciones[Math.floor(Math.random() * opciones.length)]);
  };

  // Dinámicamente calcular métricas en base al filtro
  const metrics = useMemo(() => {
    if (empresaId === 'empresa1') {
      return { totales: 450, participacion: '93%', dolor: '8%', emocion: '4.2/5', data: dataEmpresa1 };
    } else if (empresaId === 'empresa2') {
      return { totales: 320, participacion: '70%', dolor: '18%', emocion: '3.4/5', data: dataEmpresa2 };
    }
    return { totales: '1,240', participacion: '87%', dolor: '12%', emocion: '3.9/5', data: dataGlobal };
  }, [empresaId]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Dashboard General</h2>
        <select 
          className="input-field" 
          style={{ width: '220px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
          value={empresaId}
          onChange={(e) => setEmpresaId(e.target.value)}
        >
          <option value="all">Todas las empresas</option>
          <option value="empresa1">Empresa Alpha</option>
          <option value="empresa2">Empresa Beta</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', color: '#0284c7', borderRadius: 'var(--radius-sm)' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Empleados</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{metrics.totales}</p>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: 'var(--radius-sm)' }}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Participación</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{metrics.participacion}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fefce8', color: '#d97706', borderRadius: 'var(--radius-sm)' }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Con Dolor (hoy)</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{metrics.dolor}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f5f3ff', color: '#7c3aed', borderRadius: 'var(--radius-sm)' }}>
            <Smile size={24} />
          </div>
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Estado Emocional</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{metrics.emocion}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--text-color)' }}>Evolución de Participación</h3>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={13} fill="var(--text-muted)" />
                <YAxis axisLine={false} tickLine={false} fontSize={13} fill="var(--text-muted)" />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="participacion" fill="var(--primary-color)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-color)' }}>Mensaje para el equipo</h3>
          <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>Define el mensaje del día para conectar con los usuarios.</p>
          
          <textarea 
            className="input-field" 
            rows={5} 
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            style={{ marginBottom: '1.5rem', resize: 'none', backgroundColor: 'var(--bg-secondary-color)', border: 'none' }}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-secondary" onClick={sugerirMensaje} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary-color)" />
              Sugerir mensaje IA
            </button>
            <button className="btn-primary" style={{ width: '100%' }}>
              Guardar y Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

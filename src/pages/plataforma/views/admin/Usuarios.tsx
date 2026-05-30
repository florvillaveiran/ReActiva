import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';

// Modelo interno de usuario.
// `fechaCreacion`, `ultimoAcceso` y `cantidadPausas` se guardan para reporting y analytics
// (no se renderizan en la tabla, son uso interno y para el backend cuando exista).
// Estado normalizado a 'Activo' único.
interface Usuario {
  id: number;
  nombre: string;
  empresa: string;
  participacion: number;
  dolor: boolean;
  interaccion: string;
  estado: 'Activo';
  fechaCreacion: string;   // ISO date
  ultimoAcceso: string;    // ISO date
  cantidadPausas: number;
}

const mockUsuarios: Usuario[] = [
  { id: 1, nombre: 'Ana García',      empresa: 'Empresa Alpha', participacion: 95, dolor: false, interaccion: 'Hace 2 horas',   estado: 'Activo', fechaCreacion: '2026-03-12T10:15:00Z', ultimoAcceso: '2026-05-30T08:20:00Z', cantidadPausas: 47 },
  { id: 2, nombre: 'Carlos López',    empresa: 'Empresa Beta',  participacion: 40, dolor: true,  interaccion: 'Hace 5 días',    estado: 'Activo', fechaCreacion: '2026-04-02T09:30:00Z', ultimoAcceso: '2026-05-25T14:05:00Z', cantidadPausas: 12 },
  { id: 3, nombre: 'María Rodríguez', empresa: 'Empresa Alpha', participacion: 88, dolor: false, interaccion: 'Hace 1 hora',    estado: 'Activo', fechaCreacion: '2026-02-20T11:00:00Z', ultimoAcceso: '2026-05-30T09:10:00Z', cantidadPausas: 53 },
  { id: 4, nombre: 'Juan Pérez',      empresa: 'Empresa Gamma', participacion: 60, dolor: true,  interaccion: 'Hace 2 semanas', estado: 'Activo', fechaCreacion: '2026-01-15T08:45:00Z', ultimoAcceso: '2026-05-16T16:30:00Z', cantidadPausas: 28 },
  { id: 5, nombre: 'Luis Torres',     empresa: 'Empresa Beta',  participacion: 92, dolor: false, interaccion: 'Ayer',           estado: 'Activo', fechaCreacion: '2026-03-28T14:20:00Z', ultimoAcceso: '2026-05-29T18:00:00Z', cantidadPausas: 41 },
];

export const Usuarios: React.FC = () => {
  const [empresaFiltro, setEmpresaFiltro] = useState('all');
  const [search, setSearch] = useState('');

  const usuariosFiltrados = mockUsuarios.filter(u => {
    const coincideEmpresa = empresaFiltro === 'all' || u.empresa === empresaFiltro;
    const coincideBusqueda = u.nombre.toLowerCase().includes(search.toLowerCase());
    return coincideEmpresa && coincideBusqueda;
  });

  // Formato corto de fecha (dd MMM yy) en español
  const formatFecha = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
    } catch {
      return '—';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Usuarios</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            className="input-field" 
            style={{ width: '220px', backgroundColor: 'var(--bg-color)' }}
            value={empresaFiltro}
            onChange={(e) => setEmpresaFiltro(e.target.value)}
          >
            <option value="all">Todas las empresas</option>
            <option value="Empresa Alpha">Empresa Alpha</option>
            <option value="Empresa Beta">Empresa Beta</option>
            <option value="Empresa Gamma">Empresa Gamma</option>
          </select>
          <button className="btn-primary">Invitar Usuarios</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por nombre..." 
            style={{ paddingLeft: '3rem', border: 'none', backgroundColor: 'var(--bg-secondary-color)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Nombre</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Empresa</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Participación</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>¿Dolor?</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Última Interacción</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pausas</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Alta</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron usuarios.</td>
              </tr>
            )}
            {usuariosFiltrados.map((usuario, idx) => (
              <tr key={usuario.id} style={{ borderBottom: idx !== usuariosFiltrados.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{usuario.nombre}</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{usuario.empresa}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${usuario.participacion}%`, height: '100%', backgroundColor: usuario.participacion > 70 ? 'var(--primary-color)' : '#f59e0b', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{usuario.participacion}%</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  {usuario.dolor ? (
                    <span className="badge badge-warning" style={{ gap: '0.25rem' }}><AlertCircle size={14} /> Sí</span>
                  ) : (
                    <span className="text-muted">No</span>
                  )}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{usuario.interaccion}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.95rem' }}>{usuario.cantidadPausas}</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatFecha(usuario.fechaCreacion)}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.3rem 0.75rem', borderRadius: '999px',
                    backgroundColor: '#ecfdf5', color: '#059669',
                    fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981' }} />
                    {usuario.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

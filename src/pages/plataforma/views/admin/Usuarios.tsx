import React, { useState } from 'react';
import { Search, Filter, MoreVertical, AlertCircle } from 'lucide-react';

const mockUsuarios = [
  { id: 1, nombre: 'Ana García', empresa: 'Empresa Alpha', participacion: 95, dolor: false, interaccion: 'Hace 2 horas' },
  { id: 2, nombre: 'Carlos López', empresa: 'Empresa Beta', participacion: 40, dolor: true, interaccion: 'Hace 5 días' },
  { id: 3, nombre: 'María Rodríguez', empresa: 'Empresa Alpha', participacion: 88, dolor: false, interaccion: 'Hace 1 hora' },
  { id: 4, nombre: 'Juan Pérez', empresa: 'Empresa Gamma', participacion: 60, dolor: true, interaccion: 'Hace 2 semanas' },
  { id: 5, nombre: 'Luis Torres', empresa: 'Empresa Beta', participacion: 92, dolor: false, interaccion: 'Ayer' },
];

export const Usuarios: React.FC = () => {
  const [empresaFiltro, setEmpresaFiltro] = useState('all');
  const [search, setSearch] = useState('');

  const usuariosFiltrados = mockUsuarios.filter(u => {
    const coincideEmpresa = empresaFiltro === 'all' || u.empresa === empresaFiltro;
    const coincideBusqueda = u.nombre.toLowerCase().includes(search.toLowerCase());
    return coincideEmpresa && coincideBusqueda;
  });

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
              <th style={{ padding: '1.25rem 1.5rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron usuarios.</td>
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
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Building2, BarChart3, LogOut, PlaySquare, Video, Mail } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/plataforma/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
    { to: '/plataforma/admin/contenido', icon: <Video size={20} />, label: 'Contenidos' },
    { to: '/plataforma/admin/empresas', icon: <Building2 size={20} />, label: 'Empresas' },
    { to: '/plataforma/admin/usuarios', icon: <Users size={20} />, label: 'Usuarios' },
    { to: '/plataforma/admin/analiticas', icon: <BarChart3 size={20} />, label: 'Analíticas' },
    { to: '/plataforma/admin/emails', icon: <Mail size={20} />, label: 'Emails' },
  ];

  const userLinks = [
    { to: '/plataforma/usuario', icon: <PlaySquare size={20} />, label: 'Mi Programa', end: true },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="sidebar">
      <div style={{ padding: '2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 700 }}>Método Reactiva</h1>
      </div>
      
      <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'rgba(0, 194, 168, 0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s'
            })}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ marginBottom: '1rem', padding: '0 1rem' }}>
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-sm text-muted">{user?.role}</p>
        </div>
        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem 1rem',
            color: '#ef4444',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Building2, BarChart3, LogOut, PlaySquare, Video, Mail, Activity, Lightbulb, GraduationCap, Menu, X } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

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
    { to: '/plataforma/usuario/progreso', icon: <Activity size={20} />, label: 'Mi Progreso' },
    { to: '/plataforma/usuario/coach', icon: <Lightbulb size={20} />, label: 'ReActiva Tips' },
    { to: '/plataforma/usuario/academia', icon: <GraduationCap size={20} />, label: 'Academia ReActiva' },
  ];

  const rrhhLinks = [
    { to: '/plataforma/rrhh/analiticas', icon: <BarChart3 size={20} />, label: 'Analiticas' },
    { to: '/plataforma/rrhh/usuarios', icon: <Users size={20} />, label: 'Usuarios' },
    { to: '/plataforma/rrhh/empresas', icon: <Building2 size={20} />, label: 'Empresa' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'rrhh' ? rrhhLinks : userLinks;

  return <>
    <aside className={`sidebar${mobileMenuOpen ? ' is-mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <img src="/logo-reactiva-dark.png" alt="Re-Activa" />
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(open => !open)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      
      <div className="sidebar-panel">
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : undefined}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-account">
          <div className="sidebar-user">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-sm text-muted">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="sidebar-logout"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
    {mobileMenuOpen && (
      <button
        type="button"
        className="mobile-nav-overlay"
        aria-label="Cerrar menú"
        onClick={() => setMobileMenuOpen(false)}
      />
    )}
  </>;
};

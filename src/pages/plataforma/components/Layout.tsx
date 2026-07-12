import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Role, useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';

const homeForRole = (role: Role) => {
  if (role === 'admin') return '/plataforma/admin';
  if (role === 'rrhh') return '/plataforma/rrhh';
  return '/plataforma/usuario';
};

export const Layout: React.FC<{ allowedRole?: Role }> = ({ allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/plataforma/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={homeForRole(user.role)} />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

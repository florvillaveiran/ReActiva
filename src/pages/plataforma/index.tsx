import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { AdminDashboard } from './views/admin/Dashboard';
import { UsuarioDashboard } from './views/usuario/Dashboard';
import { UsuarioProgreso } from './views/usuario/Progreso';
import { Empresas } from './views/admin/Empresas';
import { Usuarios } from './views/admin/Usuarios';
import { Analiticas } from './views/admin/Analiticas';
import { Contenido } from './views/admin/Contenido';
import { Emails } from './views/admin/Emails';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <div id="plataforma-root">
        <Routes>
        <Route path="login" element={<Login />} />

          {/* Rutas de Admin */}
          <Route path="admin" element={<Layout allowedRole="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="contenido" element={<Contenido />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="analiticas" element={<Analiticas />} />
            <Route path="emails" element={<Emails />} />
          </Route>

          {/* Rutas de Usuario */}
          <Route path="usuario" element={<Layout allowedRole="usuario" />}>
            <Route index element={<UsuarioDashboard />} />
            <Route path="progreso" element={<UsuarioProgreso />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

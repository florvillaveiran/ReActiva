import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmpresasProvider } from './context/EmpresasContext';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { AdminDashboard } from './views/admin/Dashboard';
import { UsuarioDashboard } from './views/usuario/Dashboard';
import { UsuarioProgreso } from './views/usuario/Progreso';
import { UsuarioTips } from './views/usuario/Tips';
import { UsuarioAcademia } from './views/usuario/Academia';
import { Empresas } from './views/admin/Empresas';
import { Usuarios } from './views/admin/Usuarios';
import { Analiticas } from './views/admin/Analiticas';
import { Contenido } from './views/admin/Contenido';
import { Emails } from './views/admin/Emails';
import { Feedback } from './views/admin/Feedback';
import { EmpresaDashboard } from './views/rrhh/EmpresaDashboard';
import { EmpresaOnboarding } from './views/EmpresaOnboarding';
import { UsuarioOnboarding } from './views/UsuarioOnboarding';
import { DemoEmpresa, DemoUsuarios } from './views/demo/RrhhDemo';
import './index.css';

const DemoAware: React.FC<{ children: React.ReactNode; demo: React.ReactNode }> = ({ children, demo }) => {
  const { user } = useAuth();
  return user?.isDemo ? <>{demo}</> : <>{children}</>;
};

function App() {
  return (
    <EmpresasProvider>
      <AuthProvider>
        <div id="plataforma-root">
          <Routes>
          <Route path="login" element={<Login />} />
          <Route path="demo" element={<Login />} />

            {/* Rutas de Admin */}
            <Route path="admin" element={<Layout allowedRole="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="contenido" element={<Contenido />} />
              <Route path="empresas" element={<Empresas />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="analiticas" element={<Analiticas />} />
              <Route path="emails" element={<Emails />} />
              <Route path="feedback" element={<Feedback />} />
            </Route>

            {/* Rutas de RRHH */}
            <Route path="rrhh" element={<Layout allowedRole="rrhh" />}>
              <Route index element={<EmpresaDashboard />} />
              <Route path="empresas" element={<DemoAware demo={<DemoEmpresa />}><Empresas /></DemoAware>} />
              <Route path="usuarios" element={<DemoAware demo={<DemoUsuarios />}><Usuarios /></DemoAware>} />
              <Route path="analiticas" element={<Analiticas />} />
            </Route>

            {/* Rutas de Usuario */}
            <Route path="usuario" element={<Layout allowedRole="usuario" />}>
              <Route index element={<UsuarioDashboard />} />
              <Route path="progreso" element={<UsuarioProgreso />} />
              <Route path="coach" element={<UsuarioTips />} />
              <Route path="academia" element={<UsuarioAcademia />} />
              <Route path="tips" element={<Navigate to="/plataforma/usuario/coach" replace />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="e/:token" element={<EmpresaOnboarding />} />
            <Route path="i/:token" element={<UsuarioOnboarding />} />
            <Route path="onboarding/empresa/:token" element={<EmpresaOnboarding />} />
            <Route path="onboarding/usuario/:token" element={<UsuarioOnboarding />} />
            <Route path="invitacion/:token" element={<UsuarioOnboarding />} />
            <Route path="*" element={<Navigate to="login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </EmpresasProvider>
  );
}

export default App;

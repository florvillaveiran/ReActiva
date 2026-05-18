import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PlataformaHome from "./PlataformaHome";
import Dashboard from "./Dashboard";
import Admin from "./Admin";

export default function PlataformaApp() {
  const [user, setUser] = useState<{ role: string; name: string; companyId: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("reactiva_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (userData: { role: string; name: string; companyId: string }) => {
    setUser(userData);
    localStorage.setItem("reactiva_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("reactiva_user");
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user 
            ? <Navigate to={user.role === "admin" ? "admin" : "dashboard"} /> 
            : <PlataformaHome onLogin={login} />
        } 
      />
      <Route 
        path="dashboard" 
        element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/plataforma" />} 
      />
      <Route 
        path="admin" 
        element={user?.role === "admin" ? <Admin onLogout={logout} /> : <Navigate to="/plataforma" />} 
      />
    </Routes>
  );
}

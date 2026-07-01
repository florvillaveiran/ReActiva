import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'admin' | 'usuario' | 'rrhh';

export interface User {
  email: string;
  role: Role;
  name: string;
  empresa_id?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('reactiva_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const USERS = [
    { email: 'admin@reactiva.com', password: 'Reactiva2025', role: 'admin' as Role, name: 'Administrador' },
    { email: 'usuario@reactiva.com', password: 'Reactiva2025', role: 'usuario' as Role, name: 'Usuario Demo' },
    { email: 'rrhh@alpha.com', password: 'Reactiva2025', role: 'rrhh' as Role, name: 'RRHH Empresa Alpha', empresa_id: 1 },
  ];

  const login = (email: string, password: string): boolean => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return false;

    const newUser: User = { email: found.email, role: found.role, name: found.name, empresa_id: found.empresa_id };
    localStorage.setItem('reactiva_user', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('reactiva_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

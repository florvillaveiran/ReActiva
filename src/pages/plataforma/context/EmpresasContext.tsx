import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDB, Empresa } from '../mock/data';

interface EmpresasContextType {
  empresas: Empresa[];
  refreshEmpresas: () => void;
}

const EmpresasContext = createContext<EmpresasContextType | undefined>(undefined);

export const EmpresasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const refreshEmpresas = () => {
    const db = getDB();
    setEmpresas(db.empresas);
  };

  useEffect(() => {
    // Initial load
    refreshEmpresas();

    // Listen for storage events (across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'reactiva_db' || e.key === null) {
        refreshEmpresas();
      }
    };

    // Custom event for intra-tab communication
    const handleLocalUpdate = () => refreshEmpresas();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('reactiva_db_update', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('reactiva_db_update', handleLocalUpdate);
    };
  }, []);

  return (
    <EmpresasContext.Provider value={{ empresas, refreshEmpresas }}>
      {children}
    </EmpresasContext.Provider>
  );
};

export const useEmpresas = () => {
  const context = useContext(EmpresasContext);
  if (context === undefined) {
    throw new Error('useEmpresas must be used within an EmpresasProvider');
  }
  return context;
};

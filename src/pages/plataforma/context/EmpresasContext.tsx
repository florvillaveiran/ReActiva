import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDB, Empresa } from '../mock/data';
import { supabase } from '../lib/supabase';

interface EmpresasContextType {
  empresas: Empresa[];
  refreshEmpresas: () => void;
}

const EmpresasContext = createContext<EmpresasContextType | undefined>(undefined);

export const EmpresasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const refreshEmpresas = async () => {
    if (!supabase) {
      setEmpresas(getDB().empresas);
      return;
    }

    setEmpresas([]);

    const [{ data: companies, error: companiesError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabase
        .from('companies')
        .select('id, name, location, status, contact_name, rrhh_email, onboarding_completed_at, created_at')
        .order('created_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('id, company_id')
        .eq('role', 'usuario'),
    ]);

    if (companiesError || profilesError || !companies) {
      console.error('No se pudieron cargar empresas desde Supabase', companiesError ?? profilesError);
      return;
    }

    const employeeCount = new Map<string, number>();
    (profiles ?? []).forEach((profile: any) => {
      if (!profile.company_id) return;
      employeeCount.set(profile.company_id, (employeeCount.get(profile.company_id) ?? 0) + 1);
    });

    const hashToNumericId = (value: string) => {
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash) + 10000;
    };

    const statusFromSupabase = (status?: string): Empresa['estado'] => {
      if (status === 'pending_onboarding') return 'Pendiente onboarding';
      if (status === 'inactive') return 'Inactiva';
      return 'Activa';
    };

    setEmpresas(companies.map((company: any) => ({
      id: hashToNumericId(company.id),
      supabaseId: company.id,
      nombre: company.name,
      ubicacion: company.location ?? '',
      empleados: Array.from({ length: employeeCount.get(company.id) ?? 0 }, (_, index) => index + 1),
      estado: statusFromSupabase(company.status),
      contactoNombre: company.contact_name ?? '',
      rrhhEmail: company.rrhh_email ?? '',
      fechaOnboarding: company.onboarding_completed_at ?? company.created_at,
    })));
  };

  useEffect(() => {
    // Initial load
    void refreshEmpresas();

    // Listen for storage events (across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'reactiva_db' || e.key === null) {
        refreshEmpresas();
      }
    };

    // Custom event for intra-tab communication
    const handleLocalUpdate = () => void refreshEmpresas();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('reactiva_db_update', handleLocalUpdate);
    window.addEventListener('reactiva-companies-updated', handleLocalUpdate);

    const channel = supabase
      ? supabase
          .channel('platform-companies')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, handleLocalUpdate)
          .subscribe()
      : null;

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('reactiva_db_update', handleLocalUpdate);
      window.removeEventListener('reactiva-companies-updated', handleLocalUpdate);
      if (channel && supabase) void supabase.removeChannel(channel);
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

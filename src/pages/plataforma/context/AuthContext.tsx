import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type Role = 'admin' | 'usuario' | 'rrhh';

export interface User {
  email: string;
  role: Role;
  name: string;
  empresa_id?: number | string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  createAccess: (params: { email: string; password: string; fullName: string; invitationToken?: string }) => Promise<{ ok: boolean; message?: string }>;
  activateInvitation: (invitationToken: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV_USERS = [
  { email: 'usuario@reactiva.com', password: 'reactiva', role: 'usuario' as Role, name: 'Usuario Demo' },
];

const roleFromValue = (value: unknown): Role => {
  if (value === 'admin' || value === 'rrhh' || value === 'usuario') return value;
  return 'usuario';
};

const profileToUser = (profile: any, fallbackEmail = ''): User => ({
  email: profile?.email ?? fallbackEmail,
  role: roleFromValue(profile?.role),
  name: profile?.full_name ?? fallbackEmail.split('@')[0] ?? 'Usuario',
  empresa_id: profile?.company_id ?? undefined,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readableAuthError = (error: unknown): string => {
  const rawMessage = typeof (error as any)?.message === 'string' ? (error as any).message.trim() : '';
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('already') || normalized.includes('user_already_exists')) {
    return 'Ese correo ya tiene una cuenta creada. Tocá "Ya tengo cuenta" e ingresá con tu contraseña, o usá "Olvidé mi contraseña".';
  }
  if (normalized.includes('password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (!rawMessage || rawMessage === '{}' || normalized.includes('database error saving new user')) {
    return 'No pudimos crear la cuenta. Volvé a intentarlo; si el problema continúa, contactá al equipo de ReActiva.';
  }
  return rawMessage;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSupabaseUser = async (activateToken?: string) => {
    if (!supabase) return false;
    const { data: sessionData } = await supabase.auth.getSession();
    const authUser = sessionData.session?.user;
    if (!authUser) return false;

    const pendingToken = activateToken || '';
    if (pendingToken) {
      const { data: activatedProfile, error: activationError } = await supabase
        .rpc('activate_invitation', { invitation_token: pendingToken })
        .single();
      if (activationError) return false;
      if (activatedProfile) {
        setUser(profileToUser(activatedProfile, authUser.email ?? ''));
        localStorage.removeItem('reactiva_user');
        return true;
      }
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, role, company_id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUser(profileToUser(profile, authUser.email ?? ''));
        localStorage.removeItem('reactiva_user');
        return true;
      }

      await wait(250);
    }

    return false;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (isSupabaseConfigured) {
        const loaded = await loadSupabaseUser();
        if (loaded && mounted) {
          setIsLoading(false);
          return;
        }
      } else {
        const storedUser = localStorage.getItem('reactiva_user');
        if (storedUser && mounted) setUser(JSON.parse(storedUser));
      }
      if (mounted) setIsLoading(false);
    };

    init();

    const { data: listener } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      await loadSupabaseUser();
    }) ?? { data: null };

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const activateInvitation = async (invitationToken: string): Promise<boolean> => {
    if (!supabase || !invitationToken) return false;
    return loadSupabaseUser(invitationToken);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        const loaded = await loadSupabaseUser();
        if (loaded) return true;
      }
    }

    const fallbackUser = DEV_USERS.find(candidate => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password);
    if (fallbackUser) {
      const user = { email: fallbackUser.email, role: fallbackUser.role, name: fallbackUser.name };
      localStorage.setItem('reactiva_user', JSON.stringify(user));
      setUser(user);
      return true;
    }

    return false;
  };

  const createAccess = async ({ email, password, fullName, invitationToken }: { email: string; password: string; fullName: string; invitationToken?: string }): Promise<{ ok: boolean; message?: string }> => {
    if (!supabase) {
      return { ok: false, message: 'Supabase no está configurado.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          invitation_token: invitationToken,
        },
      },
    });

    if (error) {
      const normalizedError = error.message?.toLowerCase() ?? '';
      if (normalizedError.includes('already') || normalizedError.includes('user_already_exists')) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (!loginError && await loadSupabaseUser(invitationToken)) return { ok: true };
      }
      return { ok: false, message: readableAuthError(error) };
    }

    if (data.session) {
      const loaded = await loadSupabaseUser(invitationToken);
      if (loaded) return { ok: true };

      if (invitationToken) {
        return { ok: false, message: 'La cuenta se creó correctamente. Ingresá con el mismo correo y contraseña para completar el acceso.' };
      }

      setUser({
        email: data.user?.email ?? email,
        role: 'usuario',
        name: fullName,
      });
      return { ok: true };
    }

    return {
      ok: true,
      message: 'Cuenta creada. Revisá tu email para confirmar el acceso antes de iniciar sesión.',
    };
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/plataforma/login`,
    });
    return !error;
  };

  const logout = async () => {
    localStorage.removeItem('reactiva_user');
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, createAccess, activateInvitation, resetPassword, logout, isLoading }}>
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

import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getEmpresaByToken, getInvitacionUsuarioByToken } from '../mock/data';
import { supabase } from '../lib/supabase';

const homeForRole = (role: string) => {
  if (role === 'admin') return '/plataforma/admin';
  if (role === 'rrhh') return '/plataforma/rrhh';
  return '/plataforma/usuario';
};

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'create'>('login');
  const [invitationContext, setInvitationContext] = useState<{ email?: string; company_name?: string; type?: string; is_valid?: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearingSession, setClearingSession] = useState(false);
  const [allowInvitationSession, setAllowInvitationSession] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const { user, login, createAccess, activateInvitation, resetPassword, logout } = useAuth();
  const showDemoAccounts = false;
  const invitationToken = searchParams.get('token') ?? '';
  const invitationType = searchParams.get('tipo') ?? '';
  const invitationEmail = searchParams.get('email') ?? '';

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (hashParams.get('type') === 'recovery') {
      setIsRecoveryMode(true);
      setAuthMode('login');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, []);

  useEffect(() => {
    const loadInvitationContext = async () => {
      if (!invitationToken || !supabase) return;
      const { data } = await supabase
        .rpc('get_invitation_context', { invitation_token: invitationToken })
        .maybeSingle();
      if (data) {
        setInvitationContext(data);
        if ((data as any).email) setEmail((data as any).email);
        setAuthMode('create');
      }
    };

    void loadInvitationContext();

    if (invitationEmail) {
      setEmail(invitationEmail);
      setAuthMode('create');
      return;
    }
    if (invitationType === 'empresa' && invitationToken) {
      const empresa = getEmpresaByToken(invitationToken);
      if (empresa?.rrhhEmail) {
        setEmail(empresa.rrhhEmail);
        setInvitationContext({ email: empresa.rrhhEmail, company_name: empresa.nombre, type: 'company_onboarding', is_valid: true });
        setAuthMode('create');
      }
    }
    if (invitationType === 'usuario' && invitationToken) {
      const invitacion = getInvitacionUsuarioByToken(invitationToken);
      if (invitacion?.emailEnviado) {
        setEmail(invitacion.emailEnviado);
        setInvitationContext({ email: invitacion.emailEnviado, type: 'user_activation', is_valid: true });
        setAuthMode('create');
      }
    }
  }, [invitationEmail, invitationToken, invitationType]);

  useEffect(() => {
    if (!user || !invitationToken || clearingSession || allowInvitationSession) return;
    setClearingSession(true);
    void logout().finally(() => setClearingSession(false));
  }, [allowInvitationSession, clearingSession, invitationToken, logout, user]);

  if (user && invitationToken && !allowInvitationSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 700 }}>Preparando el acceso de la persona invitada...</p>
        </div>
      </div>
    );
  }

  if (user && !isRecoveryMode) {
    return <Navigate to={homeForRole(user.role)} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let ok = false;
    let nextError = '';

    if (isRecoveryMode) {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      if (!supabase) {
        setError('Supabase no está configurado.');
        setLoading(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'No pudimos actualizar la contraseña.');
        setLoading(false);
        return;
      }
      window.history.replaceState(null, '', '/plataforma/login');
      setIsRecoveryMode(false);
      setError('Contraseña actualizada. Ya podés ingresar con tu nueva contraseña.');
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
      return;
    }

    if (authMode === 'create') {
      if (!fullName.trim()) {
        setError('Ingresá tu nombre y apellido para crear el acceso.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }
      setAllowInvitationSession(true);
      const result = await createAccess({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        invitationToken,
      });
      ok = result.ok;
      if (result.message) nextError = result.message;
    } else {
      setAllowInvitationSession(true);
      ok = await login(email.trim(), password);
      if (ok && invitationToken) {
        const activated = await activateInvitation(invitationToken);
        if (!activated) {
          nextError = 'No pudimos activar la invitación. Verificá que estés usando el correo correcto.';
          ok = false;
        }
      }
    }

    if (!ok && nextError) {
      setAllowInvitationSession(false);
      setError(nextError);
      setLoading(false);
      return;
    }

    if (!ok) {
      setAllowInvitationSession(false);
      setError('Email o contraseña incorrectos. Verificá tus datos.');
    }
    setLoading(false);
  };

  const loginDemo = (role: 'admin' | 'usuario' | 'rrhh') => {
    const demoEmail = role === 'admin' ? 'admin@reactiva.com' : role === 'rrhh' ? 'rrhh@alpha.com' : 'usuario@reactiva.com';
    setEmail(demoEmail);
    setPassword('Reactiva2025');
    setError('');
    void login(demoEmail, 'Reactiva2025');
  };

  const handlePasswordReset = async () => {
    setError('');
    if (!email.trim()) {
      setError('Ingresá tu correo para enviarte la recuperación de contraseña.');
      return;
    }
    const ok = await resetPassword(email.trim());
    setError(ok
      ? 'Te enviamos un email para recuperar tu contraseña.'
      : 'No pudimos enviar la recuperación. Revisá el correo o la configuración de Supabase.'
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-color)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/logo-reactiva-dark.png" 
            alt="Re-Activa" 
            style={{ height: '56px', objectFit: 'contain', margin: '0 auto 1.5rem', display: 'block' }} 
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 0.5rem' }}>
            Ingresá a ReActiva
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
            {authMode === 'create'
              ? 'Creá tu acceso con el correo asociado a tu invitación.'
              : 'Accedé con el correo asociado a tu empresa.'}
          </p>
          {(invitationToken || invitationEmail) && (
            <p style={{ color: '#0f766e', fontSize: '0.84rem', lineHeight: 1.45, margin: '0.75rem 0 0', fontWeight: 600 }}>
              Usá el correo asociado a tu invitación para acceder a ReActiva.
            </p>
          )}
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ height: 1, backgroundColor: 'var(--border-color)', flex: 1 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
            {isRecoveryMode ? 'Creá tu nueva contraseña' : authMode === 'create' ? 'Creá tu acceso con correo' : 'Ingresá con tu correo'}
            </span>
            <div style={{ height: 1, backgroundColor: 'var(--border-color)', flex: 1 }} />
          </div>

          {invitationContext?.company_name && (
            <div style={{
              margin: '0 0 1rem',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ecfdf5',
              border: '1px solid #bbf7d0',
              color: '#047857',
              fontSize: '0.82rem',
              lineHeight: 1.45,
              fontWeight: 700,
              textAlign: 'center',
            }}>
              Invitación activa para {invitationContext.company_name}
            </div>
          )}

          {invitationToken && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('create'); setError(''); }}
                style={{
                  border: 'none',
                  borderRadius: 'calc(var(--radius-sm) - 2px)',
                  padding: '0.6rem',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  color: authMode === 'create' ? 'white' : 'var(--text-muted)',
                  backgroundColor: authMode === 'create' ? 'var(--primary-color)' : 'transparent',
                }}
              >
                Crear acceso
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                style={{
                  border: 'none',
                  borderRadius: 'calc(var(--radius-sm) - 2px)',
                  padding: '0.6rem',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  color: authMode === 'login' ? 'white' : 'var(--text-muted)',
                  backgroundColor: authMode === 'login' ? 'var(--primary-color)' : 'transparent',
                }}
              >
                Ya tengo cuenta
              </button>
            </div>
          )}

          {(invitationToken || authMode === 'create') && (
            <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.45, textAlign: 'center' }}>
              Usá el correo asociado a tu invitación para acceder a ReActiva.
            </p>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {authMode === 'create' && !isRecoveryMode && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-color)' }}>
                  Nombre y apellido
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Tu nombre"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            {!isRecoveryMode && <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-color)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                autoComplete="email"
              />
            </div>}

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-color)' }}>
                {isRecoveryMode ? 'Nueva contraseña' : 'Contraseña'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  autoComplete={authMode === 'create' || isRecoveryMode ? 'new-password' : 'current-password'}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {(authMode === 'create' || isRecoveryMode) && (
                <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.74rem', lineHeight: 1.35 }}>
                  Mínimo 6 caracteres.
                </p>
              )}
            </div>

            {(authMode === 'create' || isRecoveryMode) && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-color)' }}>
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
                backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: '0.85rem',
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%', padding: '0.8rem',
                fontSize: '0.9rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (authMode === 'create' ? 'Creando acceso...' : 'Ingresando...') : (
                <>
                  <LogIn size={18} />
                  {isRecoveryMode ? 'Guardar contraseña' : authMode === 'create' ? 'Crear acceso' : 'Ingresar'}
                </>
              )}
            </button>
          </form>

          {!isRecoveryMode && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handlePasswordReset}
              style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Olvidé mi contraseña
            </button>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.45 }}>
              ¿No tenés cuenta? Contactá a tu empresa o al equipo de ReActiva.
            </p>
          </div>}
        </div>

        {/* Cuentas demo */}
        {showDemoAccounts && (
        <div style={{
          marginTop: '1.25rem', padding: '1.25rem',
          backgroundColor: 'white', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Accesos demo para presentación
          </p>
          <p style={{ margin: '0 0 0.9rem', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
            Entrá rápido con un perfil de prueba. Luego el sistema redirige según el rol.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => loginDemo('admin')}
              style={{
                flex: 1, padding: '0.6rem', fontSize: '0.8rem', fontWeight: 500,
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-color)', cursor: 'pointer',
                color: 'var(--text-color)', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >Admin</button>
            <button
              type="button"
              onClick={() => loginDemo('usuario')}
              style={{
                flex: 1, padding: '0.6rem', fontSize: '0.8rem', fontWeight: 500,
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-color)', cursor: 'pointer',
                color: 'var(--text-color)', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >Usuario</button>
            <button
              type="button"
              onClick={() => loginDemo('rrhh')}
              style={{
                flex: 1, padding: '0.6rem', fontSize: '0.8rem', fontWeight: 500,
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-color)', cursor: 'pointer',
                color: 'var(--text-color)', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              RRHH
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

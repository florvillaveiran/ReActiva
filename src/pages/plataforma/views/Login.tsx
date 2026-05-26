import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/plataforma/admin' : '/plataforma/usuario'} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400)); // pequeño delay para UX

    const ok = login(email.trim(), password);
    if (!ok) {
      setError('Email o contraseña incorrectos. Verificá tus datos.');
    }
    setLoading(false);
  };

  const fillDemo = (role: 'admin' | 'usuario') => {
    setEmail(role === 'admin' ? 'admin@reactiva.com' : 'usuario@reactiva.com');
    setPassword('Reactiva2025');
    setError('');
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ingresá a tu cuenta para continuar
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
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
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-color)' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="current-password"
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
            </div>

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
              {loading ? 'Ingresando...' : (
                <>
                  <LogIn size={18} />
                  Ingresar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Cuentas demo */}
        <div style={{
          marginTop: '1.25rem', padding: '1.25rem',
          backgroundColor: 'white', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Cuentas de prueba
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              style={{
                flex: 1, padding: '0.6rem', fontSize: '0.8rem', fontWeight: 500,
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-color)', cursor: 'pointer',
                color: 'var(--text-color)', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              👤 Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('usuario')}
              style={{
                flex: 1, padding: '0.6rem', fontSize: '0.8rem', fontWeight: 500,
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-color)', cursor: 'pointer',
                color: 'var(--text-color)', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              🙋 Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

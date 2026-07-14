import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvitacionUsuarioByToken, getDB, addUsuario, Usuario } from '../mock/data';
import { User, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle, Zap, Activity, Heart, Target, BatteryCharging, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

const radioOption = (label: string, icon: React.ReactNode, selected: boolean, onChange: () => void) => (
  <label
    key={label}
    className="onboarding-option"
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
      border: `2px solid ${selected ? '#10b981' : '#e2e8f0'}`,
      borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
      backgroundColor: selected ? '#f0fdf4' : 'white',
    }}
  >
    <input type="radio" checked={selected} onChange={onChange} style={{ width: '20px', height: '20px', accentColor: '#10b981' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {icon && <span style={{ color: selected ? '#10b981' : '#64748b' }}>{icon}</span>}
      <span style={{ fontWeight: 600, color: '#1e293b' }}>{label}</span>
    </div>
  </label>
);

const checkOption = (label: string, selected: boolean, onChange: () => void) => (
  <label
    key={label}
    className="onboarding-option"
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
      border: `2px solid ${selected ? '#10b981' : '#e2e8f0'}`,
      borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
      backgroundColor: selected ? '#f0fdf4' : 'white',
    }}
  >
    <input type="checkbox" checked={selected} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{label}</span>
  </label>
);

export const UsuarioOnboarding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitacion, setInvitacion] = useState<any>(null);
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [respuestas, setRespuestas] = useState({
    nombre: '',
    email: '',
    actividadFisica: '', // Baja | Media | Alta
    energia: '', // Baja | Media | Alta
    dolores: [] as string[],
    fatiga: '', // Baja | Media | Alta
    bienestar: '', // Bajo | Medio | Alto
    objetivos: [] as string[],
  });

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('El enlace de invitación es inválido o ha caducado.');
        setLoading(false);
        return;
      }

      const inv = getInvitacionUsuarioByToken(token);
      if (inv) {
        setInvitacion(inv);
        const emp = getDB().empresas.find(e => e.id === inv.empresa_id);
        if (emp) setEmpresaNombre(emp.nombre);
        setLoading(false);
        return;
      }

      if (supabase) {
        const { data } = await supabase
          .rpc('get_invitation_context', { invitation_token: token })
          .maybeSingle();

        const context = data as any;
        if (context?.is_valid) {
          const db = getDB();
          let empresa = db.empresas.find(e => e.nombre.toLowerCase() === String(context.company_name ?? '').toLowerCase());
          if (!empresa) empresa = db.empresas[0];

          setInvitacion({
            token,
            empresa_id: empresa?.id ?? 1,
            emailEnviado: context.email ?? '',
            fechaCreacion: new Date().toISOString(),
            supabaseCompanyId: context.company_id,
          });
          setEmpresaNombre(context.company_name ?? empresa?.nombre ?? 'tu empresa');
          if (context.email) setRespuestas(prev => ({ ...prev, email: context.email }));
          setLoading(false);
          return;
        }
      }

      setError('El enlace de invitación es inválido o ha caducado.');
      setLoading(false);
    };

    void loadInvitation();
  }, [token]);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '60px', height: '60px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <AlertTriangle size={30} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Aviso</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>{error}</p>
        {invitacion && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setError('')}
            style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem 1rem' }}
          >
            Volver al formulario
          </button>
        )}
      </div>
    </div>
  );

  if (!invitacion) return null;

  const TOTAL_STEPS = 7;
  const progress = (step / TOTAL_STEPS) * 100;

  const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const toggleArr = (key: 'dolores' | 'objetivos', val: string) => {
    setRespuestas(prev => {
      let arr = prev[key];
      if (val === 'Ninguno' || val === 'No tengo dolores') {
        arr = arr.includes(val) ? [] : [val];
      } else {
        arr = arr.filter(x => x !== 'Ninguno' && x !== 'No tengo dolores');
        arr = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
      }
      return { ...prev, [key]: arr };
    });
  };

  const canNext = () => {
    if (step === 1) return !!respuestas.nombre && !!respuestas.email;
    if (step === 2) return !!respuestas.actividadFisica;
    if (step === 3) return !!respuestas.energia;
    if (step === 4) return respuestas.dolores.length > 0;
    if (step === 5) return !!respuestas.fatiga;
    if (step === 6) return !!respuestas.bienestar;
    if (step === 7) return respuestas.objetivos.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');

    if (supabase && token) {
      const { data: invitationData, error: invitationError } = await supabase
        .rpc('get_invitation_context', { invitation_token: token })
        .maybeSingle();
      const invitationContext = invitationData as any;

      if (invitationError || !invitationContext?.is_valid) {
        console.error('La invitacion dejo de ser valida antes de completar el onboarding', invitationError, invitationContext);
        setLoading(false);
        setError('La invitación ya no está vigente o ya fue utilizada. Generá un nuevo enlace desde el panel de Usuarios.');
        return;
      }

      const invitedEmail = String(invitationContext.email ?? '').trim().toLowerCase();
      const submittedEmail = respuestas.email.trim().toLowerCase();
      if (invitedEmail && invitedEmail !== submittedEmail) {
        setLoading(false);
        setError(`El enlace fue creado para ${invitedEmail}. Volvé al formulario y utilizá ese mismo correo.`);
        return;
      }

      const { error: onboardingError } = await supabase.rpc('complete_user_onboarding', {
        invitation_token: token,
        user_email: submittedEmail,
        user_full_name: respuestas.nombre.trim(),
        onboarding_data: respuestas,
      });

      if (onboardingError) {
        console.error('No se pudo completar el onboarding de usuario', onboardingError);
        setLoading(false);
        const detail = onboardingError.message?.trim();
        setError(detail
          ? `No pudimos guardar el onboarding. Supabase indicó: ${detail}`
          : 'No pudimos guardar el onboarding. Revisá el enlace y volvé a intentarlo.');
        return;
      }
    }

    const pwd = Math.random().toString(36).substring(2, 8);
    const dolor = respuestas.dolores.length > 0 && !respuestas.dolores.includes('No tengo dolores');

    const newUser: Usuario = {
      id: Date.now(),
      nombre: respuestas.nombre,
      email: respuestas.email,
      empresa_id: invitacion.empresa_id,
      participacion: 0,
      dolor: dolor,
      ultima_interaccion: new Date().toISOString(),
      estado: 'Activo',
      fechaIngreso: new Date().toISOString(),
      passwordTemporal: pwd,
      requiereCambioPassword: true,
      onboardingData: respuestas,
    };

    addUsuario(newUser);
    setLoading(false);
    setStep(8);
  };

  // ── Success screen ──────────────────────────────────────────────
  if (step === 8) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ width: '70px', height: '70px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Activá tu cuenta en ReActiva</h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Tu perfil inicial ya quedó configurado. Usá este correo para crear tu acceso con contraseña.
        </p>
        <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2rem' }}>
          {respuestas.email}
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>
          En esta demo, si necesitás ingresar con contraseña, usá la contraseña temporal enviada por el equipo de ReActiva.
        </p>
        <button onClick={() => navigate(`/plataforma/login?token=${token ?? ''}&tipo=usuario&email=${encodeURIComponent(respuestas.email)}`)} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
          Continuar a ReActiva
        </button>
      </div>
    </div>
  );

  return (
    <div className="onboarding-page user-onboarding-page" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      {/* Header */}
      <div className="onboarding-progress" style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="white" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Onboarding Personal</h1>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: '#10b981', width: `${progress}%`, transition: 'width 0.4s ease-in-out', borderRadius: '999px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Paso {step} de {TOTAL_STEPS}</span>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Card */}
      <div className="onboarding-card" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>¡Hola! Empecemos.</h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              <strong>{empresaNombre}</strong> te invita a sumarte a ReActiva.<br/>
              Completá estos datos para crear tu perfil y personalizar tus pausas activas.
            </p>
            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <label className="form-label">Nombre y apellido</label>
              <input type="text" className="input-field" placeholder="Ej: Juan Pérez" value={respuestas.nombre} onChange={e => setRespuestas(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="input-field" placeholder="tu@email.com" value={respuestas.email} onChange={e => setRespuestas(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Diagnóstico Físico</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>🏃‍♀️ ¿Cuál es tu nivel de actividad física actual?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Considerá ejercicio, deporte o caminatas largas.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {radioOption('Baja (casi nada)', <Activity size={20} />, respuestas.actividadFisica === 'Baja', () => setRespuestas(p => ({ ...p, actividadFisica: 'Baja' })))}
              {radioOption('Media (1-3 veces por semana)', <Activity size={20} />, respuestas.actividadFisica === 'Media', () => setRespuestas(p => ({ ...p, actividadFisica: 'Media' })))}
              {radioOption('Alta (más de 3 veces)', <Activity size={20} />, respuestas.actividadFisica === 'Alta', () => setRespuestas(p => ({ ...p, actividadFisica: 'Alta' })))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Energía</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>🔋 ¿Cómo percibís tu nivel de energía durante la jornada de trabajo?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Promedio de una semana normal.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {radioOption('Baja (me cuesta concentrarme, tengo sueño)', <Zap size={20} />, respuestas.energia === 'Baja', () => setRespuestas(p => ({ ...p, energia: 'Baja' })))}
              {radioOption('Media (tengo altibajos)', <Zap size={20} />, respuestas.energia === 'Media', () => setRespuestas(p => ({ ...p, energia: 'Media' })))}
              {radioOption('Alta (me mantengo activo/a todo el día)', <Zap size={20} />, respuestas.energia === 'Alta', () => setRespuestas(p => ({ ...p, energia: 'Alta' })))}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Dolores y Molestias</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>⚠️ ¿Sentís dolores musculares o articulares por tu trabajo?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Podés seleccionar varias opciones.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['Cuello / Cervicales', 'Hombros', 'Espalda Alta', 'Lumbar', 'Muñecas / Manos', 'Piernas / Rodillas'].map(opt =>
                checkOption(opt, respuestas.dolores.includes(opt), () => toggleArr('dolores', opt))
              )}
            </div>
            <div style={{ marginTop: '1rem' }}>
              {checkOption('No tengo dolores', respuestas.dolores.includes('No tengo dolores'), () => toggleArr('dolores', 'No tengo dolores'))}
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Fatiga</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>🥱 Al finalizar tu jornada laboral, ¿cómo es tu nivel de fatiga?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Tanto física como mental.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {radioOption('Baja (termino bien, con energía para otras cosas)', <BatteryCharging size={20} />, respuestas.fatiga === 'Baja', () => setRespuestas(p => ({ ...p, fatiga: 'Baja' })))}
              {radioOption('Media (termino cansado/a pero normal)', <BatteryCharging size={20} />, respuestas.fatiga === 'Media', () => setRespuestas(p => ({ ...p, fatiga: 'Media' })))}
              {radioOption('Alta (termino agotado/a, sin ganas de nada)', <BatteryCharging size={20} />, respuestas.fatiga === 'Alta', () => setRespuestas(p => ({ ...p, fatiga: 'Alta' })))}
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Bienestar</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>🤍 ¿Cómo calificarías tu nivel de bienestar general?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Tomando en cuenta estrés, ánimo y salud física.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {radioOption('Bajo', <Heart size={20} />, respuestas.bienestar === 'Bajo', () => setRespuestas(p => ({ ...p, bienestar: 'Bajo' })))}
              {radioOption('Medio', <Heart size={20} />, respuestas.bienestar === 'Medio', () => setRespuestas(p => ({ ...p, bienestar: 'Medio' })))}
              {radioOption('Alto', <Heart size={20} />, respuestas.bienestar === 'Alto', () => setRespuestas(p => ({ ...p, bienestar: 'Alto' })))}
            </div>
          </div>
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Tus metas</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>🎯 ¿Qué te gustaría lograr usando ReActiva?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Seleccioná todas las que apliquen.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Reducir molestias y dolores musculares', 'Aumentar mi energía y foco', 'Incorporar un hábito saludable', 'Reducir el estrés y relajarme'].map(opt =>
                checkOption(opt, respuestas.objetivos.includes(opt), () => toggleArr('objetivos', opt))
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding-navigation" style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          {step > 1 && (
            <button onClick={handlePrev} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronLeft size={18} /> Atrás
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: canNext() ? 1 : 0.5 }}
              disabled={!canNext()}
            >
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#059669', opacity: canNext() ? 1 : 0.5 }}
              disabled={!canNext() || loading}
            >
              {loading ? 'Guardando...' : 'Terminar Onboarding'} <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

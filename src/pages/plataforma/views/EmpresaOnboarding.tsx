import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmpresaByToken, updateEmpresa, Empresa } from '../mock/data';
import { Building, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const radioOption = (label: string, selected: boolean, onChange: () => void) => (
  <label
    key={label}
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
      border: `2px solid ${selected ? '#10b981' : '#e2e8f0'}`,
      borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
      backgroundColor: selected ? '#f0fdf4' : 'white',
    }}
  >
    <input type="radio" checked={selected} onChange={onChange} style={{ width: '20px', height: '20px', accentColor: '#10b981' }} />
    <span style={{ fontWeight: 600, color: '#1e293b' }}>{label}</span>
  </label>
);

const checkOption = (label: string, selected: boolean, onChange: () => void) => (
  <label
    key={label}
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
      border: `2px solid ${selected ? '#10b981' : '#e2e8f0'}`,
      borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
      backgroundColor: selected ? '#f0fdf4' : 'white',
    }}
  >
    <input type="checkbox" checked={selected} onChange={onChange} style={{ width: '20px', height: '20px', accentColor: '#10b981' }} />
    <span style={{ fontWeight: 600, color: '#1e293b' }}>{label}</span>
  </label>
);

export const EmpresaOnboarding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [respuestas, setRespuestas] = useState({
    modalidad: '',
    horasSentado: '',
    tareas: '',
    desafios: [] as string[],
    objetivos: [] as string[],
    estilo: '',
  });

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (supabase) {
        const { data } = await supabase
          .rpc('get_invitation_context', { invitation_token: token })
          .maybeSingle();

        const context = data as any;
        if (context?.type === 'company_onboarding') {
          if (!context.is_valid) {
            setError('El enlace de onboarding es inválido o ha caducado.');
          } else {
            setEmpresa({
              id: Date.now(),
              supabaseId: context.company_id,
              nombre: context.company_name ?? 'Empresa',
              ubicacion: '',
              empleados: [],
              estado: context.status === 'completed' ? 'Activa' : 'Pendiente onboarding',
              rrhhEmail: context.email ?? '',
              token,
            });
          }
          setLoading(false);
          return;
        }
      }

      const found = getEmpresaByToken(token);
      if (found) {
        if (found.estado === 'Activa') {
          setError('El onboarding de esta empresa ya ha sido completado.');
        } else {
          setEmpresa(found);
        }
      } else {
        setError('El enlace de onboarding es inválido o ha caducado.');
      }
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
      </div>
    </div>
  );

  if (!empresa) return null;

  const TOTAL_STEPS = 7;
  const progress = (step / TOTAL_STEPS) * 100;

  const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const toggleArr = (key: 'desafios' | 'objetivos', val: string) => {
    setRespuestas(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };

  const canNext = () => {
    if (step === 2) return !!respuestas.modalidad;
    if (step === 3) return !!respuestas.horasSentado;
    if (step === 4) return !!respuestas.tareas;
    if (step === 5) return respuestas.desafios.length > 0;
    if (step === 6) return respuestas.objetivos.length > 0;
    if (step === 7) return !!respuestas.estilo;
    return true;
  };

  const handleFinish = async () => {
    if (supabase && token) {
      const { error } = await supabase.rpc('complete_company_onboarding', {
        invitation_token: token,
        onboarding_data: respuestas,
      });

      if (error) {
        setError(error.message);
        return;
      }
    }

    updateEmpresa({
      ...empresa,
      estado: 'Activa',
      fechaOnboarding: new Date().toISOString(),
      onboardingData: respuestas,
    });
    setStep(8);
  };

  // Success screen
  if (step === 8) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ width: '70px', height: '70px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>¡Onboarding completado!</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Gracias por completar la configuración inicial de tu empresa. Ahora podés crear tu acceso o iniciar sesión en ReActiva.
        </p>
        <button onClick={() => navigate(`/plataforma/login?token=${token ?? ''}&tipo=empresa`)} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
          Continuar a ReActiva
        </button>
      </div>
    </div>
  );

  // Wizard layout
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={18} color="white" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>ReActiva Onboarding</h1>
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
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>

        {/* STEP 1 - Bienvenida */}
        {step === 1 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Hola</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Bienvenidos a ReActiva</h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Queremos adaptar los microentrenamientos y el contenido de bienestar a la dinámica real del equipo de <strong>{empresa.nombre}</strong>.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
              Este formulario nos ayudará a personalizar la experiencia.<br />⏱️ Duración aproximada: 2 minutos.
            </p>
            <button onClick={handleNext} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }}>
              Comenzar →</button>
          </div>
        )}

        {/* STEP 2 - Modalidad */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Modalidad de trabajo</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>¿Cuál es la modalidad predominante?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Seleccioná la que mejor describe la dinámica actual del equipo.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {['Presencial', 'Remoto', 'Híbrido'].map(opt =>
                radioOption(opt, respuestas.modalidad === opt, () => setRespuestas(p => ({ ...p, modalidad: opt })))
              )}
            </div>
          </div>
        )}

        {/* STEP 3 - Horas sentado */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Sedentarismo</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>⏰ ¿Cuántas horas promedio pasa el equipo sentado por día?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Esta información nos ayuda a medir el nivel de riesgo sedentario.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {['Menos de 4 horas', 'Entre 4 y 6 horas', 'Más de 6 horas'].map(opt =>
                radioOption(opt, respuestas.horasSentado === opt, () => setRespuestas(p => ({ ...p, horasSentado: opt })))
              )}
            </div>
          </div>
        )}

        {/* STEP 4 - Tipo de tareas */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Tipo de trabajo</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>¿Qué tipo de tareas predominan?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Esto define el tipo de pausas y contenido más adecuado para el equipo.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {['Operativas / Manuales', 'Administrativas / De oficina', 'Mixtas'].map(opt =>
                radioOption(opt, respuestas.tareas === opt, () => setRespuestas(p => ({ ...p, tareas: opt })))
              )}
            </div>
          </div>
        )}

        {/* STEP 5 - Desafíos */}
        {step === 5 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Diagnóstico</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>¿Cuáles son los principales desafíos del equipo?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Podés seleccionar varios. Esto construirá el diagnóstico inicial.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {['Estrés', 'Dolores posturales', 'Fatiga / Baja energía', 'Falta de pausas activas', 'Sedentarismo'].map(opt =>
                checkOption(opt, respuestas.desafios.includes(opt), () => toggleArr('desafios', opt))
              )}
            </div>
          </div>
        )}

        {/* STEP 6 - Objetivos */}
        {step === 6 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Objetivos</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>¿Qué quieren lograr con ReActiva?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Seleccioná los objetivos que más resuenen con la empresa.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {['Reducir dolor y molestias físicas', 'Aumentar la energía diaria', 'Mejorar el foco y la concentración', 'Mejorar el clima laboral', 'Reducir ausentismo'].map(opt =>
                checkOption(opt, respuestas.objetivos.includes(opt), () => toggleArr('objetivos', opt))
              )}
            </div>
          </div>
        )}

        {/* STEP 7 - Estilo */}
        {step === 7 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Preferencias</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>¿Qué estilo prefieren para los micro entrenamientos?</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Con esto configuramos el tipo de contenido que recibirá el equipo.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {['Dinámicos y activos', 'Relajantes y pausas suaves', 'Un mix de ambos'].map(opt =>
                radioOption(opt, respuestas.estilo === opt, () => setRespuestas(p => ({ ...p, estilo: opt })))
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        {step > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
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
              disabled={!canNext()}
            >
              Finalizar Onboarding <CheckCircle2 size={18} />
            </button>
          )}
        </div>}
      </div>
    </div>
  );
};

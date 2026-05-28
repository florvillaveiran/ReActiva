import React, { useState, useEffect } from 'react';
import { CheckCircle2, Lock, Play, Send, Flame, Clock, TrendingUp, X } from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface PauseRecord { 
  dia: string; 
  bloque: 'morning' | 'afternoon'; 
  // Opcionales para que sirva tanto para sin-form, miniform y weeklyform
  energia?: number; 
  dolor?: boolean; 
  zona?: string; 
  feeling?: string;
  estres?: number;
  ayuda?: string;
  mejora?: string;
  tipo?: string;
}

const DAYS = ['Lunes', 'Miércoles', 'Viernes'];

const PAUSAS = {
  morning: { label: 'Pausa Mañana', hora: '08:00 AM', horaNum: 8, duracion: '9 min', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', titulo: 'Respiración consciente' },
  afternoon: { label: 'Pausa Tarde', hora: '03:00 PM', horaNum: 15, duracion: '8 min', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800', titulo: 'Relaja tu mente' },
};

// ─── Mini Formulario (Lunes y Miércoles Tarde) ────────────────────────────────
const MiniForm: React.FC<{ bloque: 'morning' | 'afternoon'; onClose: () => void; onSubmit: (r: Omit<PauseRecord, 'dia'>) => void; }> = ({ bloque, onClose, onSubmit }) => {
  const [energia, setEnergia] = useState(0);
  const [dolor, setDolor] = useState<boolean | null>(null);
  const [zona, setZona] = useState('');
  const [feeling, setFeeling] = useState('');
  const [done, setDone] = useState(false);
  const canSubmit = energia > 0 && dolor !== null && feeling !== '';
  const submit = () => { setDone(true); setTimeout(() => onSubmit({ bloque, energia, dolor: dolor!, zona, feeling, tipo: 'diario' }), 1200); };
  const emojis = [{ val: 'Mal', icon: '😟' }, { val: 'Regular', icon: '😐' }, { val: 'Bien', icon: '🙂' }, { val: 'Muy bien', icon: '😊' }, { val: 'Genial', icon: '🤩' }];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={52} color="var(--primary-color)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>¡Pausa registrada!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Guardando tu progreso...</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>¿Cómo te sentiste?</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={20} /></button>
            </div>
            {/* P1: Feeling */}
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>¿Cómo terminaste?</p>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {emojis.map(e => (
                <button key={e.val} onClick={() => setFeeling(e.val)} style={{ flex: 1, padding: '0.5rem 0.1rem', borderRadius: '10px', fontSize: '1.4rem', border: `2px solid ${feeling === e.val ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: feeling === e.val ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {e.icon}
                  <span style={{ fontSize: '0.55rem', fontWeight: 600, color: feeling === e.val ? 'var(--primary-color)' : 'var(--text-muted)' }}>{e.val}</span>
                </button>
              ))}
            </div>
            {/* P2: Energia */}
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Nivel de energía (1–5)</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setEnergia(n)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700, border: `2px solid ${energia === n ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: energia === n ? 'var(--primary-color)' : 'transparent', color: energia === n ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{n}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              <span>Muy baja</span>
              <span>Muy alta</span>
            </div>
            {/* P3: Dolor */}
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>¿Sentiste algún dolor?</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: dolor ? '0.75rem' : '1.5rem' }}>
              {[{ v: true, label: 'Sí, tuve dolor' }, { v: false, label: 'No, todo bien' }].map(opt => (
                <button key={String(opt.v)} onClick={() => setDolor(opt.v)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 600, border: `2px solid ${dolor === opt.v ? (opt.v ? '#f43f5e' : 'var(--primary-color)') : 'var(--border-color)'}`, backgroundColor: dolor === opt.v ? (opt.v ? '#fff1f2' : 'var(--primary-light)') : 'transparent', color: dolor === opt.v ? (opt.v ? '#e11d48' : 'var(--primary-color)') : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>{opt.label}</button>
              ))}
            </div>
            {dolor && (
              <div style={{ marginBottom: '1.25rem', animation: 'fadeIn 0.2s' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>¿En qué zona del cuerpo?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  {['Cuello', 'Hombros', 'Espalda alta', 'Espalda baja', 'Muñecas', 'Caderas', 'Rodillas', 'Otro'].map(z => (
                    <button key={z} type="button" onClick={() => setZona(z)} style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, border: `1.5px solid ${zona === z ? '#f43f5e' : 'var(--border-color)'}`, backgroundColor: zona === z ? '#fff1f2' : 'transparent', color: zona === z ? '#e11d48' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{z}</button>
                  ))}
                </div>
                {zona === 'Otro' && <input type="text" placeholder="Describí dónde..." className="input-field" onChange={e => setZona('Otro: ' + e.target.value)} style={{ fontSize: '0.82rem' }} />}
              </div>
            )}
            <button onClick={submit} disabled={!canSubmit} className="btn-primary" style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: canSubmit ? 1 : 0.4 }}>
              <Send size={15} /> Enviar y registrar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Formulario Semanal (Viernes Tarde) ────────────────────────────────────────
const WeeklyForm: React.FC<{ bloque: 'morning' | 'afternoon'; onClose: () => void; onSubmit: (r: any) => void; }> = ({ bloque, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Page 1
  const [feeling, setFeeling] = useState('');
  const [energia, setEnergia] = useState(0);
  const [dolor, setDolor] = useState<boolean | null>(null);
  const [zona, setZona] = useState('');

  // Page 2
  const [tension, setTension] = useState('');
  const [trabajando, setTrabajando] = useState('');
  const [ayudaron, setAyudaron] = useState('');
  const [comentario, setComentario] = useState('');

  const canNext = energia > 0 && dolor !== null && feeling !== '';
  const canNext2 = tension !== '' && trabajando !== '';
  const canSubmit = ayudaron !== '';

  const submit = () => { 
    setDone(true); 
    setTimeout(() => onSubmit({ bloque, respuestas: { feeling, energia, dolor, zona, tension, trabajando, ayudaron, comentario }, tipo: 'semanal-compacto' }), 1200); 
  };

  const emojisFeeling = [{ val: 'Mal', icon: '😟' }, { val: 'Regular', icon: '😐' }, { val: 'Bien', icon: '🙂' }, { val: 'Muy bien', icon: '😊' }, { val: 'Genial', icon: '🤩' }];
  const opcionesTension = ['A la mañana', 'Al mediodía', 'A la tarde', 'Al final de la jornada', 'No sentí tensión'];
  const opcionesTrabajando = [{ label: 'Disperso', icon: '😵💫' }, { label: 'Normal', icon: '😐' }, { label: 'Enfocado', icon: '💪' }];
  const opcionesAyudaron = ['Sí, mucho', 'Sí, un poco', 'No'];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={52} color="var(--primary-color)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>¡Excelente semana!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tus respuestas nos ayudan a mejorar el programa.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Resumen Semanal</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ height: '4px', flex: 1, backgroundColor: step >= s ? 'var(--primary-color)' : '#e2e8f0', borderRadius: '2px', transition: 'all 0.3s' }} />
              ))}
            </div>

            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <p className="form-label">¿Cómo terminaste?</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {emojisFeeling.map(e => (
                    <button key={e.val} onClick={() => setFeeling(e.val)} style={{ flex: 1, padding: '0.5rem 0.1rem', borderRadius: '10px', fontSize: '1.4rem', border: `2px solid ${feeling === e.val ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: feeling === e.val ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      {e.icon}
                      <span style={{ fontSize: '0.55rem', fontWeight: 600, color: feeling === e.val ? 'var(--primary-color)' : 'var(--text-muted)' }}>{e.val}</span>
                    </button>
                  ))}
                </div>

                <p className="form-label">Nivel de energía (1–5)</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setEnergia(n)} className={`number-btn ${energia === n ? 'active' : ''}`}>{n}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <span>Muy baja</span><span>Muy alta</span>
                </div>

                <p className="form-label">¿Sentiste algún dolor?</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: dolor ? '0.75rem' : '1.5rem' }}>
                  {[{ v: true, label: 'Sí, tuve dolor' }, { v: false, label: 'No, todo bien' }].map(opt => (
                    <button key={String(opt.v)} onClick={() => setDolor(opt.v)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 600, border: `2px solid ${dolor === opt.v ? (opt.v ? '#f43f5e' : 'var(--primary-color)') : 'var(--border-color)'}`, backgroundColor: dolor === opt.v ? (opt.v ? '#fff1f2' : 'var(--primary-light)') : 'transparent', color: dolor === opt.v ? (opt.v ? '#e11d48' : 'var(--primary-color)') : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>{opt.label}</button>
                  ))}
                </div>

                {dolor && (
                  <div style={{ marginBottom: '1.25rem', animation: 'fadeIn 0.2s' }}>
                    <p className="form-label">¿En qué zona del cuerpo?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      {['Cuello', 'Hombros', 'Espalda alta', 'Espalda baja', 'Muñecas', 'Caderas', 'Rodillas', 'Otro'].map(z => (
                        <button key={z} type="button" onClick={() => setZona(z)} style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, border: `1.5px solid ${zona === z ? '#f43f5e' : 'var(--border-color)'}`, backgroundColor: zona === z ? '#fff1f2' : 'transparent', color: zona === z ? '#e11d48' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{z}</button>
                      ))}
                    </div>
                    {zona === 'Otro' && <input type="text" placeholder="Describí dónde..." className="input-field" onChange={e => setZona('Otro: ' + e.target.value)} style={{ fontSize: '0.82rem' }} />}
                  </div>
                )}
                
                <button onClick={() => setStep(2)} disabled={!canNext} className="btn-primary" style={{ width: '100%', padding: '0.8rem', opacity: canNext ? 1 : 0.4 }}>Siguiente</button>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.8rem' }}>¿En qué momento sentiste más tensión?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {opcionesTension.map(opt => (
                    <button key={opt} onClick={() => setTension(opt)} style={{ padding: '0.5rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 500, border: `1.5px solid ${tension === opt ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: tension === opt ? 'var(--primary-light)' : 'transparent', color: tension === opt ? 'var(--primary-color)' : 'var(--text-color)', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}>
                      {opt}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.8rem' }}>¿Cómo te sentiste trabajando esta semana?</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {opcionesTrabajando.map(opt => (
                    <button key={opt.label} onClick={() => setTrabajando(opt.label)} style={{ flex: 1, padding: '0.8rem 0.4rem', borderRadius: '14px', fontSize: '1.4rem', border: `1.5px solid ${trabajando === opt.label ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: trabajando === opt.label ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s', boxShadow: trabajando === opt.label ? '0 4px 12px rgba(0,194,168,0.1)' : 'none', outline: 'none' }}>
                      {opt.icon}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: trabajando === opt.label ? 'var(--primary-color)' : 'var(--text-color)' }}>{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: '0.8rem' }}>Atrás</button>
                  <button onClick={() => setStep(3)} disabled={!canNext2} className="btn-primary" style={{ flex: 2, padding: '0.8rem', opacity: canNext2 ? 1 : 0.4 }}>Siguiente</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.8rem' }}>¿Las pausas activas te ayudaron esta semana?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {opcionesAyudaron.map(opt => (
                    <button key={opt} onClick={() => setAyudaron(opt)} style={{ padding: '0.5rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 500, border: `1.5px solid ${ayudaron === opt ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: ayudaron === opt ? 'var(--primary-light)' : 'transparent', color: ayudaron === opt ? 'var(--primary-color)' : 'var(--text-color)', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}>
                      {opt}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.8rem' }}>Comentario libre <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Opcional)</span></p>
                <textarea 
                  rows={3} 
                  placeholder="Si quieres, cuéntanos un poco más..." 
                  value={comentario} 
                  onChange={e => setComentario(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: '#f8fafc', color: 'var(--text-color)', marginBottom: '1.5rem', resize: 'none', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, padding: '0.8rem' }}>Atrás</button>
                  <button onClick={submit} disabled={!canSubmit} className="btn-primary" style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: canSubmit ? 1 : 0.4 }}>
                    <Send size={15} /> Enviar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .form-label { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem; }
        .pill-btn { padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 500; border: 1.5px solid var(--border-color); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .pill-btn.active { border-color: var(--primary-color); background: var(--primary-light); color: var(--primary-color); }
        .pill-btn.active-danger { border-color: #f43f5e; background: #fff1f2; color: #e11d48; }
        .number-btn { flex: 1; padding: 0.6rem; border-radius: 10px; font-weight: 700; border: 2px solid var(--border-color); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .number-btn.active { border-color: var(--primary-color); background: var(--primary-color); color: white; }
        .btn-secondary { padding: 0.8rem; border-radius: var(--radius-md); font-weight: 600; border: 1px solid var(--border-color); background: white; color: var(--text-color); cursor: pointer; transition: background 0.15s; }
        .btn-secondary:hover { background: #f8fafc; }
      `}</style>
    </div>
  );
};


// ─── Tarjeta de Pausa Compacta ───────────────────────────────────────────────
const PauseCard: React.FC<{ bloque: 'morning' | 'afternoon'; status: 'done' | 'available' | 'locked'; isToday: boolean; onAction: () => void; lockReason?: string; }> = ({ bloque, status, isToday, onAction }) => {
  const info = PAUSAS[bloque];
  const isAvailable = status === 'available';
  const isDone = status === 'done';
  const isLocked = status === 'locked';

  return (
    <div 
      className={`mini-pause-card ${isAvailable ? 'available' : ''}`}
      onClick={isAvailable ? onAction : undefined}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0.75rem', 
        gap: '0.75rem',
        backgroundColor: isDone ? 'var(--primary-light)' : 'var(--card-bg)',
        border: isAvailable ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        opacity: (isLocked && !isToday) ? 0.6 : 1,
        transition: 'all 0.2s ease',
        cursor: isAvailable ? 'pointer' : 'default',
        boxShadow: isAvailable ? '0 4px 12px rgba(0, 194, 168, 0.15)' : 'var(--shadow-sm)',
        position: 'relative'
      }}
    >
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: isDone ? 'var(--primary-color)' : isLocked ? '#f1f5f9' : '#e6fcf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isDone && <CheckCircle2 size={18} color="white" />}
        {isLocked && <Lock size={16} color="var(--text-muted)" />}
        {isAvailable && <Play size={16} color="var(--primary-color)" fill="var(--primary-color)" />}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: isDone ? 'var(--primary-color)' : 'var(--text-color)', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.titulo}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{info.hora} · {info.duracion}</p>
      </div>

      {isAvailable && <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-color)', backgroundColor: 'white', border: '1px solid var(--primary-color)', padding: '2px 6px', borderRadius: '10px' }}>AHORA</div>}
    </div>
  );
};


// ─── Dashboard Principal ──────────────────────────────────────────────────────
export const UsuarioDashboard: React.FC = () => {
  const [completed, setCompleted] = useState<PauseRecord[]>([]);
  const [openForm, setOpenForm] = useState<'morning' | 'afternoon' | null>(null);
  const [nowHour, setNowHour] = useState(() => new Date().getHours() + new Date().getMinutes() / 60);
  const [today, setToday] = useState('Lunes');

  useEffect(() => {
    const t = setInterval(() => setNowHour(new Date().getHours() + new Date().getMinutes() / 60), 60000);
    return () => clearInterval(t);
  }, []);

  const isDone = (dia: string, bloque: 'morning' | 'afternoon') => completed.some(r => r.dia === dia && r.bloque === bloque);

  useEffect(() => {
    if (isDone('Lunes', 'afternoon') && !isDone('Miércoles', 'morning')) {
      setToday('Miércoles');
    } else if (isDone('Miércoles', 'afternoon') && !isDone('Viernes', 'morning')) {
      setToday('Viernes');
    }
  }, [completed]);

  const handleFormSubmit = (record: Omit<PauseRecord, 'dia'>) => {
    const full = { ...record, dia: today };
    setCompleted(prev => [...prev, full as PauseRecord]);
    setOpenForm(null);
    const all = JSON.parse(localStorage.getItem('reactiva_pausas') || '[]');
    localStorage.setItem('reactiva_pausas', JSON.stringify([...all, { ...full, fecha: new Date().toISOString() }]));
  };

  const getStatus = (dia: string, bloque: 'morning' | 'afternoon'): { status: 'done' | 'available' | 'locked'; reason?: string } => {
    if (isDone(dia, bloque)) return { status: 'done' };
    if (dia !== today) return { status: 'locked', reason: 'Próximamente' };
    if (bloque === 'morning') {
      if (nowHour < 8) return { status: 'locked', reason: 'Disponible a las 08:00 AM' };
      return { status: 'available' };
    }
    if (!isDone(today, 'morning')) return { status: 'locked', reason: 'Completá la mañana primero' };
    if (nowHour < 15) return { status: 'locked', reason: 'Disponible a las 03:00 PM' };
    return { status: 'available' };
  };

  const totalPausas = completed.length;
  const diasCompletos = DAYS.filter(d => isDone(d, 'morning') && isDone(d, 'afternoon')).length;
  const pct = Math.round((totalPausas / (DAYS.length * 2)) * 100) || 0;

  // Determinar la pausa actual (protagonista)
  const currentMorning = getStatus(today, 'morning');
  const currentAfternoon = getStatus(today, 'afternoon');
  let activePause: { bloque: 'morning' | 'afternoon'; info: typeof PAUSAS['morning'] } | null = null;
  
  if (currentMorning.status === 'available') {
    activePause = { bloque: 'morning', info: PAUSAS['morning'] };
  } else if (currentAfternoon.status === 'available') {
    activePause = { bloque: 'afternoon', info: PAUSAS['afternoon'] };
  }

  const handleActivePauseAction = () => {
    if (!activePause) return;
    if (activePause.bloque === 'morning') {
      handleFormSubmit({ bloque: 'morning', tipo: 'sin-form' });
    } else {
      setOpenForm('afternoon');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', display: 'flex', gap: '1.5rem', height: 'calc(100vh - 5rem)', overflow: 'hidden' }}>
      
      {/* ── Columna Izquierda: Protagonista (~65%) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
        
        {/* Banner Superior Compacto */}
        <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #f0fdf9 0%, #ffffff 100%)', border: '1px solid #d1fae5', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>👋</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-color)', marginBottom: '2px' }}>¡Hola, Francisco!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Demo activa en: <strong style={{ color: 'var(--primary-color)' }}>{today}</strong></p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progreso</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)' }}>{pct}%</p>
            </div>
            <div style={{ width: 1, height: 30, backgroundColor: '#d1fae5' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setToday(d)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: today === d ? 'var(--primary-color)' : (isDone(d, 'morning') && isDone(d, 'afternoon') ? '#10b981' : '#e2e8f0'), color: 'white', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }}>
                  {d.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Protagonista */}
        <div className="card" style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 30px rgba(0, 194, 168, 0.08)', border: '1px solid var(--border-color)' }}>
          {activePause ? (
            <>
              {/* Imagen/Video Área */}
              <div style={{ flex: 1, position: 'relative', backgroundImage: `url(${activePause.info.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }} />
                
                {/* Botón de Play Central */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} className="play-btn">
                  <Play size={28} color="white" fill="white" style={{ marginLeft: '4px' }} />
                </div>
                
                {/* Textos sobre la imagen */}
                <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
                  <div style={{ display: 'inline-block', backgroundColor: 'var(--primary-color)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    RECOMENDADO AHORA
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{activePause.info.titulo}</h2>
                  <p style={{ fontSize: '0.9rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> {activePause.info.duracion} de bienestar para tu cuerpo
                  </p>
                </div>
              </div>
              {/* Área de Acción */}
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>¿Ya realizaste esta pausa?</p>
                <button onClick={handleActivePauseAction} className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '100px', boxShadow: '0 4px 12px rgba(0, 194, 168, 0.25)' }}>
                  Completar pausa
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={40} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.5rem' }}>¡Día completado!</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>Has realizado todas tus pausas de hoy. Descansa y nos vemos pronto.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Columna Derecha: Cronograma (~35%) ── */}
      <div className="card" style={{ width: '340px', flexShrink: 0, borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'white' }}>
        <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '2px' }}>Tu semana</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{diasCompletos} de {DAYS.length} días completados</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {DAYS.map(dia => {
            const isToday = dia === today;
            return (
              <div key={dia} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: isToday ? 700 : 600, fontSize: '0.85rem', color: isToday ? 'var(--primary-color)' : 'var(--text-color)' }}>{dia}</span>
                  {isToday && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} />}
                </div>
                {/* Pausa Mañana */}
                <PauseCard 
                  bloque="morning" 
                  status={getStatus(dia, 'morning').status} 
                  isToday={isToday} 
                  onAction={() => handleFormSubmit({ bloque: 'morning', tipo: 'sin-form' })} 
                />
                {/* Pausa Tarde */}
                <PauseCard 
                  bloque="afternoon" 
                  status={getStatus(dia, 'afternoon').status} 
                  isToday={isToday} 
                  onAction={() => setOpenForm('afternoon')} 
                />
              </div>
            );
          })}
        </div>

        {/* Footer Motivacional */}
        <div style={{ padding: '1rem', backgroundColor: '#f0fdf9', borderTop: '1px solid #d1fae5', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 500 }}>
            <span style={{ fontSize: '1rem', marginRight: '4px' }}>🌿</span>
            Pequeñas pausas, grandes resultados
          </p>
        </div>
      </div>

      {/* ── Modal ── */}
      {openForm === 'afternoon' && today !== 'Viernes' && <MiniForm bloque={openForm} onClose={() => setOpenForm(null)} onSubmit={handleFormSubmit} />}
      {openForm === 'afternoon' && today === 'Viernes' && <WeeklyForm bloque={openForm} onClose={() => setOpenForm(null)} onSubmit={handleFormSubmit} />}
      
      <style>{`
        .play-btn:hover { transform: translate(-50%, -50%) scale(1.1) !important; }
      `}</style>
    </div>
  );
};

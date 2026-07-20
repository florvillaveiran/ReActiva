import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Lock, Play, Send, Clock, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { getCurrentProgramDay, UNLOCK_LEAD_MINUTES } from '../../lib/videoUnlockSchedule';
import { fetchScheduledVideosForUser, getScheduledDateForProgramDay, getScheduledVideoFor, getVideoThumbnail, getYouTubeIdFromUrl, ScheduledVideo, SCHEDULED_VIDEOS_EVENT, toLocalDateKey } from '../../lib/scheduledVideos';
import { supabase } from '../../lib/supabase';

// ─── Configuración ──────────────────────────────────────────────────────────
const fireConfetti = () => {
  const colors = ['#00c2a8', '#10b981', '#34d399', '#a7f3d0', '#fbbf24'];
  confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors, scalar: 0.9 });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors }), 150);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors }), 250);
};

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface PauseRecord {
  dia: string;
  bloque: 'morning' | 'afternoon';
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
const DAY_INITIAL: Record<string, string> = { Lunes: 'L', Miércoles: 'M', Viernes: 'V' };
const DEMO_SEQUENCE = DAYS.flatMap(dia => ([
  { dia, bloque: 'morning' as const },
  { dia, bloque: 'afternoon' as const },
]));

const PAUSAS = {
  morning: {
    label: 'Pausa Mañana',
    hora: '08:00 AM',
    horaNum: 8,
    duracion: '9 min',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1400',
    titulo: 'Respiración consciente',
    subtitulo: '9 min de bienestar para tu cuerpo',
  },
  afternoon: {
    label: 'Pausa Tarde',
    hora: '03:00 PM',
    horaNum: 15,
    duracion: '8 min',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1400',
    titulo: 'Relaja tu mente',
    subtitulo: '8 min de relajación para tu mente',
  },
};

// ─── Mini Formulario (Lunes y Miércoles Tarde) ────────────────────────────────
const MiniForm: React.FC<{ bloque: 'morning' | 'afternoon'; onClose: () => void; onSubmit: (r: Omit<PauseRecord, 'dia'>) => void; }> = ({ bloque, onClose, onSubmit }) => {
  const [energia, setEnergia] = useState(0);
  const [dolor, setDolor] = useState<boolean | null>(null);
  const [zona, setZona] = useState('');
  const [zonaDetalle, setZonaDetalle] = useState('');
  const [feeling, setFeeling] = useState('');
  const [done, setDone] = useState(false);
  const canSubmit = energia > 0 && dolor !== null && feeling !== '' && (!dolor || (zona !== '' && (zona !== 'Otro' || zonaDetalle.trim() !== '')));
  const submit = () => {
    const zonaFinal = zona === 'Otro' ? `Otro: ${zonaDetalle.trim()}` : zona;
    setDone(true);
    setTimeout(() => onSubmit({ bloque, energia, dolor: dolor!, zona: zonaFinal, feeling, tipo: 'diario' }), 1200);
  };
  const emojis = [{ val: 'Mal', icon: '😟' }, { val: 'Regular', icon: '😐' }, { val: 'Bien', icon: '🙂' }, { val: 'Muy bien', icon: '😊' }, { val: 'Genial', icon: '🤩' }];

  return (
    <div className="pause-form-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s' }}>
      <div className="pause-form-modal pause-form-daily" style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
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
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>¿Cómo terminaste?</p>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {emojis.map(e => (
                <button key={e.val} onClick={() => setFeeling(e.val)} style={{ flex: 1, padding: '0.5rem 0.1rem', borderRadius: '10px', fontSize: '1.4rem', border: `2px solid ${feeling === e.val ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: feeling === e.val ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {e.icon}
                  <span style={{ fontSize: '0.55rem', fontWeight: 600, color: feeling === e.val ? 'var(--primary-color)' : 'var(--text-muted)' }}>{e.val}</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Nivel de energía (1–5)</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setEnergia(n)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700, border: `2px solid ${energia === n ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: energia === n ? 'var(--primary-color)' : 'transparent', color: energia === n ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{n}</button>
              ))}
            </div>
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
                {zona === 'Otro' && <input type="text" placeholder="Describí dónde..." className="input-field" value={zonaDetalle} onChange={e => setZonaDetalle(e.target.value)} style={{ fontSize: '0.82rem' }} />}
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

  // Parte 1: igual al formulario diario
  const [feeling, setFeeling] = useState('');
  const [energia, setEnergia] = useState(0);
  const [dolor, setDolor] = useState<boolean | null>(null);
  const [zona, setZona] = useState('');
  const [zonaDetalle, setZonaDetalle] = useState('');

  // Parte 2: preguntas semanales
  const [tension, setTension] = useState('');
  const [trabajo, setTrabajo] = useState('');
  const [ayuda, setAyuda] = useState('');
  const [comentario, setComentario] = useState('');

  const canNext1 = feeling !== '' && energia > 0 && dolor !== null && (!dolor || (zona !== '' && (zona !== 'Otro' || zonaDetalle.trim() !== '')));
  const canNext2 = tension !== '' && trabajo !== '';
  const canSubmit = canNext1 && canNext2 && ayuda !== '';

  const submit = () => {
    setDone(true);
    setTimeout(() => onSubmit({
      bloque,
      respuestas: { feeling, energia, dolor, zona: zona === 'Otro' ? `Otro: ${zonaDetalle.trim()}` : zona, tension, trabajo, ayuda, comentario },
      tipo: 'semanal-completo',
    }), 1200);
  };

  const emojis = [
    { val: 'Mal', icon: '😟' },
    { val: 'Regular', icon: '😐' },
    { val: 'Bien', icon: '🙂' },
    { val: 'Muy bien', icon: '😊' },
    { val: 'Genial', icon: '🤩' }
  ];

  return (
    <div className="pause-form-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s' }}>
      <div className="pause-form-modal pause-form-weekly" style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={52} color="var(--primary-color)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>¡Excelente semana!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tus respuestas nos ayudan a mejorar el programa.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Resumen Semanal</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1.75rem' }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ height: '4px', flex: 1, backgroundColor: step >= s ? 'var(--primary-color)' : '#e2e8f0', borderRadius: '2px', transition: 'all 0.3s' }} />
              ))}
            </div>

            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                {/* P1: ¿Cómo terminaste? */}
                <p className="form-label">¿Cómo terminaste?</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {emojis.map(e => (
                    <button key={e.val} onClick={() => setFeeling(e.val)} style={{ flex: 1, padding: '0.5rem 0.1rem', borderRadius: '10px', fontSize: '1.4rem', border: `2px solid ${feeling === e.val ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: feeling === e.val ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      {e.icon}
                      <span style={{ fontSize: '0.55rem', fontWeight: 600, color: feeling === e.val ? 'var(--primary-color)' : 'var(--text-muted)' }}>{e.val}</span>
                    </button>
                  ))}
                </div>

                {/* P2: Nivel de energía */}
                <p className="form-label">Nivel de energía (1–5)</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setEnergia(n)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700, border: `2px solid ${energia === n ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: energia === n ? 'var(--primary-color)' : 'transparent', color: energia === n ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{n}</button>
                  ))}
                </div>

                {/* P3: ¿Sentiste algún dolor? */}
                <p className="form-label">¿Sentiste algún dolor?</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: dolor ? '0.75rem' : '1.5rem' }}>
                  {[{ v: true, label: 'Sí, tuve dolor' }, { v: false, label: 'No, todo bien' }].map(opt => (
                    <button key={String(opt.v)} onClick={() => setDolor(opt.v)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 600, border: `2px solid ${dolor === opt.v ? (opt.v ? '#f43f5e' : 'var(--primary-color)') : 'var(--border-color)'}`, backgroundColor: dolor === opt.v ? (opt.v ? '#fff1f2' : 'var(--primary-light)') : 'transparent', color: dolor === opt.v ? (opt.v ? '#e11d48' : 'var(--primary-color)') : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>{opt.label}</button>
                  ))}
                </div>
                {dolor && (
                  <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.2s' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>¿En qué zona del cuerpo?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      {['Cuello', 'Hombros', 'Espalda alta', 'Espalda baja', 'Muñecas', 'Caderas', 'Rodillas', 'Otro'].map(z => (
                        <button key={z} type="button" onClick={() => setZona(z)} style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, border: `1.5px solid ${zona === z ? '#f43f5e' : 'var(--border-color)'}`, backgroundColor: zona === z ? '#fff1f2' : 'transparent', color: zona === z ? '#e11d48' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{z}</button>
                      ))}
                    </div>
                    {zona === 'Otro' && <input type="text" placeholder="Describí dónde..." className="input-field" value={zonaDetalle} onChange={e => setZonaDetalle(e.target.value)} style={{ fontSize: '0.82rem' }} />}
                  </div>
                )}

                <button onClick={() => setStep(2)} disabled={!canNext1} className="btn-primary" style={{ width: '100%', padding: '0.8rem', opacity: canNext1 ? 1 : 0.4 }}>Siguiente</button>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                {/* P4: ¿En qué momento sentiste más tensión? */}
                <p className="form-label">¿En qué momento sentiste más tensión?</p>
                <div className="weekly-option-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', marginBottom: '2rem' }}>
                  {['A la mañana', 'Al mediodía', 'A la tarde', 'Al final de la jornada', 'No sentí tensión'].map(opt => (
                    <button key={opt} onClick={() => setTension(opt)} className={`option-btn ${tension === opt ? 'active' : ''}`}>{opt}</button>
                  ))}
                </div>

                {/* P5: ¿Cómo te sentiste trabajando esta semana? */}
                <p className="form-label">¿Cómo te sentiste trabajando esta semana?</p>
                <div className="weekly-option-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.75rem' }}>
                  {['Disperso', 'Normal', 'Enfocado'].map(opt => (
                    <button key={opt} onClick={() => setTrabajo(opt)} className={`option-btn ${trabajo === opt ? 'active' : ''}`}>{opt}</button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>Atrás</button>
                  <button onClick={() => setStep(3)} disabled={!canNext2} className="btn-primary" style={{ flex: 2, padding: '0.8rem', opacity: canNext2 ? 1 : 0.4 }}>Siguiente</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                {/* P6: ¿Las pausas activas te ayudaron esta semana? */}
                <p className="form-label">¿Las pausas activas te ayudaron esta semana?</p>
                <div className="weekly-option-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '2rem' }}>
                  {['Sí, mucho', 'Sí, un poco', 'No'].map(opt => (
                    <button key={opt} onClick={() => setAyuda(opt)} className={`option-btn ${ayuda === opt ? 'active' : ''}`}>{opt}</button>
                  ))}
                </div>

                {/* P7: Comentario libre (opcional) */}
                <p className="form-label">Comentario libre (Opcional)</p>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="¿Querés contarnos algo más?"
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  style={{ marginBottom: '1.75rem', resize: 'none' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>Atrás</button>
                  <button onClick={submit} disabled={!canSubmit} className="btn-primary" style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: canSubmit ? 1 : 0.4 }}>
                    <Send size={15} /> Enviar y registrar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .form-label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.85rem; }
        .pill-btn { padding: 0.6rem 1.1rem; border-radius: 22px; font-size: 0.88rem; font-weight: 500; border: 1.5px solid var(--border-color); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .pill-btn.active { border-color: var(--primary-color); background: var(--primary-light); color: var(--primary-color); }
        .pill-btn.active-danger { border-color: #f43f5e; background: #fff1f2; color: #e11d48; }
        .option-btn { padding: 1.4rem 0.85rem; border-radius: 12px; font-size: 0.95rem; font-weight: 600; border: 2px solid var(--border-color); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; text-align: center; line-height: 1.25; min-height: 64px; }
        .option-btn:hover { border-color: #cbd5e1; }
        .option-btn.active { border-color: var(--primary-color); background: var(--primary-light); color: var(--primary-color); }
        .number-btn { flex: 1; padding: 0.6rem; border-radius: 10px; font-weight: 700; border: 2px solid var(--border-color); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .number-btn.active { border-color: var(--primary-color); background: var(--primary-color); color: white; }
        .btn-secondary { padding: 0.8rem; border-radius: var(--radius-md); font-weight: 600; border: 1px solid var(--border-color); background: white; color: var(--text-color); cursor: pointer; transition: background 0.15s; }
        .btn-secondary:hover { background: #f8fafc; }
      `}</style>
    </div>
  );
};

// ─── Modal de Video (YouTube embed) ──────────────────────────────────────────
const VideoModal: React.FC<{ videoUrl: string; titulo: string; onClose: () => void; onWatched?: () => void }> = ({ videoUrl, titulo, onClose, onWatched }) => {
  const youtubeId = getYouTubeIdFromUrl(videoUrl);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="video-viewer-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', animation: 'fadeIn 0.2s',
      }}
    >
      <div
        className="video-viewer-modal"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '960px',
          backgroundColor: 'black', borderRadius: '16px',
          overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', backgroundColor: '#0f172a',
        }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{titulo}</p>
          <button
            onClick={onClose}
            title="Cerrar (Esc)"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              border: 'none', backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white', cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Video 16:9 */}
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%', border: 'none',
              }}
            />
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              onEnded={onWatched}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%', border: 'none',
                backgroundColor: 'black',
              }}
            />
          )}
        </div>
        {youtubeId && (
          <div style={{ padding: '1rem 1.25rem', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onWatched}
              style={{
                border: 'none',
                borderRadius: 999,
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 800,
                padding: '0.75rem 1.1rem',
              }}
            >
              Ya vi el video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Card de pausa en panel "Tu semana" ──────────────────────────────────────
const WeekPauseRow: React.FC<{
  bloque: 'morning' | 'afternoon';
  status: 'done' | 'available' | 'locked';
  isActive: boolean;
  time?: string;
  title?: string;
}> = ({ bloque, status, isActive, time, title }) => {
  const info = { ...PAUSAS[bloque], hora: time ? `${time} hs` : PAUSAS[bloque].hora };
  const showActive = isActive && status === 'available';
  return (
    <div className="user-week-pause-row" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 0.9rem',
      borderRadius: '14px',
      border: `1.5px solid ${showActive ? 'var(--primary-color)' : '#eef0f3'}`,
      backgroundColor: 'white',
      marginBottom: '0.6rem',
      opacity: status === 'locked' ? 0.85 : 1,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: '10px',
        backgroundColor: status === 'done' ? 'var(--primary-color)' : status === 'available' ? 'var(--primary-light)' : '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {status === 'done' && <CheckCircle2 size={18} color="white" />}
        {status === 'available' && <Play size={16} color="var(--primary-color)" fill="var(--primary-color)" />}
        {status === 'locked' && <Lock size={16} color="#94a3b8" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.88rem', color: status === 'locked' ? 'var(--text-muted)' : 'var(--text-color)', marginBottom: '2px' }}>{title || info.titulo}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{info.hora}</p>
      </div>
      {showActive && (
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-color)',
          padding: '3px 10px', borderRadius: '20px',
          border: '1.5px solid var(--primary-color)', letterSpacing: '0.05em',
        }}>AHORA</span>
      )}
      {status === 'done' && (
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-color)',
          padding: '3px 10px', borderRadius: '20px',
          backgroundColor: 'var(--primary-light)', letterSpacing: '0.05em',
        }}>HECHA</span>
      )}
    </div>
  );
};

// Lee pausas del localStorage, deduplicadas por (dia, bloque), última gana.
const userStorageKey = (base: string, email?: string) => `${base}:${(email || 'anon').trim().toLowerCase()}`;

const loadPausasFromStorage = (email?: string): PauseRecord[] => {
  try {
    const all: any[] = JSON.parse(localStorage.getItem(userStorageKey('reactiva_pausas', email)) || '[]');
    const map = new Map<string, PauseRecord>();
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    for (const p of all) {
      if (p?.fecha && new Date(p.fecha) < startOfWeek) continue;
      if (p?.dia && p?.bloque) map.set(`${p.dia}__${p.bloque}`, p as PauseRecord);
    }
    return Array.from(map.values());
  } catch {
    return [];
  }
};

// Set de claves "dia__bloque" de videos ya vistos.
const loadVideosVistos = (email?: string): Set<string> => {
  try {
    const arr: string[] = JSON.parse(localStorage.getItem(userStorageKey('reactiva_videos_vistos', email)) || '[]');
    return new Set(arr);
  } catch {
    return new Set();
  }
};

// ─── Dashboard Principal ──────────────────────────────────────────────────────
const savePauseSessionToSupabase = async (record: PauseRecord) => {
  if (!supabase) return;
  const answers = (record as any).respuestas ?? {};
  const energy = record.energia ?? answers.energia ?? null;
  const feeling = record.feeling ?? answers.feeling ?? null;
  const hasPain = record.dolor ?? answers.dolor ?? null;
  const painZone = record.zona ?? answers.zona ?? null;
  const comment = answers.comentario ?? record.mejora ?? null;

  const { error } = await supabase.rpc('record_pause_session', {
    day_label: record.dia,
    block: record.bloque,
    energy: energy,
    feeling: feeling,
    has_pain: hasPain,
    pain_zone: painZone,
    answers: {
      tipo: record.tipo ?? null,
      ...answers,
      estres: record.estres ?? answers.tension ?? null,
      ayuda: record.ayuda ?? answers.ayuda ?? null,
      mejora: record.mejora ?? comment,
      focus_state: feeling,
    },
  });

  if (error) {
    console.error('No se pudo guardar la pausa en Supabase', error);
  }

  if (record.tipo === 'semanal-completo') {
    const { error: weeklyError } = await supabase.rpc('record_weekly_form', {
      energy: energy,
      feeling: feeling,
      has_pain: hasPain,
      pain_zone: painZone,
      tension_moment: answers.tension ?? null,
      focus_state: answers.trabajo ?? null,
      helped: answers.ayuda ?? null,
      comment: comment,
      answers: answers,
    });

    if (weeklyError) {
      console.error('No se pudo guardar el formulario semanal en Supabase', weeklyError);
    }
  }
};

export const UsuarioDashboard: React.FC = () => {
  const { user } = useAuth();
  const isDemo = !!user?.isDemo;
  const [completed, setCompleted] = useState<PauseRecord[]>([]);
  const [openForm, setOpenForm] = useState<'morning' | 'afternoon' | null>(null);
  const [openVideo, setOpenVideo] = useState<{ dia: string; bloque: 'morning' | 'afternoon' } | null>(null);
  const [videosVistos, setVideosVistos] = useState<Set<string>>(new Set());
  const [today, setToday] = useState(() => user?.isDemo ? 'Lunes' : getCurrentProgramDay());
  const [scheduledVideos, setScheduledVideos] = useState<ScheduledVideo[]>([]);
  const displayName = user?.name?.trim()?.split(' ')[0] || 'Usuario';
  const companyId = isDemo ? undefined : user?.empresa_id?.toString();
  const programWeekReference = useMemo(() => {
    const reference = new Date();
    if (reference.getDay() === 0) {
      reference.setDate(reference.getDate() + 1);
    }
    return reference;
  }, []);
  const scheduledDateFor = (dia: string) => getScheduledDateForProgramDay(dia, programWeekReference);

  // When the week reference changes, reset demo progress (completed pauses and videos vistos)
  useEffect(() => {
    if (isDemo) {
      setCompleted([]);
      setVideosVistos(new Set());
    }
  }, [programWeekReference]);

  useEffect(() => {
    let mounted = true;
    const refreshProgress = async () => {
      if (!supabase || isDemo) {
        if (mounted) {
          // Load persisted data only for real users; demo data resets each week
          setCompleted(loadPausasFromStorage(user?.email));
          setVideosVistos(loadVideosVistos(user?.email));
        }
        return;
      }

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const [{ data: pauses, error: pausesError }, { data: views, error: viewsError }] = await Promise.all([
        supabase
          .from('pause_sessions')
          .select('day_label, block, energy, feeling, has_pain, pain_zone, answers, occurred_at')
          .gte('occurred_at', startOfWeek.toISOString())
          .order('occurred_at', { ascending: true }),
        supabase
          .from('user_content_progress')
          .select('content_key'),
      ]);

      if (!mounted) return;
      if (!pausesError && pauses) {
        const unique = new Map<string, PauseRecord>();
        pauses.forEach((row: any) => {
          const record: PauseRecord = {
            dia: row.day_label,
            bloque: row.block,
            energia: row.energy ?? row.answers?.energia,
            dolor: row.has_pain ?? row.answers?.dolor,
            zona: row.pain_zone ?? row.answers?.zona,
            feeling: row.feeling ?? row.answers?.feeling,
            estres: row.answers?.estres,
            ayuda: row.answers?.ayuda,
            mejora: row.answers?.mejora,
            tipo: row.answers?.tipo,
          };
          unique.set(`${record.dia}__${record.bloque}`, record);
        });
        setCompleted(Array.from(unique.values()));
      } else {
        setCompleted(loadPausasFromStorage(user?.email));
      }

      if (!viewsError && views) setVideosVistos(new Set(views.map(row => row.content_key)));
      else setVideosVistos(loadVideosVistos(user?.email));
    };

    void refreshProgress();
    const channel = supabase && !isDemo
      ? supabase
          .channel('user-dashboard-progress')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pause_sessions' }, refreshProgress)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'user_content_progress' }, refreshProgress)
          .subscribe()
      : null;
    return () => {
      mounted = false;
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [isDemo, user?.email]);

  // Marca un video como visto y persiste en localStorage
  const markVideoVisto = (dia: string, bloque: 'morning' | 'afternoon') => {
    const key = `${dia}__${bloque}`;
    setVideosVistos(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      localStorage.setItem(userStorageKey('reactiva_videos_vistos', user?.email), JSON.stringify(Array.from(next)));
      if (supabase && !isDemo) {
        void supabase.rpc('record_content_view', { content_key: key }).then(({ error }) => {
          if (error) console.error('No se pudo guardar el progreso del video en Supabase', error);
        });
      }
      return next;
    });
  };

  useEffect(() => {
    const syncVideos = async () => {
      const videos = await fetchScheduledVideosForUser(companyId, user?.workProfile, programWeekReference);
      // Keep only videos that belong to the current week (Monday‑Sunday)
      const weekStart = programWeekReference;
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const filtered = videos.filter(v => {
        const vDate = new Date(v.scheduledDate);
        return vDate >= weekStart && vDate <= weekEnd;
      });
      setScheduledVideos(filtered);
    };
    void syncVideos();
    window.addEventListener(SCHEDULED_VIDEOS_EVENT, syncVideos);
    window.addEventListener('storage', syncVideos);
    const channel = supabase && !isDemo
      ? supabase.channel('user-scheduled-videos').on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, syncVideos).subscribe()
      : null;
    return () => {
      window.removeEventListener(SCHEDULED_VIDEOS_EVENT, syncVideos);
      window.removeEventListener('storage', syncVideos);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [isDemo, companyId, user?.workProfile, programWeekReference]);
  const isDone = (dia: string, bloque: 'morning' | 'afternoon') => completed.some(r => r.dia === dia && r.bloque === bloque);

  // Auto-avanzar de día en la demo cuando se completa la tarde
  useEffect(() => {
    if (isDone('Lunes', 'afternoon') && !isDone('Miércoles', 'morning')) {
      setToday('Miércoles');
    } else if (isDone('Miércoles', 'afternoon') && !isDone('Viernes', 'morning')) {
      setToday('Viernes');
    }
  }, [completed]);

  const handleFormSubmit = (record: Omit<PauseRecord, 'dia'>) => {
    const full = { ...record, dia: today } as PauseRecord;
    // Dedup en el state: sobreescribir si ya existe ese (dia, bloque)
    setCompleted(prev => {
      const filtered = prev.filter(r => !(r.dia === full.dia && r.bloque === full.bloque));
      return [...filtered, full];
    });
    setOpenForm(null);
    // Dedup también en localStorage
    const pauseKey = userStorageKey('reactiva_pausas', user?.email);
    const all: any[] = JSON.parse(localStorage.getItem(pauseKey) || '[]');
    const filteredStorage = all.filter(p => !(p?.dia === full.dia && p?.bloque === full.bloque));
    filteredStorage.push({ ...full, fecha: new Date().toISOString() });
    localStorage.setItem(pauseKey, JSON.stringify(filteredStorage));
    window.dispatchEvent(new Event('reactiva-pausas-updated'));
    if (!isDemo) void savePauseSessionToSupabase(full);
    fireConfetti();
  };

  // Reiniciar la demo: limpia state y localStorage
  const handleResetDemo = () => {
    if (!window.confirm('¿Reiniciar la demo? Se borrarán todas las pausas registradas.')) return;
    setCompleted([]);
    setVideosVistos(new Set());
    setToday('Lunes');
    localStorage.removeItem(userStorageKey('reactiva_pausas', user?.email));
    localStorage.removeItem(userStorageKey('reactiva_videos_vistos', user?.email));
    window.dispatchEvent(new Event('reactiva-pausas-updated'));
  };

  const getStatus = (dia: string, bloque: 'morning' | 'afternoon'): { status: 'done' | 'available' | 'locked'; reason?: string } => {
    if (isDone(dia, bloque)) return { status: 'done' };
    if (isDemo) {
      if (bloque === 'morning') return { status: 'available' };
      return isDone(dia, 'morning')
        ? { status: 'available' }
        : { status: 'locked', reason: 'Terminá la pausa de la mañana de este día para continuar' };
    }
    const scheduledDate = scheduledDateFor(dia);
    const video = getScheduledVideoFor(scheduledVideos, dia, bloque, companyId, scheduledDate, user?.workProfile);
    if (!video) return { status: 'locked', reason: 'Contenido pendiente de programación por ReActiva' };
    if (scheduledDate !== toLocalDateKey(new Date()) || dia !== today) return { status: 'locked', reason: `Disponible el ${dia}` };
    const [hours = '0', minutes = '0'] = video.time.split(':');
    const unlockMinutes = Number(hours) * 60 + Number(minutes) - UNLOCK_LEAD_MINUTES;
    const now = new Date();
    if (now.getHours() * 60 + now.getMinutes() < unlockMinutes) {
      return { status: 'locked', reason: `Disponible desde ${video.time} hs` };
    }
    if (bloque === 'morning') {
      return { status: 'available' };
    }
    return { status: 'available' };
  };

  // Pausa activa del día (la que muestra el video grande)
  const activeBloque: 'morning' | 'afternoon' | null = useMemo(() => {
    const availableBlock = (['morning', 'afternoon'] as const).find((bloque) => getStatus(today, bloque).status === 'available');
    if (availableBlock) return availableBlock;
    if (!isDone(today, 'morning')) return 'morning';
    if (!isDone(today, 'afternoon')) return 'afternoon';
    return null;
  }, [completed, today, scheduledVideos, companyId, user?.workProfile]);

  const totalPausas = completed.length;
  const totalObjetivo = DAYS.length * 2;
  const pct = Math.round((totalPausas / totalObjetivo) * 100);

  const effectiveScheduledVideos = useMemo(() => {
    if (!isDemo) return scheduledVideos;
    const demoSources = [
      { url: '/demo-videos/01-lunes-manana.mp4', thumbnailUrl: '/demo-videos/01-lunes-manana.jpg', title: 'Activación y movilidad · Lunes mañana' },
      { url: '/demo-videos/02-lunes-tarde.mp4', thumbnailUrl: '/demo-videos/02-lunes-tarde.jpg', title: 'Pausa de recuperación · Lunes tarde' },
      { url: '/demo-videos/03-miercoles-manana.mp4', thumbnailUrl: '/demo-videos/03-miercoles-manana.jpg', title: 'Movilidad de miembros inferiores · Miércoles mañana' },
      { url: '/demo-videos/04-miercoles-tarde.mp4', thumbnailUrl: '/demo-videos/04-miercoles-tarde.jpg', title: 'Recuperación de miembros inferiores · Miércoles tarde' },
      { url: '/demo-videos/05-viernes-manana.mp4', thumbnailUrl: '/demo-videos/05-viernes-manana.jpg', title: 'Movilidad integral · Viernes mañana' },
      { url: '/demo-videos/06-viernes-tarde.mp4', thumbnailUrl: '/demo-videos/06-viernes-tarde.jpg', title: 'Movilidad de columna · Viernes tarde' },
    ];
    return DEMO_SEQUENCE.map((slot, index) => {
      const source = demoSources[index];
      return {
        id: `demo-${slot.dia}-${slot.bloque}`,
        day: slot.dia,
        block: slot.bloque,
        scheduledDate: scheduledDateFor(slot.dia),
        time: slot.bloque === 'morning' ? '08:00' : '15:00',
        title: source.title,
        url: source.url,
        thumbnailUrl: source.thumbnailUrl,
        companyName: 'Empresa Demo',
        createdAt: '2026-07-14T12:00:00.000Z',
      };
    });
  }, [isDemo, scheduledVideos]);

  const activeInfo = activeBloque ? PAUSAS[activeBloque] : null;
  const activeStatusObj = activeBloque ? getStatus(today, activeBloque) : null;
  const activeScheduledVideo = activeBloque ? getScheduledVideoFor(effectiveScheduledVideos, today, activeBloque, companyId, scheduledDateFor(today), user?.workProfile) : null;
  const openScheduledVideo = openVideo ? getScheduledVideoFor(effectiveScheduledVideos, openVideo.dia, openVideo.bloque, companyId, scheduledDateFor(openVideo.dia), user?.workProfile) : null;
  const contentLocked = activeStatusObj?.status === 'locked' || (activeStatusObj?.status === 'available' && !activeScheduledVideo);
  const allDoneToday = activeBloque === null;

  const handleActiveAction = () => {
    if (!activeBloque || activeStatusObj?.status !== 'available' || !activeScheduledVideo) return;
    const videoKey = `${today}__${activeBloque}`;
    if (!videosVistos.has(videoKey)) {
      setOpenVideo({ dia: today, bloque: activeBloque });
      return;
    }
    if (activeBloque === 'morning') {
      handleFormSubmit({ bloque: 'morning', tipo: 'sin-form' });
    } else {
      setOpenForm('afternoon');
    }
  };

  const handleVideoWatched = () => {
    if (!openVideo) return;
    markVideoVisto(openVideo.dia, openVideo.bloque);
    setOpenVideo(null);
  };

  return (
    <div className="user-dashboard-page" style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '1.5rem' }}>
      {isDemo && (
        <div style={{ marginBottom: '1rem', padding: '0.8rem 1rem', borderRadius: 12, background: '#ecfeff', border: '1px solid #a5f3fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p style={{ margin: 0, color: '#155e75', fontSize: '0.85rem', fontWeight: 600 }}>Modo demo: elegí lunes, miércoles o viernes. Cada día comienza libre y habilita su pausa de la tarde al terminar la mañana.</p>
          <button type="button" onClick={handleResetDemo} style={{ border: '1px solid #0891b2', background: 'white', color: '#0e7490', borderRadius: 8, padding: '0.45rem 0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Reiniciar demo</button>
        </div>
      )}
      <div className="user-program-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '1.25rem', alignItems: 'stretch' }}>

        {/* ── COLUMNA IZQUIERDA ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 0 }}>

          {/* Header banner */}
          <div className="user-program-header" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1.5rem', padding: '1.1rem 1.5rem',
            background: 'linear-gradient(135deg, #f0fdf9 0%, #ffffff 100%)',
            border: '1px solid #d1fae5', borderRadius: '18px',
          }}>
            {/* Saludo */}
            <div className="user-program-greeting" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', minWidth: 0 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                backgroundColor: '#ecfdf5', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: '1.4rem' }}>👋</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-color)' }}>¡Hola, {displayName}!</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Programa activo en: <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{today}</span>
                </p>
              </div>
            </div>

            {/* Progreso % */}
            <div className="user-program-progress" style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Progreso</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>{pct}%</p>
            </div>

            {/* Días L M V */}
            <div className="user-program-days" style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              {DAYS.map(d => {
                const isCurrent = d === today;
                const dayDone = isDone(d, 'morning') && isDone(d, 'afternoon');
                const filled = isCurrent || dayDone;
                return (
                  <button
                    key={d}
                    onClick={() => setToday(d)}
                    title={`Cambiar a ${d}`}
                    aria-label={`Cambiar a ${d}`}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      border: 'none', cursor: 'pointer',
                      backgroundColor: filled ? 'var(--primary-color)' : '#e2e8f0',
                      color: filled ? 'white' : '#94a3b8',
                      fontWeight: 700, fontSize: '0.95rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(0, 194, 168, 0.18)' : 'none',
                    }}
                  >
                    <span translate="no" lang="es" className="notranslate">{DAY_INITIAL[d]}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Tarjeta principal de pausa activa */}
          <div className="user-pause-card" style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: 'white', border: '1px solid #eef0f3', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Imagen con play */}
            <div className="user-pause-media" style={{
              position: 'relative',
              flex: 1,
              minHeight: 420,
              backgroundImage: !contentLocked && activeInfo
                ? `url(${getVideoThumbnail(activeScheduledVideo, activeInfo.img)})`
                : !contentLocked && activeInfo ? `url(${activeInfo.img})` : 'none',
              backgroundColor: contentLocked ? '#f8fafc' : '#1e293b',
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: contentLocked ? 'linear-gradient(135deg, #f8fafc 0%, #eefdf8 100%)' : 'linear-gradient(to bottom, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.45) 100%)' }} />
              {contentLocked && (
                <div className="user-pause-lock" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 86,
                  height: 86,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid #d1fae5',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                }}>
                  <Lock size={30} />
                </div>
              )}

              {/* Play central — abre el modal con el video de YouTube */}
              {activeBloque && activeScheduledVideo && activeStatusObj?.status === 'available' && (
                <button
                  onClick={() => setOpenVideo({ dia: today, bloque: activeBloque })}
                  title="Reproducir video de la pausa"
                  style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 80, height: 80, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.8)',
                    backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.08)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.28)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; }}
                >
                  <Play size={28} color="white" fill="white" style={{ marginLeft: 4 }} />
                </button>
              )}

              {/* Tag inferior izquierda */}
              <div className="user-pause-copy" style={{ position: 'absolute', left: '1.5rem', bottom: '1.5rem', right: '1.5rem' }}>
                {allDoneToday ? (
                  <>
                    <span style={{
                      display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
                      padding: '5px 12px', borderRadius: '20px',
                      backgroundColor: 'var(--primary-color)', color: 'white',
                      letterSpacing: '0.05em', marginBottom: '0.9rem',
                    }}>DÍA COMPLETO</span>
                    <h2 style={{ fontSize: '1.95rem', fontWeight: 800, color: 'white', marginBottom: '0.4rem' }}>¡Hiciste todas las pausas de hoy!</h2>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>Excelente trabajo. Seguí así durante la semana.</p>
                  </>
                ) : (
                  <>
                    {contentLocked ? (
                      <span style={{
                        display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
                        padding: '5px 12px', borderRadius: '20px',
                        backgroundColor: '#e0f2fe', color: '#0369a1',
                        letterSpacing: '0.05em', marginBottom: '0.9rem',
                      }}>PENDIENTE DE HABILITACIÓN</span>
                    ) : activeStatusObj?.status === 'available' && (
                      <span style={{
                        display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
                        padding: '5px 12px', borderRadius: '20px',
                        backgroundColor: 'var(--primary-color)', color: 'white',
                        letterSpacing: '0.05em', marginBottom: '0.9rem',
                      }}>RECOMENDADO AHORA</span>
                    )}
                    <h2 style={{ fontSize: '1.95rem', fontWeight: 800, color: contentLocked ? '#0f172a' : 'white', marginBottom: '0.4rem' }}>
                      {contentLocked ? 'Tu programa está siendo preparado' : activeInfo?.titulo}
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: contentLocked ? '#64748b' : 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={15} /> {contentLocked ? 'Vas a poder ver tus pausas cuando ReActiva habilite el contenido.' : activeInfo?.subtitulo}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Barra de acción inferior */}
            {!allDoneToday && (() => {
              const videoKey = activeBloque ? `${today}__${activeBloque}` : '';
              const requiereVideo = !!activeScheduledVideo;
              const videoVisto = videoKey ? videosVistos.has(videoKey) : false;
              const isAvailable = activeStatusObj?.status === 'available' && !!activeScheduledVideo;
              const puedeAccionar = isAvailable && !!activeScheduledVideo;
              const puedeCompletar = isAvailable && (!requiereVideo || videoVisto);

              let prompt: string;
              if (activeStatusObj?.status === 'available' && !activeScheduledVideo) prompt = 'Contenido pendiente de carga por ReActiva.';
              else if (!isAvailable) prompt = activeStatusObj?.reason || 'Pausa bloqueada';
              else if (requiereVideo && !videoVisto) prompt = 'Mirá el video y después marcá la pausa como hecha.';
              else prompt = '¿Ya realizaste esta pausa?';

              return (
                <div className="user-pause-action" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '1rem', padding: '1.1rem 1.5rem',
                }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', fontWeight: 500 }}>{prompt}</p>
                  <button
                    onClick={handleActiveAction}
                    disabled={!puedeAccionar}
                    title={!puedeAccionar ? undefined : !puedeCompletar ? 'Abrir video' : 'Completar pausa'}
                    style={{
                      padding: '0.85rem 2.2rem',
                      borderRadius: '999px',
                      border: 'none',
                      backgroundColor: puedeAccionar ? (puedeCompletar ? 'var(--primary-color)' : '#0f172a') : '#cbd5e1',
                      color: 'white', fontWeight: 700, fontSize: '0.92rem',
                      cursor: puedeAccionar ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      boxShadow: puedeAccionar ? '0 4px 12px rgba(15, 23, 42, 0.18)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {!isAvailable ? (
                      activeStatusObj?.status === 'locked' ? <><Lock size={14} style={{ marginRight: 6 }} />Bloqueada</> : 'Hecha'
                    ) : (!videoVisto && requiereVideo) ? (
                      <><Play size={14} style={{ marginRight: 6, fill: 'white' }} />Mirá el video</>
                    ) : 'Completar pausa'}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── COLUMNA DERECHA: Tu semana ───────────────────────────────── */}
        <div className="user-week-card" style={{
          backgroundColor: 'white', borderRadius: '20px',
          border: '1px solid #eef0f3', padding: '1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>Tu semana</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{totalPausas}</span> de {totalObjetivo} pausas completadas
          </p>

          {DAYS.map(dia => {
            const isCurrent = dia === today;
            return (
              <div className="user-week-day" key={dia} style={{ marginBottom: '0.5rem' }}>
                <div className="user-week-day-head" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <p style={{
                    fontWeight: 700, fontSize: '0.95rem',
                    color: isCurrent ? 'var(--primary-color)' : 'var(--text-color)',
                  }}>{dia}</p>
                  {isCurrent && <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} />}
                </div>
                {(['morning', 'afternoon'] as const).map(bloque => {
                  const { status } = getStatus(dia, bloque);
                  const isActive = isCurrent && activeBloque === bloque;
                  const scheduledVideo = getScheduledVideoFor(effectiveScheduledVideos, dia, bloque, companyId, scheduledDateFor(dia), user?.workProfile);
                  const scheduledTime = scheduledVideo?.time;
                  return (
                    <WeekPauseRow
                      key={bloque}
                      bloque={bloque}
                      status={status}
                      isActive={isActive}
                      time={scheduledTime}
                      title={scheduledVideo?.title}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* Footer */}
          <div style={{
            marginTop: '0.5rem', padding: '0.75rem 1rem',
            backgroundColor: '#f0fdf9', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🌱</span>
            <p style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>Pequeñas pausas, grandes resultados</p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {openForm === 'afternoon' && today !== 'Viernes' && <MiniForm bloque={openForm} onClose={() => setOpenForm(null)} onSubmit={handleFormSubmit} />}
      {openForm === 'afternoon' && today === 'Viernes' && <WeeklyForm bloque={openForm} onClose={() => setOpenForm(null)} onSubmit={handleFormSubmit} />}
      {openVideo && openScheduledVideo && (
        <VideoModal
          videoUrl={openScheduledVideo.url}
          titulo={`${openScheduledVideo.title || PAUSAS[openVideo.bloque].titulo} · ${openVideo.dia} ${openVideo.bloque === 'morning' ? 'mañana' : 'tarde'}`}
          onClose={() => setOpenVideo(null)}
          onWatched={handleVideoWatched}
        />
      )}
    </div>
  );
};

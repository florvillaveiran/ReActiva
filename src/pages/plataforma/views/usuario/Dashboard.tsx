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
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setEnergia(n)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700, border: `2px solid ${energia === n ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: energia === n ? 'var(--primary-color)' : 'transparent', color: energia === n ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{n}</button>
              ))}
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
  const [estres, setEstres] = useState(0);
  const [ayuda, setAyuda] = useState('');
  const [mejora, setMejora] = useState('');
  const [done, setDone] = useState(false);
  const canSubmit = estres > 0 && ayuda !== '' && mejora !== '';
  const submit = () => { setDone(true); setTimeout(() => onSubmit({ bloque, estres, ayuda, mejora, tipo: 'semanal' }), 1200); };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={52} color="var(--primary-color)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>¡Excelente semana!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gracias por tu feedback semanal.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Resumen Semanal</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={20} /></button>
            </div>
            
            {/* P1 */}
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Nivel de estrés esta semana (1–5)</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setEstres(n)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700, border: `2px solid ${estres === n ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: estres === n ? 'var(--primary-color)' : 'transparent', color: estres === n ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>{n}</button>
              ))}
            </div>

            {/* P2 */}
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>¿Las pausas te ayudaron a sentirte mejor?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['Sí, mucho', 'Más o menos', 'No noté diferencia'].map(opt => (
                <button key={opt} onClick={() => setAyuda(opt)} style={{ padding: '0.65rem', borderRadius: '10px', fontWeight: 600, border: `2px solid ${ayuda === opt ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: ayuda === opt ? 'var(--primary-light)' : 'transparent', color: ayuda === opt ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left' }}>{opt}</button>
              ))}
            </div>

            {/* P3 */}
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>¿Notaste mejora en molestias musculares?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['Sí, se redujeron', 'Siguen igual', 'No suelo tener molestias'].map(opt => (
                <button key={opt} onClick={() => setMejora(opt)} style={{ padding: '0.65rem', borderRadius: '10px', fontWeight: 600, border: `2px solid ${mejora === opt ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: mejora === opt ? 'var(--primary-light)' : 'transparent', color: mejora === opt ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left' }}>{opt}</button>
              ))}
            </div>

            <button onClick={submit} disabled={!canSubmit} className="btn-primary" style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: canSubmit ? 1 : 0.4 }}>
              <Send size={15} /> Finalizar semana
            </button>
          </>
        )}
      </div>
    </div>
  );
};


// ─── Tarjeta de Pausa ────────────────────────────────────────────────────────
const PauseCard: React.FC<{ bloque: 'morning' | 'afternoon'; status: 'done' | 'available' | 'locked'; isToday: boolean; onAction: () => void; lockReason?: string; }> = ({ bloque, status, isToday, onAction, lockReason }) => {
  const info = PAUSAS[bloque];
  return (
    <div className="card" style={{ overflow: 'hidden', border: status === 'available' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', opacity: (status === 'locked' && !isToday) ? 0.55 : 1, transition: 'all 0.2s', transform: status === 'available' ? 'scale(1.01)' : 'scale(1)' }}>
      {/* Imagen compacta */}
      <div style={{ height: '75px', position: 'relative', backgroundImage: `url(${info.img})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#1e293b', filter: status === 'locked' ? 'grayscale(70%)' : 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.32)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {status === 'done' && <CheckCircle2 size={28} color="white" />}
          {status === 'locked' && <Lock size={22} color="rgba(255,255,255,0.65)" />}
          {status === 'available' && <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={14} color="white" fill="white" /></div>}
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: '0.75rem' }}>
        <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-color)', marginBottom: '2px' }}>{info.titulo}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>{info.hora} · {info.duracion}</p>
        {status === 'done' && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontSize: '0.72rem', fontWeight: 600 }}><CheckCircle2 size={12} /> Completada</div>}
        {status === 'locked' && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={11} /> {lockReason || 'Próximamente'}</div>}
        {status === 'available' && (
          <button onClick={onAction} className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>¡Ya hice mi pausa!</button>
        )}
      </div>
    </div>
  );
};



// ─── Dashboard Principal ──────────────────────────────────────────────────────
export const UsuarioDashboard: React.FC = () => {
  const [completed, setCompleted] = useState<PauseRecord[]>([]);
  const [openForm, setOpenForm] = useState<'morning' | 'afternoon' | null>(null);
  const [nowHour, setNowHour] = useState(() => new Date().getHours() + new Date().getMinutes() / 60);
  
  // Agregamos un selector para que puedas probar los distintos días (Demo mode)
  const [today, setToday] = useState('Lunes');

  useEffect(() => {
    const t = setInterval(() => setNowHour(new Date().getHours() + new Date().getMinutes() / 60), 60000);
    return () => clearInterval(t);
  }, []);

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
    // Si la pausa es automática (mañana), le ponemos el día que corresponda según la tarjeta que tocó.
    // Como el handleFormSubmit se llama directo, lo forzamos al "today" actual.
    const full = { ...record, dia: today };
    setCompleted(prev => [...prev, full as PauseRecord]);
    setOpenForm(null);
    const all = JSON.parse(localStorage.getItem('reactiva_pausas') || '[]');
    localStorage.setItem('reactiva_pausas', JSON.stringify([...all, { ...full, fecha: new Date().toISOString() }]));
  };

  const getStatus = (dia: string, bloque: 'morning' | 'afternoon'): { status: 'done' | 'available' | 'locked'; reason?: string } => {
    if (isDone(dia, bloque)) return { status: 'done' };
    if (dia !== today) {
      // Simplificamos la demo: Si el día ya pasó, está bloqueado (o podríamos dejarlo "vencido", pero mantenemos la lógica actual).
      return { status: 'locked', reason: 'Próximamente' };
    }
    // Es hoy
    if (bloque === 'morning') {
      if (nowHour < 8) return { status: 'locked', reason: 'Disponible desde las 08:00 AM' };
      return { status: 'available' };
    }
    // Tarde
    if (!isDone(today, 'morning')) return { status: 'locked', reason: 'Completá la pausa de mañana primero' };
    if (nowHour < 15) return { status: 'locked', reason: 'Disponible desde las 03:00 PM' };
    return { status: 'available' };
  };

  const totalPausas = completed.length;
  const diasCompletos = DAYS.filter(d => isDone(d, 'morning') && isDone(d, 'afternoon')).length;
  const pct = Math.round((totalPausas / (DAYS.length * 2)) * 100);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '1.5rem' }}>
      
      {/* Demo Switcher (Auto-actualizado) */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.5rem 1rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Día de la semana actual (Demo):</span>
        {DAYS.map(d => (
          <button key={d} onClick={() => setToday(d)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '15px', border: `1px solid ${today === d ? 'var(--primary-color)' : '#e2e8f0'}`, background: today === d ? 'var(--primary-color)' : 'white', color: today === d ? 'white' : 'var(--text-color)', cursor: 'pointer', transition: 'all 0.3s' }}>
            {d}
          </button>
        ))}
      </div>

      {/* ── Banner ── */}
      <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', background: 'linear-gradient(135deg, #f0fdf9 0%, #ffffff 100%)', borderColor: '#d1fae5' }}>
        {/* Mensaje */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '1 1 250px', minWidth: 0 }}>
          <span style={{ fontSize: '2rem', flexShrink: 0 }}>👋</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-color)', marginBottom: '4px' }}>¡Excelente semana, equipo!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recuerden tomar sus pausas activas. Su bienestar es nuestra prioridad.</p>
          </div>
        </div>
        {/* Divider */}
        <div style={{ width: 1, height: 50, backgroundColor: '#d1fae5', flexShrink: 0 }} />
        {/* Progreso stepper */}
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Tu progreso</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {DAYS.map((d, i) => {
              const allDone = isDone(d, 'morning') && isDone(d, 'afternoon');
              const isToday = d === today;
              return (
                <React.Fragment key={d}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: allDone ? 'var(--primary-color)' : isToday ? 'white' : '#f1f5f9', border: `2px solid ${allDone || isToday ? 'var(--primary-color)' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {allDone ? <CheckCircle2 size={16} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isToday ? 'var(--primary-color)' : '#cbd5e1' }} />}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--primary-color)' : 'var(--text-muted)' }}>{d.slice(0,3)}</span>
                  </div>
                  {i < DAYS.length - 1 && <div style={{ width: 40, height: 3, backgroundColor: '#e2e8f0', margin: '0 4px', marginBottom: '18px' }}><div style={{ width: allDone ? '100%' : '0%', height: '100%', backgroundColor: 'var(--primary-color)' }} /></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        {/* Divider */}
        <div style={{ width: 1, height: 50, backgroundColor: '#d1fae5', flexShrink: 0 }} />
        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
          {[
            { icon: <Flame size={16} />, val: `${diasCompletos}/${DAYS.length}`, label: 'Días' },
            { icon: <Play size={16} />, val: totalPausas, label: 'Pausas' },
            { icon: <Clock size={16} />, val: `${totalPausas * 9}m`, label: 'Tiempo' },
            { icon: <TrendingUp size={16} />, val: `${pct}%`, label: 'Constancia' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--primary-color)' }}>
                {s.icon}
                <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-color)' }}>{s.val}</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Título ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '2px' }}>Tu programa semanal de pausas activas</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Todas las pausas y sus horarios de disponibilidad.</p>
        </div>
      </div>

      {/* ── Grid 3 columnas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {DAYS.map(dia => {
            const isToday = dia === today;
            return (
              <div key={dia} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Header día */}
                <div style={{ textAlign: 'center', paddingBottom: '0.4rem', borderBottom: `2px solid ${isToday ? 'var(--primary-color)' : 'var(--border-color)'}` }}>
                  <span style={{ fontWeight: isToday ? 700 : 500, fontSize: '0.85rem', color: isToday ? 'var(--primary-color)' : 'var(--text-muted)' }}>{dia}</span>
                </div>
                {/* Pausa Mañana */}
                {(() => { 
                  const { status, reason } = getStatus(dia, 'morning'); 
                  return <PauseCard 
                    bloque="morning" 
                    status={status} 
                    isToday={isToday} 
                    onAction={() => {
                      // Pausa mañana -> No abre form, lo marca directo.
                      handleFormSubmit({ bloque: 'morning', tipo: 'sin-form' });
                    }} 
                    lockReason={reason} 
                  />; 
                })()}
                {/* Pausa Tarde */}
                {(() => { 
                  const { status, reason } = getStatus(dia, 'afternoon'); 
                  return <PauseCard 
                    bloque="afternoon" 
                    status={status} 
                    isToday={isToday} 
                    onAction={() => setOpenForm('afternoon')} 
                    lockReason={reason} 
                  />; 
                })()}
              </div>
            );
          })}
      </div>

      {/* ── Footer compacto ── */}
      <div style={{ marginTop: '1rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f0fdf9', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
        <span style={{ fontSize: '1.4rem' }}>🏆</span>
        <p style={{ fontSize: '0.9rem', color: '#047857' }}><strong>¡Seguí así!</strong> La constancia en pequeñas acciones genera grandes resultados.</p>
      </div>

      {/* ── Modal ── */}
      {openForm === 'afternoon' && today !== 'Viernes' && <MiniForm bloque={openForm} onClose={() => setOpenForm(null)} onSubmit={handleFormSubmit} />}
      {openForm === 'afternoon' && today === 'Viernes' && <WeeklyForm bloque={openForm} onClose={() => setOpenForm(null)} onSubmit={handleFormSubmit} />}
    </div>
  );
};

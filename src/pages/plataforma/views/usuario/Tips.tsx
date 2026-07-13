import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarCheck, Clock, Droplets, Eye, Leaf, Lightbulb, Moon, Monitor, Sparkles, Star, Target, Trophy, Zap } from 'lucide-react';
import { CoachItem, fetchContentLibrary, getContentLibrary } from '../../data/contentLibrary';
import { supabase } from '../../lib/supabase';

const iconFor = (id: string) => {
  if (id.includes('visual')) return { icon: <Eye size={18} />, bg: '#f3e8ff', color: '#8b5cf6' };
  if (id.includes('organizacion')) return { icon: <CalendarCheck size={18} />, bg: '#e0f2fe', color: '#0284c7' };
  if (id.includes('sueno')) return { icon: <Moon size={18} />, bg: '#eef2ff', color: '#4f46e5' };
  if (id.includes('estres')) return { icon: <Sparkles size={18} />, bg: '#fee2e2', color: '#ef4444' };
  if (id.includes('ergonomia')) return { icon: <Monitor size={18} />, bg: '#ffedd5', color: '#ea580c' };
  if (id.includes('entorno')) return { icon: <Leaf size={18} />, bg: '#dcfce7', color: '#16a34a' };
  if (id.includes('energia')) return { icon: <Zap size={18} />, bg: '#fef3c7', color: '#d97706' };
  return { icon: <Droplets size={18} />, bg: '#ecfdf5', color: '#059669' };
};

export const UsuarioTips: React.FC = () => {
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<CoachItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const applyLibrary = (library = getContentLibrary()) => {
      if (!mounted) return;
      setVersion(value => value + 1);
      setSelected(current => {
        if (!current) return null;
        return library.coach.find(item => item.id === current.id || item.sourceId === current.sourceId) ?? null;
      });
    };
    const refreshRemote = () => void fetchContentLibrary().then(applyLibrary);
    const refreshLocal = () => applyLibrary();

    refreshRemote();
    window.addEventListener('focus', refreshRemote);
    window.addEventListener('reactiva-content-library-updated', refreshLocal);

    const channel = supabase
      ? supabase
          .channel('user-reactiva-tips')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, refreshRemote)
          .subscribe()
      : null;

    return () => {
      mounted = false;
      window.removeEventListener('focus', refreshRemote);
      window.removeEventListener('reactiva-content-library-updated', refreshLocal);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, []);

  const items = useMemo(() => getContentLibrary().coach.filter(item => item.active), [version]);

  if (selected) {
    const icon = iconFor(selected.id);
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '2rem' }}>
        <button type="button" onClick={() => setSelected(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: 999, padding: '0.5rem 0.9rem', color: '#64748b', fontWeight: 800, marginBottom: '1rem', background: 'white', fontSize: '0.86rem' }}>
          <ArrowLeft size={17} /> Volver a ReActiva Tips
        </button>
        <header style={{ background: '#f0fdf9', border: '1px solid #bbf7d0', borderRadius: 18, padding: '1.15rem', marginBottom: '1rem', display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: icon.bg, color: icon.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon.icon}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--primary-color)', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.82rem' }}>{selected.category}</span>
              <span style={{ border: '1px solid #99f6e4', color: '#009f89', borderRadius: 999, padding: '0.28rem 0.75rem', fontWeight: 800, fontSize: '0.78rem' }}>Tip recomendado</span>
            </div>
            <h1 style={{ margin: '0 0 0.25rem', color: '#020617', fontSize: '1.35rem', fontWeight: 900 }}>{selected.detailTitle}</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>{selected.subtitle}</p>
          </div>
        </header>
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '1.35rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f8fafc', borderRadius: 999, padding: '0.42rem 0.75rem', color: '#334155', fontWeight: 800, fontSize: '0.84rem' }}><Clock size={15} /> Tiempo: {selected.time}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f8fafc', borderRadius: 999, padding: '0.42rem 0.75rem', color: '#334155', fontWeight: 800, fontSize: '0.84rem' }}><Star size={15} /> Dificultad: {selected.difficulty}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', borderRadius: 999, padding: '0.42rem 0.75rem', color: '#047857', fontWeight: 800, fontSize: '0.84rem' }}><Zap size={15} /> Beneficio: {selected.benefit}</span>
        </div>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(235px, 1fr))', gap: '1rem' }}>
          {[
            ['RECOMENDACIÓN PRINCIPAL', selected.recommendation, <Target size={17} />],
            ['POR QUÉ IMPORTA', selected.why, <Sparkles size={17} />],
            ['EVIDENCIA', selected.evidence, <Lightbulb size={17} />],
          ].map(([title, text, iconNode]) => (
            <article key={String(title)} style={{ background: title === 'RECOMENDACIÓN PRINCIPAL' ? '#f0fdf9' : 'white', border: '1px solid #d1fae5', borderRadius: 16, padding: '0.9rem', minHeight: 108 }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 0 0.65rem', color: 'var(--primary-color)', fontWeight: 900, letterSpacing: '0.04em', fontSize: '0.78rem' }}>{iconNode}{title}</p>
              <p style={{ margin: 0, color: '#020617', lineHeight: 1.4, fontWeight: title === 'RECOMENDACIÓN PRINCIPAL' ? 800 : 500, fontSize: '0.9rem' }}>{text}</p>
            </article>
          ))}
          <article style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: '0.9rem', minHeight: 148 }}>
            <p style={{ margin: '0 0 0.65rem', color: 'var(--primary-color)', fontWeight: 900, letterSpacing: '0.04em', fontSize: '0.78rem' }}>CÓMO APLICARLO HOY</p>
            {selected.steps.map(step => <p key={step} style={{ margin: '0 0 0.48rem', color: '#64748b', fontSize: '0.9rem' }}>{step}</p>)}
          </article>
          <article style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: '0.9rem', minHeight: 148 }}>
            <p style={{ margin: '0 0 0.65rem', color: 'var(--primary-color)', fontWeight: 900, letterSpacing: '0.04em', fontSize: '0.78rem' }}>SEÑALES</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {selected.signals.map(signal => <span key={signal} style={{ border: '1px solid #e5e7eb', borderRadius: 999, padding: '0.28rem 0.58rem', color: '#64748b', fontSize: '0.84rem' }}>{signal}</span>)}
            </div>
            <p style={{ borderTop: '1px solid #e5e7eb', marginTop: '0.75rem', paddingTop: '0.65rem', color: '#64748b', fontStyle: 'italic', fontSize: '0.82rem' }}>Estas señales son orientativas y no reemplazan una indicación médica.</p>
          </article>
          <article style={{ background: '#f0fdf9', border: '1px solid #bbf7d0', borderRadius: 16, padding: '0.9rem', minHeight: 148 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 0 0.65rem', color: 'var(--primary-color)', fontWeight: 900, letterSpacing: '0.04em', fontSize: '0.78rem' }}><Trophy size={16} /> MINI DESAFÍO</p>
            <p style={{ margin: 0, color: '#020617', lineHeight: 1.4, fontWeight: 800, fontSize: '0.9rem' }}>{selected.challenge}</p>
          </article>
        </section>
        <div style={{ marginTop: '1.4rem', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem', color: '#334155', fontWeight: 800, fontSize: '0.92rem' }}>
          <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CONSEJO RELACIONADO</p>
          Explorar: {selected.related}
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#020617', fontSize: '1.65rem', fontWeight: 900 }}>ReActiva Tips</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>Tu acompañante diario de hábitos, personalizado según tu bienestar.</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ecfdf5', color: 'var(--primary-color)', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={21} />
        </div>
      </header>

      <section style={{ background: '#f0fdf9', border: '1px solid #bbf7d0', borderRadius: 18, padding: '0.95rem 1.15rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontWeight: 900, letterSpacing: '0.04em', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
          <Lightbulb size={15} />
          <span>RECOMENDACIÓN PARA HOY</span>
        </div>
        <p style={{ margin: 0, color: '#020617', fontSize: '0.98rem', fontWeight: 800 }}>Cada 20 minutos, mirá algo a 20 pies (6 metros) de distancia durante 20 segundos.</p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))', gap: '1rem' }}>
        {items.map(item => {
          const icon = iconFor(item.id);
          return (
            <article key={item.id} style={{ position: 'relative', background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.05rem', boxShadow: '0 8px 22px rgba(15,23,42,0.05)' }}>
              {item.isNew && (
                <span style={{ position: 'absolute', top: '-0.65rem', right: '-0.5rem', background: '#ef4444', color: 'white', borderRadius: 999, padding: '0.32rem 0.65rem', fontSize: '0.68rem', fontWeight: 900, boxShadow: '0 6px 16px rgba(239,68,68,0.25)' }}>NUEVO</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.95rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: icon.bg, color: icon.color }}>{icon.icon}</div>
                <h2 style={{ margin: 0, color: '#020617', fontSize: '1.05rem', fontWeight: 900 }}>{item.title}</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.4, minHeight: 45, margin: '0 0 0.85rem' }}>{item.description}</p>
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0.75rem 0.85rem', marginBottom: '0.95rem' }}>
                <p style={{ margin: '0 0 0.3rem', color: 'var(--primary-color)', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.04em' }}>RECOMENDACIÓN</p>
                <p style={{ margin: 0, color: '#020617', lineHeight: 1.35, fontSize: '0.88rem' }}>{item.recommendation}</p>
              </div>
              <button type="button" onClick={() => setSelected(item)} className="btn-primary" style={{ borderRadius: 999, padding: '0.55rem 0.9rem', fontWeight: 900, fontSize: '0.82rem' }}>Ver consejo</button>
            </article>
          );
        })}
      </section>
    </div>
  );
};

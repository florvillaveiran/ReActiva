import React, { useEffect, useMemo, useState } from 'react';
import { Clock, GraduationCap, Play, Search, Sparkles, Star } from 'lucide-react';
import { getContentLibrary } from '../../data/contentLibrary';

export const UsuarioAcademia: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion(value => value + 1);
    window.addEventListener('reactiva-content-library-updated', refresh);
    return () => window.removeEventListener('reactiva-content-library-updated', refresh);
  }, []);

  const items = useMemo(() => getContentLibrary().academy.filter(item => item.active), [version]);
  const categories = useMemo(() => ['Todos', ...Array.from(new Set(items.map(item => item.category)))], [items]);
  const filtered = items.filter(item => {
    const matchesCategory = category === 'Todos' || item.category === category;
    const normalized = query.trim().toLowerCase();
    const matchesQuery = !normalized || [item.title, item.description, item.category].some(value => value.toLowerCase().includes(normalized));
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: '#d9fbf3', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={21} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#020617', fontSize: '1.65rem', fontWeight: 900 }}>Academia ReActiva</h1>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.92rem', maxWidth: 520 }}>Aprende a cuidar tu bienestar con contenidos practicos desarrollados por profesionales.</p>
          </div>
        </div>
        <div style={{ minWidth: 160 }}>
          <p style={{ margin: '0 0 0.35rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 800 }}>Progreso: 0 de 9 <span style={{ color: 'var(--primary-color)' }}>(0%)</span></p>
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999 }} />
        </div>
      </header>

      <div style={{ position: 'relative', maxWidth: 420, marginBottom: '0.9rem' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: 13, left: 13 }} />
        <input className="input-field" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por titulo o palabra clave..." style={{ height: 44, borderRadius: 12, paddingLeft: 38, fontSize: '0.88rem' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {categories.map(item => (
          <button key={item} type="button" onClick={() => setCategory(item)} style={{ border: '1px solid #e2e8f0', borderRadius: 999, padding: '0.34rem 0.7rem', background: category === item ? 'var(--primary-color)' : 'white', color: category === item ? 'white' : '#64748b', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
            {item}
          </button>
        ))}
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '1rem' }}>
        {filtered.map(item => (
          <article key={item.id} style={{ background: 'white', border: item.recommended ? '1.5px solid var(--primary-color)' : '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: item.recommended ? '0 12px 26px rgba(0,194,168,0.12)' : '0 10px 24px rgba(15,23,42,0.05)' }}>
            <div style={{ height: 118, background: `linear-gradient(180deg, rgba(15,23,42,0.18), rgba(15,23,42,0.18)), url(${item.image}) center/cover`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'white', color: '#1e293b', borderRadius: 999, padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 900 }}>{item.category}</span>
              {item.recommended && <span style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--primary-color)', color: 'white', borderRadius: 999, padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 900 }}><Sparkles size={12} /> Recomendado</span>}
            </div>
            <div style={{ padding: '1rem' }}>
              <h2 style={{ margin: '0 0 0.5rem', color: '#020617', fontSize: '1.02rem', lineHeight: 1.18, fontWeight: 900 }}>{item.title}</h2>
              <p style={{ minHeight: 42, margin: '0 0 0.9rem', color: '#64748b', lineHeight: 1.4, fontSize: '0.86rem' }}>{item.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: '0.9rem', fontSize: '0.8rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {item.duration}</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Star size={14} /> {item.level}</span>
              </div>
              <div style={{ height: 1, background: '#eef2f7', marginBottom: '0.9rem' }} />
              <button type="button" style={{ width: '100%', height: 42, borderRadius: 12, border: item.recommended ? 'none' : '1px solid #e2e8f0', background: item.recommended ? 'var(--primary-color)' : 'white', color: item.recommended ? 'white' : '#020617', fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                {item.id === 'academy-ergonomia' ? <><Play size={14} fill="#d97706" color="#d97706" /> Continuar</> : 'Ver taller'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

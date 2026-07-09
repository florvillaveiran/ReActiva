import React, { useState, useMemo } from 'react';
import { Clock, Video, Building2, CheckCircle2, CircleDashed, ChevronLeft, ChevronRight, X, Link, Upload, Save, Filter, Eye, Pencil, Trash2, CalendarCheck, Droplets, Leaf, Lightbulb, Moon, Monitor, Search, Sparkles, Star, Zap, FileImage, FileVideo, Info } from 'lucide-react';
import { AcademyItem, CoachItem, deleteAcademyItem, deleteCoachItem, getContentLibrary, updateAcademyItem, updateCoachItem } from '../../data/contentLibrary';
import { useEmpresas } from '../../context/EmpresasContext';

type AdminSection = 'micro' | 'coach' | 'academy' | 'media';

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  color: '#334155',
  fontSize: '0.82rem',
  fontWeight: 800,
  margin: '0 0 0.35rem 0.15rem',
};

const coachIconFor = (id: string) => {
  if (id.includes('visual')) return { icon: <Eye size={18} />, bg: '#f3e8ff', color: '#8b5cf6' };
  if (id.includes('organizacion')) return { icon: <CalendarCheck size={18} />, bg: '#e0f2fe', color: '#0284c7' };
  if (id.includes('sueno')) return { icon: <Moon size={18} />, bg: '#eef2ff', color: '#4f46e5' };
  if (id.includes('estres')) return { icon: <Sparkles size={18} />, bg: '#fee2e2', color: '#ef4444' };
  if (id.includes('ergonomia')) return { icon: <Monitor size={18} />, bg: '#ffedd5', color: '#ea580c' };
  if (id.includes('entorno')) return { icon: <Leaf size={18} />, bg: '#dcfce7', color: '#16a34a' };
  if (id.includes('energia')) return { icon: <Zap size={18} />, bg: '#fef3c7', color: '#d97706' };
  return { icon: <Droplets size={18} />, bg: '#ecfdf5', color: '#059669' };
};

const SectionTabs: React.FC<{ value: AdminSection; onChange: (value: AdminSection) => void }> = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
    {[
      ['micro', 'Microentrenamientos'],
      ['coach', 'ReActiva Tips'],
      ['academy', 'Academia ReActiva'],
      ['media', 'Biblioteca Multimedia'],
    ].map(([key, label]) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key as AdminSection)}
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 999,
          padding: '0.5rem 0.9rem',
          background: value === key ? 'var(--primary-color)' : 'white',
          color: value === key ? 'white' : '#64748b',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    ))}
  </div>
);

const AdminCoachPanel: React.FC = () => {
  const [items, setItems] = useState(() => getContentLibrary().coach);
  const [editing, setEditing] = useState<CoachItem | null>(null);
  const reload = () => setItems(getContentLibrary().coach);

  const save = () => {
    if (!editing) return;
    updateCoachItem(editing);
    setEditing(null);
    reload();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className="header-title" style={{ marginBottom: '0.25rem' }}>ReActiva Tips</h2>
          <p className="text-muted" style={{ margin: 0 }}>Mismos consejos que ve el usuario.</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ecfdf5', color: 'var(--primary-color)', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={21} />
        </div>
      </div>
      <section style={{ background: '#f0fdf9', border: '1px solid #bbf7d0', borderRadius: 18, padding: '0.95rem 1.15rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
          <Lightbulb size={15} />
          <span>RECOMENDACION PARA HOY</span>
        </div>
        <p style={{ margin: 0, color: '#020617', fontSize: '0.98rem', fontWeight: 800 }}>Cada 20 minutos, mira algo a 20 pies (6 metros) de distancia durante 20 segundos.</p>
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))', gap: '1rem' }}>
        {items.map(item => {
          const icon = coachIconFor(item.id);
          return (
          <article key={item.id} className="card" style={{ margin: 0, padding: '1.05rem', borderRadius: 16, boxShadow: '0 8px 22px rgba(15,23,42,0.05)', minHeight: 250 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.95rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: icon.bg, color: icon.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon.icon}
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                {item.isNew && <span style={{ background: '#ef4444', color: 'white', borderRadius: 999, padding: '0.32rem 0.6rem', fontSize: '0.68rem', fontWeight: 900, lineHeight: 1 }}>NUEVO</span>}
                <span style={{ color: item.active ? 'var(--primary-color)' : '#94a3b8', fontWeight: 800, fontSize: '0.78rem' }}>{item.active ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
            <h3 style={{ margin: '0 0 0.55rem', fontSize: '1.05rem', color: '#020617', lineHeight: 1.2 }}>{item.title}</h3>
            <p style={{ color: '#64748b', margin: '0 0 0.85rem', lineHeight: 1.4, fontSize: '0.88rem' }}>{item.description}</p>
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0.75rem 0.85rem', marginBottom: '0.85rem' }}>
              <p style={{ margin: '0 0 0.3rem', color: 'var(--primary-color)', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.04em' }}>RECOMENDACION</p>
              <p style={{ margin: 0, color: '#020617', fontSize: '0.88rem', lineHeight: 1.35 }}>{item.recommendation}</p>
            </div>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.86rem' }}>{item.tags.map(tag => `◇ ${tag}`).join('  ')}</p>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem' }}>
              <button className="btn-primary" onClick={() => window.alert(`${item.title}\n\n${item.recommendation}`)} style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}>Ver consejo</button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button title="Editar" onClick={() => setEditing(item)} style={{ color: 'var(--primary-color)' }}><Pencil size={17} /></button>
                <button title="Eliminar" onClick={() => { if (window.confirm('Deseas eliminar este consejo?')) { deleteCoachItem(item.id); reload(); } }} style={{ color: '#020617' }}><Trash2 size={17} /></button>
              </div>
            </div>
          </article>
          );
        })}
      </div>
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 720, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', margin: 0, padding: '1.25rem', borderRadius: 16 }}>
            <h3 style={{ marginTop: 0 }}>Editar consejo</h3>
            <label style={fieldLabelStyle}>Categoria / nombre del consejo</label>
            <input className="input-field" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Descripcion de la tarjeta</label>
            <textarea className="input-field" rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Recomendacion principal</label>
            <textarea className="input-field" rows={3} value={editing.recommendation} onChange={e => setEditing({ ...editing, recommendation: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Titulo del detalle</label>
            <input className="input-field" value={editing.detailTitle} onChange={e => setEditing({ ...editing, detailTitle: e.target.value })} placeholder="Titulo del detalle" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Subtitulo del detalle</label>
            <input className="input-field" value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Subtitulo del detalle" style={{ marginBottom: '0.7rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem', marginBottom: '0.7rem' }}>
              <div>
                <label style={fieldLabelStyle}>Tiempo</label>
                <input className="input-field" value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })} placeholder="Tiempo" />
              </div>
              <div>
                <label style={fieldLabelStyle}>Dificultad</label>
                <input className="input-field" value={editing.difficulty} onChange={e => setEditing({ ...editing, difficulty: e.target.value })} placeholder="Dificultad" />
              </div>
              <div>
                <label style={fieldLabelStyle}>Beneficio</label>
                <input className="input-field" value={editing.benefit} onChange={e => setEditing({ ...editing, benefit: e.target.value })} placeholder="Beneficio" />
              </div>
            </div>
            <label style={fieldLabelStyle}>Por que importa</label>
            <textarea className="input-field" rows={3} value={editing.why} onChange={e => setEditing({ ...editing, why: e.target.value })} placeholder="Por que importa" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Evidencia</label>
            <textarea className="input-field" rows={3} value={editing.evidence} onChange={e => setEditing({ ...editing, evidence: e.target.value })} placeholder="Evidencia" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Como aplicarlo hoy</label>
            <textarea className="input-field" rows={3} value={editing.steps.join('\n')} onChange={e => setEditing({ ...editing, steps: e.target.value.split('\n').filter(Boolean) })} placeholder="Como aplicarlo hoy (una linea por paso)" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Senales</label>
            <textarea className="input-field" rows={3} value={editing.signals.join('\n')} onChange={e => setEditing({ ...editing, signals: e.target.value.split('\n').filter(Boolean) })} placeholder="Senales (una linea por senal)" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Mini desafio</label>
            <textarea className="input-field" rows={2} value={editing.challenge} onChange={e => setEditing({ ...editing, challenge: e.target.value })} placeholder="Mini desafio" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Consejo relacionado</label>
            <input className="input-field" value={editing.related} onChange={e => setEditing({ ...editing, related: e.target.value })} placeholder="Consejo relacionado" style={{ marginBottom: '0.7rem' }} />
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Activo</label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminAcademyPanel: React.FC = () => {
  const [items, setItems] = useState(() => getContentLibrary().academy);
  const [editing, setEditing] = useState<AcademyItem | null>(null);
  const reload = () => setItems(getContentLibrary().academy);
  const save = () => {
    if (!editing) return;
    updateAcademyItem(editing);
    setEditing(null);
    reload();
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className="header-title" style={{ marginBottom: '0.25rem' }}>Academia ReActiva</h2>
          <p className="text-muted" style={{ margin: 0 }}>Mismos talleres que ve el usuario.</p>
        </div>
        <div style={{ minWidth: 160 }}>
          <p style={{ margin: '0 0 0.35rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 800 }}>Progreso: 0 de 9 <span style={{ color: 'var(--primary-color)' }}>(0%)</span></p>
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999 }} />
        </div>
      </header>
      <div style={{ position: 'relative', maxWidth: 420, marginBottom: '0.9rem' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: 13, left: 13 }} />
        <input className="input-field" placeholder="Buscar por titulo o palabra clave..." readOnly style={{ height: 44, borderRadius: 12, paddingLeft: 38, fontSize: '0.88rem' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['Todos', 'Ergonomia', 'Dolor musculoesqueletico', 'Sueno', 'Hidratacion', 'Salud visual', 'Entorno saludable', 'Estres', 'Respiracion'].map(category => (
          <span key={category} style={{ border: '1px solid #e2e8f0', borderRadius: 999, padding: '0.34rem 0.7rem', background: category === 'Todos' ? 'var(--primary-color)' : 'white', color: category === 'Todos' ? 'white' : '#64748b', fontWeight: 800, fontSize: '0.78rem' }}>{category}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '1rem' }}>
        {items.map(item => (
          <article key={item.id} className="card" style={{ margin: 0, padding: '0 1rem 1rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 24px rgba(15,23,42,0.05)', border: item.recommended ? '1.5px solid var(--primary-color)' : '1px solid #e5e7eb' }}>
            <div style={{ height: 118, margin: '0 -1rem', background: `linear-gradient(rgba(15,23,42,0.12), rgba(15,23,42,0.18)), url(${item.image}) center/cover`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '0.35rem 0.65rem', color: '#1e293b', fontWeight: 900, fontSize: '0.72rem' }}>{item.category}</span>
              {item.recommended && <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary-color)', color: 'white', borderRadius: 999, padding: '0.35rem 0.65rem', fontWeight: 900, fontSize: '0.72rem' }}>Recomendado</span>}
            </div>
            <div style={{ display: 'none', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '0.45rem 0.65rem', color: '#020617', fontWeight: 800, fontSize: '0.82rem' }}>{item.category}</span>
              <span style={{ color: item.active ? 'var(--primary-color)' : '#94a3b8', fontWeight: 800 }}>{item.active ? 'Activo' : 'Inactivo'}</span>
            </div>
            <h3 style={{ margin: '1rem 0 0.5rem', fontSize: '1.02rem', color: '#020617', lineHeight: 1.18 }}>{item.title}</h3>
            <p style={{ color: '#64748b', margin: '0 0 0.9rem', lineHeight: 1.4, fontSize: '0.86rem' }}>{item.description}</p>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.86rem' }}>{item.duration} · {item.level}</p>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem' }}>
              <button className={item.recommended ? 'btn-primary' : 'btn-secondary'} onClick={() => window.alert(`${item.title}\n\n${item.description}`)} style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}>{item.recommended ? 'Continuar' : 'Ver taller'}</button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button title="Editar" onClick={() => setEditing(item)} style={{ color: 'var(--primary-color)' }}><Pencil size={17} /></button>
                <button title="Eliminar" onClick={() => { if (window.confirm('Deseas eliminar este taller?')) { deleteAcademyItem(item.id); reload(); } }} style={{ color: '#020617' }}><Trash2 size={17} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 560, maxWidth: '94vw', margin: 0, padding: '1.25rem', borderRadius: 16 }}>
            <h3 style={{ marginTop: 0 }}>Editar taller</h3>
            <label style={fieldLabelStyle}>Titulo del taller</label>
            <input className="input-field" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Descripcion del taller</label>
            <textarea className="input-field" rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Duracion</label>
            <input className="input-field" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Imagen de portada</label>
            <input className="input-field" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="URL de portada" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Subir video / URL del video</label>
            <input className="input-field" value={editing.videoUrl ?? ''} onChange={e => setEditing({ ...editing, videoUrl: e.target.value })} placeholder="https://... o ruta del video subido" style={{ marginBottom: '0.7rem' }} />
            <input type="file" accept="video/*" className="input-field" onChange={e => {
              const file = e.target.files?.[0];
              if (file) setEditing({ ...editing, videoUrl: file.name });
            }} style={{ marginBottom: '0.7rem', paddingTop: '0.75rem' }} />
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Activo</label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type MediaKind = 'Video' | 'Image';

interface MediaItem {
  id: string;
  name: string;
  kind: MediaKind;
  url: string;
  duration: string;
  size: string;
  description: string;
}

const MEDIA_STORAGE_KEY = 'reactiva-admin-media-library';

const defaultMediaItems: MediaItem[] = [
  { id: 'media-respiracion', name: 'Respiracion Diafragmatica.mp4', kind: 'Video', url: 'https://www.youtube.com/embed/4tP5slYAwcY', duration: '9 min', size: '14.7 MB', description: 'Video demo de respiracion para pausas activas.' },
  { id: 'media-portada-ergo', name: 'Portada Taller Ergo.jpg', kind: 'Image', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', duration: '-', size: '439.5 KB', description: 'Imagen de portada para taller de ergonomia.' },
];

const emptyMediaItem = (): MediaItem => ({
  id: `media-${Date.now()}`,
  name: '',
  kind: 'Video',
  url: '',
  duration: '',
  size: '',
  description: '',
});

const readMediaItems = (): MediaItem[] => {
  try {
    return JSON.parse(localStorage.getItem(MEDIA_STORAGE_KEY) || 'null') ?? defaultMediaItems;
  } catch {
    return defaultMediaItems;
  }
};

const saveMediaItems = (items: MediaItem[]) => {
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
};

const mediaSizeInMb = (size: string) => {
  const value = Number.parseFloat(size.replace(',', '.')) || 0;
  return size.toLowerCase().includes('kb') ? value / 1024 : value;
};

const AdminMediaPanel: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>(() => readMediaItems());
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<MediaItem | null>(null);

  const persist = (next: MediaItem[]) => {
    setItems(next);
    saveMediaItems(next);
  };

  const filtered = items.filter(item => {
    const normalized = query.trim().toLowerCase();
    return !normalized || [item.name, item.kind, item.description, item.duration].some(value => value.toLowerCase().includes(normalized));
  });

  const videos = items.filter(item => item.kind === 'Video').length;
  const images = items.filter(item => item.kind === 'Image').length;
  const usedMb = items.reduce((sum, item) => sum + mediaSizeInMb(item.size), 0);

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    const exists = items.some(item => item.id === editing.id);
    const next = exists ? items.map(item => item.id === editing.id ? editing : item) : [editing, ...items];
    persist(next);
    setEditing(null);
  };

  const remove = (id: string) => {
    if (window.confirm('Deseas eliminar este archivo?')) {
      persist(items.filter(item => item.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          ['TOTAL ARCHIVOS', String(items.length), '#020617'],
          ['VIDEOS', String(videos), '#3b82f6'],
          ['IMAGENES', String(images), 'var(--primary-color)'],
          ['ESPACIO USADO', `${usedMb.toFixed(1)} MB`, '#020617'],
        ].map(([label, value, color]) => (
          <div key={label} className="card" style={{ margin: 0, padding: '1rem', borderRadius: 16 }}>
            <p style={{ margin: '0 0 0.65rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 900 }}>{label}</p>
            <strong style={{ color, fontSize: '1.45rem' }}>{value}</strong>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 360, maxWidth: '100%' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: 13, left: 13 }} />
          <input className="input-field" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar archivos..." style={{ height: 44, borderRadius: 12, paddingLeft: 38, fontSize: '0.88rem' }} />
        </div>
        <button className="btn-primary" onClick={() => setEditing(emptyMediaItem())} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.1rem' }}>
          <Upload size={16} /> Subir archivo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {filtered.map(item => (
          <article key={item.id} className="card" style={{ margin: 0, padding: '0.9rem', borderRadius: 16 }}>
            <div style={{ height: 120, borderRadius: 10, background: '#f8fafc', color: item.kind === 'Video' ? '#3b82f6' : 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
              {item.kind === 'Video' ? <FileVideo size={34} /> : <FileImage size={34} />}
            </div>
            <h3 style={{ margin: '0 0 0.45rem', color: '#020617', fontSize: '0.95rem', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              <span>{item.size || 'Sin peso'}</span>
              <span>{item.kind}</span>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button title="Abrir link" onClick={() => item.url ? window.open(item.url, '_blank') : window.alert('Este archivo no tiene link cargado.')} style={{ color: '#64748b' }}><Link size={16} /></button>
              <button title="Informacion" onClick={() => window.alert(`${item.name}\nTipo: ${item.kind}\nDuracion: ${item.duration || '-'}\nPeso: ${item.size || '-'}\n\n${item.description || 'Sin descripcion.'}`)} style={{ color: '#64748b' }}><Info size={16} /></button>
              <button title="Editar" onClick={() => setEditing(item)} style={{ color: 'var(--primary-color)' }}><Pencil size={16} /></button>
              <button title="Eliminar" onClick={() => remove(item.id)} style={{ color: '#020617' }}><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 560, maxWidth: '94vw', margin: 0, padding: '1.25rem', borderRadius: 16 }}>
            <h3 style={{ marginTop: 0 }}>Subir archivo multimedia</h3>
            <label style={fieldLabelStyle}>Nombre del archivo</label>
            <input className="input-field" value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} placeholder="Ej: Respiracion Diafragmatica.mp4" style={{ marginBottom: '0.7rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.7rem' }}>
              <div>
                <label style={fieldLabelStyle}>Tipo</label>
                <select className="input-field" value={editing.kind} onChange={event => setEditing({ ...editing, kind: event.target.value as MediaKind })}>
                  <option value="Video">Video</option>
                  <option value="Image">Imagen</option>
                </select>
              </div>
              <div>
                <label style={fieldLabelStyle}>Duracion</label>
                <input className="input-field" value={editing.duration} onChange={event => setEditing({ ...editing, duration: event.target.value })} placeholder="Ej: 9 min" />
              </div>
            </div>
            <label style={fieldLabelStyle}>Link del archivo</label>
            <input className="input-field" value={editing.url} onChange={event => setEditing({ ...editing, url: event.target.value })} placeholder="https://..." style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Peso del archivo</label>
            <input className="input-field" value={editing.size} onChange={event => setEditing({ ...editing, size: event.target.value })} placeholder="Ej: 14.7 MB" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Descripcion</label>
            <textarea className="input-field" rows={3} value={editing.description} onChange={event => setEditing({ ...editing, description: event.target.value })} placeholder="Descripcion interna del archivo" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Seleccionar archivo desde la computadora</label>
            <input type="file" accept="video/*,image/*" className="input-field" onChange={event => {
              const file = event.target.files?.[0];
              if (!file) return;
              setEditing({
                ...editing,
                name: editing.name || file.name,
                kind: file.type.startsWith('image') ? 'Image' : 'Video',
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
              });
            }} style={{ marginBottom: '1rem', paddingTop: '0.75rem' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_LABELS = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

// Mock contenido base (Lun/Mié/Vie)
const BASE_BLOQUES = [
  { dia: 'Lunes',     bloques: [
    { id:1, turno:'Mañana', horario:'08:00', empresa:'Global',        tipo:'Activación',   estado:'publicado'  },
    { id:2, turno:'Tarde',  horario:'15:00', empresa:'Global',        tipo:'Relajación',   estado:'publicado'  },
  ]},
  { dia: 'Miércoles', bloques: [
    { id:3, turno:'Mañana', horario:'08:00', empresa:'Empresa Alpha', tipo:'Postura',      estado:'programado' },
    { id:4, turno:'Tarde',  horario:'15:00', empresa:'Global',        tipo:'Respiración',  estado:'programado' },
  ]},
  { dia: 'Viernes',   bloques: [
    { id:5, turno:'Mañana', horario:'08:00', empresa:'Empresa Beta',  tipo:'Energía',      estado:'borrador'   },
    { id:6, turno:'Tarde',  horario:'15:00', empresa:'Global',        tipo:'Estiramiento', estado:'borrador'   },
  ]},
];

// Mock calendario mensual: días con contenido y sus mini-eventos
const EVENTOS_MES: Record<number, {horario:string; empresa:string}[]> = {
  5:  [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Global'}],
  7:  [{horario:'08:00', empresa:'Empresa Alpha'}, {horario:'15:00', empresa:'Global'}],
  9:  [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Empresa Beta'}],
  12: [{horario:'08:00', empresa:'Global'}],
  14: [{horario:'08:00', empresa:'Empresa Alpha'}, {horario:'15:00', empresa:'Global'}],
  16: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Global'}],
  19: [{horario:'08:00', empresa:'Empresa Beta'}],
  21: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Empresa Alpha'}],
  23: [{horario:'08:00', empresa:'Global'}],
  25: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Global'}],
  27: [{horario:'08:00', empresa:'Empresa Alpha'}, {horario:'15:00', empresa:'Global'}],
  29: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Empresa Beta'}],
};

function getCalDays(year:number, month:number) {
  const fd = new Date(year, month, 1).getDay();
  const off = fd === 0 ? 6 : fd - 1;
  const dim = new Date(year, month+1, 0).getDate();
  const cells:(number|null)[] = Array(off).fill(null);
  for (let d=1; d<=dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getLunesOfWeek(base:Date, offset:number) {
  const d = new Date(base);
  const day = d.getDay();
  d.setDate(d.getDate() + (day===0 ? -6 : 1-day) + offset*7);
  return d;
}

function fmt(d:Date) { return `${d.getDate()} ${MESES[d.getMonth()]}`; }

// Colores por empresa
const colorEmpresa: Record<string,{bg:string;text:string}> = {
  'Global':        {bg:'#f0fdfa', text:'#0d9488'},
  'Empresa Alpha': {bg:'#eff6ff', text:'#3b82f6'},
  'Empresa Beta':  {bg:'#faf5ff', text:'#a855f7'},
};

export const Contenido: React.FC = () => {
  const { empresas } = useEmpresas();
  const opcionesEmpresas = ['Todas las empresas', 'Global', ...empresas.map(e => e.nombre)];
  const opcionesEmpresasModal = ['Global (todas)', ...empresas.map(e => e.nombre)];

  const [adminSection, setAdminSection] = useState<AdminSection>('micro');
  const hoy = new Date();
  const [vista, setVista]          = useState<'semana'|'mes'>('semana');
  const [mes, setMes]              = useState(hoy.getMonth());
  const [anio, setAnio]            = useState(hoy.getFullYear());
  const [modal, setModal]          = useState(false);
  const [tipoLink, setTipoLink]    = useState<'link'|'upload'>('link');
  const [diaModal, setDiaModal]    = useState<number|null>(null);
  const [offsetSem, setOffset]     = useState(0);
  const [empresa, setEmpresa]      = useState('Todas las empresas');
  const [recordatorio, setRecordatorio] = useState('15 minutos antes');

  const lunes = getLunesOfWeek(hoy, offsetSem);
  const rangoLabel = (() => {
    const v = new Date(lunes); v.setDate(lunes.getDate()+4);
    return `${lunes.getDate()} – ${v.getDate()} ${MESES[v.getMonth()]} ${v.getFullYear()}`;
  })();

  const semana = useMemo(() => BASE_BLOQUES.map((d, i) => {
    const fecha = new Date(lunes); fecha.setDate(lunes.getDate() + [0,2,4][i]);
    const bloquesFiltrados = empresa === 'Todas las empresas'
      ? d.bloques
      : d.bloques.filter(b => b.empresa === empresa || b.empresa === 'Global' || empresa === 'Global');
    return { ...d, fecha: fmt(fecha), bloques: bloquesFiltrados };
  }), [offsetSem, empresa]);

  const calDays = getCalDays(anio, mes);

  const navMes = (dir:1|-1) => {
    if (dir===1 && mes===11) { setMes(0); setAnio(a=>a+1); }
    else if (dir===-1 && mes===0) { setMes(11); setAnio(a=>a-1); }
    else setMes(m=>m+dir);
  };

  const abrirModal = (dia?:number) => { setDiaModal(dia??null); setModal(true); };

  const btnNav = (onClick:()=>void, children:React.ReactNode) => (
    <button onClick={onClick} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',color:'#475569',display:'flex',alignItems:'center'}}>
      {children}
    </button>
  );

  if (adminSection === 'coach') {
    return (
      <div style={{animation:'fadeIn 0.3s ease-out'}}>
        <SectionTabs value={adminSection} onChange={setAdminSection} />
        <AdminCoachPanel />
      </div>
    );
  }

  if (adminSection === 'academy') {
    return (
      <div style={{animation:'fadeIn 0.3s ease-out'}}>
        <SectionTabs value={adminSection} onChange={setAdminSection} />
        <AdminAcademyPanel />
      </div>
    );
  }

  if (adminSection === 'media') {
    return (
      <div style={{animation:'fadeIn 0.3s ease-out'}}>
        <SectionTabs value={adminSection} onChange={setAdminSection} />
        <AdminMediaPanel />
      </div>
    );
  }

  return (
    <div style={{animation:'fadeIn 0.3s ease-out'}}>
      <SectionTabs value={adminSection} onChange={setAdminSection} />

      {/* ── Cabecera ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <h2 className="header-title" style={{marginBottom:'0.2rem'}}>Contenido</h2>
          <p className="text-muted" style={{margin:0,fontSize:'0.85rem'}}>Programa los videos de pausas activas</p>
        </div>

        <div style={{display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap'}}>
          {/* Filtro empresa */}
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'0.3rem 0.6rem 0.3rem 0.8rem'}}>
            <Filter size={14} color="#64748b" />
            <select
              value={empresa}
              onChange={e=>setEmpresa(e.target.value)}
              style={{border:'none',background:'transparent',fontSize:'0.82rem',fontWeight:600,color:'#1e293b',cursor:'pointer',outline:'none'}}
            >
              {opcionesEmpresas.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Toggle vista */}
          <div style={{display:'flex',backgroundColor:'#f1f5f9',borderRadius:'8px',padding:'3px',gap:'2px'}}>
            {(['semana','mes'] as const).map(v=>(
              <button key={v} onClick={()=>setVista(v)} style={{
                padding:'0.35rem 0.85rem',borderRadius:'6px',border:'none',fontSize:'0.78rem',fontWeight:600,cursor:'pointer',
                backgroundColor:vista===v?'white':'transparent',color:vista===v?'#0f172a':'#64748b',
                boxShadow:vista===v?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all 0.15s',
              }}>
                {v==='semana'?'📅 Semana':'🗓 Mes'}
              </button>
            ))}
          </div>

          <button onClick={()=>abrirModal()} className="btn-primary"
            style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.45rem 1rem',fontSize:'0.82rem'}}>
            <Video size={15}/> Nuevo Video
          </button>
        </div>
      </div>

      {/* ══ VISTA SEMANAL ══ */}
      {vista==='semana' && (
        <>
          {/* Navegación semana */}
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.25rem'}}>
            {btnNav(()=>setOffset(o=>o-1), <ChevronLeft size={16}/>)}
            <span style={{fontSize:'0.9rem',fontWeight:600,color:'#1e293b',minWidth:'220px',textAlign:'center'}}>{rangoLabel}</span>
            {btnNav(()=>setOffset(o=>o+1), <ChevronRight size={16}/>)}
            {offsetSem!==0 && (
              <button onClick={()=>setOffset(0)} style={{background:'none',border:'none',fontSize:'0.78rem',color:'#0d9488',fontWeight:600,cursor:'pointer',padding:0}}>
                Hoy
              </button>
            )}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem'}}>
            {semana.map(dia=>(
              <div key={dia.dia} style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
                <div style={{padding:'0.6rem 0',borderBottom:'2px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                  <h3 style={{margin:0,fontSize:'1rem',fontWeight:700,color:'#1e293b'}}>{dia.dia}</h3>
                  <span style={{fontSize:'0.78rem',color:'#94a3b8',fontWeight:500}}>{dia.fecha}</span>
                </div>

                {dia.bloques.length === 0
                  ? <div style={{padding:'1rem',borderRadius:'10px',border:'1px dashed #e2e8f0',textAlign:'center',color:'#cbd5e1',fontSize:'0.8rem'}}>Sin contenido</div>
                  : dia.bloques.map(bloque=>{
                    const col = colorEmpresa[bloque.empresa] ?? {bg:'#f8fafc',text:'#475569'};
                    return (
                      <div key={bloque.id} className="card" style={{padding:'1rem 1rem 1rem 1.3rem',margin:0,borderRadius:'10px',border:'1px solid #f1f5f9',boxShadow:'0 2px 8px rgba(0,0,0,0.03)',position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:0,left:0,width:'4px',height:'100%',backgroundColor:bloque.turno==='Mañana'?'#38bdf8':'#fbbf24'}}/>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.65rem'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                            <span style={{fontSize:'0.85rem',fontWeight:700,color:'#1e293b'}}>{bloque.turno}</span>
                            <span style={{fontSize:'0.68rem',backgroundColor:'#f1f5f9',color:'#475569',padding:'0.1rem 0.4rem',borderRadius:'1rem',fontWeight:600}}>{bloque.tipo}</span>
                          </div>
                          {bloque.estado==='publicado'  && <CheckCircle2 size={16} color="#10b981"/>}
                          {bloque.estado==='programado' && <Clock        size={16} color="#3b82f6"/>}
                          {bloque.estado==='borrador'   && <CircleDashed size={16} color="#cbd5e1"/>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',color:'#64748b',fontSize:'0.76rem'}}>
                            <Clock size={12}/><span>{bloque.horario} hs</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.76rem'}}>
                            <Building2 size={12} color="#64748b"/>
                            <span style={{backgroundColor:col.bg,color:col.text,padding:'0.1rem 0.45rem',borderRadius:'1rem',fontWeight:600,fontSize:'0.7rem'}}>{bloque.empresa}</span>
                          </div>
                        </div>
                        <div style={{marginTop:'0.65rem',paddingTop:'0.55rem',borderTop:'1px solid #f8fafc',textAlign:'right'}}>
                          <button onClick={()=>abrirModal()} style={{background:'none',border:'none',color:'#0d9488',fontSize:'0.76rem',fontWeight:600,cursor:'pointer',padding:0,display:'inline-flex',alignItems:'center',gap:'0.2rem'}}>
                            <Video size={12}/> Editar
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ VISTA MENSUAL ══ */}
      {vista==='mes' && (
        <div className="card" style={{padding:'1.5rem',margin:0,borderRadius:'14px',border:'1px solid #f1f5f9',boxShadow:'0 4px 20px rgba(0,0,0,0.03)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
            {btnNav(()=>navMes(-1), <ChevronLeft size={16}/>)}
            <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700,color:'#1e293b'}}>{MESES[mes]} {anio}</h3>
            {btnNav(()=>navMes(1),  <ChevronRight size={16}/>)}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'3px',marginBottom:'3px'}}>
            {DIAS_LABELS.map(d=>(
              <div key={d} style={{textAlign:'center',fontSize:'0.7rem',fontWeight:700,color:'#94a3b8',padding:'0.35rem 0',textTransform:'uppercase'}}>{d}</div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'3px'}}>
            {calDays.map((day, idx)=>{
              const eventos = day ? EVENTOS_MES[day] : undefined;
              const filtrados = eventos?.filter(e=>empresa==='Todas las empresas'||e.empresa===empresa||e.empresa==='Global');
              const tieneContenido = !!filtrados?.length;
              const esHoy = day===hoy.getDate() && mes===hoy.getMonth() && anio===hoy.getFullYear();
              return (
                <div key={idx} onClick={()=>day&&abrirModal(day)}
                  style={{
                    minHeight:'72px',borderRadius:'8px',padding:'0.3rem',
                    cursor:day?'pointer':'default',
                    backgroundColor:esHoy?'#0d9488':tieneContenido?'#f0fdfa':'transparent',
                    border:tieneContenido&&!esHoy?'1px solid #ccfbf1':'1px solid transparent',
                    transition:'background 0.15s',display:'flex',flexDirection:'column',gap:'2px',
                  }}>
                  {day && (
                    <>
                      <span style={{fontSize:'0.8rem',fontWeight:esHoy?700:500,color:esHoy?'white':tieneContenido?'#0d9488':'#64748b',lineHeight:1.2}}>{day}</span>
                      {filtrados?.slice(0,2).map((e,i)=>{
                        const col = colorEmpresa[e.empresa]??{bg:'#f1f5f9',text:'#475569'};
                        return (
                          <div key={i} style={{fontSize:'0.62rem',backgroundColor:esHoy?'rgba(255,255,255,0.2)':col.bg,color:esHoy?'white':col.text,borderRadius:'4px',padding:'1px 4px',fontWeight:600,lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {e.horario} — {e.empresa==='Global'?'General':e.empresa}
                          </div>
                        );
                      })}
                      {(filtrados?.length??0)>2 && (
                        <span style={{fontSize:'0.6rem',color:'#94a3b8'}}>+{filtrados!.length-2} más</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{marginTop:'1rem',paddingTop:'0.875rem',borderTop:'1px solid #f1f5f9',display:'flex',gap:'1.25rem',flexWrap:'wrap'}}>
            {Object.entries(colorEmpresa).map(([name,c])=>(
              <div key={name} style={{display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.75rem',color:'#64748b'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:c.text}}/>
                {name}
              </div>
            ))}
            <span style={{marginLeft:'auto',fontSize:'0.75rem',color:'#94a3b8'}}>Clic en un día para programar</span>
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {modal && (
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}
          style={{position:'fixed',inset:0,backgroundColor:'rgba(15,23,42,0.35)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{backgroundColor:'white',borderRadius:'16px',padding:'1.75rem',width:'460px',maxWidth:'95vw',boxShadow:'0 20px 60px rgba(0,0,0,0.15)',animation:'fadeIn 0.2s ease-out'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
              <div>
                <h3 style={{margin:0,fontSize:'1.05rem',fontWeight:700,color:'#1e293b'}}>Programar Video</h3>
                <p style={{margin:'0.15rem 0 0',fontSize:'0.8rem',color:'#94a3b8'}}>
                  {diaModal?`${diaModal} de ${MESES[mes]}`:'Nuevo contenido'}
                </p>
              </div>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8'}}><X size={20}/></button>
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={{fontSize:'0.75rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.4rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Tipo de contenido</label>
              <div style={{display:'flex',gap:'0.5rem'}}>
                {(['link','upload'] as const).map(t=>(
                  <button key={t} onClick={()=>setTipoLink(t)} style={{
                    flex:1,padding:'0.55rem',borderRadius:'8px',cursor:'pointer',
                    border:`1.5px solid ${tipoLink===t?'#0d9488':'#e2e8f0'}`,
                    backgroundColor:tipoLink===t?'#f0fdfa':'white',
                    color:tipoLink===t?'#0d9488':'#64748b',fontWeight:600,fontSize:'0.8rem',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:'0.35rem',transition:'all 0.15s',
                  }}>
                    {t==='link'?<><Link size={14}/>Link externo</>:<><Upload size={14}/>Subir video</>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'0.9rem'}}>
              {tipoLink==='link'
                ? <input type="url" className="input-field" placeholder="https://vimeo.com/..." style={{fontSize:'0.875rem'}}/>
                : <div style={{border:'2px dashed #e2e8f0',borderRadius:'10px',padding:'1.25rem',textAlign:'center',cursor:'pointer',color:'#94a3b8',fontSize:'0.82rem'}}>
                    <Upload size={22} style={{marginBottom:'0.35rem',display:'block',margin:'0 auto 0.35rem'}}/>
                    Arrastrá o hacé clic para subir
                  </div>
              }
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.65rem',marginBottom:'0.9rem'}}>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Tipo de pausa</label>
                <select className="input-field" style={{fontSize:'0.875rem'}}>
                  {['Activación','Relajación','Postura','Respiración','Energía','Estiramiento'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Empresa</label>
                <select className="input-field" style={{fontSize:'0.875rem'}}>
                  {opcionesEmpresasModal.map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.65rem',marginBottom:'1.25rem'}}>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Fecha</label>
                <input type="date" className="input-field" defaultValue={diaModal?`${anio}-${String(mes+1).padStart(2,'0')}-${String(diaModal).padStart(2,'0')}`:''} style={{fontSize:'0.875rem'}}/>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Turno</label>
                <select className="input-field" style={{fontSize:'0.875rem'}}><option>Mañana</option><option>Tarde</option></select>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Hora</label>
                <input type="time" className="input-field" defaultValue="08:00" style={{fontSize:'0.875rem'}}/>
              </div>
            </div>

            <div style={{marginBottom:'1.25rem'}}>
              <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Enviar recordatorio (Email Automático)</label>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                <select className="input-field" value={recordatorio} onChange={e=>setRecordatorio(e.target.value)} style={{fontSize:'0.875rem',flex:1,minWidth:'150px'}}>
                  <option value="Sin recordatorio">Sin recordatorio</option>
                  <option value="15 minutos antes">15 minutos antes</option>
                  <option value="30 minutos antes">30 minutos antes</option>
                  <option value="1 hora antes">1 hora antes</option>
                  <option value="2 horas antes">2 horas antes</option>
                  <option value="Personalizado">Personalizado...</option>
                </select>
                {recordatorio === 'Personalizado' && (
                  <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flex:1,minWidth:'120px'}}>
                    <input type="number" className="input-field" placeholder="Minutos" style={{fontSize:'0.875rem',width:'80px'}}/>
                    <span style={{fontSize:'0.8rem',color:'#64748b'}}>min. antes</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{display:'flex',gap:'0.65rem'}}>
              <button onClick={()=>setModal(false)} className="btn-secondary" style={{flex:1,fontSize:'0.875rem'}}>Cancelar</button>
              <button className="btn-primary" style={{flex:2,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem',fontSize:'0.875rem'}}>
                <Save size={15}/> Guardar programación
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

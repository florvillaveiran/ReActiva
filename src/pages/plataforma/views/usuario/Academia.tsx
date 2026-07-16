import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Clock, GraduationCap, Lock, Play, Search, Sparkles, Star, X } from 'lucide-react';
import { AcademyItem, fetchContentLibrary, getContentLibrary, isAcademyItemPublished } from '../../data/contentLibrary';
import { getYouTubeIdFromUrl } from '../../lib/scheduledVideos';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const isPublished = (item: AcademyItem) => isAcademyItemPublished(item);

const academyEmbedUrl = (url: string) => {
  const youtubeId = getYouTubeIdFromUrl(url);
  return youtubeId ? `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1` : null;
};

const demoVideoUrls = [
  '/demo-videos/01-lunes-manana.mp4',
  '/demo-videos/02-lunes-tarde.mp4',
  '/demo-videos/03-miercoles-manana.mp4',
  '/demo-videos/04-miercoles-tarde.mp4',
  '/demo-videos/05-viernes-manana.mp4',
  '/demo-videos/06-viernes-tarde.mp4',
];

const demoAcademyFallback: AcademyItem[] = [
  { id: 'demo-silla-ergonomica', category: 'Ergonomía', title: 'Silla ergonómica', description: 'Cómo regular tu silla para cuidar espalda, cuello y hombros.', duration: '1 min', level: 'Basico', image: '/academy-covers/silla-ergonomica.jpg', videoUrl: demoVideoUrls[1], active: true },
  { id: 'demo-posiciones-homeoffice', category: 'Ergonomía', title: 'Diferentes posiciones para trabajar home office', description: 'Alternativas para trabajar desde casa sin sobrecargar el cuerpo.', duration: '1 min', level: 'Basico', image: '/academy-covers/posicion-homeoffice.jpg', videoUrl: demoVideoUrls[2], active: true },
  { id: 'demo-checklist-ergonomico', category: 'Ergonomía', title: 'Checklist ergonómico en 40 seg', description: 'Ajustes simples para revisar tu puesto de trabajo.', duration: '40 seg', level: 'Basico', image: '/academy-covers/checklist-ergonomico.jpg', videoUrl: demoVideoUrls[0], active: true },
  { id: 'demo-ciatico', category: 'Stretching', title: 'Irritación del nervio ciático', description: 'Movilidad suave para descargar la zona lumbar.', duration: '2 min', level: 'Intermedio', image: '/academy-covers/dolor-espalda-ciatico.jpg', videoUrl: demoVideoUrls[1], active: true },
  { id: 'demo-cadena-posterior', category: 'Stretching', title: 'Elongación de cadena posterior', description: 'Una pausa para liberar isquios, espalda y pantorrillas.', duration: '2 min', level: 'Basico', image: '/academy-covers/elongar-cadena-posterior.jpg', videoUrl: demoVideoUrls[2], active: true },
  { id: 'demo-psoas', category: 'Stretching', title: 'Liberación de flexores de cadera', description: 'Ejercicios para compensar muchas horas sentado.', duration: '2 min', level: 'Intermedio', image: '/academy-covers/elongar-psoas.jpg', videoUrl: demoVideoUrls[3], active: true },
  { id: 'demo-esguince', category: 'Dolor musculoesquelético', title: 'Esguince de tobillo', description: 'Qué hacer y qué evitar frente a una torcedura.', duration: '1 min 18 seg', level: 'Basico', image: '/academy-covers/esguince-tobillo.jpg', videoUrl: demoVideoUrls[4], active: true },
  { id: 'demo-ejercicios-tobillo', category: 'Dolor musculoesquelético', title: 'Ejercicios de tobillo', description: 'Movilidad progresiva para recuperar confianza.', duration: '2 min', level: 'Basico', image: '/academy-covers/ejercicios-tobillo.jpg', videoUrl: demoVideoUrls[5], active: true },
  { id: 'demo-hidratacion', category: 'Hidratación', title: 'Hidratación durante la jornada', description: 'Cómo sostener energía y foco con un hábito simple.', duration: '1 min', level: 'Basico', image: '/academy-covers/hidratacion.jpg', videoUrl: demoVideoUrls[0], active: true },
  { id: 'demo-joroba-cervical', category: 'Postura', title: 'Joroba cervical', description: 'Señales y ejercicios para mejorar la postura cervical.', duration: '2 min', level: 'Intermedio', image: '/academy-covers/joroba-cervical.jpg', videoUrl: demoVideoUrls[1], active: true },
  { id: 'demo-espalda', category: 'Dolor musculoesquelético', title: 'No destruyas tu espalda', description: 'Cómo levantar objetos sin sobrecargar la zona lumbar.', duration: '1 min', level: 'Basico', image: '/academy-covers/levantar-objeto.jpg', videoUrl: demoVideoUrls[2], active: true },
  { id: 'demo-mouse', category: 'Dolor musculoesquelético', title: 'Mouse y dolor de muñeca', description: 'Tips para cuidar muñeca y antebrazo.', duration: '1 min', level: 'Basico', image: '/academy-covers/mouse.jpg', videoUrl: demoVideoUrls[3], active: true },
  { id: 'demo-pantalla', category: 'Salud visual', title: 'Mucha pantalla para tus ojos', description: 'Pausas visuales para reducir fatiga ocular.', duration: '1 min', level: 'Basico', image: '/academy-covers/mucha-pantalla.jpg', videoUrl: demoVideoUrls[4], active: true },
  { id: 'demo-rutina-suave', category: 'Stretching', title: 'Rutina suave antes del café', description: 'Activación liviana para empezar el día con movilidad.', duration: '2 min', level: 'Basico', image: '/academy-covers/rutina-suave.jpg', videoUrl: demoVideoUrls[5], active: true },
];

export const UsuarioAcademia: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<AcademyItem | null>(null);
  const [expandedDemoCategory, setExpandedDemoCategory] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const applyLibrary = (library = getContentLibrary()) => {
      if (!mounted) return;
      setVersion(value => value + 1);
      setSelected(current => {
        if (!current) return null;
        const updated = library.academy.find(item => item.id === current.id || item.sourceId === current.sourceId);
        return updated && isPublished(updated) ? updated : null;
      });
    };
    const refreshRemote = () => void fetchContentLibrary().then(applyLibrary);
    const refreshLocal = () => applyLibrary();

    refreshRemote();
    window.addEventListener('focus', refreshRemote);
    window.addEventListener('reactiva-content-library-updated', refreshLocal);

    const channel = supabase
      ? supabase
          .channel('user-reactiva-academy')
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

  const libraryItems = useMemo(() => getContentLibrary().academy, [version]);
  const items = useMemo(
    () => user?.isDemo && libraryItems.filter(isPublished).length === 0 ? demoAcademyFallback : libraryItems,
    [libraryItems, user?.isDemo],
  );
  const publishedCount = useMemo(() => items.filter(isPublished).length, [items]);
  const categories = useMemo(() => ['Todos', ...Array.from(new Set(items.map(item => item.category)))], [items]);

  useEffect(() => {
    if (category !== 'Todos' && !categories.includes(category)) setCategory('Todos');
  }, [categories, category]);

  const filtered = items
    .filter(item => {
      const matchesCategory = category === 'Todos' || item.category === category;
      const normalized = query.trim().toLowerCase();
      const matchesQuery = !normalized || [item.title, item.description, item.category].some(value => value.toLowerCase().includes(normalized));
      return matchesCategory && matchesQuery;
    })
    .sort((left, right) => Number(isPublished(right)) - Number(isPublished(left)));

  const demoCategories = Array.from(
    filtered.filter(isPublished).reduce((acc, item) => {
      const list = acc.get(item.category) ?? [];
      list.push(item);
      acc.set(item.category, list);
      return acc;
    }, new Map<string, AcademyItem[]>()),
  ).sort(([left], [right]) => left.localeCompare(right));

  const renderAcademyCard = (item: AcademyItem) => {
    const published = isPublished(item);
    return (
      <article className="user-academy-card" key={item.id} style={{ background: 'white', border: published && item.recommended ? '1.5px solid var(--primary-color)' : '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: published && item.recommended ? '0 12px 26px rgba(0,194,168,0.12)' : '0 10px 24px rgba(15,23,42,0.05)' }}>
        <div className="user-academy-media" style={{ height: 118, background: published ? `linear-gradient(180deg, rgba(15,23,42,0.18), rgba(15,23,42,0.18)), url(${item.image}) center/cover` : 'linear-gradient(135deg, #f8fafc, #eef2f7)', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 12, left: 12, background: 'white', color: '#1e293b', borderRadius: 999, padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 900 }}>{item.category}</span>
          {published && item.recommended && <span style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--primary-color)', color: 'white', borderRadius: 999, padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 900 }}><Sparkles size={12} /> Recomendado</span>}
          {!published && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 7, color: '#94a3b8' }}>
              <Lock size={25} />
              <span style={{ fontSize: '0.74rem', fontWeight: 900, letterSpacing: '0.04em' }}>PRÓXIMAMENTE</span>
            </div>
          )}
        </div>
        <div className="user-academy-card-body" style={{ padding: '1rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#020617', fontSize: '1.02rem', lineHeight: 1.18, fontWeight: 900 }}>{item.title}</h2>
          <p style={{ minHeight: 42, margin: '0 0 0.9rem', color: '#64748b', lineHeight: 1.4, fontSize: '0.86rem' }}>{item.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: '0.9rem', fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {item.duration}</span>
            <span style={{ color: '#cbd5e1' }}>-</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Star size={14} /> {item.level}</span>
          </div>
          <div style={{ height: 1, background: '#eef2f7', marginBottom: '0.9rem' }} />
          <button type="button" onClick={() => published && setSelected(item)} disabled={!published} style={{ width: '100%', height: 42, borderRadius: 12, border: published && item.recommended ? 'none' : '1px solid #e2e8f0', background: published && item.recommended ? 'var(--primary-color)' : published ? 'white' : '#f8fafc', color: published && item.recommended ? 'white' : published ? '#020617' : '#94a3b8', fontWeight: 900, fontSize: '0.82rem', cursor: published ? 'pointer' : 'not-allowed', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            {published ? <><Play size={14} fill="currentColor" /> Ver taller</> : <><Lock size={14} /> Bloqueado</>}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="user-academy-page" style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '2rem' }}>
      <header className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: '#d9fbf3', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={21} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#020617', fontSize: '1.65rem', fontWeight: 900 }}>Academia ReActiva</h1>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.92rem', maxWidth: 520 }}>Aprendé a cuidar tu bienestar con contenidos prácticos desarrollados por profesionales.</p>
          </div>
        </div>
        <div style={{ minWidth: 160 }}>
          <p style={{ margin: '0 0 0.35rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 800 }}>Contenido disponible: <span style={{ color: 'var(--primary-color)' }}>{publishedCount} de {items.length}</span></p>
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999 }} />
        </div>
      </header>

      <div className="user-academy-search" style={{ position: 'relative', maxWidth: 420, marginBottom: '0.9rem' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: 13, left: 13 }} />
        <input className="input-field" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por título o palabra clave..." style={{ height: 44, borderRadius: 12, paddingLeft: 38, fontSize: '0.88rem' }} />
      </div>

      <div className="user-academy-categories" style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {categories.map(item => (
          <button key={item} type="button" onClick={() => setCategory(item)} style={{ border: '1px solid #e2e8f0', borderRadius: 999, padding: '0.34rem 0.7rem', background: category === item ? 'var(--primary-color)' : 'white', color: category === item ? 'white' : '#64748b', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
            {item}
          </button>
        ))}
      </div>

      {user?.isDemo ? (
        <section style={{ display: 'grid', gap: '0.85rem' }}>
          {demoCategories.map(([name, list]) => {
            const open = expandedDemoCategory === name;
            return (
              <div key={name} className="card" style={{ margin: 0, padding: 0, overflow: 'hidden', borderRadius: 14 }}>
                <button
                  type="button"
                  onClick={() => setExpandedDemoCategory(open ? null : name)}
                  style={{ width: '100%', minHeight: 76, padding: '1rem 1.25rem', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '1.02rem', marginBottom: 4 }}>{name}</strong>
                    <span style={{ color: '#64748b', fontWeight: 800, fontSize: '0.84rem' }}>{list.length} {list.length === 1 ? 'video' : 'videos'} <span style={{ color: '#cbd5e1', margin: '0 0.4rem' }}>-</span><span style={{ color: 'var(--primary-color)' }}>Activa</span></span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--primary-color)', fontWeight: 900, fontSize: '0.86rem' }}>
                    Ver videos <ChevronRight size={18} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s ease' }} />
                  </span>
                </button>
                {open && (
                  <div style={{ borderTop: '1px solid #eef2f7', padding: '1rem 1.25rem 1.25rem', background: '#f8fafc' }}>
                    <div className="user-academy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '1rem' }}>
                      {list.map(renderAcademyCard)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ) : (
        <section className="user-academy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '1rem' }}>
          {filtered.map(renderAcademyCard)}
        </section>
      )}

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: 860, maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: 18, boxShadow: '0 24px 70px rgba(15,23,42,0.24)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.1rem', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <span style={{ display: 'inline-flex', marginBottom: '0.45rem', background: '#ecfdf5', color: 'var(--primary-color)', borderRadius: 999, padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontWeight: 900 }}>{selected.category}</span>
                <h2 style={{ margin: 0, color: '#020617', fontSize: '1.25rem', lineHeight: 1.2 }}>{selected.title}</h2>
              </div>
              <button type="button" title="Cerrar" onClick={() => setSelected(null)} style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem' }}>
              {selected.videoUrl ? (
                academyEmbedUrl(selected.videoUrl) ? (
                  <iframe
                    title={selected.title}
                    src={academyEmbedUrl(selected.videoUrl) ?? ''}
                    style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 14, background: '#0f172a' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selected.videoUrl}
                    poster={selected.image}
                    controls
                    style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 14, background: '#0f172a', objectFit: 'cover' }}
                  />
                )
              ) : (
                <div style={{ minHeight: 320, borderRadius: 14, background: `linear-gradient(rgba(15,23,42,0.16), rgba(15,23,42,0.22)), url(${selected.image}) center/cover`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '1rem' }}>
                  <div>
                    <Play size={34} />
                    <p style={{ margin: '0.6rem 0 0', fontWeight: 900 }}>Este taller todavía no tiene video cargado.</p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem', color: '#64748b', fontSize: '0.84rem', fontWeight: 800 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {selected.duration}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Star size={14} /> {selected.level}</span>
              </div>
              <p style={{ margin: '0.85rem 0 0', color: '#475569', lineHeight: 1.55 }}>{selected.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

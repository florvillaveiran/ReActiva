import React, { useEffect, useState, useMemo } from 'react';
import { Clock, Video, Building2, CheckCircle2, CircleDashed, ChevronLeft, ChevronRight, X, Link, Upload, Save, Filter, Eye, Pencil, Trash2, CalendarCheck, Droplets, Leaf, Lightbulb, Moon, Monitor, Search, Settings, Sparkles, Star, Zap, FileImage, FileVideo, Info, Plus } from 'lucide-react';
import { AcademyItem, CoachItem, deleteAcademyItem, deleteCoachItem, fetchAcademyCategories, fetchContentLibrary, getContentLibrary, isAcademyVideoReady, normalizeAcademyCategory, normalizeAcademyVideoUrl, removeAcademyCategory, removeContentItemFromSupabase, renameAcademyCategory, saveAcademyCategory, saveAcademyItem, saveCoachItem } from '../../data/contentLibrary';
import { useEmpresas } from '../../context/EmpresasContext';
import { fetchVideoUnlockSchedule, loadVideoUnlockSchedule, persistVideoUnlockSchedule, UNLOCK_LEAD_MINUTES, UnlockBlock, UnlockDay, VideoUnlockItem } from '../../lib/videoUnlockSchedule';
import { fetchScheduledVideos, getYouTubeIdFromUrl, saveScheduledVideo, ScheduledVideo, SCHEDULED_VIDEOS_EVENT } from '../../lib/scheduledVideos';
import { supabase } from '../../lib/supabase';
import { uploadResumableStorageFile } from '../../lib/resumableStorageUpload';

type AdminSection = 'micro' | 'coach' | 'academy' | 'media';

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  color: '#334155',
  fontSize: '0.82rem',
  fontWeight: 800,
  margin: '0 0 0.35rem 0.15rem',
};

const hasAcademyVideo = (item: AcademyItem) => isAcademyVideoReady(item.videoUrl);

const academyVideoEmbedUrl = (url: string) => {
  const youtubeId = getYouTubeIdFromUrl(url);
  return youtubeId ? `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1` : null;
};

const ACADEMY_CATEGORIES_STORAGE_KEY = 'reactiva-academy-custom-categories';
const UNCATEGORIZED_ACADEMY_LABEL = 'Sin categoría';

const readCustomAcademyCategories = (): string[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(ACADEMY_CATEGORIES_STORAGE_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter(value => typeof value === 'string' && value.trim()).map(normalizeAcademyCategory)
      : [];
  } catch {
    return [];
  }
};

const saveCustomAcademyCategories = (categories: string[]) => {
  localStorage.setItem(ACADEMY_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

const categoryKey = (value: string) => value.trim().toLocaleLowerCase('es');

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
  useEffect(() => {
    const refresh = () => void fetchContentLibrary().then(library => setItems(library.coach));
    refresh();
    const channel = supabase
      ? supabase.channel('admin-reactiva-tips').on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, refresh).subscribe()
      : null;
    return () => { if (channel && supabase) void supabase.removeChannel(channel); };
  }, []);

  const save = async () => {
    if (!editing) return;
    const result = await saveCoachItem(editing);
    if (!result.ok) {
      window.alert(result.error?.message ?? 'No pudimos guardar el consejo.');
      return;
    }
    setEditing(null);
    fetchContentLibrary().then(library => setItems(library.coach));
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
          <span>RECOMENDACIÓN PARA HOY</span>
        </div>
        <p style={{ margin: 0, color: '#020617', fontSize: '0.98rem', fontWeight: 800 }}>Cada 20 minutos, mirá algo a 20 pies (6 metros) de distancia durante 20 segundos.</p>
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
              <p style={{ margin: '0 0 0.3rem', color: 'var(--primary-color)', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.04em' }}>RECOMENDACIÓN</p>
              <p style={{ margin: 0, color: '#020617', fontSize: '0.88rem', lineHeight: 1.35 }}>{item.recommendation}</p>
            </div>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.86rem' }}>{item.tags.map(tag => `◇ ${tag}`).join('  ')}</p>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem' }}>
              <button className="btn-primary" onClick={() => window.alert(`${item.title}\n\n${item.recommendation}`)} style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}>Ver consejo</button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button title="Editar" onClick={() => setEditing(item)} style={{ color: 'var(--primary-color)' }}><Pencil size={17} /></button>
                <button title="Eliminar" onClick={async () => { if (window.confirm('¿Deseás eliminar este consejo?')) { const result = await removeContentItemFromSupabase(item.id); if (!result.ok) { window.alert(result.error?.message ?? 'No pudimos eliminar el consejo.'); return; } deleteCoachItem(item.id); reload(); } }} style={{ color: '#020617' }}><Trash2 size={17} /></button>
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
            <label style={fieldLabelStyle}>Categoría / nombre del consejo</label>
            <input className="input-field" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Descripción de la tarjeta</label>
            <textarea className="input-field" rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Recomendación principal</label>
            <textarea className="input-field" rows={3} value={editing.recommendation} onChange={e => setEditing({ ...editing, recommendation: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Título del detalle</label>
            <input className="input-field" value={editing.detailTitle} onChange={e => setEditing({ ...editing, detailTitle: e.target.value })} placeholder="Título del detalle" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Subtítulo del detalle</label>
            <input className="input-field" value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Subtítulo del detalle" style={{ marginBottom: '0.7rem' }} />
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
            <label style={fieldLabelStyle}>Por qué importa</label>
            <textarea className="input-field" rows={3} value={editing.why} onChange={e => setEditing({ ...editing, why: e.target.value })} placeholder="Por qué importa" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Evidencia</label>
            <textarea className="input-field" rows={3} value={editing.evidence} onChange={e => setEditing({ ...editing, evidence: e.target.value })} placeholder="Evidencia" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Cómo aplicarlo hoy</label>
            <textarea className="input-field" rows={3} value={editing.steps.join('\n')} onChange={e => setEditing({ ...editing, steps: e.target.value.split('\n').filter(Boolean) })} placeholder="Cómo aplicarlo hoy (una línea por paso)" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Señales</label>
            <textarea className="input-field" rows={3} value={editing.signals.join('\n')} onChange={e => setEditing({ ...editing, signals: e.target.value.split('\n').filter(Boolean) })} placeholder="Señales (una línea por señal)" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Mini desafío</label>
            <textarea className="input-field" rows={2} value={editing.challenge} onChange={e => setEditing({ ...editing, challenge: e.target.value })} placeholder="Mini desafío" style={{ marginBottom: '0.7rem' }} />
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
  const [creating, setCreating] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => readMediaItems());
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState<AcademyItem | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [customCategories, setCustomCategories] = useState<string[]>(readCustomAcademyCategories);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const reload = () => setItems(getContentLibrary().academy);
  useEffect(() => {
    const refresh = () => {
      void fetchContentLibrary().then(library => setItems(library.academy));
      void fetchMediaItems().then(setMediaItems);
      void fetchAcademyCategories().then(setCustomCategories);
    };
    refresh();
    const channel = supabase
      ? supabase
          .channel('admin-reactiva-academy')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, refresh)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'content_categories' }, refresh)
          .subscribe()
      : null;
    return () => { if (channel && supabase) void supabase.removeChannel(channel); };
  }, []);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    [...items.map(item => item.category), ...customCategories].forEach((value) => {
      const trimmed = value.trim();
      if (trimmed) unique.set(categoryKey(trimmed), trimmed);
    });
    return Array.from(unique.values()).sort((left, right) => left.localeCompare(right, 'es'));
  }, [customCategories, items]);

  useEffect(() => {
    if (categoryFilter !== 'Todos' && !categories.some(category => categoryKey(category) === categoryKey(categoryFilter))) {
      setCategoryFilter('Todos');
    }
  }, [categories, categoryFilter]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return items
      .filter((item) => {
        const matchesCategory = categoryFilter === 'Todos' || categoryKey(item.category) === categoryKey(categoryFilter);
        const matchesQuery = !normalizedQuery || [item.title, item.description, item.category]
          .some(value => value.toLocaleLowerCase('es').includes(normalizedQuery));
        return matchesCategory && matchesQuery;
      })
      .sort((left, right) => Number(right.active && hasAcademyVideo(right)) - Number(left.active && hasAcademyVideo(left)));
  }, [categoryFilter, items, query]);

  const persistCustomCategories = (next: string[]) => {
    const unique = Array.from(new Map(next.map(value => {
      const normalized = normalizeAcademyCategory(value);
      return [categoryKey(normalized), normalized];
    })).values()).filter(Boolean);
    setCustomCategories(unique);
    saveCustomAcademyCategories(unique);
  };

  const createCategory = async () => {
    const name = normalizeAcademyCategory(newCategory);
    if (!name) return;
    const existing = categories.find(category => categoryKey(category) === categoryKey(name));
    if (existing) {
      setCategoryFilter(existing);
      setEditing(current => current ? { ...current, category: existing } : current);
      setNewCategory('');
      return;
    }
    const result = await saveAcademyCategory(name);
    if (!result.ok) {
      window.alert(result.error?.message ?? 'No pudimos crear la categoria.');
      return;
    }
    const remoteCategories = await fetchAcademyCategories();
    persistCustomCategories(remoteCategories);
    setCategoryFilter(name);
    setEditing(current => current ? { ...current, category: name } : current);
    setNewCategory('');
  };

  const renameCategory = async () => {
    const oldName = editingCategory;
    const nextName = normalizeAcademyCategory(editingCategoryName);
    if (!oldName || !nextName || categoryKey(oldName) === categoryKey(nextName)) {
      setEditingCategory('');
      return;
    }
    const collision = categories.some(category => categoryKey(category) === categoryKey(nextName) && categoryKey(category) !== categoryKey(oldName));
    if (collision) {
      window.alert('Ya existe una categoría con ese nombre.');
      return;
    }

    setSavingCategory(true);
    try {
      const affectedItems = items.filter(item => categoryKey(item.category) === categoryKey(oldName));
      for (const item of affectedItems) {
        const result = await saveAcademyItem({ ...item, category: nextName });
        if (!result.ok) throw result.error;
      }
      const categoryResult = await renameAcademyCategory(oldName, nextName);
      if (!categoryResult.ok) throw categoryResult.error;
      persistCustomCategories(await fetchAcademyCategories());
      const library = await fetchContentLibrary();
      setItems(library.academy);
      if (categoryFilter === oldName) setCategoryFilter(nextName);
      setEditing(current => current && categoryKey(current.category) === categoryKey(oldName) ? { ...current, category: nextName } : current);
      setEditingCategory('');
      setEditingCategoryName('');
    } catch (error: any) {
      window.alert(error?.message ?? 'No pudimos actualizar la categoría.');
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (category: string) => {
    if (categoryKey(category) === categoryKey(UNCATEGORIZED_ACADEMY_LABEL)) {
      window.alert(`La categoría "${UNCATEGORIZED_ACADEMY_LABEL}" se utiliza para conservar talleres que quedaron sin categoría y no se puede eliminar.`);
      return;
    }

    const affectedItems = items.filter(item => categoryKey(item.category) === categoryKey(category));
    const confirmation = affectedItems.length > 0
      ? `¿Eliminar la categoría "${category}"? Sus ${affectedItems.length} ${affectedItems.length === 1 ? 'taller pasará' : 'talleres pasarán'} a "${UNCATEGORIZED_ACADEMY_LABEL}".`
      : `¿Eliminar la categoría "${category}"?`;
    if (!window.confirm(confirmation)) return;

    setSavingCategory(true);
    try {
      for (const item of affectedItems) {
        const result = await saveAcademyItem({ ...item, category: UNCATEGORIZED_ACADEMY_LABEL });
        if (!result.ok) throw result.error;
      }
      const categoryResult = await removeAcademyCategory(category, UNCATEGORIZED_ACADEMY_LABEL);
      if (!categoryResult.ok) throw categoryResult.error;
      persistCustomCategories(await fetchAcademyCategories());

      const library = await fetchContentLibrary();
      setItems(library.academy);
      if (categoryKey(categoryFilter) === categoryKey(category)) setCategoryFilter('Todos');
      setEditing(current => current && categoryKey(current.category) === categoryKey(category)
        ? { ...current, category: UNCATEGORIZED_ACADEMY_LABEL }
        : current);
      if (editingCategory === category) {
        setEditingCategory('');
        setEditingCategoryName('');
      }
    } catch (error: any) {
      window.alert(error?.message ?? 'No pudimos eliminar la categoría.');
    } finally {
      setSavingCategory(false);
    }
  };

  const openEditor = (item: AcademyItem) => {
    setVideoFile(null);
    setCreating(false);
    setEditing({ ...item, active: item.active && hasAcademyVideo(item) });
  };

  const openCreateEditor = () => {
    const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `academy-${crypto.randomUUID()}`
      : `academy-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setVideoFile(null);
    setCreating(true);
    setEditing({
      id: generatedId,
      sourceId: generatedId,
      category: categories[0] ?? UNCATEGORIZED_ACADEMY_LABEL,
      title: '',
      description: '',
      duration: '10 min',
      level: 'Basico',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1400',
      videoUrl: undefined,
      recommended: false,
      active: false,
    });
  };

  const closePreview = () => {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl('');
    setPreviewError('');
    setPreviewing(null);
  };

  const openPreview = (item: AcademyItem, file?: File | null) => {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    const localUrl = file ? URL.createObjectURL(file) : '';
    const videoUrl = localUrl || normalizeAcademyVideoUrl(item.videoUrl);
    if (!videoUrl) {
      window.alert('Subí o seleccioná un video para ver la vista previa.');
      return;
    }
    setPreviewObjectUrl(localUrl);
    setPreviewError('');
    setPreviewing({ ...item, videoUrl });
  };

  const uploadAcademyVideo = async (file: File) => {
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'mp4';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const path = `academy-videos/${Date.now()}-${fileSafe(baseName)}.${extension}`;
    return uploadResumableStorageFile({
      bucket: 'reactiva-media',
      path,
      file,
      onProgress: setUploadProgress,
    });
  };

  const publishAcademyItem = async (item: AcademyItem) => {
    if (!hasAcademyVideo(item)) {
      window.alert('Este taller todavía no tiene un video válido. Cargalo o seleccionalo desde la Biblioteca Multimedia antes de publicar.');
      return;
    }

    setPublishingId(item.id);
    try {
      const result = await saveAcademyItem({ ...item, active: true });
      if (!result.ok) throw result.error;
      const library = await fetchContentLibrary();
      setItems(library.academy);
    } catch (error: any) {
      window.alert(error?.message ?? 'No pudimos publicar el taller.');
    } finally {
      setPublishingId(null);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      window.alert('Ingresá un título para crear el video.');
      return;
    }
    if (editing.active && !hasAcademyVideo(editing) && !videoFile) {
      window.alert('Para publicar el taller primero tenés que subir o seleccionar un video.');
      return;
    }

    setUploading(true);
    setUploadProgress(videoFile ? 0 : null);
    try {
      const finalVideoUrl = videoFile ? await uploadAcademyVideo(videoFile) : editing.videoUrl?.trim();
      const finalItem = { ...editing, videoUrl: finalVideoUrl || undefined };
      const result = await saveAcademyItem(finalItem);
      if (!result.ok) {
        window.alert(result.error?.message ?? 'No pudimos guardar el taller.');
        return;
      }
      setEditing(null);
      setCreating(false);
      setVideoFile(null);
      fetchContentLibrary().then(library => setItems(library.academy));
    } catch (error: any) {
      window.alert(error?.message ?? 'No pudimos subir o guardar el taller.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 className="header-title" style={{ marginBottom: '0.25rem' }}>Academia ReActiva</h2>
          <p className="text-muted" style={{ margin: 0 }}>Mismos talleres que ve el usuario.</p>
        </div>
        <div style={{ minWidth: 160 }}>
          <p style={{ margin: '0 0 0.35rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 800 }}>Publicados: <span style={{ color: 'var(--primary-color)' }}>{items.filter(item => item.active && hasAcademyVideo(item)).length} de {items.length}</span></p>
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999 }} />
        </div>
      </header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 420, maxWidth: '100%' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: 13, left: 13 }} />
          <input className="input-field" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por título o palabra clave..." style={{ height: 44, borderRadius: 12, paddingLeft: 38, fontSize: '0.88rem' }} />
        </div>
        <button className="btn-secondary" onClick={() => setCategoryManagerOpen(true)} style={{ height: 44, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Settings size={16} /> Gestionar categorías</button>
        <button className="btn-primary" onClick={openCreateEditor} style={{ height: 44, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Plus size={17} /> Crear video</button>
      </div>
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['Todos', ...categories].map(category => (
          <button key={category} type="button" onClick={() => setCategoryFilter(category)} style={{ border: '1px solid #e2e8f0', borderRadius: 999, padding: '0.34rem 0.7rem', background: categoryFilter === category ? 'var(--primary-color)' : 'white', color: categoryFilter === category ? 'white' : '#64748b', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>{category}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '1rem' }}>
        {filteredItems.map(item => {
          const hasVideo = hasAcademyVideo(item);
          const published = item.active && hasVideo;
          return (
          <article key={item.id} className="card" style={{ margin: 0, padding: '0 1rem 1rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 24px rgba(15,23,42,0.05)', border: item.recommended ? '1.5px solid var(--primary-color)' : '1px solid #e5e7eb' }}>
            <div style={{ height: 118, margin: '0 -1rem', background: `linear-gradient(rgba(15,23,42,0.12), rgba(15,23,42,0.18)), url(${item.image}) center/cover`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '0.35rem 0.65rem', color: '#1e293b', fontWeight: 900, fontSize: '0.72rem' }}>{item.category}</span>
              {item.recommended && <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary-color)', color: 'white', borderRadius: 999, padding: '0.35rem 0.65rem', fontWeight: 900, fontSize: '0.72rem' }}>Recomendado</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', margin: '0.85rem 0 0.2rem' }}>
              <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '0.45rem 0.65rem', color: '#020617', fontWeight: 800, fontSize: '0.82rem' }}>{item.category}</span>
              <span style={{ color: published ? 'var(--primary-color)' : hasVideo ? '#d97706' : '#94a3b8', fontWeight: 800, fontSize: '0.8rem', alignSelf: 'center' }}>
                {published ? 'Publicado' : hasVideo ? 'Borrador' : 'Sin video'}
              </span>
            </div>
            <h3 style={{ margin: '1rem 0 0.5rem', fontSize: '1.02rem', color: '#020617', lineHeight: 1.18 }}>{item.title}</h3>
            <p style={{ color: '#64748b', margin: '0 0 0.9rem', lineHeight: 1.4, fontSize: '0.86rem' }}>{item.description}</p>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.86rem' }}>{item.duration} · {item.level}</p>
            {!published && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => void publishAcademyItem(item)}
                disabled={!hasVideo || publishingId === item.id}
                style={{ width: '100%', marginBottom: '0.8rem', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 7, opacity: !hasVideo ? 0.55 : 1 }}
                title={hasVideo ? 'Publicar y desbloquear para los usuarios' : 'Primero cargá un video'}
              >
                <CheckCircle2 size={16} />
                {publishingId === item.id ? 'Publicando...' : hasVideo ? 'Publicar' : 'Cargá un video para publicar'}
              </button>
            )}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem' }}>
              <button className="btn-secondary" onClick={() => hasVideo ? openPreview(item) : openEditor(item)} style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {hasVideo ? <><Eye size={15} /> Vista previa</> : <><Upload size={15} /> Cargar video</>}
              </button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button title="Editar" onClick={() => openEditor(item)} style={{ color: 'var(--primary-color)' }}><Pencil size={17} /></button>
                <button title="Eliminar" onClick={async () => { if (window.confirm('Deseas eliminar este taller?')) { const result = await removeContentItemFromSupabase(item.id); if (!result.ok) { window.alert(result.error?.message ?? 'No pudimos eliminar el taller.'); return; } deleteAcademyItem(item.id); reload(); } }} style={{ color: '#020617' }}><Trash2 size={17} /></button>
              </div>
            </div>
          </article>
          );
        })}
      </div>
      {filteredItems.length === 0 && (
        <div style={{ padding: '2.5rem', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 16, color: '#64748b' }}>No hay talleres en esta categoría.</div>
      )}
      {categoryManagerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setCategoryManagerOpen(false)}>
          <div className="card" style={{ width: 520, maxWidth: '96vw', maxHeight: '86vh', overflowY: 'auto', margin: 0, padding: '1.25rem', borderRadius: 16 }} onClick={event => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem' }}>Categorías de Academia</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>Creá categorías o renombrá las existentes.</p>
              </div>
              <button type="button" onClick={() => setCategoryManagerOpen(false)} style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={17} /></button>
            </div>
            <div style={{ display: 'flex', gap: '0.55rem', marginBottom: '1rem' }}>
              <input className="input-field" value={newCategory} onChange={event => setNewCategory(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') createCategory(); }} placeholder="Nueva categoría" />
              <button type="button" className="btn-primary" onClick={createCategory} disabled={!newCategory.trim()} style={{ whiteSpace: 'nowrap' }}>Crear</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {categories.map(category => (
                <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.7rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                  {editingCategory === category ? (
                    <>
                      <input className="input-field" value={editingCategoryName} onChange={event => setEditingCategoryName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void renameCategory(); }} autoFocus />
                      <button type="button" className="btn-primary" onClick={() => void renameCategory()} disabled={savingCategory || !editingCategoryName.trim()}>{savingCategory ? 'Guardando...' : 'Guardar'}</button>
                      <button type="button" className="btn-secondary" onClick={() => setEditingCategory('')}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, color: '#334155', fontWeight: 700 }}>{category}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{items.filter(item => categoryKey(item.category) === categoryKey(category)).length} talleres</span>
                      <button type="button" title="Renombrar categoría" onClick={() => { setEditingCategory(category); setEditingCategoryName(category); }} style={{ color: 'var(--primary-color)' }}><Pencil size={16} /></button>
                      <button type="button" title="Eliminar categoría" onClick={() => void deleteCategory(category)} disabled={savingCategory || categoryKey(category) === categoryKey(UNCATEGORIZED_ACADEMY_LABEL)} style={{ color: categoryKey(category) === categoryKey(UNCATEGORIZED_ACADEMY_LABEL) ? '#cbd5e1' : '#dc2626', cursor: categoryKey(category) === categoryKey(UNCATEGORIZED_ACADEMY_LABEL) ? 'not-allowed' : 'pointer' }}><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 560, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto', margin: 0, padding: '1.25rem', borderRadius: 16 }}>
            <h3 style={{ marginTop: 0 }}>{creating ? 'Crear video' : 'Editar taller'}</h3>
            <label style={fieldLabelStyle}>Título del taller</label>
            <input className="input-field" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Categoría</label>
            <div style={{ display: 'flex', gap: '0.55rem', marginBottom: '0.7rem' }}>
              <select className="input-field" value={editing.category} onChange={event => setEditing({ ...editing, category: event.target.value })}>
                {!categories.some(category => categoryKey(category) === categoryKey(editing.category)) && <option value={editing.category}>{editing.category}</option>}
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
              <button type="button" className="btn-secondary" onClick={() => setCategoryManagerOpen(true)} style={{ whiteSpace: 'nowrap' }}><Settings size={15} /> Categorías</button>
            </div>
            <label style={fieldLabelStyle}>Descripción del taller</label>
            <textarea className="input-field" rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Duración</label>
            <input className="input-field" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Imagen de portada</label>
            <input className="input-field" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="URL de portada" style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Subir video / URL del video</label>
            <input className="input-field" value={editing.videoUrl ?? ''} onChange={e => setEditing({ ...editing, videoUrl: e.target.value, active: e.target.value.trim() ? editing.active : false })} placeholder="https://..." style={{ marginBottom: '0.7rem' }} />
            <label style={fieldLabelStyle}>Elegir video desde Biblioteca Multimedia</label>
            <select
              className="input-field"
              value=""
              onChange={event => {
                const selected = mediaItems.find(item => item.id === event.target.value);
                if (selected) {
                  setVideoFile(null);
                  setEditing({
                    ...editing,
                    videoUrl: selected.url,
                    image: selected.thumbnailUrl || (selected.kind === 'Image' ? selected.url : editing.image),
                    duration: selected.duration || editing.duration,
                  });
                }
              }}
              style={{ marginBottom: '0.7rem' }}
            >
              <option value="">Seleccionar archivo...</option>
              {mediaItems.filter(item => item.kind === 'Video').map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input type="file" accept="video/*" className="input-field" onChange={e => {
              const file = e.target.files?.[0];
              setVideoFile(file ?? null);
            }} style={{ marginBottom: '0.7rem', paddingTop: '0.75rem' }} />
            {videoFile && <p style={{ margin: '-0.25rem 0 0.8rem', color: '#64748b', fontSize: '0.82rem' }}>Video seleccionado: <strong>{videoFile.name}</strong></p>}
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.45rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={editing.active}
                disabled={!hasAcademyVideo(editing) && !videoFile}
                onChange={e => setEditing({ ...editing, active: e.target.checked })}
              />
              Publicado para usuarios
            </label>
            {!hasAcademyVideo(editing) && !videoFile && (
              <p style={{ margin: '0 0 1rem 1.45rem', color: '#94a3b8', fontSize: '0.8rem' }}>Subí o seleccioná un video para habilitar la publicación.</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.7rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => openPreview(editing, videoFile)} disabled={!hasAcademyVideo(editing) && !videoFile} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Eye size={15} /> Vista previa</button>
              <div style={{ display: 'flex', gap: '0.7rem' }}>
                <button className="btn-secondary" onClick={() => { setEditing(null); setCreating(false); setVideoFile(null); }} disabled={uploading}>Cancelar</button>
                <button className="btn-primary" onClick={save} disabled={uploading}>
                  {uploading ? uploadProgress === null ? 'Guardando...' : `Subiendo ${uploadProgress}%` : creating ? 'Crear video' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {previewing?.videoUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.72)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={closePreview}>
          <div style={{ width: 900, maxWidth: '96vw', background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 80px rgba(15,23,42,0.35)' }} onClick={event => event.stopPropagation()}>
            <div style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem', color: 'var(--primary-color)', fontSize: '0.72rem', fontWeight: 900 }}>VISTA PREVIA DEL USUARIO</p>
                <h3 style={{ margin: 0, color: '#020617' }}>{previewing.title}</h3>
              </div>
              <button type="button" title="Cerrar" onClick={closePreview} style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '1rem' }}>
              {academyVideoEmbedUrl(previewing.videoUrl) ? (
                <iframe
                  title={`Vista previa de ${previewing.title}`}
                  src={academyVideoEmbedUrl(previewing.videoUrl) ?? ''}
                  style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 14, background: '#0f172a' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={previewing.videoUrl} poster={previewing.image} controls onError={() => setPreviewError('No pudimos reproducir esta dirección. Verificá que sea un enlace directo al video o elegilo desde la Biblioteca Multimedia.')} style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 14, background: '#0f172a', objectFit: 'contain' }} />
              )}
              {previewError && <p style={{ margin: '0.8rem 0 0', padding: '0.75rem', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: '0.84rem', fontWeight: 700 }}>{previewError}</p>}
              <p style={{ margin: '0.85rem 0 0', color: '#64748b', lineHeight: 1.5 }}>{previewing.description}</p>
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
  thumbnailUrl?: string;
  duration: string;
  size: string;
  description: string;
}

interface MediaEditorState extends MediaItem {
  file?: File;
  thumbnailFile?: File;
}

const MEDIA_STORAGE_KEY = 'reactiva-admin-media-library-live-v2';

const emptyMediaItem = (): MediaItem => ({
  id: `media-${Date.now()}`,
  name: '',
  kind: 'Video',
  url: '',
  thumbnailUrl: '',
  duration: '',
  size: '',
  description: '',
});

const readMediaItems = (): MediaItem[] => {
  try {
    return JSON.parse(localStorage.getItem(MEDIA_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveMediaItems = (items: MediaItem[]) => {
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
};

const mediaSizeInMb = (size: string) => {
  const value = Number.parseFloat(size.replace(',', '.')) || 0;
  return size.toLowerCase().includes('kb') ? value / 1024 : value;
};

const fileSafe = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();

const rowToMediaItem = (row: any): MediaItem => ({
  id: row.id,
  name: row.title,
  kind: row.kind === 'video' ? 'Video' : 'Image',
  url: row.url ?? '',
  thumbnailUrl: row.thumbnail_url ?? row.metadata?.thumbnailUrl ?? '',
  duration: row.metadata?.duration ?? '',
  size: row.metadata?.size ?? '',
  description: row.description ?? '',
});

const fetchMediaItems = async (): Promise<MediaItem[]> => {
  if (!supabase) return readMediaItems();
  const { data, error } = await supabase
    .from('content_items')
    .select('id, kind, title, description, url, thumbnail_url, metadata, created_at')
    .in('kind', ['video', 'resource'])
    .eq('metadata->>library', 'media')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('No se pudo cargar la biblioteca multimedia', error);
    return readMediaItems();
  }

  const media = data.map(rowToMediaItem);
  saveMediaItems(media);
  return media;
};

const AdminMediaPanel: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>(() => readMediaItems());
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<MediaEditorState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const refresh = () => void fetchMediaItems().then(setItems);
    refresh();
    const channel = supabase
      ? supabase.channel('admin-reactiva-media').on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, refresh).subscribe()
      : null;
    return () => { if (channel && supabase) void supabase.removeChannel(channel); };
  }, []);

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

  const save = async () => {
    if (!editing || !editing.name.trim()) return;
    setUploading(true);
    setUploadProgress(null);
    try {
      let url = editing.url;
      let thumbnailUrl = editing.thumbnailUrl ?? '';
      let finalName = editing.name;
      let finalKind = editing.kind;
      let finalSize = editing.size;

      if (editing.file) {
        const file = editing.file;
        finalName = editing.name || file.name;
        finalKind = file.type.startsWith('image') ? 'Image' : 'Video';
        finalSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;

        if (!supabase) throw new Error('Supabase no está configurado.');
        const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
        const path = `${finalKind.toLowerCase()}s/${Date.now()}-${fileSafe(finalName)}.${extension}`;
        if (finalKind === 'Video') {
          setUploadProgress(0);
          url = await uploadResumableStorageFile({
            bucket: 'reactiva-media',
            path,
            file,
            onProgress: setUploadProgress,
          });
        } else {
          const { error: uploadError } = await supabase.storage
            .from('reactiva-media')
            .upload(path, file, { upsert: true, contentType: file.type });
          if (uploadError) throw uploadError;
          url = supabase.storage.from('reactiva-media').getPublicUrl(path).data.publicUrl;
        }

        if (finalKind === 'Image' && !thumbnailUrl) {
          thumbnailUrl = url;
        }
      }

      if (editing.thumbnailFile) {
        if (!supabase) throw new Error('Supabase no está configurado.');
        const file = editing.thumbnailFile;
        const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
        const path = `thumbnails/${Date.now()}-${fileSafe(file.name)}.${extension}`;
        const { error: thumbnailUploadError } = await supabase.storage
          .from('reactiva-media')
          .upload(path, file, { upsert: true, contentType: file.type });
        if (thumbnailUploadError) throw thumbnailUploadError;

        const { data } = supabase.storage.from('reactiva-media').getPublicUrl(path);
        thumbnailUrl = data.publicUrl;
      }

      const savedItem: MediaItem = { ...editing, name: finalName, kind: finalKind, size: finalSize, url, thumbnailUrl };

      if (supabase) {
        const { error } = await supabase.rpc('save_content_item', {
          item_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editing.id) ? editing.id : null,
          item_kind: finalKind === 'Video' ? 'video' : 'resource',
          item_title: finalName,
          item_description: editing.description,
          item_category: 'Biblioteca Multimedia',
          item_tags: [finalKind],
          item_url: url,
          item_thumbnail_url: thumbnailUrl || (finalKind === 'Image' ? url : null),
          item_active: true,
          item_featured: false,
          item_sort_order: 0,
          item_metadata: {
            library: 'media',
            mediaKind: finalKind,
            duration: editing.duration,
            size: finalSize,
            thumbnailUrl,
          },
        });
        if (error) throw error;
      }

      const exists = items.some(item => item.id === savedItem.id);
      const next = exists ? items.map(item => item.id === savedItem.id ? savedItem : item) : [savedItem, ...items];
      persist(next);
      fetchMediaItems().then(setItems);
      setEditing(null);
    } catch (err: any) {
      window.alert(err?.message ?? 'No pudimos subir el archivo.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const remove = async (id: string) => {
    if (window.confirm('Deseas eliminar este archivo?')) {
      if (supabase && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        const { error } = await supabase.rpc('delete_content_item', { item_id: id });
        if (error) {
          window.alert(error.message);
          return;
        }
      }
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
        {filtered.map(item => {
          const previewUrl = item.thumbnailUrl || (item.kind === 'Image' ? item.url : '');
          return (
          <article key={item.id} className="card" style={{ margin: 0, padding: '0.9rem', borderRadius: 16 }}>
            {previewUrl ? (
              <div style={{ height: 120, borderRadius: 10, background: `linear-gradient(rgba(15,23,42,0.05), rgba(15,23,42,0.2)), url(${previewUrl}) center/cover`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem', overflow: 'hidden' }}>
                {item.kind === 'Video' && (
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: 'rgba(255,255,255,0.92)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 26px rgba(15,23,42,0.18)' }}>
                    <Video size={20} fill="currentColor" />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ height: 120, borderRadius: 10, background: '#f8fafc', color: item.kind === 'Video' ? '#3b82f6' : 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                {item.kind === 'Video' ? <FileVideo size={34} /> : <FileImage size={34} />}
              </div>
            )}
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
          );
        })}
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
                file,
                name: editing.name || file.name,
                kind: file.type.startsWith('image') ? 'Image' : 'Video',
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
              });
            }} style={{ marginBottom: '1rem', paddingTop: '0.75rem' }} />
            {editing.kind === 'Video' && (
              <>
                <label style={fieldLabelStyle}>Imagen de portada del video</label>
                <input
                  className="input-field"
                  value={editing.thumbnailUrl ?? ''}
                  onChange={event => setEditing({ ...editing, thumbnailUrl: event.target.value })}
                  placeholder="URL de portada o subir imagen debajo"
                  style={{ marginBottom: '0.7rem' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={event => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setEditing({ ...editing, thumbnailFile: file });
                  }}
                  style={{ marginBottom: editing.thumbnailFile ? '0.45rem' : '1rem', paddingTop: '0.75rem' }}
                />
                {editing.thumbnailFile && (
                  <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                    Portada seleccionada: <strong>{editing.thumbnailFile.name}</strong>
                  </p>
                )}
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
              <button className="btn-secondary" onClick={() => setEditing(null)} disabled={uploading}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={uploading} style={{ opacity: uploading ? 0.7 : 1 }}>
                {uploading ? uploadProgress === null ? 'Guardando...' : `Subiendo ${uploadProgress}%` : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_LABELS = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

const BASE_BLOQUES = [
  { dia: 'Lunes', bloques: [] },
  { dia: 'Miércoles', bloques: [] },
  { dia: 'Viernes', bloques: [] },
];

const EVENTOS_MES: Record<number, {horario:string; empresa:string}[]> = {};

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
  const [unlockSchedule, setUnlockSchedule] = useState<VideoUnlockItem[]>(() => loadVideoUnlockSchedule());
  const [modalDay, setModalDay] = useState<UnlockDay>('Lunes');
  const [modalBlock, setModalBlock] = useState<UnlockBlock>('morning');
  const [modalTime, setModalTime] = useState('08:00');
  const [modalCompany, setModalCompany] = useState('Global');
  const [modalVideoUrl, setModalVideoUrl] = useState('');
  const [modalTitle, setModalTitle] = useState('Pausa activa');
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [savingProgram, setSavingProgram] = useState(false);
  const [scheduledVideos, setScheduledVideos] = useState<ScheduledVideo[]>([]);

  useEffect(() => {
    const refreshSchedule = () => void fetchVideoUnlockSchedule().then(setUnlockSchedule);
    refreshSchedule();
    const channel = supabase
      ? supabase.channel('admin-video-unlock-schedule').on('postgres_changes', { event: '*', schema: 'public', table: 'video_unlock_schedule' }, refreshSchedule).subscribe()
      : null;
    return () => { if (channel && supabase) void supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const refreshVideos = () => fetchScheduledVideos().then(setScheduledVideos);
    void refreshVideos();
    window.addEventListener(SCHEDULED_VIDEOS_EVENT, refreshVideos);
    window.addEventListener('storage', refreshVideos);
    const channel = supabase
      ? supabase.channel('admin-scheduled-videos').on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, refreshVideos).subscribe()
      : null;
    return () => {
      window.removeEventListener(SCHEDULED_VIDEOS_EVENT, refreshVideos);
      window.removeEventListener('storage', refreshVideos);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, []);

  const updateUnlockSchedule = (day: UnlockDay, block: UnlockBlock, changes: Partial<VideoUnlockItem>) => {
    const next = unlockSchedule.map((item) => (
      item.day === day && item.block === block ? { ...item, ...changes } : item
    ));
    setUnlockSchedule(next);
    persistVideoUnlockSchedule(next).then((result) => {
      if (!result.ok) console.error('No se pudo guardar la programación de videos', result.error);
    });
  };

  const lunes = getLunesOfWeek(hoy, offsetSem);
  const rangoLabel = (() => {
    const v = new Date(lunes); v.setDate(lunes.getDate()+4);
    return `${lunes.getDate()} – ${v.getDate()} ${MESES[v.getMonth()]} ${v.getFullYear()}`;
  })();

  const semana = useMemo(() => {
    const dayOffsets: Record<string, number> = { Lunes: 0, Miércoles: 2, Viernes: 4 };
    return BASE_BLOQUES.map((d) => {
      const fecha = new Date(lunes); fecha.setDate(lunes.getDate() + (dayOffsets[d.dia] ?? 0));
      const videosDelDia = scheduledVideos
        .filter(video => video.day === d.dia)
        .filter(video => empresa === 'Todas las empresas' || video.companyName === empresa || video.companyName === 'Global' || empresa === 'Global')
        .map(video => {
          const unlock = unlockSchedule.find(item => item.day === video.day && item.block === video.block);
          return {
            id: video.id,
            turno: video.block === 'morning' ? 'Mañana' : 'Tarde',
            tipo: video.title || 'Pausa activa',
            horario: unlock?.time ?? video.time,
            empresa: video.companyName ?? 'Global',
            estado: unlock?.enabled ? 'programado' : 'borrador',
            url: video.url,
          };
        });
      return { ...d, fecha: fmt(fecha), bloques: videosDelDia };
    });
  }, [empresa, lunes, scheduledVideos, unlockSchedule]);

  const calDays = getCalDays(anio, mes);

  const navMes = (dir:1|-1) => {
    if (dir===1 && mes===11) { setMes(0); setAnio(a=>a+1); }
    else if (dir===-1 && mes===0) { setMes(11); setAnio(a=>a-1); }
    else setMes(m=>m+dir);
  };

  const dayFromModalDate = (dia?: number): UnlockDay => {
    if (!dia) return 'Lunes';
    const selected = new Date(anio, mes, dia);
    const day = selected.getDay();
    if (day === 3) return 'Miércoles' as UnlockDay;
    if (day === 5) return 'Viernes';
    return 'Lunes';
  };

  const abrirModal = (dia?:number) => {
    const nextDay = dayFromModalDate(dia);
    const existing = unlockSchedule.find(item => item.day === nextDay && item.block === modalBlock);
    setDiaModal(dia??null);
    setModalDay(nextDay);
    setModalTime(existing?.time ?? (modalBlock === 'morning' ? '08:00' : '15:00'));
    setModalVideoUrl('');
    setModalFile(null);
    setModalTitle('Pausa activa');
    setModal(true);
  };

  const uploadScheduledFile = async () => {
    if (!modalFile) return modalVideoUrl.trim();
    if (!supabase) throw new Error('Supabase no está configurado para subir videos.');

    const safeName = modalFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `scheduled-videos/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('reactiva-media')
      .upload(path, modalFile, { upsert: true, contentType: modalFile.type });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('reactiva-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const guardarProgramacionVideo = async () => {
    if (!modalVideoUrl.trim() && !modalFile) {
      window.alert('Agregá un link o subí un video antes de guardar.');
      return;
    }

    setSavingProgram(true);
    try {
      const finalUrl = await uploadScheduledFile();
      const title = modalTitle.trim() || `Pausa ${modalBlock === 'morning' ? 'mañana' : 'tarde'}`;
      const result = await saveScheduledVideo({
        id: `local-${Date.now()}`,
        day: modalDay,
        block: modalBlock,
        time: modalTime,
        title,
        url: finalUrl,
        companyName: modalCompany,
        createdAt: new Date().toISOString(),
      });

      if (!result.ok) {
        window.alert(result.error?.message ?? 'No pudimos guardar el video programado.');
        return;
      }

      updateUnlockSchedule(modalDay, modalBlock, { enabled: true, time: modalTime });
      setModal(false);
    } catch (error: any) {
      window.alert(error?.message ?? 'No pudimos subir o guardar el video.');
    } finally {
      setSavingProgram(false);
    }
  };

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
      <section className="card" style={{ padding: '1rem', margin: '0 0 1.25rem', borderRadius: '14px', border: '1px solid #ccfbf1', background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)', boxShadow: '0 4px 16px rgba(15, 118, 110, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '0.98rem', fontWeight: 800 }}>Habilitación automática de videos</h3>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.8rem', lineHeight: 1.45 }}>
              Activá los bloques que querés liberar. Los usuarios podrán verlos {UNLOCK_LEAD_MINUTES} minuto antes del horario configurado.
            </p>
          </div>
          <span style={{ background: '#ccfbf1', color: '#0f766e', borderRadius: 999, padding: '0.28rem 0.65rem', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
            Lunes · Miércoles · Viernes
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
          {(['Lunes', 'Miércoles', 'Viernes'] as UnlockDay[]).map(day => (
            <div key={day} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem' }}>{day}</div>
              {([
                ['morning', 'Mañana'],
                ['afternoon', 'Tarde'],
              ] as [UnlockBlock, string][]).map(([block, label]) => {
                const item = unlockSchedule.find(entry => entry.day === day && entry.block === block);
                return (
                  <label key={`${day}-${block}`} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 92px', alignItems: 'center', gap: '0.55rem', padding: '0.5rem 0', borderTop: block === 'afternoon' ? '1px solid #f1f5f9' : 'none' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(item?.enabled)}
                      onChange={(event) => updateUnlockSchedule(day, block, { enabled: event.target.checked })}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary-color)' }}
                    />
                    <span style={{ color: '#334155', fontSize: '0.8rem', fontWeight: 700 }}>{label}</span>
                    <input
                      type="time"
                      value={item?.time ?? '08:00'}
                      onChange={(event) => updateUnlockSchedule(day, block, { time: event.target.value })}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.35rem', fontSize: '0.78rem', color: '#0f172a' }}
                    />
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      </section>

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
                          {bloque.url && (
                            <button onClick={()=>window.open(bloque.url, '_blank', 'noopener,noreferrer')} style={{background:'none',border:'none',color:'#2563eb',fontSize:'0.76rem',fontWeight:600,cursor:'pointer',padding:0,display:'inline-flex',alignItems:'center',gap:'0.2rem',marginRight:'0.75rem'}}>
                              <Eye size={12}/> Ver video
                            </button>
                          )}
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
                ? <input type="url" className="input-field" value={modalVideoUrl} onChange={e => setModalVideoUrl(e.target.value)} placeholder="https://youtube.com/... o https://vimeo.com/..." style={{fontSize:'0.875rem'}}/>
                : <label style={{display:'block',border:'2px dashed #e2e8f0',borderRadius:'10px',padding:'1.25rem',textAlign:'center',cursor:'pointer',color:'#94a3b8',fontSize:'0.82rem'}}>
                    <Upload size={22} style={{marginBottom:'0.35rem',display:'block',margin:'0 auto 0.35rem'}}/>
                    {modalFile ? modalFile.name : 'Hacé clic para subir un video'}
                    <input type="file" accept="video/*" onChange={e => setModalFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
                  </label>
              }
            </div>

            <div style={{marginBottom:'0.9rem'}}>
              <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Título del video</label>
              <input className="input-field" value={modalTitle} onChange={e => setModalTitle(e.target.value)} placeholder="Ej: Movilidad cervical" style={{fontSize:'0.875rem'}}/>
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
                <select className="input-field" value={modalCompany} onChange={e => setModalCompany(e.target.value.replace(' (todas)', ''))} style={{fontSize:'0.875rem'}}>
                  {opcionesEmpresasModal.map(e=><option key={e} value={e.replace(' (todas)', '')}>{e}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.65rem',marginBottom:'1.25rem'}}>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Día</label>
                <select className="input-field" value={modalDay} onChange={e => setModalDay(e.target.value as UnlockDay)} style={{fontSize:'0.875rem'}}>
                  {(['Lunes', 'Miércoles', 'Viernes'] as UnlockDay[]).map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Turno</label>
                <select className="input-field" value={modalBlock} onChange={e => {
                  const nextBlock = e.target.value as UnlockBlock;
                  setModalBlock(nextBlock);
                  const existing = unlockSchedule.find(item => item.day === modalDay && item.block === nextBlock);
                  setModalTime(existing?.time ?? (nextBlock === 'morning' ? '08:00' : '15:00'));
                }} style={{fontSize:'0.875rem'}}>
                  <option value="morning">Mañana</option>
                  <option value="afternoon">Tarde</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Hora</label>
                <input type="time" className="input-field" value={modalTime} onChange={e => setModalTime(e.target.value)} style={{fontSize:'0.875rem'}}/>
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
              <button onClick={guardarProgramacionVideo} disabled={savingProgram} className="btn-primary" style={{flex:2,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem',fontSize:'0.875rem',opacity:savingProgram?0.7:1}}>
                <Save size={15}/> {savingProgram ? 'Guardando...' : 'Guardar programación'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

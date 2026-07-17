import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Star, Eye, EyeOff, BookOpen, Clock, Tag as TagIcon, BarChart2 } from 'lucide-react';
import { fetchContentLibrary, saveAcademyItem, removeContentItemFromSupabase, AcademyItem } from '../../../data/contentLibrary';
import { supabase } from '../../../lib/supabase';
import { AcademiaEditor } from './AcademiaEditor';

const NIVEL_COLOR: Record<string, { bg: string; text: string }> = {
  'Basico':       { bg: '#f0fdfa', text: '#0d9488' },
  'Intermedio':   { bg: '#eff6ff', text: '#3b82f6' },
  'Avanzado':     { bg: '#faf5ff', text: '#9333ea' },
};

export const AcademiaTab: React.FC = () => {
  const [workshops, setWorkshops] = useState<AcademyItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademyItem | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  const loadData = async () => {
    const lib = await fetchContentLibrary();
    setWorkshops(lib.academy);
    
    if (supabase) {
      const { data } = await supabase.from('user_content_progress').select('content_key');
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(d => {
          counts[d.content_key] = (counts[d.content_key] || 0) + 1;
        });
        setStats(counts);
      }
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const categories = ['Todas', ...Array.from(new Set(workshops.map(w => w.category)))];

  const filtered = workshops.filter(w => {
    const matchSearch = w.title.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'Todas' || w.category === filterCategory;
    return matchSearch && matchCat;
  });

  const activeCount = workshops.filter(w => w.active).length;
  const inactiveCount = workshops.length - activeCount;
  const totalViews = workshops.reduce((acc, w) => acc + (stats[w.id] || 0), 0);
  const topWorkshopId = [...workshops].sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0))[0]?.id;
  const topWorkshop = workshops.find(w => w.id === topWorkshopId)?.title ?? 'Ninguno';

  const handleCreate = () => {
    setEditingItem(null);
    setIsEditing(true);
  };

  const handleEdit = (item: AcademyItem) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleToggleActive = async (item: AcademyItem) => {
    const toggled = { ...item, active: !item.active };
    await saveAcademyItem(toggled);
    void loadData();
  };

  const handleDelete = async (item: AcademyItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar el taller "${item.title}"?`)) return;
    await removeContentItemFromSupabase(item.id);
    void loadData();
  };

  const handleSave = async (item: AcademyItem, relatedTips: string[]) => {
    const result = await saveAcademyItem(item);
    if (result.ok && result.id && supabase) {
      // Coach is item_a, Workshop is item_b
      await supabase.from('content_relations').delete().eq('item_b_id', result.id);
      if (relatedTips.length > 0) {
        const inserts = relatedTips.map(tId => ({
          item_a_id: tId,
          item_b_id: result.id
        }));
        await supabase.from('content_relations').insert(inserts);
      }
    }
    setIsEditing(false);
    void loadData();
  };

  if (isEditing) {
    return <AcademiaEditor item={editingItem} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Talleres activos',    value: activeCount,   color: 'var(--primary-color)' },
          { label: 'Inactivos',           value: inactiveCount, color: 'var(--text-muted)' },
          { label: 'Total visualizaciones', value: totalViews,  color: '#3b82f6' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{stat.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
        <div className="card" style={{ padding: '1rem', gridColumn: 'span 2' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Taller más visto</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={topWorkshop}>{topWorkshop}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar talleres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', minWidth: '240px' }}
            />
          </div>
          <select
            className="input-field"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Nuevo taller
        </button>
      </div>

      {/* Grilla de Talleres */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(workshop => {
          const coverUrl = workshop.image;
          const nivelStyle = NIVEL_COLOR[workshop.level] ?? { bg: '#f1f5f9', text: '#64748b' };
          return (
            <div key={workshop.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Portada */}
              <div style={{
                height: '140px', backgroundColor: '#f0fdfa', position: 'relative', overflow: 'hidden',
                backgroundImage: coverUrl ? `url(${coverUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center'
              }}>
                {!coverUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <BookOpen size={40} color="#0d9488" opacity={0.4} />
                  </div>
                )}
                {/* Badges */}
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: nivelStyle.bg, color: nivelStyle.text, padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                    {workshop.level}
                  </span>
                  {workshop.recommended && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Star size={10} fill="#d97706" /> Destacado
                    </span>
                  )}
                </div>
                {/* Estado toggle */}
                <button onClick={() => handleToggleActive(workshop)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '1rem', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, color: workshop.active ? 'var(--primary-color)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {workshop.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {workshop.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Contenido */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  {workshop.category}
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                  {workshop.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flex: 1 }}>
                  {workshop.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {workshop.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BarChart2 size={12} /> {stats[workshop.id] || 0} vistas
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button onClick={() => handleEdit(workshop)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => handleDelete(workshop)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
            <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <p>No se encontraron talleres en la Academia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

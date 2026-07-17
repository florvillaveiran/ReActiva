import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Tag as TagIcon, LayoutGrid, List, BarChart2 } from 'lucide-react';
import { fetchContentLibrary, saveCoachItem, removeContentItemFromSupabase, CoachItem } from '../../../data/contentLibrary';
import { supabase } from '../../../lib/supabase';
import { CoachEditor } from './CoachEditor';

export const CoachTab: React.FC = () => {
  const [advices, setAdvices] = useState<CoachItem[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<CoachItem | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  const loadData = async () => {
    const lib = await fetchContentLibrary();
    setAdvices(lib.coach);
    
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

  const filtered = advices.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = advices.filter(a => a.active).length;
  const inactiveCount = advices.length - activeCount;
  
  const totalViews = advices.reduce((acc, a) => acc + (stats[a.id] || 0), 0);
  
  const topAdviceId = [...advices].sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0))[0]?.id;
  const topAdvice = advices.find(a => a.id === topAdviceId)?.title ?? 'Ninguno';

  const handleCreate = () => {
    setEditingItem(null);
    setIsEditing(true);
  };

  const handleEdit = (item: CoachItem) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleToggleActive = async (item: CoachItem) => {
    const toggled = { ...item, active: !item.active };
    await saveCoachItem(toggled);
    void loadData();
  };

  const handleDelete = async (item: CoachItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar el consejo "${item.title}"?`)) return;
    await removeContentItemFromSupabase(item.id);
    void loadData();
  };

  const handleSave = async (item: CoachItem, relatedWorkshops: string[]) => {
    const result = await saveCoachItem(item);
    if (result.ok && result.id && supabase) {
      await supabase.from('content_relations').delete().eq('item_a_id', result.id);
      if (relatedWorkshops.length > 0) {
        const inserts = relatedWorkshops.map(wId => ({
          item_a_id: result.id,
          item_b_id: wId
        }));
        await supabase.from('content_relations').insert(inserts);
      }
    }
    setIsEditing(false);
    void loadData();
  };

  if (isEditing) {
    return <CoachEditor item={editingItem} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Activos</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{activeCount}</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Inactivos</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>{inactiveCount}</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Visualizaciones</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{totalViews}</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Consejo más visto</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={topAdvice}>{topAdvice}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar consejos por título o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary-color)', borderRadius: '8px', padding: '3px' }}>
            <button onClick={() => setView('grid')} style={{ padding: '0.4rem', border: 'none', background: view === 'grid' ? 'white' : 'transparent', borderRadius: '6px', color: view === 'grid' ? 'var(--text-color)' : 'var(--text-muted)', cursor: 'pointer', boxShadow: view === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView('list')} style={{ padding: '0.4rem', border: 'none', background: view === 'list' ? 'white' : 'transparent', borderRadius: '6px', color: view === 'list' ? 'var(--text-color)' : 'var(--text-muted)', cursor: 'pointer', boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              <List size={16} />
            </button>
          </div>
          <button className="btn-primary" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Nuevo consejo
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(advice => (
            <div key={advice.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--bg-secondary-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-color)' }}>
                  {advice.category}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: advice.active ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                  {advice.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.5rem' }}>{advice.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>{advice.description}</p>
              
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {advice.tags?.map(tag => (
                  <span key={tag} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)' }}>
                    <TagIcon size={10} /> {tag}
                  </span>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <BarChart2 size={14}/> {stats[advice.id] || 0}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleToggleActive(advice)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title={advice.active ? "Desactivar" : "Activar"}>
                    {advice.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => handleEdit(advice)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }} title="Editar">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(advice)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-color)' }} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-secondary-color)', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Título</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Categoría</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Vistas</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Estado</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(advice => (
                <tr key={advice.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-color)' }}>{advice.title}</td>
                  <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'var(--bg-secondary-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{advice.category}</span></td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{stats[advice.id] || 0}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: advice.active ? 'var(--primary-color)' : 'var(--text-muted)', backgroundColor: advice.active ? '#f0fdfa' : '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                      {advice.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={() => handleToggleActive(advice)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Eye size={16} /></button>
                    <button onClick={() => handleEdit(advice)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(advice)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-color)' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {filtered.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
          <p>No se encontraron consejos de ReActiva Coach.</p>
        </div>
      )}
    </div>
  );
};

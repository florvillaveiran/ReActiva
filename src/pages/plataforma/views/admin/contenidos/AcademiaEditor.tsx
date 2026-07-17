import React, { useState, useEffect } from 'react';
import { Save, X, Building, Video } from 'lucide-react';
import { AcademyItem } from '../../../data/contentLibrary';
import { supabase } from '../../../lib/supabase';

interface AcademiaEditorProps {
  item: AcademyItem | null;
  onSave: (item: AcademyItem, relatedTips: string[]) => Promise<void>;
  onCancel: () => void;
}

export const AcademiaEditor: React.FC<AcademiaEditorProps> = ({ item, onSave, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<AcademyItem>>(
    item ?? {
      title: '',
      category: 'Movilidad',
      description: '',
      duration: '10 min',
      level: 'Basico',
      image: '',
      videoUrl: '',
      targetWorkProfile: 'ALL',
      recommendedWorkProfile: 'ALL',
      companyId: null,
      active: true,
      recommended: false,
    }
  );
  
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [tips, setTips] = useState<{id: string, title: string}[]>([]);
  const [selectedTips, setSelectedTips] = useState<string[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      setLoadingRelations(true);
      try {
        const [compRes, tipsRes] = await Promise.all([
          supabase.from('companies').select('id, name').order('name'),
          supabase.from('content_items').select('id, title').eq('kind', 'coach_tip').order('title')
        ]);
        if (compRes.data) setCompanies(compRes.data);
        if (tipsRes.data) setTips(tipsRes.data);

        if (item?.id && !item.id.startsWith('workshop-')) {
          // Relaciones inversas: donde item_b_id = item.id
          const { data: rels } = await supabase
            .from('content_relations')
            .select('item_a_id')
            .eq('item_b_id', item.id);
          
          if (rels) {
            setSelectedTips(rels.map(r => r.item_a_id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRelations(false);
      }
    };
    void fetchData();
  }, [item?.id]);

  const handleChange = (field: keyof AcademyItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTip = (id: string) => {
    setSelectedTips(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const submitForm = async () => {
    if (!formData.title || !formData.category) {
      alert('Por favor completa al menos el título y la categoría.');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData as AcademyItem, selectedTips);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el taller');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {item ? 'Editar Taller' : 'Nuevo Taller'}
        </h2>
        <button onClick={onCancel} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
        
        {/* Sección: Información Principal */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información Principal</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Título del Taller <span style={{color: 'red'}}>*</span></label>
            <input className="input-field" value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="Ej: Movilidad de Espalda" />
          </div>
          <div>
            <label className="form-label">Categoría <span style={{color: 'red'}}>*</span></label>
            <input className="input-field" value={formData.category} onChange={e => handleChange('category', e.target.value)} placeholder="Ej: Movilidad" list="academy-categories" />
            <datalist id="academy-categories">
              <option value="Movilidad" />
              <option value="Ergonomía" />
              <option value="Relajación" />
              <option value="Mindfulness" />
              <option value="Fuerza" />
            </datalist>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Descripción</label>
          <textarea className="input-field" style={{ minHeight: 80 }} value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Descripción breve del taller" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Duración</label>
            <input className="input-field" value={formData.duration} onChange={e => handleChange('duration', e.target.value)} placeholder="Ej: 10 min" />
          </div>
          <div>
            <label className="form-label">Nivel</label>
            <select className="input-field" value={formData.level} onChange={e => handleChange('level', e.target.value)}>
              <option value="Basico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">URL del Video (Youtube o MP4)</label>
            <input className="input-field" value={formData.videoUrl} onChange={e => handleChange('videoUrl', e.target.value)} placeholder="Ej: https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className="form-label">URL Portada (Thumbnail)</label>
            <input className="input-field" value={formData.image} onChange={e => handleChange('image', e.target.value)} placeholder="Ej: https://images.unsplash.com/..." />
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />
        
        {/* Sección: Segmentación */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={16} /> Segmentación
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <div>
            <label className="form-label">Empresa habilitada</label>
            <select className="input-field" value={formData.companyId || ''} onChange={e => handleChange('companyId', e.target.value || null)}>
              <option value="">Todas (Global)</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Perfil Laboral (Exclusivo)</label>
            <select className="input-field" value={formData.targetWorkProfile} onChange={e => handleChange('targetWorkProfile', e.target.value)}>
              <option value="ALL">Todos los perfiles</option>
              <option value="ADMINISTRATIVO">Solo Administrativos</option>
              <option value="OPERATIVO">Solo Operativos</option>
            </select>
          </div>
          <div>
            <label className="form-label">Perfil Laboral (Recomendado)</label>
            <select className="input-field" value={formData.recommendedWorkProfile} onChange={e => handleChange('recommendedWorkProfile', e.target.value)}>
              <option value="ALL">Sin recomendación especial</option>
              <option value="ADMINISTRATIVO">Priorizar para Administrativos</option>
              <option value="OPERATIVO">Priorizar para Operativos</option>
            </select>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

        {/* Sección: Relaciones y Configuración */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Video size={16} /> Relaciones y Configuración
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Consejos Relacionados (Tips para complementar este taller)</label>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: '1rem', maxHeight: 200, overflowY: 'auto' }}>
            {loadingRelations ? <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Cargando consejos...</p> : 
              tips.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {tips.map(t => (
                    <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedTips.includes(t.id)} onChange={() => toggleTip(t.id)} />
                      {t.title}
                    </label>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>No hay consejos disponibles.</p>
              )
            }
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
            <input type="checkbox" checked={formData.active} onChange={e => handleChange('active', e.target.checked)} style={{ width: 16, height: 16 }} />
            Publicado (Visible para usuarios)
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
            <input type="checkbox" checked={formData.recommended} onChange={e => handleChange('recommended', e.target.checked)} style={{ width: 16, height: 16 }} />
            Taller Destacado
          </label>
        </div>

      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f8fafc' }}>
        <button className="btn-secondary" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className="btn-primary" onClick={submitForm} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Taller'}
        </button>
      </div>
    </div>
  );
};

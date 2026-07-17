import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Building, Briefcase } from 'lucide-react';
import { CoachItem } from '../../../data/contentLibrary';
import { supabase } from '../../../lib/supabase';

interface CoachEditorProps {
  item: CoachItem | null;
  onSave: (item: CoachItem, relatedWorkshops: string[]) => Promise<void>;
  onCancel: () => void;
}

export const CoachEditor: React.FC<CoachEditorProps> = ({ item, onSave, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<CoachItem>>(
    item ?? {
      title: '',
      detailTitle: '',
      category: 'Salud visual',
      subtitle: '',
      description: '',
      recommendation: '',
      time: '5 minutos',
      difficulty: 'Moderado',
      benefit: '',
      why: '',
      evidence: '',
      steps: [''],
      signals: [''],
      challenge: '',
      related: '',
      tags: [],
      targetWorkProfile: 'ALL',
      recommendedWorkProfile: 'ALL',
      companyId: null,
      active: true,
      isNew: true,
    }
  );
  
  const [tagInput, setTagInput] = useState('');
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [workshops, setWorkshops] = useState<{id: string, title: string}[]>([]);
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      setLoadingRelations(true);
      try {
        const [compRes, workRes] = await Promise.all([
          supabase.from('companies').select('id, name').order('name'),
          supabase.from('content_items').select('id, title').eq('kind', 'workshop').order('title')
        ]);
        if (compRes.data) setCompanies(compRes.data);
        if (workRes.data) setWorkshops(workRes.data);

        // Fetch relations if editing existing item
        if (item?.id && !item.id.startsWith('coach-')) {
          const { data: rels } = await supabase
            .from('content_relations')
            .select('item_b_id')
            .eq('item_a_id', item.id);
          
          if (rels) {
            setSelectedWorkshops(rels.map(r => r.item_b_id));
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

  const handleChange = (field: keyof CoachItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'steps' | 'signals', index: number, value: string) => {
    const arr = [...(formData[field] || [])];
    arr[index] = value;
    handleChange(field, arr);
  };

  const addArrayItem = (field: 'steps' | 'signals') => {
    handleChange(field, [...(formData[field] || []), '']);
  };

  const removeArrayItem = (field: 'steps' | 'signals', index: number) => {
    const arr = [...(formData[field] || [])];
    arr.splice(index, 1);
    handleChange(field, arr);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        handleChange('tags', [...(formData.tags || []), tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange('tags', formData.tags?.filter(t => t !== tag));
  };

  const toggleWorkshop = (id: string) => {
    setSelectedWorkshops(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const submitForm = async () => {
    if (!formData.title || !formData.category) {
      alert('Por favor completa al menos el título y la categoría.');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData as CoachItem, selectedWorkshops);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el consejo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {item ? 'Editar Consejo' : 'Nuevo Consejo'}
        </h2>
        <button onClick={onCancel} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
        
        {/* Sección: Información Principal */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información Principal</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Título <span style={{color: 'red'}}>*</span></label>
            <input className="input-field" value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="Ej: Pausa Visual" />
          </div>
          <div>
            <label className="form-label">Título de detalle <span style={{color: 'red'}}>*</span></label>
            <input className="input-field" value={formData.detailTitle} onChange={e => handleChange('detailTitle', e.target.value)} placeholder="Ej: Descanso visual activo para pantallas" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Categoría <span style={{color: 'red'}}>*</span></label>
            <input className="input-field" value={formData.category} onChange={e => handleChange('category', e.target.value)} placeholder="Ej: Salud visual" list="coach-categories" />
            <datalist id="coach-categories">
              <option value="Salud visual" />
              <option value="Organización" />
              <option value="Sueño" />
              <option value="Estrés" />
              <option value="Ergonomía" />
              <option value="Entorno saludable" />
              <option value="Energía" />
              <option value="Hidratación" />
            </datalist>
          </div>
          <div>
            <label className="form-label">Texto Corto (Vista Previa)</label>
            <input className="input-field" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Breve descripción que se ve en la tarjeta" />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Subtítulo (Aparece bajo el título principal al abrirlo)</label>
          <input className="input-field" value={formData.subtitle} onChange={e => handleChange('subtitle', e.target.value)} placeholder="Ej: Prácticas para proteger tu vista durante largas jornadas." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Tiempo</label>
            <input className="input-field" value={formData.time} onChange={e => handleChange('time', e.target.value)} placeholder="Ej: 5 minutos" />
          </div>
          <div>
            <label className="form-label">Dificultad</label>
            <select className="input-field" value={formData.difficulty} onChange={e => handleChange('difficulty', e.target.value)}>
              <option value="Fácil">Fácil</option>
              <option value="Moderado">Moderado</option>
              <option value="Desafiante">Desafiante</option>
            </select>
          </div>
          <div>
            <label className="form-label">Beneficio principal</label>
            <input className="input-field" value={formData.benefit} onChange={e => handleChange('benefit', e.target.value)} placeholder="Ej: Reduce la fatiga" />
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

        {/* Sección: Contenido Detallado */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contenido Detallado</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Recomendación Principal (Challenge)</label>
          <textarea className="input-field" style={{ minHeight: 80 }} value={formData.recommendation} onChange={e => handleChange('recommendation', e.target.value)} placeholder="Ej: Ajustá el brillo de tu monitor al entorno." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Por qué importa</label>
            <textarea className="input-field" style={{ minHeight: 100 }} value={formData.why} onChange={e => handleChange('why', e.target.value)} placeholder="Explica el motivo..." />
          </div>
          <div>
            <label className="form-label">Evidencia</label>
            <textarea className="input-field" style={{ minHeight: 100 }} value={formData.evidence} onChange={e => handleChange('evidence', e.target.value)} placeholder="Cita evidencia o estudios..." />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Lista de Pasos */}
          <div>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Cómo aplicarlo (Pasos)
              <button type="button" onClick={() => addArrayItem('steps')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}><Plus size={12} style={{display:'inline', verticalAlign:'middle'}}/> Agregar paso</button>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.steps?.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" value={step} onChange={e => handleArrayChange('steps', i, e.target.value)} placeholder={`Paso ${i+1}`} />
                  <button type="button" onClick={() => removeArrayItem('steps', i)} style={{ background: 'none', border: 'none', color: 'var(--red-color)', cursor: 'pointer', padding: '0 0.5rem' }}><Trash2 size={16} /></button>
                </div>
              ))}
              {(!formData.steps || formData.steps.length === 0) && <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Sin pasos agregados.</p>}
            </div>
          </div>

          {/* Lista de Señales */}
          <div>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Señales (Síntomas/Indicadores)
              <button type="button" onClick={() => addArrayItem('signals')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}><Plus size={12} style={{display:'inline', verticalAlign:'middle'}}/> Agregar señal</button>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.signals?.map((signal, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" value={signal} onChange={e => handleArrayChange('signals', i, e.target.value)} placeholder={`Señal ${i+1}`} />
                  <button type="button" onClick={() => removeArrayItem('signals', i)} style={{ background: 'none', border: 'none', color: 'var(--red-color)', cursor: 'pointer', padding: '0 0.5rem' }}><Trash2 size={16} /></button>
                </div>
              ))}
              {(!formData.signals || formData.signals.length === 0) && <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Sin señales agregadas.</p>}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Mini Desafío</label>
          <input className="input-field" value={formData.challenge} onChange={e => handleChange('challenge', e.target.value)} placeholder="Ej: Elegí ahora tus 3 tareas..." />
        </div>

        <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

        {/* Sección: Relaciones y Metadatos */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Relaciones y Metadatos</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Talleres de la Academia Relacionados (Profundizá este tema)</label>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: '1rem', maxHeight: 200, overflowY: 'auto' }}>
            {loadingRelations ? <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Cargando talleres...</p> : 
              workshops.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {workshops.map(w => (
                    <label key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedWorkshops.includes(w.id)} onChange={() => toggleWorkshop(w.id)} />
                      {w.title}
                    </label>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>No hay talleres disponibles.</p>
              )
            }
          </div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Al seleccionar talleres, se mostrarán al final del consejo para que el usuario pueda profundizar.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Etiquetas (Enter para agregar)</label>
          <input className="input-field" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Ej: Productividad" style={{ marginBottom: '0.5rem' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {formData.tags?.map(tag => (
              <span key={tag} style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '0.3rem 0.6rem', borderRadius: 999, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {tag} <X size={12} cursor="pointer" onClick={() => handleRemoveTag(tag)} />
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input type="checkbox" id="active-checkbox" checked={formData.active} onChange={e => handleChange('active', e.target.checked)} style={{ width: 16, height: 16 }} />
          <label htmlFor="active-checkbox" style={{ fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Publicado (Visible para usuarios)</label>
        </div>

      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f8fafc' }}>
        <button className="btn-secondary" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className="btn-primary" onClick={submitForm} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Consejo'}
        </button>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Building2, CalendarDays, CheckCircle2, Lightbulb, MessageSquareText, Search, Sparkles, Target, TrendingUp } from 'lucide-react';
import { FeedbackComment, useFeedbackIntelligence } from '../../hooks/useFeedbackIntelligence';

const typeTone: Record<FeedbackComment['tipo'], { bg: string; color: string; icon: string }> = {
  Felicitación: { bg: '#ecfdf5', color: '#059669', icon: '🟢' },
  Sugerencia: { bg: '#fffbeb', color: '#d97706', icon: '💡' },
  Problema: { bg: '#fff1f2', color: '#e11d48', icon: '⚠️' },
  General: { bg: '#f8fafc', color: '#64748b', icon: '📈' },
};

const formatDate = (value: string) => {
  if (!value) return 'Sin registros';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const Feedback: React.FC = () => {
  const intelligence = useFeedbackIntelligence();
  const [filters, setFilters] = useState({
    empresa: 'all',
    fecha: 'all',
    area: 'all',
    tipo: 'all',
    categoria: 'all',
    search: '',
  });
  const [showAllComments, setShowAllComments] = useState(false);

  const options = useMemo(() => ({
    empresas: Array.from(new Set(intelligence.comments.map(item => item.empresa))).sort(),
    areas: Array.from(new Set(intelligence.comments.map(item => item.area))).sort(),
    tipos: Array.from(new Set(intelligence.comments.map(item => item.tipo))).sort(),
    categorias: Array.from(new Set(intelligence.comments.map(item => item.categoria))).sort(),
  }), [intelligence.comments]);

  const filtered = useMemo(() => {
    const now = new Date();
    return intelligence.comments.filter(item => {
      const date = new Date(item.fecha);
      const inDateRange =
        filters.fecha === 'all' ||
        (filters.fecha === 'month' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) ||
        (filters.fecha === 'week' && now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000);
      const search = normalize(filters.search.trim());

      return (
        (filters.empresa === 'all' || item.empresa === filters.empresa) &&
        inDateRange &&
        (filters.area === 'all' || item.area === filters.area) &&
        (filters.tipo === 'all' || item.tipo === filters.tipo) &&
        (filters.categoria === 'all' || item.categoria === filters.categoria) &&
        (!search || normalize(item.comentario).includes(search))
      );
    });
  }, [filters, intelligence.comments]);

  const highlighted = filtered.filter(item => item.destacado).slice(0, 3);
  const visibleComments = showAllComments ? filtered : filtered.slice(0, 5);

  const kpis = [
    { label: 'Comentarios este mes', value: intelligence.stats.thisMonth, icon: <MessageSquareText size={18} />, color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Felicitaciones', value: intelligence.stats.felicitaciones, icon: <CheckCircle2 size={18} />, color: '#059669', bg: '#ecfdf5' },
    { label: 'Sugerencias', value: intelligence.stats.sugerencias, icon: <Lightbulb size={18} />, color: '#d97706', bg: '#fffbeb' },
    { label: 'Problemas', value: intelligence.stats.problemas, icon: <AlertTriangle size={18} />, color: '#e11d48', bg: '#fff1f2' },
    { label: 'Sin clasificar', value: intelligence.stats.sinClasificar, icon: <Target size={18} />, color: '#64748b', bg: '#f8fafc' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h2 className="header-title" style={{ marginBottom: '0.35rem' }}>Centro de Feedback</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Inteligencia automática sobre respuestas del formulario semanal.
          </p>
        </div>
        <div style={{ padding: '0.55rem 0.85rem', borderRadius: '999px', background: '#f0fdfa', color: '#0f766e', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={15} /> Centro de Inteligencia
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '1.5rem' }}>
        <section className="card" style={{ margin: 0, padding: '1.5rem', border: '1px solid #eef0f3', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Qué dicen los usuarios</h3>
              <p style={{ margin: '0.15rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Resumen actualizado automáticamente</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { title: 'Lo más valorado', items: intelligence.summary.valued, color: '#059669', bg: '#ecfdf5' },
              { title: 'Lo más solicitado', items: intelligence.summary.requested, color: '#d97706', bg: '#fffbeb' },
              { title: 'Problemas detectados', items: intelligence.summary.issues, color: '#e11d48', bg: '#fff1f2' },
            ].map(group => (
              <div key={group.title} style={{ background: group.bg, borderRadius: 10, padding: '1rem', minHeight: 160 }}>
                <h4 style={{ margin: '0 0 0.75rem', color: group.color, fontSize: '0.9rem' }}>{group.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {group.items.length === 0 && <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>Sin datos.</p>}
                  {group.items.map(item => (
                    <p key={item} style={{ margin: 0, color: '#334155', fontSize: '0.84rem', lineHeight: 1.45 }}>• {item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ margin: 0, padding: '1.5rem', border: '1px solid #eef0f3', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Tendencias del mes</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {intelligence.trends.length === 0 && <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>Sin tendencias detectadas.</p>}
            {intelligence.trends.map(trend => (
              <div key={trend.tema} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{trend.text}</p>
                <p style={{ margin: '0.25rem 0 0', color: '#0d9488', fontSize: '0.8rem', fontWeight: 600 }}>{trend.action}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '1rem' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="card" style={{ margin: 0, padding: '1rem', border: '1px solid #eef0f3', borderRadius: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
              {kpi.icon}
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>{kpi.label}</p>
            <strong style={{ display: 'block', marginTop: '0.25rem', color: '#1e293b', fontSize: '1.6rem' }}>{kpi.value}</strong>
          </div>
        ))}
      </div>

      <section className="card" style={{ margin: 0, padding: '1.25rem', border: '1px solid #eef0f3', borderRadius: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr)) 1.6fr', gap: '0.75rem' }}>
          <select className="input-field" value={filters.empresa} onChange={e => setFilters({ ...filters, empresa: e.target.value })}>
            <option value="all">Empresa</option>
            {options.empresas.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <select className="input-field" value={filters.fecha} onChange={e => setFilters({ ...filters, fecha: e.target.value })}>
            <option value="all">Fecha</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este mes</option>
          </select>
          <select className="input-field" value={filters.area} onChange={e => setFilters({ ...filters, area: e.target.value })}>
            <option value="all">Área</option>
            {options.areas.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <select className="input-field" value={filters.tipo} onChange={e => setFilters({ ...filters, tipo: e.target.value })}>
            <option value="all">Tipo</option>
            {options.tipos.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <select className="input-field" value={filters.categoria} onChange={e => setFilters({ ...filters, categoria: e.target.value })}>
            <option value="all">Categoría</option>
            {options.categorias.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input-field" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Buscar por palabra" style={{ paddingLeft: 36 }} />
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '1.5rem', alignItems: 'start' }}>
        <section className="card" style={{ margin: 0, padding: '1.5rem', border: '1px solid #eef0f3', borderRadius: 12 }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>Comentarios destacados</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {highlighted.length === 0 && <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>Sin comentarios destacados.</p>}
            {highlighted.map(item => (
              <article key={item.id} style={{ padding: '1rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #eef0f3' }}>
                <p style={{ margin: '0 0 0.65rem', color: '#334155', lineHeight: 1.5, fontSize: '0.88rem' }}>{item.comentario}</p>
                <span style={{ color: '#0d9488', fontSize: '0.75rem', fontWeight: 700 }}>{item.empresa} · {item.categoria}</span>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Comentarios</h3>
            <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>{filtered.length} resultados</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: showAllComments ? 560 : 460, overflowY: showAllComments ? 'auto' : 'hidden', paddingRight: showAllComments ? '0.25rem' : 0 }}>
          {visibleComments.length === 0 && <div className="card" style={{ margin: 0, padding: '2rem', textAlign: 'center', color: '#64748b' }}>Todavía no hay comentarios.</div>}
          {visibleComments.map(item => {
            const tone = typeTone[item.tipo];
            return (
              <article key={item.id} className="card" style={{ margin: 0, padding: '0.9rem', border: '1px solid #eef0f3', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.65rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}><Building2 size={14} /> {item.empresa}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>·</span>
                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>{item.area}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: '0.75rem' }}><CalendarDays size={14} /> {formatDate(item.fecha)}</span>
                  </div>
                  <span style={{ background: tone.bg, color: tone.color, borderRadius: 999, padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {tone.icon} {item.tipo}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.7rem', color: '#1e293b', lineHeight: 1.45, fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.comentario}</p>
                <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', borderRadius: 999, padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}>{item.categoria}</span>
              </article>
            );
          })}
          </div>
          {filtered.length > 5 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAllComments(value => !value)}
              style={{ alignSelf: 'flex-start', padding: '0.55rem 0.9rem', borderRadius: 8, fontSize: '0.82rem' }}
            >
              {showAllComments ? 'Ver menos comentarios' : 'Ver todos los comentarios'}
            </button>
          )}
        </section>
      </div>
    </div>
  );
};

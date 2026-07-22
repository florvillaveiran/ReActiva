import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { Empresa } from '../../mock/data';
import { getDashboardPeriodRanges, type DashboardPeriod } from '../../lib/dashboardPeriods';
import { supabase } from '../../lib/supabase';

type CommentSort = 'newest' | 'oldest';
type CommentPeriod = DashboardPeriod | 'anual' | 'personalizado';

interface TeamComment {
  txt: string;
  role: string;
  author: string;
  email?: string;
  companyId?: string;
  fecha: string;
  energia?: number;
  feeling?: string;
  hasPain?: boolean;
  painZone?: string;
}

const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCommentDate = (value?: string) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
};

export const TeamCommentsModal: React.FC<{
  empresas: Empresa[];
  initialCompanyId: string;
  initialPeriod: DashboardPeriod;
  onClose: () => void;
}> = ({ empresas, initialCompanyId, initialPeriod, onClose }) => {
  const [sort, setSort] = useState<CommentSort>('newest');
  const [period, setPeriod] = useState<CommentPeriod>(initialPeriod);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [from, setFrom] = useState(() => localDateKey(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [to, setTo] = useState(() => localDateKey(new Date()));
  const [comments, setComments] = useState<TeamComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const selectedCompany = companyId === 'all'
    ? undefined
    : empresas.find(company => company.id.toString() === companyId || company.supabaseId === companyId);
  const statsCompanyId = companyId === 'all' ? undefined : selectedCompany?.supabaseId;
  const range = useMemo(() => {
    if (period === 'anual') return { from: `${year}-01-01`, to: `${year}-12-31` };
    if (period === 'personalizado') return { from, to };
    return getDashboardPeriodRanges(period).current;
  }, [from, period, to, year]);
  const rangeReady = !!range.from && !!range.to && range.from <= range.to;

  useEffect(() => {
    let active = true;
    const loadComments = async () => {
      if (!supabase || !rangeReady) {
        setComments([]);
        setLoadError('');
        return;
      }
      setLoading(true);
      setLoadError('');
      const exclusiveEnd = new Date(`${range.to}T00:00:00`);
      exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
      const [sessionsResult, profilesResult] = await Promise.all([
        supabase.rpc('get_analytics_pause_sessions', {
          target_company_id: statsCompanyId ?? null,
          target_work_profile: null,
          period_from: new Date(`${range.from}T00:00:00`).toISOString(),
          period_to: exclusiveEnd.toISOString(),
        }),
        (() => {
          let query = supabase
            .from('profiles')
            .select('id, full_name, email, work_profile, company_id')
            .eq('role', 'usuario');
          if (statsCompanyId) query = query.eq('company_id', statsCompanyId);
          return query;
        })(),
      ]);
      if (!active) return;
      if (sessionsResult.error) {
        console.error('No se pudieron cargar los comentarios del equipo', sessionsResult.error);
        setComments([]);
        setLoadError('No se pudieron cargar los comentarios. Intentá nuevamente.');
        setLoading(false);
        return;
      }
      const profiles = new Map((profilesResult.data ?? []).map((profile: any) => [profile.id, profile]));
      const mapped = (sessionsResult.data ?? []).flatMap((session: any): TeamComment[] => {
        const answers = session.answers ?? {};
        const text = answers.comentario ?? answers.mejora;
        if (typeof text !== 'string' || text.trim().length < 4) return [];
        const profile: any = profiles.get(session.profile_id);
        const workProfile = profile?.work_profile;
        return [{
          txt: text.trim(),
          role: workProfile === 'ADMINISTRATIVO' ? 'Administrativo' : workProfile === 'OPERATIVO' ? 'Operativo' : 'Sin perfil asignado',
          author: profile?.full_name?.trim() || profile?.email?.split('@')[0] || 'Usuario sin nombre',
          email: profile?.email ?? undefined,
          companyId: profile?.company_id ?? undefined,
          fecha: session.occurred_at,
          energia: typeof session.energy === 'number' ? session.energy : answers.energia,
          feeling: session.feeling ?? answers.feeling,
          hasPain: typeof session.has_pain === 'boolean' ? session.has_pain : answers.dolor,
          painZone: session.pain_zone ?? answers.zona,
        }];
      });
      setComments(mapped);
      setLoading(false);
    };
    void loadComments();
    return () => { active = false; };
  }, [range.from, range.to, rangeReady, statsCompanyId]);

  const groups = useMemo(() => {
    const companyNameFor = (comment: TeamComment) => empresas.find(company => (
      company.supabaseId === comment.companyId || company.id.toString() === comment.companyId
    ))?.nombre ?? selectedCompany?.nombre ?? 'Empresa sin identificar';
    const visibleComments = (rangeReady ? comments : []).map(comment => ({
      ...comment,
      companyName: companyNameFor(comment),
    }));
    visibleComments.sort((a, b) => sort === 'oldest'
      ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      : new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const byCompany = new Map<string, typeof visibleComments>();
    visibleComments.forEach(comment => byCompany.set(comment.companyName, [...(byCompany.get(comment.companyName) ?? []), comment]));
    return Array.from(byCompany.entries());
  }, [comments, empresas, rangeReady, selectedCompany, sort]);

  const periodLabel = period === 'semanal'
    ? 'esta semana'
    : period === 'mensual'
      ? 'este mes'
      : period === 'anual'
        ? `año ${year}`
        : rangeReady ? `${from} al ${to}` : 'período personalizado incompleto';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.48)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
      <section role="dialog" aria-modal="true" aria-label="Comentarios de La voz del equipo" style={{ background: '#f8fafc', borderRadius: 20, width: 'min(960px, 96vw)', maxHeight: '88vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1.2rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 900 }}>La voz del equipo</h3>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>{rangeReady ? comments.length : 0} comentarios · {periodLabel} · {selectedCompany?.nombre ?? 'Todas las empresas'}</p>
          </div>
          <button type="button" aria-label="Cerrar comentarios" onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', color: '#475569', cursor: 'pointer' }}><X size={19} /></button>
        </header>

        <div style={{ padding: '0.9rem 1.4rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="input-field" aria-label="Período de comentarios" value={period} onChange={event => setPeriod(event.target.value as CommentPeriod)} style={{ width: 155, margin: 0 }}>
            <option value="semanal">Esta semana</option>
            <option value="mensual">Este mes</option>
            <option value="anual">Anual</option>
            <option value="personalizado">Personalizado</option>
          </select>
          {period === 'anual' && (
            <select className="input-field" aria-label="Año de comentarios" value={year} onChange={event => setYear(event.target.value)} style={{ width: 105, margin: 0 }}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          )}
          {period === 'personalizado' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <input type="date" className="input-field" aria-label="Comentarios desde" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} style={{ width: 145, margin: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>hasta</span>
              <input type="date" className="input-field" aria-label="Comentarios hasta" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} style={{ width: 145, margin: 0 }} />
            </div>
          )}
          <select className="input-field" aria-label="Empresa de comentarios" value={companyId} onChange={event => setCompanyId(event.target.value)} style={{ width: 220, margin: 0 }}>
            <option value="all">Todas las empresas</option>
            {empresas.map(company => <option key={company.id} value={company.id.toString()}>{company.nombre}</option>)}
          </select>
          <select className="input-field" aria-label="Ordenar comentarios" value={sort} onChange={event => setSort(event.target.value as CommentSort)} style={{ width: 190, margin: 0, marginLeft: 'auto' }}>
            <option value="newest">Más recientes primero</option>
            <option value="oldest">Más antiguos primero</option>
          </select>
        </div>

        <div style={{ padding: '1.2rem 1.4rem', overflowY: 'auto', display: 'grid', gap: '1rem' }}>
          {groups.map(([companyName, comments]) => (
            <section key={companyName} style={{ display: 'grid', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <h4 style={{ margin: 0, color: '#334155', fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{companyName}</h4>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}</span>
              </div>
              {comments.map((comment, index) => (
                <article key={`${comment.fecha}-${comment.author}-${index}`} style={{ background: '#fff', border: '1px solid #e9d5ff', borderRadius: 14, padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <div>
                      <strong style={{ color: '#4c1d95', fontSize: '0.88rem' }}>{comment.author || 'Usuario sin nombre'}</strong>
                      <p style={{ margin: '0.1rem 0 0', color: '#64748b', fontSize: '0.72rem' }}>{comment.email ? `${comment.email} · ` : ''}{comment.role}</p>
                    </div>
                    <time dateTime={comment.fecha} style={{ color: '#64748b', fontSize: '0.72rem', textAlign: 'right' }}>{formatCommentDate(comment.fecha)}</time>
                  </div>
                  <p style={{ margin: 0, color: '#1e293b', fontSize: '0.9rem', lineHeight: 1.5 }}>“{comment.txt}”</p>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {typeof comment.energia === 'number' && <span style={{ padding: '0.25rem 0.5rem', background: '#fffbeb', color: '#b45309', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700 }}>Energía {comment.energia}/5</span>}
                    {comment.feeling && <span style={{ padding: '0.25rem 0.5rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700 }}>Estado: {comment.feeling}</span>}
                    {comment.hasPain === true && <span style={{ padding: '0.25rem 0.5rem', background: '#fff1f2', color: '#be123c', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700 }}>Molestia{comment.painZone ? `: ${comment.painZone}` : ''}</span>}
                    {comment.hasPain === false && <span style={{ padding: '0.25rem 0.5rem', background: '#ecfdf5', color: '#047857', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700 }}>Sin molestias</span>}
                  </div>
                </article>
              ))}
            </section>
          ))}
          {loading && <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>Cargando comentarios…</div>}
          {!loading && loadError && <div style={{ padding: '2.5rem', textAlign: 'center', color: '#b91c1c', background: '#fff', borderRadius: 14, border: '1px solid #fecaca' }}>{loadError}</div>}
          {!loading && !loadError && groups.length === 0 && <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>{rangeReady ? 'No hay comentarios para el período y la empresa seleccionados.' : 'Elegí una fecha inicial y final válidas.'}</div>}
        </div>
      </section>
    </div>
  );
};

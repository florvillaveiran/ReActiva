import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Award, Building2, CheckCircle2, Lightbulb, Target, TrendingDown, TrendingUp, Users, Zap, MessageSquare, ShieldAlert, Sparkles, ArrowRight, X } from 'lucide-react';
import { useEmpresas } from '../../context/EmpresasContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import { buildDashboardActions, buildDashboardInsights, buildImpactMetrics, buildReactivaScoreInsights } from '../../lib/dashboardIntelligence';
import { getDashboardPeriodRanges, type DashboardPeriod } from '../../lib/dashboardPeriods';
import { supabase } from '../../lib/supabase';
import { TeamCommentsModal } from './TeamCommentsModal';
import { averageScoreForPeriod, ReactivaTeamScorePanel } from '../../components/ReactivaTeamScorePanel';
import { useReactivaScoreSummary } from '../../hooks/useReactivaScoreSummary';

const statusFor = (participacion: number, molestias: number) => {
  if (participacion >= 75 && molestias <= 25) return { label: 'Excelente', color: '#059669', bg: '#ecfdf5', icon: <CheckCircle2 size={24} /> };
  if (participacion >= 50) return { label: 'Bueno', color: '#0d9488', bg: '#f0fdfa', icon: <TrendingUp size={24} /> };
  return { label: 'Atención', color: '#d97706', bg: '#fff7ed', icon: <AlertTriangle size={24} /> };
};

type DetailKey = 'participacion' | 'usuarios' | 'empresas' | 'puntaje' | 'estado';

interface DashboardProfileDetail {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  status?: string;
  workProfile?: string;
  pauses: number;
  latest?: string;
}

const Card: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  color: string;
  bg: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, value, helper, color, bg, active, onClick }) => (
  <button
    type="button"
    className="card"
    onClick={onClick}
    style={{
      margin: 0,
      padding: '0.9rem',
      borderRadius: 14,
      border: active ? `1.5px solid ${color}` : '1px solid #e2e8f0',
      boxShadow: active ? `0 8px 20px ${color}20` : '0 4px 12px rgba(15,23,42,0.03)',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
      <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>{label}</span>
      <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color, background: bg, flexShrink: 0 }}>{icon}</span>
    </div>
    <div>
      <strong style={{ display: 'block', color, fontSize: '1.6rem', lineHeight: 1, marginBottom: '0.2rem' }}>{value}</strong>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem', lineHeight: 1.2 }}>{helper}</p>
    </div>
  </button>
);

const Panel: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; bg?: string; borderColor?: string }> = ({ icon, title, children, bg = '#ffffff', borderColor = '#e2e8f0' }) => (
  <section className="card" style={{ margin: 0, padding: '1.1rem', borderRadius: 16, border: `1px solid ${borderColor}`, background: bg, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: '#0f172a', background: 'rgba(15,23,42,0.05)' }}>{icon}</span>
      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 850 }}>{title}</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0 }}>
      {children}
    </div>
  </section>
);

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { empresas } = useEmpresas();
  const [empresaId, setEmpresaId] = useState('all');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<DashboardPeriod>('semanal');
  const [selectedDetail, setSelectedDetail] = useState<DetailKey | null>(null);
  const [profileDetails, setProfileDetails] = useState<DashboardProfileDetail[]>([]);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const selectedEmpresa = empresaId === 'all'
    ? undefined
    : empresas.find(e => e.id.toString() === empresaId || e.supabaseId === empresaId);
  const statsCompanyId = empresaId === 'all' ? undefined : selectedEmpresa?.supabaseId;
  const periodRanges = useMemo(() => getDashboardPeriodRanges(analyticsPeriod), [analyticsPeriod]);
  const { from, to } = periodRanges.current;
  const stats = useAdminStats(statsCompanyId, from, to, 'ALL');
  const previousStats = useAdminStats(statsCompanyId, periodRanges.previous.from, periodRanges.previous.to, 'ALL');
  const administrativeStats = useAdminStats(statsCompanyId, from, to, 'ADMINISTRATIVO');
  const operativeStats = useAdminStats(statsCompanyId, from, to, 'OPERATIVO');
  const { summary: scoreSummary, loading: scoreLoading, unavailable: scoreUnavailable } = useReactivaScoreSummary(statsCompanyId);

  useEffect(() => {
    let mounted = true;

    const loadProfileDetails = async () => {
      if (!supabase) {
        setProfileDetails([]);
        return;
      }

      let profilesQuery = supabase
        .from('profiles')
        .select('id, company_id, email, full_name, role, status, work_profile')
        .eq('role', 'usuario');

      if (statsCompanyId) profilesQuery = profilesQuery.eq('company_id', statsCompanyId);

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError || !profiles) {
        if (mounted) setProfileDetails([]);
        return;
      }

      const profileIds = profiles.map((profile: any) => profile.id).filter(Boolean);
      const pauseCount = new Map<string, number>();
      const latestPause = new Map<string, string>();

      if (profileIds.length > 0) {
        const { data: pauses, error: pausesError } = await supabase
          .from('pause_sessions')
          .select('profile_id, occurred_at')
          .in('profile_id', profileIds)
          .gte('occurred_at', `${from}T00:00:00.000Z`)
          .lt('occurred_at', `${to}T23:59:59.999Z`)
          .order('occurred_at', { ascending: false });

        if (!pausesError) {
          (pauses ?? []).forEach((pause: any) => {
            if (!pause.profile_id) return;
            pauseCount.set(pause.profile_id, (pauseCount.get(pause.profile_id) ?? 0) + 1);
            if (!latestPause.get(pause.profile_id)) latestPause.set(pause.profile_id, pause.occurred_at);
          });
        }
      }

      const companyById = new Map(empresas.map(empresa => [empresa.supabaseId, empresa.nombre]));
      const details = profiles.map((profile: any) => ({
        id: profile.id,
        name: profile.full_name || profile.email?.split('@')[0] || 'Usuario',
        email: profile.email ?? 'Sin email',
        companyName: companyById.get(profile.company_id) ?? 'Sin empresa',
        status: profile.status === 'inactive' ? 'Inactivo' : 'Activo',
        workProfile: profile.work_profile,
        pauses: pauseCount.get(profile.id) ?? 0,
        latest: latestPause.get(profile.id),
      }));

      if (mounted) setProfileDetails(details);
    };

    void loadProfileDetails();

    const channel = supabase
      ? supabase
          .channel(`dashboard-detail-${statsCompanyId ?? 'all'}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => void loadProfileDetails())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pause_sessions' }, () => void loadProfileDetails())
          .subscribe()
      : null;

    return () => {
      mounted = false;
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [empresas, from, statsCompanyId, to]);

  const status = statusFor(stats.adherencia, stats.reportanMolestias);
  const insights = useMemo(() => [
    ...buildReactivaScoreInsights(scoreSummary),
    ...buildDashboardInsights(stats, administrativeStats, operativeStats, empresaId === 'all' ? 'global' : 'company'),
  ].slice(0, 5), [administrativeStats, empresaId, operativeStats, scoreSummary, stats]);
  const actions = useMemo(() => buildDashboardActions(insights), [insights]);
  const impact = useMemo(() => buildImpactMetrics(stats, previousStats), [previousStats, stats]);
  const activeCompanies = empresas.filter(empresa => empresa.estado === 'Activa').length;
  const activeProfiles = profileDetails.filter(profile => profile.pauses > 0);

  const simplifiedInsights = insights.map(insight => {
    if (insight.id === 'small-sample') return { ...insight, title: 'Muestra inicial', detail: 'Pocos datos para conclusiones sólidas.' };
    if (insight.id === 'low-participation') return { ...insight, title: 'Participación baja', detail: `La participación es ${stats.adherencia}%. Revisar accesos.` };
    if (insight.id === 'pain-signal') return { ...insight, title: 'Molestias reportadas', detail: insight.detail.replace('dolor', 'molestias'), source: insight.source.replace('dolor', 'molestias') };
    return insight;
  });

  const getIntelligenceCardStyle = (index: number) => {
    if (index === 0) return { label: 'Prioridad Alta', color: '#dc2626', icon: <ShieldAlert size={16} /> };
    if (index === 1) return { label: 'Oportunidad', color: '#d97706', icon: <Sparkles size={16} /> };
    if (index === 2) return { label: 'Hallazgo positivo', color: '#059669', icon: <CheckCircle2 size={16} /> };
    return { label: 'Recomendación', color: '#2563eb', icon: <Lightbulb size={16} /> };
  };

  const reactivaScoreAverage = scoreSummary ? averageScoreForPeriod(scoreSummary.users, analyticsPeriod) : 0;
  const reactivaScoreTone = reactivaScoreAverage >= 100 ? 'complete' : reactivaScoreAverage >= 90 ? 'near' : 'progress';
  const reactivaScoreTheme = reactivaScoreTone === 'complete'
    ? { color: '#047857', bg: '#ecfdf5', border: '#6ee7b7', helper: 'Racha completa' }
    : reactivaScoreTone === 'near'
      ? { color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', helper: 'A un paso de completar' }
      : { color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe', helper: 'En progreso' };

  const analyzeCommentsPattern = (comentarios: typeof stats.comentarios) => {
    if (comentarios.length === 0) return `Aún no hay suficientes comentarios ${analyticsPeriod === 'semanal' ? 'esta semana' : 'este mes'}.`;
    const text = comentarios.map(c => c.txt.toLowerCase()).join(' ');
    if (text.includes('cuello') || text.includes('cervical')) return 'La mayoría de los comentarios son positivos respecto a la movilidad cervical.';
    if (text.includes('espalda') || text.includes('lumbar')) return 'Se detecta un patrón de alivio en la zona lumbar y espalda baja.';
    if (text.includes('viernes') || text.includes('tiempo')) return 'Hay menciones sobre la dificultad para encontrar tiempo los días viernes.';
    if (text.includes('estrés') || text.includes('tension')) return 'Los usuarios destacan el impacto positivo de las pausas en la reducción del estrés.';
    return 'Los colaboradores expresan que las pausas ayudan a cortar la jornada de forma positiva.';
  };
  const iaDetection = analyzeCommentsPattern(stats.comentarios);

  const openComments = () => {
    setShowComments(true);
  };

  const formatShortDate = (value?: string) => {
    if (!value) return 'Sin pausas';
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(value));
  };

  const detailTitle: Record<DetailKey, string> = {
    participacion: `Detalle de participación ${analyticsPeriod === 'semanal' ? 'semanal' : 'mensual'}`,
    usuarios: 'Usuarios con actividad',
    empresas: 'Empresas registradas',
    puntaje: `Puntaje ReActiva ${analyticsPeriod === 'semanal' ? 'semanal' : 'mensual'}`,
    estado: 'Por qué el estado es atención',
  };

  const mainAction = actions.length > 0 ? actions[0] : { title: 'Sostener seguimiento', detail: 'No hay alertas críticas. Mantener medición semanal y revisar evolución con más datos.', priority: 'Baja', id: 'sostener' };

  return (
    <div className="admin-dashboard-page" style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem', padding: '0.5rem 0' }}>
      
      {/* TOOLBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>Dashboard Admin</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <select className="input-field" aria-label="Período del dashboard" style={{ width: 140, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: 'var(--bg-color)', fontWeight: 600, margin: 0 }} value={analyticsPeriod} onChange={(e) => setAnalyticsPeriod(e.target.value as DashboardPeriod)}>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
          <select
            className="input-field"
            style={{ width: 220, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: 'var(--bg-color)', fontWeight: 600, margin: 0 }}
            value={empresaId}
            onChange={(e) => {
              setEmpresaId(e.target.value);
              setSelectedDetail(null);
            }}
          >
            <option value="all">Todas las empresas</option>
            {empresas.map(emp => <option key={emp.id} value={emp.id.toString()}>{emp.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* FILA 1: KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
        <Card icon={<TrendingUp size={16} />} label="Participación" value={`${stats.adherencia}%`} helper={`${stats.totalPausas} pausas hechas`} color="#0f766e" bg="#ccfbf1" active={selectedDetail === 'participacion'} onClick={() => setSelectedDetail(selectedDetail === 'participacion' ? null : 'participacion')} />
        <Card icon={<Users size={16} />} label="Usuarios activos" value={String(stats.usuariosCount)} helper={`Con actividad ${periodRanges.label}`} color="#1d4ed8" bg="#dbeafe" active={selectedDetail === 'usuarios'} onClick={() => setSelectedDetail(selectedDetail === 'usuarios' ? null : 'usuarios')} />
        <Card icon={<Building2 size={16} />} label="Empresas" value={String(empresas.length)} helper={`${activeCompanies} activas`} color="#6d28d9" bg="#ede9fe" active={selectedDetail === 'empresas'} onClick={() => setSelectedDetail(selectedDetail === 'empresas' ? null : 'empresas')} />
        
        {/* Puntaje ReActiva: constancia real, no un indice inferido */}
        <button type="button" className={`card reactiva-overview-card ${reactivaScoreTone}`} onClick={() => setSelectedDetail(selectedDetail === 'puntaje' ? null : 'puntaje')} style={{ margin: 0, padding: '0.9rem', borderRadius: 14, border: selectedDetail === 'puntaje' ? `1.5px solid ${reactivaScoreTheme.color}` : `1px solid ${reactivaScoreTheme.border}`, background: reactivaScoreTheme.bg, boxShadow: selectedDetail === 'puntaje' ? `0 8px 22px ${reactivaScoreTheme.color}20` : '0 4px 12px rgba(15,23,42,0.03)', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>Puntaje ReActiva</span>
            <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: reactivaScoreTheme.color, background: '#fff', flexShrink: 0 }}><Award size={16} /></span>
          </div>
          <div>
            <strong style={{ display: 'block', color: reactivaScoreTheme.color, fontSize: '1.6rem', lineHeight: 1, marginBottom: '0.2rem' }}>{scoreLoading || scoreUnavailable || !scoreSummary ? '—' : Math.round(reactivaScoreAverage)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{scoreSummary ? '%' : ''}</span></strong>
            {scoreUnavailable && <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem', lineHeight: 1.2 }}>Pendiente de sincronización</p>}
            {scoreSummary && <span className="reactiva-overview-progress"><i style={{ width: `${Math.min(100, Math.max(0, reactivaScoreAverage))}%` }} /></span>}
          </div>
        </button>

        {/* Estado General destacado */}
        <button type="button" className="card" onClick={() => setSelectedDetail(selectedDetail === 'estado' ? null : 'estado')} style={{ margin: 0, padding: '0.9rem', borderRadius: 14, border: `2px solid ${status.color}`, background: status.bg, textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ color: status.color }}>{status.icon}</span>
            <span style={{ color: status.color, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Estado general</span>
          </div>
          <strong style={{ display: 'block', color: status.color, fontSize: '1.5rem', lineHeight: 1.1, marginBottom: '0.2rem' }}>{status.label}</strong>
          <p style={{ margin: 0, color: status.color, opacity: 0.85, fontSize: '0.72rem', lineHeight: 1.2 }}>Ver detalle del estado</p>
        </button>
      </div>

      {/* DETALLE EXPANDIBLE (RESTORED) */}
      {selectedDetail && (
        <section className="card" style={{ margin: 0, padding: '1rem', borderRadius: 16, border: '1px solid #dbeafe', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.9rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 850 }}>{detailTitle[selectedDetail]}</h3>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setSelectedDetail(null)} style={{ padding: '0.35rem 0.6rem', borderRadius: 8, fontSize: '0.75rem' }}>Cerrar</button>
          </div>

          {selectedDetail === 'participacion' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
              {stats.participacionPorDia.map(day => (
                <div key={day.name} style={{ padding: '0.75rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>{day.name}</strong>
                  <p style={{ margin: '0.2rem 0 0', color: '#00bfa6', fontSize: '1.2rem', fontWeight: 850 }}>{day.participacion}%</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.7rem' }}>Participación del día</p>
                </div>
              ))}
            </div>
          )}

          {selectedDetail === 'usuarios' && (
            <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {(activeProfiles.length > 0 ? activeProfiles : profileDetails).slice(0, 5).map(profile => (
                <div key={profile.id} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr auto', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0.8rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>{profile.name}</strong>
                    <p style={{ margin: '0', color: '#64748b', fontSize: '0.7rem' }}>{profile.email}</p>
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>{profile.companyName} · {profile.workProfile ?? 'Sin perfil'}</p>
                  <strong style={{ color: profile.pauses > 0 ? '#00bfa6' : '#94a3b8', fontSize: '0.75rem' }}>{profile.pauses} pausas · {formatShortDate(profile.latest)}</strong>
                </div>
              ))}
              {profileDetails.length === 0 && <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Todavía no hay usuarios disponibles para este filtro.</p>}
            </div>
          )}

          {selectedDetail === 'empresas' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
              {empresas.map(empresa => (
                <div key={empresa.id} style={{ padding: '0.75rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>{empresa.nombre}</strong>
                  <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.75rem' }}>{empresa.estado} · {empresa.empleados.length} usuarios · {empresa.ubicacion || 'Sin ubicación'}</p>
                </div>
              ))}
            </div>
          )}

          {selectedDetail === 'puntaje' && (
            <ReactivaTeamScorePanel
              companyId={statsCompanyId}
              period={analyticsPeriod}
              title={empresaId === 'all' ? 'Puntaje de todas las empresas' : `Puntaje de ${selectedEmpresa?.nombre ?? 'la empresa'}`}
              showExportActions
              showCompanyFilter={empresaId === 'all'}
            />
          )}

          {selectedDetail === 'estado' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <strong style={{ color: '#9a3412', fontSize: '0.8rem' }}>Participación</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#0f172a', fontSize: '0.9rem' }}>{stats.adherencia}% {analyticsPeriod === 'semanal' ? 'semanal' : 'mensual'}</p>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>Energía</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#0f172a', fontSize: '0.9rem' }}>{stats.energiaPromedio ? stats.energiaPromedio.toFixed(1) : 'Sin datos'} / 5</p>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>Molestias</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#0f172a', fontSize: '0.9rem' }}>{stats.reportanMolestias}% reportadas</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* FILA 2: CENTRO DE INTELIGENCIA */}
      <section style={{ background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ color: '#166534' }}><Lightbulb size={18} /></span>
          <h3 style={{ margin: 0, color: '#14532d', fontSize: '0.9rem', fontWeight: 850 }}>Lo más importante</h3>
          <span style={{ color: '#166534', fontSize: '0.75rem', opacity: 0.8 }}>Resumen claro del período elegido</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {simplifiedInsights.slice(0, 4).map((insight, idx) => {
            const style = getIntelligenceCardStyle(idx);
            return (
              <div key={insight.id} style={{ padding: '0.8rem', borderRadius: 12, background: 'white', border: `1px solid ${style.color}30`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: style.color, marginBottom: '0.4rem', fontSize: '0.78rem', fontWeight: 800 }}>
                  {style.icon} {style.label}
                </div>
                <p style={{ margin: '0 0 0.5rem', color: '#334155', fontSize: '0.78rem', lineHeight: 1.35, flex: 1 }}>{insight.title}: {insight.detail}</p>
                <button onClick={() => navigate('/plataforma/admin/analiticas')} style={{ background: 'none', border: 'none', padding: 0, color: style.color, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>Ver detalle →</button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FILA 3: ACCION, IMPACTO, VOZ DEL EQUIPO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', flex: 1, minHeight: 0 }}>
        
        {/* Qué hacer ahora */}
        <Panel icon={<Target size={16} />} title="Qué hacer ahora" bg="#f0f9ff" borderColor="#bae6fd">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <div style={{ padding: '1.2rem', borderRadius: 14, background: '#fff', border: '1px solid #e0f2fe', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: mainAction.priority === 'Alta' ? '#dc2626' : mainAction.priority === 'Media' ? '#d97706' : '#059669' }}></div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.9rem', fontWeight: 800 }}>{mainAction.title}</h4>
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem', lineHeight: 1.4 }}>{mainAction.detail}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: mainAction.priority === 'Alta' ? '#dc2626' : mainAction.priority === 'Media' ? '#d97706' : '#059669', fontWeight: 700 }}>Prioridad {mainAction.priority} · {mainAction.id === 'sostener' ? 'Informativo' : 'Acción requerida'}</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (mainAction.id === 'sostener') navigate('/plataforma/admin/analiticas');
                  else if (mainAction.id === 'review-reminders') navigate('/plataforma/admin/emails');
                  else setShowActionPlan(true);
                }}
                style={{ marginTop: '0.5rem', alignSelf: 'flex-start', background: 'transparent', border: '1.5px solid #0369a1', color: '#0369a1', padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Revisar
              </button>
            </div>
          </div>
        </Panel>

        {/* Impacto del programa */}
        <Panel icon={<Activity size={16} />} title="Impacto del programa" bg="#f8fafc" borderColor="#e2e8f0">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'space-between' }}>
            {impact.slice(0, 3).map((metric, index) => {
              const isPositive = metric.tone === 'positive';
              const color = isPositive ? '#059669' : metric.tone === 'warning' ? '#dc2626' : '#64748b';
              const label = metric.label === 'Dolor reportado' ? 'Molestias reportadas' : metric.label;
              return (
                <div key={metric.label} style={{ padding: '0.75rem', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '0 0 0.1rem', color: '#0f172a', fontWeight: 800, fontSize: '0.8rem' }}>{label}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem' }}>Antes {metric.previous} · Ahora {metric.current}</p>
                  </div>
                  <strong style={{ color, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>{isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{metric.delta}</strong>
                </div>
              );
            })}
            <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textAlign: 'right', padding: 0 }} onClick={() => navigate('/plataforma/admin/analiticas')}>Ver analíticas completas →</button>
          </div>
        </Panel>

        {/* La voz del equipo */}
        <Panel icon={<MessageSquare size={16} />} title="La voz del equipo" bg="#faf5ff" borderColor="#e9d5ff">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.comentarios.length > 0 ? stats.comentarios.slice(0, 3).map((c, i) => (
                <button type="button" onClick={openComments} key={i} style={{ width: '100%', padding: '0.6rem', borderRadius: 10, background: '#fff', border: '1px solid #f3e8ff', cursor: 'pointer', textAlign: 'left' }}>
                  <p style={{ margin: '0 0 0.2rem', color: '#4c1d95', fontSize: '0.76rem', fontWeight: 600, fontStyle: 'italic' }}>"{c.txt}"</p>
                  <p style={{ margin: 0, color: '#a855f7', fontSize: '0.65rem', fontWeight: 700 }}>{c.author} · {c.role}</p>
                </button>
              )) : (
                <div style={{ padding: '0.6rem', borderRadius: 10, background: '#fff', border: '1px solid #f3e8ff' }}>
                  <p style={{ margin: 0, color: '#a855f7', fontSize: '0.75rem' }}>Aún no hay comentarios {analyticsPeriod === 'semanal' ? 'esta semana' : 'este mes'}.</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', padding: '0.6rem', background: '#f3e8ff', borderRadius: 8, marginTop: 'auto' }}>
              <span style={{ color: '#9333ea', marginTop: 2 }}><Sparkles size={12} /></span>
              <p style={{ margin: 0, color: '#7e22ce', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.2 }}>
                <strong style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, marginBottom: 2 }}>IA Detectó</strong>
                {iaDetection}
              </p>
            </div>
            <button
              type="button"
              onClick={openComments}
              style={{ background: 'transparent', border: 'none', color: '#7e22ce', padding: '0.2rem 0', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', textAlign: 'right' }}
            >
              Ver y ordenar todos los comentarios →
            </button>
          </div>
        </Panel>

      </div>

      {/* FILA 4: RESUMEN EJECUTIVO */}
      <div style={{ background: '#0f172a', borderRadius: 12, padding: '0.75rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', color: '#10b981' }}><ArrowRight size={16} /></div>
          <div>
            <h4 style={{ margin: 0, color: 'white', fontSize: '0.8rem', fontWeight: 800 }}>Resumen ejecutivo</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem' }}>La participación general indica adherencia. Aplicar un plan de acción proactivo puede estabilizar y mejorar estos resultados en el tiempo.</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowActionPlan(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Ver plan de acción sugerido →</button>
      </div>

      {showComments && (
        <TeamCommentsModal
          empresas={empresas}
          initialCompanyId={empresaId}
          initialPeriod={analyticsPeriod}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* MODAL PLAN DE ACCIÓN */}
      {showActionPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 500, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: 900 }}>Plan de Acción Sugerido</h3>
              <button onClick={() => setShowActionPlan(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>1. Revisar y optimizar recordatorios</strong>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>Asegurarse de que los correos automáticos estén llegando 10 minutos antes del bloque seleccionado.</p>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>2. Compartir resultados en reunión general</strong>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>Visibilizar los impactos positivos (ej. reducción de estrés) para motivar a los que aún no participan.</p>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>3. Ajustar programación semanal</strong>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>Dado que {iaDetection.toLowerCase()} se sugiere incluir más pausas orientadas a ese foco.</p>
              </div>
            </div>
            
            <button 
              onClick={() => { setShowActionPlan(false); navigate('/plataforma/admin/emails'); }} 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', borderRadius: 12 }}
            >
              Ir a Recordatorios y Emails
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

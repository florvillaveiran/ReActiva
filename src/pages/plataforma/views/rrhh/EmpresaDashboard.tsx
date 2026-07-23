import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Award, BarChart3, HeartPulse, Lightbulb, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmpresas } from '../../context/EmpresasContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import { buildDashboardActions, buildDashboardInsights, buildImpactMetrics, buildReactivaScoreInsights } from '../../lib/dashboardIntelligence';
import { getDashboardPeriodRanges, type DashboardPeriod } from '../../lib/dashboardPeriods';
import { averageScoreForPeriod, ReactivaTeamScorePanel } from '../../components/ReactivaTeamScorePanel';
import { useReactivaScoreSummary } from '../../hooks/useReactivaScoreSummary';

const MetricCard: React.FC<{
  label: string;
  value: string;
  helper?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  onClick?: () => void;
  active?: boolean;
  progress?: number;
  tone?: 'progress' | 'near' | 'complete';
  actionLabel?: string;
}> = ({ label, value, helper, icon, color, bg, onClick, active = false, progress, tone = 'progress', actionLabel }) => {
  const content = <>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
      <span style={{ color: '#64748b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: bg, color }}>{icon}</span>
    </div>
    {progress !== undefined ? (
      <div className="rrhh-metric-score-row">
        <strong style={{ display: 'block', color, fontSize: '2rem', lineHeight: 1 }}>{value}</strong>
        <span className="rrhh-metric-card-progress">
          <i style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </span>
      </div>
    ) : (
      <strong style={{ display: 'block', color, fontSize: '2rem', lineHeight: 1, marginBottom: '0.4rem' }}>{value}</strong>
    )}
    {helper && <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem', lineHeight: 1.35 }}>{helper}</p>}
    {actionLabel && <span className="rrhh-metric-card-action" style={{ color }}>{actionLabel}<span aria-hidden="true">→</span></span>}
  </>;

  const style: React.CSSProperties = {
    padding: '1.25rem',
    margin: 0,
    borderRadius: 16,
    border: active ? `1px solid ${color}` : '1px solid #eef2f7',
    boxShadow: active ? `0 10px 30px ${color}20` : '0 8px 26px rgba(15,23,42,0.04)',
  };

  if (onClick) {
    return (
      <button
        type="button"
        className={`card rrhh-metric-card rrhh-metric-card-button ${tone}`}
        onClick={onClick}
        aria-expanded={active}
        style={{ ...style, width: '100%', background: '#fff', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
      >
        {content}
      </button>
    );
  }

  return <div className="card rrhh-metric-card" style={style}>{content}</div>;
};

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="card" style={{ padding: '1.1rem', margin: 0, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 6px 22px rgba(15,23,42,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.8rem' }}>
      <span style={{ width: 36, height: 36, borderRadius: 12, background: '#ecfdf5', color: '#0f766e', display: 'grid', placeItems: 'center' }}>{icon}</span>
      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>{title}</h3>
    </div>
    {children}
  </section>
);

export const EmpresaDashboard: React.FC = () => {
  const { user } = useAuth();
  const { empresas } = useEmpresas();
  const navigate = useNavigate();
  const [analyticsPeriod, setAnalyticsPeriod] = useState<DashboardPeriod>('semanal');
  const [showScoreDetail, setShowScoreDetail] = useState(false);

  const empresa = useMemo(() => {
    if (user?.isDemo) return undefined;
    const key = user?.empresa_id?.toString();
    return empresas.find(item => item.supabaseId === key || item.id.toString() === key);
  }, [empresas, user?.empresa_id, user?.isDemo]);

  const companyId = user?.isDemo ? undefined : empresa?.supabaseId ?? user?.empresa_id?.toString();
  const periodRanges = useMemo(() => getDashboardPeriodRanges(analyticsPeriod), [analyticsPeriod]);
  const currentStats = useAdminStats(companyId, periodRanges.current.from, periodRanges.current.to, 'ALL');
  const previousStats = useAdminStats(companyId, periodRanges.previous.from, periodRanges.previous.to, 'ALL');
  const administrativeStats = useAdminStats(companyId, periodRanges.current.from, periodRanges.current.to, 'ADMINISTRATIVO');
  const operativeStats = useAdminStats(companyId, periodRanges.current.from, periodRanges.current.to, 'OPERATIVO');
  const { summary: scoreSummary } = useReactivaScoreSummary(companyId, !user?.isDemo);
  const reactivaAverage = scoreSummary ? averageScoreForPeriod(scoreSummary.users, analyticsPeriod) : null;
  const reactivaTone = (reactivaAverage ?? 0) >= 100 ? 'complete' : (reactivaAverage ?? 0) >= 90 ? 'near' : 'progress';
  const reactivaTheme = reactivaTone === 'complete'
    ? { color: '#047857', bg: '#ecfdf5', helper: 'Racha completa' }
    : reactivaTone === 'near'
      ? { color: '#c2410c', bg: '#fff7ed', helper: 'A un paso de completar' }
      : { color: '#0369a1', bg: '#eff6ff', helper: 'En progreso' };

  const insights = useMemo(() => [
    ...buildReactivaScoreInsights(scoreSummary),
    ...buildDashboardInsights(currentStats, administrativeStats, operativeStats, 'company'),
  ].slice(0, 5), [administrativeStats, currentStats, operativeStats, scoreSummary]);
  const actions = useMemo(() => buildDashboardActions(insights), [insights]);
  const impact = useMemo(() => buildImpactMetrics(currentStats, previousStats), [currentStats, previousStats]);

  const companyName = user?.isDemo ? 'Empresa Alpha' : empresa?.nombre ?? 'Tu empresa';

  return (
    <div className="empresa-dashboard-page" style={{ animation: 'fadeIn 0.35s ease-out' }}>
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ margin: '0 0 0.35rem', color: '#0f766e', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Inicio del Panel Empresa</p>
          <h2 className="header-title" style={{ margin: 0 }}>{companyName}</h2>
          <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>Resumen ejecutivo con datos de {periodRanges.label}.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <select className="input-field" aria-label="Período del dashboard" style={{ width: 140, backgroundColor: 'white', margin: 0 }} value={analyticsPeriod} onChange={(event) => setAnalyticsPeriod(event.target.value as DashboardPeriod)}>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
          <button className="btn-primary" type="button" onClick={() => navigate('/plataforma/rrhh/analiticas')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} /> Ver analíticas
          </button>
        </div>
      </div>

      <div className="rrhh-dashboard-kpis" style={{ marginBottom: '1.25rem' }}>
        <MetricCard label="Participación" value={`${currentStats.adherencia}%`} helper={`${currentStats.totalPausas} pausas completadas`} icon={<Activity size={19} />} color="#00bfa6" bg="#e6fffb" />
        <MetricCard label="Energía" value={currentStats.energiaPromedio ? `${currentStats.energiaPromedio.toFixed(1)}/5` : '0/5'} helper="Promedio de respuestas" icon={<Zap size={19} />} color="#f59e0b" bg="#fff7ed" />
        <MetricCard label="Foco" value={`${currentStats.foco.enfocado}%`} helper="Respuestas enfocadas" icon={<Target size={19} />} color="#3b82f6" bg="#eff6ff" />
        <MetricCard label="Dolor" value={`${currentStats.reportanMolestias}%`} helper={currentStats.zonasDolorTop[0] ? `Zona principal: ${currentStats.zonasDolorTop[0]}` : 'Sin zona principal'} icon={<HeartPulse size={19} />} color="#f43f5e" bg="#fff1f2" />
        <MetricCard label="Usuarios" value={String(currentStats.usuariosCount)} helper="Con actividad registrada" icon={<Users size={19} />} color="#8b5cf6" bg="#f5f3ff" />
        <MetricCard
          label="Puntaje ReActiva"
          value={reactivaAverage === null ? '—' : `${Math.round(reactivaAverage)}%`}
          icon={<Award size={19} />}
          color={reactivaTheme.color}
          bg={reactivaTheme.bg}
          onClick={() => setShowScoreDetail(current => !current)}
          active={showScoreDetail}
          progress={reactivaAverage ?? undefined}
          tone={reactivaTone}
          actionLabel={showScoreDetail ? 'Ocultar detalle' : 'Ver detalle'}
        />
      </div>

      {showScoreDetail && (
        <div className="rrhh-reactiva-score-detail" style={{ marginBottom: '1.25rem' }}>
          <ReactivaTeamScorePanel
            companyId={companyId}
            period={analyticsPeriod}
            title="Puntaje ReActiva del equipo"
            enabled={!user?.isDemo}
            showExportActions={false}
            showCompanyFilter={false}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <SectionCard title="Lo más importante" icon={<Lightbulb size={18} />}>
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {insights.map(insight => (
              <div key={insight.id} style={{ padding: '0.75rem 0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong style={{ color: '#0f172a' }}>{insight.title}</strong>
                </div>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.5, fontSize: '0.88rem' }}>{insight.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Qué hacer ahora" icon={<AlertTriangle size={18} />}>
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {actions.map(action => (
              <div key={action.id} style={{ padding: '0.75rem 0.85rem', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#0f172a' }}>{action.title}</strong>
                  <span style={{ color: action.owner === 'ReActiva' ? '#7c3aed' : action.owner === 'RRHH' ? '#0f766e' : '#64748b', fontSize: '0.72rem', fontWeight: 800 }}>{action.owner}</span>
                </div>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.45, fontSize: '0.86rem' }}>{action.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Centro de Impacto" icon={<TrendingUp size={18} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
          {impact.map(metric => (
            <div key={metric.label} style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.55rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800 }}>{metric.label}</p>
              <strong style={{ color: '#0f172a', fontSize: '1.45rem' }}>{metric.current}</strong>
              <p style={{ margin: '0.35rem 0 0', color: metric.tone === 'positive' ? '#059669' : metric.tone === 'warning' ? '#dc2626' : '#64748b', fontWeight: 800 }}>
                {metric.delta} <span style={{ color: '#94a3b8', fontWeight: 600 }}>vs {metric.previous}</span>
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

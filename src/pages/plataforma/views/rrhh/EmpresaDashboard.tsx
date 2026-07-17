import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, BarChart3, Building2, HeartPulse, Lightbulb, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmpresas } from '../../context/EmpresasContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import { buildDashboardActions, buildDashboardInsights, buildImpactMetrics } from '../../lib/dashboardIntelligence';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoDate(date);
};

const MetricCard: React.FC<{ label: string; value: string; helper: string; icon: React.ReactNode; color: string; bg: string }> = ({ label, value, helper, icon, color, bg }) => (
  <div className="card" style={{ padding: '1.25rem', margin: 0, borderRadius: 16, border: '1px solid #eef2f7', boxShadow: '0 8px 26px rgba(15,23,42,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
      <span style={{ color: '#64748b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: bg, color }}>{icon}</span>
    </div>
    <strong style={{ display: 'block', color, fontSize: '2rem', lineHeight: 1, marginBottom: '0.55rem' }}>{value}</strong>
    <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem', lineHeight: 1.45 }}>{helper}</p>
  </div>
);

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="card" style={{ padding: '1.35rem', margin: 0, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 8px 28px rgba(15,23,42,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
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

  const empresa = useMemo(() => {
    if (user?.isDemo) return undefined;
    const key = user?.empresa_id?.toString();
    return empresas.find(item => item.supabaseId === key || item.id.toString() === key);
  }, [empresas, user?.empresa_id, user?.isDemo]);

  const companyId = user?.isDemo ? undefined : empresa?.supabaseId ?? user?.empresa_id?.toString();
  const currentStats = useAdminStats(companyId, daysAgo(30), isoDate(new Date()), 'ALL');
  const previousStats = useAdminStats(companyId, daysAgo(60), daysAgo(31), 'ALL');
  const administrativeStats = useAdminStats(companyId, daysAgo(30), isoDate(new Date()), 'ADMINISTRATIVO');
  const operativeStats = useAdminStats(companyId, daysAgo(30), isoDate(new Date()), 'OPERATIVO');

  const insights = useMemo(
    () => buildDashboardInsights(currentStats, administrativeStats, operativeStats, 'company'),
    [administrativeStats, currentStats, operativeStats],
  );
  const actions = useMemo(() => buildDashboardActions(insights), [insights]);
  const impact = useMemo(() => buildImpactMetrics(currentStats, previousStats), [currentStats, previousStats]);

  const companyName = user?.isDemo ? 'Empresa Alpha' : empresa?.nombre ?? 'Tu empresa';

  return (
    <div className="empresa-dashboard-page" style={{ animation: 'fadeIn 0.35s ease-out' }}>
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ margin: '0 0 0.35rem', color: '#0f766e', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Inicio del Panel Empresa</p>
          <h2 className="header-title" style={{ margin: 0 }}>{companyName}</h2>
          <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>Resumen ejecutivo con datos de los últimos 30 días.</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => navigate('/plataforma/rrhh/analiticas')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} /> Ver analíticas
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <MetricCard label="Participación" value={`${currentStats.adherencia}%`} helper={`${currentStats.totalPausas} pausas completadas`} icon={<Activity size={19} />} color="#00bfa6" bg="#e6fffb" />
        <MetricCard label="Energía" value={currentStats.energiaPromedio ? `${currentStats.energiaPromedio.toFixed(1)}/5` : '0/5'} helper="Promedio de respuestas" icon={<Zap size={19} />} color="#f59e0b" bg="#fff7ed" />
        <MetricCard label="Foco" value={`${currentStats.foco.enfocado}%`} helper="Respuestas enfocadas" icon={<Target size={19} />} color="#3b82f6" bg="#eff6ff" />
        <MetricCard label="Dolor" value={`${currentStats.reportanMolestias}%`} helper={currentStats.zonasDolorTop[0] ? `Zona principal: ${currentStats.zonasDolorTop[0]}` : 'Sin zona principal'} icon={<HeartPulse size={19} />} color="#f43f5e" bg="#fff1f2" />
        <MetricCard label="Usuarios" value={String(currentStats.usuariosCount)} helper="Con actividad registrada" icon={<Users size={19} />} color="#8b5cf6" bg="#f5f3ff" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <SectionCard title="Centro de Inteligencia" icon={<Lightbulb size={18} />}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {insights.map(insight => (
              <div key={insight.id} style={{ padding: '0.9rem 1rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#0f172a' }}>{insight.title}</strong>
                  <span style={{ color: '#0f766e', fontSize: '0.72rem', fontWeight: 800 }}>Confianza {insight.confidence}</span>
                </div>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.5, fontSize: '0.88rem' }}>{insight.detail}</p>
                <p style={{ margin: '0.45rem 0 0', color: '#94a3b8', fontSize: '0.76rem' }}>Fuente: {insight.source}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Centro de Acción" icon={<AlertTriangle size={18} />}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {actions.map(action => (
              <div key={action.id} style={{ padding: '0.9rem 1rem', borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
          {impact.map(metric => (
            <div key={metric.label} style={{ padding: '1rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.55rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800 }}>{metric.label}</p>
              <strong style={{ color: '#0f172a', fontSize: '1.45rem' }}>{metric.current}</strong>
              <p style={{ margin: '0.35rem 0 0', color: metric.tone === 'positive' ? '#059669' : metric.tone === 'warning' ? '#dc2626' : '#64748b', fontWeight: 800 }}>
                {metric.delta} <span style={{ color: '#94a3b8', fontWeight: 600 }}>vs {metric.previous}</span>
              </p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: 12, background: '#f0fdfa', color: '#0f766e', fontWeight: 700, fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Building2 size={17} /> Los indicadores comparan períodos, pero no atribuyen causalidad automática.
        </div>
      </SectionCard>
    </div>
  );
};

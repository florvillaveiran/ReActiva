import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Building2, CheckCircle2, Lightbulb, Target, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react';
import { useEmpresas } from '../../context/EmpresasContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import { buildDashboardActions, buildDashboardInsights, buildImpactMetrics } from '../../lib/dashboardIntelligence';
import { supabase } from '../../lib/supabase';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoDate(date);
};

const statusFor = (participacion: number, molestias: number) => {
  if (participacion >= 75 && molestias <= 25) return { label: 'Excelente', color: '#059669', bg: '#ecfdf5' };
  if (participacion >= 50) return { label: 'Bueno', color: '#0d9488', bg: '#f0fdfa' };
  return { label: 'Atención', color: '#d97706', bg: '#fff7ed' };
};

type DetailKey = 'participacion' | 'usuarios' | 'empresas' | 'estado';

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
      padding: '1.2rem',
      borderRadius: 16,
      border: active ? `2px solid ${color}` : '1px solid #e2e8f0',
      boxShadow: active ? `0 10px 28px ${color}20` : '0 8px 24px rgba(15,23,42,0.04)',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.85rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', color, background: bg }}>{icon}</span>
    </div>
    <strong style={{ display: 'block', color, fontSize: '2rem', lineHeight: 1, marginBottom: '0.45rem' }}>{value}</strong>
    <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem', lineHeight: 1.45 }}>{helper}</p>
  </button>
);

const Panel: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ icon, title, children, action }) => (
  <section className="card" style={{ margin: 0, padding: '1.35rem', borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 8px 26px rgba(15,23,42,0.04)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <span style={{ width: 38, height: 38, borderRadius: 13, display: 'grid', placeItems: 'center', color: '#0f766e', background: '#ecfdf5' }}>{icon}</span>
        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 850 }}>{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { empresas } = useEmpresas();
  const [empresaId, setEmpresaId] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState<DetailKey | null>(null);
  const [profileDetails, setProfileDetails] = useState<DashboardProfileDetail[]>([]);

  const selectedEmpresa = empresaId === 'all'
    ? undefined
    : empresas.find(e => e.id.toString() === empresaId || e.supabaseId === empresaId);
  const statsCompanyId = empresaId === 'all' ? undefined : selectedEmpresa?.supabaseId;
  const today = isoDate(new Date());
  const from = daysAgo(30);
  const stats = useAdminStats(statsCompanyId, from, today, 'ALL');
  const previousStats = useAdminStats(statsCompanyId, daysAgo(60), daysAgo(31), 'ALL');
  const administrativeStats = useAdminStats(statsCompanyId, from, today, 'ADMINISTRATIVO');
  const operativeStats = useAdminStats(statsCompanyId, from, today, 'OPERATIVO');

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
        console.error('No se pudieron cargar perfiles para el detalle del dashboard', profilesError);
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
          .lt('occurred_at', `${today}T23:59:59.999Z`)
          .order('occurred_at', { ascending: false });

        if (pausesError) {
          console.error('No se pudieron cargar pausas para el detalle del dashboard', pausesError);
        } else {
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
  }, [empresas, from, statsCompanyId, today]);

  const status = statusFor(stats.adherencia, stats.reportanMolestias);
  const insights = useMemo(
    () => buildDashboardInsights(stats, administrativeStats, operativeStats, empresaId === 'all' ? 'global' : 'company'),
    [administrativeStats, empresaId, operativeStats, stats],
  );
  const actions = useMemo(() => buildDashboardActions(insights), [insights]);
  const impact = useMemo(() => buildImpactMetrics(stats, previousStats), [previousStats, stats]);
  const activeCompanies = empresas.filter(empresa => empresa.estado === 'Activa').length;
  const activeProfiles = profileDetails.filter(profile => profile.pauses > 0);
  const statusHelper = status.label === 'Atención'
    ? 'Baja participación detectada'
    : 'Calculado por participación, energía y molestias.';

  const simplifiedInsights = insights.map(insight => {
    if (insight.id === 'small-sample') {
      return {
        ...insight,
        title: 'Muestra inicial',
        detail: 'Ya hay actividad registrada, pero todavía hay pocos datos para sacar conclusiones.',
      };
    }

    if (insight.id === 'low-participation') {
      return {
        ...insight,
        title: 'Participación baja',
        detail: `La participación actual es ${stats.adherencia}%. Conviene revisar horarios, recordatorios y facilidad de acceso.`,
      };
    }

    if (insight.id === 'pain-signal') {
      return {
        ...insight,
        title: 'Molestias reportadas',
        detail: insight.detail.replace('dolor', 'molestias').replace('dolor más', 'molestias más'),
        source: insight.source.replace('dolor', 'molestias'),
      };
    }

    return insight;
  });

  const formatShortDate = (value?: string) => {
    if (!value) return 'Sin pausas';
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(value));
  };

  const detailTitle: Record<DetailKey, string> = {
    participacion: 'Detalle de participación semanal',
    usuarios: 'Usuarios con actividad',
    empresas: 'Empresas registradas',
    estado: 'Por qué el estado es atención',
  };

  return (
    <div className="admin-dashboard-page" style={{ animation: 'fadeIn 0.35s ease-out' }}>
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.4rem' }}>
        <div>
          <h2 className="header-title" style={{ marginBottom: '0.3rem' }}>Dashboard Admin</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Resumen simple para entender qué está pasando, por qué importa y qué acción conviene tomar.</p>
        </div>
        <select
          className="input-field"
          style={{ width: 230, backgroundColor: 'var(--bg-color)', fontWeight: 600 }}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
        <Card icon={<TrendingUp size={19} />} label="Participación semanal" value={`${stats.adherencia}%`} helper={`${stats.totalPausas} de 6 pausas completadas`} color="#00bfa6" bg="#e6fffb" active={selectedDetail === 'participacion'} onClick={() => setSelectedDetail(selectedDetail === 'participacion' ? null : 'participacion')} />
        <Card icon={<Users size={19} />} label="Usuarios activos" value={String(stats.usuariosCount)} helper="Con actividad esta semana" color="#2563eb" bg="#eff6ff" active={selectedDetail === 'usuarios'} onClick={() => setSelectedDetail(selectedDetail === 'usuarios' ? null : 'usuarios')} />
        <Card icon={<Building2 size={19} />} label="Empresas registradas" value={String(empresas.length)} helper={`${activeCompanies} activas`} color="#7c3aed" bg="#f5f3ff" active={selectedDetail === 'empresas'} onClick={() => setSelectedDetail(selectedDetail === 'empresas' ? null : 'empresas')} />
        <Card icon={<CheckCircle2 size={19} />} label="Estado general" value={status.label} helper={statusHelper} color={status.color} bg={status.bg} active={selectedDetail === 'estado'} onClick={() => setSelectedDetail(selectedDetail === 'estado' ? null : 'estado')} />
      </div>

      {selectedDetail && (
        <section className="card" style={{ margin: '0 0 1.2rem', padding: '1.15rem', borderRadius: 16, border: '1px solid #dbeafe', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.9rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 850 }}>{detailTitle[selectedDetail]}</h3>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.84rem' }}>Datos leídos desde Supabase: perfiles, empresas y pausas registradas.</p>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setSelectedDetail(null)} style={{ padding: '0.45rem 0.75rem', borderRadius: 10 }}>Cerrar</button>
          </div>

          {selectedDetail === 'participacion' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
              {stats.participacionPorDia.map(day => (
                <div key={day.name} style={{ padding: '0.9rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a' }}>{day.name}</strong>
                  <p style={{ margin: '0.35rem 0 0', color: '#00bfa6', fontSize: '1.35rem', fontWeight: 850 }}>{day.participacion}%</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Participación del día</p>
                </div>
              ))}
            </div>
          )}

          {selectedDetail === 'usuarios' && (
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {(activeProfiles.length > 0 ? activeProfiles : profileDetails).slice(0, 8).map(profile => (
                <div key={profile.id} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr auto', gap: '0.75rem', alignItems: 'center', padding: '0.8rem 0.9rem', borderRadius: 13, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{profile.name}</strong>
                    <p style={{ margin: '0.15rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>{profile.email}</p>
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>{profile.companyName} · {profile.workProfile ?? 'Sin perfil'}</p>
                  <strong style={{ color: profile.pauses > 0 ? '#00bfa6' : '#94a3b8' }}>{profile.pauses} pausas · {formatShortDate(profile.latest)}</strong>
                </div>
              ))}
              {profileDetails.length === 0 && <p style={{ margin: 0, color: '#64748b' }}>Todavía no hay usuarios disponibles para este filtro.</p>}
            </div>
          )}

          {selectedDetail === 'empresas' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
              {empresas.map(empresa => (
                <div key={empresa.id} style={{ padding: '0.9rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a' }}>{empresa.nombre}</strong>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.84rem' }}>{empresa.estado} · {empresa.empleados.length} usuarios · {empresa.ubicacion || 'Sin ubicación'}</p>
                </div>
              ))}
            </div>
          )}

          {selectedDetail === 'estado' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.9rem', borderRadius: 14, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <strong style={{ color: '#9a3412' }}>Participación</strong>
                <p style={{ margin: '0.35rem 0 0', color: '#0f172a' }}>{stats.adherencia}% semanal</p>
              </div>
              <div style={{ padding: '0.9rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>Energía</strong>
                <p style={{ margin: '0.35rem 0 0', color: '#0f172a' }}>{stats.energiaPromedio ? stats.energiaPromedio.toFixed(1) : 'Sin datos'} / 5</p>
              </div>
              <div style={{ padding: '0.9rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>Molestias</strong>
                <p style={{ margin: '0.35rem 0 0', color: '#0f172a' }}>{stats.reportanMolestias}% reportadas</p>
              </div>
            </div>
          )}
        </section>
      )}

      {status.label === 'Atención' && (
        <div style={{ marginBottom: '1.2rem', padding: '0.8rem 1rem', borderRadius: 14, background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontSize: '0.88rem', fontWeight: 750 }}>
          Calculado por participación, energía y molestias.
        </div>
      )}

      <Panel icon={<Lightbulb size={19} />} title="Resumen de la semana">
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {simplifiedInsights.slice(0, 4).map(insight => (
            <div key={insight.id} style={{ padding: '1rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.45rem', color: '#0f172a', fontWeight: 850 }}>{insight.title}</p>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>{insight.detail}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.65rem' }}>
                <span style={{ color: '#0f766e', background: '#ccfbf1', borderRadius: 999, padding: '0.25rem 0.55rem', fontSize: '0.74rem', fontWeight: 850 }}>Confianza {insight.confidence}</span>
                <span style={{ color: '#64748b', background: '#e2e8f0', borderRadius: 999, padding: '0.25rem 0.55rem', fontSize: '0.74rem', fontWeight: 750 }}>Fuente: {insight.source}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginTop: '1.2rem' }}>
        <Panel icon={<Target size={19} />} title="Qué hacer ahora">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {actions.slice(0, 4).map(action => {
              const tone = action.priority === 'Alta' ? { dot: '🔴', color: '#dc2626' } : action.priority === 'Media' ? { dot: '🟡', color: '#d97706' } : { dot: '🟢', color: '#059669' };
              const buttonLabel = action.id === 'review-reminders' ? 'Revisar recordatorios' : action.owner === 'ReActiva' ? 'Programar' : 'Revisar';
              return (
                <div key={action.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.9rem', alignItems: 'center', padding: '0.95rem 1rem', borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem', color: '#0f172a', fontWeight: 850 }}>{tone.dot} {action.title}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem', lineHeight: 1.45 }}>{action.detail}</p>
                    <p style={{ margin: '0.45rem 0 0', color: tone.color, fontSize: '0.76rem', fontWeight: 850 }}>Prioridad {action.priority} · {action.owner}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => action.id === 'review-reminders' && navigate('/plataforma/admin/emails')}
                    style={{ padding: '0.52rem 0.8rem', borderRadius: 10 }}
                  >
                    {buttonLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          icon={<Activity size={19} />}
          title="Evolución del programa"
          action={<button type="button" className="btn-primary" onClick={() => navigate('/plataforma/admin/analiticas')} style={{ padding: '0.58rem 0.9rem' }}>Ver Analíticas completas →</button>}
        >
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {impact.map((metric, index) => {
              const icon = index === 1 ? <Zap size={18} /> : metric.tone === 'warning' ? <TrendingDown size={18} /> : <TrendingUp size={18} />;
              const color = metric.tone === 'positive' ? '#059669' : metric.tone === 'warning' ? '#dc2626' : '#64748b';
              const label = metric.label === 'Dolor reportado' ? 'Molestias reportadas' : metric.label;
              return (
                <div key={metric.label} style={{ padding: '0.95rem 1rem', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.28rem', color: '#0f172a', fontWeight: 850 }}>{label}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>Antes {metric.previous} · Ahora {metric.current}</p>
                  </div>
                  <strong style={{ color, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>{icon}{metric.delta}</strong>
                </div>
              );
            })}
          </div>
          {!stats.hayDatos && (
            <div style={{ marginTop: '0.8rem', padding: '0.75rem 0.9rem', borderRadius: 12, background: '#fff7ed', color: '#9a3412', fontSize: '0.85rem', fontWeight: 750, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertTriangle size={16} /> Cuando haya más pausas registradas, el impacto va a comparar períodos reales.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

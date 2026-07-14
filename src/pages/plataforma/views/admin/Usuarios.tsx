import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, AlertCircle, Building, Mail, Link as LinkIcon, Copy, CheckCircle2, ChevronLeft, Activity, Zap, Heart, BatteryCharging, TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar, Download, Trash2, Clock } from 'lucide-react';
import { getDB, setDB, addInvitacionUsuario, Empresa, Usuario } from '../../mock/data';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { AnalyticsPeriod, calculateIndividualAnalytics, IndividualPauseSession } from '../../lib/individualAnalytics';
import { invitationPath, makeShortInvitationCode } from '../../lib/invitationLinks';
import { sendTransactionalEmail } from '../../lib/emailSender';

// Section
const Badge: React.FC<{ label: string; bg: string; color: string }> = ({ label, bg, color }) => (
  <span className="user-status-badge" style={{ display: 'inline-block', padding: '0.3rem 0.85rem', borderRadius: '999px', backgroundColor: bg, color, fontSize: '0.8rem', fontWeight: 600 }}>
    {label}
  </span>
);

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; inicial: string; actual?: string }> = ({ icon, label, inicial, actual }) => (
  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', flex: '1 1 200px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <span style={{ color: '#64748b' }}>{icon}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.2rem' }}>INICIAL</p>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{inicial}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '0.7rem', color: actual ? '#10b981' : '#94a3b8', fontWeight: 600, marginBottom: '0.2rem' }}>ACTUAL</p>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: actual ? '#059669' : '#94a3b8', margin: 0 }}>{actual ?? 'Sin datos'}</p>
      </div>
    </div>
  </div>
);

// Section
const getRiesgoPersonal = (data: any) => {
  if (!data) return { nivel: 'Sin datos', color: '#94a3b8', bg: '#f8fafc', desc: 'No hay datos del onboarding.' };
  let score = 0;
  if (data.actividadFisica === 'Baja') score += 2;
  if (data.energia === 'Baja') score += 2;
  if (data.dolores?.length > 0 && !data.dolores.includes('No tengo dolores')) score += 2;
  if (data.fatiga === 'Alta') score += 2;
  if (data.bienestar === 'Bajo') score += 2;

  if (score >= 6) return { nivel: 'Alto', color: '#dc2626', bg: '#fef2f2', desc: 'Alto riesgo de burnout o lesiones. Requiere atención inmediata y seguimiento de pausas.' };
  if (score >= 3) return { nivel: 'Medio', color: '#d97706', bg: '#fffbeb', desc: 'Riesgo moderado. Las pausas diarias le ayudarán a estabilizar energía y reducir molestias.' };
  return { nivel: 'Bajo', color: '#059669', bg: '#ecfdf5', desc: 'Perfil saludable. ReActiva potenciará su foco y bienestar general.' };
};

const statusToSupabase = (estado?: Empresa['estado']) => {
  if (estado === 'Pendiente onboarding') return 'pending_onboarding';
  if (estado === 'Inactiva') return 'inactive';
  return 'active';
};

const hashToNumericId = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 10000;
};

const companyStatusFromSupabase = (status?: string): Empresa['estado'] => {
  if (status === 'pending_onboarding') return 'Pendiente onboarding';
  if (status === 'inactive') return 'Inactiva';
  return 'Activa';
};

// Section
const UsuarioDetalle: React.FC<{ usuario: Usuario; empresa: Empresa | undefined; onBack: () => void }> = ({ usuario, empresa, onBack }) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'analiticas'>('resumen');
  const [periodo, setPeriodo] = useState<AnalyticsPeriod>('mensual');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [pauseSessions, setPauseSessions] = useState<IndividualPauseSession[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const reporteRef = useRef<HTMLDivElement>(null);

  const data = usuario.onboardingData;
  const riesgo = getRiesgoPersonal(data);
  const fechaFmt = new Date(usuario.fechaIngreso || usuario.ultima_interaccion).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    let mounted = true;

    const readLocalSessions = (): IndividualPauseSession[] => {
      try {
        const key = `reactiva_pausas:${usuario.email.trim().toLowerCase()}`;
        const rows = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(rows)) return [];
        return rows.map((row: any) => ({
          id: row.id,
          profileId: usuario.supabaseId,
          dayLabel: row.dia,
          block: row.bloque,
          occurredAt: row.fecha ?? new Date().toISOString(),
          energy: row.energia ?? row.respuestas?.energia ?? null,
          feeling: row.feeling ?? row.respuestas?.feeling ?? null,
          hasPain: row.dolor ?? row.respuestas?.dolor ?? null,
          painZone: row.zona ?? row.respuestas?.zona ?? null,
          answers: row.respuestas ?? {},
        }));
      } catch {
        return [];
      }
    };

    const loadSessions = async () => {
      if (mounted) {
        setAnalyticsLoading(true);
        setAnalyticsError('');
      }

      if (!supabase || !usuario.supabaseId) {
        if (mounted) {
          setPauseSessions(readLocalSessions());
          setAnalyticsLoading(false);
        }
        return;
      }

      const { data: rows, error } = await supabase
        .from('pause_sessions')
        .select('id, profile_id, day_label, block, occurred_at, energy, feeling, has_pain, pain_zone, answers')
        .eq('profile_id', usuario.supabaseId)
        .order('occurred_at', { ascending: true });

      if (!mounted) return;
      if (error || !rows) {
        console.error('No se pudieron cargar las analíticas del usuario', error);
        setPauseSessions([]);
        setAnalyticsError('No pudimos sincronizar las pausas de este usuario.');
        setAnalyticsLoading(false);
        return;
      }

      setPauseSessions(rows.map((row: any) => ({
        id: row.id,
        profileId: row.profile_id,
        dayLabel: row.day_label,
        block: row.block,
        occurredAt: row.occurred_at,
        energy: row.energy ?? null,
        feeling: row.feeling ?? null,
        hasPain: row.has_pain ?? null,
        painZone: row.pain_zone ?? null,
        answers: row.answers ?? {},
      })));
      setAnalyticsLoading(false);
    };

    void loadSessions();
    const refresh = () => void loadSessions();
    window.addEventListener('focus', refresh);
    window.addEventListener('reactiva-pausas-updated', refresh);
    window.addEventListener('storage', refresh);

    const channel = supabase && usuario.supabaseId
      ? supabase
          .channel(`individual-analytics-${usuario.supabaseId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'pause_sessions', filter: `profile_id=eq.${usuario.supabaseId}` },
            refresh,
          )
          .subscribe()
      : null;

    return () => {
      mounted = false;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('reactiva-pausas-updated', refresh);
      window.removeEventListener('storage', refresh);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [usuario.email, usuario.supabaseId]);

  const analiticasData = useMemo(
    () => calculateIndividualAnalytics(pauseSessions, periodo, fechaDesde, fechaHasta),
    [pauseSessions, periodo, fechaDesde, fechaHasta],
  );
  const topIndividualTension = useMemo(
    () => [...analiticasData.tension].filter(item => item.valor > 0).sort((left, right) => right.valor - left.valor)[0] ?? null,
    [analiticasData.tension],
  );
  const individualPeriodLabel = periodo === 'semanal'
    ? 'Última semana'
    : periodo === 'mensual'
      ? 'Último mes'
      : periodo === 'anual'
        ? 'Último año'
        : fechaDesde && fechaHasta
          ? `${fechaDesde} a ${fechaHasta}`
          : 'Período personalizado';

  const handleDescargarPDF = async () => {
    if (!reporteRef.current) return;
    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(reporteRef.current, { scale: 2, useCORS: true, backgroundColor: '#F7F9FB' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pdfWidth) / canvas.width;

      for (let offset = 0, page = 0; offset < imageHeight; offset += pageHeight, page += 1) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -offset, pdfWidth, imageHeight);
      }
      pdf.save(`Reporte_Individual_${usuario.nombre.replace(/ /g, '_')}_${periodo}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="user-detail-page" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header Info */}
      <div className="user-detail-back" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', padding: '0.5rem 0', background: 'none' }}>
          <ChevronLeft size={20} /> Volver
        </button>
      </div>

      <div className="card user-detail-hero" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div className="user-detail-primary">
          <div className="user-detail-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{usuario.nombre}</h2>
            <Badge label={usuario.estado || 'Activo'} bg={usuario.estado === 'Activo' || !usuario.estado ? '#ecfdf5' : '#f1f5f9'} color={usuario.estado === 'Activo' || !usuario.estado ? '#059669' : '#64748b'} />
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>{usuario.email}</p>
        </div>
        <div className="user-detail-meta" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Empresa</p>
            <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Building size={16} color="#10b981" /> {empresa?.nombre || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Fecha Ingreso</p>
            <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>{fechaFmt}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="user-detail-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('resumen')}
          style={{ padding: '0.75rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'resumen' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'resumen' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Resumen Ejecutivo
        </button>
        <button
          onClick={() => setActiveTab('analiticas')}
          style={{ padding: '0.75rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'analiticas' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'analiticas' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Analíticas de Evolución
        </button>
      </div>

      {/* Section */}
      {!data ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Sin datos de diagnóstico</h3>
          <p style={{ color: '#64748b' }}>Este usuario aún no completó el onboarding o es un usuario heredado.</p>
        </div>
      ) : (
        <>
          {/* TAB RESUMEN */}
          {activeTab === 'resumen' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div className="card" style={{ padding: '1.75rem', borderLeft: `4px solid ${riesgo.color}`, marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color={riesgo.color} /> Índice de Riesgo Inicial
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', backgroundColor: riesgo.bg, display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertTriangle size={22} color={riesgo.color} />
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: riesgo.color, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Nivel</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 800, color: riesgo.color, margin: 0 }}>{riesgo.nivel}</p>
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, flex: 1, minWidth: '200px', margin: 0 }}>{riesgo.desc}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: 1, padding: '1.75rem', minWidth: '300px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} color="#f59e0b" /> Dolor Musculoesquelético
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {data.dolores?.length > 0 && !data.dolores.includes('No tengo dolores')
                      ? data.dolores.map((d: string) => <Badge key={d} label={d} bg="#fffbeb" color="#92400e" />)
                      : <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 600 }}>Sin dolores reportados</span>
                    }
                  </div>
                </div>
                <div className="card" style={{ flex: 1, padding: '1.75rem', minWidth: '300px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} color="#10b981" /> Metas del usuario
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.objetivos?.length > 0
                      ? data.objetivos.map((o: string) => <div key={o} style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#10b981' }}>•</span> {o}</div>)
                      : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sin metas</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB ANALITICAS */}
          {activeTab === 'analiticas' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div className="user-detail-analytics-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Calendar size={18} color="var(--text-muted)" />
                  <select className="input-field" value={periodo} onChange={(e) => setPeriodo(e.target.value as AnalyticsPeriod)} style={{ width: '180px', backgroundColor: 'white' }}>
                    <option value="semanal">Última Semana</option>
                    <option value="mensual">Último Mes</option>
                    <option value="anual">Último Año</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                  {periodo === 'personalizado' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="date" className="input-field" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} />
                      <span style={{color: '#64748b'}}>-</span>
                      <input type="date" className="input-field" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} />
                    </div>
                  )}
                </div>
                <button
                  className="btn-primary"
                  onClick={handleDescargarPDF}
                  disabled={generandoPDF}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                  <Download size={16} /> {generandoPDF ? 'Generando...' : 'Generar PDF'}
                </button>
              </div>

              {/* REPORT ENCAPSULADO PARA PDF */}
              <div ref={reporteRef} style={{ padding: generandoPDF ? '2rem' : '0', backgroundColor: generandoPDF ? '#f8fafc' : 'transparent' }}>
                
                {generandoPDF && (
                  <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Método ReActiva</h1>
                    <p style={{ color: '#475569', fontSize: '1rem' }}>Reporte de Progreso Individual · {usuario.nombre} · Período: {individualPeriodLabel}</p>
                  </div>
                )}

                {/* Section */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  {analiticasData.hasSessions && analiticasData.kpis.dolor > 50 && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#be123c', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <AlertTriangle size={16} /> Aumento de dolor persistente detectado.
                    </div>
                  )}
                  {analiticasData.hasSessions && analiticasData.kpis.participacion < 50 && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <AlertCircle size={16} /> Baja adherencia reciente.
                    </div>
                  )}
                  {analiticasData.hasFeedback && analiticasData.kpis.energia > 70 && (
                    <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <TrendingUp size={16} /> Evolución positiva de energía.
                    </div>
                  )}
                </div>

                {/* Section */}
                <div className="user-detail-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Participación', value: analiticasData.kpis.participacion, color: 'var(--primary-color)', bg: '#f0fdfa' },
                    { label: 'Foco',          value: analiticasData.kpis.foco,          color: '#3b82f6',              bg: '#eff6ff' },
                    { label: 'Impacto Pausa', value: analiticasData.kpis.impacto,       color: '#9333ea',              bg: '#faf5ff' },
                    { label: 'Dolor',         value: analiticasData.kpis.dolor,         color: '#f43f5e',              bg: '#fff1f2' },
                    { label: 'Energía',       value: analiticasData.kpis.energia,       color: '#f59e0b',              bg: '#fffbeb' },
                  ].map(kpi => (
                    <div key={kpi.label} className="card" style={{ padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{kpi.label}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color, lineHeight: 1, marginBottom: '0.5rem' }}>{kpi.value}%</p>
                      <div style={{ width: '100%', height: '4px', backgroundColor: kpi.bg, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${kpi.value}%`, height: '100%', backgroundColor: kpi.color, borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Evolución desde el ingreso</h3>
                <div className="user-detail-evolution-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <MetricCard icon={<Activity size={18} />} label="Actividad Física" inicial={data.actividadFisica || 'Sin datos'} actual={analyticsLoading ? 'Actualizando...' : analiticasData.current.actividadFisica} />
                  <MetricCard icon={<Zap size={18} />} label="Energía Percibida" inicial={data.energia || 'Sin datos'} actual={analyticsLoading ? 'Actualizando...' : analiticasData.current.energia} />
                  <MetricCard icon={<BatteryCharging size={18} />} label="Fatiga" inicial={data.fatiga || 'Sin datos'} actual={analyticsLoading ? 'Actualizando...' : analiticasData.current.fatiga} />
                  <MetricCard icon={<Heart size={18} />} label="Bienestar" inicial={data.bienestar || 'Sin datos'} actual={analyticsLoading ? 'Actualizando...' : analiticasData.current.bienestar} />
                </div>
                <div style={{ marginTop: '-1rem', marginBottom: '2rem', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#f8fafc', color: analyticsError ? '#b91c1c' : '#64748b', fontSize: '0.78rem', lineHeight: 1.55 }}>
                  {analyticsError || 'Inicial: respuestas del onboarding. Actual: actividad según pausas completadas en los últimos 7 días; energía y fatiga según respuestas 1–5; bienestar según cómo terminó cada pausa. Los valores se sincronizan con Supabase.'}
                </div>

                {/* Momentos de tensión del usuario */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Momentos de mayor tensión</h3>
                {analiticasData.tension.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(220px, 0.7fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '1.25rem' }}>
                      <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.84rem' }}>Distribución de las respuestas registradas durante {individualPeriodLabel.toLowerCase()}.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {analiticasData.tension.map(item => (
                          <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '155px 1fr 42px', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#475569', fontSize: '0.82rem', fontWeight: 650 }}><Clock size={15} color="#6366f1" /> {item.name}</span>
                            <span style={{ height: 9, borderRadius: 999, background: '#eef2ff', overflow: 'hidden' }}><span style={{ display: 'block', width: `${item.valor}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }} /></span>
                            <strong style={{ color: '#4f46e5', fontSize: '0.82rem', textAlign: 'right' }}>{item.valor}%</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(145deg, #eef2ff, #f5f3ff)', border: '1px solid #c7d2fe', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ width: 42, height: 42, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: '#4f46e5', marginBottom: '0.85rem' }}><Clock size={21} /></span>
                      <p style={{ margin: '0 0 0.35rem', color: '#6366f1', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase' }}>Momento predominante</p>
                      <strong style={{ color: '#312e81', fontSize: '1.2rem', lineHeight: 1.2 }}>{topIndividualTension?.name}</strong>
                      <p style={{ margin: '0.55rem 0 0', color: '#4338ca', fontSize: '0.86rem' }}>{topIndividualTension?.valor}% de las respuestas con tensión.</p>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', color: '#64748b', fontSize: '0.88rem' }}>No hay respuestas de tensión registradas para este usuario en el período seleccionado.</div>
                )}

                {/* Section */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Zonas de dolor reportadas</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  {analiticasData.zonasDolor.map((z, idx) => (
                    <div key={idx} className="card" style={{ flex: '1 1 200px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>{z.zona}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: z.color, fontSize: '0.85rem', fontWeight: 700 }}>
                        {z.icon === 'up' ? <TrendingUp size={16} /> : z.icon === 'down' ? <TrendingDown size={16} /> : <Minus size={16} />}
                        {z.tendencia}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#0f172a' }}>Participación / Adherencia</h3>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analiticasData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                          <Bar dataKey="participacion" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#0f172a' }}>Dolor Reportado</h3>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analiticasData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colDol" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                          <Area type="monotone" dataKey="dolor" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colDol)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#0f172a' }}>Concentración (Foco)</h3>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analiticasData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colFoc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                          <Area type="monotone" dataKey="foco" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colFoc)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#0f172a' }}>Evolución de Energía</h3>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analiticasData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colEne" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                          <Area type="monotone" dataKey="energiaPct" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colEne)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#0f172a' }}>Bienestar (Impacto de Pausas)</h3>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analiticasData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colImp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/><stop offset="95%" stopColor="#9333ea" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                          <Area type="monotone" dataKey="impacto" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#colImp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Section
export const Usuarios: React.FC = () => {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresaFiltro, setEmpresaFiltro] = useState('all');
  const [search, setSearch] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
  const [newResponsable, setNewResponsable] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const loadData = async () => {
    if (!supabase) {
      const db = getDB();
      setEmpresas(db.empresas);
      setUsuarios(db.usuarios);
      return;
    }

    setEmpresas([]);
    setUsuarios([]);

    const [
      { data: companies, error: companiesError },
      { data: profiles, error: profilesError },
      { data: onboardingResponses, error: onboardingError },
    ] = await Promise.all([
      supabase
        .from('companies')
        .select('id, name, location, status, contact_name, rrhh_email, onboarding_completed_at, created_at'),
      supabase
        .from('profiles')
        .select('id, company_id, email, full_name, role, status, created_at, updated_at, onboarding_data')
        .eq('role', 'usuario'),
      supabase
        .from('onboarding_responses')
        .select('id, company_id, profile_id, responses, completed_at')
        .eq('type', 'user_activation')
        .order('completed_at', { ascending: false }),
    ]);

    if (companiesError || profilesError || onboardingError || !companies || !profiles) {
      console.error('No se pudieron cargar usuarios desde Supabase', companiesError ?? profilesError ?? onboardingError);
      return;
    }

    const supabaseCompanies: Empresa[] = companies.map((company: any) => ({
      id: hashToNumericId(company.id),
      supabaseId: company.id,
      nombre: company.name,
      ubicacion: company.location ?? '',
      empleados: [],
      estado: companyStatusFromSupabase(company.status),
      contactoNombre: company.contact_name ?? '',
      rrhhEmail: company.rrhh_email ?? '',
      fechaOnboarding: company.onboarding_completed_at ?? company.created_at,
    }));

    const companyBySupabaseId = new Map(supabaseCompanies.map(company => [company.supabaseId, company]));
    const supabaseUsers: Usuario[] = profiles.map((profile: any) => {
      const company = companyBySupabaseId.get(profile.company_id);
      return {
        id: hashToNumericId(profile.id),
        supabaseId: profile.id,
        nombre: profile.full_name || profile.email?.split('@')[0] || 'Usuario',
        email: profile.email,
        empresa_id: company?.id ?? 0,
        participacion: 0,
        dolor: Boolean(profile.onboarding_data?.has_pain),
        ultima_interaccion: profile.updated_at ?? profile.created_at,
        estado: profile.status === 'inactive' ? 'Inactivo' : 'Activo',
        fechaIngreso: profile.created_at,
        onboardingData: profile.onboarding_data ?? {},
      };
    });

    const profileEmails = new Set(supabaseUsers.map(profile => profile.email.toLowerCase()));
    const pendingByEmail = new Map<string, Usuario>();
    (onboardingResponses ?? []).forEach((response: any) => {
      if (response.profile_id) return;
      const email = String(response.responses?.email ?? '').trim().toLowerCase();
      if (!email || profileEmails.has(email) || pendingByEmail.has(email)) return;
      const company = companyBySupabaseId.get(response.company_id);
      pendingByEmail.set(email, {
        id: hashToNumericId(response.id),
        supabaseId: response.id,
        nombre: response.responses?.nombre || email.split('@')[0],
        email,
        empresa_id: company?.id ?? 0,
        participacion: 0,
        dolor: Array.isArray(response.responses?.dolores)
          && !response.responses.dolores.includes('No tengo dolores'),
        ultima_interaccion: response.completed_at,
        estado: 'Pendiente de acceso',
        fechaIngreso: response.completed_at,
        onboardingData: response.responses ?? {},
      });
    });

    const allUsers = [...supabaseUsers, ...pendingByEmail.values()];

    const employeesByCompany = new Map<number, number[]>();
    allUsers.forEach((profile) => {
      if (!employeesByCompany.has(profile.empresa_id)) employeesByCompany.set(profile.empresa_id, []);
      employeesByCompany.get(profile.empresa_id)?.push(profile.id);
    });

    setEmpresas(supabaseCompanies.map(company => ({
      ...company,
      empleados: employeesByCompany.get(company.id) ?? [],
    })));
    setUsuarios(allUsers);
  };

  useEffect(() => { void loadData(); }, []);

  const rrhhEmpresa = useMemo(() => {
    if (user?.role !== 'rrhh') return undefined;
    const userCompanyId = user.empresa_id?.toString();
    return empresas.find(e => e.supabaseId === userCompanyId)
      ?? empresas.find(e => e.id.toString() === userCompanyId)
      ?? empresas.find(e => e.rrhhEmail?.toLowerCase() === user.email.toLowerCase());
  }, [empresas, user]);

  const rrhhEmpresaId = user?.role === 'rrhh' ? rrhhEmpresa?.id : undefined;
  const isRrhh = user?.role === 'rrhh';

  if (selectedUser) {
    if (isRrhh && (!rrhhEmpresaId || selectedUser.empresa_id !== rrhhEmpresaId)) {
      setSelectedUser(null);
      return null;
    }
    const emp = empresas.find(e => e.id === selectedUser.empresa_id);
    return <UsuarioDetalle usuario={selectedUser} empresa={emp} onBack={() => { loadData(); setSelectedUser(null); }} />;
  }

  const usuariosFiltrados = usuarios.filter(u => {
    if (isRrhh && (!rrhhEmpresaId || u.empresa_id !== rrhhEmpresaId)) return false;
    const coincideEmpresa = empresaFiltro === 'all' || u.empresa_id.toString() === empresaFiltro;
    const coincideBusqueda = u.nombre.toLowerCase().includes(search.toLowerCase());
    return coincideEmpresa && coincideBusqueda;
  });

  const getEmpresaName = (id: number) => empresas.find(e => e.id === id)?.nombre || 'Desconocida';

  const handleGenerateLink = async (options?: { sendEmail?: boolean }) => {
    setInviteError('');
    const empresa = isRrhh ? rrhhEmpresa : empresas.find(e => e.id === parseInt(selectedEmpresaId));

    if (!empresa) {
      setInviteError('Seleccioná una empresa para asociar la invitación.');
      return;
    }
    if (!isRrhh && !newEmail.trim()) {
      setInviteError('Ingresá el email del usuario para crear una invitación real.');
      return;
    }

    setInviteLoading(true);
    const token = makeShortInvitationCode();
    const link = `${window.location.origin}${invitationPath('user', token)}`;

    try {
      if (supabase) {
        if (isRrhh) {
          const { error } = await supabase.rpc('create_open_employee_invitation', {
            invitation_token: token,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.rpc('create_user_invitation', {
            company_name: empresa.nombre,
            company_location: empresa.ubicacion,
            company_status: statusToSupabase(empresa.estado),
            contact_name: empresa.contactoNombre ?? '',
            rrhh_email: empresa.rrhhEmail ?? '',
            invitation_email: newEmail.trim().toLowerCase(),
            invitation_token: token,
            responsable: newResponsable,
            local_empresa_id: empresa.id,
          });
          if (error) throw error;
        }
      }

      addInvitacionUsuario({
        token,
        empresa_id: empresa.id,
        responsable: isRrhh ? user?.name : newResponsable,
        emailEnviado: isRrhh ? undefined : newEmail.trim().toLowerCase(),
        fechaCreacion: new Date().toISOString()
      });

      setGeneratedLink(link);

      if (options?.sendEmail && !isRrhh) {
        const emailResult = await sendTransactionalEmail({
          type: 'user_invitation',
          to: newEmail.trim().toLowerCase(),
          recipientName: newResponsable.trim() || newEmail.trim().split('@')[0],
          companyName: empresa.nombre,
          invitationUrl: link,
        });

        if (!emailResult.ok) {
          setInviteError(`El enlace se generó, pero no pudimos enviar el email: ${emailResult.message ?? 'error desconocido'}`);
          return;
        }

        window.alert('Invitación enviada por email.');
      }
    } catch (err: any) {
      setInviteError(err?.message ?? 'No pudimos crear la invitación en Supabase.');
    } finally {
      setInviteLoading(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEliminarUsuario = async (event: React.MouseEvent<HTMLButtonElement>, usuario: Usuario) => {
    event.stopPropagation();
    const confirmar = window.confirm(`Eliminar a ${usuario.nombre} por completo?`);
    if (!confirmar) return;

    setDeletingUserId(usuario.id);

    try {
      if (supabase && usuario.supabaseId) {
        const deletion = await supabase.rpc('delete_platform_user', {
          target_profile_id: usuario.estado === 'Pendiente de acceso' ? null : usuario.supabaseId,
          target_invitation_id: usuario.estado === 'Pendiente de acceso' ? usuario.supabaseId : null,
        });

        if (deletion.error) {
          const missingDeleteFunction = deletion.error.code === 'PGRST202'
            || deletion.error.message?.includes('delete_platform_user');

          if (missingDeleteFunction) {
            throw new Error('La eliminación de empleados todavía no está habilitada en Supabase. Aplicá la migración delete_platform_user y volvé a intentar.');
          }

          throw deletion.error;
        }
      }

      const db = getDB();
      db.usuarios = db.usuarios.filter((item) => item.id !== usuario.id);
      db.empresas = db.empresas.map((empresa) => ({
        ...empresa,
        empleados: empresa.empleados.filter((usuarioId) => usuarioId !== usuario.id),
      }));
      db.progresos = db.progresos.filter((progreso) => progreso.usuario_id !== usuario.id);
      db.formularios = db.formularios.filter((formulario) => formulario.usuario_id !== usuario.id);
      setDB(db);

      setUsuarios((current) => current.filter((item) => item.id !== usuario.id));
      setEmpresas((current) => current.map((empresa) => ({
        ...empresa,
        empleados: empresa.empleados.filter((usuarioId) => usuarioId !== usuario.id),
      })));

      await loadData();
    } catch (error: any) {
      console.error('No se pudo eliminar el usuario', error);
      window.alert(error?.message ?? 'No pudimos eliminar el usuario. Volvé a intentarlo.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const formatFecha = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return '—'; }
  };

  return (
    <div className="users-page" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Usuarios</h2>
        <div className="users-toolbar-actions" style={{ display: 'flex', gap: '1rem' }}>
          {!isRrhh && (
            <select className="input-field" style={{ width: '220px', backgroundColor: 'var(--bg-color)' }} value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>
              <option value="all">Todas las empresas</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          )}
          <button className="btn-primary users-invite-button" onClick={() => { setIsModalOpen(true); setGeneratedLink(''); setInviteError(''); }}>
            {isRrhh ? 'Invitar empleados' : 'Invitar Usuarios'}
          </button>
        </div>
      </div>

      <div className="card users-search-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
        <div className="users-search-wrap" style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" className="input-field users-search-input" placeholder="Buscar por nombre..." style={{ paddingLeft: '3rem', border: 'none', backgroundColor: 'var(--bg-secondary-color)' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card responsive-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Nombre</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Empresa</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Participación</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ultima interacción</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>¿Dolor?</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ingreso</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron usuarios.</td></tr>
            )}
            {usuariosFiltrados.map((usuario, idx) => (
              <tr 
                key={usuario.id} 
                style={{ borderBottom: idx !== usuariosFiltrados.length - 1 ? '1px solid var(--border-color)' : 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onClick={() => setSelectedUser(usuario)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
              <td data-label="Nombre" style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{usuario.nombre}</td>
                <td data-label="Empresa" style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{getEmpresaName(usuario.empresa_id)}</td>
                <td data-label="Participación" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${usuario.participacion}%`, height: '100%', backgroundColor: usuario.participacion > 70 ? 'var(--primary-color)' : '#f59e0b', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{usuario.participacion}%</span>
                  </div>
                </td>
                <td data-label="Última interacción" style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatFecha(usuario.ultima_interaccion || usuario.fechaIngreso)}</td>
                <td data-label="Dolor" style={{ padding: '1.25rem 1.5rem' }}>
                  {usuario.dolor ? <span className="badge badge-warning" style={{ gap: '0.25rem' }}><AlertCircle size={14} /> Sí</span> : <span className="text-muted">No</span>}
                </td>
                <td data-label="Ingreso" style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatFecha(usuario.fechaIngreso || usuario.ultima_interaccion)}</td>
                <td data-label="Estado" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
                    <Badge
                      label={usuario.estado || 'Activo'}
                      bg={usuario.estado === 'Pendiente de acceso' ? '#fff7ed' : '#ecfdf5'}
                      color={usuario.estado === 'Pendiente de acceso' ? '#c2410c' : '#059669'}
                    />
                    {!isRrhh && <button
                      type="button"
                      onClick={(event) => void handleEliminarUsuario(event, usuario)}
                      aria-label={`Eliminar a ${usuario.nombre}`}
                      title={`Eliminar a ${usuario.nombre}`}
                      disabled={deletingUserId === usuario.id}
                      style={{
                        width: 34,
                        height: 34,
                        border: '1px solid #fecaca',
                        borderRadius: '999px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: deletingUserId === usuario.id ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        opacity: deletingUserId === usuario.id ? 0.6 : 1,
                      }}
                    >
                      <Trash2 size={16} />
                    </button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Invitar Usuarios */}
      {isModalOpen && (
        <div className="compact-modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)' }} onClick={() => { setIsModalOpen(false); setGeneratedLink(''); setInviteError(''); }}>
          <div className="compact-modal invite-user-modal" style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="compact-modal-intro" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="compact-modal-icon" style={{ width: '56px', height: '56px', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#4f46e5' }}>
                <Mail size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{isRrhh ? 'Invitar empleados' : 'Invitar Usuarios'}</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {isRrhh
                  ? 'Genera un enlace único para compartir con los empleados de tu empresa.'
                  : 'Genera un enlace único de onboarding. Los usuarios que ingresen quedarán vinculados a la empresa seleccionada.'}
              </p>
            </div>

            {!generatedLink ? (
              <div className="compact-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {isRrhh ? (
                  <div style={{ padding: '1rem', borderRadius: '14px', border: '1px solid #ccfbf1', backgroundColor: '#f0fdfa' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#0f766e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Empresa asociada</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>{rrhhEmpresa?.nombre ?? 'Tu empresa'}</p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45 }}>Compartí este enlace con tus empleados para que creen su acceso individual a ReActiva.</p>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Empresa asociada <span style={{color: 'red'}}>*</span></label>
                      <select className="input-field" value={selectedEmpresaId} onChange={e => setSelectedEmpresaId(e.target.value)} style={{ width: '100%' }}>
                        <option value="" disabled>Seleccioná una empresa...</option>
                        {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre del RRHH (Opcional)</label>
                      <input type="text" className="input-field" placeholder="Ej: Laura Martínez" value={newResponsable} onChange={e => setNewResponsable(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email para envío</label>
                      <input type="email" className="input-field" placeholder="correo@empresa.com" value={newEmail} onChange={e => { setNewEmail(e.target.value); setInviteError(''); }} />
                    </div>
                  </>
                )}
                {inviteError && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                    {inviteError}
                  </div>
                )}
                <div className="compact-modal-actions" style={{ display: 'grid', gridTemplateColumns: isRrhh ? '1fr' : '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" disabled={inviteLoading} onClick={() => void handleGenerateLink()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: inviteLoading ? 'wait' : 'pointer', borderRadius: '12px', transition: 'all 0.2s', opacity: inviteLoading ? 0.7 : 1 }}>
                    <LinkIcon size={24} color="#4f46e5" /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{inviteLoading ? 'Creando...' : isRrhh ? 'Generar link para empleados' : 'Generar enlace'}</span>
                  </button>
                  {!isRrhh && (
                    <button type="button" disabled={inviteLoading} onClick={() => void handleGenerateLink({ sendEmail: true })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: inviteLoading ? 'wait' : 'pointer', borderRadius: '12px', transition: 'all 0.2s', opacity: inviteLoading ? 0.7 : 1 }}>
                      <Mail size={24} color="#4f46e5" /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{inviteLoading ? 'Creando...' : 'Generar para email'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ width: '100%', padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enlace generado con éxito</p>
                  <div style={{ wordBreak: 'break-all', color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>{generatedLink}</div>
                  <button type="button" onClick={copyToClipboard} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#4f46e5' }}>
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    {copied ? '¡Copiado!' : 'Copiar enlace'}
                  </button>
                </div>
                <button type="button" onClick={() => { setIsModalOpen(false); setGeneratedLink(''); setInviteError(''); }} style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', border: 'none', background: 'none', cursor: 'pointer' }}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

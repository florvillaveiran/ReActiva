import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, AlertCircle, Building, Mail, Link as LinkIcon, Copy, CheckCircle2, ChevronLeft, Activity, Zap, Heart, BatteryCharging, TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar, Download } from 'lucide-react';
import { getDB, addInvitacionUsuario, Empresa, Usuario } from '../../mock/data';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── Components ───────────────────────────────────────────────────
const Badge: React.FC<{ label: string; bg: string; color: string }> = ({ label, bg, color }) => (
  <span style={{ display: 'inline-block', padding: '0.3rem 0.85rem', borderRadius: '999px', backgroundColor: bg, color, fontSize: '0.8rem', fontWeight: 600 }}>
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
      {actual && (
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginBottom: '0.2rem' }}>ACTUAL</p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', margin: 0 }}>{actual}</p>
        </div>
      )}
    </div>
  </div>
);

// ── Logic ────────────────────────────────────────────────────────
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

// Generador de mock data evolutiva para el usuario
const generarMockAnaliticas = (periodo: string, data: any) => {
  let labels = [];
  if (periodo === 'semanal') labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  else if (periodo === 'mensual') labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  else if (periodo === 'anual') labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  else labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

  const baseEnergia = data?.energia === 'Baja' ? 30 : data?.energia === 'Media' ? 60 : 85;
  const baseDolor = (data?.dolores?.length > 0 && !data?.dolores.includes('No tengo dolores')) ? 70 : 20;

  const evolucion = labels.map((name, i) => {
    const factorMejora = i * (periodo === 'anual' ? 2 : 5);
    return {
      name,
      participacion: Math.min(100, 60 + factorMejora + Math.random() * 10),
      energiaPct: Math.min(100, baseEnergia + factorMejora * 0.8 + Math.random() * 10),
      dolor: Math.max(0, baseDolor - factorMejora + Math.random() * 10),
      foco: Math.min(100, 50 + factorMejora + Math.random() * 10),
      impacto: Math.min(100, 65 + factorMejora + Math.random() * 5),
    };
  });

  const last = evolucion[evolucion.length - 1];
  return {
    evolucion,
    kpis: {
      participacion: Math.round(last.participacion),
      dolor: Math.round(last.dolor),
      foco: Math.round(last.foco),
      impacto: Math.round(last.impacto),
      energia: Math.round(last.energiaPct),
    },
    zonasDolor: [
      { zona: 'Cervical', tendencia: 'Disminuyó', color: '#10b981', icon: 'down' },
      { zona: 'Lumbar', tendencia: 'Se mantuvo', color: '#f59e0b', icon: 'minus' },
      { zona: 'Hombros', tendencia: 'Aumentó', color: '#ef4444', icon: 'up' },
    ]
  };
};

const getLabelEnergia = (pct: number) => pct < 40 ? 'Baja' : pct < 70 ? 'Media' : 'Alta';
const getLabelFatiga = (pct: number) => pct > 70 ? 'Alta' : pct > 40 ? 'Media' : 'Baja';
const getLabelBienestar = (pct: number) => pct < 40 ? 'Bajo' : pct < 70 ? 'Medio' : 'Alto';

// ── Ficha de Usuario ─────────────────────────────────────────────
const UsuarioDetalle: React.FC<{ usuario: Usuario; empresa: Empresa | undefined; onBack: () => void }> = ({ usuario, empresa, onBack }) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'analiticas'>('resumen');
  const [periodo, setPeriodo] = useState('mensual');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const reporteRef = useRef<HTMLDivElement>(null);

  const data = usuario.onboardingData;
  const riesgo = getRiesgoPersonal(data);
  const fechaFmt = new Date(usuario.fechaIngreso || usuario.ultima_interaccion).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const analiticasData = useMemo(() => generarMockAnaliticas(periodo, data), [periodo, data]);

  const handleDescargarPDF = async () => {
    if (!reporteRef.current) return;
    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(reporteRef.current, { scale: 2, useCORS: true, backgroundColor: '#F7F9FB' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Reporte_Individual_${usuario.nombre.replace(/ /g, '_')}_${periodo}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', padding: '0.5rem 0', background: 'none' }}>
          <ChevronLeft size={20} /> Volver
        </button>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{usuario.nombre}</h2>
            <Badge label={usuario.estado || 'Activo'} bg={usuario.estado === 'Activo' || !usuario.estado ? '#ecfdf5' : '#f1f5f9'} color={usuario.estado === 'Activo' || !usuario.estado ? '#059669' : '#64748b'} />
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>{usuario.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
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
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
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

      {/* ─── CONTENIDO TABS ─── */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Calendar size={18} color="var(--text-muted)" />
                  <select className="input-field" value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={{ width: '180px', backgroundColor: 'white' }}>
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
                    <p style={{ color: '#475569', fontSize: '1rem' }}>Reporte de Progreso Individual · {usuario.nombre} · Período: {periodo}</p>
                  </div>
                )}

                {/* ── ALERTS ── */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  {analiticasData.kpis.dolor > 50 && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#be123c', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <AlertTriangle size={16} /> Aumento de dolor persistente detectado.
                    </div>
                  )}
                  {analiticasData.kpis.participacion < 50 && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <AlertCircle size={16} /> Baja adherencia reciente.
                    </div>
                  )}
                  {analiticasData.kpis.energia > 70 && (
                    <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <TrendingUp size={16} /> Evolución positiva de energía.
                    </div>
                  )}
                </div>

                {/* ── KPIs ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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

                {/* ── EVOLUCIÓN VS INICIAL ── */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Evolución desde el ingreso</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <MetricCard icon={<Activity size={18} />} label="Actividad Física" inicial={data.actividadFisica} actual={analiticasData.kpis.participacion > 60 ? 'Alta' : 'Media'} />
                  <MetricCard icon={<Zap size={18} />} label="Energía Percibida" inicial={data.energia} actual={getLabelEnergia(analiticasData.kpis.energia)} />
                  <MetricCard icon={<BatteryCharging size={18} />} label="Fatiga" inicial={data.fatiga} actual={getLabelFatiga(100 - analiticasData.kpis.energia)} />
                  <MetricCard icon={<Heart size={18} />} label="Bienestar" inicial={data.bienestar} actual={getLabelBienestar(analiticasData.kpis.impacto)} />
                </div>

                {/* ── ZONAS DE DOLOR ── */}
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

                {/* ── GRÁFICOS ── */}
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

// ── Main View ────────────────────────────────────────────────────
export const Usuarios: React.FC = () => {
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
  const [copied, setCopied] = useState(false);

  const loadData = () => {
    const db = getDB();
    setEmpresas(db.empresas);
    setUsuarios(db.usuarios);
  };

  useEffect(() => { loadData(); }, []);

  if (selectedUser) {
    const emp = empresas.find(e => e.id === selectedUser.empresa_id);
    return <UsuarioDetalle usuario={selectedUser} empresa={emp} onBack={() => { loadData(); setSelectedUser(null); }} />;
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideEmpresa = empresaFiltro === 'all' || u.empresa_id.toString() === empresaFiltro;
    const coincideBusqueda = u.nombre.toLowerCase().includes(search.toLowerCase());
    return coincideEmpresa && coincideBusqueda;
  });

  const getEmpresaName = (id: number) => empresas.find(e => e.id === id)?.nombre || 'Desconocida';

  const handleGenerateLink = () => {
    if (!selectedEmpresaId) return alert('Debes seleccionar una empresa.');
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/plataforma/onboarding/usuario/${token}`;
    
    addInvitacionUsuario({
      token,
      empresa_id: parseInt(selectedEmpresaId),
      responsable: newResponsable,
      emailEnviado: newEmail,
      fechaCreacion: new Date().toISOString()
    });
    
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFecha = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return '—'; }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Usuarios</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="input-field" style={{ width: '220px', backgroundColor: 'var(--bg-color)' }} value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>
            <option value="all">Todas las empresas</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Invitar Usuarios</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" className="input-field" placeholder="Buscar por nombre..." style={{ paddingLeft: '3rem', border: 'none', backgroundColor: 'var(--bg-secondary-color)' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Nombre</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Empresa</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Participación</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>¿Dolor?</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ingreso</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron usuarios.</td></tr>
            )}
            {usuariosFiltrados.map((usuario, idx) => (
              <tr 
                key={usuario.id} 
                style={{ borderBottom: idx !== usuariosFiltrados.length - 1 ? '1px solid var(--border-color)' : 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onClick={() => setSelectedUser(usuario)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{usuario.nombre}</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{getEmpresaName(usuario.empresa_id)}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${usuario.participacion}%`, height: '100%', backgroundColor: usuario.participacion > 70 ? 'var(--primary-color)' : '#f59e0b', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{usuario.participacion}%</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  {usuario.dolor ? <span className="badge badge-warning" style={{ gap: '0.25rem' }}><AlertCircle size={14} /> Sí</span> : <span className="text-muted">No</span>}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatFecha(usuario.fechaIngreso || usuario.ultima_interaccion)}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <Badge label={usuario.estado || 'Activo'} bg="#ecfdf5" color="#059669" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Invitar Usuarios */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)' }} onClick={() => { setIsModalOpen(false); setGeneratedLink(''); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#4f46e5' }}>
                <Mail size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Invitar Usuarios</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Genera un enlace único de onboarding. Los usuarios que ingresen quedarán vinculados a la empresa seleccionada.</p>
            </div>

            {!generatedLink ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email para envío (Opcional)</label>
                  <input type="email" className="input-field" placeholder="correo@empresa.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={handleGenerateLink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s' }}>
                    <LinkIcon size={24} color="#4f46e5" /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Generar enlace</span>
                  </button>
                  <button type="button" onClick={handleGenerateLink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s' }}>
                    <Mail size={24} color="#4f46e5" /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enviar por email</span>
                  </button>
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
                <button type="button" onClick={() => { setIsModalOpen(false); setGeneratedLink(''); }} style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', border: 'none', background: 'none', cursor: 'pointer' }}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

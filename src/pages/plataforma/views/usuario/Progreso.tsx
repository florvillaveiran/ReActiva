import React from 'react';
import { CheckCircle2, Calendar, Award, Zap, Target, HeartPulse, PieChart, Sparkles, Inbox } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { usePausasStats } from '../../hooks/usePausasStats';

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}> = ({ icon, iconBg, iconColor, value, label }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    border: '1px solid #eef0f3',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: '12px',
      backgroundColor: iconBg, color: iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1.1, marginBottom: '2px' }}>{value}</p>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</p>
    </div>
  </div>
);

// ─── Chart Card ───────────────────────────────────────────────────────────
const ChartCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  titulo: string;
  subtitulo: string;
  promedio: string;
  promedioColor: string;
  data: { dia: string; valor: number }[];
  lineColor: string;
  gradientId: string;
}> = ({ icon, iconBg, iconColor, titulo, subtitulo, promedio, promedioColor, data, lineColor, gradientId }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #eef0f3',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    display: 'flex', flexDirection: 'column', minHeight: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '10px',
          backgroundColor: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)' }}>{titulo}</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitulo}</p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: promedioColor, lineHeight: 1 }}>{promedio}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Promedio</p>
      </div>
    </div>
    <div style={{ flex: 1, minHeight: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={lineColor}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            dot={{ fill: lineColor, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ─── Vista Mi Progreso ────────────────────────────────────────────────────
export const UsuarioProgreso: React.FC = () => {
  const stats = usePausasStats();

  // Adherencia label dinámica
  const adherenciaLabel =
    stats.adherencia >= 80 ? '¡Vas excelente!' :
    stats.adherencia >= 50 ? '¡Buen ritmo!' :
    stats.adherencia > 0 ? '¡Vamos por más!' :
    'Sin datos aún';

  // Convertir promedios 1-5 a %
  const energiaPct = stats.energiaPromedio != null ? Math.round((stats.energiaPromedio / 5) * 100) : null;
  const focoPct = stats.focoPromedio != null ? Math.round((stats.focoPromedio / 5) * 100) : null;

  // Data para los charts (reemplazar null por 0 para que el área se dibuje)
  const energiaChartData = stats.energiaPorDia.map(d => ({ dia: d.dia, valor: d.valor ?? 0 }));
  const focoChartData = stats.focoPorDia.map(d => ({ dia: d.dia, valor: d.valor ?? 0 }));

  // Estado vacío: sin ninguna pausa completada
  if (!stats.hayDatos) {
    return (
      <div style={{
        animation: 'fadeIn 0.3s ease-out',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        minHeight: 'calc(100vh - 3rem)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)' }}>Mi Progreso</h1>
          <span style={{
            padding: '0.3rem 0.85rem', borderRadius: '20px',
            backgroundColor: '#ecfdf5', color: '#059669',
            fontSize: '0.78rem', fontWeight: 600, border: '1px solid #a7f3d0',
          }}>Esta Semana</span>
        </div>

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'white', borderRadius: '20px',
          border: '1px solid #eef0f3', padding: '3rem 2rem',
          textAlign: 'center', gap: '1rem',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            backgroundColor: '#ecfdf5', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Inbox size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>Todavía no hay datos para mostrar</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 420 }}>
            Completá tu primera pausa en <strong style={{ color: 'var(--primary-color)' }}>Mi Programa</strong> y empezaremos a calcular tus métricas de energía, foco, molestias e impacto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      animation: 'fadeIn 0.3s ease-out',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
      minHeight: 'calc(100vh - 3rem)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)' }}>Mi Progreso</h1>
        <span style={{
          padding: '0.3rem 0.85rem',
          borderRadius: '20px',
          backgroundColor: '#ecfdf5',
          color: '#059669',
          fontSize: '0.78rem',
          fontWeight: 600,
          border: '1px solid #a7f3d0',
        }}>Esta Semana</span>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <KpiCard
          icon={<CheckCircle2 size={24} />}
          iconBg="#ecfdf5"
          iconColor="#059669"
          value={`${stats.totalPausas} ${stats.totalPausas === 1 ? 'Pausa' : 'Pausas'}`}
          label="completadas esta semana 🙌"
        />
        <KpiCard
          icon={<Calendar size={22} />}
          iconBg="#fff7ed"
          iconColor="#f97316"
          value={`${stats.diasActivos} ${stats.diasActivos === 1 ? 'Día' : 'Días'}`}
          label="activos de lunes a viernes"
        />
        <KpiCard
          icon={<Award size={22} />}
          iconBg="#fefce8"
          iconColor="#ca8a04"
          value={`${stats.adherencia}%`}
          label={`adherencia. ${adherenciaLabel}`}
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', flex: 2.2, minHeight: 320 }}>
        <ChartCard
          icon={<Zap size={20} />}
          iconBg="#fef3c7"
          iconColor="#d97706"
          titulo="Energía Post-Pausa"
          subtitulo="Evolución de tu vitalidad"
          promedio={energiaPct != null ? `${energiaPct}%` : '—'}
          promedioColor="#d97706"
          data={energiaChartData}
          lineColor="#f59e0b"
          gradientId="energiaGradient"
        />
        <ChartCard
          icon={<Target size={20} />}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          titulo="Nivel de Foco"
          subtitulo="Tu concentración semanal"
          promedio={focoPct != null ? `${focoPct}%` : '—'}
          promedioColor="#2563eb"
          data={focoChartData}
          lineColor="#3b82f6"
          gradientId="focoGradient"
        />
      </div>

      {/* Cards inferiores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', flex: 0.6, minHeight: 160 }}>
        {/* Molestias Físicas */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem',
          border: '1px solid #eef0f3', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          height: '100%', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              backgroundColor: '#fff1f2', color: '#e11d48',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HeartPulse size={18} />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>Molestias Físicas</p>
          </div>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.9rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.4rem' }}>{stats.diasConDolor} </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {stats.diasConDolor === 0 ? 'días sin molestias' : (stats.diasConDolor === 1 ? 'día con molestias leves' : 'días con molestias leves')}
            </span>
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {stats.zonasDolor.length === 0 ? (
              <span style={{
                padding: '0.3rem 0.8rem', borderRadius: '20px',
                fontSize: '0.78rem', fontWeight: 500,
                backgroundColor: '#f0fdf4', color: '#059669', border: '1px solid #a7f3d0',
              }}>Todo en orden</span>
            ) : (
              stats.zonasDolor.map(z => (
                <span key={z} style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  backgroundColor: '#f8fafc',
                  color: 'var(--text-muted)',
                  border: '1px solid #e2e8f0',
                }}>{z}</span>
              ))
            )}
          </div>
        </div>

        {/* Impacto Percibido */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem',
          border: '1px solid #eef0f3', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          height: '100%', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              backgroundColor: '#ecfdf5', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PieChart size={18} />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>Impacto Percibido</p>
          </div>
          {stats.impactoPercibido != null ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>Beneficio de las pausas</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{stats.impactoPercibido}%</span>
              </div>
              <div style={{
                height: 8, borderRadius: '20px',
                backgroundColor: '#f1f5f9', overflow: 'hidden', marginBottom: '0.75rem',
              }}>
                <div style={{
                  width: `${stats.impactoPercibido}%`, height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  borderRadius: '20px', transition: 'width 0.4s',
                }} />
              </div>
            </>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              Pendiente de feedback semanal
            </p>
          )}
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            {stats.impactoTexto}
          </p>
        </div>

        {/* Para ti */}
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
          borderRadius: '16px', padding: '1.25rem 1.5rem',
          border: '1px solid #e9d5ff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          height: '100%', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              backgroundColor: '#f3e8ff', color: '#9333ea',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#6b21a8' }}>Para ti</p>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#581c87', lineHeight: 1.55, fontStyle: 'italic' }}>
            {stats.mensajeParaTi}
          </p>
        </div>
      </div>
    </div>
  );
};

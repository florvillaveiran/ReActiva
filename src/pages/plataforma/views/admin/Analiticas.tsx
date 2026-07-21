import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Filter, Calendar, Bell, CheckCircle2, ListChecks, Users, Briefcase, Settings, Monitor, UserRoundCheck, GitCompareArrows, ShieldCheck } from 'lucide-react';
import { type AdminStats, type AnalyticsWorkProfileFilter, useAdminStats } from '../../hooks/useAdminStats';
import { ReportGenerator } from '../../components/ReportGenerator';
import { useAuth } from '../../context/AuthContext';
import { useEmpresas } from '../../context/EmpresasContext';

// ─── Tipos ─────────────────────────────────────────────────────────────────
type PeriodoKey = 'semanal' | 'mensual' | 'anual' | 'personalizado';

interface AnaliticaSetBase {
  zonas: { name: string; valor: number }[];
  tension: { name: string; valor: number }[];
  evolucion: { name: string; energia: number; satisfaccion: number; participacion: number }[];
}

interface AnaliticaSet {
  zonas: { name: string; valor: number }[];
  tension: { name: string; valor: number }[];
  evolucion: { name: string; energia: number; satisfaccion: number; participacion: number; foco: number; dolor: number; impacto: number; energiaPct: number }[];
  kpis: {
    participacion: number;
    dolor: number;
    foco: number;
    impacto: number;
    energia: number;
  };
}

// Deriva foco, dolor, impacto, energiaPct y KPIs a partir de los datos base.
const enrichSet = (base: AnaliticaSetBase): AnaliticaSet => {
  const evolucion = base.evolucion.map(p => {
    const foco = Math.min(100, Math.round(p.satisfaccion * 0.92 + 6));
    const dolor = Math.max(0, Math.round(100 - p.satisfaccion - 5));
    const impacto = Math.min(100, Math.round(p.satisfaccion * 0.95 + 3));
    const energiaPct = Math.round((p.energia / 5) * 100); // 1-5 → %
    return { ...p, foco, dolor, impacto, energiaPct };
  });
  const last = evolucion[evolucion.length - 1];
  return {
    zonas: base.zonas,
    tension: base.tension,
    evolucion,
    kpis: {
      participacion: last?.participacion ?? 0,
      dolor: last?.dolor ?? 0,
      foco: last?.foco ?? 0,
      impacto: last?.impacto ?? 0,
      energia: last?.energiaPct ?? 0,
    },
  };
};

// ─── Mocks por empresa y período ───────────────────────
const ANALITICAS_MOCK: Record<string, Record<PeriodoKey, AnaliticaSetBase>> = {
  // ── Vista General (Todas las empresas) ──────────────────────────────────
  all: {
    semanal: {
      zonas: [
        { name: 'Espalda Baja', valor: 42 }, { name: 'Cuello', valor: 28 },
        { name: 'Hombros', valor: 18 }, { name: 'Muñecas', valor: 12 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Lun', energia: 3.4, satisfaccion: 78, participacion: 82 },
        { name: 'Mié', energia: 3.7, satisfaccion: 84, participacion: 88 },
        { name: 'Vie', energia: 4.0, satisfaccion: 90, participacion: 94 },
      ],
    },
    mensual: {
      zonas: [
        { name: 'Espalda Baja', valor: 45 }, { name: 'Cuello', valor: 30 },
        { name: 'Hombros', valor: 15 }, { name: 'Muñecas', valor: 10 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 3.2, satisfaccion: 75, participacion: 80 },
        { name: 'Sem 2', energia: 3.5, satisfaccion: 82, participacion: 85 },
        { name: 'Sem 3', energia: 3.8, satisfaccion: 88, participacion: 90 },
        { name: 'Sem 4', energia: 4.1, satisfaccion: 92, participacion: 95 },
      ],
    },
    anual: {
      zonas: [
        { name: 'Espalda Baja', valor: 50 }, { name: 'Cuello', valor: 28 },
        { name: 'Hombros', valor: 15 }, { name: 'Muñecas', valor: 7 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'T1', energia: 2.9, satisfaccion: 68, participacion: 72 },
        { name: 'T2', energia: 3.4, satisfaccion: 78, participacion: 82 },
        { name: 'T3', energia: 3.8, satisfaccion: 86, participacion: 89 },
        { name: 'T4', energia: 4.2, satisfaccion: 93, participacion: 95 },
      ],
    },
    personalizado: {
      zonas: [
        { name: 'Espalda Baja', valor: 45 }, { name: 'Cuello', valor: 30 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 3.2, satisfaccion: 75, participacion: 80 },
        { name: 'Fin', energia: 4.1, satisfaccion: 92, participacion: 95 },
      ],
    },
  },
  // ── Empresa Alpha ───────────────────────────────────────────────────────
  empresa1: {
    semanal: {
      zonas: [
        { name: 'Cuello', valor: 52 }, { name: 'Espalda Baja', valor: 30 },
        { name: 'Hombros', valor: 15 }, { name: 'Rodillas', valor: 3 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Lun', energia: 3.5, satisfaccion: 80, participacion: 85 },
        { name: 'Mié', energia: 3.8, satisfaccion: 86, participacion: 90 },
        { name: 'Vie', energia: 4.2, satisfaccion: 92, participacion: 96 },
      ],
    },
    mensual: {
      zonas: [
        { name: 'Cuello', valor: 50 }, { name: 'Espalda Baja', valor: 35 },
        { name: 'Hombros', valor: 15 }, { name: 'Rodillas', valor: 0 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 3.4, satisfaccion: 78, participacion: 85 },
        { name: 'Sem 2', energia: 3.7, satisfaccion: 84, participacion: 90 },
        { name: 'Sem 3', energia: 4.0, satisfaccion: 89, participacion: 93 },
        { name: 'Sem 4', energia: 4.3, satisfaccion: 94, participacion: 97 },
      ],
    },
    anual: {
      zonas: [
        { name: 'Cuello', valor: 46 }, { name: 'Espalda Baja', valor: 36 },
        { name: 'Hombros', valor: 13 }, { name: 'Rodillas', valor: 5 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'T1', energia: 3.0, satisfaccion: 70, participacion: 78 },
        { name: 'T2', energia: 3.5, satisfaccion: 80, participacion: 86 },
        { name: 'T3', energia: 3.9, satisfaccion: 88, participacion: 92 },
        { name: 'T4', energia: 4.3, satisfaccion: 94, participacion: 97 },
      ],
    },
    personalizado: {
      zonas: [
        { name: 'Cuello', valor: 50 }, { name: 'Espalda Baja', valor: 35 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 3.4, satisfaccion: 78, participacion: 85 },
        { name: 'Fin', energia: 4.3, satisfaccion: 94, participacion: 97 },
      ],
    },
  },
  // ── Empresa Beta ────────────────────────────────────────────────────────
  empresa2: {
    semanal: {
      zonas: [
        { name: 'Espalda Baja', valor: 48 }, { name: 'Hombros', valor: 28 },
        { name: 'Cuello', valor: 18 }, { name: 'Piernas', valor: 6 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Lun', energia: 3.0, satisfaccion: 70, participacion: 75 },
        { name: 'Mié', energia: 3.4, satisfaccion: 76, participacion: 80 },
        { name: 'Vie', energia: 3.8, satisfaccion: 84, participacion: 87 },
      ],
    },
    mensual: {
      zonas: [
        { name: 'Espalda Baja', valor: 50 }, { name: 'Hombros', valor: 25 },
        { name: 'Cuello', valor: 20 }, { name: 'Piernas', valor: 5 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 2.9, satisfaccion: 68, participacion: 72 },
        { name: 'Sem 2', energia: 3.2, satisfaccion: 74, participacion: 78 },
        { name: 'Sem 3', energia: 3.5, satisfaccion: 80, participacion: 84 },
        { name: 'Sem 4', energia: 3.9, satisfaccion: 86, participacion: 89 },
      ],
    },
    anual: {
      zonas: [
        { name: 'Espalda Baja', valor: 54 }, { name: 'Hombros', valor: 22 },
        { name: 'Cuello', valor: 18 }, { name: 'Piernas', valor: 6 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'T1', energia: 2.6, satisfaccion: 60, participacion: 66 },
        { name: 'T2', energia: 3.0, satisfaccion: 70, participacion: 75 },
        { name: 'T3', energia: 3.4, satisfaccion: 80, participacion: 83 },
        { name: 'T4', energia: 3.8, satisfaccion: 87, participacion: 90 },
      ],
    },
    personalizado: {
      zonas: [
        { name: 'Espalda Baja', valor: 50 }, { name: 'Hombros', valor: 25 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 2.9, satisfaccion: 68, participacion: 72 },
        { name: 'Fin', energia: 3.9, satisfaccion: 86, participacion: 89 },
      ],
    },
  },
  // ── Empresa Gamma ───────────────────────────────────────────────────────
  empresa3: {
    semanal: {
      zonas: [
        { name: 'Espalda Alta', valor: 38 }, { name: 'Cuello', valor: 32 },
        { name: 'Muñecas', valor: 22 }, { name: 'Hombros', valor: 8 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Lun', energia: 2.7, satisfaccion: 62, participacion: 68 },
        { name: 'Mié', energia: 3.1, satisfaccion: 70, participacion: 74 },
        { name: 'Vie', energia: 3.4, satisfaccion: 76, participacion: 80 },
      ],
    },
    mensual: {
      zonas: [
        { name: 'Espalda Alta', valor: 40 }, { name: 'Cuello', valor: 30 },
        { name: 'Muñecas', valor: 20 }, { name: 'Hombros', valor: 10 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 2.6, satisfaccion: 60, participacion: 65 },
        { name: 'Sem 2', energia: 2.9, satisfaccion: 66, participacion: 70 },
        { name: 'Sem 3', energia: 3.2, satisfaccion: 72, participacion: 76 },
        { name: 'Sem 4', energia: 3.5, satisfaccion: 78, participacion: 82 },
      ],
    },
    anual: {
      zonas: [
        { name: 'Espalda Alta', valor: 44 }, { name: 'Cuello', valor: 28 },
        { name: 'Muñecas', valor: 18 }, { name: 'Hombros', valor: 10 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'T1', energia: 2.3, satisfaccion: 55, participacion: 60 },
        { name: 'T2', energia: 2.7, satisfaccion: 64, participacion: 68 },
        { name: 'T3', energia: 3.1, satisfaccion: 73, participacion: 76 },
        { name: 'T4', energia: 3.5, satisfaccion: 80, participacion: 84 },
      ],
    },
    personalizado: {
      zonas: [
        { name: 'Espalda Alta', valor: 40 }, { name: 'Cuello', valor: 30 },
      ],
      tension: [
        { name: 'A la mañana', valor: 15 },
        { name: 'Al mediodía', valor: 10 },
        { name: 'A la tarde', valor: 45 },
        { name: 'Al final de la jornada', valor: 30 },
        { name: 'No sentí tensión', valor: 0 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 2.6, satisfaccion: 60, participacion: 65 },
        { name: 'Fin', energia: 3.5, satisfaccion: 78, participacion: 82 },
      ],
    },
  },
};

const PERIODO_LABELS: Record<PeriodoKey, string> = {
  semanal: 'Semanal',
  mensual: 'Mensual',
  anual: 'Anual',
  personalizado: 'Personalizado',
};

const MONTH_OPTIONS_2026 = [
  'Enero 2026',
  'Febrero 2026',
  'Marzo 2026',
  'Abril 2026',
  'Mayo 2026',
  'Junio 2026',
  'Julio 2026',
  'Agosto 2026',
  'Septiembre 2026',
  'Octubre 2026',
  'Noviembre 2026',
  'Diciembre 2026',
];

const WEEK_OPTIONS_2026 = [
  { label: 'Semana del 20 al 26 de julio', from: '2026-07-20', to: '2026-07-26' },
  { label: 'Semana del 27 de julio al 2 de agosto', from: '2026-07-27', to: '2026-08-02' },
  { label: 'Semana del 3 al 9 de agosto', from: '2026-08-03', to: '2026-08-09' },
  { label: 'Semana del 10 al 16 de agosto', from: '2026-08-10', to: '2026-08-16' },
  { label: 'Semana del 17 al 23 de agosto', from: '2026-08-17', to: '2026-08-23' },
  { label: 'Semana del 24 al 30 de agosto', from: '2026-08-24', to: '2026-08-30' },
];

const formatReportDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const resolveReportRange = (
  periodo: PeriodoKey,
  semanaSel: string,
  mesSel: string,
  anioSel: string,
  fechaDesde: string,
  fechaHasta: string,
) => {
  if (periodo === 'personalizado') return { from: fechaDesde, to: fechaHasta };
  if (periodo === 'anual') return { from: `${anioSel}-01-01`, to: `${anioSel}-12-31` };
  if (periodo === 'mensual') {
    const months: Record<string, string> = {
      Enero: '01', Febrero: '02', Marzo: '03', Abril: '04', Mayo: '05', Junio: '06',
      Julio: '07', Agosto: '08', Septiembre: '09', Octubre: '10', Noviembre: '11', Diciembre: '12',
    };
    const [monthName, year] = mesSel.split(' ');
    const month = months[monthName];
    if (!month || !year) return { from: '', to: '' };
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    return { from: `${year}-${month}-01`, to: `${year}-${month}-${String(lastDay).padStart(2, '0')}` };
  }
  const selectedWeek = WEEK_OPTIONS_2026.find(week => week.label === semanaSel);
  return selectedWeek ? { from: selectedWeek.from, to: selectedWeek.to } : { from: '', to: '' };
};

const EMPTY_ANALYTICS = enrichSet({ zonas: [], tension: [], evolucion: [] });

const analyticsSetFromStats = (stats: AdminStats): AnaliticaSet => {
  if (!stats.hayDatos) return EMPTY_ANALYTICS;
  const evolucionReal = stats.evolucion.map(p => ({
    ...p,
    foco: stats.foco.enfocado,
    dolor: stats.reportanMolestias,
    impacto: p.satisfaccion,
    energiaPct: Math.round((p.energia / 5) * 100),
  }));
  const focoReal = stats.foco.enfocado || (stats.estadoEmocional ? Math.round((stats.estadoEmocional / 5) * 100) : 0);
  return {
    zonas: stats.zonasDolorChart,
    tension: stats.tensionDistribucion,
    evolucion: evolucionReal,
    kpis: {
      participacion: stats.adherencia,
      dolor: stats.reportanMolestias,
      foco: focoReal,
      impacto: stats.evolucion.at(-1)?.satisfaccion ?? 0,
      energia: Math.round((stats.energiaPromedio / 5) * 100),
    },
  };
};

const analyticsEnvironment = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const configuredPrivacyMinimum = Number(analyticsEnvironment?.VITE_ANALYTICS_MIN_GROUP_SIZE ?? 5);
const WORK_PROFILE_PRIVACY_MIN_USERS = Number.isFinite(configuredPrivacyMinimum)
  ? Math.max(2, Math.round(configuredPrivacyMinimum))
  : 5;

const WorkProfileComparison: React.FC<{
  administrativeStats: AdminStats;
  operativeStats: AdminStats;
}> = ({ administrativeStats, operativeStats }) => {
  const administrativeData = useMemo(() => analyticsSetFromStats(administrativeStats), [administrativeStats]);
  const operativeData = useMemo(() => analyticsSetFromStats(operativeStats), [operativeStats]);
  const administrativeVisible = administrativeStats.usuariosCount >= WORK_PROFILE_PRIVACY_MIN_USERS;
  const operativeVisible = operativeStats.usuariosCount >= WORK_PROFILE_PRIVACY_MIN_USERS;

  const topTension = (stats: AdminStats) => [...stats.tensionDistribucion].sort((a, b) => b.valor - a.valor)[0];
  const administrativeTension = topTension(administrativeStats);
  const operativeTension = topTension(operativeStats);
  const rows = [
    { label: 'Participación', admin: administrativeData.kpis.participacion, operative: operativeData.kpis.participacion, color: '#0f9f8f' },
    { label: 'Energía', admin: administrativeData.kpis.energia, operative: operativeData.kpis.energia, color: '#f59e0b' },
    { label: 'Foco', admin: administrativeData.kpis.foco, operative: operativeData.kpis.foco, color: '#3b82f6' },
    { label: 'Dolor', admin: administrativeData.kpis.dolor, operative: operativeData.kpis.dolor, color: '#f43f5e' },
    { label: 'Tensión', admin: administrativeTension?.valor ?? 0, operative: operativeTension?.valor ?? 0, color: '#4f46e5' },
    { label: 'Impacto percibido', admin: administrativeData.kpis.impacto, operative: operativeData.kpis.impacto, color: '#9333ea' },
  ];

  const privacyMessage = (
    <div className="work-profile-privacy-message">
      <ShieldCheck size={18} />
      <span>Datos insuficientes para preservar la privacidad.</span>
    </div>
  );

  return (
    <section className="work-profile-comparison card" aria-label="Comparación de perfiles laborales">
      <div className="work-profile-comparison-header">
        <div>
          <p className="work-profile-comparison-eyebrow">Comparación agregada</p>
          <h3>Administrativo vs. Operativo</h3>
          <p>Solo se muestran grupos con al menos {WORK_PROFILE_PRIVACY_MIN_USERS} usuarios con datos en el período.</p>
        </div>
        <span className="work-profile-comparison-secure"><ShieldCheck size={15} /> Privacidad protegida</span>
      </div>

      <div className="work-profile-comparison-summary">
        <div className="work-profile-segment administrative">
          <span>Administrativo</span>
          {administrativeVisible
            ? <strong>{administrativeStats.usuariosCount} usuarios incluidos</strong>
            : privacyMessage}
        </div>
        <div className="work-profile-segment operative">
          <span>Operativo</span>
          {operativeVisible
            ? <strong>{operativeStats.usuariosCount} usuarios incluidos</strong>
            : privacyMessage}
        </div>
      </div>

      <div className="work-profile-comparison-table">
        <div className="work-profile-comparison-row work-profile-comparison-labels">
          <span>Indicador</span><span>Administrativo</span><span>Operativo</span>
        </div>
        {rows.map(row => (
          <div className="work-profile-comparison-row" key={row.label}>
            <strong>{row.label}</strong>
            <div>
              {administrativeVisible ? <><b style={{ color: row.color }}>{row.admin}%</b><span className="comparison-bar"><i style={{ width: `${row.admin}%`, background: row.color }} /></span></> : <em>Privado</em>}
            </div>
            <div>
              {operativeVisible ? <><b style={{ color: row.color }}>{row.operative}%</b><span className="comparison-bar"><i style={{ width: `${row.operative}%`, background: row.color }} /></span></> : <em>Privado</em>}
            </div>
          </div>
        ))}
      </div>

      {(administrativeVisible || operativeVisible) && (
        <div className="work-profile-tension-notes">
          {administrativeVisible && <span><b>Administrativo:</b> mayor tensión {administrativeTension?.name?.toLowerCase() ?? 'sin registros'}.</span>}
          {operativeVisible && <span><b>Operativo:</b> mayor tensión {operativeTension?.name?.toLowerCase() ?? 'sin registros'}.</span>}
        </div>
      )}
    </section>
  );
};

const normalizeZone = (name: string) => name.toLowerCase().replace('baja', 'baja').replace('alta', 'alta');

const prettyZone = (name: string) => {
  const normalized = normalizeZone(name);
  if (normalized === 'espalda baja') return 'Espalda baja';
  if (normalized === 'espalda alta') return 'Espalda alta';
  if (normalized === 'munecas' || normalized === 'muñecas') return 'Muñecas';
  return name;
};

const PainZonesCard: React.FC<{ zonas: { name: string; valor: number }[]; totalPersonas: number }> = ({ zonas, totalPersonas }) => {
  const ordered = [...zonas]
    .filter(zone => ['cuello', 'hombros', 'espalda alta', 'espalda baja', 'munecas', 'muñecas', 'caderas', 'rodillas'].includes(normalizeZone(zone.name)))
    .sort((a, b) => b.valor - a.valor);
  const topZone = ordered[0];
  if (!topZone) {
    return (
      <div className="card" style={{ padding: '1.25rem', minHeight: 220 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Zonas más afectadas</h3>
        <div style={{ minHeight: 155, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.88rem' }}>
          Todavía no hay reportes de dolor para este período.
        </div>
      </div>
    );
  }
  const baseTotal = Math.max(totalPersonas, 1);
  const chartData = ordered.slice(0, 7).map(zone => ({
    name: prettyZone(zone.name),
    valor: Math.max(1, Math.round((zone.valor / 100) * baseTotal)),
    porcentaje: zone.valor,
  }));
  const topCount = chartData[0]?.valor ?? Math.max(1, Math.round((topZone.valor / 100) * baseTotal));

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Zonas más afectadas</h3>
      <div style={{ height: '180px', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Zona más reportada</p>
            <p style={{ margin: '0.15rem 0 0', color: '#e11d48', fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.1 }}>{prettyZone(topZone.name)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#e11d48', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1 }}>{topCount}</p>
            <p style={{ margin: '0.15rem 0 0', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>personas</p>
          </div>
        </div>
        <div style={{ minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={92} />
              <Tooltip
                formatter={(val: number, _name, item: any) => [`${val} personas (${item.payload.porcentaje}%)`, 'Reportes']}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }}
              />
              <Bar dataKey="valor" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const Analiticas: React.FC = () => {
  const { user } = useAuth();
  const { empresas } = useEmpresas();
  const [filtro, setFiltro] = useState<string>('all');
  const [workProfileFilter, setWorkProfileFilter] = useState<AnalyticsWorkProfileFilter>('ALL');
  const [compareWorkProfiles, setCompareWorkProfiles] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoKey>('mensual');
  
  // Selectores secundarios condicionales
  const [semanaSel, setSemanaSel] = useState(WEEK_OPTIONS_2026[0].label);
  const [mesSel, setMesSel] = useState('Julio 2026');
  const [anioSel, setAnioSel] = useState('2026');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  // Comparativas
  const [comparar, setComparar] = useState(false);

  const rrhhEmpresa = useMemo(() => {
    if (user?.role !== 'rrhh') return undefined;
    const companyId = user.empresa_id?.toString();
    return empresas.find(e => e.supabaseId === companyId)
      ?? empresas.find(e => e.id.toString() === companyId)
      ?? empresas.find(e => e.rrhhEmail?.toLowerCase() === user.email.toLowerCase());
  }, [empresas, user]);

  const rrhhEmpresaKey = user?.role === 'rrhh'
    ? (rrhhEmpresa?.id.toString() ?? user.empresa_id?.toString() ?? null)
    : null;
  const effectiveFiltro = rrhhEmpresaKey ?? filtro;
  const currentEmpresaLabel = user?.isDemo
    ? 'Empresa Demo'
    : effectiveFiltro === 'all'
      ? 'Todas'
      : empresas.find(e => e.id.toString() === effectiveFiltro || e.supabaseId === effectiveFiltro)?.nombre || 'Empresa';
  const selectedEmpresa = effectiveFiltro === 'all'
    ? undefined
    : empresas.find(e => e.id.toString() === effectiveFiltro || e.supabaseId === effectiveFiltro);
  const isUuidFilter = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveFiltro);
  const statsCompanyId = effectiveFiltro === 'all'
    ? undefined
    : selectedEmpresa?.supabaseId ?? (isUuidFilter ? effectiveFiltro : undefined);
  const reportRange = useMemo(
    () => resolveReportRange(periodo, semanaSel, mesSel, anioSel, fechaDesde, fechaHasta),
    [anioSel, fechaDesde, fechaHasta, mesSel, periodo, semanaSel],
  );
  const allStats = useAdminStats(statsCompanyId, reportRange.from || undefined, reportRange.to || undefined, 'ALL');
  const administrativeStats = useAdminStats(statsCompanyId, reportRange.from || undefined, reportRange.to || undefined, 'ADMINISTRATIVO');
  const operativeStats = useAdminStats(statsCompanyId, reportRange.from || undefined, reportRange.to || undefined, 'OPERATIVO');
  const stats = workProfileFilter === 'ADMINISTRATIVO'
    ? administrativeStats
    : workProfileFilter === 'OPERATIVO'
      ? operativeStats
      : allStats;

  const data = useMemo<AnaliticaSet>(() => analyticsSetFromStats(stats), [stats]);
  const allReportData = useMemo<AnaliticaSet>(() => analyticsSetFromStats(allStats), [allStats]);
  const administrativeReportData = useMemo<AnaliticaSet>(() => analyticsSetFromStats(administrativeStats), [administrativeStats]);
  const operativeReportData = useMemo<AnaliticaSet>(() => analyticsSetFromStats(operativeStats), [operativeStats]);

  const painTotalPersonas = stats.hayDatos ? stats.usuariosCount : 0;

  const reportPeriodoLabel = periodo === 'semanal'
    ? semanaSel
    : periodo === 'mensual'
      ? mesSel
      : periodo === 'anual'
        ? anioSel
        : fechaDesde && fechaHasta
          ? `Del ${formatReportDate(fechaDesde)} al ${formatReportDate(fechaHasta)}`
          : PERIODO_LABELS[periodo];

  if (user?.isDemo && rrhhEmpresaKey) {
    const demoData = enrichSet(ANALITICAS_MOCK.empresa1[periodo]);
    const kpis = [
      { label: 'Participacion', value: demoData.kpis.participacion, previous: 78, color: 'var(--primary-color)', bg: '#f0fdfa', delta: '+8 pp' },
      { label: 'Foco', value: demoData.kpis.foco, previous: 72, color: '#3b82f6', bg: '#eff6ff', delta: '+6 pp' },
      { label: 'Impacto Pausa', value: demoData.kpis.impacto, previous: 88, color: '#9333ea', bg: '#faf5ff', delta: '+3 pp' },
      { label: 'Dolor', value: demoData.kpis.dolor, previous: 16, color: '#f43f5e', bg: '#fff1f2', delta: '-4 pp', inverse: true },
      { label: 'Energia', value: demoData.kpis.energia, previous: 69, color: '#f59e0b', bg: '#fffbeb', delta: '+5 pp' },
    ];
    const sectorRows = [
      { sector: 'Comercial', icon: <UserRoundCheck size={18} />, part: 92, energia: 78, estado: 'Bien', color: 'var(--primary-color)' },
      { sector: 'Operaciones', icon: <Settings size={18} />, part: 85, energia: 72, estado: 'Bien', color: 'var(--primary-color)' },
      { sector: 'Administracion', icon: <Briefcase size={18} />, part: 78, energia: 68, estado: 'Atencion', color: '#9333ea' },
      { sector: 'Tecnologia', icon: <Monitor size={18} />, part: 83, energia: 77, estado: 'Bien', color: '#3b82f6' },
    ];
    return (
      <div className="analytics-page analytics-rrhh-page" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="analytics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.35rem' }}>
          <h2 className="header-title" style={{ marginBottom: 0 }}>Analiticas RRHH</h2>
          <div className="analytics-filters" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="input-field" style={{ width: 160, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'white' }}>
              <Filter size={15} />
              {currentEmpresaLabel}
            </div>
            <select className="input-field" style={{ width: 150, backgroundColor: 'white' }} value={periodo} onChange={(event) => setPeriodo(event.target.value as PeriodoKey)}>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
              <option value="personalizado">Personalizado</option>
            </select>
            {periodo === 'mensual' && (
              <select className="input-field" style={{ width: 150, backgroundColor: 'white' }} value={mesSel} onChange={(event) => setMesSel(event.target.value)}>
                {MONTH_OPTIONS_2026.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            )}
            {periodo === 'personalizado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="date" className="input-field" value={fechaDesde} max={fechaHasta || undefined} onChange={event => setFechaDesde(event.target.value)} style={{ width: 140, backgroundColor: 'white' }} />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input type="date" className="input-field" value={fechaHasta} min={fechaDesde || undefined} onChange={event => setFechaHasta(event.target.value)} style={{ width: 140, backgroundColor: 'white' }} />
              </div>
            )}
            {periodo === 'mensual' && (
              <label className="analytics-compare" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#334155', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={comparar} onChange={(event) => setComparar(event.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                Comparar con mes anterior
              </label>
            )}
          </div>
        </div>

        <div className="analytics-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {kpis.map(kpi => (
            <div key={kpi.label} className="card" style={{ padding: '1.1rem 1.25rem', margin: 0 }}>
              <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>{kpi.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
                <strong style={{ color: kpi.color, fontSize: '1.8rem', lineHeight: 1 }}>{kpi.value}%</strong>
                <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.82rem' }}>{kpi.delta}</span>
              </div>
              <div style={{ height: 4, background: kpi.bg, borderRadius: 999, overflow: 'hidden', margin: '0.75rem 0' }}>
                <div style={{ width: `${kpi.value}%`, height: '100%', background: kpi.color, borderRadius: 999 }} />
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem' }}>vs. junio 2026: {kpi.previous}%</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Participacion</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Bar dataKey="participacion" name="Participacion (%)" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <PainZonesCard zonas={demoData.zonas} totalPersonas={48} />

          <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Foco</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="demoColorFoco" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Area type="monotone" dataKey="foco" name="Foco (%)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#demoColorFoco)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Impacto Pausa</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="demoColorImpacto" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} /><stop offset="95%" stopColor="#9333ea" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Area type="monotone" dataKey="impacto" name="Impacto (%)" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#demoColorImpacto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Energia</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoData.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="demoColorEnergia" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Area type="monotone" dataKey="energiaPct" name="Energia (%)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#demoColorEnergia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Momento de mayor tension</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={demoData.tension} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={110} />
                  <Tooltip formatter={(val: number) => [`${val}%`, 'Respuestas']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Bar dataKey="valor" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <h3 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: '1rem' }}>Rendimiento por sector</h3>
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {sectorRows.map(row => (
              <div key={row.sector} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr 90px', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid #eef2f7', paddingBottom: '0.65rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#0f172a', fontWeight: 700, fontSize: '0.86rem' }}><span style={{ color: row.color }}>{row.icon}</span>{row.sector}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 999 }}><span style={{ display: 'block', width: `${row.part}%`, height: '100%', background: 'var(--primary-color)', borderRadius: 999 }} /></span><b style={{ fontSize: '0.8rem' }}>{row.part}%</b></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 999 }}><span style={{ display: 'block', width: `${row.energia}%`, height: '100%', background: '#f59e0b', borderRadius: 999 }} /></span><b style={{ fontSize: '0.8rem' }}>{row.energia}%</b></span>
                <span style={{ textAlign: 'center', borderRadius: 999, padding: '0.35rem 0.65rem', background: row.estado === 'Bien' ? '#ecfdf5' : '#fffbeb', color: row.estado === 'Bien' ? '#059669' : '#d97706', fontWeight: 800, fontSize: '0.75rem' }}>{row.estado}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', color: '#64748b', fontSize: '0.78rem' }}>
          <span>Ultima actualizacion: 1 jul 2026, 09:30</span>
          <span>Los datos se actualizan diariamente</span>
        </div>
      </div>
    );
    return (
      <div className="analytics-page analytics-rrhh-page" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="analytics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.35rem' }}>
          <h2 className="header-title" style={{ marginBottom: 0 }}>Analiticas RRHH</h2>
          <div className="analytics-filters" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="input-field" style={{ width: 160, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'white' }}>
              <Filter size={15} /> 
              {currentEmpresaLabel}
            </div>
            <select className="input-field" style={{ width: 150, backgroundColor: 'white' }} value={periodo} onChange={(event) => setPeriodo(event.target.value as PeriodoKey)}>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
              <option value="personalizado">Personalizado</option>
            </select>
            {periodo === 'mensual' && <select className="input-field" style={{ width: 150, backgroundColor: 'white' }} value={mesSel} onChange={(event) => setMesSel(event.target.value)}>
              {MONTH_OPTIONS_2026.map(month => <option key={month} value={month}>{month}</option>)}
            </select>}
            {periodo === 'personalizado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="date" className="input-field" value={fechaDesde} max={fechaHasta || undefined} onChange={event => setFechaDesde(event.target.value)} style={{ width: 140, backgroundColor: 'white' }} />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input type="date" className="input-field" value={fechaHasta} min={fechaDesde || undefined} onChange={event => setFechaHasta(event.target.value)} style={{ width: 140, backgroundColor: 'white' }} />
              </div>
            )}
            {periodo === 'mensual' && <label className="analytics-compare" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#334155', fontSize: '0.88rem' }}>
              <input type="checkbox" checked={comparar} onChange={(event) => setComparar(event.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
              Comparar con mes anterior
            </label>}
          </div>
        </div>

        <div className="analytics-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {kpis.map(kpi => (
            <div key={kpi.label} className="card" style={{ padding: '1.1rem 1.25rem', margin: 0 }}>
              <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>{kpi.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
                <strong style={{ color: kpi.color, fontSize: '1.8rem', lineHeight: 1 }}>{kpi.value}%</strong>
                <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.82rem' }}>{kpi.delta}</span>
              </div>
              <div style={{ height: 4, background: kpi.bg, borderRadius: 999, overflow: 'hidden', margin: '0.75rem 0' }}>
                <div style={{ width: `${kpi.value}%`, height: '100%', background: kpi.color, borderRadius: 999 }} />
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem' }}>vs. junio 2026: {kpi.previous}%</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <h3 style={{ margin: '0 0 0.75rem', color: '#0f172a', fontSize: '1rem' }}>Evolucion general</h3>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoData.evolucion} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Area type="monotone" dataKey="energiaPct" name="Energia" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
                  <Area type="monotone" dataKey="participacion" name="Participacion" stroke="var(--primary-color)" fill="#ccfbf1" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: '1rem' }}>Rendimiento por sector</h3>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {sectorRows.map(row => (
                <div key={row.sector} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr 90px', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid #eef2f7', paddingBottom: '0.65rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#0f172a', fontWeight: 700, fontSize: '0.86rem' }}><span style={{ color: row.color }}>{row.icon}</span>{row.sector}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 999 }}><span style={{ display: 'block', width: `${row.part}%`, height: '100%', background: 'var(--primary-color)', borderRadius: 999 }} /></span><b style={{ fontSize: '0.8rem' }}>{row.part}%</b></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 999 }}><span style={{ display: 'block', width: `${row.energia}%`, height: '100%', background: '#f59e0b', borderRadius: 999 }} /></span><b style={{ fontSize: '0.8rem' }}>{row.energia}%</b></span>
                  <span style={{ textAlign: 'center', borderRadius: 999, padding: '0.35rem 0.65rem', background: row.estado === 'Bien' ? '#ecfdf5' : '#fffbeb', color: row.estado === 'Bien' ? '#059669' : '#d97706', fontWeight: 800, fontSize: '0.75rem' }}>{row.estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {demoData.tension && demoData.tension.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                🕐 Momento de mayor tensión
              </h3>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={demoData.tension} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={110} />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, 'Respuestas']}
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }}
                    />
                    <Bar dataKey="valor" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {(() => {
              const top = demoData.tension && demoData.tension.length > 0 ? [...demoData.tension].sort((a, b) => b.valor - a.valor)[0] : null;
              if (!top || top.valor < 30) return <div />;
              const isEndOfDay = top.name === 'Al final de la jornada';
              const isMorning = top.name === 'A la mañana';
              const isAfternoon = top.name === 'A la tarde';
              let insight = `El ${top.valor}% de los colaboradores reportó tensión predominante "${top.name}".`;
              let recomendacion = 'Se recomienda revisar la distribución de pausas activas en ese horario.';
              if (isEndOfDay) recomendacion = 'Considerá adelantar la pausa de tarde para liberar tensión acumulada antes del cierre de jornada.';
              else if (isMorning) recomendacion = 'Una pausa de activación temprana puede ayudar a modular la tensión desde el inicio de la jornada.';
              else if (isAfternoon) recomendacion = 'La pausa de tarde está bien posicionada. Evaluá si aumentar su frecuencia en días de mayor carga.';
              return (
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                  border: '1px solid #c7d2fe',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  margin: 0
                }}>
                  <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>💡</span>
                  <div>
                    <p style={{ fontWeight: 800, color: '#3730a3', fontSize: '1rem', marginBottom: '0.4rem' }}>
                      Inteligencia: Patrón de tensión detectado
                    </p>
                    <p style={{ color: '#4338ca', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      {insight} {recomendacion}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', color: '#64748b', fontSize: '0.78rem' }}>
          <span>Ultima actualizacion: 1 jul 2026, 09:30</span>
          <span>Los datos se actualizan diariamente</span>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="analytics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Analíticas Detalladas</h2>
        
        <div className="analytics-filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Empresa */}
          <div className="analytics-control" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', width: '150px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={effectiveFiltro}
              onChange={(e) => setFiltro(e.target.value)}
              disabled={!!rrhhEmpresaKey}
            >
              <option value="all">Todas</option>
              {user?.isDemo && <option value="demo-company">Empresa Demo</option>}
              {empresas.map(emp => (
                <option key={emp.supabaseId ?? emp.id} value={emp.supabaseId ?? emp.id.toString()}>{emp.nombre}</option>
              ))}
            </select>
          </div>

          {/* Perfil laboral */}
          <div className="analytics-control analytics-work-profile" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Users size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              aria-label="Filtrar analíticas por perfil laboral"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', width: '170px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={workProfileFilter}
              disabled={compareWorkProfiles}
              onChange={(event) => setWorkProfileFilter(event.target.value as AnalyticsWorkProfileFilter)}
            >
              <option value="ALL">Todos los perfiles</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
              <option value="OPERATIVO">Operativo</option>
            </select>
          </div>

          <button
            type="button"
            className={`analytics-profile-compare-button ${compareWorkProfiles ? 'active' : ''}`}
            aria-pressed={compareWorkProfiles}
            onClick={() => {
              setCompareWorkProfiles(current => {
                if (!current) setWorkProfileFilter('ALL');
                return !current;
              });
            }}
          >
            <GitCompareArrows size={16} />
            Comparar perfiles laborales
          </button>

          {/* Período (Principal) */}
          <div className="analytics-control" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', width: '150px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value as PeriodoKey);
                setComparar(false); // Resetear comparativa al cambiar período
              }}
            >
              {(Object.keys(PERIODO_LABELS) as PeriodoKey[]).map(k => (
                <option key={k} value={k}>{PERIODO_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Selectores Secundarios */}
          {periodo === 'semanal' && (
            <div className="analytics-control analytics-control-wide" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                className="input-field"
                style={{ paddingLeft: '1rem', paddingRight: '0.75rem', width: '220px', backgroundColor: 'var(--bg-color)' }}
                value={semanaSel}
                onChange={(e) => setSemanaSel(e.target.value)}
              >
                {WEEK_OPTIONS_2026.map(week => <option key={week.label} value={week.label}>{week.label}</option>)}
              </select>
            </div>
          )}

          {periodo === 'mensual' && (
            <div className="analytics-period-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select
                className="input-field"
                style={{ paddingLeft: '1rem', paddingRight: '0.75rem', width: '150px', backgroundColor: 'var(--bg-color)' }}
                value={mesSel}
                onChange={(e) => setMesSel(e.target.value)}
              >
                {MONTH_OPTIONS_2026.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
              <label className="analytics-compare" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer' }}>
                <input type="checkbox" checked={comparar} onChange={(e) => setComparar(e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                Comparar con mes anterior
              </label>
            </div>
          )}

          {periodo === 'anual' && (
            <div className="analytics-period-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select
                className="input-field"
                style={{ paddingLeft: '1rem', paddingRight: '0.75rem', width: '100px', backgroundColor: 'var(--bg-color)' }}
                value={anioSel}
                onChange={(e) => setAnioSel(e.target.value)}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <label className="analytics-compare" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer' }}>
                <input type="checkbox" checked={comparar} onChange={(e) => setComparar(e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                Comparar con año anterior
              </label>
            </div>
          )}

          {periodo === 'personalizado' && (
            <div className="analytics-period-group analytics-custom-range" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="date" className="input-field" value={fechaDesde} max={fechaHasta || undefined} onChange={e => setFechaDesde(e.target.value)} style={{ width: '130px', padding: '0.5rem' }} />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input type="date" className="input-field" value={fechaHasta} min={fechaDesde || undefined} onChange={e => setFechaHasta(e.target.value)} style={{ width: '130px', padding: '0.5rem' }} />
            </div>
          )}

          <div className="analytics-spacer" style={{ flexGrow: 1 }} />

          {user?.role === 'admin' && (
            <ReportGenerator
              currentData={data}
              currentEmpresaLabel={currentEmpresaLabel}
              periodoLabel={reportPeriodoLabel}
              periodFrom={reportRange.from}
              periodTo={reportRange.to}
              periodReady={periodo !== 'personalizado' || (!!fechaDesde && !!fechaHasta && fechaDesde <= fechaHasta)}
              selectedWorkProfile={compareWorkProfiles ? 'COMPARISON' : workProfileFilter}
              privacyMinimum={WORK_PROFILE_PRIVACY_MIN_USERS}
              profileReportData={{
                ALL: { data: allReportData, usersCount: allStats.usuariosCount },
                ADMINISTRATIVO: { data: administrativeReportData, usersCount: administrativeStats.usuariosCount },
                OPERATIVO: { data: operativeReportData, usersCount: operativeStats.usuariosCount },
              }}
              allowIndividualReports={user.role === 'admin'}
            />
          )}
        </div>
      </div>

      {compareWorkProfiles && (
        <WorkProfileComparison
          administrativeStats={administrativeStats}
          operativeStats={operativeStats}
        />
      )}

      <div style={{ display: compareWorkProfiles ? 'none' : undefined }}>

        {/* ─── KPIs (5 mini cards) ─────────────────────────────────────────── */}
        <div className="analytics-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Participación', value: data.kpis.participacion, color: 'var(--primary-color)', bg: '#f0fdfa' },
            { label: 'Foco',          value: data.kpis.foco,          color: '#3b82f6',              bg: '#eff6ff' },
            { label: 'Impacto Pausa', value: data.kpis.impacto,       color: '#9333ea',              bg: '#faf5ff' },
            { label: 'Dolor',         value: data.kpis.dolor,         color: '#f43f5e',              bg: '#fff1f2' },
            { label: 'Energía',       value: data.kpis.energia,       color: '#f59e0b',              bg: '#fffbeb' },
          ].map(kpi => (
            <div key={kpi.label} className="card" style={{ padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: kpi.color, lineHeight: 1, marginBottom: '0.5rem' }}>{kpi.value}%</p>
              <div style={{ width: '100%', height: '4px', backgroundColor: kpi.bg, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${kpi.value}%`, height: '100%', backgroundColor: kpi.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* ─── Gráficos: 3 arriba + 2 abajo ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {/* Participación */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Participación</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Bar dataKey="participacion" name="Participación (%)" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zonas mas afectadas */}
          <PainZonesCard zonas={data.zonas} totalPersonas={painTotalPersonas} />

          {/* Foco */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Foco</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFoco" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="foco" name="Foco (%)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFoco)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {/* Impacto Pausa */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Impacto Pausa</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpacto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="impacto" name="Impacto (%)" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#colorImpacto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Energía */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Energía</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="energiaPct" name="Energía (%)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEnergia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Momento de mayor tensión */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              🕐 Momento de mayor tensión
            </h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.tension} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={110} />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'Respuestas']}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }}
                  />
                  <Bar dataKey="valor" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── Centro de Inteligencia: alerta de tensión ──────────────────────── */}
        {(() => {
          const top = data.tension && data.tension.length > 0 ? [...data.tension].sort((a, b) => b.valor - a.valor)[0] : null;
          if (!top || top.valor < 30) return null;
          const isEndOfDay = top.name === 'Al final de la jornada';
          const isMorning = top.name === 'A la mañana';
          const isAfternoon = top.name === 'A la tarde';
          let insight = `El ${top.valor}% de los colaboradores reportó tensión predominante "${top.name}".`;
          let recomendacion = 'Se recomienda revisar la distribución de pausas activas en ese horario.';
          if (isEndOfDay) recomendacion = 'Considerá adelantar la pausa de tarde para liberar tensión acumulada antes del cierre de jornada.';
          else if (isMorning) recomendacion = 'Una pausa de activación temprana puede ayudar a modular la tensión desde el inicio de la jornada.';
          else if (isAfternoon) recomendacion = 'La pausa de tarde está bien posicionada. Evaluá si aumentar su frecuencia en días de mayor carga.';
          return (
            <div style={{
              marginTop: '1rem',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
              border: '1px solid #c7d2fe',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
              <div>
                <p style={{ fontWeight: 700, color: '#3730a3', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  Inteligencia: Patrón de tensión detectado
                </p>
                <p style={{ color: '#4338ca', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {insight} {recomendacion}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

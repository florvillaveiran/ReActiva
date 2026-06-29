import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  HeartPulse,
  LineChart,
  Target,
  Users,
  UserRound,
  Zap,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Empresa, Formulario, getDB, MockDB, Progreso, Usuario } from '../mock/data';

type ReportKind = 'empresa' | 'usuario';

interface ReportPoint {
  name: string;
  participacion: number;
  foco: number;
  impacto: number;
  dolor: number;
  energiaPct: number;
}

interface ReportData {
  kpis: {
    participacion: number;
    foco: number;
    impacto: number;
    dolor: number;
    energia: number;
  };
  evolucion: ReportPoint[];
  zonas: { name: string; valor: number }[];
}

interface Props {
  currentData: ReportData;
  currentEmpresaLabel: string;
  periodoLabel: string;
  periodFrom?: string;
  periodTo?: string;
}

const COLORS = {
  navy: '#061a3d',
  muted: '#36507d',
  teal: '#11b8a3',
  blue: '#2477f2',
  purple: '#8c2ff0',
  red: '#f72f4e',
  orange: '#f28a00',
  border: '#dde6ee',
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value || 0)));
const fileSafe = (value: string) => value.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const average = (values: number[], fallback = 0) => values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : fallback;

const getTrend = (points: ReportPoint[], key: keyof ReportPoint) => {
  const first = Number(points[0]?.[key] ?? 0);
  const last = Number(points[points.length - 1]?.[key] ?? 0);
  return Math.round(last - first);
};

const buildUserData = (usuario: Usuario | undefined, fallback: ReportData): ReportData => {
  if (!usuario) return fallback;
  const baseParticipacion = clamp(usuario.participacion);
  const baseDolor = usuario.dolor ? 24 : 8;
  const focoBase = usuario.onboardingData?.trabajo === 'Disperso' ? 58 : usuario.onboardingData?.trabajo === 'Normal' ? 72 : 82;
  const energiaBase = usuario.onboardingData?.energia === 'Baja' ? 42 : usuario.onboardingData?.energia === 'Alta' ? 76 : 60;
  const evolucion = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((name, index) => ({
    name,
    participacion: clamp(baseParticipacion - 6 + index * 2),
    foco: clamp(focoBase + index * 5),
    impacto: clamp(72 + index * 6),
    dolor: clamp(baseDolor - index * 5),
    energiaPct: clamp(energiaBase),
  }));
  const last = evolucion[evolucion.length - 1];
  const zonas = usuario.dolor
    ? [{ name: 'Cervical', valor: 35 }, { name: 'Hombros', valor: 35 }, { name: 'Zona lumbar', valor: 30 }]
    : [{ name: 'Cervical', valor: 12 }, { name: 'Hombros', valor: 8 }, { name: 'Zona lumbar', valor: 5 }];

  return {
    evolucion,
    zonas,
    kpis: {
      participacion: last.participacion,
      foco: last.foco,
      impacto: last.impacto,
      dolor: last.dolor,
      energia: last.energiaPct,
    },
  };
};

const focusScore = (value?: string) => {
  if (value === 'Enfocado') return 90;
  if (value === 'Normal') return 70;
  if (value === 'Disperso') return 45;
  return 0;
};

const energyScore = (value?: string) => {
  if (value === 'Alta') return 85;
  if (value === 'Media') return 60;
  if (value === 'Baja') return 35;
  return 0;
};

const toDate = (value?: string) => {
  const date = value ? new Date(value) : new Date(Number.NaN);
  return Number.isNaN(date.getTime()) ? null : date;
};

const inBucket = (value: string | undefined, start: Date, end: Date) => {
  const date = toDate(value);
  return !!date && date >= start && date < end;
};

const getPeriodBuckets = (
  forms: Formulario[],
  progress: Progreso[],
  labels: string[],
  periodFrom?: string,
  periodTo?: string,
) => {
  const dates = [...forms.map(item => toDate(item.fecha)), ...progress.map(item => toDate(item.fecha))]
    .filter((date): date is Date => !!date);
  const selectedStart = toDate(periodFrom);
  const selectedEnd = toDate(periodTo);
  const end = selectedEnd
    ? new Date(selectedEnd.getTime() + 24 * 60 * 60 * 1000)
    : dates.length
    ? new Date(Math.max(...dates.map(date => date.getTime())) + 24 * 60 * 60 * 1000)
    : new Date();
  const start = selectedStart ?? new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000);
  const count = Math.max(2, labels.length || 4);
  const duration = Math.max(1, end.getTime() - start.getTime());
  return Array.from({ length: count }, (_, index) => {
    const bucketStart = new Date(start.getTime() + (duration * index) / count);
    const bucketEnd = new Date(start.getTime() + (duration * (index + 1)) / count);
    return { name: labels[index] ?? `Periodo ${index + 1}`, start: bucketStart, end: bucketEnd };
  });
};

const buildCompanyData = (
  empresa: Empresa | undefined,
  fallback: ReportData,
  db: MockDB,
  periodFrom?: string,
  periodTo?: string,
): ReportData => {
  if (!empresa) return fallback;

  const employeeIds = new Set(empresa.empleados);
  const users = db.usuarios.filter(user => user.empresa_id === empresa.id || employeeIds.has(user.id));
  const userIds = new Set(users.map(user => user.id));
  const selectedStart = toDate(periodFrom);
  const selectedEnd = toDate(periodTo);
  const isInSelectedPeriod = (dateValue: string) => {
    const date = toDate(dateValue);
    if (!date) return false;
    if (selectedStart && date < selectedStart) return false;
    if (selectedEnd) {
      const inclusiveEnd = new Date(selectedEnd.getTime() + 24 * 60 * 60 * 1000);
      if (date >= inclusiveEnd) return false;
    }
    return true;
  };
  const forms = db.formularios.filter(form => userIds.has(form.usuario_id) && isInSelectedPeriod(form.fecha));
  const progress = db.progresos.filter(item => userIds.has(item.usuario_id) && isInSelectedPeriod(item.fecha));
  const buckets = getPeriodBuckets(forms, progress, fallback.evolucion.map(point => point.name), periodFrom, periodTo);

  const profileParticipation = average(users.map(user => user.participacion));
  const profileFocus = average(users.map(user => focusScore(user.onboardingData?.trabajo)).filter(Boolean));
  const profileEnergy = average(users.map(user => energyScore(user.onboardingData?.energia)).filter(Boolean));
  const profilePain = users.length ? (users.filter(user => user.dolor).length / users.length) * 100 : 0;

  const evolucion = buckets.map((bucket, index) => {
    const weeklyForms = forms.filter(form => inBucket(form.fecha, bucket.start, bucket.end));
    const weeklyProgress = progress.filter(item => inBucket(item.fecha, bucket.start, bucket.end));
    const completedPauses = weeklyProgress.reduce(
      (sum, item) => sum + Number(item.manana) + Number(item.tarde),
      0,
    );
    const expectedPauses = Math.max(1, users.length * 6);
    const participation = weeklyProgress.length
      ? (completedPauses / expectedPauses) * 100
      : users.length ? profileParticipation : fallback.evolucion[index]?.participacion || 0;
    const energy = weeklyForms.length
      ? average(weeklyForms.map(form => form.energia)) * 20
      : profileEnergy || fallback.evolucion[index]?.energiaPct || 0;
    const pain = weeklyForms.length
      ? (weeklyForms.filter(form => form.dolor).length / weeklyForms.length) * 100
      : users.length ? profilePain : fallback.evolucion[index]?.dolor || 0;
    const focus = profileFocus || fallback.evolucion[index]?.foco || 0;
    const impact = clamp((focus + energy) / 2) || fallback.evolucion[index]?.impacto || 0;

    return {
      name: bucket.name,
      participacion: clamp(participation),
      foco: clamp(focus),
      impacto: clamp(impact),
      dolor: clamp(pain),
      energiaPct: clamp(energy),
    };
  });

  const painCounts = new Map<string, number>();
  forms.filter(form => form.dolor && form.zona).forEach(form => {
    const zone = form.zona!.trim();
    painCounts.set(zone, (painCounts.get(zone) ?? 0) + 1);
  });
  users.forEach(user => {
    const zones = user.onboardingData?.dolores;
    if (Array.isArray(zones)) zones.filter((zone: string) => zone !== 'No tengo dolores').forEach((zone: string) => {
      painCounts.set(zone, (painCounts.get(zone) ?? 0) + 1);
    });
  });
  const totalPainMentions = Math.max(1, [...painCounts.values()].reduce((sum, value) => sum + value, 0));
  const zonas = [...painCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, valor: clamp((count / totalPainMentions) * 100) }));

  const last = evolucion[evolucion.length - 1];
  return {
    evolucion,
    zonas,
    kpis: {
      participacion: clamp(average(evolucion.map(point => point.participacion), last.participacion)),
      foco: clamp(average(evolucion.map(point => point.foco), last.foco)),
      impacto: clamp(average(evolucion.map(point => point.impacto), last.impacto)),
      dolor: last.dolor,
      energia: clamp(average(evolucion.map(point => point.energiaPct), last.energiaPct)),
    },
  };
};

const percentSeries = (points: ReportPoint[], key: keyof ReportPoint) => points.map(point => clamp(Number(point[key] ?? 0)));

const Brand: React.FC = () => (
  <div className="rg-brand" aria-label="ReActiva">
    <img src="/logo-reactiva-report.png" alt="ReActiva" />
  </div>
);

const Decorative: React.FC = () => (
  <div className="rg-decor" aria-hidden="true">
    <div className="rg-dots" />
    <div className="rg-ring" />
    <div className="rg-dot" />
  </div>
);

const Page: React.FC<{ page: string; eyebrow?: string; className?: string; children: React.ReactNode }> = ({ page, eyebrow, className = '', children }) => (
  <section className={`reactiva-report-page ${className}`.trim()}>
    <Decorative />
    <header className="rg-header">
      <Brand />
      {eyebrow && <span>{eyebrow}</span>}
    </header>
    <main>{children}</main>
    <footer className="rg-footer"><span>{page}</span></footer>
  </section>
);

const KpiCard: React.FC<{ label: string; value: number; color: string; icon?: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="rg-kpi">
    {icon && <div className="rg-icon" style={{ color, backgroundColor: `${color}16` }}>{icon}</div>}
    <p>{label}</p>
    <strong style={{ color }}>{clamp(value)}%</strong>
    <div className="rg-progress"><span style={{ width: `${clamp(value)}%`, backgroundColor: color }} /></div>
  </div>
);

const KpiGrid: React.FC<{ data: ReportData; personal?: boolean }> = ({ data, personal = false }) => (
  <div className="rg-kpi-grid">
    <KpiCard label="Participacion" value={data.kpis.participacion} color={COLORS.teal} icon={personal ? <Users size={22} /> : undefined} />
    <KpiCard label="Foco" value={data.kpis.foco} color={COLORS.blue} icon={personal ? <Target size={22} /> : undefined} />
    <KpiCard label="Impacto pausa" value={data.kpis.impacto} color={COLORS.purple} icon={personal ? <HeartPulse size={22} /> : undefined} />
    <KpiCard label="Dolor" value={data.kpis.dolor} color={COLORS.red} icon={personal ? <HeartPulse size={22} /> : undefined} />
    <KpiCard label="Energia" value={data.kpis.energia} color={COLORS.orange} icon={personal ? <Zap size={22} /> : undefined} />
  </div>
);

const MiniBar: React.FC<{ title: string; values: number[]; color: string; names?: string[] }> = ({ title, values, color, names }) => (
  <div className="rg-chart-card">
    <h3>{title}</h3>
    <div className="rg-bar-chart">
      {[100, 75, 50, 25, 0].map(tick => <span key={tick}>{tick}</span>)}
      <div className="rg-bars">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="rg-bar-col">
            <div className="rg-bar" style={{ height: `${clamp(value)}%`, backgroundColor: color }} />
            <small>{names?.[index] ?? `Sem ${index + 1}`}</small>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MiniLine: React.FC<{ title: string; points: number[]; color: string; fill?: string; labels?: boolean; names?: string[] }> = ({ title, points, color, fill, labels, names }) => {
  const width = 470;
  const height = 210;
  const step = width / Math.max(1, points.length - 1);
  const coords = points.map((value, index) => ({
    x: index * step,
    y: height - (clamp(value) / 100) * height,
    value: clamp(value),
  }));
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="rg-chart-card">
      <h3>{title}</h3>
      <svg className="rg-line-chart" viewBox={`0 0 ${width} ${height + 38}`} role="img">
        {[0, 0.25, 0.5, 0.75, 1].map(tick => <line key={tick} x1="0" x2={width} y1={tick * height} y2={tick * height} stroke="#dce5ef" strokeDasharray="5 5" />)}
        {fill && <path d={fillPath} fill={fill} opacity="0.42" />}
        <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="7" fill="#fff" stroke={color} strokeWidth="4" />
            {labels && <text x={point.x} y={point.y - 16} textAnchor="middle" fill={color} fontSize="20" fontWeight="800">{point.value}%</text>}
            <text x={point.x} y={height + 30} textAnchor="middle" fill="#283b61" fontSize="17">{names?.[index] ?? `Sem ${index + 1}`}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const DualLine: React.FC<{ data: ReportData }> = ({ data }) => {
  const width = 650;
  const height = 270;
  const step = width / Math.max(1, data.evolucion.length - 1);
  const series = [
    { key: 'foco' as const, label: 'Foco', color: COLORS.blue },
    { key: 'energiaPct' as const, label: 'Energia', color: COLORS.orange },
  ];
  return (
    <div className="rg-chart-card rg-dual-chart">
      <div className="rg-chart-heading">
        <h3>Evolucion semanal</h3>
        <div className="rg-chart-legend">
          {series.map(item => <span key={item.key}><i style={{ backgroundColor: item.color }} />{item.label}</span>)}
        </div>
      </div>
      <svg className="rg-line-chart" viewBox={`-8 -12 ${width + 16} ${height + 52}`} role="img">
        {[0, 0.25, 0.5, 0.75, 1].map(tick => <line key={tick} x1="0" x2={width} y1={tick * height} y2={tick * height} stroke="#dce5ef" strokeDasharray="5 5" />)}
        {series.map(item => {
          const coords = data.evolucion.map((point, index) => ({
            x: index * step,
            y: height - (clamp(point[item.key]) / 100) * height,
            value: clamp(point[item.key]),
          }));
          const path = coords.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
          return (
            <g key={item.key}>
              <path d={path} fill="none" stroke={item.color} strokeWidth="4" strokeLinecap="round" />
              {coords.map((point, index) => (
                <g key={index}>
                  <circle cx={point.x} cy={point.y} r="6" fill="#fff" stroke={item.color} strokeWidth="4" />
                  <text x={point.x} y={point.y - 13} textAnchor="middle" fill={item.color} fontSize="16" fontWeight="800">{point.value}</text>
                </g>
              ))}
            </g>
          );
        })}
        {data.evolucion.map((point, index) => (
          <text key={point.name} x={index * step} y={height + 34} textAnchor="middle" fill="#283b61" fontSize="16">{point.name}</text>
        ))}
      </svg>
    </div>
  );
};

const InsightList: React.FC<{ title: string; items: string[]; icon?: React.ReactNode }> = ({ title, items, icon }) => (
  <div className="rg-panel">
    <div className="rg-panel-head">
      <div className="rg-icon">{icon ?? <Check size={34} />}</div>
      <h3>{title}</h3>
    </div>
    <ul className="rg-list">
      {items.map(item => (
        <li key={item}><span><Check size={24} /></span>{item}</li>
      ))}
    </ul>
  </div>
);

const Highlight: React.FC<{ title: string; label: string; value: string; color?: string; icon?: React.ReactNode }> = ({ title, label, value, color = COLORS.teal, icon }) => (
  <div className="rg-highlight">
    <div className="rg-icon" style={{ color, backgroundColor: `${color}16` }}>{icon ?? <Target size={46} />}</div>
    <h3>{title}</h3>
    <i style={{ backgroundColor: color }} />
    <strong style={{ color }}>{label}</strong>
    <p>{value}</p>
  </div>
);

const BodyMap: React.FC<{ zonas: { name: string; valor: number }[] }> = ({ zonas }) => (
  <div className="rg-body-map">
    <div className="rg-person">
      <span className="head" /><span className="body" /><span className="arm left" /><span className="arm right" /><span className="leg left" /><span className="leg right" />
      <b className="pain shoulder-left" /><b className="pain shoulder-right" />
    </div>
    <div className="rg-person back">
      <span className="head" /><span className="body" /><span className="arm left" /><span className="arm right" /><span className="leg left" /><span className="leg right" />
      <b className="pain neck" /><b className="pain lumbar" />
    </div>
    <ul>
      {zonas.slice(0, 3).map(zona => <li key={zona.name}><span />{zona.name}</li>)}
    </ul>
  </div>
);

const metricLabel: Record<keyof ReportData['kpis'], string> = {
  participacion: 'Participacion',
  foco: 'Foco',
  impacto: 'Impacto de la pausa',
  dolor: 'Dolor',
  energia: 'Energia',
};

const getMetricRanking = (data: ReportData) => {
  const scores = (Object.keys(data.kpis) as (keyof ReportData['kpis'])[]).map(key => ({
    key,
    label: metricLabel[key],
    value: data.kpis[key],
    score: key === 'dolor' ? 100 - data.kpis[key] : data.kpis[key],
  }));
  return {
    best: [...scores].sort((a, b) => b.score - a.score)[0],
    opportunity: [...scores].sort((a, b) => a.score - b.score)[0],
  };
};

const trendText = (trend: number, positiveUp = true) => {
  const improved = positiveUp ? trend > 2 : trend < -2;
  const worsened = positiveUp ? trend < -2 : trend > 2;
  if (improved) return `mejoro ${Math.abs(trend)} puntos`;
  if (worsened) return `retrocedio ${Math.abs(trend)} puntos`;
  return 'se mantuvo estable';
};

const buildCompanyNarrative = (data: ReportData) => {
  const participationTrend = getTrend(data.evolucion, 'participacion');
  const focusTrend = getTrend(data.evolucion, 'foco');
  const impactTrend = getTrend(data.evolucion, 'impacto');
  const painTrend = getTrend(data.evolucion, 'dolor');
  const energyTrend = getTrend(data.evolucion, 'energiaPct');
  const { best, opportunity } = getMetricRanking(data);
  const intro = `Durante el periodo, la participacion promedio fue de ${data.kpis.participacion}%. ${metricLabel[best.key]} fue el indicador mas favorable y ${metricLabel[opportunity.key].toLowerCase()} concentra el principal margen de mejora.`;
  const findings = [
    `La participacion ${trendText(participationTrend)} y cerro con ${data.evolucion.at(-1)?.participacion ?? data.kpis.participacion}%.`,
    `El foco ${trendText(focusTrend)} durante el periodo.`,
    `El impacto de las pausas ${trendText(impactTrend)} y promedio ${data.kpis.impacto}%.`,
    `El dolor ${trendText(painTrend, false)}, con un nivel actual de ${data.kpis.dolor}%.`,
  ];
  const participationSummary = [
    `La participacion promedio fue de ${data.kpis.participacion}% y ${trendText(participationTrend)}.`,
    `El impacto de la pausa alcanzo ${data.kpis.impacto}% y ${trendText(impactTrend)}.`,
  ];
  const focusInterpretation = [
    `El foco ${trendText(focusTrend)} y promedio ${data.kpis.foco}%.`,
    `La energia ${trendText(energyTrend)} y se ubico en ${data.kpis.energia}%.`,
  ];
  const painFindings = data.zonas.length
    ? [
        `La zona con mas reportes fue ${data.zonas[0].name}.`,
        `El dolor ${trendText(painTrend, false)} entre el inicio y el cierre del periodo.`,
      ]
    : [
        'No se registraron zonas de dolor recurrentes en el periodo.',
        `El nivel de dolor actual es ${data.kpis.dolor}%.`,
      ];
  const conclusions = [
    `Participacion promedio de ${data.kpis.participacion}%, que ${trendText(participationTrend)}.`,
    `Foco en ${data.kpis.foco}% e impacto de pausa en ${data.kpis.impacto}%.`,
    `Dolor actual de ${data.kpis.dolor}%, que ${trendText(painTrend, false)}.`,
    `Energia en ${data.kpis.energia}%, que ${trendText(energyTrend)}.`,
  ];
  const recommendations: string[] = [];
  if (data.kpis.participacion < 75) recommendations.push('Ajustar horarios y recordatorios para recuperar participacion.');
  if (data.kpis.energia < 70) recommendations.push('Incorporar pausas breves en los momentos de mayor fatiga.');
  if (data.kpis.foco < 70) recommendations.push('Priorizar pausas de respiracion y recuperacion atencional.');
  if (data.kpis.dolor > 20) recommendations.push(`Reforzar movilidad de ${data.zonas[0]?.name ?? 'las zonas con molestias'}.`);
  if (data.kpis.impacto < 70) recommendations.push('Revisar duracion y tipo de pausas para elevar su impacto percibido.');
  if (recommendations.length < 3) recommendations.push('Sostener el seguimiento semanal de los indicadores.');
  if (recommendations.length < 4) recommendations.push('Mantener la frecuencia de pausas que mejor resultado produjo.');

  return {
    best,
    opportunity,
    intro,
    findings,
    participationSummary,
    focusInterpretation,
    painFindings,
    conclusions,
    recommendations: recommendations.slice(0, 4),
  };
};

const CompanyReport: React.FC<{ empresaName: string; periodo: string; data: ReportData }> = ({ empresaName, periodo, data }) => {
  const narrative = buildCompanyNarrative(data);
  const names = data.evolucion.map(point => point.name);
  return (
    <>
      <Page page="Pag. 1" className="rg-company-page rg-company-page-1">
        <div className="rg-cover">
          <h1>Informe de<br />Bienestar Corporativo</h1>
          <div className="rg-meta"><Building2 size={30} /> <strong>{empresaName}</strong></div>
          <div className="rg-meta"><Calendar size={30} /> <span>Periodo: <strong>{periodo}</strong></span></div>
          <blockquote>Cuando las personas se sienten mejor,<br />trabajan mejor.</blockquote>
        </div>
        <KpiGrid data={data} />
        <div className="rg-mini-charts">
          <MiniBar title="Participacion" values={percentSeries(data.evolucion, 'participacion')} color={COLORS.teal} names={names} />
          <MiniLine title="Dolor" points={percentSeries(data.evolucion, 'dolor')} color={COLORS.red} fill="#ffd4dc" names={names} />
          <MiniLine title="Foco" points={percentSeries(data.evolucion, 'foco')} color={COLORS.blue} fill="#cfe0ff" names={names} />
          <MiniLine title="Impacto pausa" points={percentSeries(data.evolucion, 'impacto')} color={COLORS.purple} fill="#e7d4ff" names={names} />
          <MiniLine title="Energia" points={percentSeries(data.evolucion, 'energiaPct')} color={COLORS.orange} fill="#ffe4bd" names={names} />
        </div>
      </Page>
      <Page page="Pag. 2" eyebrow={`Informe Ejecutivo - ${periodo}`} className="rg-company-page rg-company-page-2">
        <h1>Resumen Ejecutivo</h1>
        <p className="rg-lead">{narrative.intro}</p>
        <KpiGrid data={data} />
        <div className="rg-grid two">
          <InsightList title="Hallazgos principales" items={narrative.findings} />
          <div className="rg-stack">
            <Highlight title="Mejor indicador" label={narrative.best.label} value={`${narrative.best.value}% en el periodo`} icon={<Target size={44} />} />
            <Highlight title="Oportunidad" label={narrative.opportunity.label} value={`${narrative.opportunity.value}% en el periodo`} color={COLORS.orange} icon={<BarChart3 size={44} />} />
          </div>
        </div>
      </Page>
      <Page page="Pag. 3" eyebrow={`Informe Ejecutivo - ${periodo}`} className="rg-company-page rg-company-page-3">
        <h1>Participacion y uso</h1>
        <p className="rg-lead">Evolucion de la participacion y del impacto de las pausas durante las ultimas 4 semanas.</p>
        <div className="rg-grid side">
          <div>
            <MiniBar title="Participacion" values={percentSeries(data.evolucion, 'participacion')} color={COLORS.teal} names={names} />
            <MiniLine title="Impacto pausa" points={percentSeries(data.evolucion, 'impacto')} color={COLORS.purple} fill="#e7d4ff" labels names={names} />
          </div>
          <div className="rg-stack">
            <Highlight title="Participacion promedio" label={`${data.kpis.participacion}%`} value="Participacion del periodo" icon={<Users size={44} />} />
            <Highlight title="Impacto de la pausa" label={`${data.kpis.impacto}%`} value="Nivel alcanzado en Sem 4" color={COLORS.purple} icon={<HeartPulse size={44} />} />
          </div>
        </div>
        <InsightList title="En sintesis" items={narrative.participationSummary} />
      </Page>
      <Page page="Pag. 4" eyebrow={`Informe Ejecutivo - ${periodo}`} className="rg-company-page rg-company-page-4">
        <h1>Foco y energia</h1>
        <p className="rg-lead">Evolucion del foco y la energia durante las ultimas 4 semanas.</p>
        <div className="rg-grid two compact"><KpiCard label="Foco" value={data.kpis.foco} color={COLORS.blue} /><KpiCard label="Energia" value={data.kpis.energia} color={COLORS.orange} /></div>
        <DualLine data={data} />
        <InsightList title="Interpretacion" items={narrative.focusInterpretation} icon={<LineChart size={34} />} />
      </Page>
      <Page page="Pag. 5" eyebrow={`Informe Ejecutivo - ${periodo}`} className="rg-company-page rg-company-page-5">
        <h1>Dolor musculoesqueletico</h1>
        <p className="rg-lead">Este indicador muestra la evolucion del dolor musculoesqueletico percibido durante las ultimas 4 semanas.</p>
        <div className="rg-grid side">
          <div>
            <MiniLine title="Evolucion del dolor (%)" points={percentSeries(data.evolucion, 'dolor')} color={COLORS.red} fill="#ffd4dc" labels names={names} />
            <div className="rg-chart-card"><h3>Zonas mas afectadas</h3><BodyMap zonas={data.zonas} /></div>
          </div>
          <div className="rg-stack">
            <Highlight title="Dolor actual" label={`${data.kpis.dolor}%`} value="Nivel de dolor actual" color={COLORS.red} icon={<HeartPulse size={44} />} />
            <Highlight title="Tendencia" label={`${getTrend(data.evolucion, 'dolor')} pts`} value="Cambio de Sem 1 a Sem 4" color={COLORS.red} icon={<LineChart size={44} />} />
            <InsightList title="Hallazgos clave" items={narrative.painFindings} />
          </div>
        </div>
      </Page>
      <Page page="Pag. 6" eyebrow={`Informe Ejecutivo - ${periodo}`} className="rg-company-page rg-company-page-6">
        <h1>Conclusiones y<br />recomendaciones</h1>
        <p className="rg-lead">Con base en los indicadores del periodo, presentamos las principales conclusiones y recomendaciones para seguir fortaleciendo el bienestar corporativo.</p>
        <div className="rg-grid two">
          <InsightList title="Conclusiones" items={narrative.conclusions} />
          <InsightList title="Recomendaciones" items={narrative.recommendations} icon={<Target size={34} />} />
        </div>
        <KpiGrid data={data} />
      </Page>
    </>
  );
};

const UserReport: React.FC<{ userName: string; periodo: string; data: ReportData }> = ({ userName, periodo, data }) => (
  <>
    <Page page="Pag. 1 de 4" eyebrow={`Informe Individual - ${periodo}`}>
      <h1>Asi estuvo tu mes</h1>
      <div className="rg-meta user"><UserRound size={30} /><strong>{userName}</strong></div>
      <p className="rg-lead">Un resumen simple de tu evolucion, tus pausas y como te sentiste durante el periodo.</p>
      <KpiGrid data={data} personal />
      <div className="rg-grid two">
        <InsightList title="Lo mas importante" items={[
          'Participaste en tus pausas durante las ultimas 4 semanas.',
          'Tu foco mostro una mejora sostenida.',
          'El impacto de las pausas fue alto al cierre del periodo.',
          data.kpis.dolor < 15 ? 'El dolor bajo a un nivel minimo.' : 'Tus molestias quedaron identificadas para seguir trabajando.',
        ]} icon={<Target size={34} />} />
        <Highlight title="Tu punto fuerte" label="Participacion" value={`${data.kpis.participacion}% sostenido`} icon={<Target size={46} />} />
      </div>
    </Page>
    <Page page="Pag. 2" eyebrow={`Informe Individual - ${periodo}`}>
      <h1>Tu participacion y constancia</h1>
      <p className="rg-lead">Evolucion de tu participacion y del impacto de las pausas durante las ultimas 4 semanas.</p>
      <div className="rg-grid side">
        <div>
          <MiniBar title="Participacion" values={percentSeries(data.evolucion, 'participacion')} color={COLORS.teal} />
          <MiniLine title="Impacto pausa" points={percentSeries(data.evolucion, 'impacto')} color={COLORS.purple} fill="#e7d4ff" labels />
        </div>
        <div className="rg-stack">
          <Highlight title="Participacion promedio" label={`${data.kpis.participacion}%`} value="Participacion completa" icon={<Users size={44} />} />
          <Highlight title="Impacto de la pausa" label={`${data.kpis.impacto}%`} value="Nivel alcanzado en Sem 4" color={COLORS.purple} icon={<HeartPulse size={44} />} />
        </div>
      </div>
      <InsightList title="En sintesis" items={['Participacion completa durante todo el periodo.', 'El impacto de las pausas mostro una mejora sostenida.']} />
    </Page>
    <Page page="Pag. 3" eyebrow={`Informe Individual - ${periodo}`}>
      <h1>Tu foco y energia</h1>
      <p className="rg-lead">Evolucion del foco y la energia durante las ultimas 4 semanas.</p>
      <div className="rg-grid two compact"><KpiCard label="Foco" value={data.kpis.foco} color={COLORS.blue} /><KpiCard label="Energia" value={data.kpis.energia} color={COLORS.orange} /></div>
      <MiniLine title="Evolucion semanal" points={percentSeries(data.evolucion, 'foco')} color={COLORS.blue} fill="#cfe0ff" labels />
      <InsightList title="Interpretacion" items={['Tu foco mostro una mejora progresiva durante el periodo.', 'La energia se mantuvo estable, con oportunidad para potenciarla.']} icon={<LineChart size={34} />} />
    </Page>
    <Page page="Pag. 4" eyebrow={`Informe Individual - ${periodo}`}>
      <h1>Tu dolor y<br />proximos pasos</h1>
      <p className="rg-lead">Este indicador muestra la evolucion de tus molestias corporales y algunas recomendaciones para seguir mejorando.</p>
      <div className="rg-grid side">
        <div>
          <MiniLine title="Evolucion del dolor (%)" points={percentSeries(data.evolucion, 'dolor')} color={COLORS.red} fill="#ffd4dc" labels />
          <div className="rg-chart-card"><h3>Zonas mas afectadas</h3><BodyMap zonas={data.zonas} /></div>
        </div>
        <div className="rg-stack">
          <Highlight title="Dolor actual" label={`${data.kpis.dolor}%`} value="Nivel de dolor actual" color={COLORS.red} icon={<HeartPulse size={44} />} />
          <Highlight title="Tendencia" label={`${getTrend(data.evolucion, 'dolor')} pts`} value="Cambio de Sem 1 a Sem 4" color={COLORS.red} icon={<LineChart size={44} />} />
          <InsightList title="Sugerencias para seguir mejorando" items={['Mantener la frecuencia de pausas activas.', 'Reforzar movilidad cervical y lumbar.', 'Realizar pausas en momentos de mayor cansancio.', 'Sostener el seguimiento semanal.']} />
        </div>
      </div>
    </Page>
  </>
);

export const ReportGenerator: React.FC<Props> = ({ currentData, currentEmpresaLabel, periodoLabel, periodFrom, periodTo }) => {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ReportKind>('empresa');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresaId, setEmpresaId] = useState('current');
  const [usuarioId, setUsuarioId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [database, setDatabase] = useState<MockDB | null>(null);
  const pagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const db = getDB();
    setDatabase(db);
    setEmpresas(db.empresas);
    setUsuarios(db.usuarios);
    setUsuarioId(db.usuarios[0]?.id.toString() ?? '');
    const currentCompany = db.empresas.find(empresa => empresa.nombre === currentEmpresaLabel);
    if (currentCompany) setEmpresaId(currentCompany.id.toString());
  }, [currentEmpresaLabel]);

  const selectedEmpresa = empresas.find(empresa => empresa.id.toString() === empresaId);
  const selectedUsuario = usuarios.find(usuario => usuario.id.toString() === usuarioId);

  const reportData = useMemo(() => (
    kind === 'empresa'
      ? buildCompanyData(selectedEmpresa, currentData, database ?? getDB(), periodFrom, periodTo)
      : buildUserData(selectedUsuario, currentData)
  ), [currentData, database, kind, periodFrom, periodTo, selectedEmpresa, selectedUsuario]);

  const reportName = kind === 'empresa'
    ? selectedEmpresa?.nombre ?? currentEmpresaLabel
    : selectedUsuario?.nombre ?? 'Usuario ejemplo';

  const openPreview = () => {
    setOpen(false);
    setActivePage(0);
    setPreviewOpen(true);
  };

  const downloadPdf = async () => {
    if (!pagesRef.current) return;
    setGenerating(true);
    setCapturing(true);
    await new Promise(resolve => window.setTimeout(resolve, 120));

    try {
      const pages = [...pagesRef.current.querySelectorAll('.reactiva-report-page')] as HTMLElement[];
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let index = 0; index < pages.length; index += 1) {
        const canvas = await html2canvas(pages[index], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        if (index > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Informe_Reactiva_${kind}_${fileSafe(reportName)}_${fileSafe(periodoLabel)}.pdf`);
    } catch (error) {
      console.error('Error al generar informe:', error);
    } finally {
      setCapturing(false);
      setGenerating(false);
    }
  };

  const pageCount = kind === 'empresa' ? 6 : 4;

  return (
    <>
      <button
        className="btn-primary"
        onClick={() => setOpen(true)}
        disabled={generating}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', padding: '0.45rem 0.85rem', fontSize: '0.85rem', minHeight: 'auto', borderRadius: '8px' }}
      >
        <Download size={15} />
        {generating ? 'Generando...' : 'Generar informe'}
      </button>

      {open && (
        <div className="rg-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="rg-modal" onClick={event => event.stopPropagation()}>
            <div className="rg-modal-head">
              <div className="rg-icon"><Download size={28} /></div>
              <div>
                <h2>Generar informe</h2>
                <p>Selecciona si queres crear un informe para una empresa o para un usuario especifico.</p>
              </div>
            </div>

            <div className="rg-kind-grid">
              <button type="button" className={kind === 'empresa' ? 'active' : ''} onClick={() => setKind('empresa')}>
                <Building2 size={24} />
                <strong>Empresa</strong>
                <span>Informe corporativo de 6 paginas.</span>
              </button>
              <button type="button" className={kind === 'usuario' ? 'active' : ''} onClick={() => setKind('usuario')}>
                <UserRound size={24} />
                <strong>Usuario</strong>
                <span>Informe individual de 4 paginas.</span>
              </button>
            </div>

            {kind === 'empresa' ? (
              <label className="rg-field">
                Empresa
                <select className="input-field" value={empresaId} onChange={event => setEmpresaId(event.target.value)}>
                  <option value="current">{currentEmpresaLabel}</option>
                  {empresas.map(empresa => <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>)}
                </select>
              </label>
            ) : (
              <label className="rg-field">
                Usuario
                <select className="input-field" value={usuarioId} onChange={event => setUsuarioId(event.target.value)}>
                  {usuarios.map(usuario => <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>)}
                  {usuarios.length === 0 && <option value="">Usuario ejemplo</option>}
                </select>
              </label>
            )}

            <div className="rg-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={openPreview}>Crear informe</button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div className="rg-preview-backdrop">
          <div className="rg-preview">
            <div className="rg-preview-toolbar">
              <div>
                <h2>{kind === 'empresa' ? 'Informe corporativo' : 'Informe individual'}</h2>
                <p>{reportName} | {periodoLabel}</p>
              </div>
              <div className="rg-page-nav" aria-label="Navegacion del informe">
                <button type="button" onClick={() => setActivePage(page => Math.max(0, page - 1))} disabled={activePage === 0 || generating} title="Pagina anterior">
                  <ChevronLeft size={18} />
                </button>
                <strong>Pagina {activePage + 1} de {pageCount}</strong>
                <button type="button" onClick={() => setActivePage(page => Math.min(pageCount - 1, page + 1))} disabled={activePage === pageCount - 1 || generating} title="Pagina siguiente">
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="rg-preview-actions">
                <button type="button" className="btn-secondary" onClick={() => setPreviewOpen(false)}>Cerrar</button>
                <button type="button" className="btn-primary" onClick={downloadPdf} disabled={generating}>
                  <Download size={16} />
                  {generating ? 'Preparando PDF...' : 'Descargar PDF'}
                </button>
              </div>
            </div>
            <div className="rg-preview-scroll">
              <div className={`rg-preview-pages${capturing ? ' is-capturing' : ''}`} data-page={activePage} ref={pagesRef}>
                {kind === 'empresa'
                  ? <CompanyReport empresaName={reportName} periodo={periodoLabel} data={reportData} />
                  : <UserReport userName={reportName} periodo={periodoLabel} data={reportData} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

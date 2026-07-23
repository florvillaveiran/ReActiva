import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { Award, CheckCircle2, ChevronDown, Clock3, Download, FileText, Flame, Search, Sparkles, Users } from 'lucide-react';
import { useEmpresas } from '../context/EmpresasContext';
import { useReactivaScoreSummary } from '../hooks/useReactivaScoreSummary';
import type { DashboardPeriod } from '../lib/dashboardPeriods';
import type { ReactivaTeamScore } from '../lib/reactivaScore';

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currentWeekStart = () => {
  const date = new Date();
  const weekday = date.getDay();
  date.setDate(date.getDate() - (weekday === 0 ? 6 : weekday - 1));
  return dateKey(date);
};

export const periodScoreForUser = (user: ReactivaTeamScore, period: DashboardPeriod) => {
  if (period === 'mensual') {
    return { score: user.score, maximum: user.maximum, percent: user.percent, eligible: user.eligible };
  }
  const week = user.weeks.find(item => item.week_start === currentWeekStart());
  const score = week?.score ?? 0;
  const maximum = week?.maximum ?? 0;
  const percent = maximum > 0 ? Math.min(100, (score * 100) / maximum) : 0;
  return { score, maximum, percent, eligible: maximum > 0 && percent >= user.threshold_percent };
};

export const averageScoreForPeriod = (users: ReactivaTeamScore[], period: DashboardPeriod) => {
  const values = users.map(user => periodScoreForUser(user, period)).filter(item => item.maximum > 0);
  return values.length ? values.reduce((total, item) => total + item.percent, 0) / values.length : 0;
};

type TeamScoreVisualState = 'empty' | 'progress' | 'eligible' | 'near' | 'complete';

const teamScoreVisual = (
  periodScore: ReturnType<typeof periodScoreForUser>,
  streak: number,
): { state: TeamScoreVisualState; label: string; detail: string; icon: React.ReactNode } => {
  if (periodScore.maximum <= 0) {
    return { state: 'empty', label: 'Sin actividad', detail: 'Período no iniciado', icon: <Clock3 size={15} /> };
  }

  const remaining = Math.max(0, periodScore.maximum - periodScore.score);
  if (periodScore.percent >= 100 || remaining === 0) {
    return {
      state: 'complete',
      label: 'Racha completa',
      detail: streak > 0 ? `${streak} ${streak === 1 ? 'semana' : 'semanas'}` : 'Período completo',
      icon: <Sparkles size={15} />,
    };
  }

  if (periodScore.percent >= 90 || remaining <= 1) {
    return {
      state: 'near',
      label: 'A un paso',
      detail: `Falta ${remaining} ${remaining === 1 ? 'punto' : 'puntos'}`,
      icon: <Flame size={15} />,
    };
  }

  if (periodScore.eligible) {
    return { state: 'eligible', label: 'Objetivo alcanzado', detail: 'Puede seguir sumando', icon: <CheckCircle2 size={15} /> };
  }

  return { state: 'progress', label: 'En progreso', detail: '', icon: <Clock3 size={15} /> };
};

const csvValue = (value: unknown) => {
  const raw = String(value ?? '');
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
};

const reportPeriodLabel = (period: DashboardPeriod) => {
  const today = new Date();
  const from = new Date(today);
  if (period === 'semanal') {
    const weekday = today.getDay();
    from.setDate(today.getDate() - (weekday === 0 ? 6 : weekday - 1));
  } else {
    from.setDate(1);
  }
  const format = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${format.format(from)} al ${format.format(today)}`;
};

const reportGeneratedLabel = () => new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date());

const loadReportLogo = async () => {
  try {
    const response = await fetch('/logo-reactiva-white.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const ReactivaTeamScorePanel: React.FC<{
  companyId?: string | null;
  period: DashboardPeriod;
  title?: string;
  enabled?: boolean;
  showExportActions?: boolean;
  showCompanyFilter?: boolean;
}> = ({ companyId, period, title = 'Puntaje ReActiva del equipo', enabled = true, showExportActions = false, showCompanyFilter = false }) => {
  const { empresas } = useEmpresas();
  const { summary, loading, unavailable } = useReactivaScoreSummary(companyId, enabled);
  const previousMonth = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1, 1);
    return date;
  }, []);
  const { summary: previousSummary } = useReactivaScoreSummary(companyId, enabled, previousMonth);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<'ALL' | 'ADMINISTRATIVO' | 'OPERATIVO'>('ALL');
  const [eligibility, setEligibility] = useState<'ALL' | 'ELIGIBLE' | 'PENDING'>('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [showPeople, setShowPeople] = useState(false);

  const companyNames = useMemo(() => new Map(empresas.map(company => [company.supabaseId, company.nombre])), [empresas]);
  const users = useMemo(() => (summary?.users ?? []).map(user => ({ ...user, period: periodScoreForUser(user, period) })), [period, summary]);
  const filtered = useMemo(() => users.filter(user => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    const matchesProfile = profile === 'ALL' || user.work_profile === profile;
    const matchesEligibility = eligibility === 'ALL' || (eligibility === 'ELIGIBLE' ? user.period.eligible : !user.period.eligible);
    const matchesCompany = companyFilter === 'ALL' || user.company_id === companyFilter;
    return matchesSearch && matchesProfile && matchesEligibility && matchesCompany;
  }).sort((first, second) => first.name.localeCompare(second.name, 'es')), [companyFilter, eligibility, profile, search, users]);

  if (!enabled) return null;
  if (loading) return <section className="reactiva-team-panel reactiva-team-loading" aria-label="Cargando puntajes del equipo" />;
  if (unavailable || !summary) {
    return <section className="reactiva-team-panel reactiva-team-empty"><Award size={22} /><div><strong>{title}</strong><span>Disponible cuando el sistema de puntaje quede sincronizado.</span></div></section>;
  }

  const average = averageScoreForPeriod(summary.users, period);
  const eligibleCount = users.filter(user => user.period.eligible).length;
  const participants = users.filter(user => user.period.maximum > 0).length;
  const programmedUsers = users.filter(user => user.period.maximum > 0);
  const averagePoints = programmedUsers.length ? programmedUsers.reduce((total, user) => total + user.period.score, 0) / programmedUsers.length : 0;
  const averageMaximum = programmedUsers.length ? programmedUsers.reduce((total, user) => total + user.period.maximum, 0) / programmedUsers.length : 0;
  const completedUsers = users.filter(user => user.period.maximum > 0 && user.period.percent >= 100).length;
  const averageStreak = users.length ? users.reduce((total, user) => total + user.streak, 0) / users.length : 0;
  const visualUsers = users.map(user => ({ user, visual: teamScoreVisual(user.period, user.streak) }));
  const nearStreakCount = visualUsers.filter(item => item.visual.state === 'near').length;
  const completeStreakCount = visualUsers.filter(item => item.visual.state === 'complete').length;
  const activityBreakdown = summary.users.reduce((totals, user) => {
    if (period === 'mensual') {
      totals.micro += user.breakdown.microtrainings;
      totals.daily += user.breakdown.daily_forms;
      totals.weekly += user.breakdown.weekly_forms;
      totals.weeks += user.weeks.length;
    } else {
      const week = user.weeks.find(item => item.week_start === currentWeekStart());
      totals.micro += week?.microtrainings ?? 0;
      totals.daily += week?.daily_forms ?? 0;
      totals.weekly += week?.weekly_forms ?? 0;
      totals.weeks += week ? 1 : 0;
    }
    return totals;
  }, { micro: 0, daily: 0, weekly: 0, weeks: 0 });
  const weeklyEvolution = Array.from(new Set(summary.users.flatMap(user => user.weeks.map(week => week.week_start)))).sort().map(weekStart => {
    const weekValues = summary.users.map(user => user.weeks.find(week => week.week_start === weekStart)).filter(Boolean);
    return { weekStart, average: weekValues.length ? weekValues.reduce((total, week) => total + (week?.score ?? 0), 0) / weekValues.length : 0 };
  });
  const activityItems = [
    { label: 'Microentrenamientos', value: activityBreakdown.micro, maximum: activityBreakdown.weeks * 6 },
    { label: 'Formularios diarios', value: activityBreakdown.daily, maximum: activityBreakdown.weeks * 2 },
    { label: 'Formularios semanales', value: activityBreakdown.weekly, maximum: activityBreakdown.weeks * 2 },
  ];
  const previousByCompany = new Map<string, number>();
  if (previousSummary) {
    const grouped = new Map<string, ReactivaTeamScore[]>();
    previousSummary.users.forEach(user => grouped.set(user.company_id, [...(grouped.get(user.company_id) ?? []), user]));
    grouped.forEach((companyUsers, id) => previousByCompany.set(id, averageScoreForPeriod(companyUsers, 'mensual')));
  }
  const companyIds: string[] = Array.from(new Set(summary.users.map(user => String(user.company_id))));
  const companiesSummary = companyIds.map(id => {
    const companyUsers = summary.users.filter(user => user.company_id === id);
    const companyAverage = averageScoreForPeriod(companyUsers, period);
    const previousAverage = previousByCompany.get(id);
    return { id, name: companyNames.get(id) ?? 'Empresa', average: companyAverage, classified: companyUsers.filter(user => periodScoreForUser(user, period).eligible).length, trend: period === 'mensual' && previousAverage != null ? companyAverage - previousAverage : null };
  }).sort((first, second) => first.name.localeCompare(second.name, 'es'));

  const exportRows = filtered.map(user => ({
    name: user.name,
    email: user.email,
    company: companyNames.get(user.company_id) ?? 'Sin empresa',
    profile: user.work_profile === 'ADMINISTRATIVO' ? 'Administrativo' : user.work_profile === 'OPERATIVO' ? 'Operativo' : 'Sin clasificar',
    score: user.period.score,
    maximum: user.period.maximum,
    percent: Math.round(user.period.percent),
    status: user.period.eligible ? 'Objetivo alcanzado' : 'En progreso',
    streak: user.streak,
  }));

  const downloadCsv = (rows = exportRows, suffix = '') => {
    const headers = [
      'Colaborador',
      'Empresa',
      'Perfil laboral',
      'Puntaje',
      'Cumplimiento',
      'Estado',
      'Racha (semanas)',
      'Correo electrónico',
      'Período',
      'Fecha de exportación',
    ];
    const periodLabel = reportPeriodLabel(period);
    const generatedLabel = reportGeneratedLabel();
    const detailRows = rows.map(row => [
      row.name,
      row.company,
      row.profile,
      `${row.score}/${row.maximum}`,
      `${row.percent}%`,
      row.status,
      row.streak,
      row.email,
      periodLabel,
      generatedLabel,
    ]);
    const csv = `sep=;\r\n${[headers, ...detailRows].map(row => row.map(csvValue).join(';')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReActiva_Puntaje_${period}${suffix}_${dateKey(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const teal = [0, 191, 166] as const;
    const navy = [15, 23, 42] as const;
    const slate = [100, 116, 139] as const;
    const light = [241, 245, 249] as const;
    const logo = await loadReportLogo();
    const periodLabel = reportPeriodLabel(period);
    const generatedLabel = reportGeneratedLabel();

    const clippedText = (value: unknown, maxWidth: number) => {
      const raw = String(value ?? '');
      if (pdf.getTextWidth(raw) <= maxWidth) return raw;
      let clipped = raw;
      while (clipped.length > 1 && pdf.getTextWidth(`${clipped}…`) > maxWidth) clipped = clipped.slice(0, -1);
      return `${clipped}…`;
    };

    const drawBrandHeader = (continuation = false) => {
      pdf.setFillColor(...navy);
      pdf.rect(0, 0, pageWidth, 31, 'F');
      pdf.setFillColor(...teal);
      pdf.rect(0, 31, pageWidth, 2.2, 'F');
      if (logo) {
        pdf.addImage(logo, 'PNG', margin, 9, 43, 8.8);
      } else {
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('RE-ACTIVA', margin, 16);
      }
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(continuation ? 'Detalle de colaboradores' : 'Reporte de Puntaje ReActiva', pageWidth - margin, 13, { align: 'right' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(203, 213, 225);
      pdf.text(periodLabel, pageWidth - margin, 19, { align: 'right' });
      pdf.text(`Generado: ${generatedLabel}`, pageWidth - margin, 24, { align: 'right' });
    };

    const drawTableHeader = (y: number) => {
      pdf.setFillColor(...navy);
      pdf.roundedRect(margin, y, pageWidth - (margin * 2), 8, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('COLABORADOR', 17, y + 5.2);
      pdf.text('EMPRESA', 75, y + 5.2);
      pdf.text('PERFIL', 113, y + 5.2);
      pdf.text('PUNTAJE', 144, y + 5.2);
      pdf.text('CUMPL.', 160, y + 5.2);
      pdf.text('ESTADO', 185, y + 5.2, { align: 'center' });
      return y + 10;
    };

    drawBrandHeader();
    pdf.setTextColor(...navy);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(19);
    pdf.text(title, margin, 47);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...slate);
    pdf.text(`${filtered.length} colaboradores según los filtros aplicados`, margin, 53);

    const cards = [
      { label: 'PUNTAJE PROMEDIO', value: `${averagePoints.toFixed(1)}/${averageMaximum.toFixed(1)}` },
      { label: 'CUMPLIMIENTO', value: `${Math.round(average)}%` },
      { label: 'OBJETIVO ALCANZADO', value: String(eligibleCount) },
      { label: 'CON PERÍODO', value: String(participants) },
    ];
    const cardGap = 3;
    const cardWidth = (pageWidth - (margin * 2) - (cardGap * 3)) / 4;
    cards.forEach((card, index) => {
      const x = margin + (index * (cardWidth + cardGap));
      pdf.setFillColor(...light);
      pdf.roundedRect(x, 59, cardWidth, 23, 3, 3, 'F');
      pdf.setFillColor(...teal);
      pdf.roundedRect(x, 59, 2.2, 23, 1, 1, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(...slate);
      pdf.text(card.label, x + 5, 66);
      pdf.setFontSize(15);
      pdf.setTextColor(...navy);
      pdf.text(card.value, x + 5, 76);
    });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...navy);
    pdf.text('ACTIVIDAD REGISTRADA', margin, 91);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...slate);
    pdf.text(`Microentrenamientos ${activityBreakdown.micro}/${activityBreakdown.weeks * 6}`, margin, 97);
    pdf.text(`Formularios diarios ${activityBreakdown.daily}/${activityBreakdown.weeks * 2}`, 76, 97);
    pdf.text(`Formularios semanales ${activityBreakdown.weekly}/${activityBreakdown.weeks * 2}`, 139, 97);

    let y = drawTableHeader(104);
    if (!exportRows.length) {
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, y, pageWidth - (margin * 2), 15, 2, 2, 'F');
      pdf.setTextColor(...slate);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('No hay colaboradores para los filtros seleccionados.', margin + 4, y + 9);
    }

    exportRows.forEach((row, index) => {
      if (y > pageHeight - 27) {
        pdf.addPage();
        drawBrandHeader(true);
        y = drawTableHeader(40);
      }
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y - 1.5, pageWidth - (margin * 2), 11.5, 'F');
      }
      pdf.setTextColor(...navy);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.4);
      pdf.text(clippedText(row.name, 52), 17, y + 3);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...slate);
      pdf.setFontSize(6.2);
      pdf.text(clippedText(row.email, 52), 17, y + 7);
      pdf.setTextColor(...navy);
      pdf.setFontSize(7);
      pdf.text(clippedText(row.company, 34), 75, y + 4.5);
      pdf.text(clippedText(row.profile, 27), 113, y + 4.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${row.score}/${row.maximum}`, 144, y + 4.5);
      pdf.setTextColor(...teal);
      pdf.text(`${row.percent}%`, 160, y + 4.5);
      pdf.setFontSize(5.8);
      if (row.status === 'Objetivo alcanzado') {
        pdf.setFillColor(220, 252, 231);
        pdf.roundedRect(176, y, 18, 7.5, 2, 2, 'F');
        pdf.setTextColor(5, 150, 105);
        pdf.text('Alcanzado', 185, y + 4.8, { align: 'center' });
      } else {
        pdf.setFillColor(255, 247, 237);
        pdf.roundedRect(176, y, 18, 7.5, 2, 2, 'F');
        pdf.setTextColor(217, 119, 6);
        pdf.setFontSize(5.2);
        pdf.text('En progreso', 185, y + 4.8, { align: 'center' });
      }
      y += 11.5;
    });

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(...slate);
      pdf.text('El Puntaje ReActiva refleja constancia en actividades programadas; no mide salud ni rendimiento laboral.', margin, pageHeight - 10);
      pdf.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    pdf.save(`ReActiva_Puntaje_${period}_${dateKey(new Date())}.pdf`);
  };

  return (
    <section className="reactiva-team-panel">
      <div className="reactiva-team-head">
        <div className="reactiva-team-heading">
          <span className="reactiva-team-heading-icon"><Award size={19} /></span>
          <div>
            <small>{period === 'semanal' ? 'Semana actual' : 'Mes actual'}</small>
            <h3>{title}</h3>
            <div className="reactiva-team-momentum">
              {nearStreakCount > 0 && <span className="near"><Flame size={12} /> {nearStreakCount} {nearStreakCount === 1 ? 'persona está' : 'personas están'} a un paso</span>}
              {completeStreakCount > 0 && <span className="complete"><Sparkles size={12} /> {completeStreakCount} {completeStreakCount === 1 ? 'racha completa' : 'rachas completas'}</span>}
            </div>
          </div>
        </div>
        {(showExportActions || (period === 'mensual' && summary.global_average_percent != null && companyId)) && <div className="reactiva-team-actions">
          {period === 'mensual' && summary.global_average_percent != null && companyId && (
            <span className="reactiva-team-global">Global: {Math.round(summary.global_average_percent)}%</span>
          )}
          {showExportActions && <button type="button" onClick={() => downloadCsv()}><Download size={15} /> CSV</button>}
          {showExportActions && <button type="button" onClick={downloadPdf}><FileText size={15} /> PDF</button>}
        </div>}
      </div>

      <div className="reactiva-team-kpis">
        <div className="score"><Award size={18} /><span>Puntaje promedio<strong>{averagePoints.toFixed(1)}/{averageMaximum.toFixed(1)}</strong></span></div>
        <div className="eligible"><CheckCircle2 size={18} /><span>Clasificados<strong>{eligibleCount}</strong></span></div>
        <div className="participants"><Users size={18} /><span>Con período programado<strong>{participants}</strong></span></div>
        <div className="score"><Award size={18} /><span>Cumplimiento promedio<strong>{Math.round(average)}%</strong></span></div>
        <div className="complete"><Sparkles size={18} /><span>Con 100%<strong>{completedUsers}</strong></span></div>
        <div className="streak"><Flame size={18} /><span>Racha promedio<strong>{averageStreak.toFixed(1)}</strong></span></div>
      </div>

      <div className="reactiva-team-breakdowns">
        <div className="reactiva-breakdown-card">
          <h4>Desglose por actividad</h4>
          <div className="reactiva-breakdown-bars">
            {activityItems.map(item => {
              const progress = item.maximum > 0 ? Math.min(100, (item.value * 100) / item.maximum) : 0;
              return (
                <div key={item.label}>
                  <span><span>{item.label}</span><strong>{item.value}/{item.maximum}</strong></span>
                  <span className="reactiva-breakdown-progress"><i style={{ width: `${progress}%` }} /></span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="reactiva-breakdown-card">
          <h4>Evolución semanal</h4>
          <div className="reactiva-breakdown-bars weekly">
            {weeklyEvolution.map((week, index) => (
              <div key={week.weekStart}>
                <span><span>Semana {index + 1}</span><strong>{week.average.toFixed(1)}/10</strong></span>
                <span className="reactiva-breakdown-progress"><i style={{ width: `${Math.min(100, week.average * 10)}%` }} /></span>
              </div>
            ))}
            {!weeklyEvolution.length && <p>La evolución aparecerá cuando haya semanas registradas.</p>}
          </div>
        </div>
      </div>

      {!companyId && companiesSummary.length > 0 && (
        <div className="reactiva-company-summary"><h4>Empresas</h4>{companiesSummary.map(company => <div key={company.id}><span><strong>{company.name}</strong><small>{company.classified} clasificados</small></span><span>{Math.round(company.average)}%<small>{company.trend == null ? 'Sin comparación anterior' : `${company.trend >= 0 ? '+' : ''}${Math.round(company.trend)} pp vs mes anterior`}</small></span></div>)}</div>
      )}

      <button
        type="button"
        className={`reactiva-people-toggle ${showPeople ? 'open' : ''}`}
        onClick={() => setShowPeople(current => !current)}
        aria-expanded={showPeople}
      >
        <span className="reactiva-people-toggle-icon"><Users size={18} /></span>
        <span className="reactiva-people-toggle-copy">
          <strong>Detalle de colaboradores</strong>
          <small>{users.length} personas · {completeStreakCount} completas · {nearStreakCount} a un paso</small>
        </span>
        <span className="reactiva-people-toggle-action">{showPeople ? 'Ocultar' : 'Ver detalle'} <ChevronDown size={17} /></span>
      </button>

      {showPeople && (
        <div className="reactiva-people-detail">
          <div className={`reactiva-team-filters ${showCompanyFilter ? 'has-company' : ''}`}>
            <label><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar usuario" /></label>
            {showCompanyFilter && (
              <select value={companyFilter} onChange={event => setCompanyFilter(event.target.value)} aria-label="Filtrar por empresa">
                <option value="ALL">Todas las empresas</option>
                {empresas.filter(company => company.supabaseId).map(company => <option key={company.supabaseId} value={company.supabaseId}>{company.nombre}</option>)}
              </select>
            )}
            <select value={profile} onChange={event => setProfile(event.target.value as typeof profile)} aria-label="Filtrar por perfil laboral">
              <option value="ALL">Todos los perfiles</option><option value="ADMINISTRATIVO">Administrativo</option><option value="OPERATIVO">Operativo</option>
            </select>
            <select value={eligibility} onChange={event => setEligibility(event.target.value as typeof eligibility)} aria-label="Filtrar por objetivo">
              <option value="ALL">Todos los estados</option><option value="ELIGIBLE">Objetivo alcanzado</option><option value="PENDING">En progreso</option>
            </select>
          </div>

          <div className="reactiva-team-list">
            <div className="reactiva-team-row reactiva-team-row-head"><span>Colaborador</span><span>Perfil</span><span>Puntaje</span><span>Estado</span></div>
            {filtered.map(user => {
              const visual = teamScoreVisual(user.period, user.streak);
              return (
                <div className={`reactiva-team-row state-${visual.state}`} key={user.profile_id}>
                  <span><strong>{user.name}</strong><small>{companyNames.get(user.company_id) ?? user.email}</small></span>
                  <span>{user.work_profile === 'ADMINISTRATIVO' ? 'Administrativo' : user.work_profile === 'OPERATIVO' ? 'Operativo' : 'Sin clasificar'}</span>
                  <span className="reactiva-team-score-cell">
                    <span><strong>{user.period.score}/{user.period.maximum}</strong><small>{Math.round(user.period.percent)}%</small></span>
                    <span className="reactiva-team-row-progress" aria-label={`${Math.round(user.period.percent)}% completado`}>
                      <i style={{ width: `${Math.min(100, Math.max(0, user.period.percent))}%` }} />
                    </span>
                  </span>
              <span className={`reactiva-team-state ${visual.state}`}>
                {visual.icon}
                <span><strong>{visual.label}</strong>{visual.detail && <small>{visual.detail}</small>}</span>
              </span>
                </div>
              );
            })}
            {!filtered.length && <p className="reactiva-team-no-results">No hay colaboradores para estos filtros.</p>}
          </div>
        </div>
      )}
    </section>
  );
};

import type { AdminStats } from '../hooks/useAdminStats';
import type { ReactivaScoreSummary, ReactivaTeamScore } from './reactivaScore';

export type IntelligenceScope = 'global' | 'company';

export interface DashboardInsight {
  id: string;
  title: string;
  detail: string;
  source: string;
  confidence: 'Alta' | 'Media' | 'Baja';
}

export interface DashboardAction {
  id: string;
  title: string;
  detail: string;
  owner: 'RRHH' | 'ReActiva' | 'Informativo';
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface ImpactMetric {
  label: string;
  current: string;
  previous: string;
  delta: string;
  tone: 'positive' | 'warning' | 'neutral';
}

const pp = (value: number) => `${value > 0 ? '+' : ''}${value} pp`;

const topItem = (items: { name: string; valor: number }[]) => (
  items.length > 0 ? [...items].sort((a, b) => b.valor - a.valor)[0] : null
);

const enoughData = (stats: AdminStats) => stats.totalPausas >= 3 || stats.usuariosCount >= 3;

const scoreAverage = (users: ReactivaTeamScore[]) => {
  const eligible = users.filter(user => user.maximum > 0);
  return eligible.length ? eligible.reduce((total, user) => total + user.percent, 0) / eligible.length : 0;
};

export const buildReactivaScoreInsights = (summary?: ReactivaScoreSummary | null): DashboardInsight[] => {
  const users = (summary?.users ?? []).filter(user => user.maximum > 0);
  if (!users.length) return [];
  if (users.length < 3) {
    return [{
      id: 'reactiva-small-sample',
      title: 'Primeros datos de Puntaje ReActiva',
      detail: 'Ya hay actividad, pero todavía se necesitan al menos 3 personas para mostrar una tendencia.',
      source: `${users.length} colaboradores con período programado`,
      confidence: 'Baja',
    }];
  }

  const insights: DashboardInsight[] = [];
  const classified = users.filter(user => user.eligible).length;
  const classifiedPercent = Math.round(classified * 100 / users.length);
  insights.push({
    id: 'reactiva-eligibility',
    title: 'Objetivo mensual',
    detail: `${classified} de ${users.length} personas alcanzaron el objetivo mensual (${classifiedPercent}%).`,
    source: 'reactiva_score_events y configuración empresarial',
    confidence: 'Alta',
  });

  const programmedWeeks = users.reduce((total, user) => total + user.weeks.length, 0);
  const activityRates = [
    { label: 'Los microentrenamientos', value: users.reduce((total, user) => total + user.breakdown.microtrainings, 0), maximum: programmedWeeks * 6 },
    { label: 'Los formularios diarios', value: users.reduce((total, user) => total + user.breakdown.daily_forms, 0), maximum: programmedWeeks * 2 },
    { label: 'Los formularios semanales', value: users.reduce((total, user) => total + user.breakdown.weekly_forms, 0), maximum: programmedWeeks * 2 },
  ].filter(item => item.maximum > 0).map(item => ({ ...item, percent: Math.round(item.value * 100 / item.maximum) }));
  const lowest = activityRates.sort((first, second) => first.percent - second.percent)[0];
  if (lowest) {
    insights.push({
      id: 'reactiva-activity-opportunity',
      title: 'Actividad para reforzar',
      detail: `${lowest.label} tienen ${lowest.percent}% de cumplimiento. Conviene revisar si el acceso y los recordatorios son claros.`,
      source: 'desglose real de reactiva_score_events',
      confidence: 'Alta',
    });
  }

  const administrative = users.filter(user => user.work_profile === 'ADMINISTRATIVO');
  const operative = users.filter(user => user.work_profile === 'OPERATIVO');
  if (administrative.length >= 3 && operative.length >= 3) {
    const administrativeAverage = scoreAverage(administrative);
    const operativeAverage = scoreAverage(operative);
    const difference = Math.round(Math.abs(administrativeAverage - operativeAverage));
    if (difference >= 10) {
      insights.push({
        id: 'reactiva-profile-constancy',
        title: 'Diferencia entre perfiles',
        detail: `${administrativeAverage > operativeAverage ? 'Administrativo' : 'Operativo'} tiene ${difference} puntos más de cumplimiento. Revisá horarios y acceso de cada grupo.`,
        source: 'Puntaje ReActiva segmentado por work_profile',
        confidence: 'Media',
      });
    }
  }

  const averageStreak = users.reduce((total, user) => total + user.streak, 0) / users.length;
  if (averageStreak > 0) {
    insights.push({
      id: 'reactiva-streak',
      title: 'Racha del equipo',
      detail: `El promedio actual es de ${averageStreak.toFixed(1)} semanas completas seguidas.`,
      source: 'semanas consecutivas con 10/10',
      confidence: 'Alta',
    });
  }

  return insights.slice(0, 4);
};

export const buildDashboardInsights = (
  stats: AdminStats,
  administrativeStats?: AdminStats,
  operativeStats?: AdminStats,
  scope: IntelligenceScope = 'global',
): DashboardInsight[] => {
  const insights: DashboardInsight[] = [];
  const sampleOk = enoughData(stats);
  const scopeLabel = scope === 'company' ? 'esta empresa' : 'la plataforma';

  if (!stats.hayDatos) {
    return [{
      id: 'empty-data',
      title: 'Todavía faltan datos',
      detail: `Aún no hay suficientes pausas para mostrar una tendencia de ${scopeLabel}.`,
      source: 'pause_sessions',
      confidence: 'Baja',
    }];
  }

  if (!sampleOk) {
    insights.push({
      id: 'small-sample',
      title: 'Muestra inicial',
      detail: 'Ya hay actividad, pero todavía es poca. Tomá estos datos como una primera referencia.',
      source: `${stats.totalPausas} pausas registradas`,
      confidence: 'Baja',
    });
  }

  if (stats.adherencia < 45) {
    insights.push({
      id: 'low-participation',
      title: 'Participación baja',
      detail: `La participación es ${stats.adherencia}%. Revisá horarios, recordatorios y acceso.`,
      source: 'pause_sessions por día y bloque',
      confidence: sampleOk ? 'Alta' : 'Baja',
    });
  } else if (stats.adherencia >= 75) {
    insights.push({
      id: 'strong-participation',
      title: 'Buena adopción',
      detail: `La participación llegó a ${stats.adherencia}%. Es una señal positiva para sostener la rutina.`,
      source: 'pause_sessions por día y bloque',
      confidence: sampleOk ? 'Alta' : 'Media',
    });
  }

  const tension = topItem(stats.tensionDistribucion);
  if (tension && tension.valor >= 30 && tension.name !== 'No sentí tensión') {
    insights.push({
      id: 'tension-pattern',
      title: 'Momento con más tensión',
      detail: `${tension.valor}% de las respuestas marca "${tension.name}".`,
      source: 'respuestas semanales de tensión',
      confidence: sampleOk ? 'Media' : 'Baja',
    });
  }

  if (stats.reportanMolestias >= 25) {
    const zone = stats.zonasDolorTop[0] ?? 'zona no especificada';
    insights.push({
      id: 'pain-signal',
      title: 'Molestias para revisar',
      detail: `${stats.reportanMolestias}% reportó molestias. La zona más mencionada es ${zone}.`,
      source: 'respuestas diarias de dolor',
      confidence: sampleOk ? 'Media' : 'Baja',
    });
  }

  if (administrativeStats?.hayDatos && operativeStats?.hayDatos) {
    const diff = administrativeStats.adherencia - operativeStats.adherencia;
    if (Math.abs(diff) >= 15) {
      insights.push({
        id: 'profile-gap',
        title: 'Diferencia entre perfiles',
        detail: diff > 0
          ? `El perfil Operativo participa ${Math.abs(diff)} puntos menos que Administrativo.`
          : `El perfil Administrativo participa ${Math.abs(diff)} puntos menos que Operativo.`,
        source: 'segmentación por work_profile',
        confidence: 'Media',
      });
    }
  }

  return insights.slice(0, 5);
};

export const buildDashboardActions = (insights: DashboardInsight[]): DashboardAction[] => {
  const actions: DashboardAction[] = [];

  insights.forEach((insight) => {
    if (insight.id === 'low-participation') {
      actions.push({
        id: 'review-reminders',
        title: 'Revisar recordatorios y horarios',
        detail: 'Comprobá que los mensajes lleguen a tiempo y que los horarios sirvan para la rutina del equipo.',
        owner: 'RRHH',
        priority: 'Alta',
      });
    }

    if (insight.id === 'tension-pattern') {
      actions.push({
        id: 'adjust-pause-timing',
        title: 'Ajustar momento de pausa',
        detail: 'Probá mover o reforzar la pausa del horario con más tensión.',
        owner: 'ReActiva',
        priority: 'Media',
      });
    }

    if (insight.id === 'pain-signal') {
      actions.push({
        id: 'add-target-content',
        title: 'Priorizar contenido específico',
        detail: 'Programá contenido para la zona con más molestias.',
        owner: 'ReActiva',
        priority: 'Alta',
      });
    }

    if (insight.id === 'profile-gap') {
      actions.push({
        id: 'profile-segmentation',
        title: 'Revisar segmentación por perfil',
        detail: 'Compará horarios, videos y mensajes de cada perfil.',
        owner: 'Informativo',
        priority: 'Media',
      });
    }
  });

  if (actions.length === 0) {
    actions.push({
      id: 'keep-monitoring',
      title: 'Sostener seguimiento',
      detail: 'No hay alertas importantes. Seguí revisando la evolución cada semana.',
      owner: 'Informativo',
      priority: 'Baja',
    });
  }

  return actions.slice(0, 4);
};

export const buildImpactMetrics = (current: AdminStats, previous?: AdminStats): ImpactMetric[] => {
  const prev = previous ?? current;
  const participationDelta = current.adherencia - prev.adherencia;
  const energyDelta = Math.round((current.energiaPromedio - prev.energiaPromedio) * 10) / 10;
  const painDelta = current.reportanMolestias - prev.reportanMolestias;

  return [
    {
      label: 'Participación actual vs anterior',
      current: `${current.adherencia}%`,
      previous: `${prev.adherencia}%`,
      delta: pp(participationDelta),
      tone: participationDelta > 0 ? 'positive' : participationDelta < -10 ? 'warning' : 'neutral',
    },
    {
      label: 'Energía promedio',
      current: current.energiaPromedio ? `${current.energiaPromedio.toFixed(1)}/5` : 'Sin datos',
      previous: prev.energiaPromedio ? `${prev.energiaPromedio.toFixed(1)}/5` : 'Sin datos',
      delta: energyDelta > 0 ? `+${energyDelta}` : `${energyDelta}`,
      tone: energyDelta > 0 ? 'positive' : energyDelta < -0.5 ? 'warning' : 'neutral',
    },
    {
      label: 'Dolor reportado',
      current: `${current.reportanMolestias}%`,
      previous: `${prev.reportanMolestias}%`,
      delta: pp(-painDelta),
      tone: painDelta < 0 ? 'positive' : painDelta > 10 ? 'warning' : 'neutral',
    },
  ];
};

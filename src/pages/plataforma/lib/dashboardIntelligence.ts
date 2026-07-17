import type { AdminStats } from '../hooks/useAdminStats';

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
      title: 'Todavía no hay datos suficientes',
      detail: `Aún no se registraron pausas suficientes para generar conclusiones confiables sobre ${scopeLabel}.`,
      source: 'pause_sessions',
      confidence: 'Baja',
    }];
  }

  if (!sampleOk) {
    insights.push({
      id: 'small-sample',
      title: 'Muestra inicial',
      detail: 'Ya hay actividad registrada, pero la muestra todavía es chica. Los indicadores se muestran como orientación, no como conclusión.',
      source: `${stats.totalPausas} pausas registradas`,
      confidence: 'Baja',
    });
  }

  if (stats.adherencia < 45) {
    insights.push({
      id: 'low-participation',
      title: 'Participación baja',
      detail: `La participación actual es ${stats.adherencia}%. Conviene revisar horarios, recordatorios y facilidad de acceso.`,
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
      title: 'Patrón de tensión detectado',
      detail: `El momento con más tensión reportada es "${tension.name}" con ${tension.valor}% de las respuestas.`,
      source: 'respuestas semanales de tensión',
      confidence: sampleOk ? 'Media' : 'Baja',
    });
  }

  if (stats.reportanMolestias >= 25) {
    const zone = stats.zonasDolorTop[0] ?? 'zona no especificada';
    insights.push({
      id: 'pain-signal',
      title: 'Señal de dolor a atender',
      detail: `${stats.reportanMolestias}% de las pausas reportan molestias. La zona más mencionada es ${zone}.`,
      source: 'respuestas diarias de dolor',
      confidence: sampleOk ? 'Media' : 'Baja',
    });
  }

  if (administrativeStats?.hayDatos && operativeStats?.hayDatos) {
    const diff = administrativeStats.adherencia - operativeStats.adherencia;
    if (Math.abs(diff) >= 15) {
      insights.push({
        id: 'profile-gap',
        title: 'Brecha entre perfiles laborales',
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
        detail: 'Validar si los emails llegan antes de cada pausa y si el horario coincide con la rutina real de la empresa.',
        owner: 'RRHH',
        priority: 'Alta',
      });
    }

    if (insight.id === 'tension-pattern') {
      actions.push({
        id: 'adjust-pause-timing',
        title: 'Ajustar momento de pausa',
        detail: 'Evaluar mover o reforzar la pausa del bloque donde aparece mayor tensión.',
        owner: 'ReActiva',
        priority: 'Media',
      });
    }

    if (insight.id === 'pain-signal') {
      actions.push({
        id: 'add-target-content',
        title: 'Priorizar contenido específico',
        detail: 'Programar microentrenamientos o talleres relacionados con la zona de dolor más reportada.',
        owner: 'ReActiva',
        priority: 'Alta',
      });
    }

    if (insight.id === 'profile-gap') {
      actions.push({
        id: 'profile-segmentation',
        title: 'Revisar segmentación por perfil',
        detail: 'Comparar videos, horarios y emails de Administrativo vs Operativo para detectar fricción.',
        owner: 'Informativo',
        priority: 'Media',
      });
    }
  });

  if (actions.length === 0) {
    actions.push({
      id: 'keep-monitoring',
      title: 'Sostener seguimiento',
      detail: 'No hay alertas críticas. Mantener medición semanal y revisar evolución con más datos.',
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

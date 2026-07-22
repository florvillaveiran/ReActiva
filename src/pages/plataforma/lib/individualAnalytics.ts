export type AnalyticsPeriod = 'semanal' | 'mensual' | 'anual' | 'personalizado';

export interface IndividualPauseSession {
  id?: string;
  profileId?: string;
  dayLabel: string;
  block: 'morning' | 'afternoon';
  occurredAt: string;
  energy: number | null;
  feeling: string | null;
  hasPain: boolean | null;
  painZone: string | null;
  answers: Record<string, any>;
}

export interface IndividualAnalytics {
  hasSessions: boolean;
  hasFeedback: boolean;
  current: {
    actividadFisica?: string;
    energia?: string;
    fatiga?: string;
    bienestar?: string;
  };
  evolucion: {
    name: string;
    participacion: number;
    energiaPct: number;
    dolor: number;
    foco: number;
    impacto: number;
  }[];
  kpis: {
    participacion: number;
    dolor: number;
    foco: number;
    impacto: number;
    energia: number;
  };
  zonasDolor: {
    zona: string;
    tendencia: string;
    icon: 'flat';
    color: string;
  }[];
  tension: {
    name: string;
    valor: number;
    count: number;
  }[];
}

interface TimeBucket {
  name: string;
  from: Date;
  to: Date;
  expectedSessions: number;
}

const FEELING_SCORE: Record<string, number> = {
  Mal: 1,
  Regular: 2,
  Bien: 3,
  'Muy bien': 4,
  Genial: 5,
};

const HELP_SCORE: Record<string, number> = {
  No: 15,
  'Sí, un poco': 55,
  'Sí, mucho': 90,
};

const FOCUS_SCORE: Record<string, number> = {
  Disperso: 25,
  Normal: 60,
  Enfocado: 90,
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const average = (values: number[]) => {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
};

const validDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const addDays = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const expectedProgramSessions = (from: Date, to: Date) => {
  let total = 0;
  for (let date = startOfDay(from); date <= to; date = addDays(date, 1)) {
    const weekday = date.getDay();
    if (weekday === 1 || weekday === 3 || weekday === 5) total += 2;
  }
  return total;
};

const shortDay = (date: Date) => new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
  .format(date)
  .replace('.', '');

const shortMonth = (date: Date) => new Intl.DateTimeFormat('es-AR', { month: 'short' })
  .format(date)
  .replace('.', '');

const createBuckets = (
  period: AnalyticsPeriod,
  fromValue?: string,
  toValue?: string,
  now = new Date(),
): TimeBucket[] => {
  if (period === 'semanal') {
    const today = startOfDay(now);
    const weekday = today.getDay();
    const monday = addDays(today, -(weekday === 0 ? 6 : weekday - 1));
    return Array.from({ length: 7 }, (_, index) => {
      const from = addDays(monday, index);
      const expectedSessions = [1, 3, 5].includes(from.getDay()) ? 2 : 0;
      return { name: shortDay(from), from, to: endOfDay(from), expectedSessions };
    });
  }

  if (period === 'mensual') {
    const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    const bucketCount = Math.ceil(monthEnd.getDate() / 7);
    return Array.from({ length: bucketCount }, (_, index) => {
      const from = addDays(monthStart, index * 7);
      const to = index === bucketCount - 1 ? monthEnd : endOfDay(addDays(from, 6));
      return { name: `Sem ${index + 1}`, from, to, expectedSessions: expectedProgramSessions(from, to) };
    });
  }

  if (period === 'anual') {
    return Array.from({ length: 12 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      const from = startOfDay(month);
      const to = endOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
      return { name: shortMonth(month), from, to, expectedSessions: 24 };
    });
  }

  const parsedFrom = fromValue ? validDate(`${fromValue}T00:00:00`) : null;
  const parsedTo = toValue ? validDate(`${toValue}T23:59:59`) : null;
  const to = parsedTo ? endOfDay(parsedTo) : endOfDay(now);
  const from = parsedFrom ? startOfDay(parsedFrom) : addDays(startOfDay(to), -27);
  const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000) + 1);
  const bucketCount = Math.min(days, days <= 14 ? days : 8);
  const daysPerBucket = Math.ceil(days / bucketCount);

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketFrom = addDays(from, index * daysPerBucket);
    const bucketTo = index === bucketCount - 1
      ? to
      : endOfDay(addDays(bucketFrom, daysPerBucket - 1));
    const expectedSessions = Math.max(2, Math.round((daysPerBucket / 7) * 6));
    return {
      name: days <= 14
        ? `${bucketFrom.getDate()}/${bucketFrom.getMonth() + 1}`
        : `P${index + 1}`,
      from: bucketFrom,
      to: bucketTo,
      expectedSessions,
    };
  }).filter(bucket => bucket.from <= to);
};

const getEnergy = (session: IndividualPauseSession) => {
  const value = session.energy ?? session.answers?.energia;
  return typeof value === 'number' && value >= 1 && value <= 5 ? value : null;
};

const getFeeling = (session: IndividualPauseSession) => {
  const value = session.feeling ?? session.answers?.feeling;
  return typeof value === 'string' && FEELING_SCORE[value] ? value : null;
};

const getPain = (session: IndividualPauseSession) => {
  const value = session.hasPain ?? session.answers?.dolor;
  return typeof value === 'boolean' ? value : null;
};

const getPainZone = (session: IndividualPauseSession) => {
  const value = session.painZone ?? session.answers?.zona;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const getFocusScore = (session: IndividualPauseSession) => {
  const work = session.answers?.trabajo ?? session.answers?.focus_state;
  if (typeof work === 'string' && FOCUS_SCORE[work]) return FOCUS_SCORE[work];
  const feeling = getFeeling(session);
  return feeling ? FEELING_SCORE[feeling] * 20 : null;
};

const getImpactScore = (session: IndividualPauseSession) => {
  const help = session.answers?.ayuda;
  return typeof help === 'string' && HELP_SCORE[help] ? HELP_SCORE[help] : null;
};

const TENSION_OPTIONS = ['A la mañana', 'Al mediodía', 'A la tarde', 'Al final de la jornada', 'No sentí tensión'];

const getTension = (session: IndividualPauseSession) => {
  const value = session.answers?.tension ?? session.answers?.estres;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const labelPositive = (score: number) => score <= 2 ? 'Baja' : score <= 3.5 ? 'Media' : 'Alta';
const labelFatigue = (score: number) => score <= 2 ? 'Alta' : score <= 3.5 ? 'Media' : 'Baja';
const labelWellbeing = (score: number) => score <= 2 ? 'Bajo' : score <= 3.5 ? 'Medio' : 'Alto';

const uniqueSessions = (sessions: IndividualPauseSession[]) => {
  const deduplicated = new Map<string, IndividualPauseSession>();
  sessions.forEach((session) => {
    const date = validDate(session.occurredAt);
    if (!date) return;
    const key = session.id ?? `${date.toISOString().slice(0, 10)}:${session.dayLabel}:${session.block}`;
    const previous = deduplicated.get(key);
    if (!previous || new Date(previous.occurredAt) < date) deduplicated.set(key, session);
  });
  return Array.from(deduplicated.values());
};

export const calculateIndividualAnalytics = (
  rawSessions: IndividualPauseSession[],
  period: AnalyticsPeriod,
  fromValue?: string,
  toValue?: string,
  now = new Date(),
  eligibleFromValue?: string,
): IndividualAnalytics => {
  const sessions = uniqueSessions(rawSessions);
  const buckets = createBuckets(period, fromValue, toValue, now);
  const eligibleFrom = eligibleFromValue ? validDate(eligibleFromValue) : null;
  const expectedForBucket = (bucket: TimeBucket) => {
    const from = eligibleFrom && eligibleFrom > bucket.from ? startOfDay(eligibleFrom) : bucket.from;
    return from <= bucket.to ? expectedProgramSessions(from, bucket.to) : 0;
  };
  const inRange = sessions.filter((session) => {
    const date = validDate(session.occurredAt);
    return date && buckets.some(bucket => date >= bucket.from && date <= bucket.to);
  });

  const evolucion = buckets.map((bucket) => {
    const bucketSessions = sessions.filter((session) => {
      const date = validDate(session.occurredAt);
      return date && date >= bucket.from && date <= bucket.to;
    });
    const energyValues = bucketSessions.map(getEnergy).filter((value): value is number => value !== null);
    const painValues = bucketSessions.map(getPain).filter((value): value is boolean => value !== null);
    const focusValues = bucketSessions.map(getFocusScore).filter((value): value is number => value !== null);
    const impactValues = bucketSessions.map(getImpactScore).filter((value): value is number => value !== null);
    const expected = expectedForBucket(bucket);

    return {
      name: bucket.name,
      participacion: expected
        ? clamp((bucketSessions.length / expected) * 100)
        : 0,
      energiaPct: clamp((average(energyValues) ?? 0) * 20),
      dolor: painValues.length ? clamp((painValues.filter(Boolean).length / painValues.length) * 100) : 0,
      foco: clamp(average(focusValues) ?? 0),
      impacto: clamp(average(impactValues) ?? 0),
    };
  });

  const energyValues = inRange.map(getEnergy).filter((value): value is number => value !== null);
  const painValues = inRange.map(getPain).filter((value): value is boolean => value !== null);
  const focusValues = inRange.map(getFocusScore).filter((value): value is number => value !== null);
  const impactValues = inRange.map(getImpactScore).filter((value): value is number => value !== null);
  const expected = buckets.reduce((total, bucket) => total + expectedForBucket(bucket), 0);

  // Los niveles "actuales" usan las últimas cuatro semanas. Así evolucionan
  // con la actividad reciente y no quedan anclados a registros muy antiguos.
  const recentFrom = addDays(startOfDay(now), -27);
  const recent = sessions.filter((session) => {
    const date = validDate(session.occurredAt);
    return date && date >= recentFrom && date <= endOfDay(now);
  });
  const recentEnergy = recent.map(getEnergy).filter((value): value is number => value !== null);
  const recentFeeling = recent
    .map(getFeeling)
    .filter((value): value is string => value !== null)
    .map(value => FEELING_SCORE[value]);
  const currentWeekBuckets = createBuckets('semanal', undefined, undefined, now);
  const currentWeekFrom = currentWeekBuckets[0].from;
  const currentWeekTo = currentWeekBuckets[currentWeekBuckets.length - 1].to;
  const completedLastWeek = recent.filter((session) => {
    const date = validDate(session.occurredAt);
    return date && date >= currentWeekFrom && date <= currentWeekTo;
  }).length;
  const energyAverage = average(recentEnergy);
  const feelingAverage = average(recentFeeling);

  const zones = new Map<string, number>();
  inRange.forEach((session) => {
    if (!getPain(session)) return;
    const zone = getPainZone(session);
    if (zone && zone !== 'Otro') zones.set(zone, (zones.get(zone) ?? 0) + 1);
  });

  const tensionCounts = new Map<string, number>();
  inRange.forEach((session) => {
    const tension = getTension(session);
    if (tension) tensionCounts.set(tension, (tensionCounts.get(tension) ?? 0) + 1);
  });
  const tensionTotal = [...tensionCounts.values()].reduce((sum, value) => sum + value, 0);
  const tensionNames = [
    ...TENSION_OPTIONS,
    ...[...tensionCounts.keys()].filter(name => !TENSION_OPTIONS.includes(name)),
  ];

  return {
    hasSessions: sessions.length > 0,
    hasFeedback: recentEnergy.length > 0 || recentFeeling.length > 0,
    current: {
      actividadFisica: completedLastWeek === 0 ? undefined : completedLastWeek <= 3 ? 'Media' : 'Alta',
      energia: energyAverage === null ? undefined : labelPositive(energyAverage),
      fatiga: energyAverage === null ? undefined : labelFatigue(energyAverage),
      bienestar: feelingAverage === null ? undefined : labelWellbeing(feelingAverage),
    },
    evolucion,
    kpis: {
      participacion: expected ? clamp((inRange.length / expected) * 100) : 0,
      dolor: painValues.length ? clamp((painValues.filter(Boolean).length / painValues.length) * 100) : 0,
      foco: clamp(average(focusValues) ?? 0),
      impacto: clamp(average(impactValues) ?? 0),
      energia: clamp((average(energyValues) ?? 0) * 20),
    },
    zonasDolor: Array.from(zones.entries())
      .sort(([, left], [, right]) => right - left)
      .map(([zona, count]) => ({
        zona,
        tendencia: `${count} ${count === 1 ? 'reporte' : 'reportes'}`,
        icon: 'flat' as const,
        color: '#f59e0b',
      })),
    tension: tensionTotal
      ? tensionNames.map(name => ({
          name,
          count: tensionCounts.get(name) ?? 0,
          valor: clamp(((tensionCounts.get(name) ?? 0) / tensionTotal) * 100),
        }))
      : [],
  };
};

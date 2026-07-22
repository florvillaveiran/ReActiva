import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook de métricas para las vistas de Admin (Dashboard / Analíticas).
 *
 * Supabase es la fuente principal: consulta `pause_sessions`, filtra por empresa
 * y periodo, y se actualiza por Realtime. El almacenamiento local solo se usa
 * cuando Supabase no esta configurado, para conservar el modo de demostracion.
 */

interface PausaGuardada {
  profileId?: string;
  workProfile?: 'ADMINISTRATIVO' | 'OPERATIVO';
  dia: string;
  bloque: 'morning' | 'afternoon';
  fecha: string;
  tipo?: 'sin-form' | 'diario' | 'semanal-completo';
  energia?: number;
  dolor?: boolean;
  zona?: string;
  feeling?: string;
  respuestas?: {
    feeling?: string;
    energia?: number;
    dolor?: boolean;
    zona?: string;
    tension?: string;
    trabajo?: string;
    ayuda?: string;
    comentario?: string;
  };
}

export type AnalyticsWorkProfileFilter = 'ALL' | 'ADMINISTRATIVO' | 'OPERATIVO';

export interface AdminComment {
  txt: string;
  role: string;
  author: string;
  email?: string;
  companyId?: string;
  fecha: string;
  energia?: number;
  feeling?: string;
  hasPain?: boolean;
  painZone?: string;
}

export interface AdminStats {
  hayDatos: boolean;
  // KPIs de cabecera
  usuariosCount: number;
  totalPausas: number;
  adherencia: number;          // % 0-100
  reportanMolestias: number;   // % 0-100 que reporta dolor
  zonasDolorTop: string[];     // 2-3 zonas más reportadas
  estadoEmocional: number | null; // promedio 1-5
  energiaPromedio: number;        // promedio 0-5 (0 si no hay datos)
  // Participación por día
  participacionPorDia: { name: string; participacion: number }[];
  // Foco (de la pregunta semanal "Disperso / Normal / Enfocado")
  foco: { enfocado: number; normal: number; disperso: number };
  // Analíticas
  zonasDolorChart: { name: string; valor: number }[]; // valor en %
  tensionDistribucion: { name: string; valor: number }[]; // valor en %
  evolucion: { name: string; energia: number; satisfaccion: number; participacion: number }[];
  comentarios: AdminComment[];
}

const DAYS = ['Lunes', 'Miércoles', 'Viernes'];
const DAYS_SHORT: Record<string, string> = { Lunes: 'Lun', Miércoles: 'Mié', Viernes: 'Vie' };

const DEMO_STATS: AdminStats = {
  hayDatos: true,
  usuariosCount: 48,
  totalPausas: 238,
  adherencia: 83,
  reportanMolestias: 21,
  zonasDolorTop: ['Cuello', 'Espalda baja', 'Hombros'],
  estadoEmocional: 4.2,
  energiaPromedio: 4.1,
  participacionPorDia: [
    { name: 'Lun', participacion: 88 },
    { name: 'Mié', participacion: 82 },
    { name: 'Vie', participacion: 79 },
  ],
  foco: { enfocado: 64, normal: 28, disperso: 8 },
  zonasDolorChart: [
    { name: 'Cuello', valor: 38 },
    { name: 'Espalda baja', valor: 29 },
    { name: 'Hombros', valor: 21 },
    { name: 'Muñecas', valor: 12 },
  ],
  tensionDistribucion: [
    { name: 'A la mañana', valor: 9 },
    { name: 'Al mediodía', valor: 18 },
    { name: 'A la tarde', valor: 31 },
    { name: 'Al final de la jornada', valor: 27 },
    { name: 'No sentí tensión', valor: 15 },
  ],
  evolucion: [
    { name: 'Sem 1', energia: 3.4, satisfaccion: 68, participacion: 72 },
    { name: 'Sem 2', energia: 3.7, satisfaccion: 74, participacion: 77 },
    { name: 'Sem 3', energia: 3.9, satisfaccion: 81, participacion: 80 },
    { name: 'Sem 4', energia: 4.1, satisfaccion: 87, participacion: 83 },
  ],
  comentarios: [
    { txt: 'Me ayudó muchísimo a cortar la jornada.', role: 'Administrativo', author: 'María González', fecha: '2026-07-20T14:30:00.000Z' },
    { txt: 'Los ejercicios para cuello me sirvieron.', role: 'Administrativo', author: 'Juan Pérez', fecha: '2026-07-18T11:00:00.000Z' },
    { txt: 'Los viernes se me hace difícil participar.', role: 'Operativo', author: 'Sofía Martínez', fecha: '2026-07-17T16:15:00.000Z' }
  ],
};
const FEELING_TO_SCORE: Record<string, number> = {
  Mal: 1, Regular: 2, Bien: 3, 'Muy bien': 4, Genial: 5,
};

const mapPauseRows = (rows: any[]): PausaGuardada[] => rows.map((row) => ({
  profileId: row.profile_id,
  dia: row.day_label,
  bloque: row.block,
  fecha: row.occurred_at,
  tipo: row.answers?.tipo ?? 'diario',
  energia: row.energy ?? row.answers?.energia,
  dolor: row.has_pain ?? row.answers?.dolor,
  zona: row.pain_zone ?? row.answers?.zona,
  feeling: row.feeling ?? row.answers?.feeling,
  respuestas: {
    feeling: row.feeling ?? row.answers?.feeling,
    energia: row.energy ?? row.answers?.energia,
    dolor: row.has_pain ?? row.answers?.dolor,
    zona: row.pain_zone ?? row.answers?.zona,
    tension: row.answers?.tension ?? row.answers?.estres,
    trabajo: row.answers?.trabajo,
    ayuda: row.answers?.ayuda,
    comentario: row.answers?.comentario ?? row.answers?.mejora,
  },
}));

const nextDayIso = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + 1);
  return date.toISOString();
};

const startDayIso = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const isWithinPeriod = (pause: PausaGuardada, periodFrom?: string, periodTo?: string) => {
  const date = new Date(pause.fecha);
  if (Number.isNaN(date.getTime())) return false;
  const inclusiveStart = periodFrom ? startDayIso(periodFrom) : '';
  if (inclusiveStart && date < new Date(inclusiveStart)) return false;
  const exclusiveEnd = periodTo ? nextDayIso(periodTo) : '';
  if (exclusiveEnd && date >= new Date(exclusiveEnd)) return false;
  return true;
};

const readPausasFromSupabase = async (
  companyId?: string,
  periodFrom?: string,
  periodTo?: string,
  workProfile: AnalyticsWorkProfileFilter = 'ALL',
  allowLegacyFallback = true,
): Promise<PausaGuardada[] | null> => {
  if (!supabase) return null;

  const inclusiveStart = periodFrom ? startDayIso(periodFrom) : '';
  const exclusiveEnd = periodTo ? nextDayIso(periodTo) : '';
  const { data: scopedRows, error: scopedError } = await supabase.rpc('get_analytics_pause_sessions', {
    target_company_id: companyId ?? null,
    target_work_profile: workProfile === 'ALL' ? null : workProfile,
    period_from: inclusiveStart || null,
    period_to: exclusiveEnd || null,
  });

  if (!scopedError && scopedRows) return mapPauseRows(scopedRows as any[]);

  // RR. HH. siempre debe consultar mediante la RPC que fija la empresa desde
  // auth.uid(). Si esa funcion no esta disponible, es preferible no mostrar
  // datos antes que recurrir a una consulta heredada menos estricta.
  if (!allowLegacyFallback) {
    console.error('No se pudo cargar la vista segura de analiticas para RR. HH.', scopedError);
    return null;
  }

  // Compatibilidad mientras una instalacion todavía no aplicó la migración:
  // conserva la consulta anterior y limita por los perfiles reales visibles.
  let profileIds: string[] | null = null;
  if (workProfile !== 'ALL') {
    let profilesQuery = supabase
      .from('profiles')
      .select('id')
      .eq('work_profile', workProfile);
    if (companyId) profilesQuery = profilesQuery.eq('company_id', companyId);
    const { data: profiles, error: profilesError } = await profilesQuery;
    if (profilesError) {
      console.error('No se pudieron identificar los perfiles laborales para las métricas', profilesError);
      return null;
    }
    profileIds = (profiles ?? []).map(profile => profile.id);
    if (profileIds.length === 0) return [];
  }

  let query = supabase
    .from('pause_sessions')
    .select('profile_id, day_label, block, occurred_at, energy, feeling, has_pain, pain_zone, answers')
    .order('occurred_at', { ascending: false });

  if (companyId) query = query.eq('company_id', companyId);
  if (profileIds) query = query.in('profile_id', profileIds);
  if (inclusiveStart) query = query.gte('occurred_at', inclusiveStart);
  if (exclusiveEnd) query = query.lt('occurred_at', exclusiveEnd);

  const { data, error } = await query;

  if (error || !data) {
    console.error('No se pudieron cargar métricas desde Supabase', error);
    return null;
  }

  return mapPauseRows(data);
};

interface EligibleUser {
  id?: string;
  createdAt?: string;
  fullName?: string;
  email?: string;
  workProfile?: string;
  companyId?: string;
}

const readEligibleUsers = async (
  companyId?: string,
  workProfile: AnalyticsWorkProfileFilter = 'ALL',
  periodTo?: string,
): Promise<EligibleUser[] | null> => {
  if (!supabase) return null;
  let query = supabase
    .from('profiles')
    .select('id, created_at, full_name, email, work_profile, company_id')
    .eq('role', 'usuario')
    .or('status.is.null,status.neq.inactive');
  if (companyId) query = query.eq('company_id', companyId);
  if (workProfile !== 'ALL') query = query.eq('work_profile', workProfile);
  if (periodTo) query = query.lt('created_at', nextDayIso(periodTo));
  const { data, error } = await query;
  if (error) {
    console.error('No se pudieron cargar los usuarios asignados para participación', error);
    return null;
  }
  return (data ?? []).map(profile => ({
    id: profile.id ?? undefined,
    createdAt: profile.created_at ?? undefined,
    fullName: profile.full_name ?? undefined,
    email: profile.email ?? undefined,
    workProfile: profile.work_profile ?? undefined,
    companyId: profile.company_id ?? undefined,
  }));
};
const AYUDA_TO_SATISF: Record<string, number> = {
  'Sí, mucho': 90, 'Sí, un poco': 55, No: 15,
};

const readPausasFromStorage = (): PausaGuardada[] => {
  try {
    const all: PausaGuardada[] = JSON.parse(localStorage.getItem('reactiva_pausas') || '[]');
    const map = new Map<string, PausaGuardada>();
    for (const p of all) {
      if (!p?.dia || !p?.bloque) continue;
      const pauseDate = p.fecha ? toDateKey(new Date(p.fecha)) : 'sin-fecha';
      map.set(`${p.profileId ?? 'local'}__${pauseDate}__${p.dia}__${p.bloque}`, p);
    }
    return Array.from(map.values());
  } catch {
    return [];
  }
};

const getCampo = <T,>(p: PausaGuardada, campo: keyof PausaGuardada | keyof NonNullable<PausaGuardada['respuestas']>, fallback?: T): T | undefined => {
  return (p[campo] ?? (p.respuestas as any)?.[campo] ?? fallback) as T | undefined;
};

const toLocalDayStart = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const defaultPeriodRange = () => {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
};

const selectedPeriodRange = (periodFrom?: string, periodTo?: string) => {
  if (periodFrom && periodTo) {
    const start = toLocalDayStart(periodFrom);
    const end = toLocalDayStart(periodTo);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  return defaultPeriodRange();
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const deduplicatePauses = (pausas: PausaGuardada[]) => {
  const unique = new Map<string, PausaGuardada>();
  pausas.forEach((pause) => {
    const date = new Date(pause.fecha);
    if (Number.isNaN(date.getTime())) return;
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const key = `${pause.profileId ?? 'local'}:${dateKey}:${pause.bloque}`;
    const previous = unique.get(key);
    if (!previous || new Date(previous.fecha) < date) unique.set(key, pause);
  });
  return Array.from(unique.values());
};

const scheduledSlotsByDay = (periodFrom?: string, periodTo?: string) => {
  const slots: Record<string, number> = { Lunes: 0, Miércoles: 0, Viernes: 0 };
  if (!periodFrom || !periodTo) {
    DAYS.forEach(day => { slots[day] = 2; });
    return slots;
  }
  const from = new Date(`${periodFrom}T00:00:00`);
  const to = new Date(`${periodTo}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return slots;
  const dayByWeekday: Record<number, string> = { 1: 'Lunes', 3: 'Miércoles', 5: 'Viernes' };
  for (let date = from; date <= to; date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)) {
    const label = dayByWeekday[date.getDay()];
    if (label) slots[label] += 2;
  }
  return slots;
};

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const populationSlotsByDay = (
  eligibleUsers: EligibleUser[] | null | undefined,
  fallbackUsers: number,
  periodFrom?: string,
  periodTo?: string,
) => {
  const base = scheduledSlotsByDay(periodFrom, periodTo);
  if (eligibleUsers == null) {
    return Object.fromEntries(Object.entries(base).map(([day, slots]) => [day, slots * fallbackUsers])) as Record<string, number>;
  }
  return eligibleUsers.reduce<Record<string, number>>((totals, profile) => {
    const joinedAt = profile.createdAt ? new Date(profile.createdAt) : null;
    const joinedKey = joinedAt && !Number.isNaN(joinedAt.getTime()) ? dateKey(joinedAt) : undefined;
    const effectiveFrom = periodFrom && joinedKey && joinedKey > periodFrom ? joinedKey : periodFrom;
    const profileSlots = scheduledSlotsByDay(effectiveFrom, periodTo);
    DAYS.forEach(day => { totals[day] += profileSlots[day]; });
    return totals;
  }, { Lunes: 0, Miércoles: 0, Viernes: 0 });
};

const createEvolutionBuckets = (periodFrom?: string, periodTo?: string) => {
  if (!periodFrom || !periodTo) return [{ name: 'Actual', from: periodFrom, to: periodTo }];
  const start = new Date(`${periodFrom}T00:00:00`);
  const end = new Date(`${periodTo}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [{ name: 'Actual', from: periodFrom, to: periodTo }];
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  if (days <= 9) {
    const dayLabels: Record<number, string> = { 1: 'Lun', 3: 'Mié', 5: 'Vie' };
    const buckets = [];
    for (let date = start; date <= end; date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)) {
      const name = dayLabels[date.getDay()];
      if (name) buckets.push({ name, from: dateKey(date), to: dateKey(date) });
    }
    return buckets;
  }

  const bucketCount = days >= 300 ? 12 : Math.min(8, Math.ceil(days / 7));
  const daysPerBucket = Math.ceil(days / bucketCount);
  return Array.from({ length: bucketCount }, (_, index) => {
    const from = new Date(start);
    from.setDate(from.getDate() + (index * daysPerBucket));
    const to = new Date(from);
    to.setDate(to.getDate() + daysPerBucket - 1);
    if (to > end) to.setTime(end.getTime());
    return {
      name: days >= 300
        ? from.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
        : `Sem ${index + 1}`,
      from: dateKey(from),
      to: dateKey(to),
    };
  }).filter(bucket => bucket.from <= periodTo);
};

const computeStats = (
  rawPauses: PausaGuardada[],
  periodFrom?: string,
  periodTo?: string,
  eligibleUsers?: EligibleUser[] | null,
): AdminStats => {
  const pausas = deduplicatePauses(rawPauses);
  const totalPausas = pausas.length;
  const hayDatos = totalPausas > 0;
  const usuariosUnicos = new Set(pausas.map(p => p.profileId).filter(Boolean));
  const participatingUsers = usuariosUnicos.size > 0 ? usuariosUnicos.size : hayDatos ? 1 : 0;
  const usuariosCount = eligibleUsers == null ? participatingUsers : eligibleUsers.length;
  const slotsByDay = populationSlotsByDay(eligibleUsers, participatingUsers, periodFrom, periodTo);
  const totalObjetivo = Math.max(1, Object.values(slotsByDay).reduce((total, slots) => total + slots, 0));
  const adherencia = Math.min(100, Math.round((totalPausas / totalObjetivo) * 100));

  // Estado físico
  const conDolor = pausas.filter(p => getCampo<boolean>(p, 'dolor'));
  const reportanMolestias = totalPausas === 0 ? 0 : Math.round((conDolor.length / totalPausas) * 100);

  // Zonas más reportadas
  const zonasCount = new Map<string, number>();
  conDolor.forEach(p => {
    const z = getCampo<string>(p, 'zona');
    if (z && z !== 'Otro' && z !== '') zonasCount.set(z, (zonasCount.get(z) ?? 0) + 1);
  });
  const zonasOrdenadas = Array.from(zonasCount.entries()).sort((a, b) => b[1] - a[1]);
  const zonasDolorTop = zonasOrdenadas.slice(0, 3).map(([z]) => z);
  const zonasDolorChart = zonasOrdenadas.length > 0
    ? zonasOrdenadas.map(([name, count]) => ({
        name,
        valor: Math.round((count / Math.max(1, conDolor.length)) * 100),
      }))
    : [];

  // Estado emocional (promedio feeling)
  const feelings = pausas
    .map(p => getCampo<string>(p, 'feeling'))
    .filter((f): f is string => !!f)
    .map(f => FEELING_TO_SCORE[f])
    .filter((n): n is number => typeof n === 'number');
  const estadoEmocional = feelings.length > 0
    ? Math.round((feelings.reduce((a, b) => a + b, 0) / feelings.length) * 10) / 10
    : null;

  // Participación por día
  const participacionPorDia = DAYS.map(dia => {
    const delDia = pausas.filter(p => p.dia === dia);
    const objective = Math.max(1, slotsByDay[dia]);
    const pct = Math.round((delDia.length / objective) * 100);
    return { name: DAYS_SHORT[dia], participacion: Math.min(100, pct) };
  });

  // Foco: del campo trabajo en weekly. Si solo hay 1 respuesta, ese trabajo es 100%.
  const weeklyAnswers = pausas.filter(p => p.tipo === 'semanal-completo' || p.respuestas?.trabajo);
  const focusCounts = { Enfocado: 0, Normal: 0, Disperso: 0 };
  weeklyAnswers.forEach(pause => {
    const value = pause.respuestas?.trabajo;
    if (value === 'Enfocado' || value === 'Normal' || value === 'Disperso') focusCounts[value] += 1;
  });
  const focusTotal = Object.values(focusCounts).reduce((total, count) => total + count, 0);
  const foco = focusTotal
    ? {
        enfocado: Math.round((focusCounts.Enfocado / focusTotal) * 100),
        normal: Math.round((focusCounts.Normal / focusTotal) * 100),
        disperso: Math.round((focusCounts.Disperso / focusTotal) * 100),
      }
    : { enfocado: 0, normal: 0, disperso: 0 };

  // Distribución de Tensión
  const tensionCount = new Map<string, number>();
  let tensionTotal = 0;
  pausas.forEach(p => {
    const t = getCampo<string>(p, 'tension');
    if (t) {
      tensionCount.set(t, (tensionCount.get(t) ?? 0) + 1);
      tensionTotal++;
    }
  });
  
  const opcionesTension = ['A la mañana', 'Al mediodía', 'A la tarde', 'Al final de la jornada', 'No sentí tensión'];
  const tensionDistribucion = tensionTotal > 0 
    ? opcionesTension.map(opt => ({
        name: opt,
        valor: Math.round(((tensionCount.get(opt) ?? 0) / tensionTotal) * 100)
      }))
    : [];

  // Evolución (4 "semanas"). En demo solo hay una semana real, así que llenamos las 4
  // con el dato actual (línea plana). Cuando haya backend con histórico, traer real.
  const energiaPromedio = (() => {
    const arr = pausas
      .map(p => getCampo<number>(p, 'energia'))
      .filter((n): n is number => typeof n === 'number' && n > 0);
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  })();
  const evolucion = createEvolutionBuckets(periodFrom, periodTo).map(bucket => {
    const bucketPauses = pausas.filter(pause => isWithinPeriod(pause, bucket.from, bucket.to));
    const bucketParticipants = new Set(bucketPauses.map(pause => pause.profileId).filter(Boolean)).size || (bucketPauses.length ? 1 : 0);
    const bucketSlots = populationSlotsByDay(eligibleUsers, bucketParticipants, bucket.from, bucket.to);
    const bucketObjective = Math.max(1, Object.values(bucketSlots).reduce((total, slots) => total + slots, 0));
    const energies = bucketPauses
      .map(pause => getCampo<number>(pause, 'energia'))
      .filter((value): value is number => typeof value === 'number' && value > 0);
    const helps = bucketPauses
      .map(pause => pause.respuestas?.ayuda)
      .filter((value): value is string => typeof value === 'string' && value in AYUDA_TO_SATISF)
      .map(value => AYUDA_TO_SATISF[value]);
    return {
      name: bucket.name,
      energia: energies.length ? Math.round((energies.reduce((sum, value) => sum + value, 0) / energies.length) * 10) / 10 : 0,
      satisfaccion: helps.length ? Math.round(helps.reduce((sum, value) => sum + value, 0) / helps.length) : 0,
      participacion: Math.min(100, Math.round((bucketPauses.length / bucketObjective) * 100)),
    };
  });

  const eligibleUserById = new Map((eligibleUsers ?? []).filter(user => user.id).map(user => [user.id as string, user]));
  const comentarios = [...pausas]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .filter(p => !!getCampo(p, 'comentario') && String(getCampo(p, 'comentario')).length > 3)
    .map(p => {
      const profile = p.profileId ? eligibleUserById.get(p.profileId) : undefined;
      const profileWork = profile?.workProfile ?? p.workProfile;
      const email = profile?.email;
      return {
        txt: String(getCampo(p, 'comentario')),
        role: profileWork === 'ADMINISTRATIVO' ? 'Administrativo' : profileWork === 'OPERATIVO' ? 'Operativo' : 'Sin perfil asignado',
        author: profile?.fullName?.trim() || email?.split('@')[0] || 'Usuario sin nombre',
        email,
        companyId: profile?.companyId,
        fecha: p.fecha,
        energia: getCampo<number>(p, 'energia'),
        feeling: getCampo<string>(p, 'feeling'),
        hasPain: getCampo<boolean>(p, 'dolor'),
        painZone: getCampo<string>(p, 'zona'),
      };
    });

  return {
    hayDatos,
    usuariosCount,
    totalPausas,
    adherencia,
    reportanMolestias,
    zonasDolorTop,
    estadoEmocional,
    energiaPromedio,
    participacionPorDia,
    foco,
    zonasDolorChart,
    tensionDistribucion,
    evolucion,
    comentarios,
  };
};

export function useAdminStats(
  companyId?: string,
  periodFrom?: string,
  periodTo?: string,
  workProfile: AnalyticsWorkProfileFilter = 'ALL',
): AdminStats {
  const { user } = useAuth();
  const isDemo = !!user?.isDemo;
  const requestedRange = selectedPeriodRange(periodFrom, periodTo);
  const requestedPeriodFrom = periodFrom || toDateKey(requestedRange.start);
  const requestedPeriodTo = periodTo || toDateKey(requestedRange.end);
  const effectivePeriodFrom = requestedPeriodFrom;
  const effectivePeriodTo = requestedPeriodTo;
  const filteredLocalPauses = () => readPausasFromStorage().filter(pause => (
    isWithinPeriod(pause, effectivePeriodFrom, effectivePeriodTo)
    && (workProfile === 'ALL' || pause.workProfile === workProfile)
  ));
  const [stats, setStats] = useState<AdminStats>(() => isDemo ? DEMO_STATS : computeStats(supabase ? [] : filteredLocalPauses(), effectivePeriodFrom, effectivePeriodTo));

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      if (isDemo) {
        setStats(DEMO_STATS);
        return;
      }
      setStats(computeStats(supabase ? [] : filteredLocalPauses(), effectivePeriodFrom, effectivePeriodTo));
      Promise.all([
        readPausasFromSupabase(companyId, effectivePeriodFrom, effectivePeriodTo, workProfile, user?.role !== 'rrhh'),
        readEligibleUsers(companyId, workProfile, effectivePeriodTo),
      ]).then(([pausas, eligibleUsers]) => {
        if (mounted && pausas) setStats(computeStats(pausas, effectivePeriodFrom, effectivePeriodTo, eligibleUsers));
      });
    };
    refresh();
    window.addEventListener('reactiva-pausas-updated', refresh);
    window.addEventListener('storage', refresh);
    const channel = supabase && !isDemo
      ? supabase
          .channel(`admin-stats-${companyId ?? 'all'}-${workProfile}-${periodFrom ?? 'start'}-${periodTo ?? 'end'}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'pause_sessions',
            ...(companyId ? { filter: `company_id=eq.${companyId}` } : {}),
          }, refresh)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'profiles',
            ...(companyId ? { filter: `company_id=eq.${companyId}` } : {}),
          }, refresh)
          .subscribe()
      : null;
    return () => {
      mounted = false;
      window.removeEventListener('reactiva-pausas-updated', refresh);
      window.removeEventListener('storage', refresh);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [companyId, effectivePeriodFrom, effectivePeriodTo, isDemo, user?.role, workProfile]);

  return stats;
}

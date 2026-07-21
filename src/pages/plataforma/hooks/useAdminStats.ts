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
  comentarios: { txt: string; role: string }[];
}

const DAYS = ['Lunes', 'Miércoles', 'Viernes'];
const DAYS_SHORT: Record<string, string> = { Lunes: 'Lun', Miércoles: 'Mié', Viernes: 'Vie' };

const ANALYTICS_REAL_START_DATE = '2026-07-20';

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
    { txt: 'Me ayudó muchísimo a cortar la jornada.', role: 'Administrativo' },
    { txt: 'Los ejercicios para cuello me sirvieron.', role: 'Administrativo' },
    { txt: 'Los viernes se me hace difícil participar.', role: 'Operativo' }
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

const clampAnalyticsStart = (periodFrom?: string) => {
  if (!periodFrom) return ANALYTICS_REAL_START_DATE;
  return periodFrom < ANALYTICS_REAL_START_DATE ? ANALYTICS_REAL_START_DATE : periodFrom;
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

const readEligibleUserCountFromSupabase = async (
  companyId?: string,
  workProfile: AnalyticsWorkProfileFilter = 'ALL',
): Promise<number | null> => {
  if (!supabase) return null;

  let query = supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'usuario')
    .or('status.is.null,status.neq.inactive');

  if (companyId) query = query.eq('company_id', companyId);
  if (workProfile !== 'ALL') query = query.eq('work_profile', workProfile);

  const { count, error } = await query;
  if (error) {
    console.error('No se pudo calcular la cantidad de usuarios esperados para métricas', error);
    return null;
  }
  return count ?? 0;
};
const AYUDA_TO_SATISF: Record<string, number> = {
  'Sí, mucho': 90, 'Sí, un poco': 55, No: 15,
};

const readPausasFromStorage = (): PausaGuardada[] => {
  try {
    const all: PausaGuardada[] = JSON.parse(localStorage.getItem('reactiva_pausas') || '[]');
    const map = new Map<string, PausaGuardada>();
    for (const p of all) {
      if (p?.dia && p?.bloque) map.set(`${p.dia}__${p.bloque}`, p);
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

const countProgramBlocksInRange = (start: Date, end: Date) => {
  let count = 0;
  const cursor = toLocalDayStart(start);
  const final = toLocalDayStart(end);
  while (cursor <= final) {
    const day = cursor.getDay();
    if (day === 1 || day === 3 || day === 5) count += 2;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
};

const average = (values: number[]) => values.length
  ? values.reduce((acc, value) => acc + value, 0) / values.length
  : 0;

const evolutionLabelsForPeriod = (periodFrom?: string, periodTo?: string) => {
  if (!periodFrom || !periodTo) return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const start = new Date(`${periodFrom}T00:00:00.000Z`);
  const end = new Date(`${periodTo}T00:00:00.000Z`);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);
  if (days <= 9) return ['Inicio', 'Mitad', 'Cierre'];
  if (days <= 45) return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  if (days >= 300) return ['T1', 'T2', 'T3', 'T4'];
  return ['Inicio', 'Periodo 2', 'Periodo 3', 'Cierre'];
};

const buildEvolution = (
  pausas: PausaGuardada[],
  labels: string[],
  periodFrom?: string,
  periodTo?: string,
  expectedUsers = 1,
) => {
  const { start, end } = selectedPeriodRange(periodFrom, periodTo);
  const totalMs = Math.max(1, end.getTime() - start.getTime() + 1);

  return labels.map((name, index) => {
    const bucketStart = new Date(start.getTime() + Math.floor((totalMs * index) / labels.length));
    const bucketEnd = new Date(start.getTime() + Math.floor((totalMs * (index + 1)) / labels.length) - 1);
    bucketStart.setHours(0, 0, 0, 0);
    bucketEnd.setHours(23, 59, 59, 999);

    const bucketPausas = pausas.filter((pause) => {
      const date = new Date(pause.fecha);
      return !Number.isNaN(date.getTime()) && date >= bucketStart && date <= bucketEnd;
    });
    const expectedBlocks = Math.max(1, countProgramBlocksInRange(bucketStart, bucketEnd) * Math.max(1, expectedUsers));
    const energyValues = bucketPausas
      .map(p => getCampo<number>(p, 'energia'))
      .filter((n): n is number => typeof n === 'number' && n > 0);
    const satisfactionValues = bucketPausas
      .map(p => {
        const ayuda = p.respuestas?.ayuda;
        return ayuda ? AYUDA_TO_SATISF[ayuda] : undefined;
      })
      .filter((n): n is number => typeof n === 'number');

    return {
      name,
      energia: Math.round(average(energyValues) * 10) / 10,
      satisfaccion: Math.round(average(satisfactionValues)),
      participacion: Math.min(100, Math.round((bucketPausas.length / expectedBlocks) * 100)),
    };
  });
};

const computeStats = (pausas: PausaGuardada[], periodFrom?: string, periodTo?: string, expectedUsersOverride?: number | null): AdminStats => {
  const totalPausas = pausas.length;
  const hayDatos = totalPausas > 0;
  const usuariosUnicos = new Set(pausas.map(p => p.profileId).filter(Boolean));
  const usuariosCount = expectedUsersOverride ?? (usuariosUnicos.size > 0 ? usuariosUnicos.size : hayDatos ? 1 : 0);
  const { start, end } = selectedPeriodRange(periodFrom, periodTo);
  const totalObjetivo = Math.max(1, countProgramBlocksInRange(start, end) * Math.max(1, usuariosCount));
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
    const pct = Math.round((delDia.length / 2) * 100); // 2 bloques por día
    return { name: DAYS_SHORT[dia], participacion: Math.min(100, pct) };
  });

  // Foco: del campo trabajo en weekly. Si solo hay 1 respuesta, ese trabajo es 100%.
  const semanal = pausas.find(p => p.tipo === 'semanal-completo');
  const trabajo = semanal?.respuestas?.trabajo;
  let foco = { enfocado: 0, normal: 0, disperso: 0 };
  if (trabajo === 'Enfocado') foco = { enfocado: 100, normal: 0, disperso: 0 };
  else if (trabajo === 'Normal') foco = { enfocado: 0, normal: 100, disperso: 0 };
  else if (trabajo === 'Disperso') foco = { enfocado: 0, normal: 0, disperso: 100 };

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
  const evolucion = buildEvolution(pausas, evolutionLabelsForPeriod(periodFrom, periodTo), periodFrom, periodTo, usuariosCount || 1);

  const comentarios = pausas
    .filter(p => !!getCampo(p, 'comentario') && String(getCampo(p, 'comentario')).length > 3)
    .map(p => ({
      txt: String(getCampo(p, 'comentario')),
      role: p.workProfile === 'ADMINISTRATIVO' ? 'Administrativo' : p.workProfile === 'OPERATIVO' ? 'Operativo' : 'Colaborador',
    }))
    .reverse();

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
  const effectivePeriodFrom = clampAnalyticsStart(requestedPeriodFrom);
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
        readEligibleUserCountFromSupabase(companyId, workProfile),
      ]).then(([pausas, expectedUsers]) => {
        if (mounted && pausas) setStats(computeStats(pausas, effectivePeriodFrom, effectivePeriodTo, expectedUsers));
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

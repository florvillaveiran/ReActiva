import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook de métricas para las vistas de Admin (Dashboard / Analíticas).
 *
 * Supabase es la fuente principal: consulta `pause_sessions`, filtra por empresa
 * y periodo, y se actualiza por Realtime. El almacenamiento local solo se usa
 * cuando Supabase no esta configurado, para conservar el modo de demostracion.
 */

interface PausaGuardada {
  profileId?: string;
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
}

const DAYS = ['Lunes', 'Miércoles', 'Viernes'];
const DAYS_SHORT: Record<string, string> = { Lunes: 'Lun', Miércoles: 'Mié', Viernes: 'Vie' };
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

const readPausasFromSupabase = async (companyId?: string, periodFrom?: string, periodTo?: string): Promise<PausaGuardada[] | null> => {
  if (!supabase) return null;

  let query = supabase
    .from('pause_sessions')
    .select('profile_id, day_label, block, occurred_at, energy, feeling, has_pain, pain_zone, answers')
    .order('occurred_at', { ascending: false });

  if (companyId) query = query.eq('company_id', companyId);
  const inclusiveStart = periodFrom ? startDayIso(periodFrom) : '';
  if (inclusiveStart) query = query.gte('occurred_at', inclusiveStart);
  const exclusiveEnd = periodTo ? nextDayIso(periodTo) : '';
  if (exclusiveEnd) query = query.lt('occurred_at', exclusiveEnd);

  const { data, error } = await query;

  if (error || !data) {
    console.error('No se pudieron cargar métricas desde Supabase', error);
    return null;
  }

  return mapPauseRows(data);
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

const computeStats = (pausas: PausaGuardada[], periodFrom?: string, periodTo?: string): AdminStats => {
  const totalPausas = pausas.length;
  const totalObjetivo = DAYS.length * 2;
  const hayDatos = totalPausas > 0;
  const usuariosUnicos = new Set(pausas.map(p => p.profileId).filter(Boolean));
  const usuariosCount = usuariosUnicos.size > 0 ? usuariosUnicos.size : hayDatos ? 1 : 0;
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
  const satisfaccion = semanal?.respuestas?.ayuda
    ? AYUDA_TO_SATISF[semanal.respuestas.ayuda] ?? 0
    : 0;
  const participacionGeneral = adherencia;

  const evolucion = evolutionLabelsForPeriod(periodFrom, periodTo).map(name => ({
    name,
    energia: Math.round(energiaPromedio * 10) / 10,
    satisfaccion,
    participacion: participacionGeneral,
  }));

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
  };
};

export function useAdminStats(companyId?: string, periodFrom?: string, periodTo?: string): AdminStats {
  const filteredLocalPauses = () => readPausasFromStorage().filter(pause => isWithinPeriod(pause, periodFrom, periodTo));
  const [stats, setStats] = useState<AdminStats>(() => computeStats(supabase ? [] : filteredLocalPauses(), periodFrom, periodTo));

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      setStats(computeStats(supabase ? [] : filteredLocalPauses(), periodFrom, periodTo));
      readPausasFromSupabase(companyId, periodFrom, periodTo).then((pausas) => {
        if (mounted && pausas) setStats(computeStats(pausas, periodFrom, periodTo));
      });
    };
    refresh();
    window.addEventListener('reactiva-pausas-updated', refresh);
    window.addEventListener('storage', refresh);
    const channel = supabase
      ? supabase
          .channel(`admin-stats-${companyId ?? 'all'}-${periodFrom ?? 'start'}-${periodTo ?? 'end'}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'pause_sessions',
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
  }, [companyId, periodFrom, periodTo]);

  return stats;
}

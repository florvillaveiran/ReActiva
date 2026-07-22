import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface PausaGuardada {
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

export interface PausasStats {
  totalPausas: number;
  totalObjetivo: number;
  diasActivos: number;
  adherencia: number;
  energiaPorDia: { dia: string; valor: number | null }[];
  energiaPromedio: number | null;
  focoPorDia: { dia: string; valor: number | null }[];
  focoPromedio: number | null;
  diasConDolor: number;
  zonasDolor: string[];
  impactoPercibido: number | null;
  impactoTexto: string;
  momentoTensionPredominante: string | null;
  tieneSemanal: boolean;
  mensajeParaTi: string;
  hayDatos: boolean;
}

export type PausasPeriod = 'semanal' | 'mensual';

const DAYS = ['Lunes', 'Miércoles', 'Viernes'];
const DAYS_SHORT: Record<string, string> = { Lunes: 'Lun', Miércoles: 'Mié', Viernes: 'Vie' };
const FEELING_TO_SCORE: Record<string, number> = {
  'Mal': 1, 'Regular': 2, 'Bien': 3, 'Muy bien': 4, 'Genial': 5,
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

const getPeriodRange = (period: PausasPeriod, now = new Date()) => {
  if (period === 'mensual') {
    return {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }

  const from = startOfDay(now);
  const day = from.getDay();
  from.setDate(from.getDate() - (day === 0 ? 6 : day - 1));
  const to = endOfDay(new Date(from));
  to.setDate(to.getDate() + 6);
  return { from, to };
};

const validDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const deduplicateAndFilter = (
  pausas: PausaGuardada[],
  period: PausasPeriod,
  now = new Date(),
) => {
  const { from, to } = getPeriodRange(period, now);
  const map = new Map<string, PausaGuardada>();

  for (const pausa of pausas) {
    const date = validDate(pausa.fecha);
    if (!date || date < from || date > to) continue;
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const key = `${dateKey}__${pausa.bloque}`;
    const previous = map.get(key);
    if (!previous || new Date(previous.fecha) < date) map.set(key, pausa);
  }

  return Array.from(map.values()).sort(
    (left, right) => new Date(right.fecha).getTime() - new Date(left.fecha).getTime(),
  );
};

const readPausas = (period: PausasPeriod, email?: string): PausaGuardada[] => {
  try {
    const key = email ? `reactiva_pausas:${email.trim().toLowerCase()}` : 'reactiva_pausas';
    const all: PausaGuardada[] = JSON.parse(localStorage.getItem(key) || '[]');
    return deduplicateAndFilter(all, period);
  } catch {
    return [];
  }
};

const readPausasFromSupabase = async (period: PausasPeriod): Promise<PausaGuardada[] | null> => {
  if (!supabase) return null;

  const { from, to } = getPeriodRange(period);

  const { data, error } = await supabase
    .from('pause_sessions')
    .select('day_label, block, occurred_at, energy, feeling, has_pain, pain_zone, answers')
    .gte('occurred_at', from.toISOString())
    .lte('occurred_at', to.toISOString())
    .order('occurred_at', { ascending: false });

  if (error || !data) {
    console.error('No se pudieron cargar pausas desde Supabase', error);
    return null;
  }

  return deduplicateAndFilter(data.map((row: any) => ({
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
  })), period);
};

const avg = (nums: number[]): number | null => {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const getMonthlyBuckets = (now = new Date()) => {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Array.from({ length: Math.ceil(lastDay / 7) }, (_, index) => ({
    label: `Sem ${index + 1}`,
    fromDay: (index * 7) + 1,
    toDay: Math.min((index + 1) * 7, lastDay),
  }));
};

const expectedSessions = (period: PausasPeriod, now = new Date()) => {
  if (period === 'semanal') return DAYS.length * 2;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let scheduledDays = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const weekday = new Date(now.getFullYear(), now.getMonth(), day).getDay();
    if (weekday === 1 || weekday === 3 || weekday === 5) scheduledDays += 1;
  }
  return scheduledDays * 2;
};

const computeStats = (pausas: PausaGuardada[], period: PausasPeriod): PausasStats => {
  const totalPausas = pausas.length;
  const totalObjetivo = expectedSessions(period);

  const diasUnicos = new Set(pausas.map(p => {
    const date = validDate(p.fecha);
    return date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : p.dia;
  }));
  const diasActivos = diasUnicos.size;
  const adherencia = Math.min(100, Math.round((totalPausas / totalObjetivo) * 100));

  const chartGroups = period === 'semanal'
    ? DAYS.map(dia => ({ label: DAYS_SHORT[dia], matches: (p: PausaGuardada) => p.dia === dia }))
    : getMonthlyBuckets().map(bucket => ({
        label: bucket.label,
        matches: (p: PausaGuardada) => {
          const date = validDate(p.fecha);
          return !!date && date.getDate() >= bucket.fromDay && date.getDate() <= bucket.toDay;
        },
      }));

  // Energía por día o semana — promedio de las respuestas del período.
  const energiaPorDia = chartGroups.map(group => {
    const pausasDelDia = pausas.filter(group.matches);
    const valores: number[] = pausasDelDia
      .map(p => p.energia ?? p.respuestas?.energia)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    return { dia: group.label, valor: avg(valores) };
  });
  const energiaPromedio = avg(energiaPorDia.map(e => e.valor).filter((v): v is number => v !== null));

  // Foco por día — derivado del feeling (1-5)
  const focoPorDia = chartGroups.map(group => {
    const pausasDelDia = pausas.filter(group.matches);
    const valores: number[] = pausasDelDia
      .map(p => p.feeling ?? p.respuestas?.feeling)
      .filter((v): v is string => !!v)
      .map(f => FEELING_TO_SCORE[f])
      .filter((v): v is number => typeof v === 'number');
    return { dia: group.label, valor: avg(valores) };
  });
  const focoPromedio = avg(focoPorDia.map(f => f.valor).filter((v): v is number => v !== null));

  // Molestias físicas — días con dolor + zonas únicas
  const diasConDolorSet = new Set<string>();
  const zonasSet = new Set<string>();
  pausas.forEach(p => {
    const dolor = p.dolor ?? p.respuestas?.dolor;
    const zona = p.zona ?? p.respuestas?.zona;
    if (dolor) {
      diasConDolorSet.add(p.dia);
      if (zona && zona !== '' && zona !== 'Otro') zonasSet.add(zona);
    }
  });

  // Impacto percibido — del formulario semanal (ayuda)
  const semanal = pausas.find(p => p.tipo === 'semanal-completo');
  const tieneSemanal = !!semanal;
  let impactoPercibido: number | null = null;
  let impactoTexto = 'Completá el formulario del viernes para ver tu impacto percibido.';
  let momentoTensionPredominante: string | null = null;
  
  if (semanal?.respuestas) {
    if (semanal.respuestas.ayuda) {
      const ayuda = semanal.respuestas.ayuda;
      if (ayuda === 'Sí, mucho') {
        impactoPercibido = 90;
        impactoTexto = 'Sentís que las pausas te están ayudando mucho a liberar tensión diaria.';
      } else if (ayuda === 'Sí, un poco') {
        impactoPercibido = 55;
        impactoTexto = 'Sentís que las pausas te ayudaron un poco esta semana.';
      } else if (ayuda === 'No') {
        impactoPercibido = 15;
        impactoTexto = 'Esta semana no notaste mucha ayuda. Probemos ajustar el programa.';
      }
    }
    if (semanal.respuestas.tension) {
      momentoTensionPredominante = semanal.respuestas.tension;
    }
  }

  // Mensaje "Para ti"
  let mensajeParaTi = '"Cada pausa cuenta. Empezá con la primera y construí el hábito día a día."';
  if (totalPausas > 0) {
    if (energiaPromedio && energiaPromedio >= 4) {
      mensajeParaTi = '"Tu constancia está mejorando 🙌 Notamos que tu energía promedio está alta. ¡Seguí así, tu cuerpo te lo agradece!"';
    } else if (adherencia >= 80) {
      mensajeParaTi = '"¡Excelente adherencia! Estás aprovechando al máximo el programa. Seguí con la racha."';
    } else if (totalPausas >= 3) {
      mensajeParaTi = '"Vas bien encaminado. Tratá de mantener la regularidad para sentir aún más los beneficios."';
    } else {
      mensajeParaTi = '"Buen comienzo. Cuantas más pausas hagas, antes vas a notar la diferencia en tu cuerpo."';
    }
  }

  return {
    totalPausas,
    totalObjetivo,
    diasActivos,
    adherencia,
    energiaPorDia,
    energiaPromedio,
    focoPorDia,
    focoPromedio,
    diasConDolor: diasConDolorSet.size,
    zonasDolor: Array.from(zonasSet),
    impactoPercibido,
    impactoTexto,
    momentoTensionPredominante,
    tieneSemanal,
    mensajeParaTi,
    hayDatos: totalPausas > 0,
  };
};

export function usePausasStats(period: PausasPeriod = 'semanal'): PausasStats {
  const { user } = useAuth();
  const isDemo = !!user?.isDemo;
  const [stats, setStats] = useState<PausasStats>(() => computeStats(
    isDemo || !supabase ? readPausas(period, user?.email) : [],
    period,
  ));

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      setStats(computeStats(isDemo || !supabase ? readPausas(period, user?.email) : [], period));
      if (isDemo) return;
      readPausasFromSupabase(period).then((pausas) => {
        if (mounted && pausas) setStats(computeStats(pausas, period));
      });
    };
    refresh();
    window.addEventListener('reactiva-pausas-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('reactiva-pausas-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [isDemo, period, user?.email]);

  return stats;
}

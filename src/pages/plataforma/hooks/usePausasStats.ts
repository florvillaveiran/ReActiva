import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

const DAYS = ['Lunes', 'Miércoles', 'Viernes'];
const DAYS_SHORT: Record<string, string> = { Lunes: 'Lun', Miércoles: 'Mié', Viernes: 'Vie' };
const FEELING_TO_SCORE: Record<string, number> = {
  'Mal': 1, 'Regular': 2, 'Bien': 3, 'Muy bien': 4, 'Genial': 5,
};

const readPausas = (): PausaGuardada[] => {
  try {
    const all: PausaGuardada[] = JSON.parse(localStorage.getItem('reactiva_pausas') || '[]');
    // Deduplicar por (dia, bloque) — quedarse con la más reciente
    const map = new Map<string, PausaGuardada>();
    for (const p of all) {
      map.set(`${p.dia}__${p.bloque}`, p);
    }
    return Array.from(map.values());
  } catch {
    return [];
  }
};

const readPausasFromSupabase = async (): Promise<PausaGuardada[] | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('pause_sessions')
    .select('day_label, block, occurred_at, energy, feeling, has_pain, pain_zone, answers')
    .order('occurred_at', { ascending: false });

  if (error || !data) {
    console.error('No se pudieron cargar pausas desde Supabase', error);
    return null;
  }

  return data.map((row: any) => ({
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
};

const avg = (nums: number[]): number | null => {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const computeStats = (pausas: PausaGuardada[]): PausasStats => {
  const totalPausas = pausas.length;
  const totalObjetivo = DAYS.length * 2;
  const adherencia = Math.round((totalPausas / totalObjetivo) * 100);

  const diasUnicos = new Set(pausas.map(p => p.dia));
  const diasActivos = diasUnicos.size;

  // Energía por día — promedio (cada pausa puede tener energia, o respuestas.energia para semanal)
  const energiaPorDia = DAYS.map(dia => {
    const pausasDelDia = pausas.filter(p => p.dia === dia);
    const valores: number[] = pausasDelDia
      .map(p => p.energia ?? p.respuestas?.energia)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    return { dia: DAYS_SHORT[dia], valor: avg(valores) };
  });
  const energiaPromedio = avg(energiaPorDia.map(e => e.valor).filter((v): v is number => v !== null));

  // Foco por día — derivado del feeling (1-5)
  const focoPorDia = DAYS.map(dia => {
    const pausasDelDia = pausas.filter(p => p.dia === dia);
    const valores: number[] = pausasDelDia
      .map(p => p.feeling ?? p.respuestas?.feeling)
      .filter((v): v is string => !!v)
      .map(f => FEELING_TO_SCORE[f])
      .filter((v): v is number => typeof v === 'number');
    return { dia: DAYS_SHORT[dia], valor: avg(valores) };
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

export function usePausasStats(): PausasStats {
  const [stats, setStats] = useState<PausasStats>(() => computeStats(readPausas()));

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      setStats(computeStats(readPausas()));
      readPausasFromSupabase().then((pausas) => {
        if (mounted && pausas) setStats(computeStats(pausas));
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
  }, []);

  return stats;
}

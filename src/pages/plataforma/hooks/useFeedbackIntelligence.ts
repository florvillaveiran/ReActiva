import { useEffect, useMemo, useState } from 'react';
import { getDB } from '../mock/data';
import { supabase } from '../lib/supabase';

type FeedbackKind = 'Felicitación' | 'Sugerencia' | 'Problema' | 'Contenido' | 'Plataforma' | 'Horarios' | 'Academia' | 'ReActiva Coach' | 'General';

export interface FeedbackComment {
  id: string;
  empresa: string;
  area: string;
  fecha: string;
  tipo: 'Felicitación' | 'Sugerencia' | 'Problema' | 'General';
  categoria: FeedbackKind;
  comentario: string;
  score: number;
  destacado: boolean;
}

export interface FeedbackIntelligence {
  comments: FeedbackComment[];
  summary: {
    valued: string[];
    requested: string[];
    issues: string[];
  };
  trends: { tema: string; count: number; text: string; action: string }[];
  stats: {
    thisMonth: number;
    previousMonth: number;
    delta: number;
    lastDate: string;
    felicitaciones: number;
    sugerencias: number;
    problemas: number;
    sinClasificar: number;
  };
}

const POSITIVE = ['excelente', 'genial', 'me gusto', 'me gustó', 'sirvio', 'sirvió', 'bueno', 'facil', 'fácil', 'practico', 'práctico', 'valoro', 'ayudo', 'ayudó'];
const SUGGESTION = ['me gustaria', 'me gustaría', 'podrian', 'podrían', 'sumar', 'agregar', 'mas ', 'más ', 'nuevo', 'taller', 'recomiendo', 'seria bueno', 'sería bueno'];
const PROBLEM = ['problema', 'no pude', 'fallo', 'falló', 'dificil', 'difícil', 'molesto', 'dolor', 'horario', 'corto', 'lento', 'error', 'no carga'];

const CATEGORIES: { kind: FeedbackKind; words: string[] }[] = [
  { kind: 'Contenido', words: ['video', 'videos', 'ejercicio', 'ejercicios', 'pausa', 'pausas', 'respiracion', 'respiración', 'movilidad', 'fuerza', 'cuello', 'cervical'] },
  { kind: 'Plataforma', words: ['plataforma', 'app', 'carga', 'login', 'boton', 'botón', 'acceso', 'pantalla'] },
  { kind: 'Horarios', words: ['horario', 'hora', 'viernes', 'mañana', 'manana', 'tarde', 'mediodia', 'mediodía'] },
  { kind: 'Academia', words: ['academia', 'curso', 'taller', 'capacitacion', 'capacitación'] },
  { kind: 'ReActiva Coach', words: ['coach', 'tip', 'tips', 'consejo', 'recomendacion', 'recomendación'] },
];

const TOPICS = [
  { key: 'cuello', label: 'cuello', action: 'Crear nuevo taller de cervicales.' },
  { key: 'cervical', label: 'cervicales', action: 'Crear nuevo taller de cervicales.' },
  { key: 'respir', label: 'respiración', action: 'Agregar más pausas de respiración.' },
  { key: 'fuerza', label: 'fuerza', action: 'Sumar microentrenamientos de fuerza de baja intensidad.' },
  { key: 'horario', label: 'horario', action: 'Revisar horarios de publicación y recordatorios.' },
  { key: 'viernes', label: 'viernes', action: 'Revisar horario de viernes.' },
  { key: 'video', label: 'videos', action: 'Auditar videos mencionados y actualizar los que generen fricción.' },
  { key: 'movilidad', label: 'movilidad', action: 'Agregar más pausas de movilidad articular.' },
  { key: 'accesibilidad', label: 'accesibilidad', action: 'Revisar contraste, tamaños y navegación de la plataforma.' },
];

const AREAS = ['Operaciones', 'Administración', 'Comercial', 'RRHH', 'Tecnología', 'Atención al cliente'];

const DEMO_COMMENTS = [
  'Me gustó mucho la duración de los microentrenamientos, son fáciles de hacer entre reuniones.',
  'Sería bueno sumar más ejercicios para cuello y cervicales.',
  'Los ejercicios de respiración me ayudaron a bajar la tensión al final de la jornada.',
  'El horario del viernes a veces se me complica, lo movería un poco más temprano.',
  'Me gustaría tener más pausas de movilidad para espalda y hombros.',
  'El video de respiración es excelente, claro y muy práctico.',
  'Tuve problema para cargar un video desde la plataforma.',
  'Podrían agregar un taller corto de fuerza para quienes pasan mucho tiempo sentados.',
  'ReActiva Coach me dio recomendaciones útiles para organizar mis pausas.',
  'La academia podría tener más talleres de ergonomía y postura.',
  'Me encantó que las pausas sean cortas y no corten el ritmo de trabajo.',
  'Necesito más opciones para dolor de cuello después de muchas horas de pantalla.',
  'A veces el recordatorio llega en un horario que no coincide con mi agenda.',
  'La plataforma es fácil de usar y encuentro rápido lo que necesito.',
  'Me gustaría más contenido de respiración para días de mucho estrés.',
  'Detecté un problema de accesibilidad en algunos textos chicos.',
];

const includesAny = (text: string, words: string[]) => words.some(word => text.includes(word));

const classify = (comment: string): { tipo: FeedbackComment['tipo']; categoria: FeedbackKind; score: number } => {
  const text = comment.toLowerCase();
  const categoria = CATEGORIES.find(group => includesAny(text, group.words))?.kind ?? 'General';
  const positive = includesAny(text, POSITIVE);
  const suggestion = includesAny(text, SUGGESTION);
  const problem = includesAny(text, PROBLEM);

  if (problem) return { tipo: 'Problema', categoria: categoria === 'General' ? 'General' : categoria, score: 86 };
  if (suggestion) return { tipo: 'Sugerencia', categoria, score: 76 };
  if (positive) return { tipo: 'Felicitación', categoria, score: 72 };
  return { tipo: 'General', categoria, score: 35 };
};

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const createDemoFeedback = (): FeedbackComment[] => {
  const now = new Date();
  return Array.from({ length: 184 }, (_, index) => {
    const dayOffset = index < 161 ? index % 27 : 32 + (index % 25);
    const fecha = new Date(now);
    fecha.setDate(now.getDate() - dayOffset);
    const comentario = DEMO_COMMENTS[index % DEMO_COMMENTS.length];
    const classified = classify(comentario);
    return {
      id: `demo-feedback-${index}`,
      empresa: ['Empresa Alpha', 'Empresa Beta', 'Empresa Gamma'][index % 3],
      area: AREAS[index % AREAS.length],
      fecha: fecha.toISOString(),
      comentario,
      ...classified,
      destacado: classified.score >= 76 || index % 13 === 0,
    };
  });
};

const readStoredFeedback = (): FeedbackComment[] => {
  const db = getDB();
  const empresasById = new Map(db.empresas.map(empresa => [empresa.id, empresa.nombre]));
  const usersById = new Map(db.usuarios.map(usuario => [usuario.id, usuario]));
  const comments: FeedbackComment[] = [];

  db.formularios.forEach((form, index) => {
    if (!form.comentario?.trim()) return;
    const user = usersById.get(form.usuario_id);
    const classified = classify(form.comentario);
    comments.push({
      id: `form-${form.usuario_id}-${form.fecha}-${index}`,
      empresa: user ? empresasById.get(user.empresa_id) ?? 'Sin empresa' : 'Sin empresa',
      area: user?.onboardingData?.area ?? AREAS[index % AREAS.length],
      fecha: form.fecha,
      comentario: form.comentario.trim(),
      ...classified,
      destacado: classified.score >= 76,
    });
  });

  try {
    const pausas = JSON.parse(localStorage.getItem('reactiva_pausas') || '[]') as any[];
    const demoUser = db.usuarios[0];
    pausas.forEach((pause, index) => {
      const comentario = pause?.respuestas?.comentario;
      if (!comentario?.trim()) return;
      const classified = classify(comentario);
      comments.push({
        id: `pause-${pause.fecha ?? index}`,
        empresa: demoUser ? empresasById.get(demoUser.empresa_id) ?? 'Empresa demo' : 'Empresa demo',
        area: demoUser?.onboardingData?.area ?? 'Demo usuario',
        fecha: pause.fecha ?? new Date().toISOString(),
        comentario: comentario.trim(),
        ...classified,
        destacado: classified.score >= 76,
      });
    });
  } catch {
    // En demo, si el storage esta corrupto, simplemente se ignora.
  }

  return comments.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

const readSupabaseFeedback = async (): Promise<FeedbackComment[] | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('feedback_items')
    .select('id, area, comment, kind, category, sentiment_score, highlighted, created_at, companies(name)')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('No se pudo cargar feedback desde Supabase', error);
    return null;
  }

  return data
    .filter((item: any) => item.comment?.trim())
    .map((item: any) => {
      const classified = classify(item.comment);
      return {
        id: item.id,
        empresa: item.companies?.name ?? 'Sin empresa',
        area: item.area ?? 'General',
        fecha: item.created_at,
        comentario: item.comment.trim(),
        tipo: item.kind ?? classified.tipo,
        categoria: item.category ?? classified.categoria,
        score: item.sentiment_score ?? classified.score,
        destacado: item.highlighted ?? classified.score >= 76,
      };
    });
};

const topMentions = (comments: FeedbackComment[], options: { keys: string[]; fallback: string[] }) => {
  const text = comments.map(item => item.comentario.toLowerCase()).join(' ');
  const ranked = options.keys
    .map(key => ({ key, count: (text.match(new RegExp(key, 'g')) || []).length }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .map(item => item.key);
  return [...ranked, ...options.fallback].slice(0, 3);
};

const computeIntelligence = (comments: FeedbackComment[]): FeedbackIntelligence => {
  const now = new Date();
  const thisMonthKey = monthKey(now);
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = monthKey(previous);

  const thisMonth = comments.filter(item => monthKey(new Date(item.fecha)) === thisMonthKey).length;
  const previousMonth = comments.filter(item => monthKey(new Date(item.fecha)) === previousMonthKey).length;
  const felicitaciones = comments.filter(item => item.tipo === 'Felicitación').length;
  const sugerencias = comments.filter(item => item.tipo === 'Sugerencia').length;
  const problemas = comments.filter(item => item.tipo === 'Problema').length;
  const sinClasificar = comments.filter(item => item.tipo === 'General' || item.categoria === 'General').length;

  const trendCounts = TOPICS
    .map(topic => ({
      ...topic,
      count: comments.filter(item => item.comentario.toLowerCase().includes(topic.key)).length,
    }))
    .filter(topic => topic.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    comments,
    summary: {
      valued: topMentions(comments.filter(item => item.tipo === 'Felicitación'), {
        keys: ['microentrenamientos', 'respiración', 'facilidad', 'duración', 'plataforma'],
        fallback: ['Duración de los microentrenamientos.', 'Ejercicios de respiración.', 'Facilidad de uso.'],
      }),
      requested: topMentions(comments.filter(item => item.tipo === 'Sugerencia'), {
        keys: ['cuello', 'movilidad', 'taller', 'respiración', 'fuerza'],
        fallback: ['Más ejercicios para cuello.', 'Más pausas de movilidad.', 'Más talleres.'],
      }),
      issues: topMentions(comments.filter(item => item.tipo === 'Problema'), {
        keys: ['horario', 'video', 'accesibilidad', 'plataforma'],
        fallback: ['Horarios de algunas pausas.', 'Videos específicos.', 'Accesibilidad.'],
      }),
    },
    trends: trendCounts.map(topic => ({
      tema: topic.label,
      count: topic.count,
      text: `${topic.count} usuarios mencionaron ${topic.label}.`,
      action: topic.action,
    })),
    stats: {
      thisMonth,
      previousMonth,
      delta: thisMonth - previousMonth,
      lastDate: comments[0]?.fecha ?? '',
      felicitaciones,
      sugerencias,
      problemas,
      sinClasificar,
    },
  };
};

export function useFeedbackIntelligence(): FeedbackIntelligence {
  const [version, setVersion] = useState(0);
  const [supabaseComments, setSupabaseComments] = useState<FeedbackComment[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      setVersion(value => value + 1);
      readSupabaseFeedback().then((comments) => {
        if (mounted && comments) setSupabaseComments(comments);
      });
    };
    refresh();
    window.addEventListener('reactiva_db_update', refresh);
    window.addEventListener('reactiva-pausas-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('reactiva_db_update', refresh);
      window.removeEventListener('reactiva-pausas-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return useMemo(() => {
    if (supabaseComments && supabaseComments.length > 0) return computeIntelligence(supabaseComments);
    const stored = readStoredFeedback();
    return computeIntelligence(stored.length > 0 ? stored : createDemoFeedback());
  }, [version, supabaseComments]);
}

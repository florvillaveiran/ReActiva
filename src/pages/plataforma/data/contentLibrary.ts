import { supabase } from '../lib/supabase';

export type AdminContentKind = 'coach' | 'academy';

export interface CoachItem {
  id: string;
  sourceId?: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  detailTitle: string;
  subtitle: string;
  time: string;
  difficulty: string;
  benefit: string;
  why: string;
  evidence: string;
  steps: string[];
  signals: string[];
  challenge: string;
  related: string;
  tags: string[];
  targetWorkProfile?: 'ALL' | 'ADMINISTRATIVO' | 'OPERATIVO';
  recommendedWorkProfile?: 'ALL' | 'ADMINISTRATIVO' | 'OPERATIVO';
  companyId?: string | null;
  active: boolean;
  isNew?: boolean;
}

export interface AcademyItem {
  id: string;
  sourceId?: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  level: 'Basico' | 'Intermedio' | 'Avanzado';
  image: string;
  videoUrl?: string;
  targetWorkProfile?: 'ALL' | 'ADMINISTRATIVO' | 'OPERATIVO';
  recommendedWorkProfile?: 'ALL' | 'ADMINISTRATIVO' | 'OPERATIVO';
  companyId?: string | null;
  recommended?: boolean;
  active: boolean;
}

export const normalizeAcademyVideoUrl = (videoUrl?: string) => {
  const value = videoUrl?.trim() ?? '';
  if (/^(www\.)?(youtube\.com|youtu\.be)\//i.test(value)) return `https://${value}`;
  return value;
};

export const isAcademyVideoReady = (videoUrl?: string) => /^(https?:\/\/|\/|blob:|data:video\/)/i.test(normalizeAcademyVideoUrl(videoUrl));

export const isAcademyItemPublished = (item: AcademyItem) => item.active && isAcademyVideoReady(item.videoUrl);

const STORAGE_KEY = 'reactiva-content-library';
const ACADEMY_CATEGORIES_STORAGE_KEY = 'reactiva-academy-custom-categories';

const coachDetail = (overrides: Partial<CoachItem>): CoachItem => ({
  id: '',
  sourceId: overrides.sourceId ?? overrides.id,
  category: '',
  title: '',
  description: '',
  recommendation: '',
  detailTitle: overrides.title ?? '',
  subtitle: overrides.description ?? '',
  time: '5 minutos',
  difficulty: 'Moderado',
  benefit: 'Reduce el estrés y aumenta la productividad.',
  why: 'Este hábito ayuda a trabajar con más claridad, menos dispersión y mayor sensación de avance.',
  evidence: 'La evidencia sugiere que pausas breves y hábitos concretos favorecen la concentración y el bienestar durante la jornada.',
  steps: ['Aplicalo antes de empezar una tarea importante.', 'Repetilo durante una pausa breve.', 'Observá cómo cambia tu energía o foco.'],
  signals: ['Baja energía', 'Dificultad para concentrarte', 'Tensión acumulada'],
  challenge: overrides.recommendation ?? '',
  related: 'Entorno saludable',
  tags: [],
  targetWorkProfile: overrides.targetWorkProfile ?? 'ALL',
  recommendedWorkProfile: overrides.recommendedWorkProfile ?? 'ALL',
  companyId: overrides.companyId ?? null,
  active: true,
  ...overrides,
});

export const defaultCoachItems: CoachItem[] = [
  coachDetail({ id: 'coach-salud-visual', category: 'Salud visual', title: 'Salud visual', detailTitle: 'Descanso visual activo', subtitle: 'Prácticas para proteger tu vista durante largas jornadas.', description: 'Prácticas para proteger tu vista durante largas jornadas.', recommendation: 'Ajustá el brillo de tu monitor al entorno.', tags: ['Visión', 'Pantallas'], active: true, isNew: true }),
  coachDetail({ id: 'coach-organizacion', category: 'Organización', title: 'Organización', detailTitle: 'Más foco, menos sobrecarga mental', subtitle: 'Una forma simple de ordenar prioridades y bajar la dispersión.', description: 'Hábitos simples para trabajar con más foco y menos agotamiento.', recommendation: 'Antes de empezar el día, elegí tus 3 tareas más importantes.', why: 'Elegir prioridades baja la saturación mental. Te ayuda a trabajar con más claridad, menos dispersión y mayor sensación de avance.', evidence: 'La evidencia sobre carga cognitiva sugiere que reducir la multitarea, ordenar prioridades y trabajar por bloques favorece la concentración.', steps: ['Antes de abrir mails o chats, anotá tus 3 prioridades.', 'Elegí una tarea principal para empezar.', 'Agrupá tareas similares para cambiar menos de contexto.'], signals: ['Saltás de tarea en tarea', 'Sentís poco avance', 'Muchas pestañas abiertas', 'No sabés por dónde empezar', 'Sentís saturación mental'], challenge: 'Elegí ahora las 3 tareas más importantes del día y marcá una como prioridad principal.', tags: ['Foco', 'Prioridades'], active: true, isNew: true }),
  coachDetail({ id: 'coach-sueno', category: 'Sueño', title: 'Sueño', detailTitle: 'Mejor descanso para rendir mejor mañana', subtitle: 'Un cierre más tranquilo del día para recuperar energía y foco.', description: 'Consejos para descansar mejor y recuperar energía.', recommendation: 'Generá una rutina breve para cerrar el día.', tags: ['Descanso'], active: true, isNew: true }),
  coachDetail({ id: 'coach-estres', category: 'Estrés', title: 'Estrés', detailTitle: 'Gestión del estrés en momentos de tensión', subtitle: 'Una técnica simple para bajar revoluciones.', description: 'Técnicas para gestionar momentos de tensión y ansiedad.', recommendation: 'Escribí lo que te preocupa para sacarlo de tu cabeza.', tags: ['Tensión'], active: true, isNew: true }),
  coachDetail({ id: 'coach-ergonomia', category: 'Ergonomía', title: 'Ergonomía', detailTitle: 'Ajustes ergonómicos simples', subtitle: 'Pequeños cambios para prevenir molestias.', description: 'Ajustes en tu espacio físico para prevenir dolores musculares.', recommendation: 'Mantené los pies apoyados en el suelo.', tags: ['Postura'], active: true }),
  coachDetail({ id: 'coach-entorno', category: 'Entorno saludable', title: 'Entorno saludable', detailTitle: 'Diseñá un entorno que te ayude', subtitle: 'Orden, luz y pequeños detalles para trabajar mejor.', description: 'Optimizá tu espacio de trabajo para mayor comodidad y enfoque.', recommendation: 'Agregá una planta a tu espacio de trabajo.', tags: ['Espacio'], active: true }),
  coachDetail({ id: 'coach-energia', category: 'Energía', title: 'Energía', detailTitle: 'Recuperá energía sin depender del café', subtitle: 'Movimiento breve para volver con claridad.', description: 'Ideas para mantenerte activo sin depender sólo del café.', recommendation: 'Activá el cuerpo unos minutos entre reuniones.', tags: ['Movimiento'], active: true }),
  coachDetail({ id: 'coach-hidratacion', category: 'Hidratación', title: 'Hidratación', detailTitle: 'Hidratación inteligente durante la jornada', subtitle: 'Un hábito simple para sostener energía y foco.', description: 'Recordatorios simples para tomar más agua durante la jornada.', recommendation: 'Aprovechá cada pausa para hidratarte.', tags: ['Agua'], active: true }),
];

export const defaultAcademyItems: AcademyItem[] = [
  { id: 'academy-cervical', category: 'Dolor musculoesquelético', title: 'Prevencion de dolor cervical', description: 'Entiende por que duele el cuello y como evitarlo.', duration: '15 min', level: 'Intermedio', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1400', recommended: true, active: true },
  { id: 'academy-ergonomia', category: 'Ergonomía', title: 'Ergonomia en el Home Office', description: 'Ajustes esenciales para trabajar sin dolor desde casa.', duration: '12 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-sueno', category: 'Sueño', title: 'Higiene del sueno para profesionales', description: 'Estrategias nocturnas para recuperar energia real.', duration: '10 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-hidratacion', category: 'Hidratación', title: 'Agua y cerebro: el link invisible', description: 'Como la hidratacion impacta tu capacidad de concentracion.', duration: '8 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-visual', category: 'Salud visual', title: 'Descanso visual activo', description: 'Protege tus ojos en jornadas intensas de pantallas.', duration: '6 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-entorno', category: 'Entorno saludable', title: 'Disena tu espacio, disena tu mente', description: 'Optimiza luz, ruido y plantas para reducir estres.', duration: '14 min', level: 'Intermedio', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-estres', category: 'Estrés', title: 'Reseteo del sistema nervioso', description: 'Tecnicas express para bajar revoluciones en dias dificiles.', duration: '9 min', level: 'Avanzado', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-respiracion', category: 'Respiración', title: 'Respiracion para el enfoque', description: 'Utiliza tu respiracion para volver al presente.', duration: '5 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-organizacion', category: 'Organización del trabajo', title: 'Trabajo profundo y bloques', description: 'Como organizar tu agenda para reducir la carga mental.', duration: '18 min', level: 'Intermedio', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1400', active: true },
];

const normalizeLookup = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const coachAccentReplacements: [RegExp, string][] = [
  [/\bSueno\b/g, 'Sueño'], [/\bsueno\b/g, 'sueño'],
  [/\bmanana\b/g, 'mañana'], [/\bpestanas\b/g, 'pestañas'],
  [/\bPracticas\b/g, 'Prácticas'], [/\bpracticas\b/g, 'prácticas'],
  [/\bVision\b/g, 'Visión'], [/\bOrganizacion\b/g, 'Organización'],
  [/\borganizacion\b/g, 'organización'], [/\bMas\b/g, 'Más'], [/\bmas\b/g, 'más'],
  [/\bdispersion\b/g, 'dispersión'], [/\bHabitos\b/g, 'Hábitos'], [/\bhabitos\b/g, 'hábitos'],
  [/\bhabito\b/g, 'hábito'], [/\bdia\b/g, 'día'], [/\belegi\b/g, 'elegí'],
  [/\bsaturacion\b/g, 'saturación'], [/\bsensacion\b/g, 'sensación'],
  [/\bconcentracion\b/g, 'concentración'], [/\banota\b/g, 'anotá'],
  [/\bAgrupa\b/g, 'Agrupá'], [/\bSaltas\b/g, 'Saltás'], [/\bSentis\b/g, 'Sentís'],
  [/\bsabes\b/g, 'sabés'], [/\bdonde\b/g, 'dónde'], [/\bmarca\b/g, 'marcá'],
  [/\benergia\b/g, 'energía'], [/\bEnergia\b/g, 'Energía'],
  [/\bGenera\b/g, 'Generá'], [/\bEstres\b/g, 'Estrés'], [/\bestres\b/g, 'estrés'],
  [/\bGestion\b/g, 'Gestión'], [/\btension\b/g, 'tensión'], [/\bTension\b/g, 'Tensión'],
  [/\btecnica\b/g, 'técnica'], [/\bTecnicas\b/g, 'Técnicas'], [/\bEscribi\b/g, 'Escribí'],
  [/\bErgonomia\b/g, 'Ergonomía'], [/\bergonomicos\b/g, 'ergonómicos'],
  [/\bPequenos\b/g, 'Pequeños'], [/\bpequenos\b/g, 'pequeños'],
  [/\bfisico\b/g, 'físico'], [/\bMantene\b/g, 'Mantené'], [/\bDisena\b/g, 'Diseñá'],
  [/\bOptimiza\b/g, 'Optimizá'], [/\bAgrega\b/g, 'Agregá'], [/\bcafe\b/g, 'café'],
  [/\bActiva\b/g, 'Activá'], [/\bHidratacion\b/g, 'Hidratación'],
  [/\bAprovecha\b/g, 'Aprovechá'], [/\bObserva\b/g, 'Observá'], [/\bcomo\b/g, 'cómo'],
  [/\bRespiracion\b/g, 'Respiración'], [/\brespiracion\b/g, 'respiración'],
  [/\bMusculoesqueletico\b/g, 'Musculoesquelético'], [/\bmusculoesqueletico\b/g, 'musculoesquelético'],
  [/\bNutricion\b/g, 'Nutrición'], [/\bnutricion\b/g, 'nutrición'],
  [/\bMeditacion\b/g, 'Meditación'], [/\bmeditacion\b/g, 'meditación'],
  [/\bPrevencion\b/g, 'Prevención'], [/\bprevencion\b/g, 'prevención'],
  [/\bAtencion\b/g, 'Atención'], [/\batencion\b/g, 'atención'],
  [/\bRelajacion\b/g, 'Relajación'], [/\brelajacion\b/g, 'relajación'],
  [/\bCategoria\b/g, 'Categoría'], [/\bcategoria\b/g, 'categoría'],
];

const accentText = (value: string) => coachAccentReplacements.reduce(
  (result, [pattern, replacement]) => result.replace(pattern, replacement),
  value,
);

export const normalizeAcademyCategory = (category: string) => accentText(category.trim());

const readAcademyCategoriesCache = (): string[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(ACADEMY_CATEGORIES_STORAGE_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter(value => typeof value === 'string' && value.trim()).map(normalizeAcademyCategory)
      : [];
  } catch {
    return [];
  }
};

const cacheAcademyCategories = (categories: string[]) => {
  const normalized = Array.from(new Set(categories.map(normalizeAcademyCategory).filter(Boolean)));
  localStorage.setItem(ACADEMY_CATEGORIES_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('reactiva-content-categories-updated'));
  return normalized;
};

export const fetchAcademyCategories = async (): Promise<string[]> => {
  if (!supabase) return readAcademyCategoriesCache();
  const { data, error } = await supabase
    .from('content_categories')
    .select('name')
    .eq('kind', 'academy')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) {
    console.error('No se pudieron cargar las categorias desde Supabase', error);
    return readAcademyCategoriesCache();
  }
  return cacheAcademyCategories(data.map(row => row.name));
};

export const saveAcademyCategory = async (name: string) => {
  const normalized = normalizeAcademyCategory(name);
  if (!supabase) {
    cacheAcademyCategories([...readAcademyCategoriesCache(), normalized]);
    return { ok: true, error: null };
  }
  const { error } = await supabase.rpc('save_content_category', { category_name: normalized });
  if (!error) await fetchAcademyCategories();
  return { ok: !error, error };
};

export const renameAcademyCategory = async (oldName: string, newName: string) => {
  const normalized = normalizeAcademyCategory(newName);
  if (!supabase) {
    cacheAcademyCategories(readAcademyCategoriesCache().map(name => name === oldName ? normalized : name));
    return { ok: true, error: null };
  }
  const { error } = await supabase.rpc('rename_content_category', { old_name: oldName, new_name: normalized });
  if (!error) await fetchAcademyCategories();
  return { ok: !error, error };
};

export const removeAcademyCategory = async (name: string, replacementName: string) => {
  if (!supabase) {
    cacheAcademyCategories(readAcademyCategoriesCache().filter(category => category !== name));
    return { ok: true, error: null };
  }
  const { error } = await supabase.rpc('delete_content_category', {
    category_name: name,
    replacement_name: replacementName,
  });
  if (!error) await fetchAcademyCategories();
  return { ok: !error, error };
};

const defaultCoachIdForTitle = (title: string) => defaultCoachItems.find(
  item => normalizeLookup(item.title) === normalizeLookup(title),
)?.id;

const defaultAcademyIdForTitle = (title: string) => defaultAcademyItems.find(
  item => normalizeLookup(item.title) === normalizeLookup(title),
)?.id;

const ACADEMY_COVER_OVERRIDES = [
  { keywords: ['checklist ergonomico'], image: '/academy-covers/checklist-ergonomico.jpg' },
  { keywords: ['silla ergonomica', 'silla ergonómica'], image: '/academy-covers/silla-ergonomica.jpg' },
  { keywords: ['diferentes posiciones', 'posiciones para trabajar', 'trabajar homeoffice', 'trabajar home office', 'homeoffice'], image: '/academy-covers/posicion-homeoffice.jpg' },
  { keywords: ['irritacion nervio ciatico', 'ciatico'], image: '/academy-covers/dolor-espalda-ciatico.jpg' },
  { keywords: ['elongacion cadena posterior', 'cadena posterior'], image: '/academy-covers/elongar-cadena-posterior.jpg' },
  { keywords: ['liberacion flexores de cadera', 'flexores de cadera', 'psoas'], image: '/academy-covers/elongar-psoas.jpg' },
  { keywords: ['esguince de tobillo', 'tipos de esguinces'], image: '/academy-covers/esguince-tobillo.jpg' },
  { keywords: ['ejercicios tobillo', 'ejercicios de tobillo', 'ejercicios para el tobillo'], image: '/academy-covers/ejercicios-tobillo.jpg' },
  { keywords: ['hidratacion', 'agua y cerebro'], image: '/academy-covers/hidratacion.jpg' },
  { keywords: ['joroba cervical'], image: '/academy-covers/joroba-cervical.jpg' },
  { keywords: ['no destruyas tu espalda', 'levantar objeto'], image: '/academy-covers/levantar-objeto.jpg' },
  { keywords: ['mouse'], image: '/academy-covers/mouse.jpg' },
  { keywords: ['mucha pantalla', 'ojos', 'descanso visual'], image: '/academy-covers/mucha-pantalla.jpg' },
  { keywords: ['rutina suave antes del cafe', 'rutina suave'], image: '/academy-covers/rutina-suave.jpg' },
];

const academyCoverFor = (item: AcademyItem) => {
  const searchable = normalizeLookup(`${item.category} ${item.title} ${item.description}`);
  return ACADEMY_COVER_OVERRIDES.find(cover =>
    cover.keywords.some(keyword => searchable.includes(normalizeLookup(keyword))),
  )?.image;
};

const isReplaceableAcademyCover = (image?: string) => {
  const value = image?.trim() ?? '';
  return !value || value.includes('images.unsplash.com') || value.startsWith('/academy-covers/');
};

const normalizeCoachTypography = (item: CoachItem): CoachItem => ({
  ...item,
  sourceId: item.sourceId ?? defaultCoachIdForTitle(item.title) ?? item.id,
  category: accentText(item.category),
  title: accentText(item.title),
  description: accentText(item.description),
  recommendation: accentText(item.recommendation),
  detailTitle: accentText(item.detailTitle),
  subtitle: accentText(item.subtitle),
  benefit: accentText(item.benefit),
  why: accentText(item.why),
  evidence: accentText(item.evidence),
  steps: item.steps.map(accentText),
  signals: item.signals.map(accentText),
  challenge: accentText(item.challenge),
  related: accentText(item.related),
  tags: item.tags.map(accentText),
  targetWorkProfile: item.targetWorkProfile ?? 'ALL',
  recommendedWorkProfile: item.recommendedWorkProfile ?? 'ALL',
  companyId: item.companyId ?? null,
});

const normalizeAcademyItem = (item: AcademyItem): AcademyItem => ({
  ...item,
  sourceId: item.sourceId ?? defaultAcademyIdForTitle(item.title) ?? item.id,
  category: normalizeAcademyCategory(item.category),
  image: isReplaceableAcademyCover(item.image) ? academyCoverFor(item) ?? item.image : item.image,
  videoUrl: normalizeAcademyVideoUrl(item.videoUrl) || undefined,
  targetWorkProfile: item.targetWorkProfile ?? 'ALL',
  recommendedWorkProfile: item.recommendedWorkProfile ?? 'ALL',
  companyId: item.companyId ?? null,
  active: item.active && isAcademyVideoReady(item.videoUrl),
});

interface ContentLibrary {
  coach: CoachItem[];
  academy: AcademyItem[];
}

const readLibrary = (): ContentLibrary => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<ContentLibrary>;
    return {
      coach: (parsed.coach ?? defaultCoachItems).map(item => normalizeCoachTypography(coachDetail(item))),
      academy: (parsed.academy ?? defaultAcademyItems)
        .map(normalizeAcademyItem)
        .filter(item => isAcademyVideoReady(item.videoUrl)),
    };
  } catch {
    return { coach: defaultCoachItems, academy: [] };
  }
};

export const getContentLibrary = () => readLibrary();

export const saveContentLibrary = (library: ContentLibrary) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  window.dispatchEvent(new Event('reactiva-content-library-updated'));
};

export const updateCoachItem = (item: CoachItem) => {
  const library = readLibrary();
  library.coach = library.coach.map(existing => existing.id === item.id ? item : existing);
  saveContentLibrary(library);
};

export const updateAcademyItem = (item: AcademyItem) => {
  const library = readLibrary();
  const exists = library.academy.some(existing => existing.id === item.id);
  library.academy = exists
    ? library.academy.map(existing => existing.id === item.id ? item : existing)
    : [...library.academy, item];
  saveContentLibrary(library);
};

export const deleteCoachItem = (id: string) => {
  const library = readLibrary();
  library.coach = library.coach.filter(item => item.id !== id);
  saveContentLibrary(library);
};

export const deleteAcademyItem = (id: string) => {
  const library = readLibrary();
  library.academy = library.academy.filter(item => item.id !== id);
  saveContentLibrary(library);
};

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const rowToCoachItem = (row: any): CoachItem => normalizeCoachTypography(coachDetail({
  id: row.id,
  sourceId: row.metadata?.sourceId ?? defaultCoachIdForTitle(row.title),
  category: row.category ?? row.metadata?.category ?? 'General',
  title: row.title,
  description: row.description ?? '',
  recommendation: row.metadata?.recommendation ?? row.description ?? '',
  detailTitle: row.metadata?.detailTitle ?? row.title,
  subtitle: row.metadata?.subtitle ?? row.description ?? '',
  time: row.metadata?.time ?? '5 minutos',
  difficulty: row.metadata?.difficulty ?? 'Moderado',
  benefit: row.metadata?.benefit ?? '',
  why: row.metadata?.why ?? '',
  evidence: row.metadata?.evidence ?? '',
  steps: Array.isArray(row.metadata?.steps) ? row.metadata.steps : [],
  signals: Array.isArray(row.metadata?.signals) ? row.metadata.signals : [],
  challenge: row.metadata?.challenge ?? '',
  related: row.metadata?.related ?? '',
  tags: row.tags ?? [],
  targetWorkProfile: row.target_work_profile ?? 'ALL',
  recommendedWorkProfile: row.recommended_work_profile ?? 'ALL',
  companyId: row.company_id ?? null,
  active: row.active,
  isNew: row.featured,
}));

const rowToAcademyItem = (row: any): AcademyItem => normalizeAcademyItem({
  id: row.id,
  sourceId: row.metadata?.sourceId ?? defaultAcademyIdForTitle(row.title),
  category: row.category ?? row.metadata?.category ?? 'General',
  title: row.title,
  description: row.description ?? '',
  duration: row.metadata?.duration ?? '10 min',
  level: row.metadata?.level ?? 'Basico',
  image: row.thumbnail_url ?? row.metadata?.image ?? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1400',
  videoUrl: row.url ?? row.metadata?.videoUrl,
  targetWorkProfile: row.target_work_profile ?? 'ALL',
  recommendedWorkProfile: row.recommended_work_profile ?? 'ALL',
  companyId: row.company_id ?? null,
  recommended: row.featured,
  active: row.active,
});

export const fetchContentLibrary = async (): Promise<ContentLibrary> => {
  if (!supabase) return readLibrary();

  const [{ data, error }, { data: tombstones, error: tombstonesError }] = await Promise.all([
    supabase
      .from('content_items')
      .select('id, kind, title, description, category, tags, url, thumbnail_url, active, featured, sort_order, metadata, target_work_profile, recommended_work_profile, company_id')
      .in('kind', ['coach_tip', 'workshop'])
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('content_item_tombstones')
      .select('source_id, kind'),
  ]);

  if (error || !data) {
    console.error('No se pudo cargar contenido desde Supabase', error);
    return readLibrary();
  }
  if (tombstonesError) console.warn('La migracion de contenido todavia no esta aplicada; se usara compatibilidad local.', tombstonesError);

  const deleted = new Set((tombstonesError ? [] : (tombstones ?? [])).map(row => `${row.kind}__${row.source_id}`));

  const library = {
    coach: data.filter((row: any) => row.kind === 'coach_tip').map(rowToCoachItem),
    academy: data.filter((row: any) => row.kind === 'workshop').map(rowToAcademyItem),
  };

  const mergeCoachItems = (base: CoachItem[], remote: CoachItem[]) => {
    const keyFor = (item: CoachItem) => item.sourceId ?? normalizeLookup(item.title);
    const merged = new Map(base.map(item => [keyFor(item), item]));
    remote.forEach(item => merged.set(keyFor(item), item));
    return Array.from(merged.values());
  };

  const mergeAcademyItems = (base: AcademyItem[], remote: AcademyItem[]) => {
    const keyFor = (item: AcademyItem) => item.sourceId ?? normalizeLookup(item.title);
    const merged = new Map(base.map(item => [keyFor(item), normalizeAcademyItem(item)]));
    remote.forEach(item => merged.set(keyFor(item), normalizeAcademyItem(item)));
    return Array.from(merged.values()).filter(item => isAcademyVideoReady(item.videoUrl));
  };

  const merged = {
    coach: mergeCoachItems(
      defaultCoachItems.filter(item => !deleted.has(`coach_tip__${item.sourceId ?? item.id}`)),
      library.coach,
    ),
    academy: mergeAcademyItems(
      defaultAcademyItems.filter(item => !deleted.has(`workshop__${item.sourceId ?? item.id}`)),
      library.academy,
    ),
  };
  saveContentLibrary(merged);
  return merged;
};

export const saveCoachItem = async (item: CoachItem) => {
  const normalizedItem = normalizeCoachTypography(item);
  if (!supabase) {
    updateCoachItem(normalizedItem);
    return { ok: true };
  }

  const { data, error } = await supabase.rpc('save_content_item', {
    item_id: isUuid(normalizedItem.id) ? normalizedItem.id : null,
    item_kind: 'coach_tip',
    item_title: normalizedItem.title,
    item_description: normalizedItem.description,
    item_category: normalizedItem.category,
    item_tags: normalizedItem.tags,
    item_url: null,
    item_thumbnail_url: null,
    item_active: normalizedItem.active,
    item_featured: Boolean(normalizedItem.isNew),
    item_sort_order: 0,
    item_metadata: {
      sourceId: normalizedItem.sourceId,
      recommendation: normalizedItem.recommendation,
      detailTitle: normalizedItem.detailTitle,
      subtitle: normalizedItem.subtitle,
      time: normalizedItem.time,
      difficulty: normalizedItem.difficulty,
      benefit: normalizedItem.benefit,
      why: normalizedItem.why,
      evidence: normalizedItem.evidence,
      steps: normalizedItem.steps,
      signals: normalizedItem.signals,
      challenge: normalizedItem.challenge,
      related: normalizedItem.related,
    },
    item_company_id: normalizedItem.companyId ?? null,
    item_target_work_profile: normalizedItem.targetWorkProfile ?? 'ALL',
    item_recommended_work_profile: normalizedItem.recommendedWorkProfile ?? 'ALL',
  });

  if (error) return { ok: false, error, id: null };
  const savedId = data as string;
  normalizedItem.id = savedId;
  updateCoachItem(normalizedItem);
  await fetchContentLibrary();
  return { ok: true, error: null, id: savedId };
};

export const saveAcademyItem = async (item: AcademyItem) => {
  const normalizedItem = normalizeAcademyItem(item);
  if (!supabase) {
    updateAcademyItem(normalizedItem);
    return { ok: true, error: null, id: normalizedItem.id };
  }

  const { data, error } = await supabase.rpc('save_content_item', {
    item_id: isUuid(normalizedItem.id) ? normalizedItem.id : null,
    item_kind: 'workshop',
    item_title: normalizedItem.title,
    item_description: normalizedItem.description,
    item_category: normalizedItem.category,
    item_tags: [],
    item_url: normalizedItem.videoUrl ?? null,
    item_thumbnail_url: normalizedItem.image,
    item_active: normalizedItem.active,
    item_featured: Boolean(normalizedItem.recommended),
    item_sort_order: 0,
    item_metadata: {
      sourceId: normalizedItem.sourceId,
      duration: normalizedItem.duration,
      level: normalizedItem.level,
      image: normalizedItem.image,
      videoUrl: normalizedItem.videoUrl ?? null,
    },
    item_company_id: normalizedItem.companyId ?? null,
    item_target_work_profile: normalizedItem.targetWorkProfile ?? 'ALL',
    item_recommended_work_profile: normalizedItem.recommendedWorkProfile ?? 'ALL',
  });

  if (error) return { ok: false, error, id: null };
  const savedId = data as string;
  normalizedItem.id = savedId;
  updateAcademyItem(normalizedItem);
  await fetchContentLibrary();
  return { ok: true, error: null, id: savedId };
};

export const removeContentItemFromSupabase = async (id: string) => {
  if (!supabase || !isUuid(id)) return { ok: true };
  const { error } = await supabase.rpc('delete_content_item', { item_id: id });
  return { ok: !error, error };
};

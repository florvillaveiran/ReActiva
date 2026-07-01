export type AdminContentKind = 'coach' | 'academy';

export interface CoachItem {
  id: string;
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
  active: boolean;
  isNew?: boolean;
}

export interface AcademyItem {
  id: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  level: 'Basico' | 'Intermedio' | 'Avanzado';
  image: string;
  videoUrl?: string;
  recommended?: boolean;
  active: boolean;
}

const STORAGE_KEY = 'reactiva-content-library';

const coachDetail = (overrides: Partial<CoachItem>): CoachItem => ({
  id: '',
  category: '',
  title: '',
  description: '',
  recommendation: '',
  detailTitle: overrides.title ?? '',
  subtitle: overrides.description ?? '',
  time: '5 minutos',
  difficulty: 'Moderado',
  benefit: 'Reduce el estres y aumenta la productividad.',
  why: 'Este habito ayuda a trabajar con mas claridad, menos dispersion y mayor sensacion de avance.',
  evidence: 'La evidencia sugiere que pausas breves y habitos concretos favorecen la concentracion y el bienestar durante la jornada.',
  steps: ['Aplicalo antes de empezar una tarea importante.', 'Repetilo durante una pausa breve.', 'Observa como cambia tu energia o foco.'],
  signals: ['Baja energia', 'Dificultad para concentrarte', 'Tension acumulada'],
  challenge: overrides.recommendation ?? '',
  related: 'Entorno saludable',
  tags: [],
  active: true,
  ...overrides,
});

export const defaultCoachItems: CoachItem[] = [
  coachDetail({ id: 'coach-salud-visual', category: 'Salud Visual', title: 'Salud visual', detailTitle: 'Descanso visual activo', subtitle: 'Practicas para proteger tu vista durante largas jornadas.', description: 'Practicas para proteger tu vista durante largas jornadas.', recommendation: 'Ajusta el brillo de tu monitor al entorno.', tags: ['Vision', 'Pantallas'], active: true, isNew: true }),
  coachDetail({ id: 'coach-organizacion', category: 'Organizacion', title: 'Organizacion', detailTitle: 'Mas foco, menos sobrecarga mental', subtitle: 'Una forma simple de ordenar prioridades y bajar la dispersion.', description: 'Habitos simples para trabajar con mas foco y menos agotamiento.', recommendation: 'Antes de empezar el dia, elegi tus 3 tareas mas importantes.', why: 'Elegir prioridades baja la saturacion mental. Te ayuda a trabajar con mas claridad, menos dispersion y mayor sensacion de avance.', evidence: 'La evidencia sobre carga cognitiva sugiere que reducir multitarea, ordenar prioridades y trabajar por bloques favorece la concentracion.', steps: ['Antes de abrir mails o chats, anota tus 3 prioridades.', 'Elegi una tarea principal para empezar.', 'Agrupa tareas similares para cambiar menos de contexto.'], signals: ['Saltas de tarea en tarea', 'Sentis poco avance', 'Muchas pestanas abiertas', 'No sabes por donde empezar', 'Sentis saturacion mental'], challenge: 'Elegi ahora las 3 tareas mas importantes del dia y marca una como prioridad principal.', tags: ['Foco', 'Prioridades'], active: true, isNew: true }),
  coachDetail({ id: 'coach-sueno', category: 'Sueno', title: 'Sueno', detailTitle: 'Mejor descanso para rendir mejor manana', subtitle: 'Un cierre mas tranquilo del dia para recuperar energia y foco.', description: 'Consejos para descansar mejor y recuperar energia.', recommendation: 'Genera una rutina breve para cerrar el dia.', tags: ['Descanso'], active: true, isNew: true }),
  coachDetail({ id: 'coach-estres', category: 'Estres', title: 'Estres', detailTitle: 'Gestion de estres en momentos de tension', subtitle: 'Una tecnica simple para bajar revoluciones.', description: 'Tecnicas para gestionar momentos de tension y ansiedad.', recommendation: 'Escribi lo que te preocupa para sacarlo de tu cabeza.', tags: ['Tension'], active: true, isNew: true }),
  coachDetail({ id: 'coach-ergonomia', category: 'Ergonomia', title: 'Ergonomia', detailTitle: 'Ajustes ergonomicos simples', subtitle: 'Pequenos cambios para prevenir molestias.', description: 'Ajustes en tu espacio fisico para prevenir dolores musculares.', recommendation: 'Mantene los pies apoyados en el suelo.', tags: ['Postura'], active: true }),
  coachDetail({ id: 'coach-entorno', category: 'Entorno saludable', title: 'Entorno saludable', detailTitle: 'Disena un entorno que te ayude', subtitle: 'Orden, luz y pequenos detalles para trabajar mejor.', description: 'Optimiza tu espacio de trabajo para mayor comodidad y enfoque.', recommendation: 'Agrega una planta a tu espacio de trabajo.', tags: ['Espacio'], active: true }),
  coachDetail({ id: 'coach-energia', category: 'Energia', title: 'Energia', detailTitle: 'Recupera energia sin depender del cafe', subtitle: 'Movimiento breve para volver con claridad.', description: 'Ideas para mantenerte activo sin depender solo del cafe.', recommendation: 'Activa el cuerpo unos minutos entre reuniones.', tags: ['Movimiento'], active: true }),
  coachDetail({ id: 'coach-hidratacion', category: 'Hidratacion', title: 'Hidratacion', detailTitle: 'Hidratacion inteligente durante la jornada', subtitle: 'Un habito simple para sostener energia y foco.', description: 'Recordatorios simples para tomar mas agua durante la jornada.', recommendation: 'Aprovecha cada pausa para hidratarte.', tags: ['Agua'], active: true }),
];

export const defaultAcademyItems: AcademyItem[] = [
  { id: 'academy-cervical', category: 'Dolor musculoesqueletico', title: 'Prevencion de dolor cervical', description: 'Entiende por que duele el cuello y como evitarlo.', duration: '15 min', level: 'Intermedio', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1400', recommended: true, active: true },
  { id: 'academy-ergonomia', category: 'Ergonomia', title: 'Ergonomia en el Home Office', description: 'Ajustes esenciales para trabajar sin dolor desde casa.', duration: '12 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-sueno', category: 'Sueno', title: 'Higiene del sueno para profesionales', description: 'Estrategias nocturnas para recuperar energia real.', duration: '10 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-hidratacion', category: 'Hidratacion', title: 'Agua y cerebro: el link invisible', description: 'Como la hidratacion impacta tu capacidad de concentracion.', duration: '8 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-visual', category: 'Salud visual', title: 'Descanso visual activo', description: 'Protege tus ojos en jornadas intensas de pantallas.', duration: '6 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-entorno', category: 'Entorno saludable', title: 'Disena tu espacio, disena tu mente', description: 'Optimiza luz, ruido y plantas para reducir estres.', duration: '14 min', level: 'Intermedio', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-estres', category: 'Estres', title: 'Reseteo del sistema nervioso', description: 'Tecnicas express para bajar revoluciones en dias dificiles.', duration: '9 min', level: 'Avanzado', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-respiracion', category: 'Respiracion', title: 'Respiracion para el enfoque', description: 'Utiliza tu respiracion para volver al presente.', duration: '5 min', level: 'Basico', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1400', active: true },
  { id: 'academy-organizacion', category: 'Organizacion del trabajo', title: 'Trabajo profundo y bloques', description: 'Como organizar tu agenda para reducir la carga mental.', duration: '18 min', level: 'Intermedio', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1400', active: true },
];

interface ContentLibrary {
  coach: CoachItem[];
  academy: AcademyItem[];
}

const readLibrary = (): ContentLibrary => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<ContentLibrary>;
    return {
      coach: (parsed.coach ?? defaultCoachItems).map(item => coachDetail(item)),
      academy: parsed.academy ?? defaultAcademyItems,
    };
  } catch {
    return { coach: defaultCoachItems, academy: defaultAcademyItems };
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
  library.academy = library.academy.map(existing => existing.id === item.id ? item : existing);
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

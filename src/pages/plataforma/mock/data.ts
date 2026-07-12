// src/mock/data.ts
export interface Empresa {
  id: number;
  supabaseId?: string;
  nombre: string;
  ubicacion: string;
  empleados: number[]; // array de user ids
  estado?: 'Activa' | 'Pendiente onboarding' | 'Inactiva';
  contactoNombre?: string;
  rrhhEmail?: string;
  fechaOnboarding?: string;
  token?: string;
  onboardingData?: any;
}

export interface Usuario {
  id: number;
  supabaseId?: string;
  nombre: string;
  edad?: number;
  email: string;
  empresa_id: number;
  participacion: number; // %
  dolor: boolean;
  ultima_interaccion: string; // ISO date
  estado: 'Activo' | 'Inactivo' | 'Pendiente de acceso';
  fechaIngreso: string;
  passwordTemporal?: string;
  requiereCambioPassword?: boolean;
  onboardingData?: any;
}

export interface InvitacionUsuario {
  token: string;
  empresa_id: number;
  responsable?: string;
  emailEnviado?: string;
  fechaCreacion: string;
}

export interface Video {
  id: number;
  dia: 'lunes' | 'miercoles' | 'viernes';
  tipo: 'manana' | 'tarde';
  hora: string; // HH:MM
  empresa_id?: number; // undefined = todas
  url: string;
}

export interface Progreso {
  usuario_id: number;
  fecha: string; // ISO date (solo día)
  manana: boolean;
  tarde: boolean;
}

export interface Formulario {
  usuario_id: number;
  fecha: string; // ISO date
  energia: number; // 1-5
  dolor: boolean;
  zona?: string;
  comentario?: string;
  tipo: 'diario' | 'semanal';
}

export interface EmailAutomation {
  id: string;
  active: boolean;
  companyId: number | 'all';
  segment: string;
  scheduleTime: string;
  offsetMinutes: number;
  template: string;
  subject: string;
  body: string;
  attachReport?: boolean;
}

export interface EmailEvent {
  id: string;
  automationId: string;
  companyId?: number;
  userId?: number;
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  pauseCompletedAt?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'image' | 'pdf' | 'audio';
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface CoachAdvice {
  id: string;
  title: string;
  shortText: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  active: boolean;
  mediaFileId?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface Workshop {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  durationMinutes: number;
  tags: string[];
  active: boolean;
  featured: boolean;
  order: number;
  coverImageId?: string;
  videoId?: string;
  pdfId?: string;
  createdAt: string;
  views: number;
}

/** Helper to persist and retrieve mock data from localStorage */
export const STORAGE_KEY = 'metodo-reactiva-empty-v1';

export interface MockDB {
  empresas: Empresa[];
  usuarios: Usuario[];
  videos: Video[];
  progresos: Progreso[];
  formularios: Formulario[];
  invitacionesUsuarios: InvitacionUsuario[];
  emailAutomations: EmailAutomation[];
  emailEvents: EmailEvent[];
  mediaFiles: MediaFile[];
  coachAdvices: CoachAdvice[];
  workshops: Workshop[];
  tags: Tag[];
}

const defaultData: MockDB = {
  empresas: [],
  usuarios: [],
  videos: [],
  progresos: [],
  formularios: [],
  invitacionesUsuarios: [],
  emailAutomations: [],
  emailEvents: [],
  mediaFiles: [],
  coachAdvices: [],
  workshops: [],
  tags: [],
};

export const getDB = (): MockDB => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MockDB;
      if (!parsed.invitacionesUsuarios) parsed.invitacionesUsuarios = [];
      if (!parsed.empresas) parsed.empresas = [];
      if (!parsed.usuarios) parsed.usuarios = [];
      if (!parsed.videos) parsed.videos = [];
      if (!parsed.progresos) parsed.progresos = [];
      if (!parsed.formularios) parsed.formularios = [];
      if (!parsed.emailAutomations) parsed.emailAutomations = [];
      if (!parsed.emailEvents) parsed.emailEvents = [];
      if (!parsed.mediaFiles) parsed.mediaFiles = defaultData.mediaFiles;
      if (!parsed.coachAdvices) parsed.coachAdvices = defaultData.coachAdvices;
      if (!parsed.workshops) parsed.workshops = defaultData.workshops;
      if (!parsed.tags) parsed.tags = defaultData.tags;
      return parsed;
    } catch (e) {
      console.error('Failed to parse mock DB, resetting.', e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
};

export const setDB = (db: MockDB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event('reactiva_db_update'));
};

/** Convenience functions */
export const addProgreso = (p: Progreso) => {
  const db = getDB();
  db.progresos.push(p);
  setDB(db);
};

export const addFormulario = (f: Formulario) => {
  const db = getDB();
  db.formularios.push(f);
  setDB(db);
};

export const updateUsuario = (u: Usuario) => {
  const db = getDB();
  const idx = db.usuarios.findIndex((x) => x.id === u.id);
  if (idx >= 0) db.usuarios[idx] = u;
  setDB(db);
};

export const addEmpresa = (e: Empresa) => {
  const db = getDB();
  db.empresas.push(e);
  setDB(db);
};

export const updateEmpresa = (e: Empresa) => {
  const db = getDB();
  const idx = db.empresas.findIndex((x) => x.id === e.id);
  if (idx >= 0) db.empresas[idx] = e;
  setDB(db);
};

export const getEmpresaByToken = (token: string): Empresa | undefined => {
  return getDB().empresas.find(e => e.token === token);
};

export const addInvitacionUsuario = (inv: InvitacionUsuario) => {
  const db = getDB();
  db.invitacionesUsuarios.push(inv);
  setDB(db);
};

export const getInvitacionUsuarioByToken = (token: string): InvitacionUsuario | undefined => {
  return getDB().invitacionesUsuarios.find(i => i.token === token);
};

export const addUsuario = (u: Usuario) => {
  const db = getDB();
  db.usuarios.push(u);
  setDB(db);
};

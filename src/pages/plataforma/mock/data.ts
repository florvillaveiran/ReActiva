// src/mock/data.ts
export interface Empresa {
  id: number;
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
  nombre: string;
  edad?: number;
  email: string;
  empresa_id: number;
  participacion: number; // %
  dolor: boolean;
  ultima_interaccion: string; // ISO date
  estado: 'Activo' | 'Inactivo';
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

/** Helper to persist and retrieve mock data from localStorage */
export const STORAGE_KEY = 'metodo-reactiva-mock';

export interface MockDB {
  empresas: Empresa[];
  usuarios: Usuario[];
  videos: Video[];
  progresos: Progreso[];
  formularios: Formulario[];
  invitacionesUsuarios: InvitacionUsuario[];
}

const defaultData: MockDB = {
  empresas: [
    { id: 1, nombre: 'Empresa Alpha', ubicacion: 'Madrid, España', empleados: [1, 2], estado: 'Activa', contactoNombre: 'María González', rrhhEmail: 'rrhh@alpha.com' },
    { id: 2, nombre: 'Empresa Beta', ubicacion: 'Bogotá, Colombia', empleados: [], estado: 'Activa', contactoNombre: 'Carlos Ramírez', rrhhEmail: 'contacto@beta.co' },
    { id: 3, nombre: 'Empresa Gamma', ubicacion: 'CDMX, México', empleados: [], estado: 'Pendiente onboarding', contactoNombre: 'Ana Martínez', rrhhEmail: 'rh@gamma.mx', token: 'demo-token-123' },
  ],
  usuarios: [
    {
      id: 1,
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      empresa_id: 1,
      participacion: 80,
      dolor: false,
      ultima_interaccion: new Date().toISOString(),
      estado: 'Activo',
      fechaIngreso: new Date().toISOString(),
    },
    {
      id: 2,
      nombre: 'Luis Gómez',
      email: 'luis@example.com',
      empresa_id: 1,
      participacion: 65,
      dolor: true,
      ultima_interaccion: new Date().toISOString(),
      estado: 'Activo',
      fechaIngreso: new Date().toISOString(),
    },
  ],
  videos: [
    {
      id: 1,
      dia: 'viernes',
      tipo: 'tarde',
      hora: '17:00',
      empresa_id: undefined,
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      id: 2,
      dia: 'lunes',
      tipo: 'manana',
      hora: '09:00',
      empresa_id: undefined,
      url: 'https://www.youtube.com/embed/9bZkp7q19f0',
    },
  ],
  progresos: [],
  formularios: [],
  invitacionesUsuarios: [],
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

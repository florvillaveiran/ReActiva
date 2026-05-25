// src/mock/data.ts
export interface Empresa {
  id: number;
  nombre: string;
  ubicacion: string;
  empleados: number[]; // array de user ids
}

export interface Usuario {
  id: number;
  nombre: string;
  edad: number;
  email: string;
  empresa_id: number;
  participacion: number; // %
  dolor: boolean;
  ultima_interaccion: string; // ISO date
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
}

const defaultData: MockDB = {
  empresas: [
    { id: 1, nombre: 'Acme Corp', ubicacion: 'Buenos Aires', empleados: [1, 2] },
    { id: 2, nombre: 'Globex', ubicacion: 'São Paulo', empleados: [] },
  ],
  usuarios: [
    {
      id: 1,
      nombre: 'Ana Pérez',
      edad: 35,
      email: 'ana@example.com',
      empresa_id: 1,
      participacion: 80,
      dolor: false,
      ultima_interaccion: new Date().toISOString(),
    },
    {
      id: 2,
      nombre: 'Luis Gómez',
      edad: 42,
      email: 'luis@example.com',
      empresa_id: 1,
      participacion: 65,
      dolor: true,
      ultima_interaccion: new Date().toISOString(),
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
};

export const getDB = (): MockDB => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as MockDB;
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

// more CRUD utils can be added as needed

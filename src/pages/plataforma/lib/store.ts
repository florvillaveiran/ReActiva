/**
 * Store de datos para la plataforma Re-Activa
 * Usa localStorage para persistir datos en el cliente (compatible con Netlify).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  contactEmail: string;
  phone: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: "user" | "admin";
  password?: string;
}

export interface Pausa {
  id: string;
  title: string;
  videoId: string;
  duration: string;
  companyIds: string[];
}

export interface TrackingEntry {
  id: string;
  userId: string;
  pausaId: string;
  date: string;
  completed: boolean;
  feedback: string;
  initialEnergy: number;
  finalEnergy: number;
  companyId: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface DB {
  companies: Company[];
  users: User[];
  pausas: { lunes: Pausa[]; miercoles: Pausa[]; viernes: Pausa[] };
  tracking: TrackingEntry[];
  announcements: Announcement[];
}

// ─── Default data ─────────────────────────────────────────────────────────────

const defaultDB: DB = {
  companies: [
    { id: "1", name: "Empresa Alpha", contactEmail: "admin@alpha.com", phone: "+54 11 1234-5678", active: true },
    { id: "2", name: "Corp Beta", contactEmail: "admin@beta.com", phone: "+54 11 9876-5432", active: true },
  ],
  users: [
    { id: "user1", name: "Juan Pérez", email: "juan@alpha.com", companyId: "1", role: "user", password: "1234" },
    { id: "admin1", name: "Admin Reactiva", email: "admin@reactiva.com", companyId: "0", role: "admin", password: "admin" },
  ],
  pausas: {
    lunes: [
      { id: "l1", title: "Estiramiento Matutino", videoId: "dQw4w9WgXcQ", duration: "5 min", companyIds: [] },
      { id: "l2", title: "Respiración Alpha", videoId: "9bZkp7q19f0", duration: "3 min", companyIds: ["1"] },
    ],
    miercoles: [
      { id: "m1", title: "Movilidad Articular", videoId: "dQw4w9WgXcQ", duration: "6 min", companyIds: [] },
      { id: "m2", title: "Pausa Visual", videoId: "9bZkp7q19f0", duration: "4 min", companyIds: [] },
    ],
    viernes: [
      { id: "v1", title: "Activación Beta", videoId: "dQw4w9WgXcQ", duration: "7 min", companyIds: ["2"] },
      { id: "v2", title: "Relajación Final", videoId: "9bZkp7q19f0", duration: "5 min", companyIds: [] },
    ],
  },
  tracking: [],
  announcements: [
    { id: "1", title: "¡Bienvenidos!", content: "Estamos felices de ver a todo el equipo sumándose a las pausas activas.", date: new Date().toISOString() },
  ],
};

// ─── Store helpers ────────────────────────────────────────────────────────────

const STORAGE_KEY = "reactiva_db";

function getDB(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDB;
    return { ...defaultDB, ...JSON.parse(raw) };
  } catch {
    return defaultDB;
  }
}

function saveDB(db: DB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── API (same interface as the Express backend) ──────────────────────────────

export const api = {
  // Companies
  getCompanies(): Company[] {
    return getDB().companies;
  },
  addCompany(data: Omit<Company, "id" | "active">): Company {
    const db = getDB();
    const company = { id: Date.now().toString(), active: true, ...data };
    db.companies.push(company);
    saveDB(db);
    return company;
  },
  deleteCompany(id: string) {
    const db = getDB();
    db.companies = db.companies.filter((c) => c.id !== id);
    saveDB(db);
  },

  // Users
  getUsers(): User[] {
    return getDB().users;
  },
  addUser(data: Omit<User, "id">): User {
    const db = getDB();
    const user = { id: Date.now().toString(), ...data };
    db.users.push(user);
    saveDB(db);
    return user;
  },
  deleteUser(id: string) {
    const db = getDB();
    db.users = db.users.filter((u) => u.id !== id);
    saveDB(db);
  },
  findUser(email: string, password: string): User | null {
    const db = getDB();
    return db.users.find((u) => u.email === email && u.password === password) ?? null;
  },

  // Pausas
  getPausas(companyId?: string): DB["pausas"] {
    const db = getDB();
    if (!companyId) return db.pausas;
    const filtered: DB["pausas"] = { lunes: [], miercoles: [], viernes: [] };
    (["lunes", "miercoles", "viernes"] as const).forEach((day) => {
      filtered[day] = db.pausas[day].filter(
        (p) => p.companyIds.length === 0 || p.companyIds.includes(companyId)
      );
    });
    return filtered;
  },
  addPausa(day: keyof DB["pausas"], data: Omit<Pausa, "id">): Pausa {
    const db = getDB();
    const pausa = { id: Date.now().toString(), ...data };
    db.pausas[day].push(pausa);
    saveDB(db);
    return pausa;
  },
  deletePausa(day: keyof DB["pausas"], id: string) {
    const db = getDB();
    db.pausas[day] = db.pausas[day].filter((p) => p.id !== id);
    saveDB(db);
  },

  // Tracking
  getTracking(): TrackingEntry[] {
    return getDB().tracking;
  },
  addTracking(data: Omit<TrackingEntry, "id" | "date">): TrackingEntry {
    const db = getDB();
    const entry = { id: Date.now().toString(), date: new Date().toISOString(), ...data };
    db.tracking.push(entry);
    saveDB(db);
    return entry;
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    return getDB().announcements;
  },
  setAnnouncement(data: { title: string; content: string }): Announcement {
    const db = getDB();
    const ann = { id: Date.now().toString(), ...data, date: new Date().toISOString() };
    db.announcements = [ann];
    saveDB(db);
    return ann;
  },
};

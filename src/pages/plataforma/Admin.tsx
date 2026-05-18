import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Users, 
  Building2, 
  BarChart3, 
  Search, 
  MoreVertical,
  ArrowUpRight,
  LogOut,
  Settings,
  ShieldCheck,
  PieChart,
  Menu,
  X,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  Mail,
  Play,
  FileBarChart
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from "recharts";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { api } from "./lib/store";

function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }

interface Company {
  id: string;
  name: string;
  contactEmail?: string;
  phone?: string;
  active: boolean;
}

export default function Admin({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "users" | "content" | "tracking">("overview");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pausas, setPausas] = useState<any>({});
  const [tracking, setTracking] = useState<any[]>([]);
  
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("");
  
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCompany, setNewUserCompany] = useState("");
  
  const [newVideoDay, setNewVideoDay] = useState<string>("lunes");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoId, setNewVideoId] = useState("");
  const [newVideoDuration, setNewVideoDuration] = useState("");
  const [selectedVideoCompanies, setSelectedVideoCompanies] = useState<string[]>([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");

  const fetchData = () => {
    setCompanies(api.getCompanies());
    setUsers(api.getUsers());
    setPausas(api.getPausas());
    setTracking(api.getTracking());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCompany = (e: React.FormEvent) => {
    e.preventDefault();
    api.addCompany({ name: newCompanyName, contactEmail: newCompanyEmail, phone: newCompanyPhone });
    setNewCompanyName("");
    setNewCompanyEmail("");
    setNewCompanyPhone("");
    fetchData();
  };

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    api.addUser({ name: newUserName, email: newUserEmail, companyId: newUserCompany, role: "user", password: "1234" });
    setNewUserName("");
    setNewUserEmail("");
    fetchData();
  };

  const addVideo = (e: React.FormEvent) => {
    e.preventDefault();
    api.addPausa(newVideoDay as any, { title: newVideoTitle, videoId: newVideoId, duration: newVideoDuration, companyIds: selectedVideoCompanies });
    setNewVideoTitle("");
    setNewVideoId("");
    setNewVideoDuration("");
    setSelectedVideoCompanies([]);
    fetchData();
  };

  const deleteItem = (type: string, id: string, day?: string) => {
    if (confirm("¿Seguro que deseas eliminar este item?")) {
      if (type === "company") api.deleteCompany(id);
      else if (type === "user") api.deleteUser(id);
      else if (type === "pausa" && day) api.deletePausa(day as any, id);
      fetchData();
    }
  };

  const addAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    api.setAnnouncement({ title: announcementTitle, content: announcementContent });
    setAnnouncementTitle("");
    setAnnouncementContent("");
    alert("Anuncio publicado con éxito");
  };

  const tabs = [
    { id: "overview", label: "Vista General", icon: BarChart3 },
    { id: "companies", label: "Empresas", icon: Building2 },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "content", label: "Contenido", icon: PieChart },
    { id: "tracking", label: "Seguimiento", icon: FileBarChart },
  ];

  // Helper for tracking charts
  const getTrackingDataByCompany = () => {
    const filtered = tracking.filter(t => {
      if (dateFilter === "week") {
        const d = new Date(t.date);
        const now = new Date();
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (dateFilter === "month") {
        const d = new Date(t.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });

    return companies.map(c => ({
      name: c.name,
      completados: filtered.filter(t => {
        const user = users.find(u => u.name === t.userId);
        return user?.companyId === c.id;
      }).length
    }));
  };

  const getEnergyDataByCompany = () => {
    return companies.map(c => {
      const companyTracking = tracking.filter(t => {
        const user = users.find(u => u.name === t.userId);
        return user?.companyId === c.id;
      });
      const avg = companyTracking.length > 0 
        ? companyTracking.reduce((acc, t) => acc + (t.finalEnergy || t.energy || 0), 0) / companyTracking.length 
        : 0;
      return {
        name: c.name,
        avg: Math.round(avg)
      };
    });
  };

  const getEmojiData = () => {
    const emojis = ["Energizado", "Neutral", "Cansado"];
    return emojis.map(e => ({
      name: e,
      value: tracking.filter(t => t.feedback === e).length
    }));
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans text-accent selection:bg-primary selection:text-white">
      {/* Mobile Header Overlay */}
      <div className="lg:hidden fixed top-0 w-full bg-accent text-white p-4 flex justify-between items-center z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold tracking-tighter uppercase">Reactiva Control</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-72 bg-accent text-white p-8 flex flex-col justify-between z-40 transition-transform lg:translate-x-0 shadow-2xl shadow-black/20",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div>
          <div className="flex items-center gap-3 mb-16 hidden lg:flex">
            <span className="font-display font-bold text-2xl tracking-tighter">
              <span className="text-white">Re</span>
              <span className="text-primary italic">Activa</span>
            </span>
          </div>
          
          <nav className="space-y-2 mt-16 lg:mt-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-6 block lg:ml-2">Panel Operativo</p>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                    : "hover:bg-white/5 text-gray-400"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-gray-600")} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
             <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Estado del Sistema</p>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold font-mono">Sync: Operational</span>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Panel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 p-6 lg:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-8 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="w-8 h-px bg-primary" />
               <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Consola Administrativa</h1>
            </div>
            <h2 className="text-4xl font-display font-bold tracking-tighter uppercase whitespace-nowrap">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <Calendar className="w-4 h-4 text-gray-300" />
                <span className="text-xs font-bold font-mono">17 MAY 2026</span>
             </div>
             <button className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-6xl font-display font-bold tracking-tighter text-accent mb-2">{users.length}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Colaboradores Activos</div>
                </div>
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                    <Building2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-6xl font-display font-bold tracking-tighter text-accent mb-2">{companies.length}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Empresas en Red</div>
                </div>
                <div className="bg-accent text-white p-10 rounded-[40px] shadow-2xl shadow-black/20 relative overflow-hidden group">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-primary/20">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-6xl font-display font-bold tracking-tighter mb-2 relative z-10 italic">92%</div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] relative z-10">Productividad Estimada</div>
                  {/* Patterns */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/40 transition-colors" />
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h3 className="font-display font-bold text-xl uppercase tracking-tighter italic">Nueva Comunicación Global</h3>
                </div>
                <form onSubmit={addAnnouncement} className="space-y-4">
                  <input 
                    value={announcementTitle} 
                    onChange={e => setAnnouncementTitle(e.target.value)} 
                    placeholder="TÍTULO DEL AVISO..." 
                    className="w-full bg-gray-50 p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                    required 
                  />
                  <textarea 
                    value={announcementContent} 
                    onChange={e => setAnnouncementContent(e.target.value)} 
                    placeholder="CONTENIDO DEL COMUNICADO..." 
                    className="w-full bg-gray-50 p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]" 
                    required 
                  />
                  <button className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all">
                    Publicar a todos los usuarios
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "companies" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Sociedades Vinculadas</h3>
                   <span className="text-[10px] font-bold bg-accent text-white px-3 py-1 rounded-full uppercase tracking-widest">{companies.length}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {companies.map(c => (
                    <div key={c.id} className="p-8 flex justify-between items-center group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-100 rounded-3xl flex items-center justify-center text-accent font-display font-bold text-xl group-hover:bg-primary group-hover:text-white transition-all">
                          {c.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-accent uppercase tracking-tight mb-1">{c.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-3">
                            <Mail className="w-3 h-3" />
                            <span>{c.contactEmail}</span>
                            <span className="text-gray-200">|</span>
                            <span>{c.phone}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteItem("company", c.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {companies.length === 0 && (
                     <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-[0.3em] text-xs">No hay empresas registradas</div>
                  )}
                </div>
              </div>
              <form onSubmit={addCompany} className="bg-white p-10 rounded-[40px] border border-gray-100 h-fit shadow-2xl shadow-gray-100/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-8 bg-primary rounded-full transition-all group-hover:h-10" />
                  <h3 className="font-display font-bold uppercase text-xl tracking-tighter whitespace-nowrap">Alta de Empresa</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 block ml-1">Razón Social</label>
                    <input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} placeholder="NOMBRE..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 block ml-1">Email Gestión</label>
                    <input value={newCompanyEmail} onChange={e => setNewCompanyEmail(e.target.value)} placeholder="EMAIL..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 block ml-1">Contacto Directo</label>
                    <input value={newCompanyPhone} onChange={e => setNewCompanyPhone(e.target.value)} placeholder="TELÉFONO..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                  </div>
                  <button className="w-full bg-accent text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary shadow-xl shadow-black/5 transition-all mt-4 transform active:scale-95">Sincronizar Sociedad</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "users" && (
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Directorio de Usuarios</h3>
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input placeholder="Buscar..." className="bg-white border border-gray-100 pl-11 pr-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/10" />
                   </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map(u => (
                    <div key={u.id} className="p-8 flex justify-between items-center group hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center font-display font-bold text-xl ring-4 ring-offset-4 ring-transparent group-hover:ring-primary/10 transition-all">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-accent uppercase tracking-tight mb-1">{u.name}</div>
                          <div className="flex flex-wrap items-center gap-3">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{u.email}</span>
                             <span className="w-1 h-1 bg-gray-200 rounded-full" />
                             <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg">
                               {companies.find(c => c.id === u.companyId)?.name}
                             </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteItem("user", u.id)} className="opacity-0 group-hover:opacity-100 w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={addUser} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-100/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="font-display font-bold uppercase text-xl tracking-tighter">Alta de Usuario</h3>
                </div>
                <div className="space-y-5">
                  <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="NOMBRE Y APELLIDO..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                  <input value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="EMAIL CORPORATIVO..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                  <div className="relative">
                    <select value={newUserCompany} onChange={e => setNewUserCompany(e.target.value)} className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                      <option value="">ASIGNAR EMPRESA</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ArrowUpRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                  <button className="w-full bg-accent text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary shadow-xl shadow-black/5 transition-all mt-4 transform active:scale-95">Enroll Colaborador</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "content" && (
             <div className="space-y-12 pb-20">
              {/* Calendar View */}
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-accent italic">Calendario de Pausas Activas</h3>
                  <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Mayo 2026</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"].map(d => (
                    <div key={d} className="text-center text-[9px] font-bold text-gray-300 py-2">{d}</div>
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const dayNum = i + 1;
                    const date = new Date(2026, 4, dayNum);
                    const dayLabel = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][date.getDay()];
                    const hasPausa = pausas[dayLabel]?.length > 0;
                    
                    return (
                      <div key={i} className={cn(
                        "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-50 transition-all",
                        hasPausa ? "bg-primary/5 border-primary/20" : "bg-white"
                      )}>
                        <span className={cn("text-xs font-bold", hasPausa ? "text-primary" : "text-gray-300")}>{dayNum}</span>
                        {hasPausa && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-8">
                {["lunes", "miercoles", "viernes"].map((day, idx) => (
                  <div key={day} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50">
                    <div className={cn(
                      "p-6 border-b border-gray-100 font-display font-bold tracking-tighter uppercase text-xl flex justify-between items-center italic",
                      idx === 0 ? "bg-primary/5 text-primary" : "bg-accent/5 text-accent"
                    )}>
                      <span>{day}</span>
                      <span className="bg-white text-accent px-4 py-1.5 rounded-2xl text-[10px] font-bold shadow-sm tracking-widest">{pausas[day]?.length || 0} Sesiones</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {pausas[day]?.map((p: any) => (
                        <div key={p.id} className="p-8 flex justify-between items-center group hover:bg-gray-50 transition-all">
                          <div className="flex items-center gap-8">
                            <div className="w-32 aspect-video bg-gray-100 rounded-3xl overflow-hidden relative shadow-lg group-hover:scale-105 transition-transform">
                               <img src={`https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-accent/20 transition-opacity group-hover:opacity-0" />
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-125 transition-transform">
                                    <Play className="w-3 h-3 text-white fill-white" />
                                  </div>
                               </div>
                            </div>
                            <div>
                              <div className="font-display font-bold text-xl text-accent uppercase tracking-tighter mb-2 italic">{p.title}</div>
                              <div className="flex flex-wrap items-center gap-3">
                                {(!p.companyIds || p.companyIds.length === 0) ? (
                                  <span className="font-bold uppercase bg-primary text-white px-2 py-1 rounded-lg text-[8px] tracking-[0.2em] shadow-lg shadow-primary/20">Global</span>
                                ) : (
                                  p.companyIds.map((cid: string) => (
                                    <span key={cid} className="font-bold uppercase bg-accent text-white px-2 py-1 rounded-lg text-[8px] tracking-[0.2em]">
                                      {companies.find(c => c.id === cid)?.name}
                                    </span>
                                  ))
                                )}
                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                   <Clock className="w-3 h-3" />
                                   <span>{p.duration}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => deleteItem("pausa", p.id, day)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      {(!pausas[day] || pausas[day].length === 0) && (
                        <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-[0.4em] text-[10px] italic">Canal sin programar</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={addVideo} className="bg-white p-10 rounded-[40px] border border-gray-100 h-fit lg:sticky lg:top-12 shadow-2xl shadow-gray-100/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-8 bg-primary rounded-full group-hover:h-10 transition-all" />
                  <h3 className="font-display font-bold uppercase text-xl tracking-tighter">Despliegue</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 block ml-1">Planning semanal</label>
                    <select value={newVideoDay} onChange={e => setNewVideoDay(e.target.value)} className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" required>
                      <option value="lunes">DURANTE EL LUNES</option>
                      <option value="miercoles">DURANTE EL MIÉRCOLES</option>
                      <option value="viernes">DURANTE EL VIERNES</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 block ml-1">Segmentación</label>
                    <div className="grid grid-cols-1 gap-2 bg-gray-50 p-6 rounded-3xl max-h-56 overflow-y-auto border border-gray-100">
                      <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer group hover:text-primary transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedVideoCompanies.length === 0} 
                          onChange={() => setSelectedVideoCompanies([])}
                          className="rounded w-4 h-4 accent-primary"
                        />
                        Target Global
                      </label>
                      <div className="h-px bg-gray-100 my-2" />
                      {companies.map(c => (
                        <label key={c.id} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer group hover:text-primary transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedVideoCompanies.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedVideoCompanies([...selectedVideoCompanies, c.id]);
                              else setSelectedVideoCompanies(selectedVideoCompanies.filter(cid => cid !== c.id));
                            }}
                            className="rounded w-4 h-4 accent-primary"
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <input value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} placeholder="TÍTULO DE SESIÓN..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" required />
                  <input value={newVideoId} onChange={e => setNewVideoId(e.target.value)} placeholder="ID DE YOUTUBE..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" required />
                  <input value={newVideoDuration} onChange={e => setNewVideoDuration(e.target.value)} placeholder="DURACIÓN (MIN)..." className="w-full bg-gray-50 border-0 p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" required />
                  
                  <button className="w-full bg-accent text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary shadow-xl shadow-black/5 transition-all mt-4 transform active:scale-95">Publicar Now</button>
                </div>
              </form>
            </div>
          </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-12 pb-20">
              <div className="flex bg-white p-2 rounded-2xl border border-gray-100 w-fit mb-8 shadow-sm">
                 {["all", "week", "month"].map((f) => (
                    <button 
                      key={f} 
                      onClick={() => setDateFilter(f)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        dateFilter === f ? "bg-accent text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
                      )}
                    >
                      {f === "all" ? "Todo el tiempo" : f === "week" ? "Esta semana" : "Último mes"}
                    </button>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Chart: Completion by Company */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-10 text-center">Sesiones Completadas por Empresa</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTrackingDataByCompany()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                        <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" />
                        <YAxis fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" />
                        <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            cursor={{ fill: 'rgba(0, 208, 132, 0.05)' }}
                        />
                        <Bar dataKey="completados" fill="#00D084" radius={[12, 12, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart: Energy average by Company */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-10 text-center">Nivel de Energía Promedio</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getEnergyDataByCompany()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                        <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" />
                        <YAxis fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            cursor={{ fill: 'rgba(255, 92, 0, 0.05)' }}
                            formatter={(value) => [`${value}%`, 'Energía Promedio']}
                        />
                        <Bar dataKey="avg" fill="#FF5C00" radius={[12, 12, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart: Feedback Distribution */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden lg:col-span-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-10 text-center">Emocionalidad Corporativa</h3>
                  <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-10">
                    <div className="w-full h-full sm:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={getEmojiData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {getEmojiData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={[
                                "#00D084", // Primary Green
                                "#FFB081", // Accent Orange/Peach
                                "#0D1B2A", // Dark Navy
                              ][index % 3]} cornerRadius={10} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-4 w-full sm:w-1/2">
                      {getEmojiData().map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-primary/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: [
                                "#00D084", // Primary Green
                                "#FFB081", // Accent Orange/Peach
                                "#0D1B2A", // Dark Navy
                              ][index % 3] }} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">{entry.name}</span>
                          </div>
                          <span className="text-xs font-display font-bold text-gray-400 group-hover:text-primary">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-100/30 ring-1 ring-gray-100">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-accent text-white rounded-2xl flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                     </div>
                     <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Registro de Flujo Operativo</h3>
                  </div>
                  <button 
                    onClick={() => alert("Generando PDF Mensual para RRHH...\nIncluyendo:\n- Tasa de cumplimiento\n- Evolución de energía\n- Feedback consolidado")}
                    className="flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 group"
                  >
                    <Download className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                    Exportar Reporte Mensual PDF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/30">
                        <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 border-b border-gray-100">Colaborador</th>
                        <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 border-b border-gray-100">Cuenta</th>
                        <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 border-b border-gray-100">Sincronización</th>
                        <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 border-b border-gray-100">Pausa</th>
                        <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 border-b border-gray-100">Feeling</th>
                        <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 border-b border-gray-100">Nivel</th>
                        <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 border-b border-gray-100 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tracking.map((t: any) => {
                        const user = users.find(u => u.name === t.userId);
                        const company = companies.find(c => c.id === user?.companyId);
                        return (
                          <tr key={t.id} className="hover:bg-gray-50 transition-all group">
                            <td className="p-6">
                              <div className="font-bold text-sm text-accent uppercase tracking-tight">{t.userId}</div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{user?.email}</div>
                            </td>
                            <td className="p-6">
                              <span className="text-[9px] font-bold text-accent bg-gray-100 px-3 py-1.5 rounded-xl uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                                {company?.name || "Global"}
                              </span>
                            </td>
                            <td className="p-6 text-[10px] font-mono font-bold text-gray-400 tracking-tighter italic">
                               {new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}
                            </td>
                            <td className="p-6 text-xs font-bold text-accent italic uppercase tracking-tighter">{t.pausaId || "Sesión"}</td>
                            <td className="p-6">
                              <span className={cn(
                                "text-[9px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm",
                                t.feedback === "Energizado" || t.feedback === "Óptima" ? "bg-green-500 text-white" :
                                t.feedback === "Neutral" || t.feedback === "Media" ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                              )}>
                                {t.feedback || "---"}
                              </span>
                            </td>
                            <td className="p-6">
                              <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner mb-2 border border-gray-200">
                                <div className="bg-primary h-full" style={{ width: `${t.energy || 50}%` }} />
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 font-mono italic tracking-tighter">{t.energy || 50}%</div>
                            </td>
                            <td className="p-6 text-right">
                              <div className="inline-flex items-center gap-2 text-green-500 font-bold text-[9px] uppercase tracking-[0.2em] bg-green-50 px-3 py-1.5 rounded-xl">
                                <CheckCircle className="w-3 h-3" />
                                Synced
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

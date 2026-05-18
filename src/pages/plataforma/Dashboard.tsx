import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Play, 
  LogOut, 
  Clock, 
  FileText, 
  ArrowLeft,
  ChevronRight,
  ArrowRight,
  Flame,
  Info as InfoIcon,
  Smile,
  Meh,
  Frown
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { api } from "./lib/store";

function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }

interface Pausa {
  id: string;
  title: string;
  videoId: string;
  duration: string;
}

interface User {
  role: string;
  name: string;
  companyId: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

type ModalStep = "pre" | "video" | "post";

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [selectedDay, setSelectedDay] = useState<"lunes" | "miercoles" | "viernes">("lunes");
  const [pausas, setPausas] = useState<Record<string, Pausa[]>>({});
  const [completed, setCompleted] = useState<string[]>([]);
  const [showVideo, setShowVideo] = useState<Pausa | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>("pre");
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  // States for session tracking
  const [initialEnergy, setInitialEnergy] = useState(50);
  const [finalEnergy, setFinalEnergy] = useState(50);
  const [initialMood, setInitialMood] = useState("");
  const [finalMood, setFinalMood] = useState("");
  const [streak, setStreak] = useState(3);

  useEffect(() => {
    const pausasData = api.getPausas(user.role === "admin" ? undefined : user.companyId);
    setPausas(pausasData as any);
    const anns = api.getAnnouncements();
    if (anns.length > 0) setAnnouncement(anns[0]);
    const saved = localStorage.getItem(`reactiva_progress_${user.name}`);
    if (saved) setCompleted(JSON.parse(saved));
  }, [user.name, user.companyId, user.role]);

  const toggleComplete = (id: string, initialEn?: number, finalEn?: number) => {
    const newCompleted = completed.includes(id) 
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    localStorage.setItem(`reactiva_progress_${user.name}`, JSON.stringify(newCompleted));

    if (!completed.includes(id) && initialEn !== undefined && finalEn !== undefined) {
      api.addTracking({
        userId: user.name,
        pausaId: id,
        completed: true,
        initialEnergy: initialEn,
        finalEnergy: finalEn,
        feedback: finalMood,
        companyId: user.companyId
      });
    }
  };

  const days = [
    { id: "lunes", label: "LU" },
    { id: "miercoles", label: "MI" },
    { id: "viernes", label: "VI" },
  ];

  const totalSessionsThisWeek = Object.values(pausas).flat().length;
  const isWeeklyFormAvailable = completed.length >= Math.max(1, totalSessionsThisWeek - 1);

  return (
    <div className="min-h-screen bg-[#F4F7F6] font-sans text-accent selection:bg-primary selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <span className="font-display font-bold tracking-tighter text-2xl">
              <span className="text-accent">Re</span>
              <span className="text-primary italic">Activa</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
            <Flame className="w-5 h-5 text-primary fill-primary/20 animate-pulse" />
            <span className="text-sm font-bold text-primary">{streak} días de racha</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block border-r border-gray-100 pr-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Módulo de Usuario</p>
            <p className="text-sm font-bold">{user.name}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {announcement && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-primary text-white p-6 rounded-[32px] flex items-center gap-6 shadow-xl shadow-primary/20 relative overflow-hidden group"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <InfoIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-display font-bold tracking-tight mb-1 uppercase">Comunicado Oficial</h4>
              <p className="text-white/80 text-sm font-medium italic">{announcement.content}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
               <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">Tu progreso</span>
               <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                  <Flame className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{streak} Fire Streak</span>
               </div>
            </div>
            <h2 className="text-5xl font-display font-bold leading-[1.1] mb-6 tracking-tighter">
              El secreto es la<br/> <span className="text-primary italic">constancia.</span>
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed text-lg">
              Selecciona tu descanso del día. Solo necesitas 5 minutos para <br/>
              cambiar el rumbo de tu jornada laboral.
            </p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 h-fit shadow-sm">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id as any)}
                className={cn(
                  "w-12 h-12 rounded-xl text-xs font-bold transition-all duration-300",
                  selectedDay === day.id 
                    ? "bg-accent text-white shadow-xl shadow-black/20 scale-105" 
                    : "text-gray-400 hover:text-accent hover:bg-gray-50"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {pausas[selectedDay]?.map((pausa, idx) => (
            <motion.div
              layoutId={pausa.id}
              key={pausa.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border border-gray-100 rounded-[32px] p-8 hover:border-primary/20 hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer relative lg:odd:mt-4 lg:even:mb-4 shadow-sm"
              onClick={() => {
                setShowVideo(pausa);
                setModalStep("pre");
              }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <Play className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="transition-all hover:scale-110 active:scale-95">
                  {completed.includes(pausa.id) ? (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 border-2 border-gray-100 rounded-full" />
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2">Pausa Activa {idx + 1}</p>
                <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{pausa.title}</h3>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-gray-300" />
                  <span>{pausa.duration}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-accent transition-colors">Empezar ahora</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className={cn(
              "lg:col-span-3 text-white rounded-[40px] p-10 flex flex-col justify-between group cursor-pointer overflow-hidden relative shadow-2xl transition-all",
              isWeeklyFormAvailable ? "bg-[#0D1B2A] cursor-pointer" : "bg-gray-200 cursor-not-allowed opacity-80"
            )} 
            onClick={() => isWeeklyFormAvailable && setShowWeeklyForm(true)}
          >
            <div className="mb-12 relative z-10">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                isWeeklyFormAvailable ? "bg-gradient-to-br from-primary to-[#00A36C] shadow-primary/20" : "bg-gray-400 shadow-none"
              )}>
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-display font-bold mb-4 tracking-tighter uppercase">Evolución <br/> <span className="text-primary italic">Reactiva</span></h3>
              <p className="text-white/60 text-sm font-medium max-w-sm leading-relaxed">
                {isWeeklyFormAvailable 
                  ? "¡Has completado tus sesiones! Cuéntanos cómo te sientes esta semana." 
                  : "Completa todas las pausas de la semana para desbloquear este formulario."}
              </p>
            </div>
            {isWeeklyFormAvailable && (
              <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all group-hover:gap-5 relative z-10">
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            )}
            
            {isWeeklyFormAvailable && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[80px] -ml-24 -mb-24" />
              </>
            )}
          </motion.div>

          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[40px] p-10 flex flex-col justify-between shadow-xl shadow-gray-200/50">
            <div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-6xl font-display font-bold text-accent tracking-tighter">{Math.round((completed.length / totalSessionsThisWeek || 1) * 100)}%</span>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pb-3">Score semanal</span>
              </div>
              <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden mb-8 border border-gray-100">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(completed.length / totalSessionsThisWeek || 1) * 100}%` }}
                   className="bg-primary h-full shadow-lg shadow-primary/20"
                />
              </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
               </div>
               <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                 Has completado <span className="text-accent font-bold">{completed.length} de {totalSessionsThisWeek}</span> sesiones recomendadas. ¡Sigue así!
               </p>
            </div>
          </div>
        </div>
      </main>

      {/* Video Modal with Pre/Post tracking */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent/95 backdrop-blur-xl"
          >
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowVideo(null)}
                className="absolute top-8 right-8 z-20 w-12 h-12 bg-gray-50 hover:bg-primary hover:text-white text-accent rounded-xl flex items-center justify-center transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                <div className="lg:w-3/5 bg-black aspect-video lg:aspect-auto flex items-center justify-center relative">
                   {modalStep === "video" ? (
                     <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${showVideo.videoId}?autoplay=1&rel=0`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                   ) : (
                     <div className="absolute inset-0 bg-accent flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
                           <Play className="text-primary w-10 h-10 fill-primary" />
                        </div>
                        <h2 className="text-white text-3xl font-display font-bold uppercase tracking-tight mb-4">¿Todo listo para empezar?</h2>
                        <p className="text-white/40 max-w-xs uppercase tracking-widest text-[10px] font-bold">Completa el chequeo de estado para desbloquear el video.</p>
                     </div>
                   )}
                </div>
                
                <div className="lg:w-2/5 p-12 flex flex-col justify-between bg-white overflow-y-auto">
                  {modalStep === "pre" && (
                     <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3 block">Paso 1: Check-In</span>
                        <h3 className="text-3xl font-display font-bold mb-4 tracking-tighter uppercase">¿Cómo te sientes ahora?</h3>
                        <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">Saber cómo empiezas nos ayuda a entender el impacto de la sesión en tu bienestar actual.</p>
                        
                        <div className="space-y-8">
                          <div className="flex gap-3">
                            {[
                              { icon: <Frown className="w-6 h-6"/>, label: "Bajo", val: "bajo" },
                              { icon: <Meh className="w-6 h-6"/>, label: "Medio", val: "medio" },
                              { icon: <Smile className="w-6 h-6"/>, label: "Alto", val: "alto" }
                            ].map(m => (
                              <button 
                                key={m.val}
                                onClick={() => setInitialMood(m.val)}
                                className={cn(
                                  "flex-1 py-6 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all",
                                  initialMood === m.val ? "border-primary bg-primary/5 text-primary" : "border-gray-50 bg-gray-50 text-gray-400"
                                )}
                              >
                                {m.icon}
                                <span className="text-[10px] font-bold uppercase">{m.label}</span>
                              </button>
                            ))}
                          </div>

                          <div>
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Energía Inicial</span>
                                <span className="text-primary font-bold">{initialEnergy}%</span>
                             </div>
                             <input 
                                type="range" 
                                value={initialEnergy} 
                                onChange={(e) => setInitialEnergy(parseInt(e.target.value))}
                                className="w-full h-3 bg-gray-100 rounded-lg appearance-none accent-primary" 
                             />
                          </div>

                          <button 
                            disabled={!initialMood}
                            onClick={() => setModalStep("video")}
                            className="w-full bg-accent text-white py-5 rounded-[20px] font-bold uppercase tracking-widest mt-8 hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                          >
                            <span>Entrar a la sesión</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                     </div>
                  )}

                  {modalStep === "video" && (
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3 block">Paso 2: En Proceso</span>
                      <h3 className="text-3xl font-display font-bold mb-4 tracking-tighter uppercase">{showVideo.title}</h3>
                      <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">Respira profundo. Sigue el ritmo del video y olvida el ruido exterior por unos momentos.</p>
                      
                      <button 
                        onClick={() => setModalStep("post")}
                        className="w-full bg-accent text-white py-5 rounded-[20px] font-bold uppercase tracking-widest mt-8 hover:bg-primary transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-3"
                      >
                        <span>Finalizar sesión</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {modalStep === "post" && (
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3 block">Paso 3: Check-Out</span>
                      <h3 className="text-3xl font-display font-bold mb-4 tracking-tighter uppercase">¿Hubo algún cambio?</h3>
                      <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">Compara tu estado actual con el de hace unos minutos. El bienestar se construye en cada pausa.</p>
                      
                      <div className="space-y-8">
                        <div className="flex gap-3">
                          {[
                            { icon: <Frown className="w-6 h-6"/>, label: "Bajo", val: "bajo" },
                            { icon: <Meh className="w-6 h-6"/>, label: "Medio", val: "medio" },
                            { icon: <Smile className="w-6 h-6"/>, label: "Alto", val: "alto" }
                          ].map(m => (
                            <button 
                              key={m.val}
                              onClick={() => setFinalMood(m.val)}
                              className={cn(
                                "flex-1 py-6 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all",
                                finalMood === m.val ? "border-green-500 bg-green-50 text-green-600" : "border-gray-50 bg-gray-50 text-gray-400"
                              )}
                            >
                              {m.icon}
                              <span className="text-[10px] font-bold uppercase">{m.label}</span>
                            </button>
                          ))}
                        </div>

                        <div>
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Energía Final</span>
                              <span className="text-green-600 font-bold">{finalEnergy}%</span>
                           </div>
                           <input 
                              type="range" 
                              value={finalEnergy} 
                              onChange={(e) => setFinalEnergy(parseInt(e.target.value))}
                              className="w-full h-3 bg-gray-100 rounded-lg appearance-none accent-green-500" 
                           />
                        </div>

                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                           <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Evolución de energía</p>
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-accent">{initialEnergy}%</span>
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${initialEnergy}%` }} />
                              </div>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500" style={{ width: `${finalEnergy}%` }} />
                              </div>
                              <span className="text-sm font-bold text-green-600">{finalEnergy}%</span>
                           </div>
                        </div>

                        <button 
                          disabled={!finalMood}
                          onClick={() => {
                            toggleComplete(showVideo.id, initialEnergy, finalEnergy);
                            setShowVideo(null);
                            setStreak(prev => prev + (completed.includes(showVideo.id) ? 0 : 1)); // Simplified streak logic
                          }}
                          className="w-full bg-primary text-white py-5 rounded-[20px] font-bold uppercase tracking-widest mt-4 hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95"
                        >
                          Guardar y cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Form Overlay */}
      <AnimatePresence>
        {showWeeklyForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white"
          >
            <div className="w-full max-w-2xl px-6">
              <button 
                onClick={() => setShowWeeklyForm(false)}
                className="mb-12 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancelar y volver</span>
              </button>
              
              <h2 className="text-5xl font-display font-bold mb-10 tracking-tighter uppercase underline decoration-primary decoration-4 underline-offset-8">MÉTODO <br/> <span className="text-gray-300 italic">REACTIVA</span></h2>
              
              <div className="space-y-12">
                <div>
                  <p className="text-lg mb-6 font-bold uppercase tracking-tight text-accent">1. ¿Cuántas sesiones lograste esta semana?</p>
                  <div className="flex gap-3">
                    {[0,1,2,3,4,5,6].map(n => (
                      <button key={n} className="flex-1 aspect-square rounded-2xl border-2 border-gray-100 hover:border-primary hover:bg-gray-50 transition-all flex items-center justify-center font-display font-bold text-xl">
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                   <p className="text-lg mb-6 font-bold uppercase tracking-tight text-accent">2. ¿Cómo evaluarías tu bienestar general ahora?</p>
                   <div className="flex gap-4">
                      {["Mal", "Regular", "Bien", "Excelente"].map(b => (
                         <button key={b} className="flex-1 py-4 bg-gray-50 border-2 border-transparent hover:border-primary rounded-xl text-xs font-bold uppercase tracking-widest">{b}</button>
                      ))}
                   </div>
                </div>

                <button 
                   onClick={() => {
                     setShowWeeklyForm(false);
                     // Optionally send weekly analytics
                   }}
                   className="w-full bg-accent text-white py-6 rounded-[24px] font-bold uppercase tracking-widest text-sm hover:bg-primary transition-all duration-300 shadow-2xl shadow-black/10 active:scale-95"
                >
                  Enviar Diagnóstico Final
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

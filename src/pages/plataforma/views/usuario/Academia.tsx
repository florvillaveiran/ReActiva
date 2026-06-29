import React, { useState, useMemo, useEffect } from 'react';
import { Search, Play, CheckCircle2, ArrowLeft, Clock, GraduationCap, BookOpen, Star, Sparkles, Filter, X, Target } from 'lucide-react';

// --- MOCK DATA ---
const CATEGORIES = [
  'Todos', 'Ergonomía', 'Dolor musculoesquelético', 'Sueño', 'Hidratación', 
  'Salud visual', 'Entorno saludable', 'Estrés', 'Respiración', 'Organización del trabajo'
];

interface Taller {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  image: string;
  videoId: string;
  timeToComplete: string;
  objectives: string[];
  learning: string[];
  benefits: string[];
}

const TALLERES: Taller[] = [
  {
    id: 'ergonomia-basica',
    title: 'Ergonomía en el Home Office',
    description: 'Ajustes esenciales para trabajar sin dolor desde casa.',
    category: 'Ergonomía',
    duration: '12 min',
    level: 'Básico',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    videoId: '4tP5slYAwcY',
    timeToComplete: '15 minutos',
    objectives: ['Identificar posturas lesivas', 'Configurar tu silla y monitor'],
    learning: ['Altura ideal del escritorio', 'Regla de los 90 grados'],
    benefits: ['Menos dolor cervical', 'Mayor confort al final del día']
  },
  {
    id: 'dolor-cervical',
    title: 'Prevención de dolor cervical',
    description: 'Entiende por qué duele el cuello y cómo evitarlo.',
    category: 'Dolor musculoesquelético',
    duration: '15 min',
    level: 'Intermedio',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600',
    videoId: 'RO8ha2ltBo8',
    timeToComplete: '20 minutos',
    objectives: ['Reducir tensión en trapecios', 'Mejorar movilidad del cuello'],
    learning: ['Ejercicios de liberación', 'Automasaje cervical'],
    benefits: ['Reducción inmediata de tensión', 'Prevención de cefaleas tensionales']
  },
  {
    id: 'rutina-sueno',
    title: 'Higiene del sueño para profesionales',
    description: 'Estrategias nocturnas para recuperar energía real.',
    category: 'Sueño',
    duration: '10 min',
    level: 'Básico',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=600',
    videoId: 'jxrxN5D1KhE',
    timeToComplete: '10 minutos',
    objectives: ['Crear una rutina de desconexión', 'Mejorar arquitectura del sueño'],
    learning: ['Impacto de la luz azul', 'Técnicas de relajación pre-sueño'],
    benefits: ['Despertar con más energía', 'Mayor foco matutino']
  },
  {
    id: 'hidratacion-foco',
    title: 'Agua y cerebro: el link invisible',
    description: 'Cómo la hidratación impacta tu capacidad de concentración.',
    category: 'Hidratación',
    duration: '8 min',
    level: 'Básico',
    image: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&q=80&w=600',
    videoId: 'pNIgbZvnZxY',
    timeToComplete: '10 minutos',
    objectives: ['Entender la deshidratación leve', 'Crear hábitos de ingesta'],
    learning: ['Momentos clave para tomar agua', 'Síntomas de falta de hidratación'],
    benefits: ['Sostener energía', 'Evitar caídas de atención en la tarde']
  },
  {
    id: 'fatiga-visual',
    title: 'Descanso visual activo',
    description: 'Protege tus ojos en jornadas intensas de pantallas.',
    category: 'Salud visual',
    duration: '6 min',
    level: 'Básico',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    videoId: '51yo4a4wlWA',
    timeToComplete: '8 minutos',
    objectives: ['Reducir ojo seco', 'Prevenir fatiga visual informática'],
    learning: ['Regla 20-20-20', 'Ejercicios de acomodación visual'],
    benefits: ['Menos ardor en los ojos', 'Prevención de miopía temporal']
  },
  {
    id: 'entorno-productivo',
    title: 'Diseña tu espacio, diseña tu mente',
    description: 'Optimiza luz, ruido y plantas para reducir estrés.',
    category: 'Entorno saludable',
    duration: '14 min',
    level: 'Intermedio',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    videoId: 'pogg_OsgWno',
    timeToComplete: '15 minutos',
    objectives: ['Auditar tu espacio de trabajo', 'Implementar diseño biofílico básico'],
    learning: ['Ubicación respecto a la ventana', 'Control de ruido pasivo'],
    benefits: ['Menor carga cognitiva', 'Sensación de bienestar al trabajar']
  },
  {
    id: 'reseteo-estres',
    title: 'Reseteo del sistema nervioso',
    description: 'Técnicas exprés para bajar revoluciones en días difíciles.',
    category: 'Estrés',
    duration: '9 min',
    level: 'Avanzado',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
    videoId: '4tP5slYAwcY',
    timeToComplete: '10 minutos',
    objectives: ['Identificar picos de cortisol', 'Activar sistema parasimpático'],
    learning: ['Técnica de grounding', 'Pausas compasivas'],
    benefits: ['Recuperar la calma rápido', 'Evitar el burnout diario']
  },
  {
    id: 'respiracion-foco',
    title: 'Respiración para el enfoque',
    description: 'Utiliza tu respiración para volver al presente.',
    category: 'Respiración',
    duration: '5 min',
    level: 'Básico',
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600',
    videoId: 'RO8ha2ltBo8',
    timeToComplete: '5 minutos',
    objectives: ['Aprender respiración diafragmática', 'Respiración box (caja)'],
    learning: ['Patrones de respiración', 'Uso táctico antes de reuniones'],
    benefits: ['Claridad mental', 'Reducción de ansiedad anticipatoria']
  },
  {
    id: 'organizacion-bloques',
    title: 'Trabajo profundo y bloques',
    description: 'Cómo organizar tu agenda para reducir la carga mental.',
    category: 'Organización del trabajo',
    duration: '18 min',
    level: 'Intermedio',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=600',
    videoId: 'jxrxN5D1KhE',
    timeToComplete: '20 minutos',
    objectives: ['Minimizar cambio de contexto', 'Proteger tiempo de foco'],
    learning: ['Time-blocking', 'Gestión asíncrona de mensajes'],
    benefits: ['Menor agotamiento', 'Sentimiento de progreso real']
  }
];

// --- COMPONENTS ---

const VideoModal: React.FC<{ videoId: string; title: string; onClose: () => void }> = ({ videoId, title, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', animation: 'fadeIn 0.2s',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '960px',
          backgroundColor: 'black', borderRadius: '16px',
          overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: '#0f172a' }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{title}</p>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export const Academia: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTallerId, setSelectedTallerId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const [progreso, setProgreso] = useState<Record<string, 'en_progreso' | 'completado'>>({});
  const [pausasData, setPausasData] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('reactiva_academia_progreso') || '{}');
      setProgreso(stored);
      const pausas = JSON.parse(localStorage.getItem('reactiva_pausas') || '[]');
      setPausasData(pausas);
    } catch {}
  }, []);

  const saveProgreso = (id: string, estado: 'en_progreso' | 'completado') => {
    const newProgreso = { ...progreso, [id]: estado };
    setProgreso(newProgreso);
    localStorage.setItem('reactiva_academia_progreso', JSON.stringify(newProgreso));
  };

  const getScores = useMemo(() => {
    let scores: Record<string, number> = {};
    TALLERES.forEach((t, i) => scores[t.id] = TALLERES.length - i);

    pausasData.forEach(p => {
      const energia = p.energia || 0;
      const dolor = p.dolor;
      const zona = p.zona || '';
      const tension = p.respuestas?.tension || '';
      const trabajo = p.respuestas?.trabajo || '';
      
      if (energia > 0 && energia <= 2) {
        scores['rutina-sueno'] += 50;
        scores['hidratacion-foco'] += 40;
        scores['respiracion-foco'] += 30;
      }
      if (dolor) {
        scores['ergonomia-basica'] += 60;
        scores['dolor-cervical'] += 50;
        if (zona.toLowerCase().includes('cuello') || zona.toLowerCase().includes('hombro')) {
          scores['fatiga-visual'] += 30;
        }
      }
      if (tension.toLowerCase().includes('mañana') || tension.toLowerCase().includes('tarde') || (p.estres && p.estres > 3)) {
        scores['reseteo-estres'] += 60;
        scores['respiracion-foco'] += 40;
        scores['organizacion-bloques'] += 30;
      }
      if (trabajo.toLowerCase().includes('disperso')) {
        scores['organizacion-bloques'] += 50;
        scores['entorno-productivo'] += 40;
      }
    });
    return scores;
  }, [pausasData]);

  const isFiltering = activeCategory !== 'Todos' || searchQuery !== '';
  
  const topRecomendadoId = useMemo(() => {
    const unstarted = TALLERES.filter(t => !progreso[t.id]);
    if (unstarted.length === 0 || pausasData.length === 0) return null;
    unstarted.sort((a, b) => getScores[b.id] - getScores[a.id]);
    return unstarted[0].id;
  }, [getScores, progreso, pausasData]);

  const completadosCount = Object.values(progreso).filter(e => e === 'completado').length;
  const pctCompletado = TALLERES.length > 0 ? Math.round((completadosCount / TALLERES.length) * 100) : 0;

  const handleOpenTaller = (id: string) => {
    setSelectedTallerId(id);
    if (!progreso[id]) {
      saveProgreso(id, 'en_progreso');
    }
  };

  // VISTA DE DETALLE
  if (selectedTallerId) {
    const selectedTaller = TALLERES.find(t => t.id === selectedTallerId)!;
    const related = TALLERES.filter(t => t.id !== selectedTaller.id && (t.category === selectedTaller.category || Math.random() > 0.5)).slice(0, 3);
    const isCompletado = progreso[selectedTaller.id] === 'completado';

    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '3rem' }}>
        <button 
          onClick={() => setSelectedTallerId(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: '20px', transition: 'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={18} /> Volver a la Academia
        </button>

        <div style={{ borderRadius: '24px', overflow: 'hidden', backgroundColor: '#1e293b', position: 'relative', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ position: 'relative', width: '100%', height: '400px', backgroundImage: `url(${selectedTaller.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.4))' }} />
             
             <div style={{ position: 'absolute', bottom: '2rem', left: '2.5rem', right: '2.5rem' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block' }}>
                  {selectedTaller.category}
                </span>
                <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1 }}>{selectedTaller.title}</h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '700px' }}>{selectedTaller.description}</p>
             </div>

             <button
                onClick={() => setPlayingVideoId(selectedTaller.videoId)}
                style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: 80, height: 80, borderRadius: '50%', border: 'none',
                  backgroundColor: 'var(--primary-color)', color: 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
             >
                <Play size={32} fill="white" style={{ marginLeft: '4px' }} />
             </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target color="var(--primary-color)" /> Objetivos del taller
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedTaller.objectives.map((obj, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-color)', fontSize: '1.05rem' }}>
                    <CheckCircle2 size={20} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} /> {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen color="var(--primary-color)" /> Lo que aprenderás
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedTaller.learning.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)', fontSize: '1.05rem', padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'sticky', top: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Duración</span>
                  <span style={{ fontWeight: 600 }}>{selectedTaller.duration}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={16} /> Nivel</span>
                  <span style={{ fontWeight: 600 }}>{selectedTaller.level}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={16} /> Completarlo lleva</span>
                  <span style={{ fontWeight: 600 }}>{selectedTaller.timeToComplete}</span>
                </div>
              </div>

              <button 
                onClick={() => saveProgreso(selectedTaller.id, isCompletado ? 'en_progreso' : 'completado')}
                style={{ 
                  width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', 
                  backgroundColor: isCompletado ? '#f0fdf4' : 'var(--primary-color)', 
                  color: isCompletado ? '#166534' : 'white', 
                  fontWeight: 700, fontSize: '1rem', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s', border: isCompletado ? '2px solid #bbf7d0' : '2px solid var(--primary-color)'
                }}
              >
                {isCompletado ? <><CheckCircle2 size={20} /> Taller Completado</> : 'Marcar como completado'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Recursos relacionados</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {related.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleOpenTaller(t.id)}
                style={{ cursor: 'pointer', backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.2s', display: 'flex', gap: '15px', padding: '12px', alignItems: 'center' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: '90px', height: '90px', borderRadius: '12px', backgroundImage: `url(${t.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', lineHeight: 1.2 }}>{t.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.duration} • {t.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {playingVideoId && (
          <VideoModal videoId={playingVideoId} title={selectedTaller.title} onClose={() => setPlayingVideoId(null)} />
        )}
      </div>
    );
  }

  // Taller Card Component
  const renderCard = (taller: Taller) => {
    const estado = progreso[taller.id];
    const isInProgress = estado === 'en_progreso';
    const isCompleted = estado === 'completado';
    const isRecomendado = taller.id === topRecomendadoId && !isFiltering;

    return (
      <div key={taller.id} style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', border: isRecomendado ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default', boxShadow: isRecomendado ? '0 4px 20px rgba(0, 194, 168, 0.15)' : 'none' }}
           onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isRecomendado ? '0 12px 30px rgba(0, 194, 168, 0.2)' : '0 12px 30px rgba(0,0,0,0.06)'; }}
           onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isRecomendado ? '0 4px 20px rgba(0, 194, 168, 0.15)' : 'none'; }}
      >
        <div style={{ height: '180px', backgroundImage: `url(${taller.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)' }} />
          
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#334155', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              {taller.category}
            </span>
          </div>

          {isRecomendado && (
             <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--primary-color)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0, 194, 168, 0.3)' }}>
               <Sparkles size={12} /> Recomendado para vos
             </div>
          )}

          {isCompleted && (
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
              <CheckCircle2 size={14} /> Completado
            </div>
          )}
          
          {isInProgress && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', backgroundColor: 'rgba(255,255,255,0.3)' }}>
               <div style={{ width: '40%', height: '100%', backgroundColor: '#f59e0b' }} />
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.5rem', lineHeight: 1.2 }}>{taller.title}</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {taller.description}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              <Clock size={16} /> {taller.duration}
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              <Star size={16} /> {taller.level}
            </span>
          </div>

          <button 
            onClick={() => handleOpenTaller(taller.id)}
            style={{ 
              width: '100%', padding: '0.8rem', borderRadius: '12px', 
              border: isInProgress ? 'none' : (isRecomendado ? '1px solid var(--primary-color)' : '1px solid var(--border-color)'), 
              backgroundColor: isInProgress ? '#fffbeb' : (isRecomendado ? 'var(--primary-color)' : 'transparent'), 
              color: isInProgress ? '#d97706' : (isRecomendado ? 'white' : 'var(--text-color)'), 
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
            onMouseOver={e => { 
              if (isInProgress) {
                e.currentTarget.style.backgroundColor = '#fef3c7';
              } else if (!isRecomendado) {
                e.currentTarget.style.backgroundColor = 'var(--primary-color)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--primary-color)'; 
              }
            }}
            onMouseOut={e => { 
              if (isInProgress) {
                e.currentTarget.style.backgroundColor = '#fffbeb';
              } else if (!isRecomendado) {
                e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; e.currentTarget.style.borderColor = 'var(--border-color)'; 
              }
            }}
          >
            {isInProgress ? <><Play size={16} fill="#d97706" /> Continuar</> : 'Ver taller'}
          </button>
        </div>
      </div>
    );
  };

  // VISTA PRINCIPAL
  const sortedTalleres = useMemo(() => {
    let filtered = [...TALLERES];

    if (activeCategory !== 'Todos') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      const isRecomendadoA = a.id === topRecomendadoId && !isFiltering;
      const isRecomendadoB = b.id === topRecomendadoId && !isFiltering;
      
      if (isRecomendadoA) return -1;
      if (isRecomendadoB) return 1;

      const isProgresoA = progreso[a.id] === 'en_progreso';
      const isProgresoB = progreso[b.id] === 'en_progreso';

      if (isProgresoA && !isProgresoB) return -1;
      if (!isProgresoA && isProgresoB) return 1;

      return getScores[b.id] - getScores[a.id];
    });

    return filtered;
  }, [activeCategory, searchQuery, getScores, topRecomendadoId, isFiltering, progreso]);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '3rem' }}>
      {/* Header & Progress - Compactado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={24} />
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
              Academia ReActiva
            </h1>
          </div>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
            Aprendé a cuidar tu bienestar con contenidos prácticos desarrollados por profesionales.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '180px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
             <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Progreso:</span>
             <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-color)' }}>{completadosCount} de {TALLERES.length}</span>
             <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)' }}>({pctCompletado}%)</span>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pctCompletado}%`, backgroundColor: 'var(--primary-color)', borderRadius: '3px', transition: 'width 0.5s ease-out' }} />
          </div>
        </div>
      </div>

      {/* Controls - Compactado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por título o palabra clave..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
            onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'white',
                color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                border: `1px solid ${activeCategory === cat ? 'var(--primary-color)' : 'var(--border-color)'}`
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER LOGIC: SINGLE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {sortedTalleres.map(t => renderCard(t))}
      </div>
      
      {sortedTalleres.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Filter size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No se encontraron talleres</h3>
          <p>Probá buscando con otros términos o quitando los filtros.</p>
        </div>
      )}
    </div>
  );
};

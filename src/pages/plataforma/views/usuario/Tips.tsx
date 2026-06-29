import React, { useMemo, useState, useEffect } from 'react';
import { 
  AlertCircle, ArrowLeft, BatteryCharging, BookOpenCheck, CalendarCheck, 
  CheckCircle2, ClipboardCheck, Droplets, Lightbulb, Moon, Sparkles, 
  Target, Trophy, Leaf, Eye, Brain, MonitorSmartphone, Clock, Star, Flame
} from 'lucide-react';

interface TipCategory {
  id: string;
  title: string;
  detailTitle: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  recommendations: string[];
  mainRecommendation: string;
  why: string;
  evidence: string;
  steps: string[];
  signals: string[];
  challenge: string;
  iconBg: string;
  iconColor: string;
  difficulty: 'Fácil' | 'Moderado' | 'Avanzado';
  time: string;
  benefit: string;
  relatedTip?: string;
}

const tipCategories: TipCategory[] = [
  {
    id: 'hidratacion',
    title: 'Hidratación',
    detailTitle: 'Hidratación inteligente durante la jornada',
    subtitle: 'Un hábito simple para sostener energía, concentración y bienestar mientras trabajás.',
    icon: <Droplets size={22} />,
    description: 'Recordatorios simples para tomar más agua durante la jornada.',
    recommendations: [
      'Aprovechá cada pausa para hidratarte.',
      'Tomá un vaso de agua antes de tu primera reunión.',
      'Dejá una botella visible en tu escritorio.',
    ],
    mainRecommendation: 'Tomá un vaso de agua al comenzar cada bloque de trabajo o después de cada pausa activa.',
    why: 'Ayuda a sostener energía, concentración y bienestar. En jornadas largas, tomar agua tarde suele aparecer como cansancio, dolor de cabeza o baja atención.',
    evidence: 'La evidencia sugiere que una deshidratación leve puede afectar atención, ánimo y energía. Asociar agua a momentos concretos del día puede reducir fatiga percibida.',
    steps: [
      'Dejá una botella o vaso visible en tu escritorio.',
      'Tomá agua al iniciar una tarea nueva.',
      'Usá cada pausa activa como recordatorio para hidratarte.',
    ],
    signals: [
      'Boca seca',
      'Dolor de cabeza leve',
      'Cansancio sin motivo claro',
      'Baja atención',
      'Baja energía',
    ],
    challenge: 'Tomá un vaso de agua antes de tus próximas 2 reuniones o bloques de trabajo.',
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    difficulty: 'Fácil',
    time: '1 minuto',
    benefit: 'Sostiene tu energía y evita dolores de cabeza.',
    relatedTip: 'energia'
  },
  {
    id: 'sueno',
    title: 'Sueño',
    detailTitle: 'Mejor descanso para rendir mejor mañana',
    subtitle: 'Un cierre más tranquilo del día para recuperar energía y foco.',
    icon: <Moon size={22} />,
    description: 'Consejos para descansar mejor y recuperar energía.',
    recommendations: [
      'Evitá pantallas intensas 30 minutos antes de dormir.',
      'Intentá acostarte en un horario similar cada noche.',
      'Generá una rutina breve para cerrar el día.',
    ],
    mainRecommendation: 'Reducí pantallas intensas y estímulos fuertes al menos 30 minutos antes de dormir.',
    why: 'Dormir mejor impacta en energía, foco, memoria y estado de ánimo. Cuando descansamos mal, concentrarse cuesta más y el día se siente pesado.',
    evidence: 'La evidencia asocia buena calidad de sueño con mejor atención y regulación emocional. La luz intensa cerca de dormir puede dificultar el descanso en algunas personas.',
    steps: [
      'Definí una hora aproximada para empezar a bajar el ritmo.',
      'Reducí brillo de pantallas o dejá el celular fuera de la cama.',
      'Cambiá pantalla por lectura suave, respiración o preparar mañana.',
    ],
    signals: [
      'Te despertás cansado',
      'Necesitás mucho café',
      'Te cuesta concentrarte',
      'Irritabilidad durante el día',
      'Somnolencia en reuniones',
    ],
    challenge: 'Hoy, dejá el celular 30 minutos antes de dormir o activá modo descanso.',
    iconBg: '#eef2ff',
    iconColor: '#4f46e5',
    difficulty: 'Moderado',
    time: '30 minutos',
    benefit: 'Recuperación física y mental completa.',
    relatedTip: 'estres'
  },
  {
    id: 'energia',
    title: 'Energía',
    detailTitle: 'Pausas breves para recuperar energía',
    subtitle: 'Movimiento simple para cortar la rigidez y volver con más claridad.',
    icon: <BatteryCharging size={22} />,
    description: 'Ideas para mantenerte activo sin depender solo del café.',
    recommendations: [
      'Levantate 2 minutos cada 90 minutos.',
      'Cambiá de postura entre bloques de trabajo.',
      'Activá el cuerpo unos minutos entre reuniones.',
    ],
    mainRecommendation: 'Cada 60 a 90 minutos, levantate 2 minutos, caminá un poco o cambiá de postura.',
    why: 'Cortar horas sentado reduce rigidez y fatiga. Una pausa breve activa el cuerpo y ayuda a volver al trabajo con más claridad.',
    evidence: 'La evidencia sobre sedentarismo sugiere que interrumpir períodos sentado con movimiento breve puede reducir molestias y fatiga percibida.',
    steps: [
      'Poné una alarma suave cada 60 o 90 minutos.',
      'Levantate y mové hombros, cuello y espalda.',
      'Caminá unos pasos antes de volver a la pantalla.',
    ],
    signals: [
      'Pesadez corporal',
      'Tensión en cuello u hombros',
      'Baja energía sentado',
      'Cuesta retomar el foco',
      'Sensación de rigidez',
    ],
    challenge: 'Hacé una pausa de movimiento de 2 minutos antes de tu próxima reunión.',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    difficulty: 'Fácil',
    time: '2 minutos',
    benefit: 'Reduce la rigidez y despierta tu mente.',
    relatedTip: 'ergonomia'
  },
  {
    id: 'organizacion',
    title: 'Organización',
    detailTitle: 'Más foco, menos sobrecarga mental',
    subtitle: 'Una forma simple de ordenar prioridades y bajar la dispersión.',
    icon: <CalendarCheck size={22} />,
    description: 'Hábitos simples para trabajar con más foco y menos agotamiento.',
    recommendations: [
      'Elegí las 3 tareas más importantes del día.',
      'Definí una prioridad antes de abrir mails.',
      'Agrupá tareas similares para evitar dispersión.',
    ],
    mainRecommendation: 'Antes de empezar el día, elegí tus 3 tareas más importantes.',
    why: 'Elegir prioridades baja la saturación mental. Te ayuda a trabajar con más claridad, menos dispersión y mayor sensación de avance.',
    evidence: 'La evidencia sobre carga cognitiva sugiere que reducir multitarea, ordenar prioridades y trabajar por bloques favorece la concentración.',
    steps: [
      'Antes de abrir mails o chats, anotá tus 3 prioridades.',
      'Elegí una tarea principal para empezar.',
      'Agrupá tareas similares para cambiar menos de contexto.',
    ],
    signals: [
      'Saltás de tarea en tarea',
      'Sentís poco avance',
      'Muchas pestañas abiertas',
      'No sabés por dónde empezar',
      'Sentís saturación mental',
    ],
    challenge: 'Elegí ahora las 3 tareas más importantes del día y marcá una como prioridad principal.',
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    difficulty: 'Moderado',
    time: '5 minutos',
    benefit: 'Reduce el estrés y aumenta la productividad.',
    relatedTip: 'entorno'
  },
  {
    id: 'entorno',
    title: 'Entorno saludable',
    detailTitle: 'Un espacio diseñado para tu bienestar',
    subtitle: 'Pequeños cambios en tu espacio pueden mejorar el bienestar, reducir el estrés y favorecer la concentración.',
    icon: <Leaf size={22} />,
    description: 'Optimizá tu espacio de trabajo para mayor comodidad y enfoque.',
    recommendations: [
      'Asegurate de tener buena luz natural.',
      'Mantené tu escritorio despejado.',
      'Agregá una planta a tu espacio de trabajo.',
    ],
    mainRecommendation: 'Ordená tu escritorio al finalizar el día para empezar mañana con la mente despejada.',
    why: 'El entorno físico afecta directamente tu estado mental. Un espacio ordenado y agradable reduce el cortisol (hormona del estrés) y facilita la concentración.',
    evidence: 'Estudios demuestran que la presencia de plantas y luz natural en espacios de trabajo mejora el estado de ánimo y la productividad.',
    steps: [
      'Identificá 3 cosas que no necesitas en tu escritorio y guardalas.',
      'Abrí las ventanas 10 minutos al día para ventilar.',
      'Posicioná tu escritorio cerca de una fuente de luz natural si es posible.',
    ],
    signals: [
      'Sensación de encierro',
      'Dificultad para concentrarse',
      'Agotamiento visual',
      'Estrés al sentarse a trabajar',
      'Postura encorvada',
    ],
    challenge: 'Hoy, dedicá 3 minutos al final del día a ordenar tu espacio de trabajo.',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    difficulty: 'Fácil',
    time: '3 minutos',
    benefit: 'Reduce el estrés visual y mejora el ánimo.',
    relatedTip: 'organizacion'
  },
  {
    id: 'vision',
    title: 'Salud visual',
    detailTitle: 'Descanso para tus ojos en la era digital',
    subtitle: 'Reducí la fatiga ocular y mejorá tu comodidad frente a la pantalla.',
    icon: <Eye size={22} />,
    description: 'Prácticas para proteger tu vista durante largas jornadas.',
    recommendations: [
      'Aplicá la regla 20-20-20.',
      'Ajustá el brillo de tu monitor al entorno.',
      'Recordá parpadear frecuentemente.',
    ],
    mainRecommendation: 'Cada 20 minutos, mirá algo a 20 pies (6 metros) de distancia durante 20 segundos.',
    why: 'Mirar una pantalla por mucho tiempo reduce la frecuencia de parpadeo y tensa los músculos oculares, provocando fatiga y sequedad.',
    evidence: 'La regla 20-20-20 está recomendada por oftalmólogos mundialmente para prevenir el Síndrome Visual Informático.',
    steps: [
      'Poné un recordatorio o usá un pomodoro modificado.',
      'Buscá una ventana o el punto más lejano de tu habitación.',
      'Enfocá tu vista allí conscientemente por al menos 20 segundos.',
    ],
    signals: [
      'Ojos secos o rojos',
      'Visión borrosa temporal',
      'Dolor de cabeza frontal',
      'Sensibilidad a la luz',
      'Pesadez en los párpados',
    ],
    challenge: 'Ajustá ahora el brillo de tu monitor para que coincida con la luz de la habitación.',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    difficulty: 'Fácil',
    time: '20 segundos',
    benefit: 'Previene la sequedad ocular y dolores de cabeza.',
    relatedTip: 'entorno'
  },
  {
    id: 'estres',
    title: 'Estrés',
    detailTitle: 'Herramientas simples para bajar la carga mental',
    subtitle: 'Prácticas rápidas para recuperar la calma durante la jornada laboral.',
    icon: <Brain size={22} />,
    description: 'Técnicas para gestionar momentos de tensión y ansiedad.',
    recommendations: [
      'Hacé 3 respiraciones profundas antes de una reunión.',
      'Tomate un micro-descanso mental de 1 minuto.',
      'Escribí lo que te preocupa para sacarlo de tu cabeza.',
    ],
    mainRecommendation: 'Cuando sientas abrumo, practicá la respiración 4-7-8 (inhalar 4s, retener 7s, exhalar 8s).',
    why: 'El estrés constante mantiene el sistema en alerta. Respirar desactiva la respuesta de "lucha o huida".',
    evidence: 'Técnicas de respiración controlada activan el sistema nervioso parasimpático, reduciendo el ritmo cardíaco.',
    steps: [
      'Cerrá los ojos o bajá la mirada.',
      'Inhalá por la nariz contando hasta 4.',
      'Contené la respiración contando hasta 7.',
      'Exhalá lentamente por la boca contando hasta 8. Repetí 3 veces.'
    ],
    signals: [
      'Respiración corta y superficial',
      'Tensión en la mandíbula o cuello',
      'Irritabilidad',
      'Sensación de urgencia constante',
      'Palpitaciones',
    ],
    challenge: 'Hacé 3 ciclos de respiración profunda antes de abrir tu correo electrónico hoy.',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    difficulty: 'Fácil',
    time: '1 minuto',
    benefit: 'Calma inmediata del sistema nervioso.',
    relatedTip: 'sueno'
  },
  {
    id: 'ergonomia',
    title: 'Ergonomía',
    detailTitle: 'Postura y comodidad en tu escritorio',
    subtitle: 'Pequeños ajustes que hacen más cómodo trabajar durante muchas horas.',
    icon: <MonitorSmartphone size={22} />,
    description: 'Ajustes en tu espacio físico para prevenir dolores musculares.',
    recommendations: [
      'Alineá tu monitor a la altura de tus ojos.',
      'Mantené los pies apoyados en el suelo.',
      'Asegurá que tus codos formen un ángulo de 90 grados.',
    ],
    mainRecommendation: 'Revisá la altura de tu silla y monitor para que tu cuello no esté inclinado hacia abajo.',
    why: 'Una mala postura por horas genera sobrecarga muscular, especialmente en cuello, hombros y zona lumbar.',
    evidence: 'Intervenciones ergonómicas básicas reducen significativamente trastornos musculoesqueléticos en la oficina.',
    steps: [
      'Sentate al fondo de la silla con la espalda apoyada.',
      'Ajustá la altura para que tus pies toquen el suelo firmemente.',
      'Subí o bajá el monitor para que el borde superior esté a la altura de tus ojos.',
    ],
    signals: [
      'Dolor de cuello',
      'Tensión en hombros',
      'Dolor en la zona lumbar',
      'Adormecimiento en las manos',
      'Incomodidad al estar sentado',
    ],
    challenge: 'Revisá y ajustá hoy la altura de tu monitor y tu silla.',
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    difficulty: 'Fácil',
    time: '2 minutos',
    benefit: 'Previene dolores musculares y articulares.',
    relatedTip: 'energia'
  }
];

interface PauseRecord {
  dia: string;
  bloque: 'morning' | 'afternoon';
  energia?: number;
  dolor?: boolean;
  zona?: string;
  feeling?: string;
  estres?: number;
  ayuda?: string;
  mejora?: string;
  tipo?: string;
  respuestas?: {
    tension?: string;
    trabajo?: string;
    ayuda?: string;
  }
}

const loadPausas = (): PauseRecord[] => {
  try {
    return JSON.parse(localStorage.getItem('reactiva_pausas') || '[]');
  } catch {
    return [];
  }
};

const loadVistos = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('reactiva_coach_visto') || '[]');
  } catch {
    return [];
  }
};

const saveVisto = (id: string) => {
  const vistos = loadVistos();
  if (!vistos.includes(id)) {
    localStorage.setItem('reactiva_coach_visto', JSON.stringify([...vistos, id]));
  }
};

export const UsuarioTips: React.FC = () => {
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [appliedTips, setAppliedTips] = useState<Record<string, boolean>>({});
  const [vistos, setVistos] = useState<string[]>([]);
  const [pausas, setPausas] = useState<PauseRecord[]>([]);

  useEffect(() => {
    setVistos(loadVistos());
    setPausas(loadPausas());
  }, []);

  const handleVerConsejo = (id: string) => {
    setSelectedTipId(id);
    saveVisto(id);
    setVistos(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const rankedCategories = useMemo(() => {
    let scores: Record<string, number> = {};
    tipCategories.forEach(c => scores[c.id] = 0);

    const today = new Date();
    const daySeed = Math.floor(today.getTime() / 86400000);
    tipCategories.forEach((c, i) => {
      scores[c.id] += (daySeed + i) % tipCategories.length; 
    });

    pausas.forEach(p => {
      const energia = p.energia || 0;
      const feeling = p.feeling || '';
      const dolor = p.dolor;
      const zona = p.zona || '';
      
      const tension = p.respuestas?.tension || '';
      const trabajo = p.respuestas?.trabajo || '';
      const ayuda = p.respuestas?.ayuda || '';

      if (energia > 0 && energia <= 2) {
        scores['energia'] += 30;
        scores['sueno'] += 20;
        scores['hidratacion'] += 15;
      }

      if (dolor) {
        if (zona.toLowerCase().includes('cuello') || zona.toLowerCase().includes('hombro')) {
          scores['ergonomia'] += 30;
          scores['entorno'] += 20;
          scores['energia'] += 20;
        } else {
          scores['ergonomia'] += 20;
        }
      }

      if (tension.toLowerCase().includes('mañana') || tension.toLowerCase().includes('tarde')) {
        scores['estres'] += 25;
        scores['organizacion'] += 20;
      }

      if (trabajo.toLowerCase().includes('disperso')) {
        scores['organizacion'] += 25;
        scores['vision'] += 15;
        scores['entorno'] += 15;
      }

      if (ayuda === 'No') {
        scores['energia'] += 20;
        scores['sueno'] += 15;
      }

      if (feeling === 'Mal' || feeling === 'Regular') {
        scores['estres'] += 20;
        scores['hidratacion'] += 10;
      }
    });

    tipCategories.forEach(c => {
      if (vistos.includes(c.id)) {
        scores[c.id] -= 1000; 
      }
    });

    return [...tipCategories].sort((a, b) => scores[b.id] - scores[a.id]);
  }, [pausas, vistos]);

  const dailyTip = useMemo(() => {
    return rankedCategories[0] || tipCategories[0];
  }, [rankedCategories]);

  const selectedCategory = tipCategories.find((category) => category.id === selectedTipId);

  const getDayRecommendationIndex = (category: TipCategory) => {
      const today = new Date();
      const daySeed = Math.floor(today.getTime() / 86400000);
      // Hash the category id to get a stable but unique seed per category
      const catSeed = category.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (daySeed + catSeed) % category.recommendations.length;
  };

  if (selectedCategory) {
    const selectedTipApplied = Boolean(appliedTips[selectedCategory.id]);

    return (
      <div className="tips-page tips-detail-page">
        <button type="button" className="tips-back-button" onClick={() => setSelectedTipId(null)}>
          <ArrowLeft size={18} />
          Volver a ReActiva Coach
        </button>

        <header className="tips-full-header">
          <div
            className="tips-full-icon"
            style={{ backgroundColor: selectedCategory.iconBg, color: selectedCategory.iconColor }}
            aria-hidden="true"
          >
            {selectedCategory.icon}
          </div>
          <div className="tips-full-copy">
            <div className="tips-full-meta">
              <span>{selectedCategory.title}</span>
              <span className="tips-detail-badge">Tip recomendado</span>
            </div>
            <h1>{selectedCategory.detailTitle}</h1>
            <p>{selectedCategory.subtitle}</p>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', padding: '5px 12px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Clock size={15} /> Tiempo: {selectedCategory.time}
            </span>
            <span style={{ fontSize: '0.8rem', padding: '5px 12px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Star size={15} /> Dificultad: {selectedCategory.difficulty}
            </span>
            <span style={{ fontSize: '0.8rem', padding: '5px 12px', borderRadius: '20px', backgroundColor: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Flame size={15} /> Beneficio: {selectedCategory.benefit}
            </span>
        </div>

        <section className="tips-full-grid" aria-label={`Detalle de ${selectedCategory.title}`}>
          <article className="tips-full-card tips-full-card-primary">
            <div className="tips-full-card-label">
              <Target size={17} />
              <span>Recomendación principal</span>
            </div>
            <p>{selectedCategory.mainRecommendation}</p>
          </article>

          <article className="tips-full-card">
            <div className="tips-full-card-label">
              <Sparkles size={17} />
              <span>Por qué importa</span>
            </div>
            <p>{selectedCategory.why}</p>
          </article>

          <article className="tips-full-card">
            <div className="tips-full-card-label">
              <BookOpenCheck size={17} />
              <span>Evidencia</span>
            </div>
            <p>{selectedCategory.evidence}</p>
          </article>

          <article className="tips-full-card">
            <div className="tips-full-card-label">
              <ClipboardCheck size={17} />
              <span>Cómo aplicarlo hoy</span>
            </div>
            <ol>
              {selectedCategory.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="tips-full-card">
            <div className="tips-full-card-label">
              <AlertCircle size={17} />
              <span>Señales</span>
            </div>
            <ul>
              {selectedCategory.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
            <p className="tips-note">Estas señales son orientativas y no reemplazan una indicación médica.</p>
          </article>

          <article className="tips-full-card tips-challenge-card">
            <div className="tips-full-card-label">
              <Trophy size={17} />
              <span>Mini desafío</span>
            </div>
            <p>{selectedCategory.challenge}</p>
          </article>
        </section>

        {selectedCategory.relatedTip && (
            <div style={{ marginTop: '24px', padding: '16px 20px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }} onClick={() => handleVerConsejo(selectedCategory.relatedTip!)}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consejo relacionado</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '1.05rem' }}>Explorar: {tipCategories.find(c => c.id === selectedCategory.relatedTip)?.title}</span>
                    <ArrowLeft size={18} style={{ transform: 'rotate(180deg)', color: '#64748b' }} />
                </div>
            </div>
        )}

        <button
          type="button"
          className={`tips-apply-button tips-full-apply${selectedTipApplied ? ' is-applied' : ''}`}
          onClick={() => setAppliedTips((current) => ({ ...current, [selectedCategory.id]: true }))}
          style={{ marginTop: '24px' }}
        >
          {selectedTipApplied ? (
            <>
              <CheckCircle2 size={17} />
              Aplicado hoy
            </>
          ) : (
            'Lo voy a aplicar hoy'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="tips-page">
      <header className="tips-header">
        <div>
          <h1>ReActiva Coach</h1>
          <p>Tu acompañante diario de hábitos, personalizado según tu bienestar.</p>
        </div>
        <div className="tips-header-icon" aria-hidden="true">
          <Sparkles size={22} />
        </div>
      </header>

      <section className="tips-daily-card" aria-labelledby="daily-tip-title">
        <div className="tips-highlight-copy">
          <div className="tips-kicker">
            <Lightbulb size={16} />
            <span id="daily-tip-title">Recomendación para hoy</span>
          </div>
          <p>{dailyTip.mainRecommendation}</p>
        </div>
      </section>

      <section className="tips-grid" aria-label="Categorias de tips saludables">
        {rankedCategories.map((category, index) => {
            const isNew = !vistos.includes(category.id);
            const isTopRecommended = index < 2 && vistos.length > 0; 

            return (
          <article className="tips-card" key={category.title} style={{ position: 'relative' }}>
            {isNew && (
                <span style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.25)', border: '2px solid white', zIndex: 10 }}>NUEVO</span>
            )}
            {!isNew && isTopRecommended && (
                <span style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#10b981', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)', border: '2px solid white', zIndex: 10 }}>RECOMENDADO</span>
            )}

            <div className="tips-card-top">
              <div
                className="tips-card-icon"
                style={{ backgroundColor: category.iconBg, color: category.iconColor }}
                aria-hidden="true"
              >
                {category.icon}
              </div>
              <h2>{category.title}</h2>
            </div>
            <p className="tips-card-description">{category.description}</p>
            <div className="tips-recommendation">
              <span>RECOMENDACIÓN</span>
              <p>{category.recommendations[getDayRecommendationIndex(category)]}</p>
            </div>
            <button
              type="button"
              className="tips-card-button"
              onClick={() => handleVerConsejo(category.id)}
            >
              Ver consejo
            </button>
          </article>
        )})}
      </section>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, BatteryCharging, BookOpenCheck, CalendarCheck, CheckCircle2, ClipboardCheck, Droplets, Lightbulb, Moon, Sparkles, Target, Trophy } from 'lucide-react';

const tipCategories = [
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
  },
  {
    id: 'organizacion',
    title: 'Organización del trabajo',
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
  },
];

const dailyDefaultTip = {
  id: 'tip-del-dia',
  title: 'Tip del día',
  recommendation: 'Antes de tu próxima reunión, hacé una pausa de 60 segundos: respiración profunda, hombros relajados y mirada lejos de la pantalla.',
};

export const UsuarioTips: React.FC = () => {
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [appliedTips, setAppliedTips] = useState<Record<string, boolean>>({});

  const dailyRecommendationIndex = useMemo(() => {
    const today = new Date();
    const daySeed = Math.floor(today.getTime() / 86400000);
    return daySeed % 3;
  }, []);

  const selectedCategory = tipCategories.find((category) => category.id === selectedTipId);

  if (selectedCategory) {
    const selectedTipApplied = Boolean(appliedTips[selectedCategory.id]);

    return (
      <div className="tips-page tips-detail-page">
        <button type="button" className="tips-back-button" onClick={() => setSelectedTipId(null)}>
          <ArrowLeft size={18} />
          Volver a ReActiva Tips
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

        <button
          type="button"
          className={`tips-apply-button tips-full-apply${selectedTipApplied ? ' is-applied' : ''}`}
          onClick={() => setAppliedTips((current) => ({ ...current, [selectedCategory.id]: true }))}
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
          <h1>ReActiva Tips</h1>
          <p>Pequeñas acciones para sostener tu energía, foco y bienestar durante la jornada.</p>
        </div>
        <div className="tips-header-icon" aria-hidden="true">
          <Sparkles size={22} />
        </div>
      </header>

      <section className="tips-daily-card" aria-labelledby="daily-tip-title">
        <div className="tips-highlight-copy">
          <div className="tips-kicker">
            <Lightbulb size={16} />
            <span id="daily-tip-title">{dailyDefaultTip.title}</span>
          </div>
          <p>{dailyDefaultTip.recommendation}</p>
        </div>
      </section>

      <section className="tips-grid" aria-label="Categorias de tips saludables">
        {tipCategories.map((category) => (
          <article className="tips-card" key={category.title}>
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
              <p>{category.recommendations[dailyRecommendationIndex]}</p>
            </div>
            <button
              type="button"
              className="tips-card-button"
              onClick={() => setSelectedTipId(category.id)}
            >
              QUIERO ESTE TIP
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};

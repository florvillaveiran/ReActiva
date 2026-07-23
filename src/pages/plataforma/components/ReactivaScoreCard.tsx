import React, { useState } from 'react';
import { Award, CalendarCheck2, CheckCircle2, ChevronRight, ClipboardCheck, Flame, LockKeyhole, PlayCircle, Sparkles, Target, Trophy, X } from 'lucide-react';
import { useReactivaScore } from '../hooks/useReactivaScore';

const currentWeekKey = () => {
  const date = new Date();
  const weekday = date.getDay();
  date.setDate(date.getDate() - (weekday === 0 ? 6 : weekday - 1));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ReactivaScoreCard: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const { score, loading, unavailable } = useReactivaScore(enabled);
  const [open, setOpen] = useState(false);

  if (!enabled) return null;

  if (loading) {
    return <div className="reactiva-score-card reactiva-score-loading" aria-label="Cargando Puntaje ReActiva" />;
  }

  if (unavailable || !score || !score.settings.show_score_to_users) {
    return (
      <div className="reactiva-score-card reactiva-score-unavailable">
        <LockKeyhole size={20} />
        <div><strong>Puntaje ReActiva</strong><span>Se habilitará al sincronizar el programa.</span></div>
      </div>
    );
  }

  const visiblePercent = Math.max(0, Math.min(score.percent, 100));
  const remaining = Math.max(0, Math.ceil((score.maximum * score.threshold_percent) / 100 - score.score));
  const programmedWeeks = score.weeks.length;
  const currentWeek = score.weeks.find(week => week.week_start === currentWeekKey());
  const weeklyMicrotrainings = currentWeek?.microtrainings ?? 0;
  const weeklyDailyForms = currentWeek?.daily_forms ?? 0;
  const weeklyForm = Math.min(1, Math.floor((currentWeek?.weekly_forms ?? 0) / 2));
  const weeklyPercent = currentWeek?.maximum ? Math.min(100, ((currentWeek.score ?? 0) * 100) / currentWeek.maximum) : 0;
  const gameState = currentWeek?.complete ? 'complete' : weeklyPercent >= 80 ? 'near' : 'progress';
  const nextMission = weeklyMicrotrainings < 6
    ? { title: 'Hacé un microentrenamiento', helper: `${weeklyMicrotrainings}/6 esta semana`, icon: <PlayCircle size={17} /> }
    : weeklyDailyForms < 2
      ? { title: 'Respondé el formulario diario', helper: `${weeklyDailyForms}/2 esta semana`, icon: <ClipboardCheck size={17} /> }
      : weeklyForm < 1
        ? { title: 'Completá el formulario semanal', helper: 'Último paso de la semana', icon: <CalendarCheck2 size={17} /> }
        : { title: '¡Misión semanal completa!', helper: 'Tu constancia mantiene la racha', icon: <Sparkles size={17} /> };
  const weeklyMissions = [
    { label: 'Micro', value: weeklyMicrotrainings, maximum: 6, icon: <PlayCircle size={15} /> },
    { label: 'Diarios', value: weeklyDailyForms, maximum: 2, icon: <ClipboardCheck size={15} /> },
    { label: 'Semanal', value: weeklyForm, maximum: 1, icon: <CalendarCheck2 size={15} /> },
  ];
  const monthlyMissions = [
    { label: 'Microentrenamientos', value: score.breakdown.microtrainings, maximum: programmedWeeks * 6, icon: <PlayCircle size={17} /> },
    { label: 'Formularios diarios', value: score.breakdown.daily_forms, maximum: programmedWeeks * 2, icon: <ClipboardCheck size={17} /> },
    { label: 'Formulario semanal', value: score.breakdown.weekly_forms, maximum: programmedWeeks * 2, icon: <CalendarCheck2 size={17} /> },
  ];

  return (
    <>
      <button type="button" className={`reactiva-score-card reactiva-score-game-card ${gameState}`} onClick={() => setOpen(true)} aria-label="Ver detalle del Puntaje ReActiva">
        <div className="reactiva-score-card-head">
          <span className="reactiva-score-icon"><Trophy size={20} /></span>
          <span><small>Tu progreso mensual</small><strong>Puntaje ReActiva</strong></span>
          {score.settings.show_streak_to_users && score.streak > 0
            ? <span className="reactiva-game-streak"><Flame size={13} /> {score.streak}</span>
            : <ChevronRight size={18} />}
        </div>

        <div className="reactiva-game-hero">
          <span className="reactiva-game-ring" style={{ '--score-progress': `${visiblePercent * 3.6}deg` } as React.CSSProperties}>
            <span><strong>{Math.round(score.percent)}%</strong><small>{score.score}/{score.maximum} pts</small></span>
          </span>
          <span className="reactiva-game-mission">
            <small>{currentWeek?.complete ? 'Logro desbloqueado' : 'Próxima misión'}</small>
            <strong>{nextMission.icon}{nextMission.title}</strong>
            <span>{nextMission.helper}</span>
          </span>
        </div>

        <div className="reactiva-game-week">
          <span className="reactiva-game-week-title"><span>Esta semana</span><strong>{currentWeek?.score ?? 0}/{currentWeek?.maximum ?? 10}</strong></span>
          <span className="reactiva-score-progress" aria-label={`${Math.round(weeklyPercent)} por ciento semanal`}>
            <span style={{ width: `${weeklyPercent}%` }} />
          </span>
        </div>

        <div className="reactiva-game-footer">
          <span className={score.eligible ? 'is-eligible' : ''}>
            {score.eligible
              ? <><Award size={14} /> Clasificado para el sorteo</>
              : <><Target size={14} /> {remaining > 0 ? `A ${remaining} puntos del objetivo` : 'Empezá tu recorrido'}</>}
          </span>
          <span>Ver recorrido <ChevronRight size={15} /></span>
        </div>
      </button>

      {open && (
        <div className="reactiva-score-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section className={`reactiva-score-modal reactiva-score-game-modal ${gameState}`} role="dialog" aria-modal="true" aria-labelledby="reactiva-score-title">
            <header>
              <div className="reactiva-game-modal-title">
                <span><Trophy size={20} /></span>
                <div>
                  <small>Tu recorrido mensual</small>
                  <h2 id="reactiva-score-title">Puntaje ReActiva</h2>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar detalle"><X size={20} /></button>
            </header>

            <div className="reactiva-game-compact-overview">
              <span><strong>{score.score}/{score.maximum}</strong><small>Puntos del mes</small></span>
              <span className="reactiva-game-compact-progress">
                <span><small>{score.eligible ? 'Objetivo alcanzado' : `Avance · Objetivo ${score.threshold_percent}%`}</small><strong>{Math.round(score.percent)}%</strong></span>
                <span><i style={{ width: `${visiblePercent}%` }} /></span>
              </span>
              {score.settings.show_streak_to_users && (
                <span className="reactiva-game-compact-streak"><Flame size={16} /><span><strong>{score.streak}</strong><small>Racha actual</small></span></span>
              )}
            </div>

            <h3 className="reactiva-game-section-title">Actividad del mes</h3>
            <div className="reactiva-score-detail-grid">
              {monthlyMissions.map(mission => {
                const progress = mission.maximum > 0 ? Math.min(100, (mission.value * 100) / mission.maximum) : 0;
                return (
                  <div key={mission.label}>
                    <span className="reactiva-game-detail-title">{mission.icon}<span>{mission.label}</span></span>
                    <strong>{mission.value}/{mission.maximum}</strong>
                    <span className="reactiva-game-detail-progress"><i style={{ width: `${progress}%` }} /></span>
                  </div>
                );
              })}
            </div>

            <div className="reactiva-score-current-detail">
              <h3><Target size={16} /> Misiones de esta semana <span>{currentWeek?.score ?? 0}/10</span></h3>
              {weeklyMissions.map(mission => {
                const complete = mission.value >= mission.maximum;
                return (
                  <div key={mission.label} className={complete ? 'complete' : ''}>
                    <span>{complete ? <CheckCircle2 size={14} /> : mission.icon}{mission.label}</span>
                    <strong>{mission.value}/{mission.maximum}</strong>
                  </div>
                );
              })}
            </div>

            <p className="reactiva-score-disclaimer">Este puntaje refleja constancia en las actividades programadas. No mide salud ni rendimiento laboral.</p>
          </section>
        </div>
      )}
    </>
  );
};

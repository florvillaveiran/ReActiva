export type ReactivaEmailStreakState = {
  streak?: number;
  week_complete?: boolean;
  one_activity_remaining?: boolean;
};

export const reactivaStreakEmailMessage = (state: ReactivaEmailStreakState | null | undefined) => {
  if (!state) return '';
  if (state.week_complete === true) {
    return '¡Completaste todas las actividades de esta semana y mantuviste tu Racha ReActiva!';
  }
  if (state.one_activity_remaining === true) {
    return '🔥 Estás a una actividad de completar la semana y mantener tu Racha ReActiva.';
  }
  const streak = Number(state.streak ?? 0);
  if (streak <= 0) {
    return 'Completá todas las actividades de esta semana para iniciar tu Racha ReActiva.';
  }
  if (streak === 1) {
    return '¡Ya comenzaste tu Racha ReActiva! Completá esta semana para seguir avanzando.';
  }
  return `🔥 Llevás ${streak} semanas completas consecutivas. ¡Seguí así para mantener tu racha!`;
};

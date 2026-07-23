import assert from 'node:assert/strict';
import { reactivaStreakEmailMessage } from '../supabase/functions/_shared/reactiva-streak-message';

assert.equal(reactivaStreakEmailMessage(undefined), '');
assert.equal(
  reactivaStreakEmailMessage({ streak: 0 }),
  'Completá todas las actividades de esta semana para iniciar tu Racha ReActiva.',
);
assert.equal(
  reactivaStreakEmailMessage({ streak: 1 }),
  '¡Ya comenzaste tu Racha ReActiva! Completá esta semana para seguir avanzando.',
);
assert.equal(
  reactivaStreakEmailMessage({ streak: 3 }),
  '🔥 Llevás 3 semanas completas consecutivas. ¡Seguí así para mantener tu racha!',
);
assert.equal(
  reactivaStreakEmailMessage({ streak: 2, one_activity_remaining: true }),
  '🔥 Estás a una actividad de completar la semana y mantener tu Racha ReActiva.',
);
assert.equal(
  reactivaStreakEmailMessage({ streak: 2, week_complete: true }),
  '¡Completaste todas las actividades de esta semana y mantuviste tu Racha ReActiva!',
);

console.log('Emails: mensajes de Racha ReActiva verificados.');

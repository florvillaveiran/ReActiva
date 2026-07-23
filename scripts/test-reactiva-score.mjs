import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const weeklyPoints = (microtrainings, dailyForms, weeklyForm) => (
  Math.min(microtrainings, 6) + Math.min(dailyForms, 2) + (weeklyForm ? 2 : 0)
);
const monthlyMaximum = weeks => weeks * 10;
const thresholdPoints = (maximum, threshold = 80) => Math.ceil(maximum * threshold / 100);
const streaks = weeks => weeks.reduce((state, points) => {
  const current = points === 10 ? state.current + 1 : 0;
  return { current, best: Math.max(state.best, current) };
}, { current: 0, best: 0 });

assert.equal(weeklyPoints(6, 2, true), 10, 'Una semana completa debe sumar 10 puntos');
assert.equal(weeklyPoints(7, 3, true), 10, 'No se puede superar el máximo semanal');
assert.equal(monthlyMaximum(4), 40, 'Cuatro semanas deben tener máximo 40');
assert.equal(monthlyMaximum(5), 50, 'Cinco semanas deben tener máximo 50');
assert.equal(thresholdPoints(40), 32, 'El umbral de 40 debe ser 32');
assert.equal(thresholdPoints(50), 40, 'El umbral de 50 debe ser 40');
assert.equal(thresholdPoints(monthlyMaximum(2)), 16, 'Un alta con dos semanas debe requerir 16 puntos');
assert.deepEqual(streaks([10, 10, 9, 10]), { current: 1, best: 2 }, 'Una semana incompleta reinicia la racha y conserva la mejor');

const deduplicated = new Map();
for (const event of [
  { id: 'video-1', points: 1 },
  { id: 'video-1', points: 1 },
  { id: 'daily-1', points: 1 },
]) deduplicated.set(event.id, event);
assert.equal([...deduplicated.values()].reduce((total, event) => total + event.points, 0), 2, 'Una actividad repetida no debe duplicar puntos');

const files = {
  user: await readFile(new URL('../src/pages/plataforma/components/ReactivaScoreCard.tsx', import.meta.url), 'utf8'),
  userDashboard: await readFile(new URL('../src/pages/plataforma/views/usuario/Dashboard.tsx', import.meta.url), 'utf8'),
  team: await readFile(new URL('../src/pages/plataforma/components/ReactivaTeamScorePanel.tsx', import.meta.url), 'utf8'),
  admin: await readFile(new URL('../src/pages/plataforma/views/admin/Dashboard.tsx', import.meta.url), 'utf8'),
  rrhh: await readFile(new URL('../src/pages/plataforma/views/rrhh/EmpresaDashboard.tsx', import.meta.url), 'utf8'),
  emails: await readFile(new URL('../src/pages/plataforma/views/admin/Emails.tsx', import.meta.url), 'utf8'),
  migration: await readFile(new URL('../supabase/migrations/20260722120000_reactiva_score_system.sql', import.meta.url), 'utf8'),
};

assert.match(files.user, /Tu progreso mensual/);
assert.match(files.user, /Clasificado para el sorteo/);
assert.match(files.user, /Racha actual/);
assert.match(files.user, /Próxima misión/);
assert.match(files.user, /reactiva-game-ring/);
assert.match(files.user, /Misiones de esta semana/);
assert.match(files.user, /reactiva-game-compact-overview/);
assert.doesNotMatch(files.user, /showJourney/);
assert.match(files.user, /Avance · Objetivo/);
assert.doesNotMatch(files.user, /Objetivo del sorteo/);
assert.match(files.userDashboard, /PAUSE_AVAILABILITY_HOURS = 24/);
assert.match(files.userDashboard, /pendingWithinWindow/);
assert.match(files.userDashboard, /user-week-summary/);
assert.doesNotMatch(files.userDashboard, /showWeek/);
assert.match(files.userDashboard, /DEFAULT_VIDEO_POSTER = '\/logo-reactiva-white\.png'/);
assert.match(files.userDashboard, /poster=\{posterUrl \|\| DEFAULT_VIDEO_POSTER\}/);
assert.doesNotMatch(files.userDashboard, /RECOMENDADO AHORA/);
assert.doesNotMatch(files.userDashboard, /Primero mirá el video completo/);
assert.doesNotMatch(files.userDashboard, /Relaja tu mente/);
assert.match(files.team, /downloadCsv/);
assert.match(files.team, /downloadPdf/);
assert.match(files.team, /Racha completa/);
assert.match(files.team, /A un paso/);
assert.match(files.team, /reactiva-team-row-progress/);
assert.match(files.team, /reactiva-breakdown-progress/);
assert.match(files.team, /showPeople/);
assert.match(files.team, /Detalle de colaboradores/);
assert.doesNotMatch(files.team, /% recorrido/);
assert.match(files.team, /state-\$\{visual\.state\}/);
assert.match(files.team, /Reporte de Puntaje ReActiva/);
assert.match(files.team, /Fecha de exportación/);
assert.match(files.team, /sep=;/);
assert.match(files.team, /logo-reactiva-white\.png/);
assert.match(files.team, /pdf\.getNumberOfPages/);
assert.doesNotMatch(files.team, /Ver clasificados/);
assert.match(files.team, /showCompanyFilter/);
assert.match(files.admin, /Puntaje ReActiva/);
assert.match(files.admin, /showExportActions/);
assert.doesNotMatch(files.admin, /calculateReactivaIndex/);
assert.match(files.rrhh, /ReactivaTeamScorePanel/);
assert.match(files.rrhh, /averageScoreForPeriod/);
assert.match(files.rrhh, /showScoreDetail/);
assert.match(files.rrhh, /Puntaje ReActiva/);
assert.match(files.rrhh, /rrhh-metric-card-action/);
assert.match(files.rrhh, /showExportActions=\{false\}/);
assert.doesNotMatch(files.emails, /Variables de Puntaje ReActiva/);
assert.match(files.emails, /Incluir estado de la Racha ReActiva/);
assert.match(files.emails, /includeReactivaStreak/);
assert.match(files.migration, /unique \(profile_id, activity_type, activity_id\)/i);
assert.match(files.migration, /reactiva_user_best_streak/);
assert.match(files.migration, /show_score_to_rrhh/);

console.log('Puntaje ReActiva: cálculos y conexiones principales verificados.');

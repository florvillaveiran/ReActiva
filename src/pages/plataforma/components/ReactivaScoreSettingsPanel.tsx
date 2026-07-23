import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Save } from 'lucide-react';
import { fetchReactivaScoreSettings, saveReactivaScoreSettings, type EditableReactivaScoreSettings } from '../lib/reactivaScore';

const defaults: EditableReactivaScoreSettings = {
  enabled: true,
  raffle_threshold_percent: 80,
  monthly_close_day: 1,
  prize_description: '',
  show_score_to_users: true,
  show_streak_to_users: true,
  show_score_to_rrhh: true,
};

export const ReactivaScoreSettingsPanel: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [settings, setSettings] = useState<EditableReactivaScoreSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await fetchReactivaScoreSettings(companyId);
      if (!mounted) return;
      if (data) setSettings({ ...defaults, ...data, raffle_threshold_percent: Number(data.raffle_threshold_percent) });
      setUnavailable(Boolean(error));
      setLoading(false);
    };
    void load();
    return () => { mounted = false; };
  }, [companyId]);

  const update = <K extends keyof EditableReactivaScoreSettings>(key: K, value: EditableReactivaScoreSettings[K]) => {
    setSettings(current => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const result = await saveReactivaScoreSettings(companyId, settings);
    setSaving(false);
    setUnavailable(!result.ok);
    setSaved(result.ok);
  };

  if (loading) return <section className="reactiva-settings-panel reactiva-team-loading" aria-label="Cargando configuración del puntaje" />;
  if (unavailable) {
    return <section className="reactiva-settings-panel reactiva-team-empty"><Award size={22} /><div><strong>Configuración del Puntaje ReActiva</strong><span>Disponible cuando el sistema de puntaje quede sincronizado.</span></div></section>;
  }

  return (
    <section className="reactiva-settings-panel">
      <div className="reactiva-settings-head">
        <div className="reactiva-settings-title"><span><Award size={19} /></span><div><h3>Puntaje ReActiva</h3><p>Configuración del programa para esta empresa</p></div></div>
        <label className="reactiva-settings-switch"><input type="checkbox" checked={settings.enabled} onChange={event => update('enabled', event.target.checked)} /><span>{settings.enabled ? 'Activo' : 'Inactivo'}</span></label>
      </div>

      <div className="reactiva-settings-grid">
        <label><span>Objetivo mensual (%)</span><input type="number" min="0" max="100" value={settings.raffle_threshold_percent} onChange={event => update('raffle_threshold_percent', Math.max(0, Math.min(100, Number(event.target.value))))} /></label>
        <label><span>Día de cierre mensual</span><input type="number" min="1" max="28" value={settings.monthly_close_day} onChange={event => update('monthly_close_day', Math.max(1, Math.min(28, Number(event.target.value))))} /></label>
        <label className="reactiva-settings-prize"><span>Premio o reconocimiento</span><textarea rows={3} value={settings.prize_description} onChange={event => update('prize_description', event.target.value)} placeholder="Descripción opcional que verá el colaborador" /></label>
      </div>

      <div className="reactiva-settings-visibility">
        <strong>Visibilidad</strong>
        <label><input type="checkbox" checked={settings.show_score_to_users} onChange={event => update('show_score_to_users', event.target.checked)} /> Mostrar puntaje al usuario</label>
        <label><input type="checkbox" checked={settings.show_streak_to_users} onChange={event => update('show_streak_to_users', event.target.checked)} /> Mostrar racha al usuario</label>
        <label><input type="checkbox" checked={settings.show_score_to_rrhh} onChange={event => update('show_score_to_rrhh', event.target.checked)} /> Mostrar puntaje a RRHH</label>
      </div>

      <div className="reactiva-settings-footer">
        <p>El máximo semanal permanece fijo en 10 puntos. El máximo mensual depende de las semanas programadas.</p>
        <button type="button" className="btn-primary" onClick={save} disabled={saving}>{saved ? <CheckCircle2 size={16} /> : <Save size={16} />}{saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar configuración'}</button>
      </div>
    </section>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Mail,
  PauseCircle,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  UserPlus,
  Users,
  X,
  Plus,
  ArrowRight,
  Zap,
  Target,
  SlidersHorizontal,
  LayoutTemplate,
  CheckCircle,
  Trash2
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  EmailAutomation,
  Empresa,
  getDB,
  MockDB,
  setDB,
  Usuario,
  Video,
} from '../../mock/data';
import { useEmpresas } from '../../context/EmpresasContext';

type EmailView = 'automatizaciones' | 'rendimiento';

interface AutomationDefinition {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: React.ReactNode;
  defaultSubject: string;
  defaultBody: string;
  defaultSegment: string;
  defaultOffset: number;
  defaultTime: string;
  report?: boolean;
}

const AUTOMATION_DEFINITIONS: AutomationDefinition[] = [
  {
    id: 'company-welcome',
    name: 'Bienvenida empresa',
    description: 'Recibe a RRHH y le acerca los próximos pasos para activar el programa.',
    condition: 'Cuando una empresa completa su alta',
    icon: <Building2 size={20} />,
    defaultSubject: 'Bienvenidos a ReActiva',
    defaultBody: 'Hola {{responsable}},\n\nLa empresa {{empresa}} ya está lista para comenzar con ReActiva.',
    defaultSegment: 'rrhh',
    defaultOffset: 0,
    defaultTime: '09:00',
  },
  {
    id: 'user-welcome',
    name: 'Bienvenida usuario',
    description: 'Acompaña a cada colaborador al ingresar por primera vez.',
    condition: 'Cuando se registra un nuevo usuario',
    icon: <UserPlus size={20} />,
    defaultSubject: 'Tu experiencia ReActiva comienza hoy',
    defaultBody: 'Hola {{nombre}},\n\nYa podés ingresar a ReActiva y comenzar tu programa de bienestar.',
    defaultSegment: 'all',
    defaultOffset: 0,
    defaultTime: '09:00',
  },
  {
    id: 'pause-reminder',
    name: 'Recordatorio de pausa',
    description: 'Avisa antes de cada pausa usando la programación de contenido vigente.',
    condition: 'Antes de una pausa programada',
    icon: <PauseCircle size={20} />,
    defaultSubject: 'Tu pausa activa comienza pronto',
    defaultBody: 'Hola {{nombre}},\n\nEn unos minutos comienza la pausa activa de {{empresa}}.',
    defaultSegment: 'active',
    defaultOffset: 15,
    defaultTime: '09:00',
  },
  {
    id: 'inactive-reengagement',
    name: 'Reenganche de inactivos',
    description: 'Invita a retomar el programa cuando detecta varios días sin actividad.',
    condition: 'Después de 5 días sin participación',
    icon: <RefreshCw size={20} />,
    defaultSubject: 'Tu próxima pausa puede cambiar el día',
    defaultBody: 'Hola {{nombre}},\n\nHace algunos días que no participás. Podés retomar cuando quieras.',
    defaultSegment: 'inactive',
    defaultOffset: 30,
    defaultTime: '11:00',
  },
  {
    id: 'streak-recognition',
    name: 'Reconocimiento por constancia',
    description: 'Celebra a las personas que sostienen una participación alta.',
    condition: 'Al alcanzar una racha de participación',
    icon: <Sparkles size={20} />,
    defaultSubject: 'Tu constancia merece reconocimiento',
    defaultBody: 'Hola {{nombre}},\n\nTu compromiso con las pausas está generando un gran hábito.',
    defaultSegment: 'high-adherence',
    defaultOffset: 0,
    defaultTime: '16:00',
  },
  {
    id: 'monthly-hr-summary',
    name: 'Resumen mensual RRHH',
    description: 'Envía el resumen ejecutivo y adjunta el mismo PDF generado en Analíticas.',
    condition: 'El primer día hábil de cada mes',
    icon: <FileText size={20} />,
    defaultSubject: 'Resumen mensual de bienestar - {{empresa}}',
    defaultBody: 'Hola {{responsable}},\n\nAdjuntamos el informe mensual de bienestar de {{empresa}}.',
    defaultSegment: 'rrhh',
    defaultOffset: 0,
    defaultTime: '09:00',
    report: true,
  },
];

const SEGMENTS = [
  { value: 'all', label: 'Todos los usuarios' },
  { value: 'active', label: 'Usuarios activos' },
  { value: 'inactive', label: 'Usuarios inactivos' },
  { value: 'low-adherence', label: 'Baja adherencia' },
  { value: 'high-adherence', label: 'Alta adherencia' },
  { value: 'high-pain', label: 'Alto dolor' },
  { value: 'low-energy', label: 'Baja energía' },
  { value: 'low-focus', label: 'Bajo foco' },
  { value: 'rrhh', label: 'Responsables de RRHH' },
];

const TRIGGERS = [
  { id: 'user_register', title: 'Usuario se registra', icon: <UserPlus size={18} /> },
  { id: 'company_onboarding', title: 'Empresa completa onboarding', icon: <Building2 size={18} /> },
  { id: 'before_pause', title: 'Antes de una pausa activa', icon: <Clock3 size={18} /> },
  { id: 'after_pause', title: 'Después de una pausa activa', icon: <CheckCircle2 size={18} /> },
  { id: 'no_pause', title: 'Usuario no realizó la pausa', icon: <X size={18} /> },
  { id: 'form_completed', title: 'Completa formulario semanal', icon: <FileText size={18} /> },
  { id: 'pain_reported', title: 'Reporta dolor', icon: <Activity size={18} /> },
  { id: 'low_energy', title: 'Cambio de energía', icon: <Zap size={18} /> },
];

interface ConditionRule {
  field: string;
  operator: string;
  value: string;
}

export interface CustomAutomation {
  id: string;
  name: string;
  description: string;
  active: boolean;
  triggerId: string;
  audiences: string[];
  conditions: ConditionRule[];
  timing: {
    delay: string;
    days: string[];
    timeFrom: string;
    timeTo: string;
  };
  template: {
    subject: string;
    body: string;
  };
}

const buildDefaults = (): EmailAutomation[] => AUTOMATION_DEFINITIONS.map((definition, index) => ({
  id: definition.id,
  active: index !== 3,
  companyId: 'all',
  segment: definition.defaultSegment,
  scheduleTime: definition.defaultTime,
  offsetMinutes: definition.defaultOffset,
  template: definition.name,
  subject: definition.defaultSubject,
  body: definition.defaultBody,
  attachReport: definition.report ?? false,
}));

const mergeAutomations = (saved: EmailAutomation[]) => {
  const byId = new Map(saved.map(item => [item.id, item]));
  return buildDefaults().map(item => ({ ...item, ...byId.get(item.id) }));
};

const getSegmentUsers = (users: Usuario[], segment: string) => users.filter(user => {
  const energy = user.onboardingData?.energia;
  const focus = user.onboardingData?.trabajo;
  if (segment === 'active') return user.estado === 'Activo';
  if (segment === 'inactive') return user.estado === 'Inactivo';
  if (segment === 'low-adherence') return user.participacion < 50;
  if (segment === 'high-adherence') return user.participacion >= 80;
  if (segment === 'high-pain') return user.dolor;
  if (segment === 'low-energy') return energy === 'Baja';
  if (segment === 'low-focus') return focus === 'Disperso';
  return segment !== 'rrhh';
});

const formatCompany = (companyId: number | 'all', companies: Empresa[]) => (
  companyId === 'all' ? 'Todas las empresas' : companies.find(company => company.id === companyId)?.nombre ?? 'Empresa'
);

const getNextScheduledVideo = (videos: Video[], companyId: number | 'all') => {
  const visible = videos.filter(video => companyId === 'all' || video.empresa_id == null || video.empresa_id === companyId);
  return [...visible].sort((a, b) => a.hora.localeCompare(b.hora))[0];
};

const metricPercent = (part: number, total: number) => total ? Math.round((part / total) * 100) : 0;

export const Emails: React.FC = () => {
  const [view, setView] = useState<EmailView>('automatizaciones');
  const [database, setDatabase] = useState<MockDB | null>(null);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [customAutomations, setCustomAutomations] = useState<CustomAutomation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailAutomation | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  
  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<CustomAutomation>({
    id: '', name: '', description: '', active: true, triggerId: '', audiences: [], conditions: [],
    timing: { delay: 'Inmediatamente', days: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'], timeFrom: '09:00', timeTo: '18:00' },
    template: { subject: '', body: '' }
  });

  useEffect(() => {
    const db = getDB();
    const merged = mergeAutomations(db.emailAutomations);
    if (db.emailAutomations.length !== merged.length) {
      db.emailAutomations = merged;
      setDB(db);
    }
    setDatabase(db);
    setAutomations(merged);
    
    try {
      const storedCustom = JSON.parse(localStorage.getItem('reactiva_custom_automations') || '[]');
      setCustomAutomations(storedCustom);
    } catch (e) {}
  }, []);

  const { empresas: companies } = useEmpresas();
  const users = database?.usuarios ?? [];
  const videos = database?.videos ?? [];
  const events = database?.emailEvents ?? [];
  const activeCount = automations.filter(item => item.active).length + customAutomations.filter(item => item.active).length;
  const nextVideo = getNextScheduledVideo(videos, 'all');
  const editingDefinition = AUTOMATION_DEFINITIONS.find(item => item.id === editingId);

  const persistAutomations = (next: EmailAutomation[]) => {
    const db = getDB();
    db.emailAutomations = next;
    setDB(db);
    setDatabase(db);
    setAutomations(next);
  };

  const persistCustomAutomations = (next: CustomAutomation[]) => {
    setCustomAutomations(next);
    localStorage.setItem('reactiva_custom_automations', JSON.stringify(next));
  };

  const toggleAutomation = (id: string) => {
    persistAutomations(automations.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };
  
  const toggleCustomAutomation = (id: string) => {
    persistCustomAutomations(customAutomations.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };

  const openAutomation = (id: string) => {
    const automation = automations.find(item => item.id === id);
    if (!automation) return;
    setEditingId(id);
    setDraft({ ...automation });
  };

  const saveDraft = () => {
    if (!draft) return;
    persistAutomations(automations.map(item => item.id === draft.id ? draft : item));
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
    setEditingId(null);
    setDraft(null);
  };
  
  const saveWizard = () => {
    const newAutomation = { ...wizardData, id: `custom_${Date.now()}` };
    persistCustomAutomations([...customAutomations, newAutomation]);
    setShowWizard(false);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  const scopedUsers = useMemo(() => {
    if (!draft) return [];
    const companyUsers = draft.companyId === 'all'
      ? users
      : users.filter(user => user.empresa_id === draft.companyId);
    return getSegmentUsers(companyUsers, draft.segment);
  }, [draft, users]);

  const performance = useMemo(() => {
    const sent = events.length;
    const opened = events.filter(event => event.openedAt).length;
    const clicked = events.filter(event => event.clickedAt).length;
    const converted = events.filter(event => event.pauseCompletedAt).length;
    return {
      sent,
      openRate: metricPercent(opened, sent),
      clickRate: metricPercent(clicked, sent),
      conversionRate: metricPercent(converted, sent),
    };
  }, [events]);

  const chartData = useMemo(() => AUTOMATION_DEFINITIONS.map(definition => {
    const automationEvents = events.filter(event => event.automationId === definition.id);
    return {
      name: definition.name.replace('Bienvenida ', 'B. ').replace('Reconocimiento por ', ''),
      enviados: automationEvents.length,
      pausas: automationEvents.filter(event => event.pauseCompletedAt).length,
    };
  }), [events]);

  const startWizard = () => {
    setWizardStep(1);
    setWizardData({
      id: '', name: '', description: '', active: true, triggerId: '', audiences: [], conditions: [],
      timing: { delay: 'Inmediatamente', days: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'], timeFrom: '09:00', timeTo: '18:00' },
      template: { subject: '', body: '' }
    });
    setShowWizard(true);
  };

  const WizardContent = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="wizard-content">
            <h3>Información general</h3>
            <p>Definí el nombre y estado de tu nueva regla.</p>
            
            <label className="automation-full-field" style={{ marginBottom: '1.5rem', display: 'block' }}>
              Nombre de la automatización
              <input 
                className="input-field" 
                placeholder="Ej: Retorno de inactivos con dolor" 
                value={wizardData.name} 
                onChange={e => setWizardData({...wizardData, name: e.target.value})} 
              />
            </label>
            <label className="automation-full-field" style={{ marginBottom: '2rem', display: 'block' }}>
              Descripción (opcional)
              <input 
                className="input-field" 
                placeholder="Breve explicación interna" 
                value={wizardData.description} 
                onChange={e => setWizardData({...wizardData, description: e.target.value})} 
              />
            </label>
            
            <div className="automation-enable-row" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Activar automatización</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>El sistema comenzará a monitorear esta regla al guardar.</span>
              </div>
              <label className="automation-toggle">
                <input type="checkbox" checked={wizardData.active} onChange={() => setWizardData({ ...wizardData, active: !wizardData.active })} />
                <span />
              </label>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="wizard-content">
            <h3>¿Qué dispara esta automatización?</h3>
            <p>Seleccioná el evento que dará inicio a la regla.</p>
            <div className="wizard-trigger-grid">
              {TRIGGERS.map(trigger => (
                <div 
                  key={trigger.id} 
                  className={`wizard-trigger-card ${wizardData.triggerId === trigger.id ? 'active' : ''}`}
                  onClick={() => setWizardData({...wizardData, triggerId: trigger.id})}
                >
                  <h4>{trigger.icon} {trigger.title}</h4>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="wizard-content">
            <h3>¿A quién se envía?</h3>
            <p>Elegí uno o más grupos de destinatarios.</p>
            <div className="wizard-audience-grid">
              {SEGMENTS.map(seg => (
                <label key={seg.value} className="wizard-audience-option">
                  <input 
                    type="checkbox" 
                    checked={wizardData.audiences.includes(seg.value)}
                    onChange={(e) => {
                      const newAuds = e.target.checked 
                        ? [...wizardData.audiences, seg.value]
                        : wizardData.audiences.filter(a => a !== seg.value);
                      setWizardData({...wizardData, audiences: newAuds});
                    }}
                  />
                  <span>{seg.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="wizard-content">
            <h3>Condiciones (opcionales)</h3>
            <p>Agregá reglas para refinar exactamente cuándo se envía.</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              {wizardData.conditions.map((cond, idx) => (
                <div key={idx} className="wizard-condition-row">
                  <select 
                    value={cond.field}
                    onChange={e => {
                      const newConds = [...wizardData.conditions];
                      newConds[idx].field = e.target.value;
                      setWizardData({...wizardData, conditions: newConds});
                    }}
                  >
                    <option value="">Seleccionar campo</option>
                    <option value="participacion">Participación (%)</option>
                    <option value="dolor">Tiene dolor</option>
                    <option value="empresa">Empresa</option>
                    <option value="dias_inactivo">Días inactivo</option>
                  </select>
                  
                  <select
                    value={cond.operator}
                    onChange={e => {
                      const newConds = [...wizardData.conditions];
                      newConds[idx].operator = e.target.value;
                      setWizardData({...wizardData, conditions: newConds});
                    }}
                  >
                    <option value="=">Igual a</option>
                    <option value="!=">Distinto a</option>
                    <option value=">">Mayor que</option>
                    <option value="<">Menor que</option>
                  </select>
                  
                  <input 
                    placeholder="Valor..."
                    value={cond.value}
                    onChange={e => {
                      const newConds = [...wizardData.conditions];
                      newConds[idx].value = e.target.value;
                      setWizardData({...wizardData, conditions: newConds});
                    }}
                  />
                  
                  <button onClick={() => {
                    const newConds = [...wizardData.conditions];
                    newConds.splice(idx, 1);
                    setWizardData({...wizardData, conditions: newConds});
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              className="btn-secondary" 
              onClick={() => setWizardData({...wizardData, conditions: [...wizardData.conditions, {field: '', operator: '=', value: ''}]})}
            >
              <Plus size={16} style={{ marginRight: '6px' }} /> Agregar regla (Y)
            </button>
          </div>
        );
      case 5:
        return (
          <div className="wizard-content">
            <h3>Momento del envío</h3>
            <p>Configurá el retraso y la ventana horaria de envío.</p>
            
            <label className="automation-full-field" style={{ marginBottom: '1.5rem', display: 'block' }}>
              ¿Cuándo se envía?
              <select 
                className="input-field"
                value={wizardData.timing.delay}
                onChange={e => setWizardData({...wizardData, timing: {...wizardData.timing, delay: e.target.value}})}
              >
                <option>Inmediatamente</option>
                <option>15 minutos después</option>
                <option>30 minutos</option>
                <option>1 hora</option>
                <option>1 día</option>
                <option>3 días</option>
              </select>
            </label>

            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Días permitidos</strong>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(day => (
                  <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '20px', cursor: 'pointer', backgroundColor: wizardData.timing.days.includes(day) ? 'var(--primary-light)' : 'white', borderColor: wizardData.timing.days.includes(day) ? 'var(--primary-color)' : 'var(--border-color)' }}>
                    <input 
                      type="checkbox" 
                      style={{ display: 'none' }}
                      checked={wizardData.timing.days.includes(day)}
                      onChange={e => {
                        const newDays = e.target.checked 
                          ? [...wizardData.timing.days, day] 
                          : wizardData.timing.days.filter(d => d !== day);
                        setWizardData({...wizardData, timing: {...wizardData.timing, days: newDays}});
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: wizardData.timing.days.includes(day) ? 'var(--primary-color)' : 'var(--text-color)', textTransform: 'capitalize' }}>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label className="automation-full-field">
                Horario Desde
                <input type="time" className="input-field" value={wizardData.timing.timeFrom} onChange={e => setWizardData({...wizardData, timing: {...wizardData.timing, timeFrom: e.target.value}})} />
              </label>
              <label className="automation-full-field">
                Horario Hasta
                <input type="time" className="input-field" value={wizardData.timing.timeTo} onChange={e => setWizardData({...wizardData, timing: {...wizardData.timing, timeTo: e.target.value}})} />
              </label>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="wizard-content">
            <h3>Plantilla y contenido</h3>
            <p>Redactá el mensaje que recibirán los usuarios cuando se cumplan las condiciones.</p>
            
            <label className="automation-full-field" style={{ marginBottom: '1.5rem', display: 'block' }}>
              Asunto del correo
              <input 
                className="input-field" 
                placeholder="Ej: Tenemos algo para ayudarte..." 
                value={wizardData.template.subject}
                onChange={e => setWizardData({...wizardData, template: {...wizardData.template, subject: e.target.value}})}
              />
            </label>
            
            <label className="automation-full-field" style={{ display: 'block' }}>
              Cuerpo del mensaje (acepta variables como {'{{nombre}}'})
              <textarea 
                className="input-field" 
                rows={8} 
                placeholder="Hola {{nombre}}..."
                value={wizardData.template.body}
                onChange={e => setWizardData({...wizardData, template: {...wizardData.template, body: e.target.value}})}
              />
            </label>
          </div>
        );
      case 7:
        const tTitle = TRIGGERS.find(t => t.id === wizardData.triggerId)?.title || 'No seleccionado';
        return (
          <div className="wizard-content">
            <h3>Resumen final</h3>
            <p>Revisá que todo esté correcto antes de guardar la automatización.</p>
            
            <div className="wizard-preview-card">
              <div className="wizard-preview-row">
                <span className="wizard-preview-label">Nombre</span>
                <span className="wizard-preview-value">{wizardData.name || '-'}</span>
              </div>
              <div className="wizard-preview-row">
                <span className="wizard-preview-label">Estado</span>
                <span className="wizard-preview-value" style={{ color: wizardData.active ? '#10b981' : '#64748b' }}>
                  {wizardData.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="wizard-preview-row">
                <span className="wizard-preview-label">Disparador</span>
                <span className="wizard-preview-value">{tTitle}</span>
              </div>
              <div className="wizard-preview-row">
                <span className="wizard-preview-label">Destinatarios</span>
                <span className="wizard-preview-value">{wizardData.audiences.length} segmento(s) seleccionado(s)</span>
              </div>
              <div className="wizard-preview-row">
                <span className="wizard-preview-label">Condiciones</span>
                <span className="wizard-preview-value">{wizardData.conditions.length} regla(s) extra</span>
              </div>
              <div className="wizard-preview-row">
                <span className="wizard-preview-label">Envío</span>
                <span className="wizard-preview-value">{wizardData.timing.delay} ({wizardData.timing.timeFrom} a {wizardData.timing.timeTo})</span>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="email-center">
      <header className="email-center-header">
        <div>
          <h2 className="header-title">Correos automáticos</h2>
          <p>Configurá qué mensajes se envían, a quiénes y en qué momento.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="email-view-switch" role="tablist">
            <button className={view === 'automatizaciones' ? 'active' : ''} onClick={() => setView('automatizaciones')}>
              <Bell size={16} /> Automatizaciones
            </button>
            <button className={view === 'rendimiento' ? 'active' : ''} onClick={() => setView('rendimiento')}>
              <BarChart3 size={16} /> Rendimiento
            </button>
          </div>
          <button className="btn-primary" onClick={startWizard} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Plus size={16} style={{ marginRight: '6px' }} /> Nueva automatización
          </button>
        </div>
      </header>

      {view === 'automatizaciones' ? (
        <>
          <section className="email-summary">
            <div>
              <span>Automatizaciones activas</span>
              <strong>{activeCount}</strong>
            </div>
            <div>
              <span>Automatizaciones inactivas</span>
              <strong>{(automations.length + customAutomations.length) - activeCount}</strong>
            </div>
            <div>
              <span>Próximo envío programado</span>
              <strong>{nextVideo ? `${nextVideo.dia} ${nextVideo.hora}` : 'Sin contenido próximo'}</strong>
            </div>
            <div>
              <span>Reglas personalizadas</span>
              <strong>{customAutomations.length}</strong>
            </div>
          </section>

          <section className="automation-grid">
            {/* Custom Automations Render */}
            {customAutomations.map(custom => {
              const triggerObj = TRIGGERS.find(t => t.id === custom.triggerId);
              return (
                <article
                  key={custom.id}
                  className={`automation-card${custom.active ? ' is-active' : ''}`}
                >
                  <div className="automation-card-top">
                    <div className="automation-icon" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                      <Zap size={20} />
                    </div>
                    <label className="automation-toggle" onClick={event => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={custom.active}
                        onChange={() => toggleCustomAutomation(custom.id)}
                        aria-label={`${custom.active ? 'Desactivar' : 'Activar'} ${custom.name}`}
                      />
                      <span />
                    </label>
                  </div>
                  <div className="automation-card-copy">
                    <div className="automation-title-row">
                      <h3>{custom.name}</h3>
                      <span className={custom.active ? 'status-active' : 'status-inactive'}>
                        {custom.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p>{custom.description || 'Automatización personalizada'}</p>
                  </div>
                  <div className="automation-condition">
                    <Clock3 size={15} />
                    <span>{triggerObj?.title || 'Personalizado'}</span>
                  </div>
                  <div className="automation-card-footer">
                    <span>{custom.audiences.length} segmento(s) destino</span>
                    <ChevronRight size={18} />
                  </div>
                </article>
              );
            })}

            {/* Predefined Automations Render */}
            {AUTOMATION_DEFINITIONS.map(definition => {
              const automation = automations.find(item => item.id === definition.id);
              if (!automation) return null;
              const nextSchedule = definition.id === 'pause-reminder'
                ? getNextScheduledVideo(videos, automation.companyId)
                : null;
              return (
                <article
                  key={definition.id}
                  className={`automation-card${automation.active ? ' is-active' : ''}`}
                  onClick={() => openAutomation(definition.id)}
                  tabIndex={0}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') openAutomation(definition.id);
                  }}
                >
                  <div className="automation-card-top">
                    <div className="automation-icon">{definition.icon}</div>
                    <label className="automation-toggle" onClick={event => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={automation.active}
                        onChange={() => toggleAutomation(definition.id)}
                        aria-label={`${automation.active ? 'Desactivar' : 'Activar'} ${definition.name}`}
                      />
                      <span />
                    </label>
                  </div>
                  <div className="automation-card-copy">
                    <div className="automation-title-row">
                      <h3>{definition.name}</h3>
                      <span className={automation.active ? 'status-active' : 'status-inactive'}>
                        {automation.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p>{definition.description}</p>
                  </div>
                  <div className="automation-condition">
                    <Clock3 size={15} />
                    <span>{nextSchedule ? `${nextSchedule.dia} ${nextSchedule.hora} · ${automation.offsetMinutes} min antes` : definition.condition}</span>
                  </div>
                  <div className="automation-card-footer">
                    <span>{formatCompany(automation.companyId, companies)}</span>
                    <ChevronRight size={18} />
                  </div>
                </article>
              );
            })}
          </section>
        </>
      ) : (
        <section className="email-performance">
          <div className="email-performance-head">
            <div>
              <h3>Rendimiento de automatizaciones</h3>
              <p>Los resultados se calculan únicamente con eventos registrados por la plataforma.</p>
            </div>
          </div>

          <div className="email-kpis">
            {[
              { label: 'Emails enviados', value: performance.sent, icon: <Send size={18} /> },
              { label: 'Tasa de apertura', value: `${performance.openRate}%`, icon: <Mail size={18} /> },
              { label: 'Tasa de clics', value: `${performance.clickRate}%`, icon: <Activity size={18} /> },
              { label: 'Conversión a pausa', value: `${performance.conversionRate}%`, icon: <CheckCircle2 size={18} /> },
            ].map(item => (
              <div key={item.label}>
                <span>{item.icon}{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="email-performance-chart">
            <h4>Envíos y pausas generadas por automatización</h4>
            {events.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="enviados" name="Enviados" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pausas" name="Pausas realizadas" fill="#0db39e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="email-empty-performance">
                <BarChart3 size={32} />
                <strong>Todavía no hay envíos registrados</strong>
                <p>Las métricas aparecerán cuando las automatizaciones comiencen a ejecutar correos reales.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CUSTOM AUTOMATION WIZARD MODAL */}
      {showWizard && (
        <div className="wizard-backdrop" onClick={() => setShowWizard(false)}>
          <div className="wizard-modal" onClick={e => e.stopPropagation()}>
            <div className="wizard-head">
              <h2><Zap size={22} color="var(--primary-color)" /> Nueva automatización</h2>
              <button onClick={() => setShowWizard(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            
            <div className="wizard-body">
              <div className="wizard-steps">
                {[
                  { step: 1, label: 'Información general', icon: <FileText size={16} /> },
                  { step: 2, label: 'Disparador', icon: <Zap size={16} /> },
                  { step: 3, label: 'Audiencia', icon: <Users size={16} /> },
                  { step: 4, label: 'Condiciones', icon: <SlidersHorizontal size={16} /> },
                  { step: 5, label: 'Momento', icon: <Clock3 size={16} /> },
                  { step: 6, label: 'Plantilla', icon: <LayoutTemplate size={16} /> },
                  { step: 7, label: 'Vista previa', icon: <Target size={16} /> },
                ].map(s => (
                  <div 
                    key={s.step} 
                    className={`wizard-step ${wizardStep === s.step ? 'active' : ''} ${wizardStep > s.step ? 'completed' : ''}`}
                    onClick={() => setWizardStep(s.step)}
                  >
                    {wizardStep > s.step ? <CheckCircle size={16} /> : s.icon}
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
              
              {WizardContent()}
            </div>
            
            <div className="wizard-footer">
              <button 
                className="btn-secondary" 
                onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}
              >
                {wizardStep > 1 ? 'Anterior' : 'Cancelar'}
              </button>
              
              {wizardStep < 7 ? (
                <button className="btn-primary" onClick={() => setWizardStep(wizardStep + 1)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Siguiente paso <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn-primary" onClick={saveWizard} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} /> Guardar automatización
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREDEFINED AUTOMATION DRAWER */}
      {editingDefinition && draft && (
        <div className="automation-drawer-backdrop" onClick={() => { setEditingId(null); setDraft(null); }}>
          <aside className="automation-drawer" onClick={event => event.stopPropagation()}>
            <div className="automation-drawer-head">
              <div className="automation-icon">{editingDefinition.icon}</div>
              <div>
                <span>Configurar automatización predefinida</span>
                <h3>{editingDefinition.name}</h3>
              </div>
              <button onClick={() => { setEditingId(null); setDraft(null); }} title="Cerrar"><X size={20} /></button>
            </div>

            <div className="automation-drawer-scroll">
              <div className="automation-enable-row">
                <div>
                  <strong>Automatización activa</strong>
                  <span>El sistema podrá ejecutar esta regla automáticamente.</span>
                </div>
                <label className="automation-toggle">
                  <input type="checkbox" checked={draft.active} onChange={() => setDraft({ ...draft, active: !draft.active })} />
                  <span />
                </label>
              </div>

              <div className="automation-form-grid">
                <label>
                  Empresa
                  <select value={draft.companyId} onChange={event => setDraft({ ...draft, companyId: event.target.value === 'all' ? 'all' : Number(event.target.value) })}>
                    <option value="all">Todas las empresas</option>
                    {companies.map(company => <option key={company.id} value={company.id}>{company.nombre}</option>)}
                  </select>
                </label>
                <label>
                  Segmento
                  <select value={draft.segment} onChange={event => setDraft({ ...draft, segment: event.target.value })}>
                    {SEGMENTS.map(segment => <option key={segment.value} value={segment.value}>{segment.label}</option>)}
                  </select>
                </label>
                <label>
                  Horario de envío
                  <input type="time" value={draft.scheduleTime} onChange={event => setDraft({ ...draft, scheduleTime: event.target.value })} />
                </label>
                <label>
                  Tiempo previo o posterior
                  <div className="automation-number-field">
                    <input type="number" min="0" value={draft.offsetMinutes} onChange={event => setDraft({ ...draft, offsetMinutes: Number(event.target.value) })} />
                    <span>minutos</span>
                  </div>
                </label>
              </div>

              {editingDefinition.id === 'pause-reminder' && (
                <div className="automation-source-box">
                  <CalendarDays size={19} />
                  <div>
                    <strong>Programación de contenido conectada</strong>
                    <p>
                      {getNextScheduledVideo(videos, draft.companyId)
                        ? `Próxima pausa: ${getNextScheduledVideo(videos, draft.companyId)?.dia} a las ${getNextScheduledVideo(videos, draft.companyId)?.hora}.`
                        : 'No hay una pausa programada para esta selección.'}
                    </p>
                  </div>
                </div>
              )}

              <label className="automation-full-field">
                Plantilla asociada
                <select value={draft.template} onChange={event => setDraft({ ...draft, template: event.target.value })}>
                  {AUTOMATION_DEFINITIONS.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </label>

              <label className="automation-full-field">
                Asunto del correo
                <input value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} />
              </label>

              <label className="automation-full-field">
                Mensaje
                <textarea value={draft.body} onChange={event => setDraft({ ...draft, body: event.target.value })} rows={6} />
              </label>

              {editingDefinition.report && (
                <label className="automation-report-option">
                  <input type="checkbox" checked={draft.attachReport ?? false} onChange={event => setDraft({ ...draft, attachReport: event.target.checked })} />
                  <FileText size={18} />
                  <span>
                    <strong>Adjuntar informe PDF de Analíticas</strong>
                    <small>Usará exactamente el mismo informe empresarial disponible para descargar.</small>
                  </span>
                </label>
              )}

              <div className="automation-audience">
                <Users size={18} />
                <span>
                  <strong>{draft.segment === 'rrhh' ? (draft.companyId === 'all' ? companies.filter(company => company.rrhhEmail).length : 1) : scopedUsers.length}</strong>
                  destinatarios estimados
                </span>
              </div>

              <div className="email-preview">
                <div className="email-preview-head">
                  <span><Mail size={15} /> Vista previa</span>
                  <small>{formatCompany(draft.companyId, companies)}</small>
                </div>
                <strong>{draft.subject || 'Sin asunto'}</strong>
                <p>{draft.body || 'El contenido del correo aparecerá aquí.'}</p>
                {draft.attachReport && <span className="email-attachment"><FileText size={14} /> Informe_Bienestar.pdf</span>}
              </div>
            </div>

            <div className="automation-drawer-actions">
              <button className="btn-secondary" onClick={() => { setEditingId(null); setDraft(null); }}>Cancelar</button>
              <button className="btn-primary" onClick={saveDraft}><Save size={16} /> Guardar cambios</button>
            </div>
          </aside>
        </div>
      )}

      {savedNotice && <div className="email-saved-notice"><CheckCircle2 size={17} /> Automatización actualizada</div>}
    </div>
  );
};

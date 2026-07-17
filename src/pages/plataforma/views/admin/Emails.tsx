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
import { sendTransactionalEmail } from '../../lib/emailSender';
import { supabase } from '../../lib/supabase';

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
    defaultSubject: 'Tu pausa activa estará disponible en {{minutos}} minutos',
    defaultBody: 'Hola {{nombre}},\n\nTu pausa activa de {{empresa}} estará disponible en {{minutos}} minutos. Horario programado: {{hora}} hs.\n\nIngresá a ReActiva para comenzar.',
    defaultSegment: 'active',
    defaultOffset: 5,
    defaultTime: '09:00',
  },
  {
    id: 'missed-pause-reminder',
    name: 'Recordatorio de pausa pendiente',
    description: 'Recuerda la pausa solo a quienes todavía no la realizaron.',
    condition: '40 minutos después de habilitarse la pausa',
    icon: <Clock3 size={20} />,
    defaultSubject: 'Tu pausa activa sigue disponible',
    defaultBody: 'Hola {{nombre}},\n\nNotamos que todavía no realizaste la pausa de {{empresa}} programada para las {{hora}} hs. Tomate unos minutos para hacerla cuando puedas.\n\nIngresá a ReActiva para comenzar.',
    defaultSegment: 'active',
    defaultOffset: 40,
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

const buildDefaults = (): EmailAutomation[] => AUTOMATION_DEFINITIONS.map((definition) => ({
  id: definition.id,
  active: !['inactive-reengagement'].includes(definition.id),
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
  return buildDefaults().map(item => {
    const merged = { ...item, ...byId.get(item.id) };
    return item.id === 'pause-reminder' ? { ...merged, active: true, offsetMinutes: 5 } : merged;
  });
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

const hashToNumericId = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 10000;
};

export const Emails: React.FC = () => {
  const [view, setView] = useState<EmailView>('automatizaciones');
  const [database, setDatabase] = useState<MockDB | null>(null);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [customAutomations, setCustomAutomations] = useState<CustomAutomation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailAutomation | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  
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

  useEffect(() => {
    if (!supabase) return;

    const applySharedTemplate = (template: { id: string; subject: string; body: string; active?: boolean; delay_minutes?: number }) => {
      setAutomations(current => current.map(item => (
        item.id === template.id
          ? {
              ...item,
              subject: template.subject,
              body: template.body,
              active: template.id === 'pause-reminder' ? true : template.active ?? item.active,
              offsetMinutes: template.delay_minutes ?? item.offsetMinutes,
            }
          : item
      )));
      setDraft(current => current?.id === template.id
        ? {
            ...current,
            subject: template.subject,
            body: template.body,
            active: template.id === 'pause-reminder' ? true : template.active ?? current.active,
            offsetMinutes: template.delay_minutes ?? current.offsetMinutes,
          }
        : current);
    };

    const loadSharedTemplates = async () => {
      const { data, error } = await supabase
        .from('email_automation_templates')
        .select('id, subject, body, active, delay_minutes')
        .in('id', ['pause-reminder', 'missed-pause-reminder']);

      if (error) {
        console.error('No se pudieron cargar las plantillas compartidas de recordatorio', error);
        return;
      }
      (data ?? []).forEach(applySharedTemplate);
    };

    void loadSharedTemplates();
    const channel = supabase
      .channel('pause-reminder-templates-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'email_automation_templates' },
        () => void loadSharedTemplates(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const { empresas: companies } = useEmpresas();

  useEffect(() => {
    const loadRealRecipients = async () => {
      if (!supabase) return;

      const [
        { data: realCompanies, error: companiesError },
        { data: profiles, error: profilesError },
        { data: onboardingResponses, error: onboardingError },
      ] = await Promise.all([
        supabase
          .from('companies')
          .select('id, name, location, status, contact_name, rrhh_email, onboarding_completed_at, created_at'),
        supabase
          .from('profiles')
          .select('id, company_id, email, full_name, role, status, created_at, updated_at, onboarding_data')
          .eq('role', 'usuario'),
        supabase
          .from('onboarding_responses')
          .select('id, company_id, profile_id, responses, completed_at')
          .eq('type', 'user_activation')
          .order('completed_at', { ascending: false }),
      ]);

      if (companiesError || profilesError || onboardingError || !realCompanies || !profiles) {
        console.error('No se pudieron cargar destinatarios reales para emails', companiesError ?? profilesError ?? onboardingError);
        return;
      }

      const realCompanyModels: Empresa[] = realCompanies.map((company: any) => ({
        id: hashToNumericId(company.id),
        supabaseId: company.id,
        nombre: company.name,
        ubicacion: company.location ?? '',
        empleados: [],
        estado: company.status === 'pending_onboarding' ? 'Pendiente onboarding' : company.status === 'inactive' ? 'Inactiva' : 'Activa',
        contactoNombre: company.contact_name ?? '',
        rrhhEmail: company.rrhh_email ?? '',
        fechaOnboarding: company.onboarding_completed_at ?? company.created_at,
      }));

      const companyBySupabaseId = new Map(realCompanyModels.map(company => [company.supabaseId, company]));
      const realUsers: Usuario[] = profiles.map((profile: any) => {
        const company = companyBySupabaseId.get(profile.company_id);
        return {
          id: hashToNumericId(profile.id),
          supabaseId: profile.id,
          nombre: profile.full_name || profile.email?.split('@')[0] || 'Usuario',
          email: profile.email,
          empresa_id: company?.id ?? 0,
          participacion: 0,
          dolor: Boolean(profile.onboarding_data?.has_pain),
          ultima_interaccion: profile.updated_at ?? profile.created_at,
          estado: profile.status === 'inactive' ? 'Inactivo' : 'Activo',
          fechaIngreso: profile.created_at,
          onboardingData: profile.onboarding_data ?? {},
        };
      });

      const profileEmails = new Set(realUsers.map(profile => profile.email.toLowerCase()));
      const pendingByEmail = new Map<string, Usuario>();
      (onboardingResponses ?? []).forEach((response: any) => {
        if (response.profile_id) return;
        const email = String(response.responses?.email ?? '').trim().toLowerCase();
        if (!email || profileEmails.has(email) || pendingByEmail.has(email)) return;
        const company = companyBySupabaseId.get(response.company_id);
        pendingByEmail.set(email, {
          id: hashToNumericId(response.id),
          supabaseId: response.id,
          nombre: response.responses?.nombre || email.split('@')[0],
          email,
          empresa_id: company?.id ?? 0,
          participacion: 0,
          dolor: Array.isArray(response.responses?.dolores)
            && !response.responses.dolores.includes('No tengo dolores'),
          ultima_interaccion: response.completed_at,
          estado: 'Pendiente de acceso',
          fechaIngreso: response.completed_at,
          onboardingData: response.responses ?? {},
        });
      });

      const allUsers = [...realUsers, ...pendingByEmail.values()];
      const employeesByCompany = new Map<number, number[]>();
      allUsers.forEach((profile) => {
        if (!employeesByCompany.has(profile.empresa_id)) employeesByCompany.set(profile.empresa_id, []);
        employeesByCompany.get(profile.empresa_id)?.push(profile.id);
      });

      setDatabase(current => {
        const fallback = current ?? getDB();
        return {
          ...fallback,
          empresas: realCompanyModels.map(company => ({
            ...company,
            empleados: employeesByCompany.get(company.id) ?? [],
          })),
          usuarios: allUsers,
        };
      });
    };

    void loadRealRecipients();
  }, []);

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

  const saveDraft = async () => {
    if (!draft) return;

    if (['pause-reminder', 'missed-pause-reminder'].includes(draft.id)) {
      if (!draft.subject.trim() || !draft.body.trim()) {
        window.alert('Completa el asunto y el mensaje antes de guardar.');
        return;
      }
      if (draft.id === 'missed-pause-reminder' && (!Number.isFinite(draft.offsetMinutes) || draft.offsetMinutes < 1 || draft.offsetMinutes > 1440)) {
        window.alert('El tiempo del recordatorio debe estar entre 1 y 1440 minutos.');
        return;
      }
      if (!supabase) {
        window.alert('No pudimos conectar con Supabase para guardar la plantilla.');
        return;
      }

      setSavingTemplate(true);
      const { error } = await supabase.rpc('save_email_automation_settings', {
        template_id: draft.id,
        template_subject: draft.subject.trim(),
        template_body: draft.body.trim(),
        template_active: draft.id === 'pause-reminder' ? true : draft.active,
        template_delay_minutes: draft.id === 'pause-reminder' ? 5 : draft.offsetMinutes,
      });
      setSavingTemplate(false);

      if (error) {
        console.error('No se pudo guardar la plantilla compartida del recordatorio', error);
        window.alert(`No pudimos guardar la plantilla: ${error.message}`);
        return;
      }
    }

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

  const renderTemplate = (template: string, values: Record<string, string>) => (
    Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{{${key}}}`, value), template)
  );

  const getAutomationRecipients = (automation: EmailAutomation) => {
    const selectedCompanies = automation.companyId === 'all'
      ? companies
      : companies.filter(company => company.id === automation.companyId);

    if (automation.segment === 'rrhh') {
      return selectedCompanies
        .filter(company => company.rrhhEmail)
        .map(company => ({
          email: company.rrhhEmail as string,
          nombre: company.contactoNombre || 'Responsable de RRHH',
          empresa: company.nombre,
          responsable: company.contactoNombre || 'Responsable de RRHH',
          companyId: company.id,
        }));
    }

    const companyUsers = automation.companyId === 'all'
      ? users
      : users.filter(user => user.empresa_id === automation.companyId);

    return getSegmentUsers(companyUsers, automation.segment)
      .filter(user => user.email)
      .map(user => {
        const company = companies.find(item => item.id === user.empresa_id);
        return {
          email: user.email,
          nombre: user.nombre,
          empresa: company?.nombre || 'tu empresa',
          responsable: company?.contactoNombre || 'Responsable de RRHH',
          companyId: user.empresa_id,
          userId: user.id,
        };
      });
  };

  const sendAutomationNow = async (automation: EmailAutomation) => {
    if (!automation.active) {
      window.alert('Esta automatización está inactiva. Activala antes de enviar.');
      return;
    }

    const recipients = getAutomationRecipients(automation);
    if (!recipients.length) {
      window.alert('No encontramos empleados reales con email para esta empresa y segmento. Primero creá o activá usuarios en esa empresa, o cambiá el segmento/empresa de la automatización.');
      return;
    }

    setSendingId(automation.id);
    const appUrl = `${window.location.origin}/plataforma/login`;
    const db = getDB();
    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      const templateValues = {
        nombre: recipient.nombre,
        empresa: recipient.empresa,
        responsable: recipient.responsable,
        hora: automation.id === 'pause-reminder' ? (nextVideo?.hora ?? automation.scheduleTime) : automation.scheduleTime,
        minutos: String(automation.id === 'pause-reminder' ? 5 : automation.offsetMinutes),
      };
      const subject = renderTemplate(automation.subject, templateValues);
      const body = renderTemplate(automation.body, templateValues);
      const result = await sendTransactionalEmail({
        type: 'automation_email',
        to: recipient.email,
        recipientName: recipient.nombre,
        companyName: recipient.empresa,
        invitationUrl: appUrl,
        subject,
        body,
        automationId: automation.id,
      });

      if (result.ok) {
        sentCount += 1;
        db.emailEvents.push({
          id: `${automation.id}-${Date.now()}-${sentCount}`,
          automationId: automation.id,
          companyId: recipient.companyId,
          userId: recipient.userId,
          sentAt: new Date().toISOString(),
        });
      } else {
        errors.push(`${recipient.email}: ${result.message ?? 'error desconocido'}`);
      }
    }

    setDB(db);
    setDatabase(db);
    setSendingId(null);

    if (errors.length) {
      window.alert(`Se enviaron ${sentCount} email(s), pero algunos fallaron:\n${errors.join('\n')}`);
      return;
    }

    window.alert(`Listo: se enviaron ${sentCount} email(s).`);
  };

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
            
            <div className="wizard-conditions" style={{ marginBottom: '1.5rem' }}>
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

            <div className="wizard-timing-days" style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Días permitidos</strong>
              <div className="wizard-day-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(day => (
                  <label className="wizard-day-option" key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '20px', cursor: 'pointer', backgroundColor: wizardData.timing.days.includes(day) ? 'var(--primary-light)' : 'white', borderColor: wizardData.timing.days.includes(day) ? 'var(--primary-color)' : 'var(--border-color)' }}>
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

            <div className="wizard-timing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
        <div className="email-header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              <strong>{nextVideo ? `${nextVideo.dia} ${nextVideo.hora}` : 'Sin contenido'}</strong>
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
              const isContentConnected = ['pause-reminder', 'missed-pause-reminder'].includes(definition.id);
              const nextSchedule = isContentConnected
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
                    {isContentConnected
                      ? <span style={{ color: '#0f766e', background: '#ccfbf1', borderRadius: 999, padding: '0.28rem 0.55rem', fontSize: '0.68rem', fontWeight: 800 }}>CONECTADA</span>
                      : <label className="automation-toggle" onClick={event => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={automation.active}
                            onChange={() => toggleAutomation(definition.id)}
                            aria-label={`${automation.active ? 'Desactivar' : 'Activar'} ${definition.name}`}
                          />
                          <span />
                        </label>}
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
                    <span>{nextSchedule
                      ? definition.id === 'pause-reminder'
                        ? `${nextSchedule.dia} ${nextSchedule.hora} · ${automation.offsetMinutes} min antes`
                        : `${nextSchedule.dia} ${nextSchedule.hora} · ${automation.offsetMinutes} min después si sigue pendiente`
                      : definition.condition}</span>
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
                {editingDefinition.id === 'pause-reminder'
                  ? <span style={{ color: '#0f766e', background: '#ccfbf1', borderRadius: 999, padding: '0.38rem 0.65rem', fontSize: '0.72rem', fontWeight: 800 }}>Conectada a Contenidos</span>
                  : <label className="automation-toggle">
                      <input type="checkbox" checked={draft.active} onChange={() => setDraft({ ...draft, active: !draft.active })} />
                      <span />
                    </label>}
              </div>

              <div className="automation-form-grid">
                <label>
                  Empresa
                  <select
                    value={draft.companyId}
                    disabled={editingDefinition.id === 'missed-pause-reminder'}
                    onChange={event => setDraft({ ...draft, companyId: event.target.value === 'all' ? 'all' : Number(event.target.value) })}
                  >
                    <option value="all">Todas las empresas</option>
                    {companies.map(company => <option key={company.id} value={company.id}>{company.nombre}</option>)}
                  </select>
                </label>
                <label>
                  Segmento
                  <select
                    value={draft.segment}
                    disabled={editingDefinition.id === 'missed-pause-reminder'}
                    onChange={event => setDraft({ ...draft, segment: event.target.value })}
                  >
                    {SEGMENTS.map(segment => <option key={segment.value} value={segment.value}>{segment.label}</option>)}
                  </select>
                </label>
                {!['pause-reminder', 'missed-pause-reminder'].includes(editingDefinition.id) && <>
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
                </>}
                {editingDefinition.id === 'missed-pause-reminder' && (
                  <label>
                    Enviar si sigue pendiente después de
                    <div className="automation-number-field">
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={draft.offsetMinutes}
                        onChange={event => setDraft({ ...draft, offsetMinutes: Number(event.target.value) })}
                      />
                      <span>minutos</span>
                    </div>
                  </label>
                )}
              </div>

              {['pause-reminder', 'missed-pause-reminder'].includes(editingDefinition.id) && (
                <div className="automation-source-box">
                  <CalendarDays size={19} />
                  <div>
                    <strong>Programación de contenido conectada</strong>
                    <p>
                      {editingDefinition.id === 'pause-reminder'
                        ? 'El horario y los bloques de mañana y tarde se administran desde Contenidos. El recordatorio automático se envía 5 minutos antes del desbloqueo.'
                        : `El sistema respeta la empresa, fecha y turno programados en Contenidos. A los ${draft.offsetMinutes} minutos verifica Supabase y solo escribe a quienes todavía no registraron esa pausa.`}
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
                {['pause-reminder', 'missed-pause-reminder'].includes(editingDefinition.id) && (
                  <small>Podés usar: {'{{nombre}}'}, {'{{empresa}}'}, {'{{hora}}'} y {'{{minutos}}'}.</small>
                )}
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
              {editingDefinition.id !== 'missed-pause-reminder' && (
                <button className="btn-secondary" disabled={sendingId === draft.id} onClick={() => void sendAutomationNow(draft)}>
                  <Send size={16} /> {sendingId === draft.id ? 'Enviando...' : 'Enviar ahora'}
                </button>
              )}
              <button className="btn-primary" disabled={savingTemplate} onClick={() => void saveDraft()}>
                <Save size={16} /> {savingTemplate ? 'Guardando...' : ['pause-reminder', 'missed-pause-reminder'].includes(editingDefinition.id) ? 'Guardar automatización' : 'Guardar cambios'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {savedNotice && <div className="email-saved-notice"><CheckCircle2 size={17} /> Automatización actualizada</div>}
    </div>
  );
};

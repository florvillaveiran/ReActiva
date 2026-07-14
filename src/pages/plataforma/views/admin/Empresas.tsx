import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Building, Plus, Mail, User, Link as LinkIcon, Copy, CheckCircle2, ChevronLeft, AlertCircle, Target, Clock, Briefcase, TrendingUp, Zap, Trash2 } from 'lucide-react';
import { getDB, setDB, addEmpresa, Empresa } from '../../mock/data';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { invitationPath, makeShortInvitationCode } from '../../lib/invitationLinks';
import { sendTransactionalEmail } from '../../lib/emailSender';

const hashToNumericId = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 10000;
};

const companyStatusFromSupabase = (status?: string): Empresa['estado'] => {
  if (status === 'pending_onboarding') return 'Pendiente onboarding';
  if (status === 'inactive') return 'Inactiva';
  return 'Activa';
};

const ESTADO_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  'Activa':               { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
  'Pendiente onboarding': { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  'Inactiva':             { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

const Badge: React.FC<{ label: string; color?: string; bg?: string }> = ({ label, color = '#334155', bg = '#f1f5f9' }) => (
  <span style={{ display: 'inline-block', padding: '0.3rem 0.85rem', borderRadius: '999px', backgroundColor: bg, color, fontSize: '0.8rem', fontWeight: 600, margin: '0.25rem' }}>
    {label}
  </span>
);

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; accent?: string }> = ({ icon, label, value, accent = '#10b981' }) => (
  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', flex: 1, minWidth: '140px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <span style={{ color: accent }}>{icon}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{value}</p>
  </div>
);

const getRiesgo = (data: any): { nivel: string; color: string; bg: string; descripcion: string } => {
  if (!data) return { nivel: 'Sin datos', color: '#94a3b8', bg: '#f8fafc', descripcion: 'Completar el onboarding para ver el perfil.' };
  let score = 0;
  if (data.horasSentado === 'Más de 6 horas') score += 3;
  else if (data.horasSentado === 'Entre 4 y 6 horas') score += 1;
  if (data.desafios?.includes('Dolores posturales')) score += 2;
  if (data.desafios?.includes('Sedentarismo')) score += 2;
  if (data.desafios?.includes('Fatiga / Baja energía')) score += 1;
  if (score >= 5) return { nivel: 'Alto', color: '#dc2626', bg: '#fef2f2', descripcion: 'Equipo con alta exposición a riesgo sedentario. Las pausas activas diarias son críticas para reducir lesiones y fatiga.' };
  if (score >= 2) return { nivel: 'Medio', color: '#d97706', bg: '#fffbeb', descripcion: 'Existe riesgo moderado. Las pausas 3 veces por semana mejorarán energía y postura notablemente.' };
  return { nivel: 'Bajo', color: '#059669', bg: '#ecfdf5', descripcion: 'El equipo tiene buen perfil de actividad. ReActiva potenciará su rendimiento y clima laboral.' };
};

// ── Company Detail View ──────────────────────────────────────────
const EmpresaDetalle: React.FC<{ empresa: Empresa; onBack: () => void }> = ({ empresa, onBack }) => {
  const data = empresa.onboardingData;
  const estado = empresa.estado || 'Pendiente onboarding';
  const estilo = ESTADO_STYLES[estado] || ESTADO_STYLES['Pendiente onboarding'];
  const riesgo = getRiesgo(data);
  const fechaFmt = empresa.fechaOnboarding ? new Date(empresa.fechaOnboarding).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : null;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={onBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', padding: '0.5rem 0', background: 'none' }}>
          <ChevronLeft size={20} /> Volver
        </button>
      </div>

      {/* Empresa Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={28} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{empresa.nombre}</h2>
              <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {empresa.ubicacion || 'Por definir'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={13} /> {empresa.contactoNombre || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={13} /> {empresa.rrhhEmail || '—'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.1rem', borderRadius: '999px', backgroundColor: estilo.bg, color: estilo.color, fontSize: '0.85rem', fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: estilo.dot }} />
            {estado}
          </div>
        </div>
      </div>

      {/* If pending – show message */}
      {estado === 'Pendiente onboarding' && (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: '#fffbeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertCircle size={28} color="#d97706" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Onboarding pendiente</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}>
            El responsable aún no completó el formulario de onboarding. Una vez que lo haga, aquí se mostrará el resumen ejecutivo completo.
          </p>
        </div>
      )}

      {/* Executive Summary – only when Activa with data */}
      {estado === 'Activa' && data && (
        <>
          {/* KPI Row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <InfoCard icon={<Users size={16} />} label="Empleados" value={`${empresa.empleados.length}`} />
            <InfoCard icon={<Clock size={16} />} label="Onboarding" value={fechaFmt || '—'} />
            <InfoCard icon={<Briefcase size={16} />} label="Modalidad" value={data.modalidad || '—'} />
            <InfoCard icon={<Clock size={16} />} label="Horas sentado/día" value={data.horasSentado || '—'} accent="#f59e0b" />
          </div>

          {/* Diagnóstico Inicial */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} color="#10b981" /> Diagnóstico inicial
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Tipo de tareas</p>
                <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{data.tareas || '—'}</p>
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Estilo preferido</p>
                <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{data.estilo || '—'}</p>
              </div>
            </div>
          </div>

          {/* Desafíos */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} color="#f59e0b" /> Principales desafíos
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {data.desafios?.length > 0
                ? data.desafios.map((d: string) => <Badge key={d} label={d} bg="#fffbeb" color="#92400e" />)
                : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sin datos</span>
              }
            </div>
          </div>

          {/* Objetivos */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} color="#10b981" /> Objetivos de la empresa
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {data.objetivos?.length > 0
                ? data.objetivos.map((o: string) => <Badge key={o} label={o} bg="#ecfdf5" color="#065f46" />)
                : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sin datos</span>
              }
            </div>
          </div>

          {/* Perfil de Riesgo / Oportunidad */}
          <div className="card" style={{ padding: '1.75rem', borderLeft: `4px solid ${riesgo.color}` }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color={riesgo.color} /> Perfil de Riesgo / Oportunidad
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', backgroundColor: riesgo.bg, display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={22} color={riesgo.color} />
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: riesgo.color, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Riesgo sedentario</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: riesgo.color, margin: 0 }}>{riesgo.nivel}</p>
                </div>
              </div>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, flex: 1, minWidth: '200px', margin: 0 }}>
                {riesgo.descripcion}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Main Empresas View ───────────────────────────────────────────
export const Empresas: React.FC = () => {
  const { user } = useAuth();
  const rrhhEmpresaId = user?.role === 'rrhh' ? user.empresa_id : undefined;
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Empresa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newUbicacion, setNewUbicacion] = useState('');
  const [newResponsable, setNewResponsable] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const loadEmpresas = async () => {
    if (!supabase) {
      setEmpresas(getDB().empresas);
      return;
    }

    setEmpresas([]);

    const [{ data: companies, error: companiesError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabase
        .from('companies')
        .select('id, name, location, status, contact_name, rrhh_email, onboarding_completed_at, onboarding_data, created_at')
        .order('created_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('id, company_id')
        .eq('role', 'usuario'),
    ]);

    if (companiesError || profilesError || !companies) {
      console.error('No se pudieron cargar empresas desde Supabase', companiesError ?? profilesError);
      return;
    }

    const employeeCount = new Map<string, number>();
    (profiles ?? []).forEach((profile: any) => {
      if (!profile.company_id) return;
      employeeCount.set(profile.company_id, (employeeCount.get(profile.company_id) ?? 0) + 1);
    });

    setEmpresas(companies.map((company: any) => ({
      id: hashToNumericId(company.id),
      supabaseId: company.id,
      nombre: company.name,
      ubicacion: company.location ?? '',
      empleados: Array.from({ length: employeeCount.get(company.id) ?? 0 }, (_, index) => index + 1),
      estado: companyStatusFromSupabase(company.status),
      contactoNombre: company.contact_name ?? '',
      rrhhEmail: company.rrhh_email ?? '',
      fechaOnboarding: company.onboarding_completed_at ?? undefined,
      onboardingData: company.onboarding_data ?? undefined,
    })));
  };

  useEffect(() => { void loadEmpresas(); }, []);

  if (selected) {
    return <EmpresaDetalle empresa={selected} onBack={() => { void loadEmpresas(); setSelected(null); }} />;
  }

  const filtered = empresas.filter(e =>
    (!rrhhEmpresaId || e.supabaseId === rrhhEmpresaId.toString() || e.id.toString() === rrhhEmpresaId.toString()) &&
    (e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (e.ubicacion || '').toLowerCase().includes(search.toLowerCase()))
  );

  const handleGenerateLink = async (options?: { sendEmail?: boolean }) => {
    if (!newNombre || !newUbicacion || !newResponsable || !newEmail) return alert('Completa todos los campos obligatorios');
    const token = makeShortInvitationCode();
    const onboardingUrl = new URL(invitationPath('company', token), window.location.origin);

    // In local/demo mode there is no shared backend. Include the minimum
    // company context in the URL so the onboarding remains valid when it is
    // opened in another browser profile or device.
    if (!supabase) {
      onboardingUrl.searchParams.set('empresa', newNombre.trim());
      onboardingUrl.searchParams.set('ubicacion', newUbicacion.trim());
      onboardingUrl.searchParams.set('responsable', newResponsable.trim());
      onboardingUrl.searchParams.set('email', newEmail.trim().toLowerCase());
    }
    const link = onboardingUrl.toString();

    try {
      if (supabase) {
        const { error } = await supabase.rpc('create_company_onboarding_invitation', {
          company_name: newNombre,
          company_location: newUbicacion,
          contact_name: newResponsable,
          rrhh_email: newEmail.trim().toLowerCase(),
          invitation_token: token,
        });
        if (error) throw error;
      }

      addEmpresa({ id: Date.now(), nombre: newNombre, ubicacion: newUbicacion, empleados: [], estado: 'Pendiente onboarding', contactoNombre: newResponsable, rrhhEmail: newEmail, token });
      void loadEmpresas();
    } catch (err: any) {
      alert(err?.message ?? 'No pudimos crear la empresa en Supabase.');
      return;
    }

    setGeneratedLink(link);

    if (options?.sendEmail) {
      const emailResult = await sendTransactionalEmail({
        type: 'company_onboarding',
        to: newEmail.trim().toLowerCase(),
        recipientName: newResponsable.trim(),
        companyName: newNombre.trim(),
        invitationUrl: link,
      });

      if (!emailResult.ok) {
        alert(`El enlace se generó, pero no pudimos enviar el email: ${emailResult.message ?? 'error desconocido'}`);
        return;
      }

      alert('Invitación enviada por email.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); setNewNombre(''); setNewUbicacion(''); setNewResponsable(''); setNewEmail(''); setGeneratedLink('');
  };

  const handleEliminarEmpresa = async (event: React.MouseEvent<HTMLButtonElement>, id: number, nombre: string) => {
    event.stopPropagation();
    const confirmar = window.confirm(`Eliminar ${nombre} por completo?`);
    if (!confirmar) return;

    const db = getDB();
    const empresa = db.empresas.find((item) => item.id === id);
    const empresaActual = empresas.find((item) => item.id === id);

    if (supabase && empresaActual?.supabaseId) {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', empresaActual.supabaseId);
      if (error) {
        alert(error.message);
        return;
      }
    }

    const usuariosEmpresa = new Set(empresa?.empleados || []);

    db.empresas = db.empresas.filter((item) => item.id !== id);
    db.usuarios = db.usuarios.filter((usuario) => usuario.empresa_id !== id);
    db.invitacionesUsuarios = db.invitacionesUsuarios.filter((invitacion) => invitacion.empresa_id !== id);
    db.progresos = db.progresos.filter((progreso) => !usuariosEmpresa.has(progreso.usuario_id));
    db.formularios = db.formularios.filter((formulario) => !usuariosEmpresa.has(formulario.usuario_id));
    setDB(db);
    void loadEmpresas();
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>{rrhhEmpresaId ? 'Empresa' : 'Empresas Registradas'}</h2>
        {!rrhhEmpresaId && <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} /> Nueva Empresa
        </button>}
      </div>

      {!rrhhEmpresaId && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" className="input-field" placeholder="Buscar empresa..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '3rem', border: 'none', backgroundColor: 'var(--bg-secondary-color)' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron empresas.</div>}
        {filtered.map(empresa => {
          const est = empresa.estado || 'Activa';
          const s = ESTADO_STYLES[est] || ESTADO_STYLES['Activa'];
          return (
            <div
              key={empresa.id}
              className="card"
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onClick={() => setSelected(empresa)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(16,185,129,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building size={24} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.2rem' }}>{empresa.nombre}</h3>
                    <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {empresa.ubicacion || 'Por definir'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} /> {empresa.empleados.length} empleados</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', borderRadius: '999px', backgroundColor: s.bg, color: s.color, fontSize: '0.82rem', fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.dot }} />
                    {est}
                  </div>
                  {!rrhhEmpresaId && <button
                    type="button"
                    onClick={(event) => handleEliminarEmpresa(event, empresa.id, empresa.nombre)}
                    aria-label={`Eliminar ${empresa.nombre}`}
                    title={`Eliminar ${empresa.nombre}`}
                    style={{
                      border: 'none',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      borderRadius: '999px',
                      padding: '0.38rem 0.75rem',
                      fontFamily: 'var(--font)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 2rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 500 }}>
                  <User size={14} color="var(--primary-color)" /> {empresa.contactoNombre || 'N/A'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 500 }}>
                  <Mail size={14} color="var(--primary-color)" /> {empresa.rrhhEmail || 'N/A'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)' }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#10b981' }}>
                <Building size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0B1B3D', marginBottom: '0.5rem' }}>Incorporar nueva empresa</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Genera un enlace único para que el responsable complete el onboarding.</p>
            </div>

            {!generatedLink ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre de la empresa <span style={{color: '#dc2626'}}>*</span></label>
                  <input type="text" className="input-field" placeholder="Ej: TechCorp" value={newNombre} onChange={e => setNewNombre(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ubicación <span style={{color: '#dc2626'}}>*</span></label>
                  <input type="text" className="input-field" placeholder="Ej: México - Ciudad de México" value={newUbicacion} onChange={e => setNewUbicacion(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre del responsable <span style={{color: '#dc2626'}}>*</span></label>
                  <input type="text" className="input-field" placeholder="Ej: Laura Martínez" value={newResponsable} onChange={e => setNewResponsable(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email del responsable <span style={{color: '#dc2626'}}>*</span></label>
                  <input type="email" className="input-field" placeholder="correo@empresa.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <button onClick={() => void handleGenerateLink()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s' }}>
                    <LinkIcon size={24} /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Generar enlace</span>
                  </button>
                  <button onClick={() => void handleGenerateLink({ sendEmail: true })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s' }}>
                    <Mail size={24} /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enviar por email</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ width: '100%', padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enlace generado con éxito</p>
                  <div style={{ wordBreak: 'break-all', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>{generatedLink}</div>
                  <button onClick={copyToClipboard} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    {copied ? '¡Copiado!' : 'Copiar enlace'}
                  </button>
                </div>
                <button onClick={handleCloseModal} style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', border: 'none', background: 'none', cursor: 'pointer' }}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

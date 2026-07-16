import React, { useState } from 'react';
import { Activity, Building2, CalendarDays, CheckCircle2, ChevronDown, Mail, MapPin, TrendingUp, UserRound, Users } from 'lucide-react';

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div className="card" style={{ margin: 0, padding: '1.35rem', ...style }}>{children}</div>
);

export const DemoEmpresa: React.FC = () => (
  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 className="header-title" style={{ marginBottom: '0.3rem' }}>Empresa</h2>
      <p style={{ color: '#64748b' }}>Informacion ficticia preparada para la demostracion.</p>
    </div>

    <Card style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={30} /></div>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: 3 }}>Empresa Alpha</h3>
            <p style={{ color: '#64748b' }}>Servicios profesionales - Buenos Aires</p>
          </div>
        </div>
        <span style={{ borderRadius: 999, padding: '0.45rem 0.85rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.78rem' }}>Programa activo</span>
      </div>
    </Card>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
      {[
        [<Users size={20} />, 'Colaboradores', '48'],
        [<Activity size={20} />, 'Adherencia', '83%'],
        [<TrendingUp size={20} />, 'Impacto positivo', '87%'],
        [<CalendarDays size={20} />, 'Inicio del programa', '6 abr 2026'],
      ].map(([icon, label, value]) => (
        <Card key={String(label)}>
          <span style={{ color: 'var(--primary-color)' }}>{icon}</span>
          <p style={{ marginTop: '0.7rem', color: '#64748b', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase' }}>{label}</p>
          <strong style={{ display: 'block', marginTop: 4, fontSize: '1.35rem', color: '#0f172a' }}>{value}</strong>
        </Card>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <Card>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Datos de la empresa</h3>
        {[
          [<MapPin size={17} />, 'Ubicacion', 'Buenos Aires, Argentina'],
          [<UserRound size={17} />, 'Responsable', 'Sofia Alvarez'],
          [<Mail size={17} />, 'Email de RRHH', 'rrhh@empresa-alpha.demo'],
        ].map(([icon, label, value]) => (
          <div key={String(label)} style={{ display: 'grid', gridTemplateColumns: '28px 130px 1fr', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #eef2f7' }}>
            <span style={{ color: 'var(--primary-color)' }}>{icon}</span><span style={{ color: '#64748b' }}>{label}</span><b>{value}</b>
          </div>
        ))}
      </Card>
      <Card>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Configuracion del programa</h3>
        {['Pausas lunes, miercoles y viernes', 'Dos microentrenamientos por dia', 'Cuestionarios diarios y resumen semanal', 'Reporte mensual para RRHH'].map(item => (
          <p key={item} style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#475569', padding: '0.55rem 0' }}><CheckCircle2 size={17} color="var(--primary-color)" />{item}</p>
        ))}
      </Card>
    </div>
  </div>
);

const demoUsers = [
  { initials: 'MG', name: 'Maria Gonzalez', area: 'Administracion', email: 'maria@empresa-alpha.demo', participation: 92, energy: '4.4', status: 'Excelente', risk: 'Bajo', pain: 'Sin dolores reportados', goals: ['Reducir el estres', 'Mejorar postura frente a pantalla'], habits: 'Camina 3 veces por semana', work: '8 horas frente a pantalla, pausas moderadas' },
  { initials: 'JP', name: 'Juan Perez', area: 'Comercial', email: 'juan@empresa-alpha.demo', participation: 86, energy: '4.1', status: 'Activo', risk: 'Bajo', pain: 'Molestia leve en cuello al final del dia', goals: ['Aumentar energia', 'Dormir mejor'], habits: 'Entrena los sabados', work: 'Reuniones frecuentes y uso intensivo de notebook' },
  { initials: 'LC', name: 'Lucia Castro', area: 'Tecnologia', email: 'lucia@empresa-alpha.demo', participation: 81, energy: '3.9', status: 'Activo', risk: 'Medio', pain: 'Tension en hombros y espalda alta', goals: ['Mejorar movilidad', 'Bajar tension cervical'], habits: 'Actividad fisica irregular', work: 'Jornada sentada con alta carga de foco' },
  { initials: 'TS', name: 'Tomas Silva', area: 'Operaciones', email: 'tomas@empresa-alpha.demo', participation: 74, energy: '3.6', status: 'Seguimiento', risk: 'Medio', pain: 'Dolor lumbar intermitente', goals: ['Reducir dolor lumbar', 'Sostener pausas diarias'], habits: 'Poca actividad semanal', work: 'Alterna deposito, traslados y computadora' },
];

export const DemoUsuarios: React.FC = () => {
  const [openEmail, setOpenEmail] = useState<string | null>(demoUsers[0]?.email ?? null);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1.5rem' }}>
        <div><h2 className="header-title" style={{ marginBottom: '0.3rem' }}>Usuarios</h2><p style={{ color: '#64748b' }}>Colaboradores ficticios de Empresa Alpha.</p></div>
        <span style={{ background: '#ecfdf5', color: '#047857', borderRadius: 999, padding: '0.5rem 0.85rem', fontWeight: 800 }}>48 colaboradores</span>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px 34px', padding: '0.85rem 1.25rem', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
          <span>Colaborador</span><span>Area</span><span>Participacion</span><span>Energia</span><span>Estado</span><span />
        </div>
        {demoUsers.map(person => {
          const open = openEmail === person.email;
          return (
            <div key={person.email} style={{ borderTop: '1px solid #eef2f7' }}>
              <button
                type="button"
                onClick={() => setOpenEmail(open ? null : person.email)}
                style={{ width: '100%', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px 34px', alignItems: 'center', padding: '1rem 1.25rem', border: 'none', background: open ? '#fbfeff' : 'white', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 999, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{person.initials}</span>
                  <div><b style={{ color: '#0f172a' }}>{person.name}</b><p style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: 2 }}>{person.email}</p></div>
                </div>
                <span style={{ color: '#475569' }}>{person.area}</span>
                <b style={{ color: 'var(--primary-color)' }}>{person.participation}%</b>
                <b>{person.energy} / 5</b>
                <span style={{ width: 'fit-content', borderRadius: 999, padding: '0.35rem 0.65rem', background: person.status === 'Seguimiento' ? '#fffbeb' : '#ecfdf5', color: person.status === 'Seguimiento' ? '#b45309' : '#047857', fontWeight: 800, fontSize: '0.75rem' }}>{person.status}</span>
                <ChevronDown size={18} color="#64748b" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
              </button>
              {open && (
                <div style={{ padding: '0 1.25rem 1.25rem 5rem', background: '#fbfeff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="card" style={{ margin: 0, padding: '1rem', boxShadow: 'none' }}>
                      <h3 style={{ margin: '0 0 0.8rem', color: '#0f172a', fontSize: '0.95rem' }}>Onboarding respondido</h3>
                      <p style={{ margin: '0 0 0.55rem', color: '#475569' }}><b>Indice de riesgo inicial:</b> {person.risk}</p>
                      <p style={{ margin: '0 0 0.55rem', color: '#475569' }}><b>Dolor musculoesqueletico:</b> {person.pain}</p>
                      <p style={{ margin: 0, color: '#475569' }}><b>Contexto laboral:</b> {person.work}</p>
                    </div>
                    <div className="card" style={{ margin: 0, padding: '1rem', boxShadow: 'none' }}>
                      <h3 style={{ margin: '0 0 0.8rem', color: '#0f172a', fontSize: '0.95rem' }}>Metas y habitos</h3>
                      <ul style={{ margin: '0 0 0.7rem 1rem', padding: 0, color: '#475569' }}>
                        {person.goals.map(goal => <li key={goal}>{goal}</li>)}
                      </ul>
                      <p style={{ margin: 0, color: '#475569' }}><b>Actividad:</b> {person.habits}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>
      <p style={{ marginTop: '0.9rem', color: '#94a3b8', fontSize: '0.78rem' }}>Se muestran 4 perfiles de ejemplo de un total ficticio de 48 colaboradores.</p>
    </div>
  );
};

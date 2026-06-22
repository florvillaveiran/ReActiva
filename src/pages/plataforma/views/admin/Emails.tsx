import React, { useState, useEffect } from 'react';
import { Mail, Clock, Send, AlarmClock, Save, BarChart3, Settings, LayoutTemplate, Activity, Bell, Target, TrendingUp, AlertTriangle, CheckCircle2, Copy, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { getDB, Empresa } from '../../mock/data';

// Mock de estadísticas de emails
const statsData = [
  { name: 'Semana 1', enviados: 120, aperturas: 85, participacion: 65 },
  { name: 'Semana 2', enviados: 130, aperturas: 95, participacion: 72 },
  { name: 'Semana 3', enviados: 125, aperturas: 90, participacion: 68 },
  { name: 'Semana 4', enviados: 140, aperturas: 110, participacion: 85 },
];

export const Emails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'estadisticas' | 'seguimiento' | 'automatizaciones' | 'plantillas'>('estadisticas');

  // Estado Seguimiento Automático
  const [minutosDespues, setMinutosDespues] = useState(30);
  const [mensajeFollowup, setMensajeFollowup] = useState('Notamos que aún no completaste la pausa activa. ¡Todavía estás a tiempo! Solo te tomará 5 minutos.');

  // Estado Automatizaciones Inteligentes
  const [autoReenganche, setAutoReenganche] = useState(true);
  const [autoReengancheDias, setAutoReengancheDias] = useState(5);
  
  const [autoReconocimiento, setAutoReconocimiento] = useState(true);
  const [autoReconocimientoDias, setAutoReconocimientoDias] = useState(20);
  
  const [autoAlertaBaja, setAutoAlertaBaja] = useState(true);

  // Empresas & Filtro
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaFiltro, setEmpresaFiltro] = useState('all');

  useEffect(() => {
    setEmpresas(getDB().empresas);
  }, []);

  // Plantillas
  const [plantillas, setPlantillas] = useState([
    { id: 1, title: 'Bienvenida Usuario', desc: 'Email enviado inmediatamente después del Onboarding.', type: 'Onboarding', asunto: '¡Bienvenido a ReActiva!', cuerpo: 'Hola,\n\nTe damos la bienvenida a tu nuevo programa de bienestar. Estamos listos para comenzar...' },
    { id: 2, title: 'Onboarding Empresa', desc: 'Instrucciones para el RRHH de la nueva empresa.', type: 'Onboarding', asunto: 'Instrucciones Onboarding ReActiva', cuerpo: 'Estimado equipo de RRHH,\n\nAquí tienen los enlaces para invitar a sus colaboradores...' },
    { id: 3, title: 'Recordatorio Pausa', desc: 'Plantilla base usada en los recordatorios previos.', type: 'Operativo', asunto: '¡Tu pausa activa está por comenzar!', cuerpo: 'Preparate para tu pausa activa de hoy. Serán solo 5 minutos...' },
    { id: 4, title: 'Reenganche Inactivos', desc: 'Campaña motivacional tras 5 días de inactividad.', type: 'Motivación', asunto: 'Te extrañamos en ReActiva', cuerpo: 'Vimos que hace unos días no te sumás a las pausas. No pasa nada, podés retomar cuando quieras...' },
    { id: 5, title: 'Felicitación Racha', desc: 'Reconocimiento tras alcanzar 20 días activos.', type: 'Motivación', asunto: '¡Imparable! Felicitaciones por tu constancia', cuerpo: '¡Increíble! Llevás 20 días consecutivos cuidando de vos...' },
  ]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  // Mock data reacts to filter just for visualization
  const currentStats = empresaFiltro === 'all' 
    ? statsData 
    : statsData.map(s => ({ ...s, enviados: Math.floor(s.enviados * 0.4), aperturas: Math.floor(s.aperturas * 0.4), participacion: Math.floor(s.participacion * 0.8) }));

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="header-title" style={{ marginBottom: '0.2rem' }}>Centro de Correos y Automatizaciones</h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Gestiona los emails automáticos vinculados a la participación</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select className="input-field" value={empresaFiltro} onChange={e => setEmpresaFiltro(e.target.value)} style={{ backgroundColor: 'white', minWidth: '200px' }}>
            <option value="all">Todas las empresas (Global)</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Guardar Configuración
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        {[
          { id: 'estadisticas', label: 'Estadísticas de Rendimiento', icon: <BarChart3 size={16} /> },
          { id: 'seguimiento', label: 'Seguimiento Automático (Follow-up)', icon: <AlarmClock size={16} /> },
          { id: 'automatizaciones', label: 'Reglas Inteligentes', icon: <Settings size={16} /> },
          { id: 'plantillas', label: 'Biblioteca de Plantillas', icon: <LayoutTemplate size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ 
              padding: '0.75rem 0', background: 'none', border: 'none', 
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent', 
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)', 
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENIDO ESTADISTICAS ── */}
      {activeTab === 'estadisticas' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { title: 'Emails Enviados', value: '1,240', desc: 'Este mes', color: '#0f172a', icon: <Send size={20} color="#64748b" /> },
              { title: 'Tasa de Apertura', value: '76%', desc: '+2.4% vs mes anterior', color: '#0ea5e9', icon: <Mail size={20} color="#0ea5e9" /> },
              { title: 'Tasa de Clics (CTR)', value: '45%', desc: '+1.1% vs mes anterior', color: '#8b5cf6', icon: <Target size={20} color="#8b5cf6" /> },
              { title: 'Participación Generada', value: '62%', desc: 'Usuarios que hicieron la pausa', color: '#10b981', icon: <Activity size={20} color="#10b981" /> }
            ].map((kpi, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{kpi.title}</span>
                  {kpi.icon}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{kpi.desc}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Correlación: Envíos vs Participación</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentStats} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="enviados" name="Emails Enviados" stroke="#94a3b8" strokeWidth={3} dot={{r:4}} />
                  <Line type="monotone" dataKey="participacion" name="Participación Lograda" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENIDO SEGUIMIENTO ── */}
      {activeTab === 'seguimiento' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: 1, minWidth: '350px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlarmClock size={20} color="#9333ea" /> Configuración de Seguimiento Automático
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Esta automatización detecta si un usuario no realizó la pausa activa programada y le envía un recordatorio amigable para aumentar la adherencia.
            </p>

            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '2rem' }}>
              <CheckCircle2 size={18} color="#0d9488" style={{ marginTop: '0.1rem' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f766e', marginBottom: '0.2rem' }}>Zonas horarias automáticas</strong>
                <span style={{ fontSize: '0.8rem', color: '#115e59' }}>El envío respetará la hora local configurada en la Ubicación (País/Ciudad) de la ficha de cada empresa, garantizando que el email llegue en el momento exacto.</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Tiempo de espera para envío</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="number"
                  className="input-field"
                  value={minutosDespues}
                  onChange={(e) => setMinutosDespues(Number(e.target.value))}
                  style={{ width: '100px' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>minutos después del horario de la pausa</span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Mensaje de seguimiento</label>
              <textarea
                className="input-field"
                value={mensajeFollowup}
                onChange={(e) => setMensajeFollowup(e.target.value)}
                style={{ resize: 'none', minHeight: '120px', lineHeight: 1.5 }}
              />
            </div>
            
            <button className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <Send size={14} /> Enviar prueba a mi correo
            </button>
          </div>
          
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '1rem', textTransform: 'uppercase' }}>¿Cómo funciona?</h4>
              <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>El sistema publica el video en la plataforma.</li>
                <li style={{ marginBottom: '0.5rem' }}>Si se configuró un <em>recordatorio previo</em>, se envía antes.</li>
                <li style={{ marginBottom: '0.5rem' }}>El sistema monitorea la participación en tiempo real.</li>
                <li>Transcurridos <strong>{minutosDespues} minutos</strong>, filtra a los inactivos y envía este seguimiento.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENIDO AUTOMATIZACIONES ── */}
      {activeTab === 'automatizaciones' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>Activa reglas inteligentes para mantener el compromiso de los usuarios sin intervención manual.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Reenganche */}
            <div className="card" style={{ padding: '1.5rem', border: autoReenganche ? '1px solid #10b981' : '1px solid #e2e8f0', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={20} color={autoReenganche ? '#10b981' : '#94a3b8'} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Campaña de Reenganche</h3>
                </div>
                <label style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}>
                  <input type="checkbox" checked={autoReenganche} onChange={e => setAutoReenganche(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                </label>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>Envía un correo motivacional a los usuarios que han dejado de participar para incentivar su retorno.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: autoReenganche ? 1 : 0.5 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Activar tras</span>
                <input type="number" className="input-field" value={autoReengancheDias} onChange={e=>setAutoReengancheDias(Number(e.target.value))} disabled={!autoReenganche} style={{ width: '60px', padding: '0.2rem 0.5rem' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>días de inactividad</span>
              </div>
            </div>

            {/* Reconocimiento */}
            <div className="card" style={{ padding: '1.5rem', border: autoReconocimiento ? '1px solid #3b82f6' : '1px solid #e2e8f0', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color={autoReconocimiento ? '#3b82f6' : '#94a3b8'} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Email de Reconocimiento</h3>
                </div>
                <label style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}>
                  <input type="checkbox" checked={autoReconocimiento} onChange={e => setAutoReconocimiento(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                </label>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>Premia y reconoce el esfuerzo de los usuarios que mantienen una racha constante de participación.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: autoReconocimiento ? 1 : 0.5 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Felicitar a los</span>
                <input type="number" className="input-field" value={autoReconocimientoDias} onChange={e=>setAutoReconocimientoDias(Number(e.target.value))} disabled={!autoReconocimiento} style={{ width: '60px', padding: '0.2rem 0.5rem' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>días de racha activa</span>
              </div>
            </div>

            {/* Alerta Administrador */}
            <div className="card" style={{ padding: '1.5rem', border: autoAlertaBaja ? '1px solid #f59e0b' : '1px solid #e2e8f0', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} color={autoAlertaBaja ? '#f59e0b' : '#94a3b8'} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Alerta de Baja Adherencia</h3>
                </div>
                <label style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}>
                  <input type="checkbox" checked={autoAlertaBaja} onChange={e => setAutoAlertaBaja(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }} />
                </label>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>Te notifica automáticamente a vos (Administrador) si la participación promedio de una Empresa cae a niveles críticos.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: autoAlertaBaja ? 1 : 0.5 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Avisar si participación cae debajo del</span>
                <strong style={{ fontSize: '0.9rem', color: '#b45309' }}>40%</strong>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── CONTENIDO PLANTILLAS ── */}
      {activeTab === 'plantillas' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {plantillas.map((p) => (
              <div key={p.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{p.title}</h4>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{p.type}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, flex: 1 }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button onClick={() => setEditingTemplate({...p})} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', flex: 1 }}>Editar</button>
                  <button className="btn-secondary" title="Duplicar" style={{ padding: '0.4rem', flexShrink: 0 }}><Copy size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR PLANTILLA ── */}
      {editingTemplate && (
        <div onClick={e=>{if(e.target===e.currentTarget)setEditingTemplate(null)}} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '600px', maxWidth: '95vw', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Editar Plantilla</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>{editingTemplate.title}</p>
              </div>
              <button onClick={() => setEditingTemplate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Asunto del email</label>
              <input 
                type="text" 
                className="input-field" 
                value={editingTemplate.asunto} 
                onChange={e => setEditingTemplate({...editingTemplate, asunto: e.target.value})} 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Cuerpo del mensaje</label>
              <textarea 
                className="input-field" 
                value={editingTemplate.cuerpo} 
                onChange={e => setEditingTemplate({...editingTemplate, cuerpo: e.target.value})} 
                style={{ minHeight: '200px', resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setEditingTemplate(null)}>Cancelar</button>
              <button className="btn-primary" onClick={() => {
                setPlantillas(plantillas.map(p => p.id === editingTemplate.id ? editingTemplate : p));
                setEditingTemplate(null);
              }}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

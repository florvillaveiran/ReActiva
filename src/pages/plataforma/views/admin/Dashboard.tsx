import React, { useState, useMemo } from 'react';
import { Users, Activity, HeartPulse, Sparkles, Smile, Clock, MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useEmpresas } from '../../context/EmpresasContext';
import { useFeedbackIntelligence } from '../../hooks/useFeedbackIntelligence';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [empresaId, setEmpresaId] = useState('all');
  const [mensaje, setMensaje] = useState('¡Excelente semana equipo! Recuerden tomar pausas activas.');

  const { empresas } = useEmpresas();
  const selectedEmpresa = empresaId === 'all'
    ? undefined
    : empresas.find(e => e.id.toString() === empresaId || e.supabaseId === empresaId);
  const statsCompanyId = empresaId === 'all' ? undefined : selectedEmpresa?.supabaseId;

  // Stats reales del usuario demo (lee de localStorage en vivo)
  // TODO(backend): cuando exista la API, pasar empresaId al hook para filtrar.
  const stats = useAdminStats(statsCompanyId);
  const feedback = useFeedbackIntelligence();

  const sugerirMensaje = () => {
    const opciones = [
      "¡Vamos con toda la energía esta semana!",
      "Tu bienestar es nuestra prioridad. ¡Toma tu pausa activa!",
      "Un cuerpo en movimiento es una mente más productiva."
    ];
    setMensaje(opciones[Math.floor(Math.random() * opciones.length)]);
  };

  const metrics = useMemo(() => {
    if (stats.hayDatos) {
      return {
        totales: String(stats.usuariosCount),
        pausas: String(stats.totalPausas),
        participacion: `${stats.adherencia}%`,
        dolor: `${stats.reportanMolestias}%`,
        emocion: stats.estadoEmocional != null ? `${stats.estadoEmocional}/5` : 'Sin datos',
        zonas: stats.zonasDolorTop.length > 0 ? stats.zonasDolorTop : ['Sin dolor reportado'],
        data: stats.participacionPorDia,
        foco: stats.foco,
        tension: stats.tensionDistribucion.length > 0 ? stats.tensionDistribucion : [
          { name: 'Sin tensión reportada', valor: 100 },
        ],
      };
    }

    return {
      totales: '0',
      pausas: '0',
      participacion: '0%',
      dolor: '0%',
      emocion: '0/5',
      zonas: [],
      data: [],
      foco: { enfocado: 0, normal: 0, disperso: 0 },
      tension: [],
    };
  }, [stats]);
  const lastFeedbackDate = feedback.stats.lastDate
    ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(feedback.stats.lastDate))
    : 'Sin registros';

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Dashboard General</h2>
        <select 
          className="input-field" 
          style={{ width: '220px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
          value={empresaId}
          onChange={(e) => setEmpresaId(e.target.value)}
        >
          <option value="all">Todas las empresas</option>
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id.toString()}>{emp.nombre}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Adherencia Semanal */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#f0fdfa', padding: '0.5rem', borderRadius: '8px' }}>
              <Activity size={20} color="#0d9488" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Adherencia Semanal</h3>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0d9488', lineHeight: 1 }}>{metrics.participacion}</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>Constancia promedio</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <div>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{metrics.totales}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Usuarios</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{metrics.pausas}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Pausas</p>
            </div>
          </div>
        </div>

        {/* Estado Físico */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#fffbeb', padding: '0.5rem', borderRadius: '8px' }}>
              <HeartPulse size={20} color="#d97706" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Estado Físico</h3>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#d97706', lineHeight: 1 }}>{metrics.dolor}</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>Reportan molestias hoy</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            {metrics.zonas.map(z => (
              <span key={z} style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 500 }}>{z}</span>
            ))}
          </div>
        </div>

        {/* Estado Emocional */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#f3e8ff', padding: '0.5rem', borderRadius: '8px' }}>
              <Smile size={20} color="#9333ea" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Estado Emocional</h3>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#9333ea', lineHeight: 1 }}>{metrics.emocion}</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>Promedio general</span>
          </div>
          <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
              {stats.hayDatos ? 'Promedio calculado con las respuestas recibidas.' : 'Todavía no hay respuestas para calcular este indicador.'}
            </p>
          </div>
        </div>

        {/* Feedback de Usuarios */}
        <button
          type="button"
          onClick={() => navigate('/plataforma/admin/feedback')}
          className="card"
          style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #d1fae5', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'left', cursor: 'pointer', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#ccfbf1', padding: '0.5rem', borderRadius: '8px' }}>
              <MessageSquareText size={20} color="#0d9488" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Feedback de Usuarios</h3>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.35rem', fontWeight: 700, color: '#0d9488', lineHeight: 1 }}>{feedback.stats.thisMonth}</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>comentarios recibidos este mes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #ccfbf1' }}>
            <div>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: feedback.stats.delta >= 0 ? '#059669' : '#e11d48' }}>
                {feedback.stats.delta >= 0 ? '+' : ''}{feedback.stats.delta}
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>vs mes anterior</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{lastFeedbackDate}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Última recepción</p>
            </div>
          </div>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {/* Gráfico de Participación */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#f0f9ff', padding: '0.5rem', borderRadius: '8px' }}>
              <Users size={20} color="#0284c7" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Participación</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
            {metrics.data.map((item, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#0284c7' }}>
                  <span>{item.name}</span>
                  <span>{item.participacion}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f0f9ff', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.participacion}%`, height: '100%', backgroundColor: '#0ea5e9', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nivel de Foco */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}>
              <Activity size={20} color="#3b82f6" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Nivel de Foco</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
            {/* Enfocado */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>
                <span>Enfocado</span>
                <span>{metrics.foco.enfocado}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#eff6ff', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.foco.enfocado}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Normal */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
                <span>Normal</span>
                <span>{metrics.foco.normal}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.foco.normal}%`, height: '100%', backgroundColor: '#94a3b8', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Disperso */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: '#f59e0b' }}>
                <span>Disperso</span>
                <span>{metrics.foco.disperso}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#fffbeb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.foco.disperso}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Momento de mayor tensión */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#e0e7ff', padding: '0.5rem', borderRadius: '8px' }}>
              <Clock size={20} color="#4f46e5" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Momento de mayor tensión</h3>
          </div>
          
          <div style={{ flex: 1, minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={metrics.tension} margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={120} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="valor" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16}>
                  {/* labels could be added here */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mensaje */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#faf5ff', padding: '0.5rem', borderRadius: '8px' }}>
              <Sparkles size={20} color="#a855f7" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Mensaje del Día</h3>
          </div>
          
          <textarea 
            className="input-field" 
            rows={4} 
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            style={{ marginBottom: '1rem', resize: 'none', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', flex: 1 }}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={sugerirMensaje} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px' }}>
              Sugerir con IA
            </button>
            <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px' }}>
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

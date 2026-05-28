import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Target, CheckCircle2, CalendarDays, Award, HeartPulse, PieChart, Sparkles } from 'lucide-react';

const mockProgresoData = [
  { day: 'Lun', energiaPost: 3, foco: 3 },
  { day: 'Mié', energiaPost: 4, foco: 4 },
  { day: 'Vie', energiaPost: 5, foco: 4 },
];

export const UsuarioProgreso: React.FC = () => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 20px', boxSizing: 'border-box', animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 className="header-title" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color)' }}>Mi Progreso</h2>
        <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #bbf7d0' }}>
          Esta Semana
        </span>
      </div>

      {/* PASO 4: Participación - Cards Pequeñas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '0.5rem', borderRadius: '8px' }}>
            <CheckCircle2 size={24} color="#16a34a" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>5 Pausas</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>completadas esta semana 🙌</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '8px' }}>
            <CalendarDays size={24} color="#ef4444" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>3 Días</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>activos de lunes a viernes</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ backgroundColor: '#fffbeb', padding: '0.5rem', borderRadius: '8px' }}>
            <Award size={24} color="#d97706" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>83%</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>adherencia. ¡Vas excelente!</p>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1.5rem',
      }}>
        {/* Gráfica de Energía */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ backgroundColor: '#fffbeb', padding: '0.5rem', borderRadius: '8px' }}>
                <Zap size={20} color="#d97706" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Energía Post-Pausa</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Evolución de tu vitalidad</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#d97706' }}>80%</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Promedio</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockProgresoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}
                  itemStyle={{ color: '#d97706', fontSize: '0.9rem', fontWeight: 500 }}
                  formatter={(value: number) => [`${value} / 5`, 'Energía']}
                />
                <Area 
                  type="monotone" 
                  dataKey="energiaPost" 
                  stroke="#fbbf24" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEnergia)" 
                  activeDot={{ r: 6, fill: '#fbbf24', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Foco */}
        <div className="card" style={{ padding: '1.5rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}>
                <Target size={20} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Nivel de Foco</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Tu concentración semanal</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>73%</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Promedio</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockProgresoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFoco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}
                  itemStyle={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: 500 }}
                  formatter={(value: number) => [`${value} / 5`, 'Foco']}
                />
                <Area 
                  type="monotone" 
                  dataKey="foco" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFoco)" 
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PASO 5: Dolor, Impacto e Insights */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1.5rem',
        marginTop: '1.5rem'
      }}>
        
        {/* Dolor / Molestias */}
        <div className="card" style={{ padding: '1.25rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: '#fef2f2', padding: '0.4rem', borderRadius: '8px' }}>
              <HeartPulse size={18} color="#ef4444" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Molestias Físicas</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>2</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, paddingBottom: '2px' }}>días con molestias leves</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 500 }}>Cuello</span>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 500 }}>Hombros</span>
          </div>
        </div>

        {/* Impacto Percibido */}
        <div className="card" style={{ padding: '1.25rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: '#f0fdfa', padding: '0.4rem', borderRadius: '8px' }}>
              <PieChart size={18} color="#0d9488" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Impacto Percibido</h3>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
              <span>Beneficio de las pausas</span>
              <span style={{ color: '#0d9488' }}>85%</span>
            </div>
            {/* Barra elegante */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#ccfbf1', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', backgroundColor: '#14b8a6', borderRadius: '4px' }}></div>
            </div>
          </div>
          <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
            Sientes que las pausas te están ayudando mucho a liberar tensión diaria.
          </p>
        </div>

        {/* Insights Positivos */}
        <div className="card" style={{ padding: '1.25rem', margin: 0, borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', backgroundColor: '#faf5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: '#f3e8ff', padding: '0.4rem', borderRadius: '8px' }}>
              <Sparkles size={18} color="#9333ea" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#7e22ce' }}>Para ti</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b21a8', lineHeight: 1.5, fontWeight: 500 }}>
            "Tu constancia está mejorando 🙌 Notamos que tu energía promedio aumentó esta semana. ¡Sigue así, tu cuerpo te lo agradece!"
          </p>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Search, MapPin, Users, Activity, Mail, Phone, ChevronLeft, Building, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

const mockEmpresas = [
  { id: 1, nombre: 'Empresa Alpha', ubicacion: 'Madrid, España', empleados: 450, participacion: 85, estado: 'Activa', rrhhEmail: 'rrhh@alpha.com', rrhhPhone: '+34 600 123 456' },
  { id: 2, nombre: 'Empresa Beta', ubicacion: 'Bogotá, Colombia', empleados: 320, participacion: 92, estado: 'Activa', rrhhEmail: 'contacto@beta.co', rrhhPhone: '+57 300 987 654' },
  { id: 3, nombre: 'Empresa Gamma', ubicacion: 'CDMX, México', empleados: 890, participacion: 78, estado: 'En riesgo', rrhhEmail: 'rh@gamma.mx', rrhhPhone: '+52 55 1234 5678' },
];

const mockDetalleData = [
  { name: 'Sem 1', participacion: 80, energia: 3.5, dolor: 20 },
  { name: 'Sem 2', participacion: 85, energia: 3.8, dolor: 15 },
  { name: 'Sem 3', participacion: 82, energia: 3.9, dolor: 12 },
  { name: 'Sem 4', participacion: 90, energia: 4.2, dolor: 8 },
];

export const Empresas: React.FC = () => {
  const [vista, setVista] = useState<'lista' | 'detalle' | 'nueva'>('lista');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any>(null);

  const handleVerDetalle = (empresa: any) => {
    setEmpresaSeleccionada(empresa);
    setVista('detalle');
  };

  if (vista === 'nueva') {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => setVista('lista')} className="btn-secondary" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', padding: '0.5rem 0' }}>
          <ChevronLeft size={20} /> Volver a la lista
        </button>
        <h2 className="header-title">Agregar Nueva Empresa</h2>
        
        <div className="card" style={{ padding: '2.5rem' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Nombre de la Empresa</label>
            <input type="text" className="input-field" placeholder="Ej: TechCorp" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Ubicación</label>
            <input type="text" className="input-field" placeholder="Ej: Ciudad, País" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Cantidad de Empleados</label>
            <input type="number" className="input-field" placeholder="Ej: 150" />
          </div>
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label">Email Contacto RRHH</label>
            <input type="email" className="input-field" placeholder="rrhh@empresa.com" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setVista('lista')}>Cancelar</button>
            <button className="btn-primary" onClick={() => setVista('lista')}>Guardar Empresa</button>
          </div>
        </div>
      </div>
    );
  }

  if (vista === 'detalle' && empresaSeleccionada) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button onClick={() => setVista('lista')} className="btn-secondary" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', padding: '0.5rem 0' }}>
          <ChevronLeft size={20} /> Volver a la lista
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 className="header-title" style={{ marginBottom: '0.5rem' }}>{empresaSeleccionada.nombre}</h2>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {empresaSeleccionada.ubicacion}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} /> {empresaSeleccionada.empleados} empleados</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <Mail size={20} color="var(--primary-color)" />
               <div>
                 <p className="text-sm text-muted">RRHH Email</p>
                 <p className="font-medium">{empresaSeleccionada.rrhhEmail}</p>
               </div>
            </div>
            <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <Phone size={20} color="var(--primary-color)" />
               <div>
                 <p className="text-sm text-muted">Teléfono</p>
                 <p className="font-medium">{empresaSeleccionada.rrhhPhone}</p>
               </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Participación (%)</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDetalleData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Bar dataKey="participacion" fill="var(--primary-color)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Energía y Dolor</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockDetalleData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="energia" name="Energía (1-5)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="dolor" name="% con Dolor" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Empresas Registradas</h2>
        <button className="btn-primary" onClick={() => setVista('nueva')}>
          <Plus size={20} />
          Nueva Empresa
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar empresa por nombre o ubicación..." 
            style={{ paddingLeft: '3rem', border: 'none', backgroundColor: 'var(--bg-secondary-color)' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {mockEmpresas.map(empresa => (
          <div key={empresa.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={24} color="var(--primary-color)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.25rem' }}>{empresa.nombre}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={16} /> {empresa.ubicacion}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={16} /> {empresa.empleados} empleados</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Participación</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Activity size={18} color={empresa.participacion > 80 ? '#10b981' : '#f59e0b'} />
                  <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{empresa.participacion}%</span>
                </div>
              </div>
              
              <button className="btn-secondary" onClick={() => handleVerDetalle(empresa)} style={{ padding: '0.75rem 1.5rem' }}>Ver Detalle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

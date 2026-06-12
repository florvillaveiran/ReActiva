import React, { useState } from 'react';
import { Search, MapPin, Users, ChevronLeft, Building, Plus, Phone, Mail, User } from 'lucide-react';

type EstadoPago = 'abonado' | 'pendiente';

const mockEmpresas: { id: number; nombre: string; ubicacion: string; empleados: number; estado: 'Activa'; contactoNombre: string; rrhhEmail: string; rrhhPhone: string; pago: EstadoPago }[] = [
  { id: 1, nombre: 'Empresa Alpha', ubicacion: 'Madrid, España',    empleados: 450, estado: 'Activa', contactoNombre: 'María González',  rrhhEmail: 'rrhh@alpha.com',     rrhhPhone: '+34 600 123 456', pago: 'abonado' },
  { id: 2, nombre: 'Empresa Beta',  ubicacion: 'Bogotá, Colombia',  empleados: 320, estado: 'Activa', contactoNombre: 'Carlos Ramírez',  rrhhEmail: 'contacto@beta.co',   rrhhPhone: '+57 300 987 654', pago: 'abonado' },
  { id: 3, nombre: 'Empresa Gamma', ubicacion: 'CDMX, México',      empleados: 890, estado: 'Activa', contactoNombre: 'Ana Martínez',    rrhhEmail: 'rh@gamma.mx',        rrhhPhone: '+52 55 1234 5678', pago: 'pendiente' },
];

const PAGO_STYLES: Record<EstadoPago, { bg: string; color: string; dot: string; label: string }> = {
  abonado:   { bg: '#ecfdf5', color: '#059669', dot: '#10b981', label: 'Abonado' },
  pendiente: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444', label: 'Pendiente' },
};

export const Empresas: React.FC = () => {
  const [vista, setVista] = useState<'lista' | 'nueva'>('lista');

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
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Nombre de Contacto</label>
            <input type="text" className="input-field" placeholder="Ej: María González" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Celular de Contacto</label>
            <input type="tel" className="input-field" placeholder="+54 9 11 1234 5678" />
          </div>
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label">Email de Contacto</label>
            <input type="email" className="input-field" placeholder="contacto@empresa.com" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setVista('lista')}>Cancelar</button>
            <button className="btn-primary" onClick={() => setVista('lista')}>Guardar Empresa</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Empresas Registradas</h2>
        <button
          className="btn-primary"
          onClick={() => setVista('nueva')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={18} />
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
        {mockEmpresas.map(empresa => {
          const pago = PAGO_STYLES[empresa.pago];
          return (
            <div key={empresa.id} className="card" style={{ padding: '1.5rem' }}>
              {/* Fila superior: logo + nombre + estado */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building size={24} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.2rem' }}>{empresa.nombre}</h3>
                    <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {empresa.ubicacion}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} /> {empresa.empleados} empleados</span>
                    </div>
                  </div>
                </div>

                {/* Badge de pago */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.9rem', borderRadius: '999px',
                  backgroundColor: pago.bg, color: pago.color,
                  fontSize: '0.82rem', fontWeight: 600, flexShrink: 0,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: pago.dot, flexShrink: 0 }} />
                  {pago.label}
                </div>
              </div>

              {/* Separador + info de contacto */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.55rem' }}>Contacto</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 2rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 500 }}>
                    <User size={14} color="var(--primary-color)" />
                    {empresa.contactoNombre}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 500 }}>
                    <Phone size={14} color="var(--primary-color)" />
                    {empresa.rrhhPhone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 500 }}>
                    <Mail size={14} color="var(--primary-color)" />
                    {empresa.rrhhEmail}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

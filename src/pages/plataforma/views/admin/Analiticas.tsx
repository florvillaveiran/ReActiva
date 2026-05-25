import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { Download, Filter } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const mockDataGlobal = {
  zonas: [
    { name: 'Espalda Baja', valor: 45 },
    { name: 'Cuello', valor: 30 },
    { name: 'Hombros', valor: 15 },
    { name: 'Muñecas', valor: 10 },
  ],
  evolucion: [
    { name: 'Sem 1', energia: 3.2, satisfaccion: 75, participacion: 80 },
    { name: 'Sem 2', energia: 3.5, satisfaccion: 82, participacion: 85 },
    { name: 'Sem 3', energia: 3.8, satisfaccion: 88, participacion: 90 },
    { name: 'Sem 4', energia: 4.1, satisfaccion: 92, participacion: 95 },
  ]
};

const mockDataEmpresa = {
  zonas: [
    { name: 'Cuello', valor: 50 },
    { name: 'Espalda Baja', valor: 35 },
    { name: 'Hombros', valor: 15 },
    { name: 'Rodillas', valor: 0 },
  ],
  evolucion: [
    { name: 'Sem 1', energia: 2.8, satisfaccion: 60, participacion: 70 },
    { name: 'Sem 2', energia: 3.0, satisfaccion: 65, participacion: 75 },
    { name: 'Sem 3', energia: 3.4, satisfaccion: 70, participacion: 80 },
    { name: 'Sem 4', energia: 3.6, satisfaccion: 78, participacion: 82 },
  ]
};

export const Analiticas: React.FC = () => {
  const [filtro, setFiltro] = useState('all');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const reporteRef = useRef<HTMLDivElement>(null);

  const data = filtro === 'all' ? mockDataGlobal : mockDataEmpresa;

  const handleDescargarPDF = async () => {
    if (!reporteRef.current) return;
    
    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(reporteRef.current, { scale: 2, useCORS: true, backgroundColor: '#F7F9FB' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Reporte_Reactiva_${filtro === 'all' ? 'General' : 'Empresa'}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Analíticas Detalladas</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <select 
              className="input-field" 
              style={{ paddingLeft: '2.5rem', width: '220px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="all">General (Todas las empresas)</option>
              <option value="empresa1">Empresa Alpha</option>
            </select>
          </div>
          
          <button className="btn-primary" onClick={handleDescargarPDF} disabled={generandoPDF}>
            <Download size={20} />
            {generandoPDF ? 'Generando...' : 'Descargar informe (PDF)'}
          </button>
        </div>
      </div>

      {/* Contenedor referenciado para el PDF */}
      <div ref={reporteRef} style={{ padding: generandoPDF ? '2rem' : '0' }}>
        
        {generandoPDF && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: 700 }}>Método Reactiva</h1>
            <p className="text-muted">Reporte de Bienestar Corporativo - {filtro === 'all' ? 'Vista General' : 'Empresa Alpha'}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--text-color)' }}>Evolución de Energía Promedio</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={13} fill="var(--text-muted)" />
                  <YAxis domain={[1, 5]} axisLine={false} tickLine={false} fontSize={13} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Area type="monotone" dataKey="energia" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--text-color)' }}>Zonas de Dolor Frecuentes</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.zonas} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                  <XAxis type="number" axisLine={false} tickLine={false} fontSize={13} fill="var(--text-muted)" />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={13} fill="var(--text-muted)" width={100} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Bar dataKey="valor" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--text-color)' }}>Participación vs Satisfacción</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.evolucion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={13} fill="var(--text-muted)" />
                  <YAxis axisLine={false} tickLine={false} fontSize={13} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Line type="monotone" dataKey="participacion" name="Participación (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="satisfaccion" name="Satisfacción (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

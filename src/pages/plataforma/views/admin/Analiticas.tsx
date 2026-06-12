import React, { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAdminStats } from '../../hooks/useAdminStats';

// ─── Tipos ─────────────────────────────────────────────────────────────────
type EmpresaKey = 'all' | 'empresa1' | 'empresa2' | 'empresa3';
type PeriodoKey = 'semana' | 'mes' | 'trimestre' | 'anio';

interface AnaliticaSetBase {
  zonas: { name: string; valor: number }[];
  evolucion: { name: string; energia: number; satisfaccion: number; participacion: number }[];
}

interface AnaliticaSet {
  zonas: { name: string; valor: number }[];
  evolucion: { name: string; energia: number; satisfaccion: number; participacion: number; foco: number; dolor: number; impacto: number; energiaPct: number }[];
  kpis: {
    participacion: number;
    dolor: number;
    foco: number;
    impacto: number;
    energia: number;
  };
}

// Deriva foco, dolor, impacto, energiaPct y KPIs a partir de los datos base.
const enrichSet = (base: AnaliticaSetBase): AnaliticaSet => {
  const evolucion = base.evolucion.map(p => {
    const foco = Math.min(100, Math.round(p.satisfaccion * 0.92 + 6));
    const dolor = Math.max(0, Math.round(100 - p.satisfaccion - 5));
    const impacto = Math.min(100, Math.round(p.satisfaccion * 0.95 + 3));
    const energiaPct = Math.round((p.energia / 5) * 100); // 1-5 → %
    return { ...p, foco, dolor, impacto, energiaPct };
  });
  const last = evolucion[evolucion.length - 1];
  return {
    zonas: base.zonas,
    evolucion,
    kpis: {
      participacion: last?.participacion ?? 0,
      dolor: last?.dolor ?? 0,
      foco: last?.foco ?? 0,
      impacto: last?.impacto ?? 0,
      energia: last?.energiaPct ?? 0,
    },
  };
};

// ─── Mocks por empresa y período ───────────────────────────────────────────
// Cada empresa tiene un perfil distinto; cada período tiene una granularidad propia.
// TODO(backend): reemplazar por fetch a /api/admin/analytics?empresa=...&periodo=...
const ANALITICAS_MOCK: Record<EmpresaKey, Record<PeriodoKey, AnaliticaSetBase>> = {
  // ── Vista General (Todas las empresas) ──────────────────────────────────
  all: {
    semana: {
      zonas: [
        { name: 'Espalda Baja', valor: 42 }, { name: 'Cuello', valor: 28 },
        { name: 'Hombros', valor: 18 }, { name: 'Muñecas', valor: 12 },
      ],
      evolucion: [
        { name: 'Lun', energia: 3.4, satisfaccion: 78, participacion: 82 },
        { name: 'Mié', energia: 3.7, satisfaccion: 84, participacion: 88 },
        { name: 'Vie', energia: 4.0, satisfaccion: 90, participacion: 94 },
      ],
    },
    mes: {
      zonas: [
        { name: 'Espalda Baja', valor: 45 }, { name: 'Cuello', valor: 30 },
        { name: 'Hombros', valor: 15 }, { name: 'Muñecas', valor: 10 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 3.2, satisfaccion: 75, participacion: 80 },
        { name: 'Sem 2', energia: 3.5, satisfaccion: 82, participacion: 85 },
        { name: 'Sem 3', energia: 3.8, satisfaccion: 88, participacion: 90 },
        { name: 'Sem 4', energia: 4.1, satisfaccion: 92, participacion: 95 },
      ],
    },
    trimestre: {
      zonas: [
        { name: 'Espalda Baja', valor: 48 }, { name: 'Cuello', valor: 32 },
        { name: 'Hombros', valor: 14 }, { name: 'Muñecas', valor: 6 },
      ],
      evolucion: [
        { name: 'Mes 1', energia: 3.1, satisfaccion: 72, participacion: 78 },
        { name: 'Mes 2', energia: 3.6, satisfaccion: 83, participacion: 86 },
        { name: 'Mes 3', energia: 4.0, satisfaccion: 90, participacion: 93 },
      ],
    },
    anio: {
      zonas: [
        { name: 'Espalda Baja', valor: 50 }, { name: 'Cuello', valor: 28 },
        { name: 'Hombros', valor: 15 }, { name: 'Muñecas', valor: 7 },
      ],
      evolucion: [
        { name: 'T1', energia: 2.9, satisfaccion: 68, participacion: 72 },
        { name: 'T2', energia: 3.4, satisfaccion: 78, participacion: 82 },
        { name: 'T3', energia: 3.8, satisfaccion: 86, participacion: 89 },
        { name: 'T4', energia: 4.2, satisfaccion: 93, participacion: 95 },
      ],
    },
  },
  // ── Empresa Alpha ───────────────────────────────────────────────────────
  empresa1: {
    semana: {
      zonas: [
        { name: 'Cuello', valor: 52 }, { name: 'Espalda Baja', valor: 30 },
        { name: 'Hombros', valor: 15 }, { name: 'Rodillas', valor: 3 },
      ],
      evolucion: [
        { name: 'Lun', energia: 3.5, satisfaccion: 80, participacion: 85 },
        { name: 'Mié', energia: 3.8, satisfaccion: 86, participacion: 90 },
        { name: 'Vie', energia: 4.2, satisfaccion: 92, participacion: 96 },
      ],
    },
    mes: {
      zonas: [
        { name: 'Cuello', valor: 50 }, { name: 'Espalda Baja', valor: 35 },
        { name: 'Hombros', valor: 15 }, { name: 'Rodillas', valor: 0 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 3.4, satisfaccion: 78, participacion: 85 },
        { name: 'Sem 2', energia: 3.7, satisfaccion: 84, participacion: 90 },
        { name: 'Sem 3', energia: 4.0, satisfaccion: 89, participacion: 93 },
        { name: 'Sem 4', energia: 4.3, satisfaccion: 94, participacion: 97 },
      ],
    },
    trimestre: {
      zonas: [
        { name: 'Cuello', valor: 48 }, { name: 'Espalda Baja', valor: 34 },
        { name: 'Hombros', valor: 14 }, { name: 'Rodillas', valor: 4 },
      ],
      evolucion: [
        { name: 'Mes 1', energia: 3.2, satisfaccion: 74, participacion: 82 },
        { name: 'Mes 2', energia: 3.7, satisfaccion: 84, participacion: 89 },
        { name: 'Mes 3', energia: 4.1, satisfaccion: 91, participacion: 95 },
      ],
    },
    anio: {
      zonas: [
        { name: 'Cuello', valor: 46 }, { name: 'Espalda Baja', valor: 36 },
        { name: 'Hombros', valor: 13 }, { name: 'Rodillas', valor: 5 },
      ],
      evolucion: [
        { name: 'T1', energia: 3.0, satisfaccion: 70, participacion: 78 },
        { name: 'T2', energia: 3.5, satisfaccion: 80, participacion: 86 },
        { name: 'T3', energia: 3.9, satisfaccion: 88, participacion: 92 },
        { name: 'T4', energia: 4.3, satisfaccion: 94, participacion: 97 },
      ],
    },
  },
  // ── Empresa Beta ────────────────────────────────────────────────────────
  empresa2: {
    semana: {
      zonas: [
        { name: 'Espalda Baja', valor: 48 }, { name: 'Hombros', valor: 28 },
        { name: 'Cuello', valor: 18 }, { name: 'Piernas', valor: 6 },
      ],
      evolucion: [
        { name: 'Lun', energia: 3.0, satisfaccion: 70, participacion: 75 },
        { name: 'Mié', energia: 3.4, satisfaccion: 76, participacion: 80 },
        { name: 'Vie', energia: 3.8, satisfaccion: 84, participacion: 87 },
      ],
    },
    mes: {
      zonas: [
        { name: 'Espalda Baja', valor: 50 }, { name: 'Hombros', valor: 25 },
        { name: 'Cuello', valor: 20 }, { name: 'Piernas', valor: 5 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 2.9, satisfaccion: 68, participacion: 72 },
        { name: 'Sem 2', energia: 3.2, satisfaccion: 74, participacion: 78 },
        { name: 'Sem 3', energia: 3.5, satisfaccion: 80, participacion: 84 },
        { name: 'Sem 4', energia: 3.9, satisfaccion: 86, participacion: 89 },
      ],
    },
    trimestre: {
      zonas: [
        { name: 'Espalda Baja', valor: 52 }, { name: 'Hombros', valor: 24 },
        { name: 'Cuello', valor: 18 }, { name: 'Piernas', valor: 6 },
      ],
      evolucion: [
        { name: 'Mes 1', energia: 2.8, satisfaccion: 65, participacion: 70 },
        { name: 'Mes 2', energia: 3.3, satisfaccion: 76, participacion: 80 },
        { name: 'Mes 3', energia: 3.7, satisfaccion: 85, participacion: 88 },
      ],
    },
    anio: {
      zonas: [
        { name: 'Espalda Baja', valor: 54 }, { name: 'Hombros', valor: 22 },
        { name: 'Cuello', valor: 18 }, { name: 'Piernas', valor: 6 },
      ],
      evolucion: [
        { name: 'T1', energia: 2.6, satisfaccion: 60, participacion: 66 },
        { name: 'T2', energia: 3.0, satisfaccion: 70, participacion: 75 },
        { name: 'T3', energia: 3.4, satisfaccion: 80, participacion: 83 },
        { name: 'T4', energia: 3.8, satisfaccion: 87, participacion: 90 },
      ],
    },
  },
  // ── Empresa Gamma ───────────────────────────────────────────────────────
  empresa3: {
    semana: {
      zonas: [
        { name: 'Espalda Alta', valor: 38 }, { name: 'Cuello', valor: 32 },
        { name: 'Muñecas', valor: 22 }, { name: 'Hombros', valor: 8 },
      ],
      evolucion: [
        { name: 'Lun', energia: 2.7, satisfaccion: 62, participacion: 68 },
        { name: 'Mié', energia: 3.1, satisfaccion: 70, participacion: 74 },
        { name: 'Vie', energia: 3.4, satisfaccion: 76, participacion: 80 },
      ],
    },
    mes: {
      zonas: [
        { name: 'Espalda Alta', valor: 40 }, { name: 'Cuello', valor: 30 },
        { name: 'Muñecas', valor: 20 }, { name: 'Hombros', valor: 10 },
      ],
      evolucion: [
        { name: 'Sem 1', energia: 2.6, satisfaccion: 60, participacion: 65 },
        { name: 'Sem 2', energia: 2.9, satisfaccion: 66, participacion: 70 },
        { name: 'Sem 3', energia: 3.2, satisfaccion: 72, participacion: 76 },
        { name: 'Sem 4', energia: 3.5, satisfaccion: 78, participacion: 82 },
      ],
    },
    trimestre: {
      zonas: [
        { name: 'Espalda Alta', valor: 42 }, { name: 'Cuello', valor: 28 },
        { name: 'Muñecas', valor: 20 }, { name: 'Hombros', valor: 10 },
      ],
      evolucion: [
        { name: 'Mes 1', energia: 2.5, satisfaccion: 58, participacion: 62 },
        { name: 'Mes 2', energia: 2.9, satisfaccion: 68, participacion: 72 },
        { name: 'Mes 3', energia: 3.3, satisfaccion: 76, participacion: 80 },
      ],
    },
    anio: {
      zonas: [
        { name: 'Espalda Alta', valor: 44 }, { name: 'Cuello', valor: 28 },
        { name: 'Muñecas', valor: 18 }, { name: 'Hombros', valor: 10 },
      ],
      evolucion: [
        { name: 'T1', energia: 2.3, satisfaccion: 55, participacion: 60 },
        { name: 'T2', energia: 2.7, satisfaccion: 64, participacion: 68 },
        { name: 'T3', energia: 3.1, satisfaccion: 73, participacion: 76 },
        { name: 'T4', energia: 3.5, satisfaccion: 80, participacion: 84 },
      ],
    },
  },
};

const PERIODO_LABELS: Record<PeriodoKey, string> = {
  semana: 'Esta semana',
  mes: 'Este mes',
  trimestre: 'Último trimestre',
  anio: 'Último año',
};

const EMPRESA_LABELS: Record<EmpresaKey, string> = {
  all: 'Todas',
  empresa1: 'Empresa Alpha',
  empresa2: 'Empresa Beta',
  empresa3: 'Empresa Gamma',
};

export const Analiticas: React.FC = () => {
  const [filtro, setFiltro] = useState<EmpresaKey>('all');
  const [periodo, setPeriodo] = useState<PeriodoKey>('mes');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const reporteRef = useRef<HTMLDivElement>(null);

  // Stats reales del usuario demo (en vivo desde localStorage).
  // TODO(backend): reemplazar por fetch a /api/admin/analiticas?empresa=...&periodo=... y borrar mocks.
  const stats = useAdminStats();

  // Resolución de data: si "all" + periodo "mes" + hay datos reales del usuario → usar reales.
  // Cualquier otro caso → mock correspondiente a (empresa, periodo). enrichSet agrega foco, dolor, impacto y kpis.
  const data = useMemo<AnaliticaSet>(() => {
    const mock = enrichSet(ANALITICAS_MOCK[filtro][periodo]);
    if (filtro === 'all' && periodo === 'mes' && stats.hayDatos) {
      const evolucionReal = stats.evolucion.map((p, i) => ({
        ...p,
        foco: mock.evolucion[i]?.foco ?? 0,
        dolor: mock.evolucion[i]?.dolor ?? 0,
        impacto: mock.evolucion[i]?.impacto ?? 0,
        energiaPct: Math.round((p.energia / 5) * 100),
      }));
      return {
        zonas: stats.zonasDolorChart.length > 0 ? stats.zonasDolorChart : mock.zonas,
        evolucion: evolucionReal,
        kpis: {
          participacion: stats.adherencia,
          dolor: mock.kpis.dolor,
          foco: mock.kpis.foco,
          impacto: stats.impactoPercibido ?? mock.kpis.impacto,
          energia: stats.energiaPromedio != null ? Math.round((stats.energiaPromedio / 5) * 100) : mock.kpis.energia,
        },
      };
    }
    return mock;
  }, [filtro, periodo, stats]);

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
      const empresaSlug = EMPRESA_LABELS[filtro].replace(/[^a-zA-Z0-9]+/g, '_');
      pdf.save(`Reporte_Reactiva_${empresaSlug}_${periodo}.pdf`);
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
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', width: '160px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as EmpresaKey)}
            >
              {(Object.keys(EMPRESA_LABELS) as EmpresaKey[]).map(k => (
                <option key={k} value={k}>{EMPRESA_LABELS[k]}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', width: '160px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as PeriodoKey)}
            >
              {(Object.keys(PERIODO_LABELS) as PeriodoKey[]).map(k => (
                <option key={k} value={k}>{PERIODO_LABELS[k]}</option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={handleDescargarPDF}
            disabled={generandoPDF}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Download size={16} />
            {generandoPDF ? 'Generando...' : 'Descargar informe'}
          </button>
        </div>
      </div>

      {/* Contenedor referenciado para el PDF */}
      <div ref={reporteRef} style={{ padding: generandoPDF ? '2rem' : '0' }}>
        
        {generandoPDF && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: 700 }}>Método Reactiva</h1>
            <p className="text-muted">Reporte de Bienestar Corporativo · {EMPRESA_LABELS[filtro]} · {PERIODO_LABELS[periodo]}</p>
          </div>
        )}

        {/* ─── KPIs (5 mini cards) ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Participación', value: data.kpis.participacion, color: 'var(--primary-color)', bg: '#f0fdfa' },
            { label: 'Foco',          value: data.kpis.foco,          color: '#3b82f6',              bg: '#eff6ff' },
            { label: 'Impacto Pausa', value: data.kpis.impacto,       color: '#9333ea',              bg: '#faf5ff' },
            { label: 'Dolor',         value: data.kpis.dolor,         color: '#f43f5e',              bg: '#fff1f2' },
            { label: 'Energía',       value: data.kpis.energia,       color: '#f59e0b',              bg: '#fffbeb' },
          ].map(kpi => (
            <div key={kpi.label} className="card" style={{ padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: kpi.color, lineHeight: 1, marginBottom: '0.5rem' }}>{kpi.value}%</p>
              <div style={{ width: '100%', height: '4px', backgroundColor: kpi.bg, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${kpi.value}%`, height: '100%', backgroundColor: kpi.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* ─── Gráficos: 3 arriba + 2 abajo ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {/* Participación */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Participación</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Bar dataKey="participacion" name="Participación (%)" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dolor */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Dolor</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDolor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="dolor" name="Dolor (%)" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDolor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Foco */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Foco</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFoco" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="foco" name="Foco (%)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFoco)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {/* Impacto Pausa */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Impacto Pausa</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpacto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="impacto" name="Impacto (%)" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#colorImpacto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Energía */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-color)' }}>Energía</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={11} fill="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="energiaPct" name="Energía (%)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEnergia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

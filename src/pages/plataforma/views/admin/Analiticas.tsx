import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Filter, Calendar } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';
import { ReportGenerator } from '../../components/ReportGenerator';

// ─── Tipos ─────────────────────────────────────────────────────────────────
type EmpresaKey = 'all' | 'empresa1' | 'empresa2' | 'empresa3';
type PeriodoKey = 'semanal' | 'mensual' | 'anual' | 'personalizado';

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

// ─── Mocks por empresa y período ───────────────────────
const ANALITICAS_MOCK: Record<EmpresaKey, Record<PeriodoKey, AnaliticaSetBase>> = {
  // ── Vista General (Todas las empresas) ──────────────────────────────────
  all: {
    semanal: {
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
    mensual: {
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
    anual: {
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
    personalizado: {
      zonas: [
        { name: 'Espalda Baja', valor: 45 }, { name: 'Cuello', valor: 30 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 3.2, satisfaccion: 75, participacion: 80 },
        { name: 'Fin', energia: 4.1, satisfaccion: 92, participacion: 95 },
      ],
    },
  },
  // ── Empresa Alpha ───────────────────────────────────────────────────────
  empresa1: {
    semanal: {
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
    mensual: {
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
    anual: {
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
    personalizado: {
      zonas: [
        { name: 'Cuello', valor: 50 }, { name: 'Espalda Baja', valor: 35 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 3.4, satisfaccion: 78, participacion: 85 },
        { name: 'Fin', energia: 4.3, satisfaccion: 94, participacion: 97 },
      ],
    },
  },
  // ── Empresa Beta ────────────────────────────────────────────────────────
  empresa2: {
    semanal: {
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
    mensual: {
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
    anual: {
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
    personalizado: {
      zonas: [
        { name: 'Espalda Baja', valor: 50 }, { name: 'Hombros', valor: 25 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 2.9, satisfaccion: 68, participacion: 72 },
        { name: 'Fin', energia: 3.9, satisfaccion: 86, participacion: 89 },
      ],
    },
  },
  // ── Empresa Gamma ───────────────────────────────────────────────────────
  empresa3: {
    semanal: {
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
    mensual: {
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
    anual: {
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
    personalizado: {
      zonas: [
        { name: 'Espalda Alta', valor: 40 }, { name: 'Cuello', valor: 30 },
      ],
      evolucion: [
        { name: 'Inicio', energia: 2.6, satisfaccion: 60, participacion: 65 },
        { name: 'Fin', energia: 3.5, satisfaccion: 78, participacion: 82 },
      ],
    },
  },
};

const PERIODO_LABELS: Record<PeriodoKey, string> = {
  semanal: 'Semanal',
  mensual: 'Mensual',
  anual: 'Anual',
  personalizado: 'Personalizado',
};
const EMPRESA_LABELS: Record<EmpresaKey, string> = {
  all: 'Todas',
  empresa1: 'Empresa Alpha',
  empresa2: 'Empresa Beta',
  empresa3: 'Empresa Gamma',
};

export const Analiticas: React.FC = () => {
  const [filtro, setFiltro] = useState<EmpresaKey>('all');
  const [periodo, setPeriodo] = useState<PeriodoKey>('mensual');
  
  // Selectores secundarios condicionales
  const [semanaSel, setSemanaSel] = useState('Semana del 7 al 13 de julio');
  const [mesSel, setMesSel] = useState('Julio 2026');
  const [anioSel, setAnioSel] = useState('2026');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  // Comparativas
  const [comparar, setComparar] = useState(false);

  // Stats reales del usuario demo (en vivo desde localStorage).
  // TODO(backend): reemplazar por fetch a /api/admin/analiticas?empresa=...&periodo=... y borrar mocks.
  const stats = useAdminStats();

  // Resolución de data: si "all" + periodo "mes" + hay datos reales del usuario → usar reales.
  // Cualquier otro caso → mock correspondiente a (empresa, periodo). enrichSet agrega foco, dolor, impacto y kpis.
  const data = useMemo<AnaliticaSet>(() => {
    const mock = enrichSet(ANALITICAS_MOCK[filtro][periodo]);
    if (filtro === 'all' && periodo === 'mensual' && stats.hayDatos) {
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
          impacto: mock.kpis.impacto,
          energia: stats.energiaPromedio != null ? Math.round((stats.energiaPromedio / 5) * 100) : mock.kpis.energia,
        },
      };
    }
    return mock;
  }, [filtro, periodo, stats]);

  const reportPeriodoLabel = periodo === 'semanal'
    ? semanaSel
    : periodo === 'mensual'
      ? mesSel
      : periodo === 'anual'
        ? anioSel
        : fechaDesde && fechaHasta
          ? `${fechaDesde} a ${fechaHasta}`
          : PERIODO_LABELS[periodo];

  const reportRange = useMemo(() => {
    if (periodo === 'personalizado') return { from: fechaDesde, to: fechaHasta };
    if (periodo === 'anual') return { from: `${anioSel}-01-01`, to: `${anioSel}-12-31` };
    if (periodo === 'mensual') {
      const months: Record<string, string> = {
        Enero: '01', Febrero: '02', Marzo: '03', Abril: '04', Mayo: '05', Junio: '06',
        Julio: '07', Agosto: '08', Septiembre: '09', Octubre: '10', Noviembre: '11', Diciembre: '12',
      };
      const [monthName, year] = mesSel.split(' ');
      const month = months[monthName];
      if (!month || !year) return { from: '', to: '' };
      const lastDay = new Date(Number(year), Number(month), 0).getDate();
      return { from: `${year}-${month}-01`, to: `${year}-${month}-${String(lastDay).padStart(2, '0')}` };
    }
    const weeklyRanges: Record<string, { from: string; to: string }> = {
      'Semana del 7 al 13 de julio': { from: '2026-07-07', to: '2026-07-13' },
      'Semana del 30 al 6 de julio': { from: '2026-06-30', to: '2026-07-06' },
      'Semana del 23 al 29 de junio': { from: '2026-06-23', to: '2026-06-29' },
    };
    return weeklyRanges[semanaSel] ?? { from: '', to: '' };
  }, [anioSel, fechaDesde, fechaHasta, mesSel, periodo, semanaSel]);

  const zonasSorted = [...data.zonas].sort((a, b) => b.valor - a.valor);
  const predominant = zonasSorted.length > 0 && zonasSorted[0].valor > 0 ? zonasSorted[0].name : null;
  const totalZonas = zonasSorted.reduce((sum, z) => sum + z.valor, 0);

  const insights = useMemo(() => {
    const msgs = [];
    if (data.kpis.participacion > 80) msgs.push({ icon: '📈', text: 'Participación general en niveles excelentes.' });
    else if (data.kpis.participacion > 0 && data.kpis.participacion < 50) msgs.push({ icon: '⚠️', text: 'Participación por debajo del objetivo esperado.' });
    else if (data.kpis.participacion > 0) msgs.push({ icon: '📈', text: 'Participación estable durante todo el mes.' });
    
    if (data.kpis.energia > 70) msgs.push({ icon: '💪', text: 'La energía promedio continúa mejorando.' });
    else if (data.kpis.energia > 0 && data.kpis.energia < 40) msgs.push({ icon: '🔋', text: 'Niveles bajos de energía sostenida en el equipo.' });
    
    if (predominant) msgs.push({ icon: '⚠️', text: `La principal zona de dolor reportada fue ${predominant.toLowerCase()}.` });
    
    if (data.kpis.impacto > 80) msgs.push({ icon: '👏', text: 'El impacto percibido de las pausas continúa en aumento.' });
    
    if (data.kpis.foco > 75) msgs.push({ icon: '🎯', text: 'El foco alcanzó valores altos de forma sostenida.' });
    else if (data.kpis.foco > 0 && data.kpis.foco < 50) msgs.push({ icon: '⚠️', text: 'Dificultades recurrentes para sostener la concentración.' });

    if (msgs.length === 0) msgs.push({ icon: '✅', text: 'Todos los indicadores dentro de los parámetros esperados.' });
    
    return msgs.slice(0, 4);
  }, [data.kpis, predominant]);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'nowrap', gap: '1rem', overflowX: 'auto', paddingBottom: '5px' }}>
        <h2 className="header-title" style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '1.5rem', flexShrink: 0 }}>Analíticas</h2>
        
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
          {/* Empresa */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Filter size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '1.8rem', paddingRight: '0.5rem', width: 'auto', minWidth: '120px', backgroundColor: 'var(--bg-color)', fontWeight: 500, fontSize: '0.85rem' }}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as EmpresaKey)}
            >
              {(Object.keys(EMPRESA_LABELS) as EmpresaKey[]).map(k => (
                <option key={k} value={k}>{EMPRESA_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Período (Principal) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Calendar size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '1.8rem', paddingRight: '0.5rem', width: 'auto', minWidth: '110px', backgroundColor: 'var(--bg-color)', fontWeight: 500, fontSize: '0.85rem' }}
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value as PeriodoKey);
                setComparar(false);
              }}
            >
              {(Object.keys(PERIODO_LABELS) as PeriodoKey[]).map(k => (
                <option key={k} value={k}>{PERIODO_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Selectores Secundarios */}
          {periodo === 'semanal' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <select
                className="input-field"
                style={{ paddingLeft: '0.75rem', paddingRight: '0.5rem', width: 'auto', minWidth: '180px', backgroundColor: 'var(--bg-color)', fontSize: '0.85rem' }}
                value={semanaSel}
                onChange={(e) => setSemanaSel(e.target.value)}
              >
                <option value="Semana del 7 al 13 de julio">Semana del 7 al 13 de julio</option>
                <option value="Semana del 30 al 6 de julio">Semana del 30 al 6 de julio</option>
                <option value="Semana del 23 al 29 de junio">Semana del 23 al 29 de junio</option>
              </select>
            </div>
          )}

          {periodo === 'mensual' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <select
                className="input-field"
                style={{ paddingLeft: '0.75rem', paddingRight: '0.5rem', width: 'auto', minWidth: '100px', backgroundColor: 'var(--bg-color)', fontSize: '0.85rem' }}
                value={mesSel}
                onChange={(e) => setMesSel(e.target.value)}
              >
                <option value="Julio 2026">Julio 2026</option>
                <option value="Junio 2026">Junio 2026</option>
                <option value="Mayo 2026">Mayo 2026</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-color)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={comparar} onChange={(e) => setComparar(e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                Comparar con mes anterior
              </label>
            </div>
          )}

          {periodo === 'anual' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <select
                className="input-field"
                style={{ paddingLeft: '0.75rem', paddingRight: '0.5rem', width: 'auto', minWidth: '80px', backgroundColor: 'var(--bg-color)', fontSize: '0.85rem' }}
                value={anioSel}
                onChange={(e) => setAnioSel(e.target.value)}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-color)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={comparar} onChange={(e) => setComparar(e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                Comparar con año anterior
              </label>
            </div>
          )}

          {periodo === 'personalizado' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <input type="date" className="input-field" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ width: '120px', padding: '0.4rem', fontSize: '0.85rem' }} />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input type="date" className="input-field" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ width: '120px', padding: '0.4rem', fontSize: '0.85rem' }} />
            </div>
          )}
          
          <div style={{ width: '0.5rem' }} />

          <ReportGenerator
            currentData={data}
            currentEmpresaLabel={EMPRESA_LABELS[filtro]}
            periodoLabel={reportPeriodoLabel}
            periodFrom={reportRange.from}
            periodTo={reportRange.to}
          />
        </div>
      </div>

      <div>

        {/* ─── KPIs (5 mini cards) ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
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

          {/* Zonas de Dolor */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-color)' }}>Zonas de dolor reportadas</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              {predominant ? `Predomina dolor ${predominant.toLowerCase()}.` : totalZonas === 0 ? 'Sin reportes de dolor.' : 'Sin una zona predominante.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
              {zonasSorted.filter(z => z.valor > 0).map(z => {
                 const pct = Math.round((z.valor / totalZonas) * 100) || 0;
                 return (
                   <div key={z.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                     <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-color)' }}>{z.name}</span>
                     <div style={{ width: '100%', height: '8px', backgroundColor: '#fff1f2', borderRadius: '4px', overflow: 'hidden' }}>
                       <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#f43f5e', borderRadius: '4px' }} />
                     </div>
                   </div>
                 )
              })}
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

        {/* ─── Insights Automáticos ────────────────────────────────────────── */}
        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-color)' }}>Insights del período</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {insights.map((insight, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem', color: 'var(--text-color)' }}>
                <span style={{ fontSize: '1.1rem' }}>{insight.icon}</span>
                {insight.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAdminStats } from '../../hooks/useAdminStats';

// ─── Tipos ─────────────────────────────────────────────────────────────────
export type EmpresaKey = 'all' | 'empresa1' | 'empresa2' | 'empresa3';
export type PeriodoKey = 'semanal' | 'mensual' | 'anual' | 'personalizado';

export interface AnaliticaSetBase {
  zonas: { name: string; valor: number }[];
  evolucion: { name: string; energia: number; satisfaccion: number; participacion: number }[];
}

export interface AnaliticaSet {
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
export const enrichSet = (base: AnaliticaSetBase): AnaliticaSet => {
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
export const ANALITICAS_MOCK: Record<EmpresaKey, Record<PeriodoKey, AnaliticaSetBase>> = {
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

export const PERIODO_LABELS: Record<PeriodoKey, string> = {
  semanal: 'Semanal',
  mensual: 'Mensual',
  anual: 'Anual',
  personalizado: 'Personalizado',
};
export const EMPRESA_LABELS: Record<EmpresaKey, string> = {
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

  const [generandoPDF, setGenerandoPDF] = useState(false);
  const chartPartRef = useRef<HTMLDivElement>(null);
  const chartDolorRef = useRef<HTMLDivElement>(null);
  const chartFocoRef = useRef<HTMLDivElement>(null);

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
          impacto: stats.impactoPercibido ?? mock.kpis.impacto,
          energia: stats.energiaPromedio != null ? Math.round((stats.energiaPromedio / 5) * 100) : mock.kpis.energia,
        },
      };
    }
    return mock;
  }, [filtro, periodo, stats]);

  const handleDescargarPDF = async () => {
    if (!chartPartRef.current || !chartDolorRef.current || !chartFocoRef.current) return;
    setGenerandoPDF(true);

    // Datos del período anterior para comparativas
    const periodoAnteriorMap: Record<PeriodoKey, PeriodoKey> = {
      semanal: 'mensual', mensual: 'semanal', anual: 'mensual', personalizado: 'mensual'
    };
    const dataAnterior = enrichSet(ANALITICAS_MOCK[filtro][periodoAnteriorMap[periodo]]);
    const diffPart = data.kpis.participacion - dataAnterior.kpis.participacion;
    const diffDolor = data.kpis.dolor - dataAnterior.kpis.dolor;
    const diffFoco = data.kpis.foco - dataAnterior.kpis.foco;
    const diffEnergia = data.kpis.energia - dataAnterior.kpis.energia;
    const signo = (n: number) => n >= 0 ? `+${n}%` : `${n}%`;
    const periodoLabel = periodo === 'semanal' ? semanaSel : periodo === 'mensual' ? mesSel : periodo === 'anual' ? anioSel : `${fechaDesde} – ${fechaHasta}`;
    const empresaLabel = EMPRESA_LABELS[filtro];

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();

      // Helper de texto centrado
      const cx = (txt: string, size: number) => { pdf.setFontSize(size); return (W - pdf.getTextWidth(txt)) / 2; };
      // Helper para texto con salto de línea automático
      const wrapText = (txt: string, x: number, y: number, maxW: number, lineH: number) => {
        const lines = pdf.splitTextToSize(txt, maxW) as string[];
        pdf.text(lines, x, y);
        return y + lines.length * lineH;
      };

      // ═════════════════════════════════════════
      // PÁGINA 1: PORTADA Y RESUMEN EJECUTIVO
      // ═════════════════════════════════════════

      // Banda de color superior
      pdf.setFillColor(20, 184, 166); // teal-500
      pdf.rect(0, 0, W, 60, 'F');

      // Acento decorativo
      pdf.setFillColor(13, 148, 136); // teal-600
      pdf.rect(0, 52, W, 8, 'F');

      // Título en la banda
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Método ReActiva', cx('Método ReActiva', 28), 28);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Informe Ejecutivo de Bienestar Corporativo', cx('Informe Ejecutivo de Bienestar Corporativo', 13), 40);

      // Metadatos
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Empresa: ${empresaLabel}`, 20, 78);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Período analizado: ${periodoLabel}  |  Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 85);

      // Línea separadora
      pdf.setDrawColor(226, 232, 240);
      pdf.line(20, 91, W - 20, 91);

      // Sección: ¿Qué ocurrió?
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(20, 184, 166);
      pdf.text('01 / ¿Qué ocurrió?', 20, 103);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      const resumenText = `Durante el período "${periodoLabel}", ${empresaLabel} registró una participación promedio del ${data.kpis.participacion}% (${signo(diffPart)} vs. período anterior). La energía percibida por los colaboradores alcanzó ${data.kpis.energia}% (${signo(diffEnergia)}), mientras que el foco y la concentración se situaron en ${data.kpis.foco}% (${signo(diffFoco)}). Los niveles de dolor musculoesquelético autoreportado marcaron ${data.kpis.dolor}% (${signo(diffDolor)}).`;
      let y = wrapText(resumenText, 20, 112, W - 40, 5.5);

      // KPIs con comparativa
      y += 8;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('INDICADORES CLAVE DEL PERÍODO', 20, y);
      y += 6;

      const kpisData = [
        { l: 'Participación', v: data.kpis.participacion, d: diffPart, color: [20, 184, 166] },
        { l: 'Foco', v: data.kpis.foco, d: diffFoco, color: [59, 130, 246] },
        { l: 'Impacto Pausa', v: data.kpis.impacto, d: 0, color: [147, 51, 234] },
        { l: 'Dolor', v: data.kpis.dolor, d: diffDolor, color: [244, 63, 94] },
        { l: 'Energía', v: data.kpis.energia, d: diffEnergia, color: [245, 158, 11] },
      ] as const;

      const colW = (W - 40) / kpisData.length;
      kpisData.forEach((k, i) => {
        const x = 20 + i * colW;
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(x, y, colW - 2, 22, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(k.color[0], k.color[1], k.color[2]);
        pdf.text(`${k.v}%`, x + 4, y + 9);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text(k.l.toUpperCase(), x + 4, y + 15);
        if (k.d !== 0) {
          const color = k.l === 'Dolor' ? (k.d < 0 ? [16, 185, 129] : [244, 63, 94]) : (k.d >= 0 ? [16, 185, 129] : [244, 63, 94]);
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.text(signo(k.d) + ' vs anterior', x + 4, y + 20);
        }
      });
      y += 30;

      // ═════════════════════════════════════════
      // PÁGINA 2: ANÁLISIS GRÁFICO
      // ═════════════════════════════════════════
      pdf.addPage();

      // Mini encabezado de página
      pdf.setFillColor(20, 184, 166);
      pdf.rect(0, 0, W, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MÉTODO REACTIVA  |  ANÁLISIS GRÁFICO', 20, 8);
      pdf.text(empresaLabel.toUpperCase(), W - 20 - pdf.getTextWidth(empresaLabel.toUpperCase()), 8);

      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('02 / Análisis Visual de Indicadores', 20, 28);

      // Gráfico Participación
      const canvasPart = await html2canvas(chartPartRef.current, { scale: 2, backgroundColor: '#ffffff' });
      pdf.addImage(canvasPart.toDataURL('image/png'), 'PNG', 20, 36, W - 40, 55);

      // Gráfico Dolor
      const canvasDolor = await html2canvas(chartDolorRef.current, { scale: 2, backgroundColor: '#ffffff' });
      pdf.addImage(canvasDolor.toDataURL('image/png'), 'PNG', 20, 98, (W - 44) / 2, 55);

      // Gráfico Foco
      const canvasFoco = await html2canvas(chartFocoRef.current, { scale: 2, backgroundColor: '#ffffff' });
      pdf.addImage(canvasFoco.toDataURL('image/png'), 'PNG', 22 + (W - 44) / 2, 98, (W - 44) / 2, 55);

      // ═════════════════════════════════════════
      // PÁGINA 3: ¿QUÉ SIGNIFICA + IMPACTO ORG.
      // ═════════════════════════════════════════
      pdf.addPage();
      pdf.setFillColor(20, 184, 166);
      pdf.rect(0, 0, W, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MÉTODO REACTIVA  |  INTERPRETACIÓN', 20, 8);
      pdf.text(empresaLabel.toUpperCase(), W - 20 - pdf.getTextWidth(empresaLabel.toUpperCase()), 8);

      let yp3 = 26;
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('03 / ¿Qué significa para la empresa?', 20, yp3); yp3 += 10;

      const interp = [
        { titulo: 'Adherencia y Hábito', texto: diffPart >= 0
          ? `La participación subió ${signo(diffPart)}, evidenciando que los colaboradores están incorporando las pausas activas como parte de su rutina. Este resultado es altamente positivo y reduce el riesgo de fatiga acumulada.`
          : `La participación bajó ${signo(diffPart)}, lo que puede indicar pérdida de motivación o sobrecarga operativa. Requiere atención en el próximo ciclo.` },
        { titulo: 'Bienestar Musculoesquelético', texto: diffDolor <= 0
          ? `El dolor autoreportado disminuyó ${signo(-diffDolor)}, confirmando que las pausas orientadas a movilidad articular están generando mejoras físicas tangibles en los equipos.`
          : `El dolor musculoesquelético aumentó ${signo(diffDolor)}. Puede deberse a meses de alta intensidad postural. Se sugiere reforzar el contenido de elongación y pausas focalizadas en zona lumbar y cervical.` },
        { titulo: 'Concentración y Productividad', texto: `El índice de foco del ${data.kpis.foco}% (${signo(diffFoco)}) tiene correlación directa con la capacidad de atención sostenida de los equipos. Un foco elevado reduce errores operacionales y mejora los tiempos de respuesta.` },
      ];

      interp.forEach(({ titulo, texto }) => {
        pdf.setFillColor(240, 253, 250);
        pdf.roundedRect(20, yp3, W - 40, 30, 2, 2, 'F');
        pdf.setDrawColor(20, 184, 166);
        pdf.line(20, yp3, 20, yp3 + 30);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(13, 148, 136);
        pdf.text(titulo, 25, yp3 + 7);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(51, 65, 85);
        const lines = pdf.splitTextToSize(texto, W - 50) as string[];
        pdf.text(lines, 25, yp3 + 14);
        yp3 += 36;
      });

      // Impacto Organizacional
      yp3 += 4;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Impacto Organizacional', 20, yp3); yp3 += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);

      const riesgoDolor = data.kpis.dolor > 50 ? 'ALTO' : data.kpis.dolor > 30 ? 'MODERADO' : 'BAJO';
      const impactoText = `Con una participación del ${data.kpis.participacion}% y un nivel de dolor ${riesgoDolor.toLowerCase()}, el programa ReActiva está ${data.kpis.participacion >= 75 ? 'generando un impacto positivo y sostenido' : 'construyendo una base de bienestar que requiere refuerzo'} en la organización. Colaboradores con menor dolor musculoesquelético presentan hasta un 23% más de productividad percibida, lo que se traduce en reducción de ausentismo y mayor retención de talento.`;
      yp3 = wrapText(impactoText, 20, yp3, W - 40, 5);

      // ═════════════════════════════════════════
      // PÁGINA 4: ¿QUÉ RECOMENDAMOS?
      // ═════════════════════════════════════════
      pdf.addPage();
      pdf.setFillColor(20, 184, 166);
      pdf.rect(0, 0, W, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MÉTODO REACTIVA  |  PLAN DE ACCIÓN', 20, 8);
      pdf.text(empresaLabel.toUpperCase(), W - 20 - pdf.getTextWidth(empresaLabel.toUpperCase()), 8);

      let yp4 = 26;
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('04 / ¿Qué recomendamos hacer a continuación?', 20, yp4); yp4 += 10;

      const recomendaciones = [
        data.kpis.participacion < 70
          ? 'Activar la campaña de Reenganche Automático en el módulo de Emails para los usuarios con más de 5 días de inactividad.'
          : 'Mantener la frecuencia actual de publicación de videos y reforzar la racha de participación con el Email de Reconocimiento.',
        data.kpis.dolor > 40
          ? 'Priorizar contenido de movilidad articular y elongación de zona lumbar, cervical y hombros en la programación del próximo período.'
          : 'El nivel de dolor es saludable. Incorporar progresivamente contenido de fortalecimiento funcional para prevenir regresiones.',
        data.kpis.foco < 75
          ? 'Programar las pausas activas en el horario de mayor demanda cognitiva de cada empresa (típicamente entre 10:00 y 12:00 hrs).'
          : 'La concentración está en niveles óptimos. Considerar compartir este resultado con RRHH como evidencia del ROI del programa.',
        `Programar el próximo informe ejecutivo en ${periodoLabel === 'Julio 2026' ? 'Agosto 2026' : 'el próximo período'} para verificar la evolución de los indicadores clave.`,
      ];

      recomendaciones.forEach((r, i) => {
        pdf.setFillColor(i % 2 === 0 ? 248 : 240, i % 2 === 0 ? 250 : 253, i % 2 === 0 ? 252 : 250);
        pdf.roundedRect(20, yp4, W - 40, 22, 2, 2, 'F');
        pdf.setFillColor(20, 184, 166);
        pdf.circle(25, yp4 + 8, 3, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${i + 1}`, 24.1, yp4 + 10);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(51, 65, 85);
        const rlines = pdf.splitTextToSize(r, W - 55) as string[];
        pdf.text(rlines, 32, yp4 + 7);
        yp4 += 27;
      });

      // Firma institucional
      yp4 += 10;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(20, yp4, W - 20, yp4); yp4 += 8;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(20, 184, 166);
      pdf.text('metodoreactiva.com', 20, yp4);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184);
      pdf.text('Informe generado automáticamente por la plataforma ReActiva. Datos basados en registros de colaboradores activos.', W - 20 - pdf.getTextWidth('Informe generado automáticamente por la plataforma ReActiva. Datos basados en registros de colaboradores activos.'), yp4);

      // Guardar
      const slug = empresaLabel.replace(/[^a-zA-Z0-9]+/g, '_');
      pdf.save(`ReActiva_Informe_${slug}_${periodo}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="header-title" style={{ marginBottom: 0 }}>Analíticas Detalladas</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Empresa */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', width: '150px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as EmpresaKey)}
            >
              {(Object.keys(EMPRESA_LABELS) as EmpresaKey[]).map(k => (
                <option key={k} value={k}>{EMPRESA_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Período (Principal) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="input-field"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', width: '150px', backgroundColor: 'var(--bg-color)', fontWeight: 500 }}
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value as PeriodoKey);
                setComparar(false); // Resetear comparativa al cambiar período
              }}
            >
              {(Object.keys(PERIODO_LABELS) as PeriodoKey[]).map(k => (
                <option key={k} value={k}>{PERIODO_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Selectores Secundarios */}
          {periodo === 'semanal' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                className="input-field"
                style={{ paddingLeft: '1rem', paddingRight: '0.75rem', width: '220px', backgroundColor: 'var(--bg-color)' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select
                className="input-field"
                style={{ paddingLeft: '1rem', paddingRight: '0.75rem', width: '150px', backgroundColor: 'var(--bg-color)' }}
                value={mesSel}
                onChange={(e) => setMesSel(e.target.value)}
              >
                <option value="Julio 2026">Julio 2026</option>
                <option value="Junio 2026">Junio 2026</option>
                <option value="Mayo 2026">Mayo 2026</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer' }}>
                <input type="checkbox" checked={comparar} onChange={(e) => setComparar(e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                Comparar con mes anterior
              </label>
            </div>
          )}

          {periodo === 'anual' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select
                className="input-field"
                style={{ paddingLeft: '1rem', paddingRight: '0.75rem', width: '100px', backgroundColor: 'var(--bg-color)' }}
                value={anioSel}
                onChange={(e) => setAnioSel(e.target.value)}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer' }}>
                <input type="checkbox" checked={comparar} onChange={(e) => setComparar(e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                Comparar con año anterior
              </label>
            </div>
          )}

          {periodo === 'personalizado' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="date" className="input-field" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ width: '130px', padding: '0.5rem' }} />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input type="date" className="input-field" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ width: '130px', padding: '0.5rem' }} />
            </div>
          )}

          <div style={{ flexGrow: 1 }} />

          <button
            className="btn-primary"
            onClick={handleDescargarPDF}
            disabled={generandoPDF}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Download size={16} />
            {generandoPDF ? 'Generando...' : 'Generar informe'}
          </button>
        </div>
      </div>

      {/* Contenedor de la interfaz analítica (no capturado en PDF) */}
      <div>

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

      {/* ─── Contenedores ocultos SOLO para capturar gráficos al generar PDF ─── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={chartPartRef} style={{ width: '760px', height: '300px', backgroundColor: '#ffffff', padding: '0.5rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.evolucion} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={13} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={13} />
              <Tooltip />
              <Bar dataKey="participacion" name="Participación (%)" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div ref={chartDolorRef} style={{ width: '370px', height: '280px', backgroundColor: '#ffffff', padding: '0.5rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.evolucion} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pdfDolor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={13} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={13} />
              <Tooltip />
              <Area type="monotone" dataKey="dolor" name="Dolor (%)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#pdfDolor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div ref={chartFocoRef} style={{ width: '370px', height: '280px', backgroundColor: '#ffffff', padding: '0.5rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.evolucion} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pdfFoco" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={13} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={13} />
              <Tooltip />
              <Area type="monotone" dataKey="foco" name="Foco (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#pdfFoco)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

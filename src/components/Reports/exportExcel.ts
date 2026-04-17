import type { ReportContract } from './types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function escapeCell(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCSV(rows: string[][]): string {
  return rows.map(r => r.map(escapeCell).join(',')).join('\n');
}

function downloadCSV(content: string, filename: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportContractsByMonth(contracts: ReportContract[]) {
  const map = new Map<string, { label: string; contracts: ReportContract[] }>();

  contracts.forEach(c => {
    const d = c.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, { label: `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`, contracts: [] });
    }
    map.get(key)!.contracts.push(c);
  });

  const rows: string[][] = [
    ['Periodo', 'Nro Contrato', 'Contraparte', 'Commodity', 'Cantidad (TMS)', 'Tipo', 'Estado'],
  ];

  const sorted = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  sorted.forEach(([, group]) => {
    if (group.contracts.length === 0) {
      rows.push([group.label, 'No hay registros', '', '', '', '', '']);
    } else {
      group.contracts.forEach(c => {
        rows.push([
          group.label,
          c.number,
          c.counterpartyName,
          c.commodityName,
          c.quantity > 0 ? c.quantity.toString() : '—',
          c.type === 'purchase' ? 'Compra' : 'Venta',
          STATUS_LABELS[c.status] || c.status,
        ]);
      });
    }
  });

  downloadCSV(toCSV(rows), `contratos_por_mes_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportContractsByYear(contracts: ReportContract[]) {
  const map = new Map<string, ReportContract[]>();
  contracts.forEach(c => {
    const year = c.createdAt.getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(c);
  });

  const rows: string[][] = [
    ['Año', 'Nro Contrato', 'Tipo', 'Contraparte', 'Commodity', 'Cantidad (TMS)', 'Estado'],
  ];

  Array.from(map.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .forEach(([year, items]) => {
      items.forEach(c => {
        rows.push([
          year,
          c.number,
          c.parentContractId ? `Adenda${c.adendaNumber ? ' #' + c.adendaNumber : ''}` : 'Contrato',
          c.counterpartyName,
          c.commodityName,
          c.quantity > 0 ? c.quantity.toString() : '—',
          STATUS_LABELS[c.status] || c.status,
        ]);
      });
    });

  downloadCSV(toCSV(rows), `contratos_por_año_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportDaysToConfirmation(contracts: ReportContract[]) {
  const now = new Date();
  const rows: string[][] = [
    ['Nro Contrato', 'Tipo', 'Contraparte', 'Commodity', 'Cantidad (TMS)', 'Estado', 'Fecha Creacion', 'Dias Transcurridos'],
  ];

  contracts
    .filter(c => c.status !== 'cancelled')
    .map(c => ({
      ...c,
      days: Math.max(0, Math.floor((now.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24))),
    }))
    .sort((a, b) => b.days - a.days)
    .forEach(c => {
      rows.push([
        c.number,
        c.parentContractId ? `Adenda${c.adendaNumber ? ' #' + c.adendaNumber : ''}` : 'Contrato',
        c.counterpartyName,
        c.commodityName,
        c.quantity > 0 ? c.quantity.toString() : '—',
        STATUS_LABELS[c.status] || c.status,
        c.createdAt.toLocaleDateString('es-PE'),
        c.days.toString(),
      ]);
    });

  downloadCSV(toCSV(rows), `dias_hasta_confirmacion_${new Date().toISOString().slice(0, 10)}.csv`);
}

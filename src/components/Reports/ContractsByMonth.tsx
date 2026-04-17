import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, FileText, Download } from 'lucide-react';
import type { ReportContract } from './types';

interface ContractsByMonthProps {
  contracts: ReportContract[];
  onExportExcel: () => void;
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

function buildMonthGroups(contracts: ReportContract[]) {
  if (contracts.length === 0) return [];

  const map = new Map<string, { label: string; year: number; month: number; contracts: ReportContract[] }>();

  contracts.forEach(c => {
    const d = c.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, {
        label: `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        contracts: [],
      });
    }
    map.get(key)!.contracts.push(c);
  });

  const sorted = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  const allKeys = sorted.map(([k]) => k);
  if (allKeys.length < 2) return sorted.map(([, v]) => v);

  const oldest = allKeys[allKeys.length - 1];
  const newest = allKeys[0];
  const [oldYear, oldMonth] = oldest.split('-').map(Number);
  const [newYear, newMonth] = newest.split('-').map(Number);

  type GroupEntry = { label: string; year: number; month: number; contracts: ReportContract[] };
  const filled: GroupEntry[] = [];
  let y = newYear;
  let m = newMonth;

  while (y > oldYear || (y === oldYear && m >= oldMonth)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (map.has(key)) {
      filled.push(map.get(key)!);
    } else {
      filled.push({
        label: `${MONTHS_ES[m - 1]} ${y}`,
        year: y,
        month: m - 1,
        contracts: [],
      });
    }
    m--;
    if (m < 1) { m = 12; y--; }
  }

  return filled;
}

const ContractsByMonth: React.FC<ContractsByMonthProps> = ({ contracts, onExportExcel }) => {
  const groups = buildMonthGroups(contracts);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(groups.slice(0, 3).map(g => g.label)));

  const toggle = (label: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(groups.map(g => g.label)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{contracts.length} contrato{contracts.length !== 1 ? 's' : ''} en {groups.length} mes{groups.length !== 1 ? 'es' : ''}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={expandAll} className="text-xs text-blue-600 hover:underline">Expandir todo</button>
          <span className="text-gray-300">|</span>
          <button onClick={collapseAll} className="text-xs text-blue-600 hover:underline">Colapsar todo</button>
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors ml-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {groups.map(group => {
          const isOpen = expanded.has(group.label);
          return (
            <div key={group.label} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => toggle(group.label)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-gray-800">{group.label}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${group.contracts.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {group.contracts.length} contrato{group.contracts.length !== 1 ? 's' : ''}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {group.contracts.length === 0 ? (
                    <div className="px-8 py-4 text-sm text-gray-400 italic">No hay registros</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {group.contracts.map(c => (
                        <div key={c.id} className="flex items-center justify-between px-8 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="font-mono text-sm font-medium text-gray-800">{c.number}</span>
                              {c.parentContractId && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Adenda</span>
                              )}
                            </div>
                            <span className="text-gray-400 text-sm hidden sm:inline">—</span>
                            <span className="text-sm text-gray-600 truncate hidden sm:inline">{c.counterpartyName}</span>
                            <span className="text-gray-400 text-sm hidden md:inline">—</span>
                            <span className="text-sm text-gray-500 truncate hidden md:inline">{c.commodityName}</span>
                            {c.quantity > 0 && (
                              <>
                                <span className="text-gray-400 text-sm hidden lg:inline">—</span>
                                <span className="text-sm text-gray-500 hidden lg:inline">{c.quantity.toLocaleString()} TMS</span>
                              </>
                            )}
                          </div>
                          <span className={`flex-shrink-0 ml-4 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-700'}`}>
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContractsByMonth;

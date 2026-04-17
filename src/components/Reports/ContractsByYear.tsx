import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, FileText, Download } from 'lucide-react';
import type { ReportContract } from './types';

interface ContractsByYearProps {
  contracts: ReportContract[];
  onExportExcel: () => void;
}

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

function buildYearGroups(contracts: ReportContract[]) {
  const map = new Map<string, ReportContract[]>();

  contracts.forEach(c => {
    const year = c.createdAt.getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(c);
  });

  return Array.from(map.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, items]) => ({ year, contracts: items }));
}

const ContractsByYear: React.FC<ContractsByYearProps> = ({ contracts, onExportExcel }) => {
  const groups = buildYearGroups(contracts);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(groups.map(g => g.year)));

  const toggle = (year: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(groups.map(g => g.year)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{contracts.length} contrato{contracts.length !== 1 ? 's' : ''} en {groups.length} año{groups.length !== 1 ? 's' : ''}</span>
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
        {groups.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-10 text-center text-gray-400">
            No hay contratos registrados
          </div>
        )}
        {groups.map(group => {
          const isOpen = expanded.has(group.year);
          const parentCount = group.contracts.filter(c => !c.parentContractId).length;
          const adendaCount = group.contracts.filter(c => !!c.parentContractId).length;

          return (
            <div key={group.year} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => toggle(group.year)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-gray-800 text-lg">{group.year}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {adendaCount > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {adendaCount} adenda{adendaCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    {parentCount} contrato{parentCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {group.contracts.length === 0 ? (
                    <div className="px-8 py-4 text-sm text-gray-400 italic">No hay registros</div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-3">Contrato</div>
                        <div className="col-span-3">Contraparte</div>
                        <div className="col-span-3 hidden md:block">Commodity</div>
                        <div className="col-span-2 hidden md:block text-right">Peso Total</div>
                        <div className="col-span-1 hidden lg:block text-right">Estado</div>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {group.contracts.map(c => (
                          <div key={c.id} className="grid grid-cols-12 gap-2 px-5 py-3 hover:bg-gray-50 transition-colors items-center">
                            <div className="col-span-3 flex items-center space-x-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-mono text-sm font-medium text-gray-800 truncate">{c.number}</div>
                                {c.parentContractId && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    Adenda {c.adendaNumber ? `#${c.adendaNumber}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="col-span-3 text-sm text-gray-700 truncate">{c.counterpartyName}</div>
                            <div className="col-span-3 hidden md:block text-sm text-gray-600 truncate">{c.commodityName}</div>
                            <div className="col-span-2 hidden md:block text-sm text-gray-600 text-right">
                              {c.quantity > 0 ? `${c.quantity.toLocaleString()} TMs` : '—'}
                            </div>
                            <div className="col-span-1 hidden lg:block text-right">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-700'}`}>
                                {STATUS_LABELS[c.status] || c.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
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

export default ContractsByYear;

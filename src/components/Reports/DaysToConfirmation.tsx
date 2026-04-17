import React, { useState } from 'react';
import { Clock, FileText, Download, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReportContract } from './types';

interface DaysToConfirmationProps {
  contracts: ReportContract[];
  onExportExcel: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

function daysBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getDaysColor(days: number): string {
  if (days <= 3) return 'text-green-600';
  if (days <= 10) return 'text-amber-600';
  return 'text-red-600';
}

function getDaysBg(days: number): string {
  if (days <= 3) return 'bg-green-50 border-green-200';
  if (days <= 10) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

const DaysToConfirmation: React.FC<DaysToConfirmationProps> = ({ contracts, onExportExcel }) => {
  const [sortBy, setSortBy] = useState<'days_desc' | 'days_asc' | 'date_desc'>('days_desc');

  const now = new Date();

  const rows = contracts
    .filter(c => c.status !== 'cancelled')
    .map(c => ({
      ...c,
      days: daysBetween(c.createdAt, now),
    }));

  const sorted = [...rows].sort((a, b) => {
    if (sortBy === 'days_desc') return b.days - a.days;
    if (sortBy === 'days_asc') return a.days - b.days;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const avg = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.days, 0) / rows.length) : 0;
  const max = rows.length > 0 ? Math.max(...rows.map(r => r.days)) : 0;
  const min = rows.length > 0 ? Math.min(...rows.map(r => r.days)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
            <div className="text-lg font-bold text-blue-700">{avg}</div>
            <div className="text-xs text-blue-500">Promedio días</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
            <div className="text-lg font-bold text-green-700">{min}</div>
            <div className="text-xs text-green-500">Mínimo</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
            <div className="text-lg font-bold text-red-700">{max}</div>
            <div className="text-xs text-red-500">Máximo</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="days_desc">Mayor a menor días</option>
            <option value="days_asc">Menor a mayor días</option>
            <option value="date_desc">Más recientes primero</option>
          </select>
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Contrato</div>
          <div className="col-span-3 hidden md:block">Commodity</div>
          <div className="col-span-2 hidden lg:block">Estado</div>
          <div className="col-span-3 text-right">Dias transcurridos</div>
        </div>
        <div className="divide-y divide-gray-100">
          {sorted.length === 0 && (
            <div className="px-6 py-10 text-center text-gray-400">No hay contratos para mostrar</div>
          )}
          {sorted.map(c => (
            <div key={c.id} className={`px-5 py-3.5 hover:bg-gray-50 transition-colors grid grid-cols-12 gap-2 items-center`}>
              <div className="col-span-4 flex items-center space-x-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-sm font-medium text-gray-800 truncate">{c.number}</div>
                  <div className="text-xs text-gray-500 truncate">{c.counterpartyName}</div>
                </div>
              </div>
              <div className="col-span-3 hidden md:block text-sm text-gray-600 truncate">{c.commodityName}</div>
              <div className="col-span-2 hidden lg:block">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  c.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  c.status === 'active' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {STATUS_LABELS[c.status] || c.status}
                </span>
              </div>
              <div className="col-span-3 flex items-center justify-end space-x-2">
                <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold ${getDaysBg(c.days)} ${getDaysColor(c.days)}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <ArrowRight className="w-3 h-3 opacity-50" />
                  <span>{c.days} {c.days === 1 ? 'día' : 'días'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>1-3 días</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span>4-10 días</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span>+10 días</span>
        </div>
      </div>
    </div>
  );
};

export default DaysToConfirmation;

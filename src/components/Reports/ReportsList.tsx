import React, { useState, useEffect } from 'react';
import {
  BarChart3, Calendar, CalendarDays, Clock, Search, X, SlidersHorizontal,
  ChevronDown, TrendingUp, TrendingDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ReportContract } from './types';
import ContractsByMonth from './ContractsByMonth';
import ContractsByYear from './ContractsByYear';
import DaysToConfirmation from './DaysToConfirmation';
import {
  exportContractsByMonth,
  exportContractsByYear,
  exportDaysToConfirmation,
} from './exportExcel';

type ReportTab = 'by_month' | 'by_year' | 'days_confirmation';

const REPORT_TABS = [
  {
    id: 'by_month' as ReportTab,
    label: 'Contratos por Mes',
    shortLabel: 'Por Mes',
    icon: Calendar,
    description: 'Detalle de contratos generados mes a mes',
  },
  {
    id: 'by_year' as ReportTab,
    label: 'Contratos por Año',
    shortLabel: 'Por Año',
    icon: CalendarDays,
    description: 'Resumen anual de contratos y adendas',
  },
  {
    id: 'days_confirmation' as ReportTab,
    label: 'Dias de Confirmacion',
    shortLabel: 'Dias',
    icon: Clock,
    description: 'Tiempo transcurrido desde creacion de cada contrato',
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'purchase', label: 'Compra' },
  { value: 'sale', label: 'Venta' },
];

const ReportsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('by_month');
  const [contracts, setContracts] = useState<ReportContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id, contract_number, contract_type, status, created_at,
          parent_contract_id, adenda_number,
          vendor:vendors(id, name),
          buyer:buyers(id, name),
          product:products(id, name),
          contract_quotas(tmh, tms)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: ReportContract[] = data.map((c: any) => {
          const quotas: { tmh: number; tms: number }[] = c.contract_quotas || [];
          const totalTms = quotas.reduce((s: number, q: any) => s + (q.tms || 0), 0);
          const counterparty = c.contract_type === 'purchase' ? c.vendor : c.buyer;

          return {
            id: c.id,
            number: c.contract_number,
            type: c.contract_type,
            counterpartyName: counterparty?.name || 'N/A',
            commodityName: c.product?.name || 'N/A',
            quantity: totalTms,
            status: c.status || 'active',
            createdAt: c.created_at ? new Date(c.created_at) : new Date(),
            parentContractId: c.parent_contract_id || null,
            adendaNumber: c.adenda_number || null,
          };
        });
        setContracts(formatted);
      } else {
        setContracts([]);
      }
    } catch (err) {
      console.error('Error loading contracts for reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueYears = Array.from(
    new Set(contracts.map(c => c.createdAt.getFullYear().toString()))
  ).sort((a, b) => Number(b) - Number(a));

  const activeFilterCount =
    [filterStatus, filterType, filterYear].filter(f => f !== 'all').length + (searchTerm ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterYear('all');
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch =
      !searchTerm ||
      c.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commodityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesYear =
      filterYear === 'all' || c.createdAt.getFullYear().toString() === filterYear;
    return matchesSearch && matchesStatus && matchesType && matchesYear;
  });

  const totalParents = filteredContracts.filter(c => !c.parentContractId).length;
  const totalAdendas = filteredContracts.filter(c => !!c.parentContractId).length;
  const totalPurchase = filteredContracts.filter(c => c.type === 'purchase' && !c.parentContractId).length;
  const totalSale = filteredContracts.filter(c => c.type === 'sale' && !c.parentContractId).length;

  const activeTabMeta = REPORT_TABS.find(t => t.id === activeTab)!;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
            Reportes Generales
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Analisis y seguimiento de contratos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{totalParents}</div>
          <div className="text-sm text-gray-500 mt-0.5">Contratos</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{totalAdendas}</div>
          <div className="text-sm text-gray-500 mt-0.5">Adendas</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm flex items-center space-x-3">
          <TrendingDown className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-emerald-600">{totalPurchase}</div>
            <div className="text-sm text-gray-500">Compras</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalSale}</div>
            <div className="text-sm text-gray-500">Ventas</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contrato, contraparte, commodity..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Año</label>
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Todos los años</option>
                {uniqueYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex border-b border-gray-200 bg-gray-50">
          {REPORT_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5">
          <div className="mb-4">
            <p className="text-sm text-gray-500">{activeTabMeta.description}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'by_month' && (
                <ContractsByMonth
                  contracts={filteredContracts}
                  onExportExcel={() => exportContractsByMonth(filteredContracts)}
                />
              )}
              {activeTab === 'by_year' && (
                <ContractsByYear
                  contracts={filteredContracts}
                  onExportExcel={() => exportContractsByYear(filteredContracts)}
                />
              )}
              {activeTab === 'days_confirmation' && (
                <DaysToConfirmation
                  contracts={filteredContracts}
                  onExportExcel={() => exportDaysToConfirmation(filteredContracts)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsList;

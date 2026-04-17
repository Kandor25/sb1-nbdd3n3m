import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, TrendingUp, TrendingDown, AlertCircle,
  Calculator, MoreVertical, CreditCard as Edit2, FileCheck, Copy, ChevronDown, ChevronRight,
  GitCompare, GitBranch, SlidersHorizontal, X, ChevronUp
} from 'lucide-react';
import { mockContracts, mockCounterparties } from '../../data/mockData';
import type { Contract } from '../../types';
import ManualValuation from './ManualValuation';
import ContractDetailsView from './ContractDetailsView';
import AdendaValidation from './AdendaValidation';
import ContractValuationComparison from './ContractValuationComparison';
import { supabase } from '../../lib/supabase';

interface ContractListProps {
  onCreateNew: () => void;
  onViewDetails: (contract: Contract) => void;
  onEditContract: (contractId: string) => void;
}

interface DbContract {
  id: string;
  number: string;
  type: string;
  counterpartyId: string;
  counterparty: { name: string; type?: string } | null;
  commodity: { name: string; grade: string };
  quantity: number;
  quantityTms: number;
  tolerance: number;
  deliveryPeriod: { start: Date; end: Date };
  createdAt: Date;
  status: string;
  parentContractId: string | null;
  adendaNumber: number | null;
}

const ContractList: React.FC<ContractListProps> = ({ onCreateNew, onViewDetails, onEditContract }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCommodity, setFilterCommodity] = useState<string>('all');
  const [filterCounterparty, setFilterCounterparty] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showValuation, setShowValuation] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [showAdendaValidation, setShowAdendaValidation] = useState(false);
  const [showValuationComparison, setShowValuationComparison] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [dbContracts, setDbContracts] = useState<DbContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const openMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuRef.current && !openMenuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          vendor:vendors(id, name),
          buyer:buyers(id, name),
          product:products(id, name),
          contract_quotas(tmh, tms)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: DbContract[] = data.map((contract: any) => {
          const quotas: { tmh: number; tms: number }[] = contract.contract_quotas || [];
          const totalTmh = quotas.reduce((sum: number, q: { tmh: number }) => sum + (q.tmh || 0), 0);
          const totalTms = quotas.reduce((sum: number, q: { tms: number }) => sum + (q.tms || 0), 0);

          return {
            id: contract.id,
            number: contract.contract_number,
            type: contract.contract_type,
            counterpartyId: contract.contract_type === 'purchase' ? contract.vendor_id : contract.buyer_id,
            counterparty: contract.contract_type === 'purchase' ? contract.vendor : contract.buyer,
            commodity: { name: contract.product?.name || 'N/A', grade: 'N/A' },
            quantity: totalTmh,
            quantityTms: totalTms,
            tolerance: 0,
            deliveryPeriod: {
              start: new Date(contract.start_month),
              end: new Date(contract.end_month),
            },
            createdAt: contract.created_at ? new Date(contract.created_at) : new Date(),
            status: contract.status || 'active',
            parentContractId: contract.parent_contract_id || null,
            adendaNumber: contract.adenda_number || null,
          };
        });
        setDbContracts(formatted);
      } else {
        setDbContracts([]);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const allContracts = dbContracts.length > 0 ? dbContracts : (mockContracts as any[]).map(c => ({
    ...c,
    parentContractId: null,
    adendaNumber: null,
    counterparty: c.counterparty || mockCounterparties.find((cp: any) => cp.id === c.counterpartyId),
  }));

  const parentContracts = allContracts.filter(c => !c.parentContractId);
  const adendaContracts = allContracts.filter(c => !!c.parentContractId);

  const adendaMap: Record<string, DbContract[]> = {};
  adendaContracts.forEach(a => {
    const key = a.parentContractId!;
    if (!adendaMap[key]) adendaMap[key] = [];
    adendaMap[key].push(a);
  });
  Object.values(adendaMap).forEach(list => list.sort((a, b) => (a.adendaNumber || 0) - (b.adendaNumber || 0)));

  const uniqueCommodities = Array.from(new Set(parentContracts.map(c => c.commodity.name).filter(Boolean))).sort();
  const uniqueCounterparties = Array.from(new Set(parentContracts.map(c => c.counterparty?.name).filter(Boolean) as string[])).sort();
  const uniqueYears = Array.from(new Set(parentContracts.map(c => c.createdAt.getFullYear().toString()))).sort((a, b) => Number(b) - Number(a));

  const activeAdvancedFiltersCount = [filterCommodity, filterCounterparty, filterYear, filterType].filter(f => f !== 'all').length;
  const totalActiveFiltersCount = [filterCommodity, filterCounterparty, filterYear, filterType, filterStatus, searchTerm].filter(f => f && f !== 'all').length;

  const matchesFilters = (contract: DbContract) => {
    const matchesSearch = contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.counterparty?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contract.type === filterType;
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const matchesCommodity = filterCommodity === 'all' || contract.commodity.name === filterCommodity;
    const matchesCounterparty = filterCounterparty === 'all' || contract.counterparty?.name === filterCounterparty;
    const matchesYear = filterYear === 'all' || contract.createdAt.getFullYear().toString() === filterYear;
    return matchesSearch && matchesType && matchesStatus && matchesCommodity && matchesCounterparty && matchesYear;
  };

  const clearAdvancedFilters = () => {
    setFilterCommodity('all');
    setFilterCounterparty('all');
    setFilterYear('all');
    setFilterType('all');
  };

  const filteredParents = parentContracts
    .filter(c => {
      if (filterStatus !== 'all') {
        return matchesFilters(c);
      }
      const selfMatches = matchesFilters(c);
      const childMatches = (adendaMap[c.id] || []).some(a => matchesFilters(a));
      return selfMatches || childMatches;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const hasAnyFilter = totalActiveFiltersCount > 0;
  const baseForSummary = hasAnyFilter ? filteredParents : parentContracts;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => (type === 'purchase' ? TrendingDown : TrendingUp);
  const getTypeColor = (type: string) => type === 'purchase' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50';

  const toggleParent = (id: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateAdenda = async (contractId: string) => {
    try {
      const { data: sourceContract, error: fetchError } = await supabase
        .from('contracts')
        .select(`
          *,
          contract_quotas(*),
          contract_payables(*),
          contract_processing(*),
          contract_penalties(*),
          contract_quality_specs(*),
          contract_refining_expenses(*),
          payment_terms(*),
          contract_quotation_periods(*)
        `)
        .eq('id', contractId)
        .single();

      if (fetchError) throw fetchError;

      const existingAdendas = await supabase
        .from('contracts')
        .select('adenda_number')
        .eq('parent_contract_id', contractId);

      const maxAdenda = (existingAdendas.data || []).reduce((max: number, row: any) => Math.max(max, row.adenda_number || 0), 0);
      const nextAdendaNumber = maxAdenda + 1;
      const baseNumber = sourceContract.contract_number.split('-N')[0];
      const newContractNumber = `${baseNumber}-${nextAdendaNumber}`;

      const { data: newContract, error: insertError } = await supabase
        .from('contracts')
        .insert({
          contract_number: newContractNumber,
          contract_type: sourceContract.contract_type,
          vendor_id: sourceContract.vendor_id,
          buyer_id: sourceContract.buyer_id,
          product_id: sourceContract.product_id,
          country_id: sourceContract.country_id,
          start_month: sourceContract.start_month,
          end_month: sourceContract.end_month,
          incoterm_id: sourceContract.incoterm_id,
          delivery_location: sourceContract.delivery_location,
          rollback_applies: sourceContract.rollback_applies,
          rollback_value: sourceContract.rollback_value,
          rollback_unit: sourceContract.rollback_unit,
          waste_applies: sourceContract.waste_applies,
          waste_value: sourceContract.waste_value,
          waste_unit: sourceContract.waste_unit,
          assay_structure: sourceContract.assay_structure,
          assay_final_lab: sourceContract.assay_final_lab,
          assay_cost_type: sourceContract.assay_cost_type,
          sampling_formula_id: sourceContract.sampling_formula_id,
          sampling_incoterm_id: sourceContract.sampling_incoterm_id,
          sampling_reference: sourceContract.sampling_reference,
          processing_escalator_value: sourceContract.processing_escalator_value,
          processing_escalator_unit: sourceContract.processing_escalator_unit,
          refining_escalator_value: sourceContract.refining_escalator_value,
          refining_escalator_unit: sourceContract.refining_escalator_unit,
          observations: `Clonado desde el Contrato ${sourceContract.contract_number}`,
          status: 'draft',
          parent_contract_id: contractId,
          adenda_number: nextAdendaNumber,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const childId = newContract.id;

      if ((sourceContract.contract_quotas || []).length > 0) {
        await supabase.from('contract_quotas').insert(
          sourceContract.contract_quotas.map((q: any) => ({
            contract_id: childId, month: q.month, tmh: q.tmh, tms: q.tms, h2o_percentage: q.h2o_percentage,
          }))
        );
      }
      if ((sourceContract.contract_payables || []).length > 0) {
        await supabase.from('contract_payables').insert(
          sourceContract.contract_payables.map((q: any) => ({
            contract_id: childId, formula_id: q.formula_id, metal: q.metal, deduction_value: q.deduction_value,
            deduction_unit: q.deduction_unit, balance_percentage: q.balance_percentage, market_index_id: q.market_index_id,
          }))
        );
      }
      if ((sourceContract.contract_processing || []).length > 0) {
        await supabase.from('contract_processing').insert(
          sourceContract.contract_processing.map((q: any) => ({
            contract_id: childId, formula_id: q.formula_id, incoterm_id: q.incoterm_id, value: q.value, unit: q.unit,
          }))
        );
      }
      if ((sourceContract.contract_penalties || []).length > 0) {
        await supabase.from('contract_penalties').insert(
          sourceContract.contract_penalties.map((q: any) => ({
            contract_id: childId, formula_id: q.formula_id, metal: q.metal, amount_usd: q.amount_usd,
            lower_limit: q.lower_limit, lower_limit_unit: q.lower_limit_unit, upper_limit: q.upper_limit, upper_limit_unit: q.upper_limit_unit,
          }))
        );
      }
      if ((sourceContract.contract_quality_specs || []).length > 0) {
        await supabase.from('contract_quality_specs').insert(
          sourceContract.contract_quality_specs.map((q: any) => ({
            contract_id: childId, metal: q.metal, spec_type: q.spec_type, min_value: q.min_value, max_value: q.max_value, unit: q.unit,
          }))
        );
      }
      if ((sourceContract.contract_refining_expenses || []).length > 0) {
        await supabase.from('contract_refining_expenses').insert(
          sourceContract.contract_refining_expenses.map((q: any) => ({
            contract_id: childId, formula_id: q.formula_id, metal: q.metal, amount_usd: q.amount_usd, unit: q.unit,
          }))
        );
      }
      if ((sourceContract.payment_terms || []).length > 0) {
        await supabase.from('payment_terms').insert(
          sourceContract.payment_terms.map((q: any) => ({
            contract_id: childId, payment_type: q.payment_type, advance_percentage: q.advance_percentage,
            known_elements: q.known_elements, days_from_issuance: q.days_from_issuance,
          }))
        );
      }
      if ((sourceContract.contract_quotation_periods || []).length > 0) {
        await supabase.from('contract_quotation_periods').insert(
          sourceContract.contract_quotation_periods.map((q: any) => ({
            contract_id: childId, formula: q.formula, months: q.months, metal: q.metal,
            buyer_optionality: q.buyer_optionality, seller_optionality: q.seller_optionality,
            day_type: q.day_type, fixed_date: q.fixed_date, month_reference: q.month_reference, event_type: q.event_type,
          }))
        );
      }

      setExpandedParents(prev => new Set(prev).add(contractId));
      await loadContracts();
    } catch (error) {
      console.error('Error creating adenda:', error);
    }
  };

  const handleMenuAction = async (action: string, contractId: string) => {
    setOpenMenuId(null);
    switch (action) {
      case 'edit':
        onEditContract(contractId);
        break;
      case 'summary':
        setSelectedContractId(contractId);
        setShowContractDetails(true);
        break;
      case 'valuation':
        setSelectedContractId(contractId);
        setShowValuation(true);
        break;
      case 'adenda':
        await handleCreateAdenda(contractId);
        break;
      case 'validate':
        setSelectedContractId(contractId);
        setShowAdendaValidation(true);
        break;
    }
  };

  const handleChangeStatus = async (contractId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('contracts').update({ status: newStatus }).eq('id', contractId);
      if (error) throw error;
      await loadContracts();
    } catch (error) {
      console.error('Error updating contract status:', error);
    }
  };

  const statusSummary = {
    draft: baseForSummary.filter(c => c.status === 'draft').length,
    active: baseForSummary.filter(c => c.status === 'active').length,
    completed: baseForSummary.filter(c => c.status === 'completed').length,
    cancelled: baseForSummary.filter(c => c.status === 'cancelled').length,
  };

  const renderContractRow = (contract: DbContract, isAdenda = false) => {
    const TypeIcon = getTypeIcon(contract.type);
    const adendas = adendaMap[contract.id] || [];
    const hasAdendas = adendas.length > 0;
    const isExpanded = expandedParents.has(contract.id);

    return (
      <React.Fragment key={contract.id}>
        <tr className={`hover:bg-gray-50 transition-colors ${isAdenda ? 'bg-blue-50/40' : ''}`}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              {!isAdenda && hasAdendas && (
                <button
                  onClick={() => toggleParent(contract.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  title={isExpanded ? 'Ocultar adendas' : 'Ver adendas'}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
              )}
              {isAdenda && (
                <div className="mr-2 pl-3 flex-shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                </div>
              )}
              {!isAdenda && !hasAdendas && <div className="mr-2 w-7 flex-shrink-0" />}
              <div className={`p-2 rounded-lg ${getTypeColor(contract.type)} mr-3 flex-shrink-0`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{contract.number}</span>
                  {isAdenda && (
                    <span className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                      Adenda {contract.adendaNumber}
                    </span>
                  )}
                  {hasAdendas && !isAdenda && (
                    <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {adendas.length} adenda{adendas.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {contract.type === 'purchase' ? 'compra' : 'venta'}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{contract.counterparty?.name || '-'}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{contract.commodity.name}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {contract.quantity > 0 ? (
              <>
                <div className="text-sm text-gray-900">{contract.quantity.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TMH</div>
                {contract.quantityTms > 0 && (
                  <div className="text-sm text-gray-500">{contract.quantityTms.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TMS</div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-400">Sin datos</div>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center text-sm text-gray-900">
              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
              {contract.deliveryPeriod.start.toLocaleDateString('es-ES')}
            </div>
            <div className="text-sm text-gray-500">
              hasta {contract.deliveryPeriod.end.toLocaleDateString('es-ES')}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
              {contract.status === 'active' ? 'activo' :
               contract.status === 'draft' ? 'borrador' :
               contract.status === 'completed' ? 'completado' : 'cancelado'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="relative inline-block text-left">
              <button
                onClick={() => setOpenMenuId(openMenuId === contract.id ? null : contract.id)}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {openMenuId === contract.id && (
                <div
                  ref={openMenuRef}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                >
                  <button
                    onClick={() => handleMenuAction('edit', contract.id)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-3 text-gray-500" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleMenuAction('summary', contract.id)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileCheck className="w-4 h-4 mr-3 text-blue-500" />
                    Resumen
                  </button>
                  <button
                    onClick={() => handleMenuAction('valuation', contract.id)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Calculator className="w-4 h-4 mr-3 text-green-500" />
                    Valorización
                  </button>
                  {!isAdenda && (
                    <button
                      onClick={() => handleMenuAction('adenda', contract.id)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-3 text-orange-500" />
                      Adenda
                    </button>
                  )}
                  {isAdenda && (
                    <button
                      onClick={() => handleMenuAction('validate', contract.id)}
                      className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center"
                    >
                      <GitCompare className="w-4 h-4 mr-3 text-blue-500" />
                      Validar
                    </button>
                  )}
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Cambiar Estado</p>
                    <div className="space-y-1">
                      {contract.status !== 'draft' && (
                        <button onClick={() => handleChangeStatus(contract.id, 'draft')} className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>Borrador
                        </button>
                      )}
                      {contract.status !== 'active' && (
                        <button onClick={() => handleChangeStatus(contract.id, 'active')} className="w-full px-3 py-1.5 text-left text-xs text-green-700 hover:bg-green-50 rounded flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Activo
                        </button>
                      )}
                      {contract.status !== 'completed' && (
                        <button onClick={() => handleChangeStatus(contract.id, 'completed')} className="w-full px-3 py-1.5 text-left text-xs text-blue-700 hover:bg-blue-50 rounded flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Completado
                        </button>
                      )}
                      {contract.status !== 'cancelled' && (
                        <button onClick={() => handleChangeStatus(contract.id, 'cancelled')} className="w-full px-3 py-1.5 text-left text-xs text-red-700 hover:bg-red-50 rounded flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Cancelado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
        {!isAdenda && isExpanded && adendas.map(adenda => renderContractRow(adenda, true))}
      </React.Fragment>
    );
  };

  return (
    <>
      {showValuation && selectedContractId && (
        <ManualValuation contractId={selectedContractId} onClose={() => { setShowValuation(false); setSelectedContractId(null); }} onSuccess={() => { setShowValuation(false); setSelectedContractId(null); }} />
      )}
      {showContractDetails && (
        <ContractDetailsView onClose={() => setShowContractDetails(false)} />
      )}
      {showAdendaValidation && selectedContractId && (
        <AdendaValidation adendaId={selectedContractId} onClose={() => { setShowAdendaValidation(false); setSelectedContractId(null); }} />
      )}
      {showValuationComparison && (
        <ContractValuationComparison
          onClose={() => setShowValuationComparison(false)}
          contracts={allContracts.map(c => ({
            id: c.id,
            number: c.number,
            commodity: c.commodity.name,
            counterparty: c.counterparty?.name || '-',
            type: c.type,
          }))}
        />
      )}

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-7 h-7 mr-3 text-blue-600" />
              Contratos
            </h1>
            <p className="text-gray-600 mt-1">Gestionar contratos de compra y venta</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowValuationComparison(true)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <GitCompare className="w-4 h-4 mr-2 text-blue-600" />
              Comparacion de Valorizaciones
            </button>
            <button
              onClick={onCreateNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contrato
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: 'draft', label: 'Borrador', color: 'gray', Icon: FileText },
            { key: 'active', label: 'Activos', color: 'green', Icon: TrendingUp },
            { key: 'completed', label: 'Completados', color: 'blue', Icon: FileText },
            { key: 'cancelled', label: 'Cancelados', color: 'red', Icon: AlertCircle },
          ].map(({ key, label, color, Icon }) => {
            const isActive = filterStatus === key;
            return (
              <div
                key={key}
                onClick={() => setFilterStatus(isActive ? 'all' : key)}
                className={`rounded-lg shadow-sm border-2 p-5 hover:shadow-md transition-all cursor-pointer ${
                  isActive
                    ? `bg-${color}-50 border-${color}-500 ring-2 ring-${color}-300`
                    : `bg-white border-${color}-200`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium text-${color}-600 uppercase tracking-wide`}>{label}</p>
                    <p className={`text-3xl font-bold text-${color}-900 mt-2`}>{statusSummary[key as keyof typeof statusSummary]}</p>
                  </div>
                  <div className={`${isActive ? `bg-${color}-200` : `bg-${color}-100`} rounded-full p-3 transition-colors`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                </div>
                <div className={`mt-3 pt-3 border-t border-${color}-100 flex items-center justify-between`}>
                  <p className="text-xs text-gray-500">Contratos {label.toLowerCase()}</p>
                  {isActive && <p className={`text-xs font-semibold text-${color}-600`}>Filtro activo</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de contrato, commodity o contraparte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Todos los Estados</option>
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                showAdvancedFilters || activeAdvancedFiltersCount > 0
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros avanzados</span>
              {totalActiveFiltersCount > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalActiveFiltersCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {(filterStatus !== 'all' || activeAdvancedFiltersCount > 0 || searchTerm) && (
              <button
                onClick={() => { setFilterStatus('all'); setSearchTerm(''); clearAdvancedFilters(); }}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                title="Limpiar todos los filtros"
              >
                <X className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {showAdvancedFilters && (
            <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 rounded-b-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Commodity
                  </label>
                  <select
                    value={filterCommodity}
                    onChange={(e) => setFilterCommodity(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      filterCommodity !== 'all' ? 'border-blue-400 bg-blue-50 text-blue-800 font-medium' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="all">Todos los commodities</option>
                    {uniqueCommodities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Contraparte
                  </label>
                  <select
                    value={filterCounterparty}
                    onChange={(e) => setFilterCounterparty(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      filterCounterparty !== 'all' ? 'border-blue-400 bg-blue-50 text-blue-800 font-medium' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="all">Todas las contrapartes</option>
                    {uniqueCounterparties.map(cp => (
                      <option key={cp} value={cp}>{cp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Tipo de Contrato
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      filterType !== 'all' ? 'border-blue-400 bg-blue-50 text-blue-800 font-medium' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="purchase">Compra</option>
                    <option value="sale">Venta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Año de Creacion
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      filterYear !== 'all' ? 'border-blue-400 bg-blue-50 text-blue-800 font-medium' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="all">Todos los años</option>
                    {uniqueYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              {activeAdvancedFiltersCount > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {activeAdvancedFiltersCount} filtro{activeAdvancedFiltersCount !== 1 ? 's' : ''} avanzado{activeAdvancedFiltersCount !== 1 ? 's' : ''} activo{activeAdvancedFiltersCount !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={clearAdvancedFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Limpiar filtros avanzados
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contraparte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período de Entrega</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span>Cargando contratos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No se encontraron contratos</p>
                      <p className="text-gray-400">Intenta ajustar tus criterios de búsqueda o filtros</p>
                    </td>
                  </tr>
                ) : (
                  filteredParents.map(contract => renderContractRow(contract, false))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractList;

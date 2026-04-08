import React, { useState, useEffect } from 'react';
import { X, GitCompare, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdendaValidationProps {
  adendaId: string;
  onClose: () => void;
}

interface ContractData {
  id: string;
  contract_number: string;
  contract_type: string;
  start_month: string;
  end_month: string;
  delivery_location: string;
  observations: string | null;
  rollback_applies: boolean;
  rollback_value: number | null;
  rollback_unit: string | null;
  waste_applies: string;
  waste_value: number | null;
  waste_unit: string | null;
  assay_structure: string | null;
  assay_final_lab: string | null;
  assay_cost_type: string | null;
  sampling_reference: string | null;
  processing_escalator_value: number | null;
  processing_escalator_unit: string | null;
  refining_escalator_value: number | null;
  refining_escalator_unit: string | null;
  vendor?: { name: string } | null;
  buyer?: { name: string } | null;
  product?: { name: string } | null;
  incoterm?: { code: string; description: string } | null;
  sampling_formula?: { name: string } | null;
  contract_quotas?: { month: string; tmh: number; tms: number; h2o_percentage: number }[];
  contract_payables?: { formula?: { name: string }; metal: string; deduction_value: number; deduction_unit: string; balance_percentage: number }[];
  contract_processing?: { formula?: { name: string }; value: number | null; unit: string | null }[];
  contract_penalties?: { formula?: { name: string }; metal: string; amount_usd: number; lower_limit: number; lower_limit_unit: string; upper_limit: number; upper_limit_unit: string }[];
  contract_quality_specs?: { metal: string; spec_type: string; min_value: number | null; max_value: number | null; unit: string }[];
  contract_refining_expenses?: { formula?: { name: string }; metal: string; amount_usd: number; unit: string }[];
  payment_terms?: { payment_type: string; advance_percentage: number; known_elements: string; days_from_issuance: number }[];
  contract_quotation_periods?: { formula: string; months: number; metal: string; day_type: string }[];
}

interface DiffSection {
  label: string;
  original: string;
  adenda: string;
  changed: boolean;
}

const AdendaValidation: React.FC<AdendaValidationProps> = ({ adendaId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<ContractData | null>(null);
  const [adenda, setAdenda] = useState<ContractData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [adendaId]);

  useEffect(() => {
    if (!parent || !adenda) return;
    const allSections = [
      { id: 'basic', diffs: buildBasicDiffs() },
      { id: 'quantity', diffs: buildQuantityDiffs() },
      { id: 'rollback', diffs: buildRollbackDiffs() },
      { id: 'waste', diffs: buildWasteDiffs() },
      { id: 'payables', diffs: buildPayablesDiffs() },
      { id: 'processing', diffs: buildProcessingDiffs() },
      { id: 'refining', diffs: buildRefiningDiffs() },
      { id: 'penalties', diffs: buildPenaltiesDiffs() },
      { id: 'quality', diffs: buildQualityDiffs() },
      { id: 'payments', diffs: buildPaymentDiffs() },
    ];
    const withChanges = allSections
      .filter(s => s.diffs.some(d => d.changed))
      .map(s => s.id);
    setExpandedSections(new Set(withChanges.length > 0 ? withChanges : ['basic']));
  }, [parent, adenda]);

  const loadData = async () => {
    try {
      const selectQuery = `
        *,
        vendor:vendors(id, name),
        buyer:buyers(id, name),
        product:products(id, name),
        incoterm:incoterms(code, description),
        sampling_formula:sampling_formulas(name),
        contract_quotas(month, tmh, tms, h2o_percentage),
        contract_payables(formula:payable_formulas(name), metal, deduction_value, deduction_unit, balance_percentage),
        contract_processing(formula:processing_formulas(name), value, unit),
        contract_penalties(formula:penalty_formulas(name), metal, amount_usd, lower_limit, lower_limit_unit, upper_limit, upper_limit_unit),
        contract_quality_specs(metal, spec_type, min_value, max_value, unit),
        contract_refining_expenses(formula:refining_expense_formulas(name), metal, amount_usd, unit),
        payment_terms(payment_type, advance_percentage, known_elements, days_from_issuance),
        contract_quotation_periods(formula, months, metal, day_type)
      `;

      const { data: adendaData, error: adendaError } = await supabase
        .from('contracts')
        .select(selectQuery)
        .eq('id', adendaId)
        .single();

      if (adendaError) throw adendaError;
      setAdenda(adendaData);

      if (adendaData?.parent_contract_id) {
        const { data: parentData, error: parentError } = await supabase
          .from('contracts')
          .select(selectQuery)
          .eq('id', adendaData.parent_contract_id)
          .single();

        if (parentError) throw parentError;
        setParent(parentData);
      }
    } catch (error) {
      console.error('Error loading validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const formatMonth = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const buildBasicDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    return [
      {
        label: 'Tipo de Contrato',
        original: parent.contract_type === 'purchase' ? 'Compra' : 'Venta',
        adenda: adenda.contract_type === 'purchase' ? 'Compra' : 'Venta',
        changed: parent.contract_type !== adenda.contract_type,
      },
      {
        label: 'Vendedor',
        original: parent.vendor?.name || '-',
        adenda: adenda.vendor?.name || '-',
        changed: parent.vendor?.name !== adenda.vendor?.name,
      },
      {
        label: 'Comprador',
        original: parent.buyer?.name || '-',
        adenda: adenda.buyer?.name || '-',
        changed: parent.buyer?.name !== adenda.buyer?.name,
      },
      {
        label: 'Producto',
        original: parent.product?.name || '-',
        adenda: adenda.product?.name || '-',
        changed: parent.product?.name !== adenda.product?.name,
      },
      {
        label: 'Desde (Mes/Año)',
        original: formatMonth(parent.start_month),
        adenda: formatMonth(adenda.start_month),
        changed: parent.start_month !== adenda.start_month,
      },
      {
        label: 'Hasta (Mes/Año)',
        original: formatMonth(parent.end_month),
        adenda: formatMonth(adenda.end_month),
        changed: parent.end_month !== adenda.end_month,
      },
      {
        label: 'Incoterm',
        original: parent.incoterm ? `${parent.incoterm.code} - ${parent.incoterm.description}` : '-',
        adenda: adenda.incoterm ? `${adenda.incoterm.code} - ${adenda.incoterm.description}` : '-',
        changed: JSON.stringify(parent.incoterm) !== JSON.stringify(adenda.incoterm),
      },
      {
        label: 'Lugar de Entrega',
        original: parent.delivery_location || '-',
        adenda: adenda.delivery_location || '-',
        changed: parent.delivery_location !== adenda.delivery_location,
      },
      {
        label: 'Observaciones',
        original: parent.observations || '-',
        adenda: adenda.observations || '-',
        changed: parent.observations !== adenda.observations,
      },
    ];
  };

  const buildQuantityDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const parentTmh = (parent.contract_quotas || []).reduce((s, q) => s + (q.tmh || 0), 0);
    const adendaTmh = (adenda.contract_quotas || []).reduce((s, q) => s + (q.tmh || 0), 0);
    const parentTms = (parent.contract_quotas || []).reduce((s, q) => s + (q.tms || 0), 0);
    const adendaTms = (adenda.contract_quotas || []).reduce((s, q) => s + (q.tms || 0), 0);
    return [
      {
        label: 'Total TMH',
        original: parentTmh.toFixed(2),
        adenda: adendaTmh.toFixed(2),
        changed: Math.abs(parentTmh - adendaTmh) > 0.001,
      },
      {
        label: 'Total TMS',
        original: parentTms.toFixed(2),
        adenda: adendaTms.toFixed(2),
        changed: Math.abs(parentTms - adendaTms) > 0.001,
      },
    ];
  };

  const buildRollbackDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    return [
      {
        label: 'Aplica Rollback',
        original: parent.rollback_applies ? 'Sí' : 'No',
        adenda: adenda.rollback_applies ? 'Sí' : 'No',
        changed: parent.rollback_applies !== adenda.rollback_applies,
      },
      {
        label: 'Valor Rollback',
        original: parent.rollback_value != null ? `${parent.rollback_value} ${parent.rollback_unit || ''}` : '-',
        adenda: adenda.rollback_value != null ? `${adenda.rollback_value} ${adenda.rollback_unit || ''}` : '-',
        changed: parent.rollback_value !== adenda.rollback_value || parent.rollback_unit !== adenda.rollback_unit,
      },
    ];
  };

  const buildWasteDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    return [
      {
        label: 'Merma',
        original: parent.waste_applies === 'aplica' ? `${parent.waste_value ?? '-'} ${parent.waste_unit || ''}` : 'No Aplica',
        adenda: adenda.waste_applies === 'aplica' ? `${adenda.waste_value ?? '-'} ${adenda.waste_unit || ''}` : 'No Aplica',
        changed: parent.waste_applies !== adenda.waste_applies || parent.waste_value !== adenda.waste_value || parent.waste_unit !== adenda.waste_unit,
      },
    ];
  };

  const buildPayablesDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const pStr = JSON.stringify((parent.contract_payables || []).map(p => `${p.formula?.name}|${p.metal}|${p.deduction_value}|${p.deduction_unit}|${p.balance_percentage}`).sort());
    const aStr = JSON.stringify((adenda.contract_payables || []).map(p => `${p.formula?.name}|${p.metal}|${p.deduction_value}|${p.deduction_unit}|${p.balance_percentage}`).sort());
    return [{
      label: 'Pagables',
      original: (parent.contract_payables || []).map(p => `${p.formula?.name || '-'} | ${p.metal} | ${p.deduction_value}${p.deduction_unit} | ${p.balance_percentage}%`).join('\n') || '-',
      adenda: (adenda.contract_payables || []).map(p => `${p.formula?.name || '-'} | ${p.metal} | ${p.deduction_value}${p.deduction_unit} | ${p.balance_percentage}%`).join('\n') || '-',
      changed: pStr !== aStr,
    }];
  };

  const buildProcessingDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const pStr = JSON.stringify((parent.contract_processing || []).map(p => `${p.formula?.name}|${p.value}|${p.unit}`).sort());
    const aStr = JSON.stringify((adenda.contract_processing || []).map(p => `${p.formula?.name}|${p.value}|${p.unit}`).sort());
    return [
      {
        label: 'Maquila',
        original: (parent.contract_processing || []).map(p => `${p.formula?.name || '-'} | ${p.value ?? '-'} ${p.unit || ''}`).join('\n') || '-',
        adenda: (adenda.contract_processing || []).map(p => `${p.formula?.name || '-'} | ${p.value ?? '-'} ${p.unit || ''}`).join('\n') || '-',
        changed: pStr !== aStr,
      },
      {
        label: 'Escalador Maquila',
        original: parent.processing_escalator_value != null ? `${parent.processing_escalator_value} ${parent.processing_escalator_unit || ''}` : 'No Aplica',
        adenda: adenda.processing_escalator_value != null ? `${adenda.processing_escalator_value} ${adenda.processing_escalator_unit || ''}` : 'No Aplica',
        changed: parent.processing_escalator_value !== adenda.processing_escalator_value,
      },
    ];
  };

  const buildRefiningDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const pStr = JSON.stringify((parent.contract_refining_expenses || []).map(p => `${p.formula?.name}|${p.metal}|${p.amount_usd}|${p.unit}`).sort());
    const aStr = JSON.stringify((adenda.contract_refining_expenses || []).map(p => `${p.formula?.name}|${p.metal}|${p.amount_usd}|${p.unit}`).sort());
    return [
      {
        label: 'Gastos de Refinación',
        original: (parent.contract_refining_expenses || []).map(p => `${p.formula?.name || '-'} | ${p.metal} | ${p.amount_usd} ${p.unit}`).join('\n') || '-',
        adenda: (adenda.contract_refining_expenses || []).map(p => `${p.formula?.name || '-'} | ${p.metal} | ${p.amount_usd} ${p.unit}`).join('\n') || '-',
        changed: pStr !== aStr,
      },
      {
        label: 'Escalador Refinación',
        original: parent.refining_escalator_value != null ? `${parent.refining_escalator_value} ${parent.refining_escalator_unit || ''}` : 'No Aplica',
        adenda: adenda.refining_escalator_value != null ? `${adenda.refining_escalator_value} ${adenda.refining_escalator_unit || ''}` : 'No Aplica',
        changed: parent.refining_escalator_value !== adenda.refining_escalator_value,
      },
    ];
  };

  const buildPenaltiesDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const pStr = JSON.stringify((parent.contract_penalties || []).map(p => `${p.formula?.name}|${p.metal}|${p.amount_usd}|${p.lower_limit}|${p.upper_limit}`).sort());
    const aStr = JSON.stringify((adenda.contract_penalties || []).map(p => `${p.formula?.name}|${p.metal}|${p.amount_usd}|${p.lower_limit}|${p.upper_limit}`).sort());
    return [{
      label: 'Penalidades',
      original: (parent.contract_penalties || []).map(p => `${p.formula?.name || '-'} | ${p.metal} | $${p.amount_usd} | ${p.lower_limit}${p.lower_limit_unit}–${p.upper_limit}${p.upper_limit_unit}`).join('\n') || '-',
      adenda: (adenda.contract_penalties || []).map(p => `${p.formula?.name || '-'} | ${p.metal} | $${p.amount_usd} | ${p.lower_limit}${p.lower_limit_unit}–${p.upper_limit}${p.upper_limit_unit}`).join('\n') || '-',
      changed: pStr !== aStr,
    }];
  };

  const buildQualityDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const pStr = JSON.stringify((parent.contract_quality_specs || []).map(p => `${p.metal}|${p.spec_type}|${p.min_value}|${p.max_value}|${p.unit}`).sort());
    const aStr = JSON.stringify((adenda.contract_quality_specs || []).map(p => `${p.metal}|${p.spec_type}|${p.min_value}|${p.max_value}|${p.unit}`).sort());
    return [{
      label: 'Calidad / Granulometría',
      original: (parent.contract_quality_specs || []).map(p => `${p.metal} | ${p.spec_type} | ${p.min_value ?? '-'}–${p.max_value ?? '-'} ${p.unit}`).join('\n') || '-',
      adenda: (adenda.contract_quality_specs || []).map(p => `${p.metal} | ${p.spec_type} | ${p.min_value ?? '-'}–${p.max_value ?? '-'} ${p.unit}`).join('\n') || '-',
      changed: pStr !== aStr,
    }];
  };

  const buildPaymentDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const pStr = JSON.stringify((parent.payment_terms || []).map(p => `${p.payment_type}|${p.advance_percentage}|${p.days_from_issuance}`).sort());
    const aStr = JSON.stringify((adenda.payment_terms || []).map(p => `${p.payment_type}|${p.advance_percentage}|${p.days_from_issuance}`).sort());
    return [{
      label: 'Términos de Pago',
      original: (parent.payment_terms || []).map(p => `${p.payment_type === 'provisional' ? 'Provisional' : 'Final'} | ${p.advance_percentage}% | ${p.days_from_issuance} días`).join('\n') || '-',
      adenda: (adenda.payment_terms || []).map(p => `${p.payment_type === 'provisional' ? 'Provisional' : 'Final'} | ${p.advance_percentage}% | ${p.days_from_issuance} días`).join('\n') || '-',
      changed: pStr !== aStr,
    }];
  };

  const sections = [
    { id: 'basic', label: 'Información Básica', diffs: buildBasicDiffs() },
    { id: 'quantity', label: 'Cantidades', diffs: buildQuantityDiffs() },
    { id: 'rollback', label: 'Rollback', diffs: buildRollbackDiffs() },
    { id: 'waste', label: 'Merma', diffs: buildWasteDiffs() },
    { id: 'payables', label: 'Pagables', diffs: buildPayablesDiffs() },
    { id: 'processing', label: 'Maquila', diffs: buildProcessingDiffs() },
    { id: 'refining', label: 'Gastos de Refinación', diffs: buildRefiningDiffs() },
    { id: 'penalties', label: 'Penalidades', diffs: buildPenaltiesDiffs() },
    { id: 'quality', label: 'Calidad', diffs: buildQualityDiffs() },
    { id: 'payments', label: 'Pagos', diffs: buildPaymentDiffs() },
  ];

  const totalChanges = sections.reduce((acc, s) => acc + s.diffs.filter(d => d.changed).length, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <GitCompare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Validación de Adenda</h2>
              {adenda && parent && (
                <p className="text-sm text-gray-500">
                  Comparando <span className="font-medium text-gray-700">{parent.contract_number}</span> vs <span className="font-medium text-blue-600">{adenda.contract_number}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!loading && (
              <div className="flex items-center space-x-2">
                {totalChanges > 0 ? (
                  <span className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="w-4 h-4 mr-1.5" />
                    {totalChanges} cambio{totalChanges !== 1 ? 's' : ''} detectado{totalChanges !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Sin cambios
                  </span>
                )}
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 px-6 py-3 bg-blue-50 border-b border-blue-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Contrato Principal</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{parent?.contract_number}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Adenda</p>
                <p className="text-sm font-bold text-blue-700 mt-0.5">{adenda?.contract_number}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {sections.map(section => {
                const sectionChanges = section.diffs.filter(d => d.changed).length;
                const isExpanded = expandedSections.has(section.id);
                return (
                  <div key={section.id} className={`rounded-lg border ${sectionChanges > 0 ? 'border-amber-200' : 'border-gray-200'}`}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${sectionChanges > 0 ? 'bg-amber-50 hover:bg-amber-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center space-x-3">
                        {sectionChanges > 0 ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        <span className="font-semibold text-sm text-gray-800">{section.label}</span>
                        {sectionChanges > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            {sectionChanges} cambio{sectionChanges !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {section.diffs.map((diff, idx) => (
                          <div key={idx} className={`grid grid-cols-3 gap-2 px-4 py-3 ${diff.changed ? 'bg-amber-50/50' : ''}`}>
                            <div className="text-xs font-medium text-gray-600 flex items-start pt-0.5">
                              {diff.label}
                              {diff.changed && <span className="ml-2 w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 flex-shrink-0"></span>}
                            </div>
                            <div className={`text-xs rounded px-2 py-1.5 ${diff.changed ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-gray-50 text-gray-700'} whitespace-pre-line`}>
                              {diff.original || '-'}
                            </div>
                            <div className={`text-xs rounded px-2 py-1.5 ${diff.changed ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50 text-gray-700'} whitespace-pre-line`}>
                              {diff.adenda || '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdendaValidation;

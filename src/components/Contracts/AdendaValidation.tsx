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
  parent_contract_id?: string | null;
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
  contract_quotation_periods?: { formula: string; months: number; metal: string; day_type: string; buyer_optionality: boolean; seller_optionality: boolean }[];
}

interface DiffSection {
  label: string;
  original: string;
  adenda: string;
  changed: boolean;
}

const computeChangedSections = (p: ContractData, a: ContractData): string[] => {
  const changed: string[] = [];

  const basicChanged =
    p.contract_type !== a.contract_type ||
    p.vendor?.name !== a.vendor?.name ||
    p.buyer?.name !== a.buyer?.name ||
    p.product?.name !== a.product?.name ||
    p.start_month !== a.start_month ||
    p.end_month !== a.end_month ||
    JSON.stringify(p.incoterm) !== JSON.stringify(a.incoterm) ||
    p.delivery_location !== a.delivery_location ||
    p.observations !== a.observations;
  if (basicChanged) changed.push('basic');

  const pTmh = (p.contract_quotas || []).reduce((s, q) => s + (q.tmh || 0), 0);
  const aTmh = (a.contract_quotas || []).reduce((s, q) => s + (q.tmh || 0), 0);
  const pTms = (p.contract_quotas || []).reduce((s, q) => s + (q.tms || 0), 0);
  const aTms = (a.contract_quotas || []).reduce((s, q) => s + (q.tms || 0), 0);
  if (Math.abs(pTmh - aTmh) > 0.001 || Math.abs(pTms - aTms) > 0.001) changed.push('quantity');

  if (p.rollback_applies !== a.rollback_applies || p.rollback_value !== a.rollback_value || p.rollback_unit !== a.rollback_unit) changed.push('rollback');

  if (p.waste_applies !== a.waste_applies || p.waste_value !== a.waste_value || p.waste_unit !== a.waste_unit) changed.push('waste');

  const pPay = JSON.stringify((p.contract_payables || []).map(x => `${x.formula?.name}|${x.metal}|${x.deduction_value}|${x.deduction_unit}|${x.balance_percentage}`).sort());
  const aPay = JSON.stringify((a.contract_payables || []).map(x => `${x.formula?.name}|${x.metal}|${x.deduction_value}|${x.deduction_unit}|${x.balance_percentage}`).sort());
  if (pPay !== aPay) changed.push('payables');

  const pProc = JSON.stringify((p.contract_processing || []).map(x => `${x.formula?.name}|${x.value}|${x.unit}`).sort());
  const aProc = JSON.stringify((a.contract_processing || []).map(x => `${x.formula?.name}|${x.value}|${x.unit}`).sort());
  if (pProc !== aProc || p.processing_escalator_value !== a.processing_escalator_value) changed.push('processing');

  const pRef = JSON.stringify((p.contract_refining_expenses || []).map(x => `${x.formula?.name}|${x.metal}|${x.amount_usd}|${x.unit}`).sort());
  const aRef = JSON.stringify((a.contract_refining_expenses || []).map(x => `${x.formula?.name}|${x.metal}|${x.amount_usd}|${x.unit}`).sort());
  if (pRef !== aRef || p.refining_escalator_value !== a.refining_escalator_value) changed.push('refining');

  const pPen = JSON.stringify((p.contract_penalties || []).map(x => `${x.formula?.name}|${x.metal}|${x.amount_usd}|${x.lower_limit}|${x.upper_limit}`).sort());
  const aPen = JSON.stringify((a.contract_penalties || []).map(x => `${x.formula?.name}|${x.metal}|${x.amount_usd}|${x.lower_limit}|${x.upper_limit}`).sort());
  if (pPen !== aPen) changed.push('penalties');

  const pQual = JSON.stringify((p.contract_quality_specs || []).map(x => `${x.metal}|${x.spec_type}|${x.min_value}|${x.max_value}|${x.unit}`).sort());
  const aQual = JSON.stringify((a.contract_quality_specs || []).map(x => `${x.metal}|${x.spec_type}|${x.min_value}|${x.max_value}|${x.unit}`).sort());
  if (pQual !== aQual) changed.push('quality');

  const pPmt = JSON.stringify((p.payment_terms || []).map(x => `${x.payment_type}|${x.advance_percentage}|${x.days_from_issuance}`).sort());
  const aPmt = JSON.stringify((a.payment_terms || []).map(x => `${x.payment_type}|${x.advance_percentage}|${x.days_from_issuance}`).sort());
  if (pPmt !== aPmt) changed.push('payments');

  const pPer = JSON.stringify((p.contract_quotation_periods || []).map(x => `${x.formula}|${x.months}|${x.metal}|${x.day_type}|${x.buyer_optionality}|${x.seller_optionality}`).sort());
  const aPer = JSON.stringify((a.contract_quotation_periods || []).map(x => `${x.formula}|${x.months}|${x.metal}|${x.day_type}|${x.buyer_optionality}|${x.seller_optionality}`).sort());
  if (pPer !== aPer) changed.push('periods');

  return changed;
};

const AdendaValidation: React.FC<AdendaValidationProps> = ({ adendaId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<ContractData | null>(null);
  const [adenda, setAdenda] = useState<ContractData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [adendaId]);

  const fetchContractWithRelated = async (contractId: string): Promise<ContractData | null> => {
    const { data: base, error: baseErr } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();
    if (baseErr || !base) {
      console.error('[AdendaValidation] base query error for', contractId, baseErr);
      return null;
    }

    const [
      vendorRes, buyerRes, productRes, incotermRes,
      quotas, payables, processing, penalties, quality, refining, payments, periods,
    ] = await Promise.all([
      base.vendor_id ? supabase.from('vendors').select('name').eq('id', base.vendor_id).maybeSingle() : Promise.resolve({ data: null }),
      base.buyer_id ? supabase.from('buyers').select('name').eq('id', base.buyer_id).maybeSingle() : Promise.resolve({ data: null }),
      base.product_id ? supabase.from('products').select('name').eq('id', base.product_id).maybeSingle() : Promise.resolve({ data: null }),
      base.incoterm_id ? supabase.from('incoterms').select('code, description').eq('id', base.incoterm_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from('contract_quotas').select('month, tmh, tms, h2o_percentage').eq('contract_id', contractId),
      supabase.from('contract_payables').select('metal, deduction_value, deduction_unit, balance_percentage, payable_formulas(name)').eq('contract_id', contractId),
      supabase.from('contract_processing').select('value, unit, processing_formulas(name)').eq('contract_id', contractId),
      supabase.from('contract_penalties').select('metal, amount_usd, lower_limit, lower_limit_unit, upper_limit, upper_limit_unit, penalty_formulas(name)').eq('contract_id', contractId),
      supabase.from('contract_quality_specs').select('metal, spec_type, min_value, max_value, unit').eq('contract_id', contractId),
      supabase.from('contract_refining_expenses').select('metal, amount_usd, unit, refining_expense_formulas(name)').eq('contract_id', contractId),
      supabase.from('payment_terms').select('payment_type, advance_percentage, known_elements, days_from_issuance').eq('contract_id', contractId),
      supabase.from('contract_quotation_periods').select('formula, months, metal, day_type, buyer_optionality, seller_optionality').eq('contract_id', contractId).order('display_order'),
    ]);

    const nd = (d: unknown) => (typeof d === 'string' ? d.slice(0, 10) : String(d ?? ''));
    const n = (v: unknown) => (v != null && v !== '' ? Number(v) : null);
    const s = (v: unknown) => (v == null || v === '' ? null : String(v));

    const fmtFormula = (row: Record<string, unknown>, fkTable: string) => {
      const fData = row[fkTable] as Record<string, unknown> | null;
      return fData ? { name: String(fData.name ?? '') } : undefined;
    };

    return {
      id: base.id,
      contract_number: base.contract_number,
      contract_type: base.contract_type,
      start_month: nd(base.start_month),
      end_month: nd(base.end_month),
      delivery_location: s(base.delivery_location) ?? '',
      observations: s(base.observations),
      rollback_applies: !!base.rollback_applies,
      rollback_value: n(base.rollback_value),
      rollback_unit: s(base.rollback_unit),
      waste_applies: String(base.waste_applies ?? 'no_aplica'),
      waste_value: n(base.waste_value),
      waste_unit: s(base.waste_unit),
      assay_structure: s(base.assay_structure),
      assay_final_lab: s(base.assay_final_lab),
      assay_cost_type: s(base.assay_cost_type),
      sampling_reference: s(base.sampling_reference),
      processing_escalator_value: n(base.processing_escalator_value),
      processing_escalator_unit: s(base.processing_escalator_unit),
      refining_escalator_value: n(base.refining_escalator_value),
      refining_escalator_unit: s(base.refining_escalator_unit),
      parent_contract_id: s(base.parent_contract_id),
      vendor: vendorRes.data as { name: string } | null,
      buyer: buyerRes.data as { name: string } | null,
      product: productRes.data as { name: string } | null,
      incoterm: incotermRes.data as { code: string; description: string } | null,
      contract_quotas: (quotas.data || []).map(q => ({
        month: nd(q.month),
        tmh: Number(q.tmh),
        tms: Number(q.tms),
        h2o_percentage: Number(q.h2o_percentage),
      })),
      contract_payables: (payables.data || []).map(p => ({
        formula: fmtFormula(p as unknown as Record<string, unknown>, 'payable_formulas'),
        metal: String(p.metal),
        deduction_value: Number(p.deduction_value),
        deduction_unit: String(p.deduction_unit),
        balance_percentage: Number(p.balance_percentage),
      })),
      contract_processing: (processing.data || []).map(p => ({
        formula: fmtFormula(p as unknown as Record<string, unknown>, 'processing_formulas'),
        value: n(p.value),
        unit: s(p.unit),
      })),
      contract_penalties: (penalties.data || []).map(p => ({
        formula: fmtFormula(p as unknown as Record<string, unknown>, 'penalty_formulas'),
        metal: String(p.metal),
        amount_usd: Number(p.amount_usd),
        lower_limit: Number(p.lower_limit),
        lower_limit_unit: String(p.lower_limit_unit),
        upper_limit: Number(p.upper_limit),
        upper_limit_unit: String(p.upper_limit_unit),
      })),
      contract_quality_specs: (quality.data || []).map(q => ({
        metal: String(q.metal),
        spec_type: String(q.spec_type),
        min_value: n(q.min_value),
        max_value: n(q.max_value),
        unit: String(q.unit),
      })),
      contract_refining_expenses: (refining.data || []).map(r => ({
        formula: fmtFormula(r as unknown as Record<string, unknown>, 'refining_expense_formulas'),
        metal: String(r.metal),
        amount_usd: Number(r.amount_usd),
        unit: String(r.unit),
      })),
      payment_terms: (payments.data || []).map(p => ({
        payment_type: String(p.payment_type),
        advance_percentage: Number(p.advance_percentage),
        known_elements: String(p.known_elements ?? ''),
        days_from_issuance: Number(p.days_from_issuance),
      })),
      contract_quotation_periods: (periods.data || []).map(p => ({
        formula: String(p.formula),
        months: Number(p.months),
        metal: String(p.metal),
        day_type: String(p.day_type),
        buyer_optionality: !!p.buyer_optionality,
        seller_optionality: !!p.seller_optionality,
      })),
    };
  };

  const loadData = async () => {
    try {
      const adendaResult = await fetchContractWithRelated(adendaId);
      console.debug('[AdendaValidation] adendaResult=', adendaResult);
      if (!adendaResult) throw new Error('No se pudo cargar la adenda');

      let parentData: ContractData | null = null;
      if (adendaResult.parent_contract_id) {
        parentData = await fetchContractWithRelated(adendaResult.parent_contract_id);
        console.debug('[AdendaValidation] parentData via parent_contract_id=', parentData?.contract_number);
      } else {
        const baseNumber = adendaResult.contract_number.replace(/-\d+$/, '');
        const { data: parentRow } = await supabase
          .from('contracts')
          .select('id')
          .eq('contract_number', baseNumber)
          .maybeSingle();
        if (parentRow) {
          parentData = await fetchContractWithRelated(parentRow.id);
          console.debug('[AdendaValidation] parentData via contract_number=', parentData?.contract_number);
        } else {
          console.warn('[AdendaValidation] no parent found for', adendaResult.contract_number);
        }
      }

      setAdenda(adendaResult);
      setParent(parentData);

      if (adendaResult && parentData) {
        const changed = computeChangedSections(parentData, adendaResult);
        console.debug('[AdendaValidation] changed sections=', changed);
        setExpandedSections(new Set(changed.length > 0 ? changed : ['basic']));
      } else {
        setExpandedSections(new Set(['basic']));
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
    const parentQuotas = parent.contract_quotas || [];
    const adendaQuotas = adenda.contract_quotas || [];
    const parentTmh = parentQuotas.reduce((s, q) => s + Number(q.tmh), 0);
    const adendaTmh = adendaQuotas.reduce((s, q) => s + Number(q.tmh), 0);
    const parentTms = parentQuotas.reduce((s, q) => s + Number(q.tms), 0);
    const adendaTms = adendaQuotas.reduce((s, q) => s + Number(q.tms), 0);

    const fmtQuotas = (quotas: ContractData['contract_quotas']) =>
      (quotas || []).map(q => `${q.month} | TMH: ${Number(q.tmh).toFixed(2)} | TMS: ${Number(q.tms).toFixed(2)} | H2O: ${Number(q.h2o_percentage).toFixed(2)}%`).join('\n') || '-';

    const pQuotaStr = JSON.stringify(parentQuotas.map(q => `${q.month}|${Number(q.tmh)}|${Number(q.tms)}|${Number(q.h2o_percentage)}`).sort());
    const aQuotaStr = JSON.stringify(adendaQuotas.map(q => `${q.month}|${Number(q.tmh)}|${Number(q.tms)}|${Number(q.h2o_percentage)}`).sort());

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
      {
        label: 'Detalle por Mes',
        original: fmtQuotas(parentQuotas),
        adenda: fmtQuotas(adendaQuotas),
        changed: pQuotaStr !== aQuotaStr,
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

  const buildQuotationPeriodsDiffs = (): DiffSection[] => {
    if (!parent || !adenda) return [];
    const fmt = (periods: ContractData['contract_quotation_periods']) =>
      (periods || []).map(p => {
        const opts = [p.buyer_optionality ? 'Opción Comprador' : '', p.seller_optionality ? 'Opción Vendedor' : ''].filter(Boolean).join(', ');
        return `${p.formula} | ${p.metal} | ${p.months} mes(es) | ${p.day_type}${opts ? ` | ${opts}` : ''}`;
      }).join('\n') || '-';
    const pStr = JSON.stringify((parent.contract_quotation_periods || []).map(x => `${x.formula}|${x.months}|${x.metal}|${x.day_type}|${x.buyer_optionality}|${x.seller_optionality}`).sort());
    const aStr = JSON.stringify((adenda.contract_quotation_periods || []).map(x => `${x.formula}|${x.months}|${x.metal}|${x.day_type}|${x.buyer_optionality}|${x.seller_optionality}`).sort());
    return [{
      label: 'Períodos de Cotización',
      original: fmt(parent.contract_quotation_periods),
      adenda: fmt(adenda.contract_quotation_periods),
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
    { id: 'periods', label: 'Períodos de Cotización', diffs: buildQuotationPeriodsDiffs() },
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

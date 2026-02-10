import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Check, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContractFormProps {
  onClose: () => void;
  onSuccess: () => void;
  templateId?: string | null;
}

interface FormData {
  contractType: 'purchase' | 'sale';
  vendorId: string;
  buyerId: string;
  productId: string;
  countryId: string;
  startMonth: string;
  endMonth: string;
  quotas: QuotaData[];
  incotermId: string;
  deliveryLocation: string;
  payables: PayableData[];
  penalties: PenaltyData[];
  qualitySpecs: QualitySpecData[];
  refiningExpenses: RefiningExpenseData[];
}

interface QuotaData {
  month: string;
  tmh: string;
  tms: string;
  h2oPercentage: string;
}

interface Vendor {
  id: string;
  name: string;
  tax_id: string;
}

interface Buyer {
  id: string;
  name: string;
  tax_id: string;
}

interface Product {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Incoterm {
  id: string;
  code: string;
  description: string;
}

interface PayableFormula {
  id: string;
  name: string;
  description: string;
  is_deduction: boolean;
}

interface MarketIndex {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface PayableData {
  id: string;
  formulaId: string;
  metal: 'CU' | 'AG' | 'AU';
  deductionValue: string;
  deductionUnit: '%' | 'g/tms';
  balancePercentage: string;
  marketIndexId: string;
}

interface PenaltyData {
  id: string;
  formulaId: string;
  metal: string;
  amountUsd: string;
  lowerLimit: string;
  lowerLimitUnit: string;
  upperLimit: string;
  upperLimitUnit: string;
}

interface QualitySpecData {
  id: string;
  metal: string;
  specType: 'range' | 'minimum' | 'maximum';
  minValue: string;
  maxValue: string;
  unit: string;
}

interface RefiningExpenseData {
  id: string;
  formulaId: string;
  metal: string;
  amountUsd: string;
  unit: string;
}

interface PenaltyFormula {
  id: string;
  name: string;
  description: string;
}

interface RefiningExpenseFormula {
  id: string;
  name: string;
  description: string;
}

const SECTIONS = [
  { id: 'basic', label: 'Información Básica/Cantidad/Plazo' },
  { id: 'incoterm', label: 'Incoterm Entrega' },
  { id: 'rollback', label: 'Rollback' },
  { id: 'quality', label: 'Calidad / Granulometría' },
  { id: 'payables', label: 'Pagables' },
  { id: 'processing', label: 'Maquila' },
  { id: 'processing-escalator', label: 'Escalador en Maquila' },
  { id: 'refining', label: 'Gastos de Refinación' },
  { id: 'refining-escalator', label: 'Escalador en Gastos de Refinación' },
  { id: 'penalties', label: 'Penalidades' },
  { id: 'payments', label: 'Pagos' },
  { id: 'quotation-period', label: 'Periodo de Cotizaciones' },
  { id: 'weight-sampling', label: 'Muestreo Pesos' },
  { id: 'assay-sampling', label: 'Muestreo Ensayes' },
  { id: 'waste', label: 'Merma' },
];

const ContractForm: React.FC<ContractFormProps> = ({ onClose, onSuccess, templateId }) => {
  const [currentSection, setCurrentSection] = useState('basic');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [incoterms, setIncoterms] = useState<Incoterm[]>([]);
  const [payableFormulas, setPayableFormulas] = useState<PayableFormula[]>([]);
  const [penaltyFormulas, setPenaltyFormulas] = useState<PenaltyFormula[]>([]);
  const [refiningExpenseFormulas, setRefiningExpenseFormulas] = useState<RefiningExpenseFormula[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    contractType: 'purchase',
    vendorId: '',
    buyerId: '',
    productId: '',
    countryId: '',
    startMonth: '',
    endMonth: '',
    quotas: [],
    incotermId: '',
    deliveryLocation: '',
    payables: [],
    penalties: [],
    qualitySpecs: [],
    refiningExpenses: [],
  });

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (templateId) {
      loadTemplateData(templateId);
    }
  }, [templateId]);

  useEffect(() => {
    if (formData.startMonth && formData.endMonth) {
      generateQuotas();
    }
  }, [formData.startMonth, formData.endMonth]);

  const loadFormData = async () => {
    try {
      const [vendorsRes, buyersRes, productsRes, countriesRes, incotermsRes, formulasRes, penaltyFormulasRes, refiningExpenseFormulasRes, indicesRes] = await Promise.all([
        supabase.from('vendors').select('*').order('name'),
        supabase.from('buyers').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('incoterms').select('*').order('code'),
        supabase.from('payable_formulas').select('*').order('name'),
        supabase.from('penalty_formulas').select('*').order('name'),
        supabase.from('refining_expense_formulas').select('*').order('name'),
        supabase.from('market_indices').select('*').order('name'),
      ]);

      if (vendorsRes.data) setVendors(vendorsRes.data);
      if (buyersRes.data) setBuyers(buyersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (formulasRes.data) {
        console.log('Fórmulas cargadas:', formulasRes.data);
        setPayableFormulas(formulasRes.data);
      } else {
        console.error('Error al cargar fórmulas:', formulasRes.error);
      }
      if (penaltyFormulasRes.data) {
        console.log('Fórmulas de penalidades cargadas:', penaltyFormulasRes.data);
        setPenaltyFormulas(penaltyFormulasRes.data);
      } else {
        console.error('Error al cargar fórmulas de penalidades:', penaltyFormulasRes.error);
      }
      if (refiningExpenseFormulasRes.data) {
        console.log('Fórmulas de gastos de refinación cargadas:', refiningExpenseFormulasRes.data);
        setRefiningExpenseFormulas(refiningExpenseFormulasRes.data);
      } else {
        console.error('Error al cargar fórmulas de gastos de refinación:', refiningExpenseFormulasRes.error);
      }
      if (indicesRes.data) {
        console.log('Índices cargados:', indicesRes.data);
        setMarketIndices(indicesRes.data);
      } else {
        console.error('Error al cargar índices:', indicesRes.error);
      }
      if (countriesRes.data) {
        setCountries(countriesRes.data);
        const peru = countriesRes.data.find(c => c.code === 'PE');
        if (peru) {
          setFormData(prev => ({ ...prev, countryId: peru.id }));
        }
      }
      if (incotermsRes.data) setIncoterms(incotermsRes.data);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const loadTemplateData = async (templateId: string) => {
    try {
      const { data: template, error: templateError } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      if (template) {
        const [payablesRes, penaltiesRes, incotermsRes] = await Promise.all([
          supabase
            .from('contract_template_payables')
            .select('*')
            .eq('template_id', templateId),
          supabase
            .from('contract_template_penalties')
            .select('*')
            .eq('template_id', templateId),
          supabase
            .from('incoterms')
            .select('*')
            .eq('code', template.incoterm_code)
            .maybeSingle(),
        ]);

        if (payablesRes.error) throw payablesRes.error;
        if (penaltiesRes.error) throw penaltiesRes.error;

        setFormData(prev => ({
          ...prev,
          contractType: template.contract_type as 'purchase' | 'sale',
          incotermId: incotermsRes.data?.id || '',
          payables: (payablesRes.data || []).map(tp => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            formulaId: tp.formula_id,
            metal: tp.metal as 'CU' | 'AG' | 'AU',
            deductionValue: tp.deduction_value.toString(),
            deductionUnit: tp.deduction_unit as '%' | 'g/tms',
            balancePercentage: tp.balance_percentage.toString(),
            marketIndexId: tp.market_index_id,
          })),
          penalties: (penaltiesRes.data || []).map(tp => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            formulaId: tp.formula_id || '',
            metal: tp.metal || '',
            amountUsd: tp.amount_usd?.toString() || '',
            lowerLimit: tp.lower_limit?.toString() || '',
            lowerLimitUnit: tp.lower_limit_unit || '',
            upperLimit: tp.upper_limit?.toString() || '',
            upperLimitUnit: tp.upper_limit_unit || '',
          })),
        }));
      }
    } catch (error) {
      console.error('Error loading template data:', error);
    }
  };

  const generateQuotas = () => {
    const start = new Date(formData.startMonth + '-01');
    const end = new Date(formData.endMonth + '-01');
    const quotas: QuotaData[] = [];

    let current = new Date(start);
    while (current <= end) {
      const monthStr = current.toISOString().slice(0, 7);
      quotas.push({
        month: monthStr,
        tmh: '330',
        tms: '300',
        h2oPercentage: '10',
      });
      current.setMonth(current.getMonth() + 1);
    }

    setFormData(prev => ({ ...prev, quotas }));
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuota = (index: number, field: keyof QuotaData, value: string) => {
    const newQuotas = [...formData.quotas];
    newQuotas[index] = { ...newQuotas[index], [field]: value };
    setFormData(prev => ({ ...prev, quotas: newQuotas }));
  };

  const addPayable = () => {
    const deductionFormula = payableFormulas.find(f => f.is_deduction);

    if (!deductionFormula) {
      alert('No se encontró la fórmula de deducción. Por favor, recargue la página.');
      console.error('Fórmulas disponibles:', payableFormulas);
      return;
    }

    const newPayable: PayableData = {
      id: `temp-${Date.now()}`,
      formulaId: deductionFormula.id,
      metal: 'CU',
      deductionValue: '',
      deductionUnit: '%',
      balancePercentage: '',
      marketIndexId: '',
    };

    setFormData(prev => ({ ...prev, payables: [...prev.payables, newPayable] }));
  };

  const removePayable = (id: string) => {
    setFormData(prev => ({
      ...prev,
      payables: prev.payables.filter(p => p.id !== id)
    }));
  };

  const updatePayable = (id: string, field: keyof PayableData, value: any) => {
    const newPayables = formData.payables.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setFormData(prev => ({ ...prev, payables: newPayables }));
  };

  const isPayableFormulaNoAplica = (formulaId: string): boolean => {
    const formula = payableFormulas.find(f => f.id === formulaId);
    return formula?.name === 'No Aplica';
  };

  const generateFormulaText = (payable: PayableData): string => {
    if (isPayableFormulaNoAplica(payable.formulaId)) {
      return 'No Aplica';
    }

    const metalName = payable.metal;
    const deduction = payable.deductionValue;
    const unit = payable.deductionUnit;
    const balance = payable.balancePercentage;
    const index = marketIndices.find(i => i.id === payable.marketIndexId);

    if (!deduction || !balance || !index) return '';

    const formula = payableFormulas.find(f => f.id === payable.formulaId);
    const formulaName = formula?.name || '';

    return `${formulaName} - (${metalName}): (Ensaye - ${deduction}${unit}) * ${balance}% ==> Índice ${index.name}`;
  };

  const addPenalty = () => {
    const newPenalty: PenaltyData = {
      id: `temp-${Date.now()}`,
      formulaId: '',
      metal: 'AS',
      amountUsd: '',
      lowerLimit: '',
      lowerLimitUnit: '%',
      upperLimit: '',
      upperLimitUnit: '%',
    };

    setFormData(prev => ({ ...prev, penalties: [...prev.penalties, newPenalty] }));
  };

  const removePenalty = (id: string) => {
    setFormData(prev => ({
      ...prev,
      penalties: prev.penalties.filter(p => p.id !== id)
    }));
  };

  const updatePenalty = (id: string, field: keyof PenaltyData, value: any) => {
    const newPenalties = formData.penalties.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setFormData(prev => ({ ...prev, penalties: newPenalties }));
  };

  const isPenaltyFormulaNoAplica = (formulaId: string): boolean => {
    const formula = penaltyFormulas.find(f => f.id === formulaId);
    return formula?.name === 'No Aplica';
  };

  const generatePenaltyFormulaText = (penalty: PenaltyData): string => {
    if (isPenaltyFormulaNoAplica(penalty.formulaId)) {
      return 'No Aplica';
    }

    const { metal, amountUsd, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit } = penalty;

    if (!amountUsd || !lowerLimit || !upperLimit) return '';

    const formula = penaltyFormulas.find(f => f.id === penalty.formulaId);
    const formulaName = formula?.name || '';

    return `${formulaName} - (${metal}): $${amountUsd} por TMS por cada ${lowerLimit}${lowerLimitUnit} por encima de ${upperLimit}${upperLimitUnit}`;
  };

  const addQualitySpec = () => {
    const newSpec: QualitySpecData = {
      id: `temp-${Date.now()}`,
      metal: 'CU',
      specType: 'range',
      minValue: '',
      maxValue: '',
      unit: '%',
    };

    setFormData(prev => ({ ...prev, qualitySpecs: [...prev.qualitySpecs, newSpec] }));
  };

  const removeQualitySpec = (id: string) => {
    setFormData(prev => ({
      ...prev,
      qualitySpecs: prev.qualitySpecs.filter(s => s.id !== id)
    }));
  };

  const updateQualitySpec = (id: string, field: keyof QualitySpecData, value: any) => {
    const newSpecs = formData.qualitySpecs.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setFormData(prev => ({ ...prev, qualitySpecs: newSpecs }));
  };

  const generateQualityFormulaText = (spec: QualitySpecData): string => {
    const { metal, specType, minValue, maxValue, unit } = spec;

    if (specType === 'range' && minValue && maxValue) {
      return `${metal}: ${minValue} - ${maxValue} ${unit}`;
    } else if (specType === 'minimum' && minValue) {
      return `${metal}: >=${minValue} ${unit}`;
    } else if (specType === 'maximum' && maxValue) {
      return `${metal}: <${maxValue} ${unit}`;
    }

    return '';
  };

  const addRefiningExpense = () => {
    const newExpense: RefiningExpenseData = {
      id: `temp-${Date.now()}`,
      formulaId: '',
      metal: 'CU',
      amountUsd: '',
      unit: '/lib',
    };

    setFormData(prev => ({ ...prev, refiningExpenses: [...prev.refiningExpenses, newExpense] }));
  };

  const removeRefiningExpense = (id: string) => {
    setFormData(prev => ({
      ...prev,
      refiningExpenses: prev.refiningExpenses.filter(e => e.id !== id)
    }));
  };

  const updateRefiningExpense = (id: string, field: keyof RefiningExpenseData, value: any) => {
    const newExpenses = formData.refiningExpenses.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    );
    setFormData(prev => ({ ...prev, refiningExpenses: newExpenses }));
  };

  const isRefiningExpenseFormulaNoAplica = (formulaId: string): boolean => {
    const formula = refiningExpenseFormulas.find(f => f.id === formulaId);
    return formula?.name === 'No Aplica';
  };

  const generateRefiningExpenseFormulaText = (expense: RefiningExpenseData): string => {
    if (isRefiningExpenseFormulaNoAplica(expense.formulaId)) {
      return 'No Aplica';
    }

    const { metal, amountUsd, unit } = expense;

    if (!amountUsd) return '';

    return `(${metal}): $${amountUsd}${unit}`;
  };

  const isBasicSectionValid = () => {
    return (
      formData.contractType &&
      formData.vendorId &&
      formData.buyerId &&
      formData.productId &&
      formData.countryId &&
      formData.startMonth &&
      formData.endMonth &&
      formData.quotas.length > 0
    );
  };

  const isIncotermSectionValid = () => {
    return formData.incotermId && formData.deliveryLocation.trim() !== '';
  };

  const canProceed = () => {
    if (currentSection === 'basic') return isBasicSectionValid();
    if (currentSection === 'incoterm') return isIncotermSectionValid();
    return true;
  };

  const goToNextSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);
    if (currentIndex < SECTIONS.length - 1 && canProceed()) {
      setCurrentSection(SECTIONS[currentIndex + 1].id);
    }
  };

  const goToPreviousSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(SECTIONS[currentIndex - 1].id);
    }
  };

  const goToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  const handleSave = async () => {
    if (!isBasicSectionValid() || !isIncotermSectionValid()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const contractNumber = `CTR-${Date.now()}`;

      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          contract_number: contractNumber,
          contract_type: formData.contractType,
          vendor_id: formData.vendorId,
          buyer_id: formData.buyerId,
          product_id: formData.productId,
          country_id: formData.countryId,
          start_month: formData.startMonth + '-01',
          end_month: formData.endMonth + '-01',
          incoterm_id: formData.incotermId,
          delivery_location: formData.deliveryLocation,
          status: 'draft',
        })
        .select()
        .single();

      if (contractError) throw contractError;

      if (contract) {
        const quotasToInsert = formData.quotas.map(q => ({
          contract_id: contract.id,
          month: q.month + '-01',
          tmh: parseFloat(q.tmh),
          tms: parseFloat(q.tms),
          h2o_percentage: parseFloat(q.h2oPercentage),
        }));

        const { error: quotasError } = await supabase
          .from('contract_quotas')
          .insert(quotasToInsert);

        if (quotasError) throw quotasError;

        if (formData.payables.length > 0) {
          const payablesToInsert = formData.payables.map(p => {
            const isNoAplica = isPayableFormulaNoAplica(p.formulaId);

            return {
              contract_id: contract.id,
              formula_id: p.formulaId,
              metal: isNoAplica ? null : p.metal,
              deduction_value: isNoAplica ? null : (p.deductionValue ? parseFloat(p.deductionValue) : null),
              deduction_unit: isNoAplica ? null : p.deductionUnit,
              balance_percentage: isNoAplica ? null : (p.balancePercentage ? parseFloat(p.balancePercentage) : null),
              market_index_id: isNoAplica ? null : p.marketIndexId,
              formula_text: generateFormulaText(p),
            };
          });

          const { error: payablesError } = await supabase
            .from('contract_payables')
            .insert(payablesToInsert);

          if (payablesError) throw payablesError;
        }

        if (formData.penalties.length > 0) {
          const penaltiesToInsert = formData.penalties.map(p => {
            const isNoAplica = isPenaltyFormulaNoAplica(p.formulaId);

            return {
              contract_id: contract.id,
              formula_id: p.formulaId,
              metal: isNoAplica ? null : p.metal,
              amount_usd: isNoAplica ? null : (p.amountUsd ? parseFloat(p.amountUsd) : null),
              lower_limit: isNoAplica ? null : (p.lowerLimit ? parseFloat(p.lowerLimit) : null),
              lower_limit_unit: isNoAplica ? null : p.lowerLimitUnit,
              upper_limit: isNoAplica ? null : (p.upperLimit ? parseFloat(p.upperLimit) : null),
              upper_limit_unit: isNoAplica ? null : p.upperLimitUnit,
              penalty_formula: generatePenaltyFormulaText(p),
            };
          });

          const { error: penaltiesError } = await supabase
            .from('contract_penalties')
            .insert(penaltiesToInsert);

          if (penaltiesError) throw penaltiesError;
        }

        if (formData.qualitySpecs.length > 0) {
          const qualitySpecsToInsert = formData.qualitySpecs.map(s => ({
            contract_id: contract.id,
            metal: s.metal,
            spec_type: s.specType,
            min_value: s.minValue ? parseFloat(s.minValue) : null,
            max_value: s.maxValue ? parseFloat(s.maxValue) : null,
            unit: s.unit,
            formula_text: generateQualityFormulaText(s),
          }));

          const { error: qualitySpecsError } = await supabase
            .from('contract_quality_specs')
            .insert(qualitySpecsToInsert);

          if (qualitySpecsError) throw qualitySpecsError;
        }

        if (formData.refiningExpenses.length > 0) {
          const refiningExpensesToInsert = formData.refiningExpenses.map(e => {
            const isNoAplica = isRefiningExpenseFormulaNoAplica(e.formulaId);

            return {
              contract_id: contract.id,
              formula_id: e.formulaId,
              metal: isNoAplica ? null : e.metal,
              amount_usd: isNoAplica ? null : (e.amountUsd ? parseFloat(e.amountUsd) : null),
              unit: isNoAplica ? null : e.unit,
              formula_text: generateRefiningExpenseFormulaText(e),
            };
          });

          const { error: refiningExpensesError } = await supabase
            .from('contract_refining_expenses')
            .insert(refiningExpensesToInsert);

          if (refiningExpensesError) throw refiningExpensesError;
        }
      }

      alert('Contrato guardado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Error al guardar el contrato');
    } finally {
      setLoading(false);
    }
  };

  const formatMonthLabel = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  };

  const getSectionStatus = (sectionId: string) => {
    if (sectionId === 'basic') return isBasicSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'incoterm') return isIncotermSectionValid() ? 'complete' : 'incomplete';
    return 'incomplete';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">Nuevo Contrato</h2>
            {templateId && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                Desde Plantilla
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Secciones</h3>
              <nav className="space-y-1">
                {SECTIONS.map((section) => {
                  const isActive = currentSection === section.id;
                  const status = getSectionStatus(section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => goToSection(section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex-1">{section.label}</span>
                      {status === 'complete' && !isActive && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {currentSection === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Información Básica / Cantidad / Plazo</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Contrato <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.contractType}
                        onChange={(e) => updateFormData('contractType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="purchase">Compra</option>
                        <option value="sale">Venta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendedor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.vendorId}
                        onChange={(e) => updateFormData('vendorId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar vendedor...</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comprador <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.buyerId}
                        onChange={(e) => updateFormData('buyerId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar comprador...</option>
                        {buyers.map((buyer) => (
                          <option key={buyer.id} value={buyer.id}>
                            {buyer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Producto <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.productId}
                        onChange={(e) => updateFormData('productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar producto...</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Región <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.countryId}
                        onChange={(e) => updateFormData('countryId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar país...</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desde (Mes/Año) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="month"
                        value={formData.startMonth}
                        onChange={(e) => updateFormData('startMonth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hasta (Mes/Año) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="month"
                        value={formData.endMonth}
                        onChange={(e) => updateFormData('endMonth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {formData.quotas.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribución de la Entrega</h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800 text-white sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Mes</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">TMH</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">TMS</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">% H2O</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {formData.quotas.map((quota, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {formatMonthLabel(quota.month)}
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={quota.tmh}
                                    onChange={(e) => updateQuota(index, 'tmh', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={quota.tms}
                                    onChange={(e) => updateQuota(index, 'tms', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={quota.h2oPercentage}
                                    onChange={(e) => updateQuota(index, 'h2oPercentage', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'incoterm' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Incoterm de Entrega</h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incoterm <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.incotermId}
                        onChange={(e) => updateFormData('incotermId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar incoterm...</option>
                        {incoterms.map((incoterm) => (
                          <option key={incoterm.id} value={incoterm.id}>
                            {incoterm.code} - {incoterm.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lugar de Entrega <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryLocation}
                        onChange={(e) => updateFormData('deliveryLocation', e.target.value)}
                        placeholder="Ej: Puerto del Callao, Lima, Perú"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 'payables' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Pagables</h3>
                    <button
                      onClick={addPayable}
                      disabled={payableFormulas.length === 0}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Pagable
                    </button>
                  </div>

                  {payableFormulas.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        Cargando fórmulas... Si este mensaje persiste, intente recargar la página.
                      </p>
                    </div>
                  )}

                  {formData.payables.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">No hay pagables agregados</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Haga clic en "Agregar Pagable" para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.payables.map((payable, index) => (
                        <div
                          key={payable.id}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Pagable #{index + 1}
                            </h4>
                            <button
                              onClick={() => removePayable(payable.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Primera fila: Tipo de Fórmula (full width) */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Fórmula <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={payable.formulaId}
                                onChange={(e) =>
                                  updatePayable(payable.id, 'formulaId', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {payableFormulas.map((formula) => (
                                  <option key={formula.id} value={formula.id}>
                                    {formula.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {payable.formulaId && !isPayableFormulaNoAplica(payable.formulaId) && (
                              <>
                                {/* Segunda fila: Metal e Índice de Mercado */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Metal <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={payable.metal}
                                      onChange={(e) =>
                                        updatePayable(payable.id, 'metal', e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="CU">Cu (Cobre)</option>
                                      <option value="AG">Ag (Plata)</option>
                                      <option value="AU">Au (Oro)</option>
                                    </select>
                                  </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Índice de Mercado <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={payable.marketIndexId}
                                  onChange={(e) =>
                                    updatePayable(payable.id, 'marketIndexId', e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Seleccionar índice...</option>
                                  {marketIndices.map((index) => (
                                    <option key={index.id} value={index.id}>
                                      {index.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Tercera fila: Deducción y Balance */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Deducción <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={payable.deductionValue}
                                    onChange={(e) =>
                                      updatePayable(payable.id, 'deductionValue', e.target.value)
                                    }
                                    placeholder="Ej: 1.2"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <select
                                    value={payable.deductionUnit}
                                    onChange={(e) =>
                                      updatePayable(payable.id, 'deductionUnit', e.target.value)
                                    }
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="%">%</option>
                                    <option value="g/tms">g/tms</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Balance % <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  value={payable.balancePercentage}
                                  onChange={(e) =>
                                    updatePayable(payable.id, 'balancePercentage', e.target.value)
                                  }
                                  placeholder="Ej: 90"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>

                                {payable.deductionValue &&
                                  payable.balancePercentage &&
                                  payable.marketIndexId && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        Fórmula Generada:
                                      </p>
                                      <p className="text-base font-mono text-blue-900">
                                        {generateFormulaText(payable)}
                                      </p>
                                    </div>
                                  )}
                              </>
                            )}

                            {payable.formulaId && isPayableFormulaNoAplica(payable.formulaId) && (
                              <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Fórmula Seleccionada:
                                </p>
                                <p className="text-base font-mono text-gray-900">
                                  No Aplica
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'penalties' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Penalidades</h3>
                    <button
                      onClick={addPenalty}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Penalidad
                    </button>
                  </div>

                  {formData.penalties.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">No hay penalidades agregadas</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Haga clic en "Agregar Penalidad" para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.penalties.map((penalty, index) => (
                        <div
                          key={penalty.id}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Penalidad #{index + 1}
                            </h4>
                            <button
                              onClick={() => removePenalty(penalty.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fórmula <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={penalty.formulaId}
                                onChange={(e) =>
                                  updatePenalty(penalty.id, 'formulaId', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Seleccione una fórmula</option>
                                {penaltyFormulas.map((formula) => (
                                  <option key={formula.id} value={formula.id}>
                                    {formula.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {penalty.formulaId && !isPenaltyFormulaNoAplica(penalty.formulaId) && (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Metal <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={penalty.metal}
                                      onChange={(e) =>
                                        updatePenalty(penalty.id, 'metal', e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="AS">As (Arsénico)</option>
                                      <option value="PB">Pb (Plomo)</option>
                                      <option value="ZN">Zn (Zinc)</option>
                                      <option value="SB">Sb (Antimonio)</option>
                                      <option value="BI">Bi (Bismuto)</option>
                                      <option value="HG">Hg (Mercurio)</option>
                                      <option value="F">F (Flúor)</option>
                                      <option value="CL">Cl (Cloro)</option>
                                    </select>
                                  </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Monto en USD <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={penalty.amountUsd}
                                    onChange={(e) =>
                                      updatePenalty(penalty.id, 'amountUsd', e.target.value)
                                    }
                                    placeholder="Ej: 2.5"
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Límite Inferior <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={penalty.lowerLimit}
                                    onChange={(e) =>
                                      updatePenalty(penalty.id, 'lowerLimit', e.target.value)
                                    }
                                    placeholder="Ej: 0.01"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <input
                                    type="text"
                                    value={penalty.lowerLimitUnit}
                                    onChange={(e) =>
                                      updatePenalty(penalty.id, 'lowerLimitUnit', e.target.value)
                                    }
                                    placeholder="%"
                                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Límite Superior <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={penalty.upperLimit}
                                    onChange={(e) =>
                                      updatePenalty(penalty.id, 'upperLimit', e.target.value)
                                    }
                                    placeholder="Ej: 0.05"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <input
                                    type="text"
                                    value={penalty.upperLimitUnit}
                                    onChange={(e) =>
                                      updatePenalty(penalty.id, 'upperLimitUnit', e.target.value)
                                    }
                                    placeholder="%"
                                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>

                                {penalty.amountUsd &&
                                  penalty.lowerLimit &&
                                  penalty.upperLimit && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        Fórmula Generada:
                                      </p>
                                      <p className="text-base font-mono text-amber-900">
                                        {generatePenaltyFormulaText(penalty)}
                                      </p>
                                    </div>
                                  )}
                              </>
                            )}

                            {penalty.formulaId && isPenaltyFormulaNoAplica(penalty.formulaId) && (
                              <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Fórmula Seleccionada:
                                </p>
                                <p className="text-base font-mono text-gray-900">
                                  No Aplica
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'quality' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Calidad / Granulometría</h3>
                    <button
                      onClick={addQualitySpec}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Especificación
                    </button>
                  </div>

                  {formData.qualitySpecs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">No hay especificaciones de calidad agregadas</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Haga clic en "Agregar Especificación" para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.qualitySpecs.map((spec, index) => (
                        <div
                          key={spec.id}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Especificación #{index + 1}
                            </h4>
                            <button
                              onClick={() => removeQualitySpec(spec.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Metal / Elemento <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={spec.metal}
                                  onChange={(e) =>
                                    updateQualitySpec(spec.id, 'metal', e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="CU">Cu (Cobre)</option>
                                  <option value="AG">Ag (Plata)</option>
                                  <option value="AU">Au (Oro)</option>
                                  <option value="AS">As (Arsénico)</option>
                                  <option value="PB">Pb (Plomo)</option>
                                  <option value="ZN">Zn (Zinc)</option>
                                  <option value="FE">Fe (Hierro)</option>
                                  <option value="S">S (Azufre)</option>
                                  <option value="HG">Hg (Mercurio)</option>
                                  <option value="BI">Bi (Bismuto)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Tipo de Especificación <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={spec.specType}
                                  onChange={(e) =>
                                    updateQualitySpec(spec.id, 'specType', e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="range">Por Rango</option>
                                  <option value="minimum">Mínimo</option>
                                  <option value="maximum">Máximo</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(spec.specType === 'range' || spec.specType === 'minimum') && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor {spec.specType === 'range' ? 'Mínimo' : ''} <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={spec.minValue}
                                    onChange={(e) =>
                                      updateQualitySpec(spec.id, 'minValue', e.target.value)
                                    }
                                    placeholder="Ej: 20"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              )}

                              {(spec.specType === 'range' || spec.specType === 'maximum') && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor {spec.specType === 'range' ? 'Máximo' : ''} <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={spec.maxValue}
                                    onChange={(e) =>
                                      updateQualitySpec(spec.id, 'maxValue', e.target.value)
                                    }
                                    placeholder="Ej: 25"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Unidad <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={spec.unit}
                                  onChange={(e) =>
                                    updateQualitySpec(spec.id, 'unit', e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="%">% (Porcentaje)</option>
                                  <option value="g/tms">g/tms (Gramos por tonelada métrica seca)</option>
                                  <option value="oz/tc">oz/tc (Onzas por tonelada corta)</option>
                                  <option value="ppm">ppm (Partes por millón)</option>
                                </select>
                              </div>
                            </div>

                            {generateQualityFormulaText(spec) && (
                              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Fórmula Generada:
                                </p>
                                <p className="text-base font-mono text-green-900">
                                  {generateQualityFormulaText(spec)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'refining' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Gastos de Refinación</h3>
                    <button
                      onClick={addRefiningExpense}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Gasto
                    </button>
                  </div>

                  {formData.refiningExpenses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">No hay gastos de refinación agregados</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Haga clic en "Agregar Gasto" para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.refiningExpenses.map((expense, index) => (
                        <div
                          key={expense.id}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Gasto #{index + 1}
                            </h4>
                            <button
                              onClick={() => removeRefiningExpense(expense.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fórmula <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={expense.formulaId}
                                onChange={(e) =>
                                  updateRefiningExpense(expense.id, 'formulaId', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Seleccione una fórmula</option>
                                {refiningExpenseFormulas.map((formula) => (
                                  <option key={formula.id} value={formula.id}>
                                    {formula.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {expense.formulaId && !isRefiningExpenseFormulaNoAplica(expense.formulaId) && (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Metal <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={expense.metal}
                                      onChange={(e) =>
                                        updateRefiningExpense(expense.id, 'metal', e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="CU">CU (Cobre)</option>
                                      <option value="AG">AG (Plata)</option>
                                      <option value="AU">AU (Oro)</option>
                                      <option value="PB">PB (Plomo)</option>
                                      <option value="ZN">ZN (Zinc)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Monto en USD <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={expense.amountUsd}
                                      onChange={(e) =>
                                        updateRefiningExpense(expense.id, 'amountUsd', e.target.value)
                                      }
                                      placeholder="Ej: 0.07"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Unidad <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={expense.unit}
                                      onChange={(e) =>
                                        updateRefiningExpense(expense.id, 'unit', e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="/lib">/lib (por libra)</option>
                                      <option value="/oz">/oz (por onza)</option>
                                      <option value="/tms">/tms (por tonelada métrica seca)</option>
                                      <option value="%">% (porcentaje)</option>
                                    </select>
                                  </div>
                                </div>

                                {expense.amountUsd && (
                                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      Fórmula Generada:
                                    </p>
                                    <p className="text-base font-mono text-purple-900">
                                      {generateRefiningExpenseFormulaText(expense)}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}

                            {expense.formulaId && isRefiningExpenseFormulaNoAplica(expense.formulaId) && (
                              <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Fórmula Seleccionada:
                                </p>
                                <p className="text-base font-mono text-gray-900">
                                  No Aplica
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!['basic', 'incoterm', 'payables', 'penalties', 'quality', 'refining'].includes(currentSection) && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Esta sección está en desarrollo
                  </p>
                  <p className="text-gray-400 mt-2">
                    Por favor complete las secciones anteriores
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={goToPreviousSection}
            disabled={SECTIONS.findIndex(s => s.id === currentSection) === 0}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={!isBasicSectionValid() || !isIncotermSectionValid() || loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Contrato'}
            </button>

            <button
              onClick={goToNextSection}
              disabled={SECTIONS.findIndex(s => s.id === currentSection) === SECTIONS.length - 1 || !canProceed()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractForm;

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
  rollbackApplies: boolean;
  rollbackValue: string;
  rollbackUnit: string;
  payables: PayableData[];
  processing: ProcessingData[];
  processingEscalatorApplies: boolean;
  processingEscalatorValue: string;
  processingEscalatorUnit: string;
  penalties: PenaltyData[];
  qualitySpecs: QualitySpecData[];
  refiningExpenses: RefiningExpenseData[];
  refiningEscalatorApplies: boolean;
  refiningEscalatorValue: string;
  refiningEscalatorUnit: string;
  samplingFormulaId: string;
  samplingIncotermId: string;
  samplingReference: string;
  paymentTerms: PaymentTermData[];
  wasteApplies: 'no_aplica' | 'aplica';
  wasteValue: string;
  wasteUnit: string;
  assayStructure: string;
  assayFinalLab: string;
  assayCostType: string;
  quotationPeriods: QuotationPeriodData[];
}

interface QuotationPeriodData {
  id: string;
  formula: 'Mes de Entrega' | 'Mes después de Mes de llegada';
  months: string;
  metal: string;
}

interface PaymentTermData {
  id: string;
  paymentType: 'provisional' | 'final';
  advancePercentage: string;
  knownElements: string;
  daysFromIssuance: string;
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

interface ProcessingFormula {
  id: string;
  name: string;
  description: string;
  requires_incoterm: boolean;
  requires_value: boolean;
  is_no_aplica: boolean;
}

interface ProcessingData {
  id: string;
  formulaId: string;
  incotermId: string;
  value: string;
  unit: string;
}

interface SamplingFormula {
  id: string;
  name: string;
  description: string;
  requires_incoterm: boolean;
  requires_reference: boolean;
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
  const [processingFormulas, setProcessingFormulas] = useState<ProcessingFormula[]>([]);
  const [penaltyFormulas, setPenaltyFormulas] = useState<PenaltyFormula[]>([]);
  const [refiningExpenseFormulas, setRefiningExpenseFormulas] = useState<RefiningExpenseFormula[]>([]);
  const [samplingFormulas, setSamplingFormulas] = useState<SamplingFormula[]>([]);
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
    rollbackApplies: false,
    rollbackValue: '',
    rollbackUnit: '$/tm',
    payables: [],
    processing: [],
    processingEscalatorApplies: false,
    processingEscalatorValue: '',
    processingEscalatorUnit: '',
    penalties: [],
    qualitySpecs: [],
    refiningExpenses: [],
    refiningEscalatorApplies: false,
    refiningEscalatorValue: '',
    refiningEscalatorUnit: '',
    samplingFormulaId: '',
    samplingIncotermId: '',
    samplingReference: '',
    paymentTerms: [],
    wasteApplies: 'no_aplica',
    wasteValue: '',
    wasteUnit: '%',
    assayStructure: '',
    assayFinalLab: '',
    assayCostType: '',
    quotationPeriods: [],
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
      const [vendorsRes, buyersRes, productsRes, countriesRes, incotermsRes, formulasRes, processingFormulasRes, penaltyFormulasRes, refiningExpenseFormulasRes, samplingFormulasRes, indicesRes] = await Promise.all([
        supabase.from('vendors').select('*').order('name'),
        supabase.from('buyers').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('incoterms').select('*').order('code'),
        supabase.from('payable_formulas').select('*').order('name'),
        supabase.from('processing_formulas').select('*').order('name'),
        supabase.from('penalty_formulas').select('*').order('name'),
        supabase.from('refining_expense_formulas').select('*').order('name'),
        supabase.from('sampling_formulas').select('*').order('name'),
        supabase.from('market_indices').select('*').order('name'),
      ]);

      if (vendorsRes.data) {
        console.log('Vendedores cargados:', vendorsRes.data);
        setVendors(vendorsRes.data);
      } else {
        console.error('Error al cargar vendedores:', vendorsRes.error);
      }
      if (buyersRes.data) {
        console.log('Compradores cargados:', buyersRes.data);
        setBuyers(buyersRes.data);
      } else {
        console.error('Error al cargar compradores:', buyersRes.error);
      }
      if (productsRes.data) {
        console.log('Productos cargados:', productsRes.data);
        setProducts(productsRes.data);
      } else {
        console.error('Error al cargar productos:', productsRes.error);
      }
      if (formulasRes.data) {
        console.log('Fórmulas cargadas:', formulasRes.data);
        setPayableFormulas(formulasRes.data);
      } else {
        console.error('Error al cargar fórmulas:', formulasRes.error);
      }
      if (processingFormulasRes.data) {
        console.log('Fórmulas de procesamiento cargadas:', processingFormulasRes.data);
        setProcessingFormulas(processingFormulasRes.data);
      } else {
        console.error('Error al cargar fórmulas de procesamiento:', processingFormulasRes.error);
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
      if (samplingFormulasRes.data) {
        console.log('Fórmulas de muestreo cargadas:', samplingFormulasRes.data);
        setSamplingFormulas(samplingFormulasRes.data);
      } else {
        console.error('Error al cargar fórmulas de muestreo:', samplingFormulasRes.error);
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
    if (!formData.startMonth || !formData.endMonth) return;

    const [startYear, startMonthNum] = formData.startMonth.split('-').map(Number);
    const [endYear, endMonthNum] = formData.endMonth.split('-').map(Number);

    if (isNaN(startYear) || isNaN(startMonthNum) || isNaN(endYear) || isNaN(endMonthNum)) {
      return;
    }

    const quotas: QuotaData[] = [];

    let currentYear = startYear;
    let currentMonth = startMonthNum;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonthNum)) {
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      quotas.push({
        month: monthStr,
        tmh: '',
        tms: '',
        h2oPercentage: '',
      });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    console.log('Generated quotas from', formData.startMonth, 'to', formData.endMonth, ':', quotas.length, 'months');
    console.log('Months:', quotas.map(q => q.month).join(', '));

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

  const addProcessing = () => {
    const firstFormula = processingFormulas.find(f => !f.is_no_aplica);

    if (!firstFormula) {
      alert('No se encontraron fórmulas de procesamiento. Por favor, recargue la página.');
      return;
    }

    const newProcessing: ProcessingData = {
      id: `temp-${Date.now()}`,
      formulaId: firstFormula.id,
      incotermId: '',
      value: '',
      unit: '%',
    };

    setFormData(prev => ({ ...prev, processing: [...prev.processing, newProcessing] }));
  };

  const removeProcessing = (id: string) => {
    setFormData(prev => ({
      ...prev,
      processing: prev.processing.filter(p => p.id !== id)
    }));
  };

  const updateProcessing = (id: string, field: keyof ProcessingData, value: any) => {
    const newProcessing = formData.processing.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setFormData(prev => ({ ...prev, processing: newProcessing }));
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
    const incompleteSections: string[] = [];

    if (!isBasicSectionValid()) incompleteSections.push('Información Básica/Cantidad/Plazo');
    if (!isIncotermSectionValid()) incompleteSections.push('Incoterm Entrega');
    if (!isRollbackSectionValid()) incompleteSections.push('Rollback');
    if (!isQualitySpecsSectionValid()) incompleteSections.push('Calidad / Granulometría');
    if (!isPayablesSectionValid()) incompleteSections.push('Pagables');
    if (!isProcessingSectionValid()) incompleteSections.push('Maquila');
    if (!isProcessingEscalatorSectionValid()) incompleteSections.push('Escalador en Maquila');
    if (!isRefiningExpensesSectionValid()) incompleteSections.push('Gastos de Refinación');
    if (!isRefiningEscalatorSectionValid()) incompleteSections.push('Escalador en Gastos de Refinación');
    if (!isPenaltiesSectionValid()) incompleteSections.push('Penalidades');
    if (!isPaymentsSectionValid()) incompleteSections.push('Pagos');
    if (!isQuotationPeriodSectionValid()) incompleteSections.push('Periodo de Cotizaciones');
    if (!isWeightSamplingSectionValid()) incompleteSections.push('Muestreo de Pesos');
    if (!isAssaySamplingSectionValid()) incompleteSections.push('Muestreo de Ensayes');
    if (!isWasteSectionValid()) incompleteSections.push('Merma');

    if (incompleteSections.length > 0) {
      const message = 'Las siguientes secciones requieren información o deben marcarse como "No Aplica":\n\n' +
        incompleteSections.map((section, index) => `${index + 1}. ${section}`).join('\n');
      alert(message);
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
          rollback_applies: formData.rollbackApplies,
          rollback_value: formData.rollbackApplies && formData.rollbackValue ? parseFloat(formData.rollbackValue) : null,
          rollback_unit: formData.rollbackApplies ? formData.rollbackUnit : null,
          waste_applies: formData.wasteApplies,
          waste_value: formData.wasteApplies === 'aplica' && formData.wasteValue ? parseFloat(formData.wasteValue) : null,
          waste_unit: formData.wasteApplies === 'aplica' ? formData.wasteUnit : null,
          assay_structure: formData.assayStructure || null,
          assay_final_lab: formData.assayFinalLab || null,
          assay_cost_type: formData.assayCostType || null,
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

        if (formData.processing.length > 0) {
          const processingToInsert = formData.processing.map(p => {
            const formula = processingFormulas.find(f => f.id === p.formulaId);
            const isNoAplica = formula?.is_no_aplica;

            return {
              contract_id: contract.id,
              formula_id: p.formulaId,
              incoterm_id: !isNoAplica && formula?.requires_incoterm ? p.incotermId : null,
              value: !isNoAplica && p.value ? parseFloat(p.value) : null,
              unit: !isNoAplica ? p.unit : null,
            };
          });

          const { error: processingError } = await supabase
            .from('contract_processing')
            .insert(processingToInsert);

          if (processingError) throw processingError;
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

        if (formData.quotationPeriods.length > 0) {
          const quotationPeriodsToInsert = formData.quotationPeriods.map((q, index) => ({
            contract_id: contract.id,
            formula: q.formula,
            months: parseInt(q.months),
            metal: q.metal,
            display_order: index,
          }));

          const { error: quotationPeriodsError } = await supabase
            .from('contract_quotation_periods')
            .insert(quotationPeriodsToInsert);

          if (quotationPeriodsError) throw quotationPeriodsError;
        }

        if (formData.paymentTerms.length > 0) {
          const paymentTermsToInsert = formData.paymentTerms.map((p, index) => ({
            contract_id: contract.id,
            payment_type: p.paymentType,
            advance_percentage: p.paymentType === 'provisional' && p.advancePercentage ? parseFloat(p.advancePercentage) : null,
            known_elements: p.paymentType === 'final' ? p.knownElements : null,
            days_from_issuance: p.daysFromIssuance ? parseInt(p.daysFromIssuance) : 0,
            display_order: index,
          }));

          const { error: paymentTermsError } = await supabase
            .from('payment_terms')
            .insert(paymentTermsToInsert);

          if (paymentTermsError) throw paymentTermsError;
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
    const [year, month] = monthStr.split('-').map(Number);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const isPayablesSectionValid = () => {
    return formData.payables.length > 0 && formData.payables.every(p =>
      p.formulaId &&
      p.metal &&
      (isPayableFormulaNoAplica(p.formulaId) ||
        (p.deductionValue && p.deductionUnit && p.balancePercentage && p.marketIndexId))
    );
  };

  const isProcessingSectionValid = () => {
    return formData.processing.length > 0 && formData.processing.every(p => p.formulaId);
  };

  const isPenaltiesSectionValid = () => {
    return formData.penalties.length > 0 && formData.penalties.every(p =>
      p.formulaId &&
      (isPenaltyFormulaNoAplica(p.formulaId) ||
        (p.metal && p.amountUsd && p.lowerLimit && p.upperLimit))
    );
  };

  const isQualitySpecsSectionValid = () => {
    return formData.qualitySpecs.length > 0 && formData.qualitySpecs.every(q =>
      q.metal && q.specType && q.unit &&
      ((q.specType === 'range' && q.minValue && q.maxValue) ||
       (q.specType === 'minimum' && q.minValue) ||
       (q.specType === 'maximum' && q.maxValue))
    );
  };

  const isRefiningExpensesSectionValid = () => {
    return formData.refiningExpenses.length > 0 && formData.refiningExpenses.every(e =>
      e.formulaId &&
      (isRefiningExpenseFormulaNoAplica(e.formulaId) ||
        (e.metal && e.amountUsd && e.unit))
    );
  };

  const isRollbackSectionValid = () => {
    return !formData.rollbackApplies ||
      (formData.rollbackValue && formData.rollbackUnit);
  };

  const isWasteSectionValid = () => {
    return formData.wasteApplies === 'no_aplica' ||
      (formData.wasteApplies === 'aplica' && formData.wasteValue && formData.wasteUnit);
  };

  const isAssaySamplingSectionValid = () => {
    return formData.assayStructure &&
           formData.assayFinalLab &&
           formData.assayCostType;
  };

  const isWeightSamplingSectionValid = () => {
    if (!formData.samplingFormulaId) return false;
    const selectedFormula = samplingFormulas.find(f => f.id === formData.samplingFormulaId);
    if (!selectedFormula) return false;

    // Si la fórmula requiere incoterm, verificar que esté seleccionado
    if (selectedFormula.requires_incoterm && !formData.samplingIncotermId) {
      return false;
    }
    return true;
  };

  const isQuotationPeriodSectionValid = () => {
    return formData.quotationPeriods.length > 0 && formData.quotationPeriods.every(q =>
      q.formula && q.months && q.metal
    );
  };

  const isPaymentsSectionValid = () => {
    return formData.paymentTerms.length > 0 && formData.paymentTerms.every(p =>
      p.paymentType && p.daysFromIssuance &&
      ((p.paymentType === 'provisional' && p.advancePercentage) ||
       (p.paymentType === 'final' && p.knownElements))
    );
  };

  const isProcessingEscalatorSectionValid = () => {
    return !formData.processingEscalatorApplies ||
      (formData.processingEscalatorValue && formData.processingEscalatorUnit);
  };

  const isRefiningEscalatorSectionValid = () => {
    return !formData.refiningEscalatorApplies ||
      (formData.refiningEscalatorValue && formData.refiningEscalatorUnit);
  };

  const getSectionStatus = (sectionId: string) => {
    if (sectionId === 'basic') return isBasicSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'incoterm') return isIncotermSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'rollback') return isRollbackSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'quality') return isQualitySpecsSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'payables') return isPayablesSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'processing') return isProcessingSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'processing-escalator') return isProcessingEscalatorSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'refining') return isRefiningExpensesSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'refining-escalator') return isRefiningEscalatorSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'penalties') return isPenaltiesSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'payments') return isPaymentsSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'quotation-period') return isQuotationPeriodSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'weight-sampling') return isWeightSamplingSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'assay-sampling') return isAssaySamplingSectionValid() ? 'complete' : 'incomplete';
    if (sectionId === 'waste') return isWasteSectionValid() ? 'complete' : 'incomplete';
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

              {currentSection === 'rollback' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Rollback</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        ¿Aplica Rollback?
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="rollbackApplies"
                            checked={!formData.rollbackApplies}
                            onChange={() => {
                              updateFormData('rollbackApplies', false);
                              updateFormData('rollbackValue', '');
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-900 font-medium">No aplica</span>
                        </label>

                        <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="rollbackApplies"
                            checked={formData.rollbackApplies}
                            onChange={() => updateFormData('rollbackApplies', true)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-900 font-medium">Aplicar</span>
                        </label>
                      </div>
                    </div>

                    {formData.rollbackApplies && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Valor <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.rollbackValue}
                              onChange={(e) => updateFormData('rollbackValue', e.target.value)}
                              placeholder="Ej: 50"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unidad <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.rollbackUnit}
                              onChange={(e) => updateFormData('rollbackUnit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Seleccionar unidad...</option>
                              <option value="$/tm">$/tm</option>
                              <option value="$/tms">$/tms</option>
                              <option value="%">%</option>
                            </select>
                          </div>
                        </div>

                        <div className="text-sm text-blue-700">
                          <strong>Vista previa:</strong> {formData.rollbackValue || '0'} {formData.rollbackUnit || '$/tm'}
                        </div>
                      </div>
                    )}
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

              {currentSection === 'processing' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Maquila</h3>
                    <button
                      onClick={addProcessing}
                      disabled={processingFormulas.length === 0}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Maquila
                    </button>
                  </div>

                  {processingFormulas.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        Cargando fórmulas... Si este mensaje persiste, intente recargar la página.
                      </p>
                    </div>
                  )}

                  {formData.processing.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">No hay maquilas agregadas</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Haga clic en "Agregar Maquila" para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.processing.map((processing, index) => {
                        const formula = processingFormulas.find(f => f.id === processing.formulaId);
                        const isFranchise = formula?.name === 'Fija';
                        const isNoAplica = formula?.is_no_aplica;

                        return (
                          <div
                            key={processing.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Maquila #{index + 1}
                              </h4>
                              <button
                                onClick={() => removeProcessing(processing.id)}
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
                                  value={processing.formulaId}
                                  onChange={(e) =>
                                    updateProcessing(processing.id, 'formulaId', e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  {processingFormulas.map((formula) => (
                                    <option key={formula.id} value={formula.id}>
                                      {formula.name}
                                    </option>
                                  ))}
                                </select>
                                {formula?.description && (
                                  <p className="text-xs text-gray-500 mt-1">{formula.description}</p>
                                )}
                              </div>

                              {!isNoAplica && (
                                <>
                                  {isFranchise && (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Incoterm <span className="text-red-500">*</span>
                                      </label>
                                      <select
                                        value={processing.incotermId}
                                        onChange={(e) =>
                                          updateProcessing(processing.id, 'incotermId', e.target.value)
                                        }
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
                                  )}

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {isFranchise ? 'Valor (USD)' : 'Valor'} <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={processing.value}
                                        onChange={(e) =>
                                          updateProcessing(processing.id, 'value', e.target.value)
                                        }
                                        placeholder="Ej: 0.5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unidad <span className="text-red-500">*</span>
                                      </label>
                                      <select
                                        value={processing.unit}
                                        onChange={(e) =>
                                          updateProcessing(processing.id, 'unit', e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      >
                                        <option value="">Seleccionar unidad...</option>
                                        <option value="gtm">gtm</option>
                                        <option value="tms">tms</option>
                                        <option value="%">%</option>
                                      </select>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'processing-escalator' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Escalador en Maquila</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Aplica Escalador en Maquila? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="processingEscalatorApplies"
                            checked={!formData.processingEscalatorApplies}
                            onChange={() =>
                              setFormData({ ...formData, processingEscalatorApplies: false, processingEscalatorValue: '', processingEscalatorUnit: '' })
                            }
                            className="mr-2"
                          />
                          No aplica
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="processingEscalatorApplies"
                            checked={formData.processingEscalatorApplies}
                            onChange={() =>
                              setFormData({ ...formData, processingEscalatorApplies: true })
                            }
                            className="mr-2"
                          />
                          Aplicar
                        </label>
                      </div>
                    </div>

                    {formData.processingEscalatorApplies && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.processingEscalatorValue}
                            onChange={(e) =>
                              setFormData({ ...formData, processingEscalatorValue: e.target.value })
                            }
                            placeholder="Ej: 0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unidad <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.processingEscalatorUnit}
                            onChange={(e) =>
                              setFormData({ ...formData, processingEscalatorUnit: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Seleccionar unidad...</option>
                            <option value="gtm">gtm</option>
                            <option value="tms">tms</option>
                            <option value="%">%</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
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
                                  <select
                                    value={penalty.lowerLimitUnit}
                                    onChange={(e) =>
                                      updatePenalty(penalty.id, 'lowerLimitUnit', e.target.value)
                                    }
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Unidad</option>
                                    <option value="%">%</option>
                                    <option value="g/tms">g/tms</option>
                                    <option value="ppm">ppm</option>
                                  </select>
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
                                  <select
                                    value={penalty.upperLimitUnit}
                                    onChange={(e) =>
                                      updatePenalty(penalty.id, 'upperLimitUnit', e.target.value)
                                    }
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Unidad</option>
                                    <option value="%">%</option>
                                    <option value="g/tms">g/tms</option>
                                    <option value="ppm">ppm</option>
                                  </select>
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

              {currentSection === 'refining-escalator' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Escalador en Gastos de Refinación</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Aplica Escalador en Gastos de Refinación? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="refiningEscalatorApplies"
                            checked={!formData.refiningEscalatorApplies}
                            onChange={() =>
                              setFormData({ ...formData, refiningEscalatorApplies: false, refiningEscalatorValue: '', refiningEscalatorUnit: '' })
                            }
                            className="mr-2"
                          />
                          No aplica
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="refiningEscalatorApplies"
                            checked={formData.refiningEscalatorApplies}
                            onChange={() =>
                              setFormData({ ...formData, refiningEscalatorApplies: true })
                            }
                            className="mr-2"
                          />
                          Aplicar
                        </label>
                      </div>
                    </div>

                    {formData.refiningEscalatorApplies && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.refiningEscalatorValue}
                            onChange={(e) =>
                              setFormData({ ...formData, refiningEscalatorValue: e.target.value })
                            }
                            placeholder="Ej: 0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unidad <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.refiningEscalatorUnit}
                            onChange={(e) =>
                              setFormData({ ...formData, refiningEscalatorUnit: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Seleccionar unidad...</option>
                            <option value="gtm">gtm</option>
                            <option value="tms">tms</option>
                            <option value="%">%</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentSection === 'weight-sampling' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Muestreo de Pesos</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fórmula de Muestreo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.samplingFormulaId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            samplingFormulaId: e.target.value,
                            samplingIncotermId: '',
                            samplingReference: ''
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar fórmula...</option>
                        {samplingFormulas.map((formula) => (
                          <option key={formula.id} value={formula.id}>
                            {formula.name} - {formula.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.samplingFormulaId && samplingFormulas.find(f => f.id === formData.samplingFormulaId)?.requires_incoterm && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Incoterm <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.samplingIncotermId}
                            onChange={(e) =>
                              setFormData({ ...formData, samplingIncotermId: e.target.value })
                            }
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
                            Referencia <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.samplingReference}
                            onChange={(e) =>
                              setFormData({ ...formData, samplingReference: e.target.value })
                            }
                            placeholder="Ingrese la referencia..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {formData.samplingFormulaId && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Fórmula Seleccionada:
                        </p>
                        <p className="text-base font-mono text-blue-800">
                          {samplingFormulas.find(f => f.id === formData.samplingFormulaId)?.name}
                          {formData.samplingIncotermId && formData.samplingReference && (
                            <span>
                              {' '}- {incoterms.find(i => i.id === formData.samplingIncotermId)?.code} + {formData.samplingReference}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-blue-700 mt-2">
                          {samplingFormulas.find(f => f.id === formData.samplingFormulaId)?.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentSection === 'quotation-period' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Periodo de Cotizaciones</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newQuotationPeriod: QuotationPeriodData = {
                          id: `temp-${Date.now()}`,
                          formula: 'Mes de Entrega',
                          months: '',
                          metal: '',
                        };
                        setFormData({
                          ...formData,
                          quotationPeriods: [...formData.quotationPeriods, newQuotationPeriod],
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Cotización
                    </button>
                  </div>

                  {formData.quotationPeriods.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No hay cotizaciones configuradas</p>
                      <p className="text-gray-400 text-sm mt-1">Haga clic en "Agregar Cotización" para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.quotationPeriods.map((quotation, index) => (
                        <div key={quotation.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">Cotización #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  quotationPeriods: formData.quotationPeriods.filter((_, i) => i !== index),
                                });
                              }}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fórmula <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={quotation.formula}
                                onChange={(e) => {
                                  const newQuotationPeriods = [...formData.quotationPeriods];
                                  newQuotationPeriods[index] = {
                                    ...quotation,
                                    formula: e.target.value as 'Mes de Entrega' | 'Mes después de Mes de llegada',
                                  };
                                  setFormData({ ...formData, quotationPeriods: newQuotationPeriods });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="Mes de Entrega">Mes de Entrega</option>
                                <option value="Mes después de Mes de llegada">Mes después de Mes de llegada</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Meses <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={quotation.months}
                                onChange={(e) => {
                                  const newQuotationPeriods = [...formData.quotationPeriods];
                                  newQuotationPeriods[index] = {
                                    ...quotation,
                                    months: e.target.value,
                                  };
                                  setFormData({ ...formData, quotationPeriods: newQuotationPeriods });
                                }}
                                placeholder="Ej: 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Metal <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={quotation.metal}
                                onChange={(e) => {
                                  const newQuotationPeriods = [...formData.quotationPeriods];
                                  newQuotationPeriods[index] = {
                                    ...quotation,
                                    metal: e.target.value,
                                  };
                                  setFormData({ ...formData, quotationPeriods: newQuotationPeriods });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Seleccionar metal...</option>
                                <option value="CU">Cobre (CU)</option>
                                <option value="AG">Plata (AG)</option>
                                <option value="AU">Oro (AU)</option>
                                <option value="PB">Plomo (PB)</option>
                                <option value="ZN">Zinc (ZN)</option>
                              </select>
                            </div>
                          </div>

                          {quotation.formula && quotation.months && quotation.metal && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Fórmula Seleccionada:
                              </p>
                              <p className="text-base font-mono text-blue-800">
                                {quotation.formula === 'Mes de Entrega'
                                  ? `M + ${quotation.months}`
                                  : `MAD + ${quotation.months}`
                                } ({quotation.metal})
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'payments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Términos de Pago</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newPaymentTerm: PaymentTermData = {
                          id: `temp-${Date.now()}`,
                          paymentType: 'provisional',
                          advancePercentage: '',
                          knownElements: '',
                          daysFromIssuance: '',
                        };
                        setFormData({
                          ...formData,
                          paymentTerms: [...formData.paymentTerms, newPaymentTerm],
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Pago
                    </button>
                  </div>

                  {formData.paymentTerms.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No hay términos de pago configurados</p>
                      <p className="text-gray-400 text-sm mt-1">Haga clic en "Agregar Pago" para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.paymentTerms.map((payment, index) => (
                        <div key={payment.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">Pago #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  paymentTerms: formData.paymentTerms.filter((_, i) => i !== index),
                                });
                              }}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Pago
                              </label>
                              <select
                                value={payment.paymentType}
                                onChange={(e) => {
                                  const newPaymentTerms = [...formData.paymentTerms];
                                  newPaymentTerms[index] = {
                                    ...payment,
                                    paymentType: e.target.value as 'provisional' | 'final',
                                    advancePercentage: '',
                                    knownElements: '',
                                  };
                                  setFormData({ ...formData, paymentTerms: newPaymentTerms });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="provisional">Pago Provisional</option>
                                <option value="final">Pago Final</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Días desde Emisión
                              </label>
                              <input
                                type="number"
                                value={payment.daysFromIssuance}
                                onChange={(e) => {
                                  const newPaymentTerms = [...formData.paymentTerms];
                                  newPaymentTerms[index] = {
                                    ...payment,
                                    daysFromIssuance: e.target.value,
                                  };
                                  setFormData({ ...formData, paymentTerms: newPaymentTerms });
                                }}
                                placeholder="Ej: 30"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {payment.paymentType === 'provisional' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Porcentaje de Adelanto (%)
                                </label>
                                <input
                                  type="number"
                                  value={payment.advancePercentage}
                                  onChange={(e) => {
                                    const newPaymentTerms = [...formData.paymentTerms];
                                    newPaymentTerms[index] = {
                                      ...payment,
                                      advancePercentage: e.target.value,
                                    };
                                    setFormData({ ...formData, paymentTerms: newPaymentTerms });
                                  }}
                                  placeholder="Ej: 90"
                                  min="0"
                                  max="100"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            )}

                            {payment.paymentType === 'final' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Elementos Conocidos
                                </label>
                                <select
                                  value={payment.knownElements}
                                  onChange={(e) => {
                                    const newPaymentTerms = [...formData.paymentTerms];
                                    newPaymentTerms[index] = {
                                      ...payment,
                                      knownElements: e.target.value,
                                    };
                                    setFormData({ ...formData, paymentTerms: newPaymentTerms });
                                  }}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Seleccionar...</option>
                                  <option value="peso_humedo">Peso Húmedo</option>
                                  <option value="peso_seco">Peso Seco</option>
                                  <option value="ensayes">Ensayes</option>
                                  <option value="cotizacion">Cotización</option>
                                  <option value="todos">Todos los Elementos</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {formData.paymentTerms.length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Fórmula Seleccionada:
                          </p>
                          <div className="space-y-2">
                            {formData.paymentTerms.map((payment, index) => {
                              const elementosLabel = payment.knownElements
                                ? {
                                    peso_humedo: 'Peso Húmedo',
                                    peso_seco: 'Peso Seco',
                                    ensayes: 'Ensayes',
                                    cotizacion: 'Cotización',
                                    todos: 'Todos los Elementos'
                                  }[payment.knownElements] || payment.knownElements
                                : '';

                              return (
                                <p key={payment.id} className="text-base font-mono text-blue-800">
                                  {payment.paymentType === 'provisional' && payment.advancePercentage && payment.daysFromIssuance && (
                                    <>Pago Provisional - {payment.advancePercentage}% a {payment.daysFromIssuance} días</>
                                  )}
                                  {payment.paymentType === 'final' && payment.knownElements && payment.daysFromIssuance && (
                                    <>Pago Final - A Elementos Conocidos: {elementosLabel} - {payment.daysFromIssuance} días</>
                                  )}
                                  {(!payment.daysFromIssuance ||
                                    (payment.paymentType === 'provisional' && !payment.advancePercentage) ||
                                    (payment.paymentType === 'final' && !payment.knownElements)) && (
                                    <span className="text-gray-500 italic">Pago #{index + 1} - Incompleto</span>
                                  )}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'assay-sampling' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Muestreo de Ensayes</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Est. Ensayes <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.assayStructure}
                        onChange={(e) => updateFormData('assayStructure', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar estructura...</option>
                        <option value="3Party">3Party</option>
                        <option value="3Lots">3Lots</option>
                        <option value="Umpire">Umpire</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Leyes Final <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.assayFinalLab}
                        onChange={(e) => updateFormData('assayFinalLab', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar laboratorio...</option>
                        <option value="Alfred H. Knight del Perú S.A.">Alfred H. Knight del Perú S.A.</option>
                        <option value="Alex Stewart (Assayers) del Perú S.R.L.">Alex Stewart (Assayers) del Perú S.R.L.</option>
                        <option value="SGS del Perú S.A.C.">SGS del Perú S.A.C.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Costos <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.assayCostType}
                        onChange={(e) => updateFormData('assayCostType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar tipo de costo...</option>
                        <option value="Comprador">Comprador</option>
                        <option value="Vendedor">Vendedor</option>
                        <option value="Ambas Partes">Ambas Partes</option>
                      </select>
                    </div>

                    {formData.assayStructure && formData.assayFinalLab && formData.assayCostType && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Fórmula Seleccionada:
                        </p>
                        <p className="text-base font-mono text-blue-800">
                          Est.Ensaye: {formData.assayStructure} - Lab: {formData.assayFinalLab} - Costos: {formData.assayCostType}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentSection === 'waste' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Merma</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aplicación de Merma
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="no_aplica"
                            checked={formData.wasteApplies === 'no_aplica'}
                            onChange={(e) => updateFormData('wasteApplies', e.target.value)}
                            className="mr-2"
                          />
                          No Aplica
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="aplica"
                            checked={formData.wasteApplies === 'aplica'}
                            onChange={(e) => updateFormData('wasteApplies', e.target.value)}
                            className="mr-2"
                          />
                          Aplicar
                        </label>
                      </div>
                    </div>

                    {formData.wasteApplies === 'aplica' && (
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Valor <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.wasteValue}
                              onChange={(e) => updateFormData('wasteValue', e.target.value)}
                              placeholder="Ej: 0.5"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unidad <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.wasteUnit}
                              onChange={(e) => updateFormData('wasteUnit', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="%">%</option>
                              <option value="gtm">gtm</option>
                              <option value="tms">tms</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.wasteApplies === 'aplica' && formData.wasteValue && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Fórmula Seleccionada:
                        </p>
                        <p className="text-base font-mono text-blue-800">
                          Merma: {formData.wasteValue} {formData.wasteUnit}
                        </p>
                      </div>
                    )}

                    {formData.wasteApplies === 'no_aplica' && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600">
                          No se aplicará merma en este contrato
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!['basic', 'incoterm', 'payables', 'penalties', 'quality', 'refining', 'processing', 'processing-escalator', 'refining-escalator', 'quotation-period', 'weight-sampling', 'assay-sampling', 'payments', 'waste'].includes(currentSection) && (
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
              disabled={loading}
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

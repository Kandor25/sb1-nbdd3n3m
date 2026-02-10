import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TemplateDetails {
  id: string;
  name: string;
  description: string;
  product_type: string;
  contract_type: 'purchase' | 'sale';
  incoterm_code: string;
  default_tolerance: number;
  default_h2o_percentage: number;
  duration_months?: number;
  monthly_quantity_tmh?: number;
  monthly_quantity_tms?: number;
  incoterm_delivery_location?: string;
  rollback?: string;
  treatment_charge_usd_per_tms?: number;
  escalator_treatment_charge?: string;
  escalator_refining_expenses?: string;
  payment_provisional_percentage?: number;
  payment_provisional_days?: number;
  payment_provisional_conditions?: string;
  payment_final_conditions?: string;
  pricing_period?: string;
  pricing_period_details?: string;
  pricing_optionality?: boolean;
  pricing_declaration_deadline?: string;
  pricing_fixation_option?: boolean;
  sampling_weights_location?: string;
  sampling_assays_procedure?: string;
  sampling_costs?: string;
  sampling_final_assays?: string;
  loss_percentage?: number;
  payables: Array<{
    metal: string;
    formula_id: string;
    formula_name: string;
    deduction_value: number;
    deduction_unit: string;
    balance_percentage: number;
    market_index_name: string;
  }>;
  penalties: Array<{
    metal: string;
    formula_name: string;
    amount_usd: number;
    lower_limit: number;
    lower_limit_unit: string;
    upper_limit: number;
    upper_limit_unit: string;
  }>;
  quality_specs: Array<{
    metal: string;
    spec_type: string;
    min_value: number | null;
    max_value: number | null;
    unit: string;
    formula_text: string;
  }>;
  refining_expenses: Array<{
    metal: string;
    formula_name: string;
    amount_usd: number;
    unit: string;
  }>;
}

interface ContractTemplatePreviewProps {
  templateId: string;
  onClose: () => void;
  onSelect: () => void;
}

const ContractTemplatePreview: React.FC<ContractTemplatePreviewProps> = ({
  templateId,
  onClose,
  onSelect,
}) => {
  const [template, setTemplate] = useState<TemplateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef<string | null>(null);

  const loadTemplateDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: templateData, error: templateError } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', templateId)
        .maybeSingle();

      if (templateError) {
        setError('Error al cargar la plantilla');
        throw templateError;
      }

      if (!templateData) {
        setError('Plantilla no encontrada');
        return;
      }

      const payablesRes = await supabase
        .from('contract_template_payables')
        .select(`
          *,
          formula:payable_formulas(name),
          market_index:market_indices(name)
        `)
        .eq('template_id', templateId);

      const penaltiesRes = await supabase
        .from('contract_template_penalties')
        .select(`
          *,
          formula:penalty_formulas(name)
        `)
        .eq('template_id', templateId);

      const refiningExpensesRes = await supabase
        .from('contract_template_refining_expenses')
        .select(`
          *,
          formula:refining_expense_formulas(name)
        `)
        .eq('template_id', templateId);

      const qualitySpecsRes = await supabase
        .from('contract_template_quality_specs')
        .select('*')
        .eq('template_id', templateId);


      const payables = (payablesRes.data || []).map((p: any) => ({
        metal: p.metal,
        formula_id: p.formula_id,
        formula_name: p.formula?.name || '',
        deduction_value: p.deduction_value,
        deduction_unit: p.deduction_unit,
        balance_percentage: p.balance_percentage,
        market_index_name: p.market_index?.name || '',
      }));

      const penalties = (penaltiesRes.data || []).map((p: any) => ({
        metal: p.metal,
        formula_name: p.formula?.name || '',
        amount_usd: p.amount_usd,
        lower_limit: p.lower_limit,
        lower_limit_unit: p.lower_limit_unit,
        upper_limit: p.upper_limit,
        upper_limit_unit: p.upper_limit_unit,
      }));

      const refining_expenses = (refiningExpensesRes.data || []).map((r: any) => ({
        metal: r.metal,
        formula_name: r.formula?.name || '',
        amount_usd: r.amount_usd,
        unit: r.unit,
      }));

      const quality_specs = (qualitySpecsRes.data || []).map((q: any) => ({
        metal: q.metal,
        spec_type: q.spec_type,
        min_value: q.min_value,
        max_value: q.max_value,
        unit: q.unit,
        formula_text: q.formula_text,
      }));

      const finalTemplate = {
        ...templateData,
        payables,
        penalties,
        quality_specs,
        refining_expenses,
      };
      setTemplate(finalTemplate);
    } catch (error) {
      setError('Error al cargar los detalles de la plantilla');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    if (loadedRef.current !== templateId) {
      loadedRef.current = templateId;
      loadTemplateDetails();
    }
  }, [templateId, loadTemplateDetails]);

  const formatSpecValue = (spec: any) => {
    if (spec.spec_type === 'range' && spec.min_value !== null && spec.max_value !== null) {
      return `${spec.min_value} - ${spec.max_value} ${spec.unit}`;
    } else if (spec.spec_type === 'minimum' && spec.min_value !== null) {
      return `>= ${spec.min_value} ${spec.unit}`;
    } else if (spec.spec_type === 'maximum' && spec.max_value !== null) {
      return `< ${spec.max_value} ${spec.unit}`;
    }
    return spec.formula_text;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-white mr-3" />
            <h2 className="text-2xl font-bold text-white">Preview de Plantilla</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-gray-600">{template.description}</p>
            <div className="mt-3 flex items-center space-x-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  template.contract_type === 'purchase'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {template.contract_type === 'purchase' ? 'Compra' : 'Venta'}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-700 font-medium">{template.product_type}</span>
            </div>
          </div>

          <div className="space-y-6">
            <Section title="Cantidad/Plazo">
              {template.duration_months && (
                <InfoRow label="Duración" value={`${template.duration_months} meses`} />
              )}
              <InfoRow label="H2O" value={`${template.default_h2o_percentage}%`} />
              {template.monthly_quantity_tmh && template.monthly_quantity_tms && (
                <InfoRow
                  label="Cantidad Mensual"
                  value={`${template.monthly_quantity_tmh} tmh / ${template.monthly_quantity_tms} tms por mes`}
                />
              )}
              <InfoRow label="Tolerancia" value={`${template.default_tolerance}%`} />
            </Section>

            <Section title="Incoterm de Entrega">
              <InfoRow label="Incoterm" value={template.incoterm_code} />
              {template.incoterm_delivery_location && (
                <InfoRow label="Ubicación" value={template.incoterm_delivery_location} />
              )}
            </Section>

            {template.rollback && (
              <Section title="Rollback">
                <InfoRow label="" value={template.rollback} />
              </Section>
            )}

            {template.quality_specs.length > 0 && (
              <Section title="Calidad / Granulometría">
                {template.quality_specs.map((spec, index) => {
                  const metalName = spec.metal === 'CU' ? 'Cobre' :
                                   spec.metal === 'AG' ? 'Plata' :
                                   spec.metal === 'AU' ? 'Oro' : spec.metal;
                  return (
                    <InfoRow
                      key={index}
                      label={`${spec.metal} (${metalName})`}
                      value={formatSpecValue(spec)}
                    />
                  );
                })}
              </Section>
            )}


            {template.payables.length > 0 && (
              <Section title="Pagables">
                {template.payables.map((payable, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="font-semibold text-gray-800 mb-1">
                      {payable.metal} ({payable.metal === 'CU' ? 'Cobre' : payable.metal === 'AG' ? 'Plata' : 'Oro'}):
                    </div>
                    <div className="text-gray-700 pl-4">
                      {payable.formula_name === 'Deducción Porcentual' && (
                        <span>
                          (Ensaye - {payable.deduction_value}{payable.deduction_unit}) × {payable.balance_percentage}%
                        </span>
                      )}
                      {payable.formula_name === 'Deducción Fija' && (
                        <span>
                          (Ensaye - {payable.deduction_value}{payable.deduction_unit}) × 100%
                        </span>
                      )}
                      {payable.market_index_name && (
                        <span className="ml-2">⟹ Índice {payable.market_index_name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {(template.treatment_charge_usd_per_tms !== undefined || template.treatment_charge_usd_per_tms !== null) && (
              <Section title="Maquila o Cargo de Tratamiento">
                <InfoRow
                  label=""
                  value={
                    template.treatment_charge_usd_per_tms === 0
                      ? '$xxx/tms'
                      : `$${template.treatment_charge_usd_per_tms}/tms`
                  }
                />
              </Section>
            )}

            {template.escalator_treatment_charge && (
              <Section title="Escalador en Maquila">
                <InfoRow label="" value={template.escalator_treatment_charge} />
              </Section>
            )}

            {template.refining_expenses.length > 0 && (
              <Section title="Gastos de Refinación">
                {template.refining_expenses.map((expense, index) => (
                  <InfoRow
                    key={index}
                    label={`${expense.metal} (${expense.metal === 'CU' ? 'Cobre' : expense.metal === 'AG' ? 'Plata' : 'Oro'})`}
                    value={
                      expense.formula_name === 'No Aplica'
                        ? 'No Aplica'
                        : `$${expense.amount_usd}/${expense.unit}`
                    }
                  />
                ))}
              </Section>
            )}

            {template.escalator_refining_expenses && (
              <Section title="Escalador en Gastos de Refinación">
                <InfoRow label="" value={template.escalator_refining_expenses} />
              </Section>
            )}

            {template.penalties.length > 0 && (
              <Section title="Penalidades">
                {template.penalties.map((penalty, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="text-gray-700">
                      <span className="font-semibold">{penalty.metal}:</span>{' '}
                      {penalty.formula_name === 'Por cada incremento' ? (
                        <>
                          ${penalty.amount_usd}/tms por cada {penalty.lower_limit}{penalty.lower_limit_unit} por encima de {penalty.upper_limit}{penalty.upper_limit_unit}
                        </>
                      ) : penalty.formula_name === 'Pago único' ? (
                        <>
                          ${penalty.amount_usd}/tms si excede {penalty.upper_limit}{penalty.upper_limit_unit}
                        </>
                      ) : (
                        'No Aplica'
                      )}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {(template.payment_provisional_conditions || template.payment_final_conditions) && (
              <Section title="Pagos">
                {template.payment_provisional_conditions && (
                  <div className="mb-3">
                    <div className="font-semibold text-gray-800 mb-1">Pago Provisional:</div>
                    <div className="text-gray-700 pl-4">{template.payment_provisional_conditions}</div>
                  </div>
                )}
                {template.payment_final_conditions && (
                  <div className="mb-3 last:mb-0">
                    <div className="font-semibold text-gray-800 mb-1">Pago Final:</div>
                    <div className="text-gray-700 pl-4">{template.payment_final_conditions}</div>
                  </div>
                )}
              </Section>
            )}

            {(template.pricing_period || template.pricing_period_details) && (
              <Section title="Período de Cotizaciones">
                {template.pricing_period && (
                  <InfoRow label="Período" value={template.pricing_period} />
                )}
                {template.pricing_period_details && (
                  <div className="text-gray-700 whitespace-pre-line">{template.pricing_period_details}</div>
                )}
                {template.pricing_optionality !== undefined && (
                  <InfoRow label="Opcionalidad" value={template.pricing_optionality ? 'Sí' : 'No'} />
                )}
                {template.pricing_declaration_deadline && (
                  <InfoRow label="Declarable" value={template.pricing_declaration_deadline} />
                )}
                {template.pricing_fixation_option !== undefined && (
                  <InfoRow label="Opción de fijación" value={template.pricing_fixation_option ? 'Sí' : 'No'} />
                )}
              </Section>
            )}

            {(template.sampling_weights_location || template.sampling_assays_procedure) && (
              <Section title="Muestreo">
                {template.sampling_weights_location && (
                  <div className="mb-3">
                    <div className="font-semibold text-gray-800 mb-1">Pesos:</div>
                    <div className="text-gray-700 pl-4">{template.sampling_weights_location}</div>
                  </div>
                )}
                {template.sampling_assays_procedure && (
                  <div className="mb-3">
                    <div className="font-semibold text-gray-800 mb-1">Ensayes:</div>
                    <div className="text-gray-700 pl-4">{template.sampling_assays_procedure}</div>
                  </div>
                )}
                {template.sampling_costs && (
                  <div className="mb-3">
                    <div className="font-semibold text-gray-800 mb-1">Costos:</div>
                    <div className="text-gray-700 pl-4">{template.sampling_costs}</div>
                  </div>
                )}
                {template.sampling_final_assays && (
                  <div className="mb-3 last:mb-0">
                    <div className="font-semibold text-gray-800 mb-1">Leyes finales:</div>
                    <div className="text-gray-700 pl-4">{template.sampling_final_assays}</div>
                  </div>
                )}
              </Section>
            )}

            {template.loss_percentage !== undefined && template.loss_percentage !== null && (
              <Section title="Merma">
                <InfoRow label="" value={`${template.loss_percentage}%`} />
              </Section>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onSelect}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Usar esta Plantilla
          </button>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h4 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
      {title}
    </h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start">
    <span className="font-medium text-gray-700 min-w-[120px]">{label}:</span>
    <span className="text-gray-600 flex-1">{value}</span>
  </div>
);

export default ContractTemplatePreview;

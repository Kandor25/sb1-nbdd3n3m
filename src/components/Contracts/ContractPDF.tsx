import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContractPDFProps {
  contractId: string;
  valuationId: string;
  onClose: () => void;
}

interface ContractData {
  contract_number: string;
  contract_type: string;
  start_month: string;
  end_month: string;
  vendor?: { name: string };
  buyer?: { name: string };
  product?: { name: string };
  country?: { name: string };
  incoterm?: { code: string; description: string };
  delivery_location: string;
  rollback_applies: boolean;
  rollback_value: number;
  rollback_unit: string;
  waste_applies: string;
  waste_value: number;
  waste_unit: string;
}

interface ValuationData {
  weights: Array<{ tmh: number; h2o_percentage: number; tms: number }>;
  prices: Array<{ metal: string; price: number; unit: string }>;
  assays: Array<{ metal: string; assay_value: number; unit: string }>;
  assay_sensitivity: Array<{ metal: string; sensitivity_value: number; unit: string }>;
  price_sensitivity: Array<{ metal: string; price_sensitivity: number; unit: string }>;
}

const ContractPDF: React.FC<ContractPDFProps> = ({ contractId, valuationId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [valuationData, setValuationData] = useState<ValuationData | null>(null);
  const [quotas, setQuotas] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [processing, setProcessing] = useState<any[]>([]);
  const [refiningExpenses, setRefiningExpenses] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [qualitySpecs, setQualitySpecs] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [quotationPeriods, setQuotationPeriods] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [contractId, valuationId]);

  const loadData = async () => {
    try {
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select(`
          *,
          vendor:counterparties!contracts_vendor_id_fkey(name),
          buyer:counterparties!contracts_buyer_id_fkey(name),
          product:products(name),
          country:countries(name),
          incoterm:incoterms(code, description)
        `)
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;
      setContractData(contract);

      const { data: quotasData } = await supabase
        .from('contract_quotas')
        .select('*')
        .eq('contract_id', contractId)
        .order('month');
      setQuotas(quotasData || []);

      const { data: payablesData } = await supabase
        .from('contract_payables')
        .select('*')
        .eq('contract_id', contractId);
      setPayables(payablesData || []);

      const { data: processingData } = await supabase
        .from('contract_processing')
        .select('*')
        .eq('contract_id', contractId);
      setProcessing(processingData || []);

      const { data: refiningData } = await supabase
        .from('contract_refining_expenses')
        .select('*')
        .eq('contract_id', contractId);
      setRefiningExpenses(refiningData || []);

      const { data: penaltiesData } = await supabase
        .from('contract_penalties')
        .select('*')
        .eq('contract_id', contractId);
      setPenalties(penaltiesData || []);

      const { data: qualityData } = await supabase
        .from('contract_quality_specs')
        .select('*')
        .eq('contract_id', contractId);
      setQualitySpecs(qualityData || []);

      const { data: paymentData } = await supabase
        .from('contract_payment_terms')
        .select('*')
        .eq('contract_id', contractId);
      setPaymentTerms(paymentData || []);

      const { data: quotationData } = await supabase
        .from('contract_quotation_periods')
        .select('*')
        .eq('contract_id', contractId);
      setQuotationPeriods(quotationData || []);

      const { data: weights } = await supabase
        .from('valuation_weights')
        .select('*')
        .eq('valuation_id', valuationId);

      const { data: prices } = await supabase
        .from('valuation_prices')
        .select('*')
        .eq('valuation_id', valuationId);

      const { data: assays } = await supabase
        .from('valuation_assays')
        .select('*')
        .eq('valuation_id', valuationId);

      const { data: assaySensitivity } = await supabase
        .from('valuation_assay_sensitivity')
        .select('*')
        .eq('valuation_id', valuationId);

      const { data: priceSensitivity } = await supabase
        .from('valuation_price_sensitivity')
        .select('*')
        .eq('valuation_id', valuationId);

      setValuationData({
        weights: weights || [],
        prices: prices || [],
        assays: assays || [],
        assay_sensitivity: assaySensitivity || [],
        price_sensitivity: priceSensitivity || []
      });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del contrato');
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-lg">Cargando contrato...</p>
        </div>
      </div>
    );
  }

  if (!contractData || !valuationData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">Contrato - Vista Previa</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-white" id="contract-content">
            <div className="space-y-2 mb-8">
              <p className="text-lg"><strong>Vendedor:</strong> {contractData.vendor?.name || 'N/A'}</p>
              <p className="text-lg"><strong>Comprador:</strong> {contractData.buyer?.name || 'N/A'}</p>
              <p className="text-lg"><strong>Producto:</strong> {contractData.product?.name || 'N/A'}</p>
              <p className="text-lg"><strong>Region:</strong> {contractData.country?.name || 'N/A'}</p>
              <p className="text-lg"><strong>Cuotas:</strong> {formatMonth(contractData.start_month)} - {formatMonth(contractData.end_month)}</p>
              <p className="text-xl font-bold mt-4">Contrato {contractData.contract_number}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Detalle por termino</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-2">1. Cantidad/Plazo</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {quotas.map((quota, index) => (
                    <li key={index}>
                      {formatMonth(quota.month)} {'==>'} {quota.tmh}tmh / {quota.tms} tms / {quota.h2o_percentage}% H2O
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">2. Incoterm Entrega</h4>
                <ul className="list-disc list-inside ml-4">
                  <li>{contractData.incoterm?.code} {contractData.delivery_location}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">3. Rollback</h4>
                <ul className="list-disc list-inside ml-4">
                  <li>{contractData.rollback_applies ? `${contractData.rollback_value} ${contractData.rollback_unit}` : 'N/A'}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">4. Calidad / Granulometria</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {qualitySpecs.map((spec, index) => (
                    <li key={index}>
                      {spec.element}: {spec.min_value !== null ? `${spec.min_value} - ${spec.max_value}` : `< ${spec.max_value}`} {spec.unit}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">5. Pagables</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {payables.map((payable, index) => (
                    <li key={index}>
                      {payable.metal}: (Ensaye - {payable.deduction}) * {payable.recovery_percentage}% {'==>'} Indice {payable.price_index}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">6. Maquila o Cargo de Tratamiento</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {processing.map((proc, index) => (
                    <li key={index}>
                      ${proc.amount_usd}/{proc.unit} {contractData.incoterm?.code} {contractData.delivery_location}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">7. Escalador en Maquila</h4>
                <ul className="list-disc list-inside ml-4">
                  <li>N/A</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">8. Gastos de Refinacion</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {refiningExpenses.map((expense, index) => (
                    <li key={index}>
                      {expense.metal}: ${expense.amount_usd}/{expense.unit}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">9. Escalador en Gastos de Refinacion</h4>
                <ul className="list-disc list-inside ml-4">
                  <li>N/A</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">10. Penalidades</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {penalties.map((penalty, index) => (
                    <li key={index}>
                      {penalty.element}: ${penalty.amount_usd}/{penalty.unit} por cada {penalty.increment} por encima {penalty.threshold}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">11. Pagos</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {paymentTerms.map((term, index) => (
                    <li key={index}>
                      Pago {term.payment_type === 'provisional' ? 'Provisional' : 'Final'}.
                      {term.payment_type === 'provisional'
                        ? ` ${term.advance_percentage}% a los ${term.days_from_issuance} días calendario de recibida la factura provisional, una vez cerrado el lote.`
                        : ` Cuando las leyes, pesos y precios de todos los elementos sean conocidos.`}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">12. Periodo de Cotizaciones</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {quotationPeriods.map((period, index) => (
                    <li key={index}>
                      {period.formula === 'Mes de Entrega' ? 'M' : `M+${period.months}`} ({period.formula})
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">13. Muestreo Pesos</h4>
                <ul className="list-disc list-inside ml-4">
                  <li>{contractData.delivery_location}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">14. Muestreo Ensayes</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Procedimiento de dirimencia.</li>
                  <li>Costos asumidos por el Comprador y Vendedor en partes iguales.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">15. Merma</h4>
                <ul className="list-disc list-inside ml-4">
                  <li>{contractData.waste_applies === 'aplica' ? `${contractData.waste_value}%` : 'N/A'}</li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-300">
                <h3 className="text-xl font-bold mb-4">Datos de Valorización Manual</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">Pesos</h4>
                    <table className="w-full border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2">TMH</th>
                          <th className="border border-gray-300 px-4 py-2">H2O (%)</th>
                          <th className="border border-gray-300 px-4 py-2">TMS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valuationData.weights.map((weight, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2 text-center">{weight.tmh}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{weight.h2o_percentage}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{weight.tms}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Precios</h4>
                    <table className="w-full border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2">Metal</th>
                          <th className="border border-gray-300 px-4 py-2">Precio</th>
                          <th className="border border-gray-300 px-4 py-2">Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valuationData.prices.map((price, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">{price.metal}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{price.price}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{price.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Ensayes</h4>
                    <table className="w-full border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2">Metal</th>
                          <th className="border border-gray-300 px-4 py-2">Valor Ensaye</th>
                          <th className="border border-gray-300 px-4 py-2">Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valuationData.assays.map((assay, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">{assay.metal}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{assay.assay_value}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{assay.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Sensibilidad Ensayes</h4>
                    <table className="w-full border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2">Metal</th>
                          <th className="border border-gray-300 px-4 py-2">Valor Sensibilidad</th>
                          <th className="border border-gray-300 px-4 py-2">Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valuationData.assay_sensitivity.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">{item.metal}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{item.sensitivity_value}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Sensibilidad Precios</h4>
                    <table className="w-full border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2">Metal</th>
                          <th className="border border-gray-300 px-4 py-2">Sensibilidad Precio</th>
                          <th className="border border-gray-300 px-4 py-2">Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valuationData.price_sensitivity.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">{item.metal}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{item.price_sensitivity}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPDF;

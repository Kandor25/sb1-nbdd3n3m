import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContractPDFProps {
  contractId: string;
  valuationId: string;
  onClose: () => void;
}

interface ValuationData {
  weights: { tmh: number; h2o_percentage: number; tms: number } | null;
  prices: Array<{ metal: string; price: number; unit: string }>;
  assays: Array<{ metal: string; assay_value: number; unit: string }>;
  assay_sensitivity: Array<{ metal: string; sensitivity_value: number; unit: string }>;
  price_sensitivity: Array<{ metal: string; price_sensitivity: number; unit: string }>;
}

const ContractPDF: React.FC<ContractPDFProps> = ({ contractId, valuationId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);
  const [valuationData, setValuationData] = useState<ValuationData | null>(null);
  const [payables, setPayables] = useState<any[]>([]);
  const [processing, setProcessing] = useState<any[]>([]);
  const [refiningExpenses, setRefiningExpenses] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [contractId, valuationId]);

  const loadData = async () => {
    try {
      console.log('Loading contract data for ID:', contractId);
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (contractError) {
        console.error('Error loading contract:', contractError);
        throw contractError;
      }
      console.log('Contract loaded:', contract);
      setContractData(contract);

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

      console.log('Loading valuation data for ID:', valuationId);
      const { data: weights } = await supabase
        .from('valuation_weights')
        .select('*')
        .eq('valuation_id', valuationId)
        .maybeSingle();

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

      console.log('Valuation data loaded:', { weights, prices, assays, assaySensitivity, priceSensitivity });

      setValuationData({
        weights: weights,
        prices: prices || [],
        assays: assays || [],
        assay_sensitivity: assaySensitivity || [],
        price_sensitivity: priceSensitivity || []
      });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del contrato: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTMNS = () => {
    if (!valuationData?.weights) return 0;
    const { tms } = valuationData.weights;
    const merma = contractData?.waste_value || 0.5;
    return tms * (1 - merma / 100);
  };

  const calculatePayable = (metal: string) => {
    if (!metal || !payables || !valuationData?.assays || !valuationData?.weights) {
      return { formula: '', payablePerMT: 0, totalUSD: 0 };
    }

    const payable = payables.find(p => p.metal?.toLowerCase().includes(metal.toLowerCase()));
    const assay = valuationData.assays.find(a => a.metal?.toLowerCase().includes(metal.toLowerCase()));

    if (!payable || !assay) return { formula: '', payablePerMT: 0, totalUSD: 0 };

    const assayValue = assay.assay_value;
    const deduction = parseFloat(payable.deduction) || 0;
    const recovery = parseFloat(payable.recovery_percentage) || 100;

    const payablePerMT = ((assayValue - deduction) * recovery) / 100;

    const price = valuationData.prices?.find(p => p.metal?.toLowerCase().includes(metal.toLowerCase()));
    const priceValue = price?.price || 0;

    let totalUSD = 0;
    const tmns = calculateTMNS();

    if (metal.toLowerCase().includes('cobre') || metal.toLowerCase().includes('cu')) {
      totalUSD = (payablePerMT / 100) * 2204.62 * (priceValue / 2204.62) * tmns;
    } else if (metal.toLowerCase().includes('plata') || metal.toLowerCase().includes('ag')) {
      totalUSD = payablePerMT * 0.0321507 * priceValue * tmns;
    } else if (metal.toLowerCase().includes('oro') || metal.toLowerCase().includes('au')) {
      totalUSD = payablePerMT * 0.0321507 * priceValue * tmns;
    }

    return {
      formula: `Ded ${deduction} Pagable ${recovery}%`,
      payablePerMT: payablePerMT.toFixed(3),
      totalUSD: totalUSD.toFixed(2)
    };
  };

  const calculateProcessingCost = () => {
    if (!processing.length || !valuationData?.weights) return 0;
    const proc = processing[0];
    const tmns = calculateTMNS();
    return -(parseFloat(proc.amount_usd) || 0) * tmns;
  };

  const calculateRefiningCost = (metal: string) => {
    if (!metal || !refiningExpenses || !valuationData?.weights) return 0;

    const expense = refiningExpenses.find(e => e.metal?.toLowerCase().includes(metal.toLowerCase()));
    if (!expense) return 0;

    const payableCalc = calculatePayable(metal);
    const payablePerMT = parseFloat(payableCalc.payablePerMT);
    const tmns = calculateTMNS();
    const expenseValue = parseFloat(expense.amount_usd) || 0;

    if (expense.unit === '$/lb') {
      return -(payablePerMT / 100) * 2204.62 * expenseValue * tmns;
    } else if (expense.unit === '$/oz') {
      return -payablePerMT * 0.0321507 * expenseValue * tmns;
    }

    return 0;
  };

  const calculatePenalty = (element: string) => {
    if (!element || !penalties || !valuationData?.weights || !valuationData?.assays) return 0;

    const penalty = penalties.find(p => p.element?.toLowerCase().includes(element.toLowerCase()));
    if (!penalty) return 0;

    const assay = valuationData.assays.find(a => a.metal?.toLowerCase().includes(element.toLowerCase()));
    if (!assay) return 0;

    const threshold = parseFloat(penalty.threshold) || 0;
    const assayValue = assay.assay_value;
    const increment = parseFloat(penalty.increment) || 1;
    const amountUSD = parseFloat(penalty.amount_usd) || 0;
    const tmns = calculateTMNS();

    if (assayValue > threshold) {
      const excess = assayValue - threshold;
      const multiplier = excess / increment;
      return -amountUSD * multiplier * tmns;
    }

    return 0;
  };

  const calculatePriceSensitivity = (metal: string) => {
    if (!metal || !valuationData?.price_sensitivity || !valuationData?.weights) {
      return { perTMS: 0, total: 0 };
    }

    const priceSens = valuationData.price_sensitivity.find(p =>
      p.metal?.toLowerCase().includes(metal.toLowerCase())
    );

    if (!priceSens) return { perTMS: 0, total: 0 };

    const payableCalc = calculatePayable(metal);
    const payablePerMT = parseFloat(payableCalc.payablePerMT);
    const tmns = calculateTMNS();
    const sensitivityValue = priceSens.price_sensitivity;

    let perTMS = 0;

    if (metal.toLowerCase().includes('cobre') || metal.toLowerCase().includes('cu')) {
      perTMS = (payablePerMT / 100) * 2204.62 * (sensitivityValue / 2204.62);
    } else if (metal.toLowerCase().includes('plata') || metal.toLowerCase().includes('ag')) {
      perTMS = payablePerMT * 0.0321507 * sensitivityValue;
    } else if (metal.toLowerCase().includes('oro') || metal.toLowerCase().includes('au')) {
      perTMS = payablePerMT * 0.0321507 * sensitivityValue;
    }

    return {
      perTMS: perTMS.toFixed(2),
      total: (perTMS * tmns).toFixed(0)
    };
  };

  const calculateAssaySensitivity = (metal: string) => {
    if (!metal || !valuationData?.assay_sensitivity || !payables || !valuationData?.prices || !valuationData?.weights) {
      return { perTMS: 0, total: 0 };
    }

    const assaySens = valuationData.assay_sensitivity.find(a =>
      a.metal?.toLowerCase().includes(metal.toLowerCase())
    );

    const payable = payables.find(p => p.metal?.toLowerCase().includes(metal.toLowerCase()));
    const price = valuationData.prices.find(p => p.metal?.toLowerCase().includes(metal.toLowerCase()));

    if (!assaySens || !payable || !price) return { perTMS: 0, total: 0 };

    const recovery = parseFloat(payable.recovery_percentage) || 100;
    const priceValue = price.price;
    const tmns = calculateTMNS();
    const sensitivityValue = assaySens.sensitivity_value;

    let perTMS = 0;

    if (metal.toLowerCase().includes('cobre') || metal.toLowerCase().includes('cu')) {
      perTMS = (sensitivityValue * recovery / 100 / 100) * 2204.62 * (priceValue / 2204.62);
    } else if (metal.toLowerCase().includes('plata') || metal.toLowerCase().includes('ag')) {
      perTMS = (sensitivityValue * recovery / 100) * 0.0321507 * priceValue;
    } else if (metal.toLowerCase().includes('oro') || metal.toLowerCase().includes('au')) {
      perTMS = (sensitivityValue * recovery / 100) * 0.0321507 * priceValue;
    }

    return {
      perTMS: perTMS.toFixed(2),
      total: (perTMS * tmns).toFixed(0)
    };
  };

  const calculateTotal = () => {
    let total = 0;

    if (payables && Array.isArray(payables)) {
      payables.forEach(payable => {
        if (payable?.metal) {
          const calc = calculatePayable(payable.metal);
          total += parseFloat(calc.totalUSD) || 0;
        }
      });
    }

    total += calculateProcessingCost();

    if (refiningExpenses && Array.isArray(refiningExpenses)) {
      refiningExpenses.forEach(expense => {
        if (expense?.metal) {
          total += calculateRefiningCost(expense.metal);
        }
      });
    }

    if (penalties && Array.isArray(penalties)) {
      penalties.forEach(penalty => {
        if (penalty?.element) {
          total += calculatePenalty(penalty.element);
        }
      });
    }

    return total;
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-lg">Cargando valorización...</p>
        </div>
      </div>
    );
  }

  if (!contractData || !valuationData || !valuationData.weights) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error</h3>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los datos de la valorización. Por favor, verifica que todos los datos se hayan guardado correctamente.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const formatMonth = (month: string) => {
    if (!month) return 'N/A';
    try {
      const [year, monthNum] = month.split('-').map(Number);
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[monthNum - 1]} ${year}`;
    } catch (error) {
      console.error('Error formatting month:', error);
      return month;
    }
  };

  const tmns = calculateTMNS();
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">Valorización - Vista Previa</h2>
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
          <div className="max-w-5xl mx-auto bg-white">
            <div className="border-2 border-black mb-4">
              <div className="bg-gray-200 border-b border-black px-4 py-2">
                <strong>Cuota</strong>
              </div>
              <div className="px-4 py-2">
                {formatMonth(contractData.start_month)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="border-2 border-black">
                  <div className="bg-gray-200 border-b border-black px-4 py-2">
                    <strong>Ensayes provisionales</strong>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="border-r border-black px-2 py-1 text-left">Elemento</th>
                        <th className="border-r border-black px-2 py-1 text-left">Unidades</th>
                        <th className="px-2 py-1 text-left">UdM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valuationData.assays && valuationData.assays.length > 0 ? (
                        valuationData.assays.map((assay, index) => (
                          <tr key={index} className="border-b border-gray-300">
                            <td className="border-r border-black px-2 py-1">{assay.metal || 'N/A'}</td>
                            <td className="border-r border-black px-2 py-1 text-right">{assay.assay_value || 0}</td>
                            <td className="px-2 py-1">{assay.unit || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-2 py-1 text-center text-gray-500">No hay datos</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-2 border-black mt-4">
                  <div className="bg-gray-200 border-b border-black px-4 py-2">
                    <strong>Pesos Provisionales</strong>
                  </div>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">TMH</td>
                        <td className="px-2 py-1 text-right">{valuationData.weights.tmh}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">H2O</td>
                        <td className="px-2 py-1 text-right">{valuationData.weights.h2o_percentage}%</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">TMS</td>
                        <td className="px-2 py-1 text-right">{valuationData.weights.tms}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">Merma</td>
                        <td className="px-2 py-1 text-right">{contractData.waste_value || 0.5}%</td>
                      </tr>
                      <tr>
                        <td className="border-r border-black px-2 py-1 font-semibold">TMNS</td>
                        <td className="px-2 py-1 text-right">{tmns.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="border-2 border-black">
                  <div className="bg-gray-200 border-b border-black px-4 py-2">
                    <strong>Precios provisionales</strong>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="border-r border-black px-2 py-1 text-left">Elemento</th>
                        <th className="border-r border-black px-2 py-1 text-left">Divisa</th>
                        <th className="border-r border-black px-2 py-1 text-right">Precio</th>
                        <th className="border-r border-black px-2 py-1 text-left">Index</th>
                        <th className="px-2 py-1 text-left">QP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valuationData.prices && valuationData.prices.length > 0 ? (
                        valuationData.prices.map((price, index) => (
                          <tr key={index} className="border-b border-gray-300">
                            <td className="border-r border-black px-2 py-1">{price.metal || 'N/A'}</td>
                            <td className="border-r border-black px-2 py-1">{price.unit?.includes('$') ? 'USD' : (price.unit || 'N/A')}</td>
                            <td className="border-r border-black px-2 py-1 text-right">${(price.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td className="border-r border-black px-2 py-1">-</td>
                            <td className="px-2 py-1">-</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-2 py-1 text-center text-gray-500">No hay datos</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-2 border-black mt-4">
                  <div className="bg-gray-200 border-b border-black px-4 py-2">
                    <strong>Sensibilidad</strong>
                  </div>
                  <div className="px-2 py-2">
                    <div className="font-semibold mb-2">Precios en Pagables</div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left"></th>
                          <th className="text-right">$/TMS (+/-)</th>
                          <th className="text-right">Total (+/-)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payables && payables.length > 0 ? (
                          payables.map((payable, index) => {
                            const sens = calculatePriceSensitivity(payable.metal);
                            return (
                              <tr key={index}>
                                <td className="text-left text-xs">{payable.metal || 'N/A'} (por cada +/- sensibilidad)</td>
                                <td className="text-right">${sens.perTMS}</td>
                                <td className="text-right">${sens.total}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={3} className="text-center text-gray-500 text-xs">No hay datos</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <div className="font-semibold mt-3 mb-2">Leyes en Pagables</div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left"></th>
                          <th className="text-right">$/TMS (+/-)</th>
                          <th className="text-right">Total (+/-)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payables && payables.length > 0 ? (
                          payables.map((payable, index) => {
                            const sens = calculateAssaySensitivity(payable.metal);
                            return (
                              <tr key={index}>
                                <td className="text-left text-xs">{payable.metal || 'N/A'} (por cada +/- sensibilidad en ley)</td>
                                <td className="text-right">${sens.perTMS}</td>
                                <td className="text-right">${sens.total}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={3} className="text-center text-gray-500 text-xs">No hay datos</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-black mb-4">
              <div className="bg-gray-200 border-b border-black px-4 py-2">
                <strong>Metales Pagables</strong>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black">
                    <th className="border-r border-black px-2 py-1 text-left">Metal</th>
                    <th className="border-r border-black px-2 py-1 text-left">Formula</th>
                    <th className="border-r border-black px-2 py-1 text-right">Pagable por MT</th>
                    <th className="border-r border-black px-2 py-1 text-right">$/TMS</th>
                    <th className="px-2 py-1 text-right">Total $</th>
                  </tr>
                </thead>
                <tbody>
                  {payables && payables.length > 0 ? (
                    payables.map((payable, index) => {
                      const calc = calculatePayable(payable.metal);
                      return (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="border-r border-black px-2 py-1">{payable.metal || 'N/A'}</td>
                          <td className="border-r border-black px-2 py-1">{calc.formula}</td>
                          <td className="border-r border-black px-2 py-1 text-right">{calc.payablePerMT}</td>
                          <td className="border-r border-black px-2 py-1 text-right">$</td>
                          <td className="px-2 py-1 text-right">${parseFloat(calc.totalUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2 py-1 text-center text-gray-500">No hay datos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-2 border-black mb-4">
              <div className="bg-gray-200 border-b border-black px-4 py-2">
                <strong>Deducciones</strong>
              </div>
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="border-r border-black px-2 py-1 font-semibold" colSpan={2}>Cargo de Tratamiento o Maquila</td>
                    <td className="border-r border-black px-2 py-1">Peso base</td>
                    <td className="border-r border-black px-2 py-1 text-right">$/TMS</td>
                    <td className="px-2 py-1 text-right font-semibold">Total $</td>
                  </tr>
                  {processing && processing.length > 0 ? (
                    processing.map((proc, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1" colSpan={2}>{proc.amount_usd || 0}</td>
                        <td className="border-r border-black px-2 py-1">TMS</td>
                        <td className="border-r border-black px-2 py-1 text-right">-{proc.amount_usd || 0}</td>
                        <td className="px-2 py-1 text-right text-red-600">${calculateProcessingCost().toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2 py-1 text-center text-gray-500">No hay datos</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <table className="w-full mt-2">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="border-r border-black px-2 py-1 font-semibold" colSpan={2}>Cargo de Refinacion</td>
                    <td className="border-r border-black px-2 py-1"></td>
                    <td className="border-r border-black px-2 py-1 text-right">$/TMS</td>
                    <td className="px-2 py-1 text-right font-semibold">Total $</td>
                  </tr>
                  {refiningExpenses && refiningExpenses.length > 0 ? (
                    refiningExpenses.map((expense, index) => {
                      const cost = calculateRefiningCost(expense.metal);
                      return (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="border-r border-black px-2 py-1">{expense.metal || 'N/A'}</td>
                          <td className="border-r border-black px-2 py-1">{expense.amount_usd || 0} {expense.unit || 'N/A'}</td>
                          <td className="border-r border-black px-2 py-1"></td>
                          <td className="border-r border-black px-2 py-1 text-right">-{Math.abs(cost / tmns).toFixed(4)}</td>
                          <td className="px-2 py-1 text-right text-red-600">${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2 py-1 text-center text-gray-500">No hay datos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-2 border-black mb-4">
              <div className="bg-gray-200 border-b border-black px-4 py-2">
                <strong>Penalidades</strong>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black">
                    <th className="border-r border-black px-2 py-1 text-left">Elemento</th>
                    <th className="border-r border-black px-2 py-1 text-left">Formula</th>
                    <th className="border-r border-black px-2 py-1 text-right">$/TMS</th>
                    <th className="px-2 py-1 text-right">Total $</th>
                  </tr>
                </thead>
                <tbody>
                  {penalties && penalties.length > 0 ? (
                    penalties.map((penalty, index) => {
                      const cost = calculatePenalty(penalty.element);
                      return (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="border-r border-black px-2 py-1">{penalty.element || 'N/A'}</td>
                          <td className="border-r border-black px-2 py-1">${penalty.amount_usd || 0} por cada {penalty.increment || 1} por encima de {penalty.threshold || 0}</td>
                          <td className="border-r border-black px-2 py-1 text-right">{(cost / tmns).toFixed(4)}</td>
                          <td className="px-2 py-1 text-right text-red-600">${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-2 py-1 text-center text-gray-500">No hay datos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-2 border-black bg-yellow-100">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="border-r border-black px-4 py-2 font-bold">Total</td>
                    <td className="border-r border-black px-4 py-2 text-right font-bold">$/TMS</td>
                    <td className="px-4 py-2 text-right font-bold text-lg">Total $</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black px-4 py-2"></td>
                    <td className="border-r border-black px-4 py-2 text-right font-bold">{(total / tmns).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-bold text-xl text-green-700">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPDF;

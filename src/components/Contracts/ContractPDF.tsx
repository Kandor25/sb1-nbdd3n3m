import React from 'react';
import { X, Download } from 'lucide-react';

interface ContractPDFProps {
  contractId: string;
  valuationId: string;
  onClose: () => void;
}

const ContractPDF: React.FC<ContractPDFProps> = ({ onClose }) => {
  // DATOS ESTÁTICOS PARA DEMO - Basados en el PDF de ejemplo
  const demoData = {
    // Cuota
    month: 'Ene 2025',

    // Ensayes provisionales
    assays: [
      { element: 'Cu', value: 28.50, unit: '%' },
      { element: 'Au', value: 1.25, unit: 'gr/TM' },
      { element: 'Ag', value: 45.00, unit: 'gr/TM' },
      { element: 'As', value: 0.85, unit: '%' },
      { element: 'Pb', value: 0.45, unit: '%' }
    ],

    // Pesos provisionales
    weights: {
      tmh: 1086.96,
      h2o: 8.0,
      tms: 1000.00,
      merma: 0.5,
      tmns: 995.00
    },

    // Precios provisionales
    prices: [
      { element: 'Cu', currency: 'USD', price: 8500.00, index: 'LME', qp: 'M+3' },
      { element: 'Au', currency: 'USD', price: 1950.00, index: 'LBMA', qp: 'M+3' },
      { element: 'Ag', currency: 'USD', price: 24.50, index: 'LBMA', qp: 'M+3' }
    ],

    // Sensibilidad - Precios en Pagables
    priceSensitivity: [
      { element: 'Cu', perTMS: 54.21, total: 53939, change: '+/- 100' },
      { element: 'Au', perTMS: 1.94, total: 1930, change: '+/- 50' },
      { element: 'Ag', perTMS: 1.65, total: 1642, change: '+/- 1' }
    ],

    // Sensibilidad - Leyes en Pagables
    assaySensitivity: [
      { element: 'Cu', perTMS: 16.37, total: 16288, change: '+/- 0.1%' },
      { element: 'Au', perTMS: 5.99, total: 5960, change: '+/- 0.1 gr/TM' },
      { element: 'Ag', perTMS: 0.75, total: 746, change: '+/- 1 gr/TM' }
    ],

    // Metales Pagables
    payables: [
      { metal: 'Cobre', formula: 'Ded 1.0 Pagable 96.5%', payablePerMT: 26.538, perTMS: 454.26, total: 451989.70 },
      { metal: 'Oro', formula: 'Ded 1.0 Pagable 95.0%', payablePerMT: 0.214, perTMS: 13.37, total: 13303.15 },
      { metal: 'Plata', formula: 'Ded 30 Pagable 90.0%', payablePerMT: 13.500, perTMS: 10.63, total: 10576.85 }
    ],

    // Maquila
    processing: {
      description: 'TC/RC',
      amount: 85.00,
      base: 'TMS',
      perTMS: -85.00,
      total: -84575.00
    },

    // Gastos de Refinación
    refiningExpenses: [
      { metal: 'Cu', amount: 0.085, unit: '$/Lb', perTMS: -4.98, total: -4955.11 },
      { metal: 'Au', amount: 6.50, unit: '$/OzTr', perTMS: -1.39, total: -1383.70 },
      { metal: 'Ag', amount: 0.65, unit: '$/OzTr', perTMS: -0.28, total: -278.62 }
    ],

    // Penalidades
    penalties: [
      { element: 'As', formula: '$2.50 por cada 0.1% por encima de 0.5%', perTMS: -8.75, total: -8706.25 },
      { element: 'Pb', formula: '$1.80 por cada 0.1% por encima de 0.3%', perTMS: -2.70, total: -2686.50 }
    ],

    // Total
    total: {
      perTMS: 365.16,
      totalUSD: 363284.52
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto bg-white">
            {/* Cuota */}
            <div className="border-2 border-black mb-4">
              <div className="bg-gray-200 border-b border-black px-4 py-2">
                <strong>Cuota</strong>
              </div>
              <div className="px-4 py-2">
                {demoData.month}
              </div>
            </div>

            {/* Grid de Ensayes/Pesos y Precios/Sensibilidad */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Columna Izquierda */}
              <div>
                {/* Ensayes provisionales */}
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
                      {demoData.assays.map((assay, index) => (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="border-r border-black px-2 py-1">{assay.element}</td>
                          <td className="border-r border-black px-2 py-1 text-right">{assay.value}</td>
                          <td className="px-2 py-1">{assay.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pesos Provisionales */}
                <div className="border-2 border-black mt-4">
                  <div className="bg-gray-200 border-b border-black px-4 py-2">
                    <strong>Pesos Provisionales</strong>
                  </div>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">TMH</td>
                        <td className="px-2 py-1 text-right">{demoData.weights.tmh.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">H2O</td>
                        <td className="px-2 py-1 text-right">{demoData.weights.h2o}%</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">TMS</td>
                        <td className="px-2 py-1 text-right">{demoData.weights.tms.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-black px-2 py-1 font-semibold">Merma</td>
                        <td className="px-2 py-1 text-right">{demoData.weights.merma}%</td>
                      </tr>
                      <tr>
                        <td className="border-r border-black px-2 py-1 font-semibold">TMNS</td>
                        <td className="px-2 py-1 text-right">{demoData.weights.tmns.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Columna Derecha */}
              <div>
                {/* Precios provisionales */}
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
                      {demoData.prices.map((price, index) => (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="border-r border-black px-2 py-1">{price.element}</td>
                          <td className="border-r border-black px-2 py-1">{price.currency}</td>
                          <td className="border-r border-black px-2 py-1 text-right">${price.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="border-r border-black px-2 py-1">{price.index}</td>
                          <td className="px-2 py-1">{price.qp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sensibilidad */}
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
                        {demoData.priceSensitivity.map((sens, index) => (
                          <tr key={index}>
                            <td className="text-left text-xs">{sens.element} (por cada {sens.change})</td>
                            <td className="text-right">${sens.perTMS.toFixed(2)}</td>
                            <td className="text-right">${sens.total.toLocaleString('en-US')}</td>
                          </tr>
                        ))}
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
                        {demoData.assaySensitivity.map((sens, index) => (
                          <tr key={index}>
                            <td className="text-left text-xs">{sens.element} (por cada {sens.change})</td>
                            <td className="text-right">${sens.perTMS.toFixed(2)}</td>
                            <td className="text-right">${sens.total.toLocaleString('en-US')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Metales Pagables */}
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
                  {demoData.payables.map((payable, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="border-r border-black px-2 py-1">{payable.metal}</td>
                      <td className="border-r border-black px-2 py-1">{payable.formula}</td>
                      <td className="border-r border-black px-2 py-1 text-right">{payable.payablePerMT.toFixed(3)}</td>
                      <td className="border-r border-black px-2 py-1 text-right">${payable.perTMS.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">${payable.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cargo de Tratamiento o Maquila */}
            <div className="border-2 border-black mb-4">
              <div className="bg-gray-200 border-b border-black px-4 py-2">
                <strong>Cargo de Tratamiento o Maquila</strong>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black">
                    <th className="border-r border-black px-2 py-1 text-left" colSpan={2}>Descripción</th>
                    <th className="border-r border-black px-2 py-1 text-left">Peso base</th>
                    <th className="border-r border-black px-2 py-1 text-right">$/TMS</th>
                    <th className="px-2 py-1 text-right">Total $</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="border-r border-black px-2 py-1" colSpan={2}>{demoData.processing.description}</td>
                    <td className="border-r border-black px-2 py-1">{demoData.processing.base}</td>
                    <td className="border-r border-black px-2 py-1 text-right">{demoData.processing.perTMS.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right text-red-600">${demoData.processing.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cargo de Refinación */}
            <div className="border-2 border-black mb-4">
              <div className="bg-gray-200 border-b border-black px-4 py-2">
                <strong>Cargo de Refinación</strong>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black">
                    <th className="border-r border-black px-2 py-1 text-left">Metal</th>
                    <th className="border-r border-black px-2 py-1 text-left">Monto</th>
                    <th className="border-r border-black px-2 py-1 text-left"></th>
                    <th className="border-r border-black px-2 py-1 text-right">$/TMS</th>
                    <th className="px-2 py-1 text-right">Total $</th>
                  </tr>
                </thead>
                <tbody>
                  {demoData.refiningExpenses.map((expense, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="border-r border-black px-2 py-1">{expense.metal}</td>
                      <td className="border-r border-black px-2 py-1">{expense.amount} {expense.unit}</td>
                      <td className="border-r border-black px-2 py-1"></td>
                      <td className="border-r border-black px-2 py-1 text-right">{expense.perTMS.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right text-red-600">${expense.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Penalidades */}
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
                  {demoData.penalties.map((penalty, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="border-r border-black px-2 py-1">{penalty.element}</td>
                      <td className="border-r border-black px-2 py-1">{penalty.formula}</td>
                      <td className="border-r border-black px-2 py-1 text-right">{penalty.perTMS.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right text-red-600">${penalty.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
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
                    <td className="border-r border-black px-4 py-2 text-right font-bold">${demoData.total.perTMS.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-bold text-xl text-green-700">${demoData.total.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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

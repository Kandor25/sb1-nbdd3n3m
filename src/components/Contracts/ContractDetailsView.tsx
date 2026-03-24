import React, { useRef } from 'react';
import { X, Download } from 'lucide-react';

interface ContractDetailsViewProps {
  onClose: () => void;
}

const ContractDetailsView: React.FC<ContractDetailsViewProps> = ({ onClose }) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printContentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = printContentRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalle del Contrato</title>
          <style>
            @page {
              size: letter;
              margin: 0.75in;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #000;
              background: white;
            }

            h3 {
              font-size: 14pt;
              font-weight: bold;
              margin-top: 1em;
              margin-bottom: 0.5em;
              page-break-after: avoid;
            }

            h4 {
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 0.5em;
              page-break-after: avoid;
            }

            .header-info {
              margin-bottom: 2em;
            }

            .header-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.5em;
              margin-bottom: 1em;
            }

            .header-item {
              margin-bottom: 0.5em;
            }

            .header-label {
              font-size: 9pt;
              color: #666;
              margin-bottom: 0.2em;
            }

            .header-value {
              font-weight: 600;
              color: #000;
            }

            .section {
              border-left: 4px solid #2563eb;
              padding-left: 1em;
              margin-bottom: 1.5em;
              page-break-inside: avoid;
            }

            .section-content {
              margin-top: 0.5em;
            }

            .item-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.3em;
            }

            .item {
              margin-bottom: 0.3em;
            }

            .nested-list {
              margin-left: 2em;
              margin-top: 0.3em;
            }

            p {
              margin-bottom: 0.3em;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Detalle del Contrato</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header Information */}
              <div className="mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Vendedor:</p>
                  <p className="font-semibold text-gray-900">Mineria Proton S.A.C.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comprador:</p>
                  <p className="font-semibold text-gray-900">Trader A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Producto:</p>
                  <p className="font-semibold text-gray-900">Concentrado de Cobre</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Región:</p>
                  <p className="font-semibold text-gray-900">Peru</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Cuotas:</p>
                  <p className="font-semibold text-gray-900">Dic2025-Dic2026</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Contrato Entregas 2025</h3>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* 1. Cantidad/Plazo */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">1. Cantidad/Plazo</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• Diciembre 2025 =&gt; 330tmh / 300 tms / 10% H2O</div>
                  <div>• Enero 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
                  <div>• Febrero 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
                  <div>• Marzo 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
                  <div>• Abril 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
                  <div>• Mayo 2026 / 330tmh / 300 tms / 10% H2O</div>
                  <div>• Junio 2026 / 330tmh / 300 tms / 10% H2O</div>
                  <div>• Julio 2026 / 330tmh / 300 tms / 10% H2O</div>
                  <div>• Agosto 2026 / 330tmh / 300 tms / 10% H2O</div>
                  <div>• Septiembre 2026 / 330tmh / 300 tms / 10% H2O</div>
                  <div>• Octubre 2026 / 330tmh / 300 tms / 10% H2O</div>
                  <div>• Noviembre 2026 /330tmh / 300 tms / 10% H2O</div>
                  <div>• Diciembre 2026 / 330tmh / 300 tms / 10% H2O</div>
                </div>
              </div>

              {/* 2. Incoterm Entrega */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">2. Incoterm Entrega</h4>
                <p className="text-sm">• DAP Impala Terminals Callao.</p>
              </div>

              {/* 3. Rollback */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">3. Rollback</h4>
                <p className="text-sm">• N/A</p>
              </div>

              {/* 4. Calidad / Granulometria */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">4. Calidad / Granulometria</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• Cu: 22 – 35 %</div>
                  <div>• Ag: 80 – 200 g/tms</div>
                  <div>• Au: 5 – 10 g/tms</div>
                  <div>• As &lt; 0.25 %</div>
                  <div>• Sb &lt; 0.10 %</div>
                  <div>• Pb &lt; 3 %</div>
                  <div>• Zn &lt; 3 %</div>
                  <div>• Fe: 20 – 28 %</div>
                  <div>• Bi &lt; 0.10 %</div>
                  <div>• F &lt; 300 ppm</div>
                  <div>• Cd &lt; 300 ppm</div>
                  <div>• Hg &lt; 10 ppm</div>
                </div>
                <p className="text-sm mt-2">• Granulometria =&gt; 100% &lt; 1/8", mín 90% &lt; 149μm (malla 100).</p>
              </div>

              {/* 5. Pagables */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">5. Pagables</h4>
                <div className="space-y-1 text-sm">
                  <p>• Cobre (Cu): (Ensaye - 1.2%) * 100% =&gt; Indice LME Lowest of the Four.</p>
                  <p>• Plata (Ag): (Ensaye - 50g/tms) * 90% =&gt; Indice LBMA Silver.</p>
                  <p>• Oro (Au): (Ensaye-1.5g/tms) * 90% =&gt; Indice LBMA Final (o PM).</p>
                </div>
              </div>

              {/* 6. Maquila o Cargo de Tratamiento */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">6. Maquila o Cargo de Tratamiento</h4>
                <p className="text-sm">• $70/tms DAP Depósito Impala en el Callao</p>
              </div>

              {/* 7. Escalador en Maquila */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">7. Escalador en Maquila</h4>
                <p className="text-sm">• N/A</p>
              </div>

              {/* 8. Gastos de Refinacion */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">8. Gastos de Refinacion</h4>
                <div className="space-y-1 text-sm">
                  <p>• Cobre (Cu): $0.070/lb</p>
                  <p>• Plata (Ag): $1.0/oz</p>
                  <p>• Oro (Au): $10/oz</p>
                </div>
              </div>

              {/* 9. Escalador en Gastos de Refinacion */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">9. Escalador en Gastos de Refinacion</h4>
                <p className="text-sm">• N/A</p>
              </div>

              {/* 10. Penalidades */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">10. Penalidades</h4>
                <div className="space-y-1 text-sm">
                  <p>• Arsenico + Antimonio (As+Sb): $4/tms por cada c/0.1% encima 0.20%</p>
                  <p>• Plomo + Zinc (Pb+Zn): $2.5/tms por cada 1% por encima 5%</p>
                  <p>• Bismuto (Bi): $2.5/tms por cada 0.01% por encima 0.05%</p>
                  <p>• Mercurio (Hg): $2.50/tms por cada 10ppm por encima 30ppm</p>
                </div>
              </div>

              {/* 11. Pagos */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">11. Pagos</h4>
                <div className="space-y-1 text-sm">
                  <p>• Pago Provisional. 90% a los 4 días calendario de recibida la factura provisional, una vez cerrado el lote.</p>
                  <p>• Pago Final: Cuando las leyes, pesos y precios de todos los elementos sean conocidos.</p>
                </div>
              </div>

              {/* 12. Periodo de Cotizaciones */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">12. Periodo de Cotizaciones</h4>
                <div className="space-y-1 text-sm">
                  <p>• M+1 (promedio del siguiente mes de entrega)</p>
                  <p>• M+3 (promedio del tercer mes siguiente al mes de entrega)</p>
                  <p>• Opcionalidad definidad por =&gt; Comprador</p>
                  <p>• M = mes de entrega en depósito</p>
                  <p>• Opcion de fijacion para el vendedor =&gt; Si</p>
                </div>
              </div>

              {/* 13. Muestreo Pesos */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">13. Muestreo Pesos</h4>
                <p className="text-sm">• Depósito de Impala Terminals Perú S.A.C. en el Callao.</p>
              </div>

              {/* 14. Muestreo Ensayes */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">14. Muestreo Ensayes</h4>
                <div className="space-y-1 text-sm">
                  <p>• Procedimiento de dirimencia.</p>
                  <p>• Costos asumidos por el Comprador y Vendedor en partes iguales.</p>
                  <p>• Leyes finales =&gt; promedio de las leyes reportadas por:</p>
                  <div className="ml-6 space-y-1">
                    <p>1. Alfred H. Knight del Perú S.A.</p>
                    <p>2. Alex Stewart (Assayers) del Perú S.R.L.</p>
                    <p>3. SGS del Perú S.A.C.</p>
                  </div>
                </div>
              </div>

              {/* 15. Merma */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-3">15. Merma</h4>
                <p className="text-sm">• 0.5%</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden content for printing */}
      <div ref={printContentRef} style={{ display: 'none' }}>
        <div className="header-info">
          <div className="header-grid">
            <div className="header-item">
              <div className="header-label">Vendedor:</div>
              <div className="header-value">Mineria Proton S.A.C.</div>
            </div>
            <div className="header-item">
              <div className="header-label">Comprador:</div>
              <div className="header-value">Trader A</div>
            </div>
            <div className="header-item">
              <div className="header-label">Producto:</div>
              <div className="header-value">Concentrado de Cobre</div>
            </div>
            <div className="header-item">
              <div className="header-label">Región:</div>
              <div className="header-value">Peru</div>
            </div>
          </div>
          <div className="header-item">
            <div className="header-label">Cuotas:</div>
            <div className="header-value">Dic2025-Dic2026</div>
          </div>
          <h3>Contrato Entregas 2025</h3>
        </div>

        <div className="section">
          <h4>1. Cantidad/Plazo</h4>
          <div className="item-grid">
            <div className="item">• Diciembre 2025 =&gt; 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Enero 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Febrero 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Marzo 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Abril 2026 =&gt; 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Mayo 2026 / 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Junio 2026 / 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Julio 2026 / 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Agosto 2026 / 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Septiembre 2026 / 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Octubre 2026 / 330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Noviembre 2026 /330tmh / 300 tms / 10% H2O</div>
            <div className="item">• Diciembre 2026 / 330tmh / 300 tms / 10% H2O</div>
          </div>
        </div>

        <div className="section">
          <h4>2. Incoterm Entrega</h4>
          <p>• DAP Impala Terminals Callao.</p>
        </div>

        <div className="section">
          <h4>3. Rollback</h4>
          <p>• N/A</p>
        </div>

        <div className="section">
          <h4>4. Calidad / Granulometria</h4>
          <div className="item-grid">
            <div className="item">• Cu: 22 – 35 %</div>
            <div className="item">• Ag: 80 – 200 g/tms</div>
            <div className="item">• Au: 5 – 10 g/tms</div>
            <div className="item">• As &lt; 0.25 %</div>
            <div className="item">• Sb &lt; 0.10 %</div>
            <div className="item">• Pb &lt; 3 %</div>
            <div className="item">• Zn &lt; 3 %</div>
            <div className="item">• Fe: 20 – 28 %</div>
            <div className="item">• Bi &lt; 0.10 %</div>
            <div className="item">• F &lt; 300 ppm</div>
            <div className="item">• Cd &lt; 300 ppm</div>
            <div className="item">• Hg &lt; 10 ppm</div>
          </div>
          <p>• Granulometria =&gt; 100% &lt; 1/8", mín 90% &lt; 149μm (malla 100).</p>
        </div>

        <div className="section">
          <h4>5. Pagables</h4>
          <p>• Cobre (Cu): (Ensaye - 1.2%) * 100% =&gt; Indice LME Lowest of the Four.</p>
          <p>• Plata (Ag): (Ensaye - 50g/tms) * 90% =&gt; Indice LBMA Silver.</p>
          <p>• Oro (Au): (Ensaye-1.5g/tms) * 90% =&gt; Indice LBMA Final (o PM).</p>
        </div>

        <div className="section">
          <h4>6. Maquila o Cargo de Tratamiento</h4>
          <p>• $70/tms DAP Depósito Impala en el Callao</p>
        </div>

        <div className="section">
          <h4>7. Escalador en Maquila</h4>
          <p>• N/A</p>
        </div>

        <div className="section">
          <h4>8. Gastos de Refinacion</h4>
          <p>• Cobre (Cu): $0.070/lb</p>
          <p>• Plata (Ag): $1.0/oz</p>
          <p>• Oro (Au): $10/oz</p>
        </div>

        <div className="section">
          <h4>9. Escalador en Gastos de Refinacion</h4>
          <p>• N/A</p>
        </div>

        <div className="section">
          <h4>10. Penalidades</h4>
          <p>• Arsenico + Antimonio (As+Sb): $4/tms por cada c/0.1% encima 0.20%</p>
          <p>• Plomo + Zinc (Pb+Zn): $2.5/tms por cada 1% por encima 5%</p>
          <p>• Bismuto (Bi): $2.5/tms por cada 0.01% por encima 0.05%</p>
          <p>• Mercurio (Hg): $2.50/tms por cada 10ppm por encima 30ppm</p>
        </div>

        <div className="section">
          <h4>11. Pagos</h4>
          <p>• Pago Provisional. 90% a los 4 días calendario de recibida la factura provisional, una vez cerrado el lote.</p>
          <p>• Pago Final: Cuando las leyes, pesos y precios de todos los elementos sean conocidos.</p>
        </div>

        <div className="section">
          <h4>12. Periodo de Cotizaciones</h4>
          <p>• M+1 (promedio del siguiente mes de entrega)</p>
          <p>• M+3 (promedio del tercer mes siguiente al mes de entrega)</p>
          <p>• Opcionalidad definidad por =&gt; Comprador</p>
          <p>• M = mes de entrega en depósito</p>
          <p>• Opcion de fijacion para el vendedor =&gt; Si</p>
        </div>

        <div className="section">
          <h4>13. Muestreo Pesos</h4>
          <p>• Depósito de Impala Terminals Perú S.A.C. en el Callao.</p>
        </div>

        <div className="section">
          <h4>14. Muestreo Ensayes</h4>
          <p>• Procedimiento de dirimencia.</p>
          <p>• Costos asumidos por el Comprador y Vendedor en partes iguales.</p>
          <p>• Leyes finales =&gt; promedio de las leyes reportadas por:</p>
          <div className="nested-list">
            <p>1. Alfred H. Knight del Perú S.A.</p>
            <p>2. Alex Stewart (Assayers) del Perú S.R.L.</p>
            <p>3. SGS del Perú S.A.C.</p>
          </div>
        </div>

        <div className="section">
          <h4>15. Merma</h4>
          <p>• 0.5%</p>
        </div>
      </div>
    </>
  );
};

export default ContractDetailsView;

import React, { useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ContractDetailsViewProps {
  onClose: () => void;
}

const SectionBlock: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="mb-0">
    <div className="flex items-baseline gap-1 bg-gray-100 border-t border-b border-gray-300 px-2 py-0.5">
      <span className="text-xs font-bold text-gray-700">{number}.</span>
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</span>
    </div>
    <div className="px-2 py-1 text-xs text-gray-800 leading-relaxed">{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex gap-1">
    <span className="text-gray-500 shrink-0">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

const ContractDetailsView: React.FC<ContractDetailsViewProps> = ({ onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const imgHeightMM = canvas.height * ratio;

      let yOffset = 0;
      while (yOffset < imgHeightMM) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, imgHeightMM);
        yOffset += pdfHeight;
      }

      pdf.save('contrato-detalle.pdf');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const quotas = [
    { month: 'Diciembre 2025', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Enero 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Febrero 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Marzo 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Abril 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Mayo 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Junio 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Julio 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Agosto 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Septiembre 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Octubre 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Noviembre 2026', tmh: 330, tms: 300, h2o: 10 },
    { month: 'Diciembre 2026', tmh: 330, tms: 300, h2o: 10 },
  ];

  const totalTmh = quotas.reduce((s, q) => s + q.tmh, 0);
  const totalTms = quotas.reduce((s, q) => s + q.tms, 0);

  const quality = [
    { element: 'Cu', spec: '22 – 35 %' }, { element: 'Ag', spec: '80 – 200 g/tms' },
    { element: 'Au', spec: '5 – 10 g/tms' }, { element: 'As', spec: '< 0.25 %' },
    { element: 'Sb', spec: '< 0.10 %' }, { element: 'Pb', spec: '< 3 %' },
    { element: 'Zn', spec: '< 3 %' }, { element: 'Fe', spec: '20 – 28 %' },
    { element: 'Bi', spec: '< 0.10 %' }, { element: 'F', spec: '< 300 ppm' },
    { element: 'Cd', spec: '< 300 ppm' }, { element: 'Hg', spec: '< 10 ppm' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Resumen del Contrato</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generando...' : 'Descargar PDF'}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div ref={contentRef} className="bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>

            {/* Contract Header */}
            <div className="border border-gray-400 mb-2">
              <div className="bg-blue-700 text-white px-3 py-1.5 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wide">CONTRATO DE COMPRAVENTA DE CONCENTRADO</span>
                <span className="text-xs font-mono bg-blue-600 px-2 py-0.5 rounded">CTR-2025-0042</span>
              </div>
              <div className="grid grid-cols-4 gap-0 border-t border-gray-300">
                <div className="px-3 py-1.5 border-r border-gray-300">
                  <div className="text-xs text-gray-500">Vendedor</div>
                  <div className="text-xs font-semibold text-gray-900">Mineria Proton S.A.C.</div>
                </div>
                <div className="px-3 py-1.5 border-r border-gray-300">
                  <div className="text-xs text-gray-500">Comprador</div>
                  <div className="text-xs font-semibold text-gray-900">Trader A</div>
                </div>
                <div className="px-3 py-1.5 border-r border-gray-300">
                  <div className="text-xs text-gray-500">Producto</div>
                  <div className="text-xs font-semibold text-gray-900">Concentrado de Cobre</div>
                </div>
                <div className="px-3 py-1.5">
                  <div className="text-xs text-gray-500">Período / Región</div>
                  <div className="text-xs font-semibold text-gray-900">Dic 2025 – Dic 2026 / Perú</div>
                </div>
              </div>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* LEFT COLUMN */}
              <div className="border border-gray-300">
                <SectionBlock number={1} title="Cantidad / Plazo">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-0.5 pr-2 font-semibold text-gray-600 border-b border-gray-200">Mes</th>
                        <th className="text-right py-0.5 px-1 font-semibold text-gray-600 border-b border-gray-200">TMH</th>
                        <th className="text-right py-0.5 px-1 font-semibold text-gray-600 border-b border-gray-200">TMS</th>
                        <th className="text-right py-0.5 pl-1 font-semibold text-gray-600 border-b border-gray-200">H2O</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotas.map((q, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-0.5 pr-2">{q.month}</td>
                          <td className="text-right py-0.5 px-1">{q.tmh}</td>
                          <td className="text-right py-0.5 px-1">{q.tms}</td>
                          <td className="text-right py-0.5 pl-1">{q.h2o}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-300 bg-gray-100 font-semibold">
                        <td className="py-0.5 pr-2">TOTAL</td>
                        <td className="text-right py-0.5 px-1">{totalTmh}</td>
                        <td className="text-right py-0.5 px-1">{totalTms}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </SectionBlock>

                <SectionBlock number={2} title="Incoterm Entrega">
                  <p>DAP Impala Terminals Callao.</p>
                </SectionBlock>

                <SectionBlock number={3} title="Rollback">
                  <p>N/A</p>
                </SectionBlock>

                <SectionBlock number={4} title="Calidad / Granulometría">
                  <div className="grid grid-cols-2 gap-x-4">
                    {quality.map((q, i) => (
                      <div key={i} className="flex gap-1">
                        <span className="font-semibold w-6 shrink-0">{q.element}:</span>
                        <span>{q.spec}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-gray-600">Granulometría: 100% &lt; 1/8", mín 90% &lt; 149μm (malla 100).</p>
                </SectionBlock>

                <SectionBlock number={13} title="Muestreo Pesos">
                  <p>Depósito de Impala Terminals Perú S.A.C. en el Callao.</p>
                </SectionBlock>
              </div>

              {/* RIGHT COLUMN */}
              <div className="border border-gray-300">
                <SectionBlock number={5} title="Pagables">
                  <div className="space-y-0.5">
                    <p><span className="font-semibold">Cu:</span> (Ensaye − 1.2%) × 100% → LME Lowest of the Four.</p>
                    <p><span className="font-semibold">Ag:</span> (Ensaye − 50 g/tms) × 90% → LBMA Silver.</p>
                    <p><span className="font-semibold">Au:</span> (Ensaye − 1.5 g/tms) × 90% → LBMA Final (PM).</p>
                  </div>
                </SectionBlock>

                <SectionBlock number={6} title="Maquila / Cargo de Tratamiento">
                  <p>$70/tms DAP Depósito Impala en el Callao.</p>
                </SectionBlock>

                <SectionBlock number={7} title="Escalador en Maquila">
                  <p>N/A</p>
                </SectionBlock>

                <SectionBlock number={8} title="Gastos de Refinación">
                  <div className="grid grid-cols-3 gap-x-3">
                    <Row label="Cu" value="$0.070/lb" />
                    <Row label="Ag" value="$1.0/oz" />
                    <Row label="Au" value="$10/oz" />
                  </div>
                </SectionBlock>

                <SectionBlock number={9} title="Escalador en Gastos de Refinación">
                  <p>N/A</p>
                </SectionBlock>

                <SectionBlock number={10} title="Penalidades">
                  <div className="space-y-0.5">
                    <p><span className="font-semibold">As+Sb:</span> $4/tms por cada 0.1% encima de 0.20%</p>
                    <p><span className="font-semibold">Pb+Zn:</span> $2.5/tms por cada 1% por encima de 5%</p>
                    <p><span className="font-semibold">Bi:</span> $2.5/tms por cada 0.01% por encima de 0.05%</p>
                    <p><span className="font-semibold">Hg:</span> $2.50/tms por cada 10 ppm por encima de 30 ppm</p>
                  </div>
                </SectionBlock>

                <SectionBlock number={11} title="Pagos">
                  <div className="space-y-0.5">
                    <p><span className="font-semibold">Provisional:</span> 90% a los 4 días calendario de recibida la factura provisional, una vez cerrado el lote.</p>
                    <p><span className="font-semibold">Final:</span> Cuando leyes, pesos y precios de todos los elementos sean conocidos.</p>
                  </div>
                </SectionBlock>

                <SectionBlock number={12} title="Período de Cotizaciones">
                  <div className="space-y-0.5">
                    <p>M+1 (promedio del siguiente mes de entrega)</p>
                    <p>M+3 (promedio del tercer mes siguiente al mes de entrega)</p>
                    <p><span className="font-semibold">Opcionalidad:</span> Comprador &nbsp;|&nbsp; <span className="font-semibold">M</span> = mes de entrega en depósito</p>
                    <p><span className="font-semibold">Opción de fijación vendedor:</span> Sí</p>
                  </div>
                </SectionBlock>

                <SectionBlock number={14} title="Muestreo Ensayes">
                  <div className="space-y-0.5">
                    <p>Procedimiento de dirimencia. Costos asumidos por Comprador y Vendedor en partes iguales.</p>
                    <p><span className="font-semibold">Leyes finales:</span> promedio de leyes reportadas por:</p>
                    <div className="grid grid-cols-3 gap-x-2 mt-0.5">
                      <span>1. Alfred H. Knight del Perú S.A.</span>
                      <span>2. Alex Stewart (Assayers) del Perú S.R.L.</span>
                      <span>3. SGS del Perú S.A.C.</span>
                    </div>
                  </div>
                </SectionBlock>

                <SectionBlock number={15} title="Merma">
                  <p>0.5%</p>
                </SectionBlock>
              </div>
            </div>

            {/* Footer */}
            <div className="border border-gray-300 bg-gray-50 px-3 py-1.5 flex justify-between items-center text-xs text-gray-500">
              <span>Documento generado por MinSoft CTRM</span>
              <span>{new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsView;

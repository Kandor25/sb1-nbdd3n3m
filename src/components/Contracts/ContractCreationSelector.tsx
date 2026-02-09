import React from 'react';
import { FileText, Copy, X } from 'lucide-react';

interface ContractCreationSelectorProps {
  onClose: () => void;
  onSelectNew: () => void;
  onSelectTemplate: () => void;
}

const ContractCreationSelector: React.FC<ContractCreationSelectorProps> = ({
  onClose,
  onSelectNew,
  onSelectTemplate,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Crear Contrato</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <p className="text-gray-600 mb-6 text-center">
            Seleccione cómo desea crear el contrato
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={onSelectNew}
              className="group relative bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Nuevo Contrato
                </h3>
                <p className="text-gray-600 text-sm">
                  Crear un contrato desde cero ingresando toda la información por cláusulas
                </p>
              </div>
            </button>

            <button
              onClick={onSelectTemplate}
              className="group relative bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-green-500 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Copy className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Usar Plantilla
                </h3>
                <p className="text-gray-600 text-sm">
                  Seleccionar una plantilla predefinida con cláusulas estándar por tipo de producto
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractCreationSelector;

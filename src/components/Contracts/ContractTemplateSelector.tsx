import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, FileText, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ContractTemplatePreview from './ContractTemplatePreview';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  product_type: string;
  contract_type: 'purchase' | 'sale';
  incoterm_code: string;
  has_payables: boolean;
  payables_count: number;
  created_at: string;
}

interface ContractTemplateSelectorProps {
  onClose: () => void;
  onBack: () => void;
  onSelectTemplate: (templateId: string) => void;
}

const ContractTemplateSelector: React.FC<ContractTemplateSelectorProps> = ({
  onClose,
  onBack,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('name');

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedType === 'all') return true;
    return template.contract_type === selectedType;
  });

  const getTypeLabel = (type: string) => {
    return type === 'purchase' ? 'Compra' : 'Venta';
  };

  const getTypeColor = (type: string) => {
    return type === 'purchase'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-blue-100 text-blue-700';
  };

  return (
    <>
      {previewTemplateId && (
        <ContractTemplatePreview
          templateId={previewTemplateId}
          onClose={() => setPreviewTemplateId(null)}
          onSelect={() => {
            onSelectTemplate(previewTemplateId);
            setPreviewTemplateId(null);
          }}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Seleccionar Plantilla</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedType('purchase')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'purchase'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Compra
              </button>
              <button
                onClick={() => setSelectedType('sale')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'sale'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Venta
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando plantillas...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay plantillas disponibles</p>
              <p className="text-gray-400">
                {selectedType !== 'all'
                  ? 'Intenta cambiar el filtro o crear una nueva plantilla'
                  : 'Crea plantillas para acelerar la creación de contratos'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(template.contract_type)}`}>
                        {getTypeLabel(template.contract_type)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {template.description}
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium mr-2">Producto:</span>
                      <span>{template.product_type}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium mr-2">Incoterm:</span>
                      <span>{template.incoterm_code}</span>
                    </div>
                    {template.has_payables && (
                      <div className="flex items-center text-gray-700">
                        <span className="font-medium mr-2">Pagables:</span>
                        <span>{template.payables_count} configurados</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        console.log('Preview button clicked for template:', template.id);
                        setPreviewTemplateId(template.id);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Preview
                    </button>
                    <button
                      onClick={() => onSelectTemplate(template.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Seleccionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" />
              Volver
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContractTemplateSelector;

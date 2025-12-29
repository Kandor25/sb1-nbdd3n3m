import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContractFormProps {
  onClose: () => void;
  onSuccess: () => void;
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

const ContractForm: React.FC<ContractFormProps> = ({ onClose, onSuccess }) => {
  const [currentSection, setCurrentSection] = useState('basic');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [incoterms, setIncoterms] = useState<Incoterm[]>([]);
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
  });

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (formData.startMonth && formData.endMonth) {
      generateQuotas();
    }
  }, [formData.startMonth, formData.endMonth]);

  const loadFormData = async () => {
    try {
      const [vendorsRes, buyersRes, productsRes, countriesRes, incotermsRes] = await Promise.all([
        supabase.from('vendors').select('*').order('name'),
        supabase.from('buyers').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('incoterms').select('*').order('code'),
      ]);

      if (vendorsRes.data) setVendors(vendorsRes.data);
      if (buyersRes.data) setBuyers(buyersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
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
          <h2 className="text-2xl font-bold text-gray-900">Nuevo Contrato</h2>
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

              {!['basic', 'incoterm'].includes(currentSection) && (
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

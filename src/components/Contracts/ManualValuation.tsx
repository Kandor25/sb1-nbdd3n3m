import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ContractPDF from './ContractPDF';

interface ManualValuationProps {
  contractId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface WeightData {
  tmh: string;
  h2oPercentage: string;
  tms: string;
}

interface PriceData {
  id: string;
  metal: string;
  price: string;
  unit: string;
}

interface AssayData {
  id: string;
  metal: string;
  assayValue: string;
  unit: string;
}

interface AssaySensitivityData {
  id: string;
  metal: string;
  sensitivityValue: string;
  unit: string;
}

interface PriceSensitivityData {
  id: string;
  metal: string;
  priceSensitivity: string;
  unit: string;
}

const METALS = [
  'Cu (Cobre)',
  'Ag (Plata)',
  'Au (Oro)',
  'As (Arsénico)',
  'Sb (Antimonio)',
  'Pb (Plomo)',
  'Zn (Zinc)',
  'Fe (Hierro)',
  'Bi (Bismuto)',
  'Hg (Mercurio)',
  'Cd (Cadmio)',
  'F (Flúor)'
];

const ManualValuation: React.FC<ManualValuationProps> = ({ contractId, onClose, onSuccess }) => {
  const [currentSection, setCurrentSection] = useState<'weights' | 'prices' | 'assays' | 'assay-sensitivity' | 'price-sensitivity'>('weights');
  const [loading, setLoading] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [valuationId, setValuationId] = useState<string | null>(null);

  const [weights, setWeights] = useState<WeightData>({
    tmh: '', h2oPercentage: '', tms: ''
  });

  const [prices, setPrices] = useState<PriceData[]>([
    { id: '1', metal: '', price: '', unit: '' }
  ]);

  const [assays, setAssays] = useState<AssayData[]>([
    { id: '1', metal: '', assayValue: '', unit: '' }
  ]);

  const [assaySensitivity, setAssaySensitivity] = useState<AssaySensitivityData[]>([
    { id: '1', metal: '', sensitivityValue: '', unit: '' }
  ]);

  const [priceSensitivity, setPriceSensitivity] = useState<PriceSensitivityData[]>([
    { id: '1', metal: '', priceSensitivity: '', unit: '' }
  ]);

  const updateWeight = (field: keyof WeightData, value: string) => {
    setWeights({ ...weights, [field]: value });
  };

  const addPrice = () => {
    setPrices([...prices, { id: Date.now().toString(), metal: '', price: '', unit: '' }]);
  };

  const removePrice = (id: string) => {
    if (prices.length > 1) {
      setPrices(prices.filter(p => p.id !== id));
    }
  };

  const updatePrice = (id: string, field: keyof PriceData, value: string) => {
    setPrices(prices.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addAssay = () => {
    setAssays([...assays, { id: Date.now().toString(), metal: '', assayValue: '', unit: '' }]);
  };

  const removeAssay = (id: string) => {
    if (assays.length > 1) {
      setAssays(assays.filter(a => a.id !== id));
    }
  };

  const updateAssay = (id: string, field: keyof AssayData, value: string) => {
    setAssays(assays.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addAssaySensitivity = () => {
    setAssaySensitivity([...assaySensitivity, { id: Date.now().toString(), metal: '', sensitivityValue: '', unit: '' }]);
  };

  const removeAssaySensitivity = (id: string) => {
    if (assaySensitivity.length > 1) {
      setAssaySensitivity(assaySensitivity.filter(a => a.id !== id));
    }
  };

  const updateAssaySensitivity = (id: string, field: keyof AssaySensitivityData, value: string) => {
    setAssaySensitivity(assaySensitivity.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addPriceSensitivity = () => {
    setPriceSensitivity([...priceSensitivity, { id: Date.now().toString(), metal: '', priceSensitivity: '', unit: '' }]);
  };

  const removePriceSensitivity = (id: string) => {
    if (priceSensitivity.length > 1) {
      setPriceSensitivity(priceSensitivity.filter(p => p.id !== id));
    }
  };

  const updatePriceSensitivity = (id: string, field: keyof PriceSensitivityData, value: string) => {
    setPriceSensitivity(priceSensitivity.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const isWeightsValid = () => {
    return weights.tmh && weights.h2oPercentage && weights.tms;
  };

  const isPricesValid = () => {
    return prices.every(p => p.metal && p.price && p.unit);
  };

  const isAssaysValid = () => {
    return assays.every(a => a.metal && a.assayValue && a.unit);
  };

  const isAssaySensitivityValid = () => {
    return assaySensitivity.every(a => a.metal && a.sensitivityValue && a.unit);
  };

  const isPriceSensitivityValid = () => {
    return priceSensitivity.every(p => p.metal && p.priceSensitivity && p.unit);
  };

  const isAllValid = () => {
    return isWeightsValid() && isPricesValid() && isAssaysValid() &&
           isAssaySensitivityValid() && isPriceSensitivityValid();
  };

  const handleConfirm = async () => {
    if (!isAllValid()) {
      alert('Por favor complete todas las secciones antes de confirmar');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(contractId)) {
      alert('Este es un contrato de demostración. Para crear valorizaciones, primero debe crear un contrato real en la base de datos usando el formulario de creación de contratos.');
      return;
    }

    const { data: contractExists } = await supabase
      .from('contracts')
      .select('id')
      .eq('id', contractId)
      .maybeSingle();

    if (!contractExists) {
      alert('El contrato no existe en la base de datos. Por favor cree el contrato primero.');
      return;
    }

    setLoading(true);
    try {
      const { data: valuation, error: valuationError } = await supabase
        .from('manual_valuations')
        .insert({
          contract_id: contractId,
          status: 'confirmed'
        })
        .select()
        .single();

      if (valuationError) throw valuationError;

      const { error: weightsError } = await supabase
        .from('valuation_weights')
        .insert({
          valuation_id: valuation.id,
          tmh: parseFloat(weights.tmh),
          h2o_percentage: parseFloat(weights.h2oPercentage),
          tms: parseFloat(weights.tms)
        });

      if (weightsError) throw weightsError;

      const pricesData = prices.map(p => ({
        valuation_id: valuation.id,
        metal: p.metal,
        price: parseFloat(p.price),
        unit: p.unit
      }));

      const { error: pricesError } = await supabase
        .from('valuation_prices')
        .insert(pricesData);

      if (pricesError) throw pricesError;

      const assaysData = assays.map(a => ({
        valuation_id: valuation.id,
        metal: a.metal,
        assay_value: parseFloat(a.assayValue),
        unit: a.unit
      }));

      const { error: assaysError } = await supabase
        .from('valuation_assays')
        .insert(assaysData);

      if (assaysError) throw assaysError;

      const assaySensitivityData = assaySensitivity.map(a => ({
        valuation_id: valuation.id,
        metal: a.metal,
        sensitivity_value: parseFloat(a.sensitivityValue),
        unit: a.unit
      }));

      const { error: assaySensitivityError } = await supabase
        .from('valuation_assay_sensitivity')
        .insert(assaySensitivityData);

      if (assaySensitivityError) throw assaySensitivityError;

      const priceSensitivityData = priceSensitivity.map(p => ({
        valuation_id: valuation.id,
        metal: p.metal,
        price_sensitivity: parseFloat(p.priceSensitivity),
        unit: p.unit
      }));

      const { error: priceSensitivityError } = await supabase
        .from('valuation_price_sensitivity')
        .insert(priceSensitivityData);

      if (priceSensitivityError) throw priceSensitivityError;

      setValuationId(valuation.id);
      setShowPDF(true);
    } catch (error) {
      console.error('Error al guardar valorización:', error);
      alert('Error al guardar la valorización');
    } finally {
      setLoading(false);
    }
  };

  if (showPDF && valuationId) {
    return <ContractPDF contractId={contractId} valuationId={valuationId} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Valorización Manual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b">
          {[
            { id: 'weights', label: 'Pesos' },
            { id: 'prices', label: 'Precios' },
            { id: 'assays', label: 'Ensayes' },
            { id: 'assay-sensitivity', label: 'Sensibilidad Ensayes' },
            { id: 'price-sensitivity', label: 'Sensibilidad Precios' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                currentSection === section.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
              {section.id === 'weights' && isWeightsValid() && ' ✓'}
              {section.id === 'prices' && isPricesValid() && ' ✓'}
              {section.id === 'assays' && isAssaysValid() && ' ✓'}
              {section.id === 'assay-sensitivity' && isAssaySensitivityValid() && ' ✓'}
              {section.id === 'price-sensitivity' && isPriceSensitivityValid() && ' ✓'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {currentSection === 'weights' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pesos</h3>
                <p className="text-sm text-gray-600 mt-1">Ingrese los datos de peso para esta valorización</p>
              </div>

              <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">TMH</label>
                  <input
                    type="number"
                    value={weights.tmh}
                    onChange={(e) => updateWeight('tmh', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="300"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">H2O (%)</label>
                  <input
                    type="number"
                    value={weights.h2oPercentage}
                    onChange={(e) => updateWeight('h2oPercentage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">TMS</label>
                  <input
                    type="number"
                    value={weights.tms}
                    onChange={(e) => updateWeight('tms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="270"
                  />
                </div>
              </div>
            </div>
          )}

          {currentSection === 'prices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Precios</h3>
                <button
                  onClick={addPrice}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Línea
                </button>
              </div>

              {prices.map((price) => (
                <div key={price.id} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metal</label>
                    <select
                      value={price.metal}
                      onChange={(e) => updatePrice(price.id, 'metal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {METALS.map(metal => (
                        <option key={metal} value={metal}>{metal}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input
                      type="number"
                      value={price.price}
                      onChange={(e) => updatePrice(price.id, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="11500"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                    <input
                      type="text"
                      value={price.unit}
                      onChange={(e) => updatePrice(price.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="$/mt"
                    />
                  </div>

                  <button
                    onClick={() => removePrice(price.id)}
                    disabled={prices.length === 1}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentSection === 'assays' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ensayes</h3>
                <button
                  onClick={addAssay}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Línea
                </button>
              </div>

              {assays.map((assay) => (
                <div key={assay.id} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metal</label>
                    <select
                      value={assay.metal}
                      onChange={(e) => updateAssay(assay.id, 'metal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {METALS.map(metal => (
                        <option key={metal} value={metal}>{metal}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Ensaye</label>
                    <input
                      type="number"
                      value={assay.assayValue}
                      onChange={(e) => updateAssay(assay.id, 'assayValue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                    <input
                      type="text"
                      value={assay.unit}
                      onChange={(e) => updateAssay(assay.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="%"
                    />
                  </div>

                  <button
                    onClick={() => removeAssay(assay.id)}
                    disabled={assays.length === 1}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentSection === 'assay-sensitivity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sensibilidad Ensayes</h3>
                <button
                  onClick={addAssaySensitivity}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Línea
                </button>
              </div>

              {assaySensitivity.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metal</label>
                    <select
                      value={item.metal}
                      onChange={(e) => updateAssaySensitivity(item.id, 'metal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {METALS.map(metal => (
                        <option key={metal} value={metal}>{metal}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Sensibilidad</label>
                    <input
                      type="number"
                      value={item.sensitivityValue}
                      onChange={(e) => updateAssaySensitivity(item.id, 'sensitivityValue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateAssaySensitivity(item.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="%"
                    />
                  </div>

                  <button
                    onClick={() => removeAssaySensitivity(item.id)}
                    disabled={assaySensitivity.length === 1}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentSection === 'price-sensitivity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sensibilidad Precios</h3>
                <button
                  onClick={addPriceSensitivity}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Línea
                </button>
              </div>

              {priceSensitivity.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metal</label>
                    <select
                      value={item.metal}
                      onChange={(e) => updatePriceSensitivity(item.id, 'metal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {METALS.map(metal => (
                        <option key={metal} value={metal}>{metal}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sensibilidad Precio</label>
                    <input
                      type="number"
                      value={item.priceSensitivity}
                      onChange={(e) => updatePriceSensitivity(item.id, 'priceSensitivity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="250"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updatePriceSensitivity(item.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="$/mt"
                    />
                  </div>

                  <button
                    onClick={() => removePriceSensitivity(item.id)}
                    disabled={priceSensitivity.length === 1}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isAllValid() || loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4 mr-2" />
            {loading ? 'Confirmando...' : 'Confirmar y Ver PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualValuation;

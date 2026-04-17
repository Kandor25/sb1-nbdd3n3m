import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GitCompare, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContractOption {
  id: string;
  number: string;
  commodity: string;
  counterparty: string;
  type: string;
}

interface WeightData {
  tmh: string;
  h2oPercentage: string;
  tms: string;
}

interface PriceRow {
  id: string;
  metal: string;
  price: string;
  unit: string;
}

interface AssayRow {
  id: string;
  metal: string;
  assayValue: string;
  unit: string;
}

interface ContractValuationComparisonProps {
  onClose: () => void;
  contracts: ContractOption[];
}

type Step = 'select' | 'data';

const METALS = [
  'Cu (Cobre)', 'Ag (Plata)', 'Au (Oro)', 'As (Arsénico)', 'Sb (Antimonio)',
  'Pb (Plomo)', 'Zn (Zinc)', 'Fe (Hierro)', 'Bi (Bismuto)', 'Hg (Mercurio)',
  'Cd (Cadmio)', 'F (Flúor)'
];

const PRICE_UNITS = ['$/mt', '$/lb', '$/oz', '$/ton', '€/mt', '€/lb', '€/oz'];
const ASSAY_UNITS = ['%', 'g/t', 'oz/t', 'ppm', 'mg/kg'];

const ContractValuationComparison: React.FC<ContractValuationComparisonProps> = ({ onClose, contracts }) => {
  const [step, setStep] = useState<Step>('select');
  const [contractAId, setContractAId] = useState('');
  const [contractBId, setContractBId] = useState('');
  const [activeTab, setActiveTab] = useState<'weights' | 'prices' | 'assays'>('weights');

  const [weights, setWeights] = useState<WeightData>({ tmh: '', h2oPercentage: '', tms: '' });
  const [prices, setPrices] = useState<PriceRow[]>([{ id: '1', metal: '', price: '', unit: '' }]);
  const [assays, setAssays] = useState<AssayRow[]>([{ id: '1', metal: '', assayValue: '', unit: '' }]);

  const contractA = contracts.find(c => c.id === contractAId);
  const commodityA = contractA?.commodity;

  const availableForB = contracts.filter(c => {
    if (!commodityA) return false;
    if (c.id === contractAId) return false;
    return c.commodity === commodityA;
  });

  const contractB = contracts.find(c => c.id === contractBId);

  const canProceed = contractAId && contractBId;

  const isWeightsValid = () => weights.tmh !== '' && weights.h2oPercentage !== '' && weights.tms !== '';
  const isPricesValid = () => prices.every(p => p.metal && p.price && p.unit);
  const isAssaysValid = () => assays.every(a => a.metal && a.assayValue && a.unit);
  const isAllValid = () => isWeightsValid() && isPricesValid() && isAssaysValid();

  const addPrice = () => setPrices([...prices, { id: Date.now().toString(), metal: '', price: '', unit: '' }]);
  const removePrice = (id: string) => { if (prices.length > 1) setPrices(prices.filter(p => p.id !== id)); };
  const updatePrice = (id: string, field: keyof PriceRow, value: string) =>
    setPrices(prices.map(p => p.id === id ? { ...p, [field]: value } : p));

  const addAssay = () => setAssays([...assays, { id: Date.now().toString(), metal: '', assayValue: '', unit: '' }]);
  const removeAssay = (id: string) => { if (assays.length > 1) setAssays(assays.filter(a => a.id !== id)); };
  const updateAssay = (id: string, field: keyof AssayRow, value: string) =>
    setAssays(assays.map(a => a.id === id ? { ...a, [field]: value } : a));

  const handleContractAChange = (id: string) => {
    setContractAId(id);
    setContractBId('');
  };

  const handleConfirm = () => {
    if (!isAllValid()) {
      alert('Por favor complete todos los campos antes de continuar');
      return;
    }
    alert('Comparativo listo. La vista de resultados se definirá en la siguiente etapa.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <GitCompare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Comparacion de Valorizaciones</h2>
              <p className="text-sm text-gray-500 mt-0.5">Aplica los mismos datos a dos contratos del mismo commodity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200 space-x-2">
          <div className={`flex items-center space-x-2 text-sm font-medium ${step === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`}>1</span>
            <span>Seleccionar Contratos</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <div className={`flex items-center space-x-2 text-sm font-medium ${step === 'data' ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'data' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`}>2</span>
            <span>Ingresar Datos</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'select' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">A</span>
                    <h3 className="text-sm font-semibold text-gray-800">Contrato A</h3>
                  </div>
                  <select
                    value={contractAId}
                    onChange={(e) => handleContractAChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Seleccionar contrato...</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.number} — {c.commodity} — {c.counterparty}
                      </option>
                    ))}
                  </select>
                  {contractA && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-blue-700 font-semibold">{contractA.number}</p>
                      <p className="text-xs text-blue-600">Commodity: {contractA.commodity}</p>
                      <p className="text-xs text-blue-600">Contraparte: {contractA.counterparty}</p>
                      <p className="text-xs text-blue-600 capitalize">Tipo: {contractA.type === 'purchase' ? 'Compra' : 'Venta'}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">B</span>
                    <h3 className="text-sm font-semibold text-gray-800">Contrato B</h3>
                  </div>
                  <select
                    value={contractBId}
                    onChange={(e) => setContractBId(e.target.value)}
                    disabled={!contractAId}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!contractAId ? 'Primero seleccione Contrato A' : availableForB.length === 0 ? 'No hay contratos con el mismo commodity' : 'Seleccionar contrato...'}
                    </option>
                    {availableForB.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.number} — {c.commodity} — {c.counterparty}
                      </option>
                    ))}
                  </select>
                  {contractB && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-emerald-700 font-semibold">{contractB.number}</p>
                      <p className="text-xs text-emerald-600">Commodity: {contractB.commodity}</p>
                      <p className="text-xs text-emerald-600">Contraparte: {contractB.counterparty}</p>
                      <p className="text-xs text-emerald-600 capitalize">Tipo: {contractB.type === 'purchase' ? 'Compra' : 'Venta'}</p>
                    </div>
                  )}
                </div>
              </div>

              {contractAId && availableForB.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                  No existen otros contratos con el mismo commodity ({commodityA}). Debe haber al menos dos contratos del mismo commodity para realizar la comparacion.
                </div>
              )}
            </div>
          )}

          {step === 'data' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">A</span>
                  <span className="text-sm font-semibold text-gray-700">{contractA?.number}</span>
                </div>
                <span className="text-gray-300 text-lg">vs</span>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">B</span>
                  <span className="text-sm font-semibold text-gray-700">{contractB?.number}</span>
                </div>
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Datos aplicados a ambos contratos</span>
              </div>

              <div className="flex border-b border-gray-200">
                {[
                  { id: 'weights', label: 'Pesos', valid: isWeightsValid() },
                  { id: 'prices', label: 'Precios', valid: isPricesValid() },
                  { id: 'assays', label: 'Ensayes', valid: isAssaysValid() },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.valid && <span className="ml-1 text-green-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>

              {activeTab === 'weights' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TMH</label>
                      <input
                        type="number"
                        value={weights.tmh}
                        onChange={e => setWeights({ ...weights, tmh: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">H2O (%)</label>
                      <input
                        type="number"
                        value={weights.h2oPercentage}
                        onChange={e => setWeights({ ...weights, h2oPercentage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TMS</label>
                      <input
                        type="number"
                        value={weights.tms}
                        onChange={e => setWeights({ ...weights, tms: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="270"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prices' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Ingrese los precios de mercado</p>
                    <button
                      onClick={addPrice}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Agregar
                    </button>
                  </div>
                  {prices.map(price => (
                    <div key={price.id} className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Metal</label>
                        <select
                          value={price.metal}
                          onChange={e => updatePrice(price.id, 'metal', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {METALS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
                        <input
                          type="number"
                          value={price.price}
                          onChange={e => updatePrice(price.id, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="11500"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                          <select
                            value={price.unit}
                            onChange={e => updatePrice(price.id, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                        <button
                          onClick={() => removePrice(price.id)}
                          disabled={prices.length === 1}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'assays' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Ingrese los ensayes de laboratorio</p>
                    <button
                      onClick={addAssay}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Agregar
                    </button>
                  </div>
                  {assays.map(assay => (
                    <div key={assay.id} className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Metal</label>
                        <select
                          value={assay.metal}
                          onChange={e => updateAssay(assay.id, 'metal', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {METALS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Valor Ensaye</label>
                        <input
                          type="number"
                          value={assay.assayValue}
                          onChange={e => updateAssay(assay.id, 'assayValue', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="25"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                          <select
                            value={assay.unit}
                            onChange={e => updateAssay(assay.id, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {ASSAY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                        <button
                          onClick={() => removeAssay(assay.id)}
                          disabled={assays.length === 1}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={() => step === 'data' ? setStep('select') : onClose()}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            {step === 'data' ? 'Atras' : 'Cancelar'}
          </button>
          {step === 'select' ? (
            <button
              onClick={() => setStep('data')}
              disabled={!canProceed}
              className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!isAllValid()}
              className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Ver Comparativo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractValuationComparison;

import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Eye, MapPin, FlaskConical, Weight } from 'lucide-react';
import { mockInventoryLots, mockContracts } from '../../data/mockData';
import type { InventoryLot } from '../../types';

interface InventoryListProps {
  onCreateNew: () => void;
  onViewDetails: (lot: InventoryLot) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ onCreateNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  const filteredLots = mockInventoryLots.filter(lot => {
    const matchesSearch = lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.location.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lot.location.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || lot.location.warehouse.includes(filterLocation);
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      in_warehouse: 'bg-green-100 text-green-800',
      in_transit: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      received: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAssayStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalInventoryValue = filteredLots.reduce((sum, lot) => {
    // Simplified value calculation - in real system would use actual pricing
    const copperValue = (lot.quality.find(q => q.element === 'Cu')?.value || 0) * lot.weights.dry * 85; // $85/% Cu per MT
    const goldValue = (lot.quality.find(q => q.element === 'Au')?.value || 0) * lot.weights.dry * 65; // $65/g/t Au per MT
    return sum + copperValue + goldValue;
  }, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="w-7 h-7 mr-3 text-emerald-600" />
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 mt-1">Rastrear y gestionar lotes de concentrados, ensayos y ubicaciones</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Valor Total del Inventario</p>
            <p className="text-2xl font-bold text-emerald-600">${totalInventoryValue.toLocaleString()}</p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lote
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Lotes</p>
              <p className="text-2xl font-bold text-gray-900">{filteredLots.length}</p>
            </div>
            <Package className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peso Total (TM)</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLots.reduce((sum, lot) => sum + lot.weights.dry, 0).toFixed(1)}
              </p>
            </div>
            <Weight className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ensayos Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLots.filter(lot => lot.assays.some(a => a.status === 'pending')).length}
              </p>
            </div>
            <FlaskConical className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Tránsito</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLots.filter(lot => lot.location.status === 'in_transit').length}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de lote, commodity o almacén..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Todos los Estados</option>
              <option value="in_warehouse">En Almacén</option>
              <option value="in_transit">En Tránsito</option>
              <option value="shipped">Despachado</option>
              <option value="received">Recibido</option>
            </select>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Todas las Ubicaciones</option>
              <option value="Houston">Terminal Houston</option>
              <option value="Phoenix">Almacén Phoenix</option>
              <option value="Los Angeles">Puerto Los Angeles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles del Lote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commodity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pesos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calidad (Ensayos)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLots.map((lot) => {
                const latestAssay = lot.assays[lot.assays.length - 1];
                const contract = mockContracts.find(c => c.id === lot.contractId);
                
                return (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lot.lotNumber}</div>
                        <div className="text-sm text-gray-500">
                          {contract ? `Contrato: ${contract.number}` : 'Sin Contrato'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Recibido: {lot.receivedDate.toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lot.commodity.name}</div>
                      <div className="text-sm text-gray-500">{lot.commodity.type}</div>
                      {lot.commodity.grade && (
                        <div className="text-sm text-gray-500">Grado: {lot.commodity.grade}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Seco: {lot.weights.dry} TM</div>
                      <div className="text-sm text-gray-500">Húmedo: {lot.weights.wet} TM</div>
                      <div className="text-sm text-gray-500">Humedad: {lot.weights.moisture}%</div>
                    </td>
                    <td className="px-6 py-4">
                      {latestAssay ? (
                        <div className="space-y-1">
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getAssayStatusColor(latestAssay.status)}`}>
                            {latestAssay.status === 'pending' ? 'pendiente' :
                             latestAssay.status === 'completed' ? 'completado' : 'disputado'}
                          </div>
                          {latestAssay.results.slice(0, 3).map((result, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              {result.element}: {result.value}{result.unit}
                            </div>
                          ))}
                          <div className="text-xs text-gray-500">{latestAssay.laboratory}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin ensayos</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {lot.location.warehouse}
                      </div>
                      {lot.location.position && (
                        <div className="text-sm text-gray-500">{lot.location.position}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lot.location.status)}`}>
                        {lot.location.status === 'in_warehouse' ? 'EN ALMACÉN' :
                         lot.location.status === 'in_transit' ? 'EN TRÁNSITO' :
                         lot.location.status === 'shipped' ? 'DESPACHADO' : 'RECIBIDO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(lot)}
                        className="text-emerald-600 hover:text-emerald-900 mr-4"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLots.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron lotes de inventario</p>
          <p className="text-gray-400">Intenta ajustar tus criterios de búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
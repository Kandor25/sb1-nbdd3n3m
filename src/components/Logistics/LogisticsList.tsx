import React, { useState } from 'react';
import { Truck, Plus, Search, Filter, MapPin, Calendar, FileText, Eye, Package } from 'lucide-react';
import { mockShipments, mockContracts, mockCounterparties } from '../../data/mockData';
import type { Shipment } from '../../types';

interface LogisticsListProps {
  onCreateNew: () => void;
  onViewDetails: (shipment: Shipment) => void;
}

const LogisticsList: React.FC<LogisticsListProps> = ({ onCreateNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Add contract and counterparty data to shipments
  const shipmentsWithDetails = mockShipments.map(shipment => ({
    ...shipment,
    contract: mockContracts.find(c => c.id === shipment.contractId),
    counterparty: mockCounterparties.find(cp =>
      mockContracts.find(c => c.id === shipment.contractId)?.counterpartyId === cp.id
    )
  }));

  const filteredShipments = shipmentsWithDetails.filter(shipment => {
    const matchesSearch = shipment.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.counterparty?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    const matchesType = filterType === 'all' || shipment.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get operations for status cards
  const patioOperations = shipmentsWithDetails.filter(s => s.status === 'planned').slice(0, 2);
  const transitOperations = shipmentsWithDetails.filter(s => s.status === 'in_transit');

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    return type === 'inbound'
      ? 'text-emerald-600 bg-emerald-50'
      : 'text-blue-600 bg-blue-50';
  };

  const getTransportIcon = (mode: string) => {
    // For simplicity, using Truck for all transport modes
    return Truck;
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }) + ' @ ' + date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + 'hrs';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Truck className="w-7 h-7 mr-3 text-blue-600" />
            Logística y Embarques
          </h1>
          <p className="text-gray-600 mt-1">Gestionar transporte y seguimiento de embarques</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Embarque
        </button>
      </div>

      {/* Operation Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Patio de Salidas */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-5">
            <Package className="w-6 h-6 text-yellow-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">En Patio de Salidas</h2>
            <span className="ml-auto bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
              {patioOperations.length}
            </span>
          </div>
          <div className="space-y-4">
            {patioOperations.map((op) => (
              <div key={op.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-all relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{op.contract?.number}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded text-xs font-medium">Activo</span>
                      <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-medium">Salida</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cliente</p>
                    <p className="text-sm font-semibold text-gray-900">{op.counterparty?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Commodity</p>
                    <p className="text-sm font-semibold text-gray-900">{op.contract?.commodity.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cantidad</p>
                    <p className="text-sm font-semibold text-gray-900">{op.weight} TM</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha de Entrega</p>
                    <p className="text-sm font-semibold text-gray-900">{op.scheduledDate.toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Operación:</span>
                      <p className="font-medium text-gray-900 mt-1">{op.number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Incoterm:</span>
                      <p className="font-medium text-gray-900 mt-1">{op.contract?.incoterms}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Destino:</span>
                      <p className="font-medium text-gray-900 mt-1">{op.destination.street}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded p-3 text-xs">
                  <p className="text-gray-500 mb-2">Especificaciones de Calidad:</p>
                  <div className="flex gap-4 flex-wrap">
                    {op.contract?.qualitySpecs.slice(0, 3).map((spec, idx) => (
                      <div key={idx}>
                        <span className="font-semibold text-gray-900">{spec.element}:</span>{' '}
                        <span className="text-gray-700">
                          {spec.type === 'penalty' && spec.maxValue ? `≤${spec.maxValue}` : `≥${spec.minValue}`}{spec.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                  <span className="font-medium">Operador:</span> {op.carrier} • <span className="font-medium">Placas:</span> {op.vehiclePlate} • <span className="font-medium">Ubicación:</span> {op.origin.street}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* En Tránsito */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-5">
            <Truck className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">En Tránsito</h2>
            <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              {transitOperations.length}
            </span>
          </div>
          <div className="space-y-4">
            {transitOperations.map((op) => (
              <div key={op.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-all relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{op.contract?.number}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded text-xs font-medium">Activo</span>
                      <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium">En Tránsito</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cliente</p>
                    <p className="text-sm font-semibold text-gray-900">{op.counterparty?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Commodity</p>
                    <p className="text-sm font-semibold text-gray-900">{op.contract?.commodity.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cantidad</p>
                    <p className="text-sm font-semibold text-gray-900">{op.weight} TM</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ETA Programado</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(op.scheduledDate)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Operación:</span>
                      <p className="font-medium text-gray-900 mt-1">{op.number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Incoterm:</span>
                      <p className="font-medium text-gray-900 mt-1">{op.contract?.incoterms}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ubicación:</span>
                      <p className="font-medium text-blue-600 mt-1">{op.currentLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded p-3 text-xs">
                  <p className="text-gray-500 mb-2">Especificaciones de Calidad:</p>
                  <div className="flex gap-4 flex-wrap">
                    {op.contract?.qualitySpecs.slice(0, 3).map((spec, idx) => (
                      <div key={idx}>
                        <span className="font-semibold text-gray-900">{spec.element}:</span>{' '}
                        <span className="text-gray-700">
                          {spec.type === 'penalty' && spec.maxValue ? `≤${spec.maxValue}` : `≥${spec.minValue}`}{spec.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                  <span className="font-medium">Operador:</span> {op.carrier} • <span className="font-medium">Placas:</span> {op.vehiclePlate} • <span className="font-medium">Cuota:</span> {op.deliveryQuota}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Embarques</p>
              <p className="text-2xl font-bold text-gray-900">{filteredShipments.length}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Tránsito</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredShipments.filter(s => s.status === 'in_transit').length}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Planificados</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredShipments.filter(s => s.status === 'planned').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entregados</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredShipments.filter(s => s.status === 'delivered').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
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
              placeholder="Buscar por número de embarque, transportista o contraparte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los Tipos</option>
              <option value="inbound">Entrada</option>
              <option value="outbound">Salida</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los Estados</option>
              <option value="planned">Planificado</option>
              <option value="in_transit">En Tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="delayed">Retrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles del Embarque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato y Contraparte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cronograma
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
              {filteredShipments.map((shipment) => {
                const TransportIcon = getTransportIcon(shipment.transportMode);

                return (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{shipment.number}</div>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(shipment.type)}`}>
                          {shipment.type === 'inbound' ? 'ENTRADA' : 'SALIDA'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Lotes: {shipment.lots.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{shipment.contract?.number}</div>
                      <div className="text-sm text-gray-500">{shipment.counterparty?.name}</div>
                      <div className="text-sm text-gray-500">{shipment.contract?.commodity.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <TransportIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 capitalize">
                            {shipment.transportMode === 'truck' ? 'camión' :
                             shipment.transportMode === 'rail' ? 'ferrocarril' :
                             shipment.transportMode === 'ship' ? 'barco' : 'avión'}
                          </div>
                          <div className="text-sm text-gray-500">{shipment.carrier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          {shipment.origin.city}, {shipment.origin.state}
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          {shipment.destination.city}, {shipment.destination.state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {shipment.scheduledDate.toLocaleDateString('es-ES')}
                      </div>
                      {shipment.actualDate && (
                        <div className="text-sm text-gray-500">
                          Real: {shipment.actualDate.toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status === 'planned' ? 'PLANIFICADO' :
                         shipment.status === 'in_transit' ? 'EN TRÁNSITO' :
                         shipment.status === 'delivered' ? 'ENTREGADO' : 'RETRASADO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(shipment)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
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

      {filteredShipments.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron embarques</p>
          <p className="text-gray-400">Intenta ajustar tus criterios de búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
};

export default LogisticsList;

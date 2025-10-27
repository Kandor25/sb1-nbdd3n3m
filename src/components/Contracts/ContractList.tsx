import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { mockContracts, mockCounterparties } from '../../data/mockData';
import type { Contract } from '../../types';

interface ContractListProps {
  onCreateNew: () => void;
  onViewDetails: (contract: Contract) => void;
}

const ContractList: React.FC<ContractListProps> = ({ onCreateNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Add counterparty data to contracts
  const contractsWithCounterparties = mockContracts.map(contract => ({
    ...contract,
    counterparty: mockCounterparties.find(cp => cp.id === contract.counterpartyId)
  }));

  // Separate pending confirmation contracts
  const pendingContracts = contractsWithCounterparties.filter(c => c.status === 'draft');

  const filteredContracts = contractsWithCounterparties.filter(contract => {
    const matchesSearch = contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.counterparty?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contract.type === filterType;
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'purchase' ? TrendingDown : TrendingUp;
  };

  const getTypeColor = (type: string) => {
    return type === 'purchase' 
      ? 'text-emerald-600 bg-emerald-50' 
      : 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-7 h-7 mr-3 text-blue-600" />
            Contratos
          </h1>
          <p className="text-gray-600 mt-1">Gestionar contratos de compra y venta</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contrato
        </button>
      </div>

      {/* Pending Confirmation Section */}
      {pendingContracts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-800">Por Confirmar</h2>
            <span className="ml-auto bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              {pendingContracts.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingContracts.map((contract) => {
              const daysDelayed = Math.floor((Date.now() - contract.createdAt.getTime()) / (1000 * 60 * 60 * 24));
              const deliveryPeriodText = `${contract.deliveryPeriod.start.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })} - ${contract.deliveryPeriod.end.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;

              return (
                <div key={contract.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-40">
                      <h3 className="text-base font-bold text-gray-900 mb-2">{contract.number}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-medium">Por Confirmar</span>
                        <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                          {contract.type === 'purchase' ? 'Compra' : 'Venta'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-sm space-y-1.5">
                        <p>
                          <span className="font-semibold text-gray-900">{contract.commodity.name}</span> / {deliveryPeriodText} / Total <span className="font-semibold">{contract.quantity.toLocaleString()} dmt</span> / Type: <span className="font-medium">Renovación</span> / Cliente: <span className="font-medium">{contract.counterparty?.name}</span>
                        </p>
                        {daysDelayed > 0 && (
                          <p className="text-red-600">
                            <span className="font-semibold">Delayed:</span> {daysDelayed} días atraso
                          </p>
                        )}
                      </div>
                    </div>

                    <button className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold">Action:</span> Falta confirmar versión 2.0 <span className="mx-2">=⇒</span> <span className="font-medium">{contract.counterparty?.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de contrato, commodity o contraparte..."
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
              <option value="purchase">Compra</option>
              <option value="sale">Venta</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los Estados</option>
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contraparte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commodity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período de Entrega
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
              {filteredContracts.map((contract) => {
                const TypeIcon = getTypeIcon(contract.type);
                
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getTypeColor(contract.type)} mr-3`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contract.number}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {contract.type === 'purchase' ? 'compra' : 'venta'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.counterparty?.name}</div>
                      <div className="text-sm text-gray-500">
                        {contract.counterparty?.type === 'client' ? 'cliente' :
                         contract.counterparty?.type === 'supplier' ? 'proveedor' :
                         contract.counterparty?.type === 'transporter' ? 'transportista' : 'ambos'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.commodity.name}</div>
                      <div className="text-sm text-gray-500">{contract.commodity.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.quantity.toLocaleString()} TM</div>
                      <div className="text-sm text-gray-500">±{contract.tolerance}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {contract.deliveryPeriod.start.toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-sm text-gray-500">
                        hasta {contract.deliveryPeriod.end.toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status === 'active' ? 'activo' : 
                         contract.status === 'draft' ? 'borrador' : 
                         contract.status === 'completed' ? 'completado' : 'cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(contract)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron contratos</p>
          <p className="text-gray-400">Intenta ajustar tus criterios de búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
};

export default ContractList;
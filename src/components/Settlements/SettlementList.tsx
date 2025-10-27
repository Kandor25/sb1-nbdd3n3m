import React, { useState } from 'react';
import { Calculator, Plus, Search, Filter, DollarSign, FileText, Eye, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { mockSettlements, mockContracts, mockCounterparties } from '../../data/mockData';
import type { Settlement } from '../../types';

interface SettlementListProps {
  onCreateNew: () => void;
  onViewDetails: (settlement: Settlement) => void;
}

interface OverdueItem {
  id: string;
  type: string;
  shipment: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  scheduledDate: Date;
}

const SettlementList: React.FC<SettlementListProps> = ({ onCreateNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Add contract and counterparty data to settlements
  const settlementsWithDetails = mockSettlements.map(settlement => ({
    ...settlement,
    contract: mockContracts.find(c => c.id === settlement.contractId),
    counterparty: mockCounterparties.find(cp =>
      mockContracts.find(c => c.id === settlement.contractId)?.counterpartyId === cp.id
    )
  }));

  // Mock overdue payments and collections
  const overduePayments: OverdueItem[] = [
    {
      id: '1',
      type: 'Ensayes laboratorios SGS Peru Jul.25',
      shipment: '10102015',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Jul.25',
      scheduledDate: new Date('2025-10-03')
    }
  ];

  const overdueCollections: OverdueItem[] = [
    {
      id: '2',
      type: 'Pago provisional',
      shipment: '10102015',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Jul.25',
      scheduledDate: new Date('2025-10-07')
    },
    {
      id: '3',
      type: 'Pago provisional',
      shipment: '17112015',
      quantity: 70,
      commodity: 'Concentrado Cu',
      client: 'Peñasquito',
      contract: 'Contrato 10',
      quota: 'Oct.25',
      scheduledDate: new Date('2029-01-10')
    }
  ];

  const filteredSettlements = settlementsWithDetails.filter(settlement => {
    const matchesSearch = settlement.contract?.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         settlement.counterparty?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || settlement.type === filterType;
    const matchesStatus = filterStatus === 'all' || settlement.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    return type === 'provisional' 
      ? 'text-orange-600 bg-orange-50' 
      : 'text-green-600 bg-green-50';
  };

  const totalValue = filteredSettlements.reduce((sum, settlement) => sum + settlement.totalValue, 0);
  const pendingValue = filteredSettlements
    .filter(s => s.status === 'draft' || s.status === 'sent')
    .reduce((sum, settlement) => sum + settlement.totalValue, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calculator className="w-7 h-7 mr-3 text-green-600" />
            Liquidaciones y Ajustes
          </h1>
          <p className="text-gray-600 mt-1">Gestionar cálculos de liquidaciones provisionales y finales</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Valor Total de Liquidaciones</p>
            <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Liquidación
          </button>
        </div>
      </div>

      {/* Overdue Payments and Collections Section */}
      <div className="space-y-6">
        {/* Overdue Payments */}
        {overduePayments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Pagos Vencidos</h2>
              <span className="ml-auto bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {overduePayments.length}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {overduePayments.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-48">
                      <h3 className="text-base font-bold text-gray-900 mb-2">Embarque {item.shipment}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-medium">Vencido</span>
                        <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Pago</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-sm space-y-1.5">
                        <p>
                          <span className="font-semibold text-gray-900">Tipo:</span> {item.type} <span className="mx-2">=⇒</span> Embarque {item.shipment} / <span className="font-semibold">{item.quantity}dmt</span> / {item.commodity} / Cliente {item.client} / {item.contract} / Cuota {item.quota}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">ETA Programada =⇒</span> {item.scheduledDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overdue Collections */}
        {overdueCollections.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center mb-4">
              <TrendingDown className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Cobros Vencidos</h2>
              <span className="ml-auto bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {overdueCollections.length}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {overdueCollections.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-48">
                      <h3 className="text-base font-bold text-gray-900 mb-2">Embarque {item.shipment}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium">Vencido</span>
                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-xs font-medium">Cobro</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-sm space-y-1.5">
                        <p>
                          <span className="font-semibold text-gray-900">Tipo:</span> {item.type} <span className="mx-2">=⇒</span> Embarque {item.shipment} / <span className="font-semibold">{item.quantity}dmt</span> / {item.commodity} / Cliente {item.client} / {item.contract} / Cuota {item.quota}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">Programada =⇒</span> {item.scheduledDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Liquidaciones</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSettlements.length}</p>
            </div>
            <Calculator className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Pendiente</p>
              <p className="text-2xl font-bold text-gray-900">${(pendingValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSettlements.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disputadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSettlements.filter(s => s.status === 'disputed').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-red-600" />
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
              placeholder="Buscar por número de contrato o contraparte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos los Tipos</option>
              <option value="provisional">Provisional</option>
              <option value="final">Final</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos los Estados</option>
              <option value="draft">Borrador</option>
              <option value="sent">Enviada</option>
              <option value="approved">Aprobada</option>
              <option value="disputed">Disputada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles de Liquidación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato y Contraparte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Elementos y Valores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
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
              {filteredSettlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Liquidación #{settlement.id}</div>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(settlement.type)}`}>
                        {settlement.type === 'provisional' ? 'PROVISIONAL' : 'FINAL'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Creada: {settlement.createdAt.toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{settlement.contract?.number}</div>
                    <div className="text-sm text-gray-500">{settlement.counterparty?.name}</div>
                    <div className="text-sm text-gray-500">{settlement.contract?.commodity.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {settlement.calculations.slice(0, 3).map((calc, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium text-gray-900">{calc.element}:</span>
                          <span className="text-gray-600 ml-1">
                            {calc.quantity.toFixed(2)} × ${calc.price} = ${calc.netValue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-gray-900">
                      ${settlement.totalValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{settlement.currency}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(settlement.status)}`}>
                      {settlement.status === 'draft' ? 'BORRADOR' :
                       settlement.status === 'sent' ? 'ENVIADA' :
                       settlement.status === 'approved' ? 'APROBADA' : 'DISPUTADA'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(settlement)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSettlements.length === 0 && (
        <div className="text-center py-12">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron liquidaciones</p>
          <p className="text-gray-400">Intenta ajustar tus criterios de búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
};

export default SettlementList;
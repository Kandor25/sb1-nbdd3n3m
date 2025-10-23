import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Eye, Edit, Mail, Phone } from 'lucide-react';
import { mockCounterparties } from '../../data/mockData';
import type { Counterparty } from '../../types';

interface CounterpartyListProps {
  onCreateNew: () => void;
  onViewDetails: (counterparty: Counterparty) => void;
}

const CounterpartyList: React.FC<CounterpartyListProps> = ({ onCreateNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredCounterparties = mockCounterparties.filter(cp => {
    const matchesSearch = cp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cp.taxId.includes(searchTerm);
    const matchesType = filterType === 'all' || cp.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      client: 'bg-blue-100 text-blue-800',
      supplier: 'bg-emerald-100 text-emerald-800',
      transporter: 'bg-orange-100 text-orange-800',
      both: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-7 h-7 mr-3 text-blue-600" />
            Contrapartes
          </h1>
          <p className="text-gray-600 mt-1">Gestionar clientes, proveedores y transportistas</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Contraparte
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o RUC/ID fiscal..."
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
              <option value="client">Clientes</option>
              <option value="supplier">Proveedores</option>
              <option value="transporter">Transportistas</option>
              <option value="both">Ambos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Counterparties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCounterparties.map((counterparty) => {
          const primaryContact = counterparty.contacts.find(c => c.isPrimary) || counterparty.contacts[0];
          const primaryAddress = counterparty.addresses.find(a => a.isPrimary) || counterparty.addresses[0];

          return (
            <div key={counterparty.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{counterparty.name}</h3>
                    <p className="text-sm text-gray-500">RUC/ID: {counterparty.taxId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(counterparty.type)}`}>
                    {counterparty.type === 'client' ? 'CLIENTE' :
                     counterparty.type === 'supplier' ? 'PROVEEDOR' :
                     counterparty.type === 'transporter' ? 'TRANSPORTISTA' : 'AMBOS'}
                  </span>
                </div>

                {primaryContact && (
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-900 font-medium">{primaryContact.name}</div>
                    <div className="text-sm text-gray-500">{primaryContact.position}</div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-1" />
                        {primaryContact.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-1" />
                        {primaryContact.phone}
                      </div>
                    </div>
                  </div>
                )}

                {primaryAddress && (
                  <div className="text-sm text-gray-500 mb-4">
                    <p>{primaryAddress.street}</p>
                    <p>{primaryAddress.city}, {primaryAddress.state} {primaryAddress.postalCode}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Creado: {counterparty.createdAt.toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(counterparty)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver Detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCounterparties.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron contrapartes</p>
          <p className="text-gray-400">Intenta ajustar tus criterios de búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
};

export default CounterpartyList;
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle, Calculator, MoreVertical, Edit2, FileCheck, Copy } from 'lucide-react';
import { mockContracts, mockCounterparties } from '../../data/mockData';
import type { Contract } from '../../types';
import ManualValuation from './ManualValuation';
import ContractDetailsView from './ContractDetailsView';
import { supabase } from '../../lib/supabase';

interface ContractListProps {
  onCreateNew: () => void;
  onViewDetails: (contract: Contract) => void;
}

const ContractList: React.FC<ContractListProps> = ({ onCreateNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showValuation, setShowValuation] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [dbContracts, setDbContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          vendor:vendors(id, name),
          buyer:buyers(id, name),
          product:products(id, name)
        `);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedContracts = data.map((contract: any) => ({
          id: contract.id,
          number: contract.contract_number,
          type: contract.contract_type,
          counterpartyId: contract.contract_type === 'purchase' ? contract.vendor_id : contract.buyer_id,
          counterparty: contract.contract_type === 'purchase' ? contract.vendor : contract.buyer,
          commodity: {
            name: contract.product?.name || 'N/A',
            grade: 'N/A'
          },
          quantity: 0,
          tolerance: 0,
          deliveryPeriod: {
            start: new Date(contract.start_month),
            end: new Date(contract.end_month)
          },
          createdAt: contract.created_at ? new Date(contract.created_at) : new Date(),
          status: contract.status || 'active'
        }));
        setDbContracts(formattedContracts);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const allContracts = dbContracts.length > 0 ? dbContracts : mockContracts;

  const contractsWithCounterparties = allContracts.map(contract => ({
    ...contract,
    counterparty: contract.counterparty || mockCounterparties.find(cp => cp.id === contract.counterpartyId)
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

  const handleOpenValuation = (contractId: string) => {
    setSelectedContractId(contractId);
    setShowValuation(true);
  };

  const handleCloseValuation = () => {
    setShowValuation(false);
    setSelectedContractId(null);
  };

  const handleOpenContractDetails = () => {
    setShowContractDetails(true);
  };

  const handleCloseContractDetails = () => {
    setShowContractDetails(false);
  };

  const toggleMenu = (contractId: string) => {
    setOpenMenuId(openMenuId === contractId ? null : contractId);
  };

  const handleMenuAction = (action: string, contractId: string) => {
    setOpenMenuId(null);

    switch (action) {
      case 'edit':
        break;
      case 'summary':
        handleOpenContractDetails();
        break;
      case 'valuation':
        handleOpenValuation(contractId);
        break;
      case 'clone':
        break;
    }
  };

  const statusSummary = {
    draft: contractsWithCounterparties.filter(c => c.status === 'draft').length,
    active: contractsWithCounterparties.filter(c => c.status === 'active').length,
    completed: contractsWithCounterparties.filter(c => c.status === 'completed').length,
    cancelled: contractsWithCounterparties.filter(c => c.status === 'cancelled').length,
  };

  return (
    <>
      {showValuation && selectedContractId && (
        <ManualValuation
          contractId={selectedContractId}
          onClose={handleCloseValuation}
          onSuccess={handleCloseValuation}
        />
      )}
      {showContractDetails && (
        <ContractDetailsView
          onClose={handleCloseContractDetails}
        />
      )}
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

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterStatus('draft')}
          className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Borrador</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statusSummary.draft}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Contratos en borrador</p>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('active')}
          className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-5 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Activos</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{statusSummary.active}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-green-100">
            <p className="text-xs text-gray-500">Contratos activos</p>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('completed')}
          className="bg-white rounded-lg shadow-sm border-2 border-blue-200 p-5 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Completados</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{statusSummary.completed}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-100">
            <p className="text-xs text-gray-500">Contratos completados</p>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('cancelled')}
          className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-5 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 uppercase tracking-wide">Cancelados</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{statusSummary.cancelled}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-red-100">
            <p className="text-xs text-gray-500">Contratos cancelados</p>
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
            {(filterStatus !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                }}
                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
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
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => toggleMenu(contract.id)}
                          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openMenuId === contract.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                          >
                            <button
                              onClick={() => handleMenuAction('edit', contract.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Edit2 className="w-4 h-4 mr-3 text-gray-500" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleMenuAction('summary', contract.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <FileCheck className="w-4 h-4 mr-3 text-blue-500" />
                              Resumen
                            </button>
                            <button
                              onClick={() => handleMenuAction('valuation', contract.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Calculator className="w-4 h-4 mr-3 text-green-500" />
                              Valorización
                            </button>
                            <button
                              onClick={() => handleMenuAction('clone', contract.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Copy className="w-4 h-4 mr-3 text-purple-500" />
                              Clonar
                            </button>
                          </div>
                        )}
                      </div>
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
    </>
  );
};

export default ContractList;
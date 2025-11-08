import React, { useState } from 'react';
import { FileText, Package, Truck, DollarSign, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import MetricCard from './MetricCard';
import { mockDashboardMetrics, mockContracts, mockInventoryLots, mockShipments } from '../../data/mockData';

interface PendingContract {
  id: string;
  commodity: string;
  deliveryPeriod: string;
  quantity: number;
  type: string;
  client: string;
  delayed: number;
  action: string;
}

const Dashboard: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    contratos: true,
    logistica: false,
    ensayos: false,
    pagos: false,
    fijaciones: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Mock data for pending contracts
  const pendingContracts: PendingContract[] = [
    {
      id: '1',
      commodity: 'Concentrado Cu',
      deliveryPeriod: 'Ene-Dec 2026',
      quantity: 1200,
      type: 'Renovación',
      client: 'Trader A',
      delayed: 10,
      action: 'Falta confirmar versión 2.0 ==> Cliente Trader A'
    },
    {
      id: '2',
      commodity: 'Concentrado Zn',
      deliveryPeriod: 'Mar-Sep 2026',
      quantity: 800,
      type: 'Nuevo',
      client: 'Peñasquito',
      delayed: 5,
      action: 'Falta confirmar versión 1.0 ==> Cliente Peñasquito'
    },
    {
      id: '3',
      commodity: 'Concentrado Cu',
      deliveryPeriod: 'Jun-Dec 2026',
      quantity: 1500,
      type: 'Renovación',
      client: 'Glencore',
      delayed: 15,
      action: 'Falta confirmar versión 3.0 ==> Cliente Glencore'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Trading</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Contratos Activos"
          value={mockDashboardMetrics.activeContracts}
          change={{ value: 12, isPositive: true }}
          icon={FileText}
          color="blue"
        />
        <MetricCard
          title="Inventario Total (TM)"
          value={mockDashboardMetrics.totalInventory.toLocaleString()}
          change={{ value: 5, isPositive: true }}
          icon={Package}
          color="emerald"
        />
        <MetricCard
          title="Valor del Inventario"
          value={`$${(mockDashboardMetrics.inventoryValue / 1000000).toFixed(1)}M`}
          change={{ value: 8, isPositive: true }}
          icon={DollarSign}
          color="orange"
        />
        <MetricCard
          title="Embarques Pendientes"
          value={mockDashboardMetrics.pendingShipments}
          change={{ value: 3, isPositive: false }}
          icon={Truck}
          color="red"
        />
      </div>

      {/* Category Panels */}
      <div className="space-y-4">
        {/* 1. Contratos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('contratos')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">1. Contratos</h2>
              <span className="ml-3 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {pendingContracts.length} Por Confirmar
              </span>
            </div>
            {expandedSections.contratos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.contratos && (
            <div className="px-6 pb-5">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingContracts.map((contract) => (
                  <div key={contract.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-40">
                        <h3 className="text-base font-bold text-gray-900 mb-2">{contract.client}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-medium">Por Confirmar</span>
                          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">{contract.type}</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-sm space-y-1.5">
                          <p>
                            <span className="font-semibold text-gray-900">{contract.commodity}</span> / {contract.deliveryPeriod} / Total <span className="font-semibold">{contract.quantity.toLocaleString()}dmt</span> / Type: <span className="font-medium">{contract.type}</span> / Cliente {contract.client}
                          </p>
                          {contract.delayed > 0 && (
                            <p className="text-red-600">
                              <span className="font-semibold">Delayed:</span> {contract.delayed} días atraso
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-700">
                        <span className="font-semibold">Action:</span> {contract.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Logística */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('logistica')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Truck className="w-5 h-5 text-blue-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">2. Logística</h2>
            </div>
            {expandedSections.logistica ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.logistica && (
            <div className="px-6 pb-5">
              <p className="text-gray-500 text-sm">Contenido de Logística próximamente...</p>
            </div>
          )}
        </div>

        {/* 3. Ensayos & Pesos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('ensayos')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Package className="w-5 h-5 text-emerald-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">3. Ensayos & Pesos</h2>
            </div>
            {expandedSections.ensayos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.ensayos && (
            <div className="px-6 pb-5">
              <p className="text-gray-500 text-sm">Contenido de Ensayos & Pesos próximamente...</p>
            </div>
          )}
        </div>

        {/* 4. Pagos & Cobros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('pagos')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">4. Pagos & Cobros</h2>
            </div>
            {expandedSections.pagos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.pagos && (
            <div className="px-6 pb-5">
              <p className="text-gray-500 text-sm">Contenido de Pagos & Cobros próximamente...</p>
            </div>
          )}
        </div>

        {/* 5. Fijaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('fijaciones')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-orange-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">5. Fijaciones</h2>
            </div>
            {expandedSections.fijaciones ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.fijaciones && (
            <div className="px-6 pb-5">
              <p className="text-gray-500 text-sm">Contenido de Fijaciones próximamente...</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contracts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Contratos Recientes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockContracts.slice(0, 3).map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{contract.number}</div>
                    <div className="text-sm text-gray-500">{contract.commodity.name}</div>
                    <div className="text-sm text-gray-500">{contract.quantity.toLocaleString()} MT</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      contract.type === 'purchase' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {contract.type === 'purchase' ? 'COMPRA' : 'VENTA'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 capitalize">
                      {contract.status === 'active' ? 'activo' : 
                       contract.status === 'draft' ? 'borrador' : 
                       contract.status === 'completed' ? 'completado' : 'cancelado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-emerald-600" />
              Resumen de Inventario
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockInventoryLots.slice(0, 3).map((lot) => (
                <div key={lot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{lot.lotNumber}</div>
                    <div className="text-sm text-gray-500">{lot.commodity.name}</div>
                    <div className="text-sm text-gray-500">{lot.location.warehouse}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{lot.weights.dry} TM</div>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      lot.location.status === 'in_warehouse' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lot.location.status === 'in_warehouse' ? 'EN ALMACÉN' : 
                       lot.location.status === 'in_transit' ? 'EN TRÁNSITO' : 
                       lot.location.status === 'shipped' ? 'DESPACHADO' : 'RECIBIDO'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Alertas y Notificaciones
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <div className="font-medium text-orange-800">Resultados de Ensayos Pendientes</div>
                <div className="text-sm text-orange-700">2 lotes esperando resultados de laboratorio de ALS Labs</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 border-l-4 border-red-400 rounded-r">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <div className="font-medium text-red-800">Liquidación Vencida</div>
                <div className="text-sm text-red-700">La liquidación del contrato PUR-2024-001 tiene 3 días de retraso</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-blue-800">Actualización de Mercado</div>
                <div className="text-sm text-blue-700">Precios del cobre subieron 2.3% - Revisar posiciones de cobertura</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
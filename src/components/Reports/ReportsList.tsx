import React, { useState } from 'react';
import { BarChart3, TrendingUp, FileText, Download, Calendar, DollarSign, Package, Truck } from 'lucide-react';
import { mockDashboardMetrics, mockContracts, mockInventoryLots, mockSettlements } from '../../data/mockData';

const ReportsList: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [dateRange, setDateRange] = useState('30days');

  // Calculate key metrics
  const totalContractValue = mockContracts.reduce((sum, contract) => {
    // Simplified value calculation
    return sum + (contract.quantity * 8500); // Assuming average price
  }, 0);

  const totalInventoryWeight = mockInventoryLots.reduce((sum, lot) => sum + lot.weights.dry, 0);
  
  const settlementsValue = mockSettlements.reduce((sum, settlement) => sum + settlement.totalValue, 0);

  const reports = [
    { id: 'overview', name: 'Resumen de Negocio', icon: BarChart3, color: 'blue' },
    { id: 'contracts', name: 'Análisis de Contratos', icon: FileText, color: 'emerald' },
    { id: 'inventory', name: 'Reporte de Inventario', icon: Package, color: 'orange' },
    { id: 'logistics', name: 'Rendimiento Logístico', icon: Truck, color: 'purple' },
    { id: 'financial', name: 'Resumen Financiero', icon: DollarSign, color: 'green' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      green: 'bg-green-50 text-green-700 border-green-200'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
            Reportes y Análisis
          </h1>
          <p className="text-gray-600 mt-1">Inteligencia de negocios y métricas de rendimiento</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
            <option value="ytd">Año hasta la fecha</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Navigation */}
        <div className="space-y-2">
          {reports.map((report) => {
            const Icon = report.icon;
            const isActive = selectedReport === report.id;
            
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors border ${
                  isActive 
                    ? getColorClasses(report.color) + ' border-2' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{report.name}</span>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          {selectedReport === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores Clave de Rendimiento</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{mockDashboardMetrics.activeContracts}</div>
                    <div className="text-sm text-gray-600">Contratos Activos</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <Package className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-600">{totalInventoryWeight.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">TM Inventario</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">${(totalContractValue/1000000).toFixed(1)}M</div>
                    <div className="text-sm text-gray-600">Valor de Contratos</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">${(settlementsValue/1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600">Liquidaciones</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Contratos</h3>
                <div className="space-y-4">
                  {mockContracts.map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{contract.number}</div>
                        <div className="text-sm text-gray-500">{contract.commodity.name} - {contract.quantity} TM</div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          contract.type === 'purchase' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
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
          )}

          {selectedReport === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Inventario</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{mockInventoryLots.length}</div>
                    <div className="text-sm text-gray-600">Total de Lotes</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalInventoryWeight.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Peso Total (TM)</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {mockInventoryLots.filter(lot => lot.assays.some(a => a.status === 'pending')).length}
                    </div>
                    <div className="text-sm text-gray-600">Ensayos Pendientes</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Inventario por Ubicación</h4>
                  {mockInventoryLots.map((lot) => (
                    <div key={lot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{lot.lotNumber}</div>
                        <div className="text-sm text-gray-500">{lot.location.warehouse}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{lot.weights.dry} TM</div>
                        <div className="text-sm text-gray-500">{lot.commodity.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add similar content blocks for other report types */}
          {selectedReport !== 'overview' && selectedReport !== 'inventory' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {reports.find(r => r.id === selectedReport)?.name}
              </h3>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Contenido del reporte próximamente...</p>
                <p className="text-gray-400 text-sm">Este reporte estará disponible en la próxima versión</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsList;
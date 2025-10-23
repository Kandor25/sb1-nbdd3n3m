import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Palette, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'data', name: 'Gestión de Datos', icon: Database },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
    { id: 'system', name: 'Sistema', icon: Globe }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="w-7 h-7 mr-3 text-gray-600" />
          Configuración
        </h1>
        <p className="text-gray-600 mt-1">Gestionar tu cuenta y preferencias del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      defaultValue="John Smith"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      defaultValue="john.smith@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Comerciante</option>
                      <option>Gerente</option>
                      <option>Administrador</option>
                      <option>Logística</option>
                      <option>Almacén</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue="+1-555-0123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>UTC-08:00 Hora del Pacífico</option>
                    <option>UTC-05:00 Hora del Este</option>
                    <option>UTC+00:00 UTC</option>
                    <option>UTC+01:00 Hora de Europa Central</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Seguridad</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Cambiar Contraseña</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Autenticación de Dos Factores</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Habilitar 2FA</div>
                      <div className="text-sm text-gray-500">Agregar una capa extra de seguridad a tu cuenta</div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Habilitar
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Actualizar Configuración de Seguridad
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add content for other tabs as needed */}
          {activeTab !== 'profile' && activeTab !== 'security' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {tabs.find(t => t.id === activeTab)?.name}
              </h3>
              <div className="text-center py-12">
                <SettingsIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Panel de configuración próximamente...</p>
                <p className="text-gray-400 text-sm">Esta sección estará disponible en la próxima versión</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
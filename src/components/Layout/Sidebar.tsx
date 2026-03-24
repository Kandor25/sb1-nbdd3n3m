import React from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Package,
  Truck,
  Calculator,
  Settings,
  Home,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import logo from '../../assets/MinSoftCTRM.png';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Panel Principal', icon: Home },
  { id: 'counterparties', label: 'Contrapartes', icon: Users },
  { id: 'contracts', label: 'Contratos', icon: FileText },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'logistics', label: 'Logística', icon: Truck },
  { id: 'settlements', label: 'Liquidaciones', icon: Calculator },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
  { id: 'chat', label: 'Asistente IA', icon: MessageCircle },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, isCollapsed, onToggle }) => {
  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-screen flex-shrink-0 transition-all duration-300 relative`}>
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-1.5 shadow-lg z-10 transition-colors"
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </button>

      <div className={`p-6 border-b border-slate-700 ${isCollapsed ? 'px-3' : ''}`}>
        {!isCollapsed ? (
          <>
            <img
              src={logo}
              alt="MineSoft CTRM Logo"
              className="w-full h-auto mb-4"
            />
            <h1 className="text-xl font-bold text-emerald-400">Commodity Trade Core</h1>
            <p className="text-sm text-slate-400 mt-1">Plataforma de Trading</p>
          </>
        ) : (
          <div className="flex justify-center">
            <img
              src={logo}
              alt="MineSoft CTRM Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
        )}
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-6'} py-3 text-left hover:bg-slate-800 transition-colors ${
                isActive ? 'bg-blue-600 border-r-3 border-blue-400' : ''
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''}`} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
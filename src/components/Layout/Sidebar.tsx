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
  MessageCircle
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex-shrink-0">
      <div className="p-6 border-b border-slate-700">
        <img
          src="/src/assets/MinSoftCTRM.png"
          alt="MineSoft CTRM Logo"
          className="w-full h-16 mb-4"
        />
        <h1 className="text-xl font-bold text-emerald-400">Commodity Trade Core</h1>
        <p className="text-sm text-slate-400 mt-1">Plataforma de Trading</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-800 transition-colors ${
                isActive ? 'bg-blue-600 border-r-3 border-blue-400' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
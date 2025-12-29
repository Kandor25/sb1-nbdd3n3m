import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import CounterpartyList from './components/Counterparties/CounterpartyList';
import ContractList from './components/Contracts/ContractList';
import ContractForm from './components/Contracts/ContractForm';
import InventoryList from './components/Inventory/InventoryList';
import LogisticsList from './components/Logistics/LogisticsList';
import SettlementList from './components/Settlements/SettlementList';
import ReportsList from './components/Reports/ReportsList';
import Settings from './components/Settings/Settings';
import ChatInterface from './components/Chat/ChatInterface';
import type { User, Counterparty, Contract, InventoryLot, Shipment, Settlement } from './types';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showContractForm, setShowContractForm] = useState(false);
  
  const currentUser: User = {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'trader',
    avatar: undefined
  };

  // Placeholder handlers - in real app these would connect to backend
  const handleCreateCounterparty = () => {
    console.log('Create new counterparty');
  };

  const handleViewCounterparty = (counterparty: Counterparty) => {
    console.log('View counterparty:', counterparty);
  };

  const handleCreateContract = () => {
    setShowContractForm(true);
  };

  const handleContractFormClose = () => {
    setShowContractForm(false);
  };

  const handleContractFormSuccess = () => {
    setShowContractForm(false);
  };

  const handleViewContract = (contract: Contract) => {
    console.log('View contract:', contract);
  };

  const handleCreateInventoryLot = () => {
    console.log('Create new inventory lot');
  };

  const handleViewInventoryLot = (lot: InventoryLot) => {
    console.log('View inventory lot:', lot);
  };

  const handleCreateShipment = () => {
    console.log('Create new shipment');
  };

  const handleViewShipment = (shipment: Shipment) => {
    console.log('View shipment:', shipment);
  };

  const handleCreateSettlement = () => {
    console.log('Create new settlement');
  };

  const handleViewSettlement = (settlement: Settlement) => {
    console.log('View settlement:', settlement);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'counterparties':
        return (
          <CounterpartyList 
            onCreateNew={handleCreateCounterparty}
            onViewDetails={handleViewCounterparty}
          />
        );
      case 'contracts':
        return (
          <ContractList 
            onCreateNew={handleCreateContract}
            onViewDetails={handleViewContract}
          />
        );
      case 'inventory':
        return (
          <InventoryList 
            onCreateNew={handleCreateInventoryLot}
            onViewDetails={handleViewInventoryLot}
          />
        );
      case 'logistics':
        return (
          <LogisticsList 
            onCreateNew={handleCreateShipment}
            onViewDetails={handleViewShipment}
          />
        );
      case 'settlements':
        return (
          <SettlementList 
            onCreateNew={handleCreateSettlement}
            onViewDetails={handleViewSettlement}
          />
        );
      case 'reports':
        return <ReportsList />;
      case 'chat':
        return <ChatInterface />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentUser={currentUser} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {renderActiveSection()}
        </main>
      </div>

      {showContractForm && (
        <ContractForm
          onClose={handleContractFormClose}
          onSuccess={handleContractFormSuccess}
        />
      )}
    </div>
  );
}

export default App;
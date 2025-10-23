// Core Types for Commodity Trading System
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trader' | 'logistics' | 'warehouse' | 'manager';
  avatar?: string;
}

export interface Counterparty {
  id: string;
  name: string;
  taxId: string;
  type: 'client' | 'supplier' | 'transporter' | 'both';
  contacts: Contact[];
  addresses: Address[];
  bankingInfo?: BankingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  isPrimary: boolean;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'warehouse';
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
}

export interface BankingInfo {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
}

export interface Contract {
  id: string;
  number: string;
  type: 'purchase' | 'sale';
  counterpartyId: string;
  counterparty?: Counterparty;
  commodity: Commodity;
  quantity: number;
  tolerance: number; // percentage
  qualitySpecs: QualitySpec[];
  pricing: PricingTerms;
  deliveryPeriod: {
    start: Date;
    end: Date;
  };
  incoterms: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Commodity {
  id: string;
  name: string;
  type: 'concentrate' | 'refined' | 'scrap' | 'precious_metal';
  grade?: string;
  description?: string;
}

export interface QualitySpec {
  element: string;
  type: 'payable' | 'penalty';
  minValue?: number;
  maxValue?: number;
  expectedValue: number;
  unit: string;
}

export interface PricingTerms {
  type: 'fixed' | 'formula';
  fixedPrice?: number;
  formula?: string;
  currency: string;
  finalPrice?: number;
}

export interface InventoryLot {
  id: string;
  lotNumber: string;
  contractId?: string;
  commodity: Commodity;
  weights: {
    wet: number;
    dry: number;
    moisture: number;
  };
  assays: Assay[];
  location: {
    warehouse: string;
    position?: string;
    status: 'in_warehouse' | 'in_transit' | 'shipped' | 'received';
  };
  receivedDate: Date;
  quality: QualityResult[];
  documents: Document[];
}

export interface Assay {
  id: string;
  laboratory: string;
  dateReceived: Date;
  dateCompleted?: Date;
  results: AssayResult[];
  status: 'pending' | 'completed' | 'disputed';
}

export interface AssayResult {
  element: string;
  value: number;
  unit: string;
  method: string;
}

export interface QualityResult {
  element: string;
  value: number;
  unit: string;
  grade: 'payable' | 'penalty';
}

export interface Shipment {
  id: string;
  number: string;
  contractId: string;
  lots: string[];
  type: 'inbound' | 'outbound';
  transportMode: 'truck' | 'rail' | 'ship' | 'air';
  carrier: string;
  origin: Address;
  destination: Address;
  status: 'planned' | 'in_transit' | 'delivered' | 'delayed';
  scheduledDate: Date;
  actualDate?: Date;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Settlement {
  id: string;
  contractId: string;
  shipmentId: string;
  type: 'provisional' | 'final';
  calculations: SettlementCalculation[];
  totalValue: number;
  currency: string;
  status: 'draft' | 'sent' | 'approved' | 'disputed';
  createdAt: Date;
}

export interface SettlementCalculation {
  element: string;
  quantity: number;
  price: number;
  value: number;
  deductions?: number;
  penalties?: number;
  netValue: number;
}

export interface DashboardMetrics {
  totalContracts: number;
  activeContracts: number;
  totalInventory: number;
  inventoryValue: number;
  pendingShipments: number;
  overdueSettlements: number;
}
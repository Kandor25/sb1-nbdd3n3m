import type { 
  Counterparty, 
  Contract, 
  InventoryLot, 
  Shipment, 
  Settlement,
  DashboardMetrics,
  Commodity
} from '../types';

export const mockCounterparties: Counterparty[] = [
  {
    id: '1',
    name: 'Copper Mining Corp',
    taxId: '12345678-9',
    type: 'supplier',
    contacts: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@coppermining.com',
        phone: '+1-555-0123',
        position: 'Sales Manager',
        isPrimary: true
      }
    ],
    addresses: [
      {
        id: '1',
        type: 'billing',
        street: '123 Mining Ave',
        city: 'Phoenix',
        state: 'AZ',
        country: 'USA',
        postalCode: '85001',
        isPrimary: true
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '2',
    name: 'Global Smelters Ltd',
    taxId: '98765432-1',
    type: 'client',
    contacts: [
      {
        id: '2',
        name: 'Maria Garcia',
        email: 'maria@globalsmelters.com',
        phone: '+1-555-0456',
        position: 'Procurement Director',
        isPrimary: true
      }
    ],
    addresses: [
      {
        id: '2',
        type: 'shipping',
        street: '456 Industrial Blvd',
        city: 'Houston',
        state: 'TX',
        country: 'USA',
        postalCode: '77001',
        isPrimary: true
      }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-12-10')
  },
  {
    id: '3',
    name: 'Pacific Transport Co',
    taxId: '55566677-8',
    type: 'transporter',
    contacts: [
      {
        id: '3',
        name: 'Robert Chen',
        email: 'robert@pacifictrans.com',
        phone: '+1-555-0789',
        position: 'Operations Manager',
        isPrimary: true
      }
    ],
    addresses: [
      {
        id: '3',
        type: 'billing',
        street: '789 Port St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90001',
        isPrimary: true
      }
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-12-01')
  }
];

export const mockCommodities: Commodity[] = [
  {
    id: '1',
    name: 'Concentrado de Cobre',
    type: 'concentrate',
    grade: 'Premium',
    description: 'Concentrado de cobre de alta ley con bajas impurezas'
  },
  {
    id: '2',
    name: 'Concentrado de Oro',
    type: 'concentrate',
    grade: 'Estándar',
    description: 'Concentrado de oro de operaciones de lixiviación en pilas'
  },
  {
    id: '3',
    name: 'Plata Refinada',
    type: 'refined',
    grade: '999.9',
    description: 'Barras de plata refinada pura'
  }
];

export const mockContracts: Contract[] = [
  {
    id: '1',
    number: 'PUR-2024-001',
    type: 'purchase',
    counterpartyId: '1',
    commodity: mockCommodities[0],
    quantity: 5000,
    tolerance: 10,
    qualitySpecs: [
      { element: 'Cu', type: 'payable', expectedValue: 28.5, minValue: 25, maxValue: 35, unit: '%' },
      { element: 'As', type: 'penalty', expectedValue: 0.5, maxValue: 1.0, unit: '%' },
      { element: 'Au', type: 'payable', expectedValue: 2.5, minValue: 1.0, unit: 'g/t' }
    ],
    pricing: {
      type: 'formula',
      formula: 'LME Cu M+1 - 150',
      currency: 'USD'
    },
    deliveryPeriod: {
      start: new Date('2024-12-01'),
      end: new Date('2024-12-31')
    },
    incoterms: 'CIF Houston',
    status: 'active',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: '2',
    number: 'SAL-2024-002',
    type: 'sale',
    counterpartyId: '2',
    commodity: mockCommodities[0],
    quantity: 3000,
    tolerance: 5,
    qualitySpecs: [
      { element: 'Cu', type: 'payable', expectedValue: 29.0, minValue: 27, unit: '%' },
      { element: 'Au', type: 'payable', expectedValue: 3.2, minValue: 2.0, unit: 'g/t' }
    ],
    pricing: {
      type: 'formula',
      formula: 'LME Cu M+2 - 100',
      currency: 'USD'
    },
    deliveryPeriod: {
      start: new Date('2025-01-15'),
      end: new Date('2025-02-15')
    },
    incoterms: 'FOB Origin',
    status: 'active',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-20')
  }
];

export const mockInventoryLots: InventoryLot[] = [
  {
    id: '1',
    lotNumber: 'LOT-2024-001',
    contractId: '1',
    commodity: mockCommodities[0],
    weights: {
      wet: 102.5,
      dry: 100.0,
      moisture: 2.5
    },
    assays: [
      {
        id: '1',
        laboratory: 'SGS Labs',
        dateReceived: new Date('2024-12-10'),
        dateCompleted: new Date('2024-12-12'),
        results: [
          { element: 'Cu', value: 28.8, unit: '%', method: 'AAS' },
          { element: 'Au', value: 2.8, unit: 'g/t', method: 'FA-AAS' },
          { element: 'As', value: 0.4, unit: '%', method: 'ICP-OES' }
        ],
        status: 'completed'
      }
    ],
    location: {
      warehouse: 'Houston Terminal',
      position: 'Bay A-12',
      status: 'in_warehouse'
    },
    receivedDate: new Date('2024-12-08'),
    quality: [
      { element: 'Cu', value: 28.8, unit: '%', grade: 'payable' },
      { element: 'Au', value: 2.8, unit: 'g/t', grade: 'payable' },
      { element: 'As', value: 0.4, unit: '%', grade: 'penalty' }
    ],
    documents: []
  },
  {
    id: '2',
    lotNumber: 'LOT-2024-002',
    contractId: '1',
    commodity: mockCommodities[0],
    weights: {
      wet: 98.2,
      dry: 95.8,
      moisture: 2.4
    },
    assays: [
      {
        id: '2',
        laboratory: 'ALS Labs',
        dateReceived: new Date('2024-12-15'),
        results: [
          { element: 'Cu', value: 27.9, unit: '%', method: 'AAS' },
          { element: 'Au', value: 2.4, unit: 'g/t', method: 'FA-AAS' }
        ],
        status: 'pending'
      }
    ],
    location: {
      warehouse: 'Houston Terminal',
      position: 'Bay B-05',
      status: 'in_warehouse'
    },
    receivedDate: new Date('2024-12-14'),
    quality: [],
    documents: []
  }
];

export const mockShipments: Shipment[] = [
  {
    id: '1',
    number: 'SHIP-2024-001',
    contractId: '2',
    lots: ['1'],
    type: 'outbound',
    transportMode: 'truck',
    carrier: 'Pacific Transport Co',
    origin: {
      id: '1',
      type: 'warehouse',
      street: 'Houston Terminal',
      city: 'Houston',
      state: 'TX',
      country: 'USA',
      postalCode: '77001',
      isPrimary: true
    },
    destination: {
      id: '2',
      type: 'warehouse',
      street: '456 Industrial Blvd',
      city: 'Houston',
      state: 'TX',
      country: 'USA',
      postalCode: '77001',
      isPrimary: true
    },
    status: 'planned',
    scheduledDate: new Date('2025-01-20'),
    documents: []
  }
];

export const mockSettlements: Settlement[] = [
  {
    id: '1',
    contractId: '1',
    shipmentId: '1',
    type: 'provisional',
    calculations: [
      {
        element: 'Cu',
        quantity: 28.8,
        price: 8500,
        value: 244800,
        deductions: 12240,
        penalties: 0,
        netValue: 232560
      },
      {
        element: 'Au',
        quantity: 2.8,
        price: 2000,
        value: 5600,
        deductions: 280,
        penalties: 0,
        netValue: 5320
      }
    ],
    totalValue: 237880,
    currency: 'USD',
    status: 'draft',
    createdAt: new Date('2024-12-15')
  }
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalContracts: 24,
  activeContracts: 8,
  totalInventory: 2850.5,
  inventoryValue: 12458000,
  pendingShipments: 5,
  overdueSettlements: 2
};
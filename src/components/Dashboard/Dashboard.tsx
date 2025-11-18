import React, { useState } from 'react';
import { FileText, Package, Truck, DollarSign, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Scale, FlaskConical, MapPin, TruckIcon, Calendar, ListChecks } from 'lucide-react';
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

interface LogisticsOperation {
  id: string;
  opNumber: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  location: string;
  eta: string;
  operator: string;
  plate: string;
}

interface WeightReport {
  id: string;
  shipmentNumber: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  laboratory: string;
  etaScheduled: string;
  delayed: boolean;
}

interface AssayReport {
  id: string;
  shipmentNumber: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  laboratory: string;
  etaScheduled: string;
  comments: string;
  delayed: boolean;
}

interface OverduePayment {
  id: string;
  type: string;
  shipmentNumber: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  etaScheduled: string;
  amount: number;
}

interface OverdueCollection {
  id: string;
  type: string;
  shipmentNumber: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  scheduled: string;
  amount: number;
}

interface UpcomingFixing {
  id: string;
  shipmentNumber: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  periodType: 'next5days' | 'monthlyAverage';
  etaScheduled: string;
  terms: {
    metals: string;
    period: string;
    quantities: string;
    grades: string;
  };
}

interface GTCOrder {
  id: string;
  shipmentNumber: string;
  quantity: number;
  commodity: string;
  client: string;
  contract: string;
  quota: string;
  actions: Array<{
    metal: string;
    action: string;
    quantity: string;
    price: string;
    period: string;
    expiration: string;
    exchange: string;
    reference: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    contratos: false,
    logistica: false,
    ensayos: false,
    pagos: false,
    fijaciones: false
  });

  const [expandedLogistics, setExpandedLogistics] = useState<{ [key: string]: boolean }>({
    patio: false,
    transito: false
  });

  const [expandedAssays, setExpandedAssays] = useState<{ [key: string]: boolean }>({
    weights: false,
    assays: false,
    scheduledWeights: false,
    scheduledAssays: false
  });

  const [expandedPayments, setExpandedPayments] = useState<{ [key: string]: boolean }>({
    payments: false,
    collections: false,
    scheduledPayments: false,
    scheduledCollections: false
  });

  const [expandedFixings, setExpandedFixings] = useState<{ [key: string]: boolean }>({
    upcoming: false,
    gtc: false,
    next5days: false,
    monthlyAverage: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleLogistics = (section: string) => {
    setExpandedLogistics(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAssays = (section: string) => {
    setExpandedAssays(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const togglePayments = (section: string) => {
    setExpandedPayments(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFixings = (section: string) => {
    setExpandedFixings(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isEtaOverdue = (eta: string): boolean => {
    const match = eta.match(/(\d+)([A-Za-z]{3})(\d+)/);
    if (!match) {
      return false;
    }
    const [, day, month, year] = match;
    const monthMap: {[key: string]: number} = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
      return false;
    }
    const etaDate = new Date(parseInt(year), monthIndex, parseInt(day));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    etaDate.setHours(0, 0, 0, 0);
    return etaDate < now;
  };

  const getDaysOverdue = (eta: string): number => {
    const match = eta.match(/(\d+)([A-Za-z]{3})(\d+)/);
    if (!match) {
      return 0;
    }
    const [, day, month, year] = match;
    const monthMap: {[key: string]: number} = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
      return 0;
    }
    const etaDate = new Date(parseInt(year), monthIndex, parseInt(day));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    etaDate.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - etaDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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

  // Mock data for logistics operations
  const patioOperations: LogisticsOperation[] = [
    {
      id: '5',
      opNumber: '10102020',
      quantity: 20,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      location: 'Patio D',
      eta: '5Nov2025@10:00hrs',
      operator: 'Pedro Gomez',
      plate: 'WXYZ-123'
    },
    {
      id: '1',
      opNumber: '10102025',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      location: 'Patio A',
      eta: '20Dec2025@16:00hrs',
      operator: 'Jaime Camil',
      plate: 'ABCD-234'
    },
    {
      id: '2',
      opNumber: '10102027',
      quantity: 30,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25P',
      location: 'Patio B',
      eta: '25Dec2025@16:00hrs',
      operator: 'Jaime Camil',
      plate: 'ABCD-234'
    },
    {
      id: '3',
      opNumber: '10102028',
      quantity: 28,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Nov.25',
      location: 'Patio C',
      eta: '5Jan2026@14:00hrs',
      operator: 'Carlos Ruiz',
      plate: 'EFGH-567'
    },
    {
      id: '4',
      opNumber: '10102029',
      quantity: 35,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Nov.25',
      location: 'Patio A',
      eta: '18Jan2026@10:00hrs',
      operator: 'Luis Martinez',
      plate: 'IJKL-890'
    }
  ].sort((a, b) => {
    const parseDate = (eta: string) => {
      const match = eta.match(/(\d+)(\w+)(\d+)@(\d+):(\d+)hrs/);
      if (!match) return new Date();
      const [, day, month, year, hour, minute] = match;
      const monthMap: {[key: string]: number} = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
      return new Date(parseInt(year), monthMap[month] || 0, parseInt(day), parseInt(hour), parseInt(minute));
    };
    return parseDate(a.eta).getTime() - parseDate(b.eta).getTime();
  });

  const transitOperations: LogisticsOperation[] = [
    {
      id: '9',
      opNumber: '10102015',
      quantity: 18,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Sep.25',
      location: 'En ruta',
      eta: '3Nov2025@14:00hrs',
      operator: 'Miguel Lopez',
      plate: 'QRST-789'
    },
    {
      id: '10',
      opNumber: '10102018',
      quantity: 21,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Sep.25',
      location: 'En ruta',
      eta: '10Nov2025@09:00hrs',
      operator: 'Antonio Ramirez',
      plate: 'UVWX-012'
    },
    {
      id: '7',
      opNumber: '10102024',
      quantity: 23,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      location: 'En ruta',
      eta: '18Dec2025@19:00hrs',
      operator: 'Alberto Camil',
      plate: 'ABCD-231'
    },
    {
      id: '5',
      opNumber: '10102022',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      location: 'En ruta',
      eta: '22Dec2025@20:00hrs',
      operator: 'Jose Camil',
      plate: 'ABCD-233'
    },
    {
      id: '6',
      opNumber: '10102023',
      quantity: 22,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      location: 'En ruta',
      eta: '28Dec2025@21:00hrs',
      operator: 'Fernando Camil',
      plate: 'ABCD-232'
    },
    {
      id: '8',
      opNumber: '10102026',
      quantity: 27,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Oct.25',
      location: 'En ruta',
      eta: '12Jan2026@08:00hrs',
      operator: 'Roberto Silva',
      plate: 'MNOP-456'
    }
  ].sort((a, b) => {
    const parseDate = (eta: string) => {
      const match = eta.match(/(\d+)(\w+)(\d+)@(\d+):(\d+)hrs/);
      if (!match) return new Date();
      const [, day, month, year, hour, minute] = match;
      const monthMap: {[key: string]: number} = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
      return new Date(parseInt(year), monthMap[month] || 0, parseInt(day), parseInt(hour), parseInt(minute));
    };
    return parseDate(a.eta).getTime() - parseDate(b.eta).getTime();
  });

  const unreportedWeights: WeightReport[] = [
    {
      id: '1',
      shipmentNumber: '10102018',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Sep.25',
      laboratory: 'SGS',
      etaScheduled: '7Oct2025',
      delayed: true
    },
    {
      id: '2',
      shipmentNumber: '10102019',
      quantity: 30,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Sep.25',
      laboratory: 'AD Lab',
      etaScheduled: '5Oct2025',
      delayed: true
    },
    {
      id: '3',
      shipmentNumber: '10102020',
      quantity: 28,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Oct.25',
      laboratory: 'SLab Peru',
      etaScheduled: '12Oct2025',
      delayed: false
    },
    {
      id: '4',
      shipmentNumber: '10102021',
      quantity: 32,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      laboratory: 'SGS',
      etaScheduled: '14Oct2025',
      delayed: false
    }
  ];

  const unreportedAssays: AssayReport[] = [
    {
      id: '1',
      shipmentNumber: '10102018',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Sep.25',
      laboratory: 'SGS',
      etaScheduled: '7Oct2025',
      comments: '*ver detalles x elemento',
      delayed: true
    },
    {
      id: '2',
      shipmentNumber: '10102019',
      quantity: 30,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Sep.25',
      laboratory: 'ALS',
      etaScheduled: '8Oct2025',
      comments: '*ver detalles x elemento',
      delayed: true
    },
    {
      id: '3',
      shipmentNumber: '10102020',
      quantity: 28,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Oct.25',
      laboratory: 'SGS',
      etaScheduled: '15Oct2025',
      comments: '*ver detalles x elemento',
      delayed: false
    },
    {
      id: '4',
      shipmentNumber: '10102015',
      quantity: 22,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Sep.25',
      laboratory: 'Intertek',
      etaScheduled: '10Oct2025',
      comments: '*ver detalles x elemento',
      delayed: false
    }
  ];

  const scheduledWeights: WeightReport[] = [
    {
      id: '1',
      shipmentNumber: '10102018',
      quantity: 20,
      commodity: 'Concentrado Cu',
      client: 'Trader C',
      contract: 'Contrato 100',
      quota: 'Nov.25',
      laboratory: 'SGS',
      etaScheduled: '19Nov2025',
      delayed: false
    },
    {
      id: '2',
      shipmentNumber: '10102019',
      quantity: 18,
      commodity: 'Concentrado Ag',
      client: 'Trader B',
      contract: 'Contrato 174',
      quota: 'Nov.25',
      laboratory: 'AD Lab',
      etaScheduled: '20Nov2025',
      delayed: false
    }
  ];

  const scheduledAssays: AssayReport[] = [
    {
      id: '1',
      shipmentNumber: '10192018',
      quantity: 36,
      commodity: 'Concentrado Ag',
      client: 'Trader B',
      contract: 'Contrato 174',
      quota: 'Sep.25',
      laboratory: 'SGS',
      etaScheduled: '18Nov2025',
      comments: '',
      delayed: false
    },
    {
      id: '2',
      shipmentNumber: '10192019',
      quantity: 28,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Nov.25',
      laboratory: 'AD Lab',
      etaScheduled: '19Nov2025',
      comments: '',
      delayed: false
    },
    {
      id: '3',
      shipmentNumber: '10192020',
      quantity: 32,
      commodity: 'Concentrado Zn',
      client: 'Trader C',
      contract: 'Contrato 100',
      quota: 'Nov.25',
      laboratory: 'SLab Peru',
      etaScheduled: '20Nov2025',
      comments: '',
      delayed: false
    }
  ];

  const overduePayments: OverduePayment[] = [
    {
      id: '1',
      type: 'Ensayes laboratorios SGS Peru Jul.25',
      shipmentNumber: '10102015',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Jul.25',
      etaScheduled: '3Oct2025',
      amount: 15000
    },
    {
      id: '2',
      type: 'Ensayes laboratorios ALS Mexico Aug.25',
      shipmentNumber: '10102018',
      quantity: 30,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Aug.25',
      etaScheduled: '5Oct2025',
      amount: 22000
    },
    {
      id: '3',
      type: 'Transporte terrestre Sep.25',
      shipmentNumber: '10102020',
      quantity: 28,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Sep.25',
      etaScheduled: '8Oct2025',
      amount: 18500
    },
    {
      id: '4',
      type: 'Ensayes laboratorios Intertek Chile Sep.25',
      shipmentNumber: '10102022',
      quantity: 22,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Sep.25',
      etaScheduled: '10Oct2025',
      amount: 12500
    }
  ];

  const scheduledPayments: OverduePayment[] = [
    {
      id: '1',
      type: 'Ensayes laboratorios SGS Peru Jul.25',
      shipmentNumber: '10102017',
      quantity: 424,
      commodity: 'Concentrado Cu',
      client: 'Trader BA',
      contract: 'Contrato 10',
      quota: 'Jun.25',
      etaScheduled: '18Nov2025',
      amount: 45000
    },
    {
      id: '2',
      type: 'Transporte maritimo Sep.25',
      shipmentNumber: '10102021',
      quantity: 38,
      commodity: 'Concentrado Zn',
      client: 'Trader C',
      contract: 'Contrato 15',
      quota: 'Sep.25',
      etaScheduled: '19Nov2025',
      amount: 28000
    },
    {
      id: '3',
      type: 'Ensayes laboratorios AD Lab Chile Oct.25',
      shipmentNumber: '10102022',
      quantity: 52,
      commodity: 'Concentrado Cu',
      client: 'IMX',
      contract: 'Contrato 20',
      quota: 'Oct.25',
      etaScheduled: '20Nov2025',
      amount: 32000
    }
  ];

  const overdueCollections: OverdueCollection[] = [
    {
      id: '1',
      type: 'Pago provisional',
      shipmentNumber: '10102015',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Jul.25',
      scheduled: '7Oct2025',
      amount: 125000
    },
    {
      id: '2',
      type: 'Pago provisional',
      shipmentNumber: '17112015',
      quantity: 70,
      commodity: 'Concentrado Cu',
      client: 'Peñasquito',
      contract: 'Contrato 10',
      quota: 'Oct.25',
      scheduled: '10Jan2029',
      amount: 350000
    },
    {
      id: '3',
      type: 'Pago final',
      shipmentNumber: '10102018',
      quantity: 30,
      commodity: 'Concentrado Zn',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Aug.25',
      scheduled: '12Oct2025',
      amount: 180000
    },
    {
      id: '4',
      type: 'Pago provisional',
      shipmentNumber: '10102020',
      quantity: 28,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Sep.25',
      scheduled: '15Oct2025',
      amount: 145000
    }
  ];

  const scheduledCollections: OverdueCollection[] = [
    {
      id: '1',
      type: 'Pago final',
      shipmentNumber: '10102020',
      quantity: 45,
      commodity: 'Concentrado Cu',
      client: 'IMX',
      contract: 'Contrato 10',
      quota: 'Aug.25',
      scheduled: '17Nov2025',
      amount: 225000
    }
  ];

  const upcomingFixings: UpcomingFixing[] = [
    {
      id: '1',
      shipmentNumber: '10102015',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      periodType: 'next5days',
      etaScheduled: '8Oct2025',
      terms: {
        metals: 'CU/AU/AG ==> Oficial 15Dec.25',
        period: 'Oficial 15Dec.25',
        quantities: '4fmt Cu / 1000oz Ag / 45oz Au',
        grades: 'Leyes Cu SGS Final / Ag SGS Final / Au SGS Final'
      }
    },
    {
      id: '2',
      shipmentNumber: '10102016',
      quantity: 30,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Nov.25',
      periodType: 'next5days',
      etaScheduled: '10Oct2025',
      terms: {
        metals: 'CU/AU/AG ==> Oficial 18Dec.25',
        period: 'Oficial 18Dec.25',
        quantities: '5fmt Cu / 1200oz Ag / 50oz Au',
        grades: 'Leyes Cu SGS Provisional / Ag SGS Final / Au SGS Final'
      }
    },
    {
      id: '3',
      shipmentNumber: '10102017',
      quantity: 28,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Nov.25',
      periodType: 'next5days',
      etaScheduled: '20Nov2025',
      terms: {
        metals: 'CU/AU/AG ==> Oficial 20Dec.25',
        period: 'Oficial 20Dec.25',
        quantities: '4.5fmt Cu / 1100oz Ag / 48oz Au',
        grades: 'Leyes Cu SGS Provisional / Ag SGS Provisional / Au SGS Final'
      }
    },
    {
      id: '4',
      shipmentNumber: '10102018',
      quantity: 32,
      commodity: 'Concentrado Cu',
      client: 'Trader B',
      contract: 'Contrato 12',
      quota: 'Nov.25',
      periodType: 'next5days',
      etaScheduled: '22Nov2025',
      terms: {
        metals: 'CU/AU/AG ==> Oficial 22Dec.25',
        period: 'Oficial 22Dec.25',
        quantities: '5.2fmt Cu / 1300oz Ag / 52oz Au',
        grades: 'Leyes Cu SGS Final / Ag SGS Final / Au SGS Provisional'
      }
    },
    {
      id: '5',
      shipmentNumber: '10102019',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Nov.25',
      periodType: 'monthlyAverage',
      etaScheduled: '25Nov2025',
      terms: {
        metals: 'CU/AU/AG ==> Promedio Mes Dec.25',
        period: 'Promedio Mes Dec.25',
        quantities: '4fmt Cu / 1000oz Ag / 45oz Au',
        grades: 'Leyes Cu SGS Provisional / Ag SGS Final / Au SGS Final'
      }
    },
    {
      id: '6',
      shipmentNumber: '10102020',
      quantity: 35,
      commodity: 'Concentrado Zn',
      client: 'IMX',
      contract: 'Contrato 20',
      quota: 'Dec.25',
      periodType: 'monthlyAverage',
      etaScheduled: '28Nov2025',
      terms: {
        metals: 'CU/AU/AG ==> Promedio Mes Dec.25',
        period: 'Promedio Mes Dec.25',
        quantities: '6fmt Cu / 1400oz Ag / 55oz Au',
        grades: 'Leyes Cu SGS Final / Ag SGS Provisional / Au SGS Final'
      }
    }
  ];

  const gtcOrders: GTCOrder[] = [
    {
      id: '1',
      shipmentNumber: '101019997',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Sep.25',
      actions: [
        {
          metal: 'Cu',
          action: 'Vender',
          quantity: '11fmt',
          price: '10,350',
          period: 'Promedio Nov.25',
          expiration: '31Oct2025',
          exchange: 'LME Select',
          reference: '1234'
        },
        {
          metal: 'Ag',
          action: 'Vender',
          quantity: '1,000oz',
          price: '55',
          period: 'Promedio Nov.25',
          expiration: '31Oct2025',
          exchange: 'LME Select',
          reference: '1235'
        },
        {
          metal: 'Au',
          action: 'Vender',
          quantity: '55oz',
          price: '4,100',
          period: 'Promedio Nov.25',
          expiration: '31Oct2025',
          exchange: 'LME Select',
          reference: '1237'
        }
      ]
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
              <span className="ml-3 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {patioOperations.length} En Patio
              </span>
              <span className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {transitOperations.length} En Tránsito
              </span>
            </div>
            {expandedSections.logistica ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.logistica && (
            <div className="px-6 pb-5 space-y-3">
              {/* En Patio de Salidas */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleLogistics('patio')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-bold text-gray-900">En Patio de Salidas</span>
                    <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {patioOperations.length}
                    </span>
                  </div>
                  {expandedLogistics.patio ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedLogistics.patio && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {patioOperations.map((op) => {
                        const daysOverdue = getDaysOverdue(op.eta.split('@')[0]);
                        const isOverdue = daysOverdue > 0;
                        return (
                          <div key={op.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p>
                                #Nro Op: {op.opNumber} / <span className="font-semibold">{op.quantity}dmt</span> / {op.commodity} / Cliente {op.client} / {op.contract} / Cuota {op.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                <span className="font-semibold">Ubicación:</span> {op.location} / ETA Programada ==&gt; {op.eta}{isOverdue && ` ==&gt; ${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <span className="font-semibold">Operador:</span> {op.operator} / <span className="font-semibold">Placas:</span> {op.plate}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* En Tránsito */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleLogistics('transito')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <TruckIcon className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-bold text-gray-900">En Tránsito</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {transitOperations.length}
                    </span>
                  </div>
                  {expandedLogistics.transito ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedLogistics.transito && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transitOperations.map((op) => {
                        const daysOverdue = getDaysOverdue(op.eta.split('@')[0]);
                        const isOverdue = daysOverdue > 0;
                        return (
                          <div key={op.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p>
                                #Nro Op: {op.opNumber} / <span className="font-semibold">{op.quantity}dmt</span> / {op.commodity} / Cliente {op.client} / {op.contract} / Cuota {op.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                <span className="font-semibold">Ubicación:</span> {op.location} / ETA Programada ==&gt; {op.eta}{isOverdue && ` ==&gt; ${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <span className="font-semibold">Operador:</span> {op.operator} / <span className="font-semibold">Placas:</span> {op.plate}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
              <span className="ml-3 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {unreportedWeights.length} Pesos No Reportados
              </span>
              <span className="ml-2 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {unreportedAssays.length} Ensayes No Reportados
              </span>
              <span className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {scheduledWeights.length} Pesos Programados
              </span>
              <span className="ml-2 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {scheduledAssays.length} Ensayes Programados
              </span>
            </div>
            {expandedSections.ensayos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.ensayos && (
            <div className="px-6 pb-5 space-y-3">
              {/* Pesos no reportados */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('weights')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Scale className="w-4 h-4 text-red-500 mr-2" />
                    <span className="font-bold text-gray-900">Pesos no Reportados</span>
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {unreportedWeights.length}
                    </span>
                  </div>
                  {expandedAssays.weights ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedAssays.weights && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {[...unreportedWeights].sort((a, b) => {
                        const aOverdue = isEtaOverdue(a.etaScheduled);
                        const bOverdue = isEtaOverdue(b.etaScheduled);
                        if (aOverdue && !bOverdue) return -1;
                        if (!aOverdue && bOverdue) return 1;
                        return 0;
                      }).map((weight) => {
                        const daysOverdue = getDaysOverdue(weight.etaScheduled);
                        const isOverdue = daysOverdue > 0;
                        return (
                          <div key={weight.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p>
                                Embarque {weight.shipmentNumber} / <span className="font-semibold">{weight.quantity}dmt</span> / {weight.commodity} / Cliente {weight.client} / {weight.contract} / Cuota {weight.quota} / {weight.laboratory}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                ETA Programada ==&gt; {weight.etaScheduled}{isOverdue && ` ==&gt; ${daysOverdue}d ATRASADO`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Ensayes no reportados */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('assays')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <FlaskConical className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="font-bold text-gray-900">Ensayes no Reportados</span>
                    <span className="ml-2 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {unreportedAssays.length}
                    </span>
                  </div>
                  {expandedAssays.assays ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedAssays.assays && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {[...unreportedAssays].sort((a, b) => {
                        const aOverdue = isEtaOverdue(a.etaScheduled);
                        const bOverdue = isEtaOverdue(b.etaScheduled);
                        if (aOverdue && !bOverdue) return -1;
                        if (!aOverdue && bOverdue) return 1;
                        return 0;
                      }).map((assay) => {
                        const daysOverdue = getDaysOverdue(assay.etaScheduled);
                        const isOverdue = daysOverdue > 0;
                        return (
                          <div key={assay.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p>
                                Embarque {assay.shipmentNumber} / <span className="font-semibold">{assay.quantity}dmt</span> / {assay.commodity} / Cliente {assay.client} / {assay.contract} / Cuota {assay.quota} / {assay.laboratory}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                ETA Programada ==&gt; {assay.etaScheduled}{isOverdue && ` ==&gt; ${daysOverdue}d ATRASADO`}
                              </p>
                              {assay.comments && (
                                <p className="text-gray-600 text-xs">
                                  <span className="font-semibold">Comentarios:</span> {assay.comments}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Pesos Programados */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('scheduledWeights')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Scale className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-bold text-gray-900">Pesos Programados (Siguiente 5 dias)</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {scheduledWeights.length}
                    </span>
                  </div>
                  {expandedAssays.scheduledWeights ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedAssays.scheduledWeights && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scheduledWeights.map((weight) => (
                        <div key={weight.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p>
                              Embarque {weight.shipmentNumber} / <span className="font-semibold">{weight.quantity}dmt</span> / {weight.commodity} / Cliente {weight.client} / {weight.contract} / Cuota {weight.quota}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">ETA Programada ==&gt;</span> {weight.etaScheduled}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ensayes Programados */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('scheduledAssays')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <FlaskConical className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-bold text-gray-900">Ensayes Programados (Siguiente 5 dias)</span>
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {scheduledAssays.length}
                    </span>
                  </div>
                  {expandedAssays.scheduledAssays ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedAssays.scheduledAssays && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scheduledAssays.map((assay) => (
                        <div key={assay.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p>
                              Embarque {assay.shipmentNumber} / <span className="font-semibold">{assay.quantity}dmt</span> / {assay.commodity} / Cliente {assay.client} / {assay.contract} / Cuota {assay.quota} / {assay.laboratory}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">ETA Programada ==&gt;</span> {assay.etaScheduled}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <span className="ml-3 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {overduePayments.length} Pagos Vencidos
              </span>
              <span className="ml-2 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {overdueCollections.length} Cobros Vencidos
              </span>
              <span className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {scheduledPayments.length} Pagos Programados
              </span>
              <span className="ml-2 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {scheduledCollections.length} Cobros Programados
              </span>
            </div>
            {expandedSections.pagos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.pagos && (
            <div className="px-6 pb-5 space-y-3">
              {/* Pagos vencidos */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('payments')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="font-bold text-gray-900">Pagos Vencidos - ${overduePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {overduePayments.length}
                    </span>
                  </div>
                  {expandedPayments.payments ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedPayments.payments && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {[...overduePayments].sort((a, b) => {
                        const aOverdue = isEtaOverdue(a.etaScheduled);
                        const bOverdue = isEtaOverdue(b.etaScheduled);
                        if (aOverdue && !bOverdue) return -1;
                        if (!aOverdue && bOverdue) return 1;
                        return 0;
                      }).map((payment) => {
                        const daysOverdue = getDaysOverdue(payment.etaScheduled);
                        const isOverdue = isEtaOverdue(payment.etaScheduled);
                        return (
                          <div key={payment.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p className="text-gray-900">
                                <span className="font-semibold">Tipo:</span> {payment.type}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-semibold">==&gt;</span> Embarque {payment.shipmentNumber} / <span className="font-semibold">{payment.quantity}dmt</span> / {payment.commodity} / Cliente {payment.client} / {payment.contract} / Cuota {payment.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold text-xs" : "text-gray-600 text-xs"}>
                                ETA Programada ==&gt; {payment.etaScheduled}{daysOverdue > 0 && ` ==&gt; ${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-900 text-sm font-semibold">
                                Monto: ${payment.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Cobros vencidos */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('collections')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="font-bold text-gray-900">Cobros Vencidos - ${overdueCollections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
                    <span className="ml-2 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {overdueCollections.length}
                    </span>
                  </div>
                  {expandedPayments.collections ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedPayments.collections && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {[...overdueCollections].sort((a, b) => {
                        const aOverdue = isEtaOverdue(a.scheduled);
                        const bOverdue = isEtaOverdue(b.scheduled);
                        if (aOverdue && !bOverdue) return -1;
                        if (!aOverdue && bOverdue) return 1;
                        return 0;
                      }).map((collection) => {
                        const daysOverdue = getDaysOverdue(collection.scheduled);
                        const isOverdue = isEtaOverdue(collection.scheduled);
                        return (
                          <div key={collection.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p className="text-gray-900">
                                <span className="font-semibold">Tipo:</span> {collection.type}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-semibold">==&gt;</span> Embarque {collection.shipmentNumber} / <span className="font-semibold">{collection.quantity}dmt</span> / {collection.commodity} / Cliente {collection.client} / {collection.contract} / Cuota {collection.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold text-xs" : "text-gray-600 text-xs"}>
                                ETA Programada ==&gt; {collection.scheduled}{daysOverdue > 0 && ` ==&gt; ${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-900 text-sm font-semibold">
                                Monto: ${collection.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagos Programados */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('scheduledPayments')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-bold text-gray-900">Pagos Programados (Siguiente 5 dias)</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {scheduledPayments.length}
                    </span>
                  </div>
                  {expandedPayments.scheduledPayments ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedPayments.scheduledPayments && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scheduledPayments.map((payment) => (
                        <div key={payment.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-900">
                              <span className="font-semibold">Tipo:</span> {payment.type}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">==&gt;</span> Embarque {payment.shipmentNumber} / <span className="font-semibold">{payment.quantity}dmt</span> / {payment.commodity} / Cliente {payment.client} / {payment.contract} / Cuota {payment.quota}
                            </p>
                            <p className="text-gray-600 text-xs">
                              <span className="font-semibold">ETA Programada ==&gt;</span> {payment.etaScheduled}
                            </p>
                            <p className="text-gray-900 text-sm font-semibold">
                              Monto: ${payment.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cobros Programados */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('scheduledCollections')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-bold text-gray-900">Cobros Programados (Siguiente 5 dias)</span>
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {scheduledCollections.length}
                    </span>
                  </div>
                  {expandedPayments.scheduledCollections ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedPayments.scheduledCollections && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scheduledCollections.map((collection) => (
                        <div key={collection.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-900">
                              <span className="font-semibold">Tipo:</span> {collection.type}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">==&gt;</span> Embarque {collection.shipmentNumber} / <span className="font-semibold">{collection.quantity}dmt</span> / {collection.commodity} / Cliente {collection.client} / {collection.contract} / Cuota {collection.quota}
                            </p>
                            <p className="text-gray-600 text-xs">
                              <span className="font-semibold">Programada ==&gt;</span> {collection.scheduled}
                            </p>
                            <p className="text-gray-900 text-sm font-semibold">
                              Monto: ${collection.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <span className="ml-3 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {upcomingFixings.length} Próximas Fijaciones
              </span>
              <span className="ml-2 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {gtcOrders.length} GTC Abiertas
              </span>
            </div>
            {expandedSections.fijaciones ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.fijaciones && (
            <div className="px-6 pb-5 space-y-3">
              {/* Próximas fijaciones */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleFixings('upcoming')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-bold text-gray-900">Próximas Fijaciones</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {upcomingFixings.length}
                    </span>
                  </div>
                  {expandedFixings.upcoming ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedFixings.upcoming && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Periodo contractual siguiente 5d */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => toggleFixings('next5days')}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 text-sm">Periodo contractual siguiente 5d</span>
                        {expandedFixings.next5days ? (
                          <ChevronUp className="w-3 h-3 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                      {expandedFixings.next5days && (
                        <div className="px-3 pb-3 space-y-2">
                          {upcomingFixings.filter(f => f.periodType === 'next5days').map((fixing) => {
                            const daysOverdue = getDaysOverdue(fixing.etaScheduled);
                            const isOverdue = isEtaOverdue(fixing.etaScheduled);
                            return (
                              <div key={fixing.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-sm space-y-1">
                                  <p className="text-gray-700">
                                    Embarque {fixing.shipmentNumber} / <span className="font-semibold">{fixing.quantity}dmt</span> / {fixing.commodity} / Cliente {fixing.client} / {fixing.contract} / Cuota {fixing.quota}
                                  </p>
                                  <div className="mt-2 space-y-1 text-xs bg-white p-2 rounded">
                                    <p className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                                      <span className="font-semibold">ETA Programada ==&gt;</span> {fixing.etaScheduled}
                                      {isOverdue && <span> ==&gt; {daysOverdue}d ATRASADO</span>}
                                    </p>
                                    <p className="text-gray-900">
                                      <span className="font-semibold">Términos:</span> ({fixing.terms.metals})
                                    </p>
                                    <p className="text-gray-700">
                                      {fixing.terms.quantities}
                                    </p>
                                    <p className="text-gray-600">
                                      {fixing.terms.grades}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Periodo contractual Promedio de mes */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => toggleFixings('monthlyAverage')}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 text-sm">Periodo contractual Promedio de mes</span>
                        {expandedFixings.monthlyAverage ? (
                          <ChevronUp className="w-3 h-3 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                      {expandedFixings.monthlyAverage && (
                        <div className="px-3 pb-3 space-y-2">
                          {upcomingFixings.filter(f => f.periodType === 'monthlyAverage').map((fixing) => {
                            const daysOverdue = getDaysOverdue(fixing.etaScheduled);
                            const isOverdue = isEtaOverdue(fixing.etaScheduled);
                            return (
                              <div key={fixing.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-sm space-y-1">
                                  <p className="text-gray-700">
                                    Embarque {fixing.shipmentNumber} / <span className="font-semibold">{fixing.quantity}dmt</span> / {fixing.commodity} / Cliente {fixing.client} / {fixing.contract} / Cuota {fixing.quota}
                                  </p>
                                  <div className="mt-2 space-y-1 text-xs bg-white p-2 rounded">
                                    <p className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                                      <span className="font-semibold">ETA Programada ==&gt;</span> {fixing.etaScheduled}
                                      {isOverdue && <span> ==&gt; {daysOverdue}d ATRASADO</span>}
                                    </p>
                                    <p className="text-gray-900">
                                      <span className="font-semibold">Términos:</span> ({fixing.terms.metals})
                                    </p>
                                    <p className="text-gray-700">
                                      {fixing.terms.quantities}
                                    </p>
                                    <p className="text-gray-600">
                                      {fixing.terms.grades}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* GTC abiertas */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleFixings('gtc')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <ListChecks className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-bold text-gray-900">GTC Abiertas</span>
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {gtcOrders.length}
                    </span>
                  </div>
                  {expandedFixings.gtc ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedFixings.gtc && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {gtcOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-2">
                            <p className="text-gray-700">
                              Embarque {order.shipmentNumber} / <span className="font-semibold">{order.quantity}dmt</span> / {order.commodity} / Cliente {order.client} / {order.contract} / Cuota {order.quota}
                            </p>
                            <div className="mt-2 space-y-2">
                              <p className="font-semibold text-gray-900 text-xs">Actions:</p>
                              {order.actions.map((action, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                  <p className="text-gray-900">
                                    <span className="font-semibold">{action.metal}</span> ==&gt; {action.action} {action.quantity}@{action.price} {action.period}
                                  </p>
                                  <p className="text-gray-600 mt-0.5">
                                    Exp {action.expiration} {action.exchange} / Referencia {action.reference}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
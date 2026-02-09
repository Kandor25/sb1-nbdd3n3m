import React, { useState, useEffect, useRef } from 'react';
import { FileText, Package, Truck, DollarSign, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Scale, FlaskConical, MapPin, TruckIcon, Calendar, ListChecks, Filter, X, User, XCircle } from 'lucide-react';
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
  responsible: string;
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
  responsible: string;
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
  responsible: string;
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
  responsible: string;
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
  counterparty: string;
  responsible: string;
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
  counterparty: string;
  responsible: string;
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
  responsible: string;
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
    gtcAnalysis: {
      gtcPrice: string;
      gtcPeriod: string;
      maxPrice: string;
      maxPeriod: string;
      spreads: string;
      maxQP: string;
      execution: string;
    };
  }>;
  responsible: string;
}

interface TechnicalIndicator {
  indicator: string;
  currentValue: string;
  signal: string;
  breakdownSignal: string;
  technicalSignal: string;
}

interface MetalAnalysis {
  metal: string;
  indicators: TechnicalIndicator[];
}

// Mock data para análisis técnico de metales
const mockTechnicalAnalysis: MetalAnalysis[] = [
  {
    metal: 'Plata',
    indicators: [
      {
        indicator: 'SMA 10 (Simple)',
        currentValue: 'SMA10 = $25.10 — precio por encima (25.50 > 25.10)',
        signal: 'Confirmación de momentum corto plazo; suele atraer compradores; puede empujar hacia SMA50 y resistencia.',
        breakdownSignal: 'Si cae por debajo de SMA10, pérdida de impulso corto; riesgo de caídas hacia SMA20.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 20',
        currentValue: 'SMA20 = $24.80 — precio por encima',
        signal: 'Ruptura sostenida por encima indica tendencia positiva de corto/medio plazo; soporte en 24.80.',
        breakdownSignal: 'Quiebre debajo debilita tendencia; posible test a 50 días.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 50',
        currentValue: 'SMA50 = $26.00 — precio por debajo (25.50 < 26.00)',
        signal: 'Si rompe y cierra por encima de SMA50, señal técnica de reversión a tendencia alcista de medio plazo.',
        breakdownSignal: 'Mantenerse debajo confirma resistencia de medio plazo; aumenta probabilidad de continuación bajista.',
        technicalSignal: 'Neutra / Ligeramente bajista'
      },
      {
        indicator: 'EMA 9 (exp)',
        currentValue: 'EMA9 = $25.30 — precio por encima',
        signal: 'Ruptura arriba refuerza impulso intradiario/very short; traders intradia suelen entrar largo.',
        breakdownSignal: 'Caída debajo de EMA9 suele acelerar salidas cortas y stops intradía.',
        technicalSignal: 'Alcista (corto plazo)'
      },
      {
        indicator: 'EMA 21',
        currentValue: 'EMA21 = $24.95 — precio por encima',
        signal: 'Mantener por encima de EMA21 confirma fuerza de corto; stop lógico por debajo.',
        breakdownSignal: 'Perder EMA21 daría primera señal de reversión de corto plazo.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'EMA 50',
        currentValue: 'EMA50 = $25.90 — precio por debajo',
        signal: 'Cierre sostenido por encima de EMA50 confirmaría cambio de EMAs.',
        breakdownSignal: 'Rechazo en EMA50 refuerza estructura lateral/bajista de fondo.',
        technicalSignal: 'Neutra'
      },
      {
        indicator: 'RSI (14)',
        currentValue: 'RSI = 58 (neutro-alcista) — no sobrecomprado',
        signal: 'Si sube sobre 70 → condición sobrecomprada; posible toma de ganancias pero con fuerte momentum.',
        breakdownSignal: 'Si cae por debajo de 50 → indica pérdida de impulso y sesgo más bajista.',
        technicalSignal: 'Alcista moderado'
      },
      {
        indicator: 'MACD (12,26,9)',
        currentValue: 'MACD hist = +0.07 (MACD > Signal) — línea MACD positiva',
        signal: 'Mayor cruce alcista (ampliación) confirmaría rally; atrae momentum técnico.',
        breakdownSignal: 'Cruce a negativo (MACD < Signal) sugiere pérdida de impulso y posible corrección.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'Soportes & Resistencias (Fibonacci entre low $24.00 y high $27.50)',
        currentValue: 'Niveles clave:\n0% (27.50),\n23.6% = 26.674,\n38.2% = 26.163,\n50% = 25.750,\n61.8% = 25.337,\n100% = 24.00.',
        signal: 'Si rompe por encima de 26.674 → siguiente objetivo es volumen en breakout confirma.',
        breakdownSignal: 'Si rompe por debajo de 25.337 (Fibo 61.8%) → probabilidad d',
        technicalSignal: 'Neutra'
      }
    ]
  },
  {
    metal: 'Cobre',
    indicators: [
      {
        indicator: 'SMA 10 (Simple)',
        currentValue: 'SMA10 = $4.15 — precio por encima (4.25 > 4.15)',
        signal: 'Confirmación de momentum corto plazo; suele atraer compradores; puede empujar hacia SMA50.',
        breakdownSignal: 'Caída por debajo de SMA10 señala pérdida de impulso corto; riesgo hacia SMA20.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 20',
        currentValue: 'SMA20 = $4.05 — precio por encima',
        signal: 'Ruptura sostenida por encima indica tendencia positiva de corto/medio plazo; soporte en 4.05.',
        breakdownSignal: 'Quiebre debajo debilita tendencia; test a niveles inferiores.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 50',
        currentValue: 'SMA50 = $4.35 — precio por debajo (4.25 < 4.35)',
        signal: 'Si rompe y cierra por encima de SMA50, señal técnica de reversión a tendencia alcista.',
        breakdownSignal: 'Mantenerse debajo confirma resistencia; sesgo bajista de medio plazo.',
        technicalSignal: 'Neutra / Bajista'
      },
      {
        indicator: 'EMA 9 (exp)',
        currentValue: 'EMA9 = $4.20 — precio por encima',
        signal: 'Ruptura arriba refuerza impulso intradiario; traders suelen entrar largo.',
        breakdownSignal: 'Caída bajo EMA9 acelera salidas y stops intradía.',
        technicalSignal: 'Alcista (corto)'
      },
      {
        indicator: 'EMA 21',
        currentValue: 'EMA21 = $4.10 — precio por encima',
        signal: 'Mantener por encima de EMA21 confirma fuerza de corto; stop lógico por debajo.',
        breakdownSignal: 'Perder EMA21 primera señal de reversión de corto plazo.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'EMA 50',
        currentValue: 'EMA50 = $4.30 — precio por debajo',
        signal: 'Cierre sostenido por encima de EMA50 confirmaría cambio de EMAs.',
        breakdownSignal: 'Rechazo refuerza estructura lateral/bajista.',
        technicalSignal: 'Neutra'
      },
      {
        indicator: 'RSI (14)',
        currentValue: 'RSI = 62 (neutro-alcista) — no sobrecomprado',
        signal: 'Si sube sobre 70 → condición sobrecomprada; posible toma de ganancias.',
        breakdownSignal: 'Caída bajo 50 indica pérdida de impulso; sesgo bajista.',
        technicalSignal: 'Alcista moderado'
      },
      {
        indicator: 'MACD (12,26,9)',
        currentValue: 'MACD hist = +0.05 (MACD > Signal) — línea MACD positiva',
        signal: 'Mayor cruce alcista confirmaría rally; atrae momentum técnico.',
        breakdownSignal: 'Cruce a negativo sugiere pérdida de impulso; corrección.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'Soportes & Resistencias (Fibonacci)',
        currentValue: 'Niveles clave:\n23.6% = 4.40,\n38.2% = 4.30,\n50% = 4.20,\n61.8% = 4.10',
        signal: 'Si rompe por encima de 4.40 → siguiente objetivo con volumen confirma breakout.',
        breakdownSignal: 'Romper 4.10 (Fibo 61.8%) → siguiente nivel bajista.',
        technicalSignal: 'Neutra'
      }
    ]
  },
  {
    metal: 'Plomo',
    indicators: [
      {
        indicator: 'SMA 10 (Simple)',
        currentValue: 'SMA10 = $2,100 — precio por encima (2,150 > 2,100)',
        signal: 'Confirmación de momentum corto plazo; puede empujar hacia resistencias.',
        breakdownSignal: 'Caída bajo SMA10 indica pérdida de impulso; riesgo hacia SMA20.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 20',
        currentValue: 'SMA20 = $2,050 — precio por encima',
        signal: 'Ruptura sostenida indica tendencia positiva; soporte en 2,050.',
        breakdownSignal: 'Quiebre debajo debilita tendencia; test a niveles inferiores.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 50',
        currentValue: 'SMA50 = $2,200 — precio por debajo (2,150 < 2,200)',
        signal: 'Romper SMA50 señalaría reversión a tendencia alcista de medio plazo.',
        breakdownSignal: 'Mantenerse debajo confirma resistencia; sesgo bajista medio plazo.',
        technicalSignal: 'Neutra / Bajista'
      },
      {
        indicator: 'EMA 9 (exp)',
        currentValue: 'EMA9 = $2,120 — precio por encima',
        signal: 'Refuerza impulso intradiario; entrada para traders de corto plazo.',
        breakdownSignal: 'Caída bajo EMA9 acelera salidas y stops intradía.',
        technicalSignal: 'Alcista (corto)'
      },
      {
        indicator: 'EMA 21',
        currentValue: 'EMA21 = $2,080 — precio por encima',
        signal: 'Mantener sobre EMA21 confirma fuerza; stop lógico por debajo.',
        breakdownSignal: 'Perder EMA21 primera señal de reversión de corto.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'EMA 50',
        currentValue: 'EMA50 = $2,180 — precio por debajo',
        signal: 'Cierre sobre EMA50 confirmaría cambio de tendencia.',
        breakdownSignal: 'Rechazo refuerza estructura lateral/bajista.',
        technicalSignal: 'Neutra'
      },
      {
        indicator: 'RSI (14)',
        currentValue: 'RSI = 55 (neutro) — no sobrecomprado',
        signal: 'Sobre 70 indica sobrecompra; posible toma de ganancias.',
        breakdownSignal: 'Caída bajo 50 indica pérdida de impulso; sesgo bajista.',
        technicalSignal: 'Neutra'
      },
      {
        indicator: 'MACD (12,26,9)',
        currentValue: 'MACD hist = +15 (MACD > Signal) — positivo',
        signal: 'Cruce alcista confirmaría rally; atrae momentum.',
        breakdownSignal: 'Cruce a negativo sugiere pérdida de impulso.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'Soportes & Resistencias (Fibonacci)',
        currentValue: 'Niveles: 23.6% = 2,250, 38.2% = 2,200, 50% = 2,150, 61.8% = 2,100',
        signal: 'Romper 2,250 → siguiente objetivo con volumen confirmado.',
        breakdownSignal: 'Romper 2,100 (Fibo 61.8%) → siguiente nivel bajista.',
        technicalSignal: 'Neutra'
      }
    ]
  },
  {
    metal: 'Zinc',
    indicators: [
      {
        indicator: 'SMA 10 (Simple)',
        currentValue: 'SMA10 = $2,800 — precio por encima (2,850 > 2,800)',
        signal: 'Momentum corto plazo confirmado; puede avanzar hacia resistencias.',
        breakdownSignal: 'Caída bajo SMA10 indica pérdida de impulso; riesgo hacia SMA20.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 20',
        currentValue: 'SMA20 = $2,750 — precio por encima',
        signal: 'Tendencia positiva de corto/medio plazo; soporte en 2,750.',
        breakdownSignal: 'Quiebre debajo debilita tendencia; test a niveles inferiores.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 50',
        currentValue: 'SMA50 = $2,900 — precio por debajo (2,850 < 2,900)',
        signal: 'Romper SMA50 señalaría reversión alcista de medio plazo.',
        breakdownSignal: 'Mantenerse debajo confirma resistencia; sesgo bajista medio plazo.',
        technicalSignal: 'Neutra / Bajista'
      },
      {
        indicator: 'EMA 9 (exp)',
        currentValue: 'EMA9 = $2,820 — precio por encima',
        signal: 'Impulso intradiario reforzado; entrada para traders corto plazo.',
        breakdownSignal: 'Caída bajo EMA9 acelera salidas y stops intradía.',
        technicalSignal: 'Alcista (corto)'
      },
      {
        indicator: 'EMA 21',
        currentValue: 'EMA21 = $2,780 — precio por encima',
        signal: 'Mantener sobre EMA21 confirma fuerza; stop por debajo.',
        breakdownSignal: 'Perder EMA21 primera señal de reversión de corto.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'EMA 50',
        currentValue: 'EMA50 = $2,880 — precio por debajo',
        signal: 'Cierre sobre EMA50 confirmaría cambio de EMAs.',
        breakdownSignal: 'Rechazo refuerza estructura lateral/bajista.',
        technicalSignal: 'Neutra'
      },
      {
        indicator: 'RSI (14)',
        currentValue: 'RSI = 60 (neutro-alcista) — no sobrecomprado',
        signal: 'Sobre 70 indica sobrecompra; posible corrección.',
        breakdownSignal: 'Caída bajo 50 indica pérdida de impulso; sesgo bajista.',
        technicalSignal: 'Alcista moderado'
      },
      {
        indicator: 'MACD (12,26,9)',
        currentValue: 'MACD hist = +20 (MACD > Signal) — positivo',
        signal: 'Cruce alcista confirma rally; atrae momentum técnico.',
        breakdownSignal: 'Cruce a negativo sugiere pérdida de impulso.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'Soportes & Resistencias (Fibonacci)',
        currentValue: 'Niveles: 23.6% = 2,950, 38.2% = 2,900, 50% = 2,850, 61.8% = 2,800',
        signal: 'Romper 2,950 → objetivo siguiente con volumen.',
        breakdownSignal: 'Romper 2,800 (Fibo 61.8%) → siguiente nivel bajista.',
        technicalSignal: 'Neutra'
      }
    ]
  },
  {
    metal: 'Oro',
    indicators: [
      {
        indicator: 'SMA 10 (Simple)',
        currentValue: 'SMA10 = $2,050 — precio por encima (2,080 > 2,050)',
        signal: 'Momentum corto plazo confirmado; puede empujar hacia SMA50.',
        breakdownSignal: 'Caída bajo SMA10 indica pérdida de impulso; riesgo hacia SMA20.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 20',
        currentValue: 'SMA20 = $2,020 — precio por encima',
        signal: 'Tendencia positiva confirmada; soporte en 2,020.',
        breakdownSignal: 'Quiebre debajo debilita tendencia; test a niveles inferiores.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'SMA 50',
        currentValue: 'SMA50 = $2,100 — precio por debajo (2,080 < 2,100)',
        signal: 'Romper SMA50 señalaría reversión alcista de medio plazo.',
        breakdownSignal: 'Mantenerse debajo confirma resistencia; sesgo bajista medio plazo.',
        technicalSignal: 'Neutra / Bajista'
      },
      {
        indicator: 'EMA 9 (exp)',
        currentValue: 'EMA9 = $2,060 — precio por encima',
        signal: 'Impulso intradiario fuerte; entrada para traders corto.',
        breakdownSignal: 'Caída bajo EMA9 acelera salidas y stops intradía.',
        technicalSignal: 'Alcista (corto)'
      },
      {
        indicator: 'EMA 21',
        currentValue: 'EMA21 = $2,035 — precio por encima',
        signal: 'Mantener sobre EMA21 confirma fuerza; stop por debajo.',
        breakdownSignal: 'Perder EMA21 primera señal de reversión de corto.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'EMA 50',
        currentValue: 'EMA50 = $2,090 — precio por debajo',
        signal: 'Cierre sobre EMA50 confirmaría cambio de tendencia.',
        breakdownSignal: 'Rechazo refuerza estructura lateral/bajista.',
        technicalSignal: 'Neutra'
      },
      {
        indicator: 'RSI (14)',
        currentValue: 'RSI = 65 (neutro-alcista) — cerca de sobrecompra',
        signal: 'Sobre 70 indica sobrecompra; posible toma de ganancias.',
        breakdownSignal: 'Caída bajo 50 indica pérdida de impulso; sesgo bajista.',
        technicalSignal: 'Alcista moderado'
      },
      {
        indicator: 'MACD (12,26,9)',
        currentValue: 'MACD hist = +8 (MACD > Signal) — positivo',
        signal: 'Cruce alcista confirma rally; atrae momentum.',
        breakdownSignal: 'Cruce a negativo sugiere pérdida de impulso.',
        technicalSignal: 'Alcista'
      },
      {
        indicator: 'Soportes & Resistencias (Fibonacci)',
        currentValue: 'Niveles: 23.6% = 2,120, 38.2% = 2,100, 50% = 2,080, 61.8% = 2,060',
        signal: 'Romper 2,120 → objetivo siguiente con volumen confirmado.',
        breakdownSignal: 'Romper 2,060 (Fibo 61.8%) → siguiente nivel bajista.',
        technicalSignal: 'Neutra'
      }
    ]
  }
];

interface EconomicIndicator {
  date: string;
  time: string;
  indicator: string;
  consensus: string;
  impact: string;
}

interface CountryIndicators {
  country: string;
  indicators: EconomicIndicator[];
}

// Función para obtener los próximos 5 días
const getNextFiveDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('es-ES', { month: 'short' });
    days.push(`${day}-${month}`);
  }
  return days;
};

// Mock data para indicadores económicos
const mockEconomicIndicators: CountryIndicators[] = [
  {
    country: 'Estados Unidos',
    indicators: [
      {
        date: getNextFiveDays()[0],
        time: 'varias',
        indicator: 'Discursos del Fed (Powell y Bowman)',
        consensus: 'N/A (discursos)',
        impact: 'Los comentarios de miembros de la Fed pueden influir en expectativas de tasas (hawkish/dovish). Alto impacto en bonos, dólar y metales preciosos.'
      },
      {
        date: getNextFiveDays()[1],
        time: '12:00 PM',
        indicator: 'MBA Mortgage Applications (semanal)',
        consensus: '-0.2% (dato MBA típico listado)',
        impact: 'Indicador de actividad hipotecaria; impacto moderado en mercados de renta fija y USD de corto plazo.'
      },
      {
        date: getNextFiveDays()[2],
        time: '01:30 PM',
        indicator: 'Initial Jobless Claims (Pedidos de subsidio de desempleo)',
        consensus: '220.0K (consenso), Trading Economics',
        impact: 'Dato de empleo semanal; sorpresa al alza → mejora confianza → alza en USD; sorpresa a la baja → mejora riesgo → posible debilidad USD.'
      },
      {
        date: getNextFiveDays()[3],
        time: '03:00 PM',
        indicator: 'Core PCE (mensual) — Índice de Precios PCE núcleo (monthly)',
        consensus: '0.2% (consenso), Trading Economics',
        impact: 'Principal medida de inflación preferida por la Fed; dato más alto de lo esperado → sube volatilidad en bonos, USD y metales; lenguaje más restrictivo de la Fed posible.'
      },
      {
        date: getNextFiveDays()[3],
        time: '03:00 PM',
        indicator: 'University of Michigan Consumer Sentiment (preliminar)',
        consensus: '51.0 (consenso), Trading Economics',
        impact: 'Mide confianza del consumidor; fuerte sorpresa influye en expectativas de consumo → efecto en USD y activos de riesgo; más indirecto para metales.'
      },
      {
        date: getNextFiveDays()[4],
        time: 'varios',
        indicator: 'Balances del Fed, reportes WASDE, subasta de notas (10y) etc.',
        consensus: 'varios',
        impact: 'Subastas y balances pueden mover liquidez y yields; efecto en USD y bonos principalmente.'
      }
    ]
  },
  {
    country: 'China',
    indicators: [
      {
        date: getNextFiveDays()[0],
        time: '10:00 PM',
        indicator: 'Loan Prime Rate (LPR) 1Y y 5Y',
        consensus: 'Sin cambio esperado (3.10% / 3.60%)',
        impact: 'Tasa de referencia para préstamos; cambio inesperado impacta sentimiento sobre estímulo chino → afecta demanda de metales industriales (cobre, zinc).'
      },
      {
        date: getNextFiveDays()[1],
        time: '09:30 PM',
        indicator: 'Industrial Production (mensual)',
        consensus: '+5.5% (consenso estimado)',
        impact: 'Medida de actividad manufacturera; dato fuerte → optimismo en demanda de metales base; dato débil → presión bajista en cobre, zinc, plomo.'
      },
      {
        date: getNextFiveDays()[2],
        time: '09:30 PM',
        indicator: 'Retail Sales (mensual)',
        consensus: '+3.8% (consenso estimado)',
        impact: 'Consumo interno chino; sorpresa positiva refuerza recuperación económica → potencial alza en commodities; dato bajo → preocupación por demanda.'
      },
      {
        date: getNextFiveDays()[3],
        time: '02:00 AM',
        indicator: 'PBoC Interest Rate Decision',
        consensus: 'Sin cambio esperado (3.45%)',
        impact: 'Decisión de tasas del banco central; cambio o señales dovish/hawkish mueven CNY y expectativas de crecimiento → impacto directo en metales industriales.'
      },
      {
        date: getNextFiveDays()[3],
        time: '09:30 PM',
        indicator: 'Fixed Asset Investment (YTD/YoY)',
        consensus: '+3.4% (consenso estimado)',
        impact: 'Inversión en infraestructura y manufactura; dato robusto → señal positiva para demanda de cobre, acero; dato débil → preocupación en sector construcción.'
      },
      {
        date: getNextFiveDays()[4],
        time: '10:30 PM',
        indicator: 'Caixin Manufacturing PMI (preliminar)',
        consensus: '51.2 (consenso estimado)',
        impact: 'PMI manufacturero del sector privado; lectura >50 indica expansión → positivo para metales base; <50 señala contracción → presión bajista.'
      }
    ]
  }
];

const Dashboard: React.FC = () => {
  // Calcular fecha por defecto (hoy + 5 días)
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split('T')[0];
  };

  // Filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['contratos', 'logistica', 'ensayos', 'pagos', 'fijaciones', 'mercados']);
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [futureDate, setFutureDate] = useState<string>(getDefaultDate());
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);

  // Refs para scroll a secciones
  const patioOperationsRef = useRef<HTMLDivElement>(null);
  const transitOperationsRef = useRef<HTMLDivElement>(null);
  const unreportedWeightsRef = useRef<HTMLDivElement>(null);
  const unreportedAssaysRef = useRef<HTMLDivElement>(null);
  const scheduledWeightsRef = useRef<HTMLDivElement>(null);
  const scheduledAssaysRef = useRef<HTMLDivElement>(null);
  const overduePaymentsRef = useRef<HTMLDivElement>(null);
  const overdueCollectionsRef = useRef<HTMLDivElement>(null);
  const scheduledPaymentsRef = useRef<HTMLDivElement>(null);
  const scheduledCollectionsRef = useRef<HTMLDivElement>(null);
  const upcomingFixingsRef = useRef<HTMLDivElement>(null);
  const gtcOrdersRef = useRef<HTMLDivElement>(null);
  const expiredGtcOrdersRef = useRef<HTMLDivElement>(null);
  const overdueFixingsRef = useRef<HTMLDivElement>(null);

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    contratos: false,
    logistica: false,
    ensayos: false,
    pagos: false,
    fijaciones: false,
    mercados: false
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
    expiredGtc: false,
    overdue: false,
    next5days: false,
    monthlyAverage: false
  });

  const [expandedMarkets, setExpandedMarkets] = useState<{ [key: string]: boolean }>({
    technicalAnalysis: false,
    economicIndicators: false
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

  const toggleMarkets = (section: string) => {
    setExpandedMarkets(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleExpandAllLogistics = () => {
    const allExpanded = expandedLogistics.patio && expandedLogistics.transito;
    setExpandedLogistics({
      patio: !allExpanded,
      transito: !allExpanded
    });
  };

  const toggleExpandAllAssays = () => {
    const allExpanded = expandedAssays.weights && expandedAssays.assays &&
                        expandedAssays.scheduledWeights && expandedAssays.scheduledAssays;
    setExpandedAssays({
      weights: !allExpanded,
      assays: !allExpanded,
      scheduledWeights: !allExpanded,
      scheduledAssays: !allExpanded
    });
  };

  const toggleExpandAllPayments = () => {
    const allExpanded = expandedPayments.payments && expandedPayments.collections &&
                        expandedPayments.scheduledPayments && expandedPayments.scheduledCollections;
    setExpandedPayments({
      payments: !allExpanded,
      collections: !allExpanded,
      scheduledPayments: !allExpanded,
      scheduledCollections: !allExpanded
    });
  };

  const toggleExpandAllFixings = () => {
    const allExpanded = expandedFixings.upcoming && expandedFixings.gtc &&
                        expandedFixings.expiredGtc && expandedFixings.overdue;
    setExpandedFixings({
      upcoming: !allExpanded,
      gtc: !allExpanded,
      expiredGtc: !allExpanded,
      overdue: !allExpanded,
      next5days: !allExpanded,
      monthlyAverage: !allExpanded
    });
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setShowCategoryDropdown(false);
        setShowResponsibleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Helper para generar fechas futuras en formato DDMmmYYYY
  const getFutureDateString = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const parseDateString = (dateStr: string): Date => {
    const match = dateStr.match(/(\d+)([A-Za-z]{3})(\d+)/);
    if (!match) {
      return new Date();
    }
    const [, day, month, year] = match;
    const monthMap: {[key: string]: number} = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
      return new Date();
    }
    const date = new Date(parseInt(year), monthIndex, parseInt(day));
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDaysOverdue = (eta: string): number => {
    const etaDate = parseDateString(eta);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - etaDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getDaysOverdueFromMonthAverage = (periodText: string): number => {
    const monthMatch = periodText.match(/Promedio\s+Mes\s+([A-Za-z]{3})\.(\d{2})/i);
    if (!monthMatch) {
      return 0;
    }
    const [, month, yearShort] = monthMatch;
    const monthMap: {[key: string]: number} = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
      return 0;
    }
    const year = 2000 + parseInt(yearShort);
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - firstDayOfMonth.getTime();
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
      action: 'Falta confirmar versión 2.0 ==> Cliente Trader A',
      responsible: 'Alex Cheap'
    },
    {
      id: '2',
      commodity: 'Concentrado Zn',
      deliveryPeriod: 'Mar-Sep 2026',
      quantity: 800,
      type: 'Nuevo',
      client: 'Peñasquito',
      delayed: 5,
      action: 'Falta confirmar versión 1.0 ==> Cliente Peñasquito',
      responsible: 'Maria Torres'
    },
    {
      id: '3',
      commodity: 'Concentrado Cu',
      deliveryPeriod: 'Jun-Dec 2026',
      quantity: 1500,
      type: 'Renovación',
      client: 'Glencore',
      delayed: 15,
      action: 'Falta confirmar versión 3.0 ==> Cliente Glencore',
      responsible: 'Carlos Mendez'
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
      plate: 'WXYZ-123',
      responsible: 'Alex Cheap'
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
      plate: 'ABCD-234',
      responsible: 'Maria Torres'
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
      plate: 'ABCD-234',
      responsible: 'Carlos Mendez'
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
      plate: 'EFGH-567',
      responsible: 'Juan Perez'
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
      plate: 'IJKL-890',
      responsible: 'Sofia Ramirez'
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
      plate: 'QRST-789',
      responsible: 'Pedro Gomez'
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
      plate: 'UVWX-012',
      responsible: 'Laura Sanchez'
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
      plate: 'ABCD-231',
      responsible: 'Roberto Cruz'
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
      plate: 'ABCD-233',
      responsible: 'Ana Martinez'
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
      plate: 'ABCD-232',
      responsible: 'Diego Lopez'
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
      plate: 'MNOP-456',
      responsible: 'Fernanda Ruiz'
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
      delayed: true,
      responsible: 'Alex Cheap'
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
      delayed: true,
      responsible: 'Maria Torres'
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
      delayed: false,
      responsible: 'Carlos Mendez'
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
      delayed: false,
      responsible: 'Juan Perez'
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
      delayed: true,
      responsible: 'Sofia Ramirez'
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
      delayed: true,
      responsible: 'Pedro Gomez'
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
      delayed: false,
      responsible: 'Laura Sanchez'
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
      delayed: false,
      responsible: 'Roberto Cruz'
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
      etaScheduled: getFutureDateString(2),
      delayed: false,
      responsible: 'Ana Martinez'
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
      etaScheduled: getFutureDateString(5),
      delayed: false,
      responsible: 'Diego Lopez'
    },
    {
      id: '3',
      shipmentNumber: '10102020',
      quantity: 22,
      commodity: 'Concentrado Zn',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Nov.25',
      laboratory: 'Intertek',
      etaScheduled: getFutureDateString(8),
      delayed: false,
      responsible: 'Sofia Ramirez'
    },
    {
      id: '4',
      shipmentNumber: '10102021',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Dic.25',
      laboratory: 'SGS',
      etaScheduled: getFutureDateString(12),
      delayed: false,
      responsible: 'Pedro Gomez'
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
      etaScheduled: getFutureDateString(3),
      comments: '',
      delayed: false,
      responsible: 'Fernanda Ruiz'
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
      etaScheduled: getFutureDateString(6),
      comments: '',
      delayed: false,
      responsible: 'Alex Cheap'
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
      etaScheduled: getFutureDateString(9),
      comments: '',
      delayed: false,
      responsible: 'Maria Torres'
    },
    {
      id: '4',
      shipmentNumber: '10192021',
      quantity: 30,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Dic.25',
      laboratory: 'Intertek',
      etaScheduled: getFutureDateString(14),
      comments: '',
      delayed: false,
      responsible: 'Laura Sanchez'
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
      amount: 15000,
      counterparty: 'Laboratorio SGS del Perú SAC',
      responsible: 'Carlos Mendez'
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
      amount: 22000,
      counterparty: 'Laboratorio ALS de México S.A.',
      responsible: 'Juan Perez'
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
      amount: 18500,
      counterparty: 'Transportes Unidos S.A.',
      responsible: 'Sofia Ramirez'
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
      amount: 12500,
      counterparty: 'Laboratorio Intertek Chile Ltda.',
      responsible: 'Pedro Gomez'
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
      etaScheduled: getFutureDateString(1),
      amount: 45000,
      counterparty: 'Laboratorio SGS del Perú SAC',
      responsible: 'Laura Sanchez'
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
      etaScheduled: getFutureDateString(4),
      amount: 28000,
      counterparty: 'Naviera del Pacífico S.A.',
      responsible: 'Roberto Cruz'
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
      etaScheduled: getFutureDateString(7),
      amount: 32000,
      counterparty: 'Laboratorio AD Lab Chile Ltda.',
      responsible: 'Ana Martinez'
    },
    {
      id: '4',
      type: 'Servicios de almacenamiento Nov.25',
      shipmentNumber: '10102023',
      quantity: 40,
      commodity: 'Concentrado Ag',
      client: 'Trader B',
      contract: 'Contrato 25',
      quota: 'Nov.25',
      etaScheduled: getFutureDateString(11),
      amount: 18000,
      counterparty: 'Almacenes Generales de Depósito S.A.',
      responsible: 'Carlos Mendez'
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
      amount: 125000,
      counterparty: 'Trader A International Ltd.',
      responsible: 'Diego Lopez'
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
      amount: 350000,
      counterparty: 'Minera Peñasquito S.A. de C.V.',
      responsible: 'Fernanda Ruiz'
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
      amount: 180000,
      counterparty: 'Glencore International AG',
      responsible: 'Alex Cheap'
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
      amount: 145000,
      counterparty: 'Trader A International Ltd.',
      responsible: 'Maria Torres'
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
      scheduled: getFutureDateString(2),
      amount: 225000,
      counterparty: 'IMX Trading Corporation',
      responsible: 'Carlos Mendez'
    },
    {
      id: '2',
      type: 'Pago provisional',
      shipmentNumber: '10102022',
      quantity: 35,
      commodity: 'Concentrado Zn',
      client: 'Trader C',
      contract: 'Contrato 15',
      quota: 'Sep.25',
      scheduled: getFutureDateString(5),
      amount: 180000,
      counterparty: 'Trader C Global S.A.',
      responsible: 'Ana Martinez'
    },
    {
      id: '3',
      type: 'Pago final',
      shipmentNumber: '10102024',
      quantity: 50,
      commodity: 'Concentrado Ag',
      client: 'Trader B',
      contract: 'Contrato 174',
      quota: 'Oct.25',
      scheduled: getFutureDateString(9),
      amount: 275000,
      counterparty: 'Trader B Metals Inc.',
      responsible: 'Diego Lopez'
    },
    {
      id: '4',
      type: 'Pago provisional',
      shipmentNumber: '10102025',
      quantity: 42,
      commodity: 'Concentrado Cu',
      client: 'Glencore',
      contract: 'Contrato 8',
      quota: 'Nov.25',
      scheduled: getFutureDateString(13),
      amount: 210000,
      counterparty: 'Glencore International AG',
      responsible: 'Juan Perez'
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
      etaScheduled: getFutureDateString(3),
      terms: {
        metals: 'CU/AU/AG ==> Oficial 15Dec.25',
        period: 'Oficial 15Dec.25',
        quantities: '4fmt Cu / 1000oz Ag / 45oz Au',
        grades: 'Leyes Cu SGS Final / Ag SGS Final / Au SGS Final'
      },
      responsible: 'Juan Perez'
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
      etaScheduled: getFutureDateString(6),
      terms: {
        metals: 'CU/AU/AG ==> Oficial 18Dec.25',
        period: 'Oficial 18Dec.25',
        quantities: '5fmt Cu / 1200oz Ag / 50oz Au',
        grades: 'Leyes Cu SGS Provisional / Ag SGS Final / Au SGS Final'
      },
      responsible: 'Sofia Ramirez'
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
      etaScheduled: getFutureDateString(10),
      terms: {
        metals: 'CU/AU/AG ==> Oficial 20Dec.25',
        period: 'Oficial 20Dec.25',
        quantities: '4.5fmt Cu / 1100oz Ag / 48oz Au',
        grades: 'Leyes Cu SGS Provisional / Ag SGS Provisional / Au SGS Final'
      },
      responsible: 'Pedro Gomez'
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
      etaScheduled: getFutureDateString(14),
      terms: {
        metals: 'CU/AU/AG ==> Oficial 22Dec.25',
        period: 'Oficial 22Dec.25',
        quantities: '5.2fmt Cu / 1300oz Ag / 52oz Au',
        grades: 'Leyes Cu SGS Final / Ag SGS Final / Au SGS Provisional'
      },
      responsible: 'Laura Sanchez'
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
      },
      responsible: 'Roberto Cruz'
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
      },
      responsible: 'Ana Martinez'
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
          price: '10,400',
          period: 'Promedio Ene.26',
          expiration: '28Feb2026',
          exchange: 'LME Select',
          reference: '1234',
          gtcAnalysis: {
            gtcPrice: '10,400',
            gtcPeriod: 'QP Ene26',
            maxPrice: '10,425',
            maxPeriod: '3M',
            spreads: '50 contango',
            maxQP: '10,475',
            execution: 'Si toco, validar con la contraparte'
          }
        },
        {
          metal: 'Ag',
          action: 'Vender',
          quantity: '1,000oz',
          price: '55',
          period: 'Promedio Ene.26',
          expiration: '28Feb2026',
          exchange: 'LME Select',
          reference: '1235',
          gtcAnalysis: {
            gtcPrice: '55',
            gtcPeriod: 'QP Ene26',
            maxPrice: '60',
            maxPeriod: 'Spot',
            spreads: '-2 backwardation',
            maxQP: '58',
            execution: 'Si toco, validar con la contraparte'
          }
        },
        {
          metal: 'Au',
          action: 'Vender',
          quantity: '55oz',
          price: '4,100',
          period: 'Promedio Ene.26',
          expiration: '28Feb2026',
          exchange: 'LME Select',
          reference: '1237',
          gtcAnalysis: {
            gtcPrice: '4,100',
            gtcPeriod: 'QP Ene26',
            maxPrice: '4,050',
            maxPeriod: 'Spot',
            spreads: '10 contango',
            maxQP: '4,060',
            execution: 'No toco'
          }
        }
      ],
      responsible: 'Carlos Ruiz'
    },
    {
      id: '2',
      shipmentNumber: '101020045',
      quantity: 30,
      commodity: 'Concentrado Cu',
      client: 'Trader B',
      contract: 'Contrato 3',
      quota: 'Oct.25',
      actions: [
        {
          metal: 'Cu',
          action: 'Vender',
          quantity: '13fmt',
          price: '10,500',
          period: 'Promedio Nov.25',
          expiration: '31Oct2025',
          exchange: 'LME Select',
          reference: '1240',
          gtcAnalysis: {
            gtcPrice: '10,500',
            gtcPeriod: 'QP Nov25',
            maxPrice: '10,550',
            maxPeriod: '3M',
            spreads: '75 contango',
            maxQP: '10,625',
            execution: 'Si toco, validar con la contraparte'
          }
        },
        {
          metal: 'Ag',
          action: 'Vender',
          quantity: '1,200oz',
          price: '56',
          period: 'Promedio Nov.25',
          expiration: '31Oct2025',
          exchange: 'LME Select',
          reference: '1241',
          gtcAnalysis: {
            gtcPrice: '56',
            gtcPeriod: 'QP Nov25',
            maxPrice: '58',
            maxPeriod: 'Spot',
            spreads: '-3 backwardation',
            maxQP: '55',
            execution: 'No toco'
          }
        },
        {
          metal: 'Au',
          action: 'Vender',
          quantity: '60oz',
          price: '4,150',
          period: 'Promedio Nov.25',
          expiration: '31Oct2025',
          exchange: 'LME Select',
          reference: '1242',
          gtcAnalysis: {
            gtcPrice: '4,150',
            gtcPeriod: 'QP Nov25',
            maxPrice: '4,100',
            maxPeriod: 'Spot',
            spreads: '15 contango',
            maxQP: '4,115',
            execution: 'No toco'
          }
        }
      ],
      responsible: 'Maria Torres'
    }
  ];

  // Fijaciones Vencidas (Sin Fijaciones/Periodo Vencido)
  const overdueFixings: UpcomingFixing[] = [
    {
      id: 'overdue1',
      shipmentNumber: '10102015',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Oct.25',
      periodType: 'next5days',
      etaScheduled: '15Aug2025',
      terms: {
        metals: 'CU/AU/AG ==> Oficial 15Aug.25',
        period: 'Oficial 15Aug.25',
        quantities: '4fmt Cu / 1000oz Ag / 45oz Au',
        grades: 'Leyes Cu SGS Final / Ag SGS Final / Au SGS Final'
      },
      responsible: 'Juan Perez'
    },
    {
      id: 'overdue2',
      shipmentNumber: '10102019',
      quantity: 25,
      commodity: 'Concentrado Cu',
      client: 'Trader A',
      contract: 'Contrato 1',
      quota: 'Nov.25',
      periodType: 'monthlyAverage',
      etaScheduled: '01Oct2025',
      terms: {
        metals: 'CU/AU/AG ==> Promedio Mes Oct.25',
        period: 'Promedio Mes Oct.25',
        quantities: '4fmt Cu / 1000oz Ag / 45oz Au',
        grades: 'Leyes Cu SGS Provisional / Ag SGS Final / Au SGS Final'
      },
      responsible: 'Roberto Zeta'
    },
    {
      id: 'overdue3',
      shipmentNumber: '10102020',
      quantity: 30,
      commodity: 'Concentrado Zn',
      client: 'Peñasquito',
      contract: 'Contrato 5',
      quota: 'Sep.25',
      periodType: 'next5days',
      etaScheduled: '10Aug2025',
      terms: {
        metals: 'CU/AU/AG ==> Oficial 10Aug.25',
        period: 'Oficial 10Aug.25',
        quantities: '5fmt Cu / 1200oz Ag / 50oz Au',
        grades: 'Leyes Cu SGS Provisional / Ag SGS Provisional / Au SGS Final'
      },
      responsible: 'Sofia Ramirez'
    }
  ];

  // Obtener lista única de responsables
  const allResponsibles = Array.from(new Set([
    ...pendingContracts.map(c => c.responsible),
    ...patioOperations.map(o => o.responsible),
    ...transitOperations.map(o => o.responsible),
    ...unreportedWeights.map(w => w.responsible),
    ...unreportedAssays.map(a => a.responsible),
    ...scheduledWeights.map(w => w.responsible),
    ...scheduledAssays.map(a => a.responsible),
    ...overduePayments.map(p => p.responsible),
    ...overdueCollections.map(c => c.responsible),
    ...scheduledPayments.map(p => p.responsible),
    ...scheduledCollections.map(c => c.responsible),
    ...upcomingFixings.map(f => f.responsible),
    ...gtcOrders.map(o => o.responsible),
    ...overdueFixings.map(f => f.responsible)
  ])).sort();

  // Función para scroll a una subsección específica
  const scrollToSubsection = (ref: React.RefObject<HTMLDivElement>, section: string, subsection?: string) => {
    // Primero expandir la sección principal
    setExpandedSections(prev => ({ ...prev, [section]: true }));

    // Expandir la subsección si existe
    if (subsection) {
      if (section === 'logistica') {
        setExpandedLogistics(prev => ({ ...prev, [subsection]: true }));
      } else if (section === 'ensayos') {
        setExpandedAssays(prev => ({ ...prev, [subsection]: true }));
      } else if (section === 'pagos') {
        setExpandedPayments(prev => ({ ...prev, [subsection]: true }));
      } else if (section === 'fijaciones') {
        setExpandedFixings(prev => ({ ...prev, [subsection]: true }));
      }
    }

    // Hacer scroll después de un pequeño delay para que se expanda
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Calcular días entre hoy y la fecha seleccionada
  const getDaysFromToday = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(futureDate);
    selected.setHours(0, 0, 0, 0);
    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para verificar si una fecha está dentro de los próximos N días
  const isDateWithinFutureDays = (dateStr: string): boolean => {
    const match = dateStr.match(/(\d+)([A-Za-z]{3})(\d+)/);
    if (!match) return true;

    const [, day, month, year] = match;
    const monthMap: {[key: string]: number} = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
    const monthIndex = monthMap[month];
    if (monthIndex === undefined) return true;

    const itemDate = new Date(parseInt(year), monthIndex, parseInt(day));
    itemDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(futureDate);
    selectedDate.setHours(0, 0, 0, 0);

    return itemDate >= today && itemDate <= selectedDate;
  };

  // Filtrar por responsable
  const filterByResponsible = <T extends { responsible: string }>(items: T[]): T[] => {
    if (selectedResponsibles.length === 0) return items;
    return items.filter(item => selectedResponsibles.includes(item.responsible));
  };

  // Filtrar por fecha futura (solo para items programados)
  const filterByFutureDate = <T extends { etaScheduled?: string; scheduled?: string }>(items: T[]): T[] => {
    return items.filter(item => {
      const dateStr = item.etaScheduled || item.scheduled;
      return dateStr ? isDateWithinFutureDays(dateStr) : true;
    });
  };

  // Aplicar filtros
  const filteredPendingContracts = filterByResponsible(pendingContracts);
  const filteredPatioOperations = filterByResponsible(patioOperations);
  const filteredTransitOperations = filterByResponsible(transitOperations);
  const filteredUnreportedWeights = filterByResponsible(unreportedWeights);
  const filteredUnreportedAssays = filterByResponsible(unreportedAssays);
  // Items programados - usar filtro de fecha futura
  const filteredScheduledWeights = filterByFutureDate(filterByResponsible(scheduledWeights));
  const filteredScheduledAssays = filterByFutureDate(filterByResponsible(scheduledAssays));
  const filteredOverduePayments = filterByResponsible(overduePayments);
  const filteredOverdueCollections = filterByResponsible(overdueCollections);
  const filteredScheduledPayments = filterByFutureDate(filterByResponsible(scheduledPayments));
  const filteredScheduledCollections = filterByFutureDate(filterByResponsible(scheduledCollections));
  const filteredUpcomingFixings = filterByFutureDate(filterByResponsible(upcomingFixings));
  const filteredGtcOrders = filterByResponsible(gtcOrders.filter(order => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return order.actions.some(action => {
      const expirationDate = parseDateString(action.expiration);
      return expirationDate >= now;
    });
  }));
  const filteredExpiredGtcOrders = filterByResponsible(gtcOrders.filter(order => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return order.actions.every(action => {
      const expirationDate = parseDateString(action.expiration);
      return expirationDate < now;
    });
  }));
  const filteredOverdueFixings = filterByResponsible(overdueFixings);

  // Toggle de categorías
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle de responsables
  const toggleResponsible = (responsible: string) => {
    setSelectedResponsibles(prev =>
      prev.includes(responsible)
        ? prev.filter(r => r !== responsible)
        : [...prev, responsible]
    );
  };

  // Verificar si una categoría debe mostrarse
  const shouldShowCategory = (category: string): boolean => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(category);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Trading</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Categoría */}
          <div className="relative filter-dropdown">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Categorías
            </label>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
            >
              <span className="text-gray-700">
                {selectedCategories.length === 6 ? 'Todas' : selectedCategories.length === 0 ? 'Ninguna' : `${selectedCategories.length} seleccionadas`}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showCategoryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {['contratos', 'logistica', 'ensayos', 'pagos', 'fijaciones', 'mercados'].map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{category}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-2 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategories(['contratos', 'logistica', 'ensayos', 'pagos', 'fijaciones', 'mercados']);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex-1 text-xs text-blue-600 hover:text-blue-800 py-1"
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex-1 text-xs text-gray-600 hover:text-gray-800 py-1"
                  >
                    Ninguna
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filtro por Responsable */}
          <div className="relative filter-dropdown">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <User className="w-3 h-3 inline mr-1" />
              Responsables
            </label>
            <button
              onClick={() => setShowResponsibleDropdown(!showResponsibleDropdown)}
              className="w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
            >
              <span className="text-gray-700 truncate">
                {selectedResponsibles.length === 0 ? 'Todos' : selectedResponsibles.length === 1 ? selectedResponsibles[0] : `${selectedResponsibles.length} seleccionados`}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {showResponsibleDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {allResponsibles.map((responsible) => (
                    <label key={responsible} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedResponsibles.includes(responsible)}
                        onChange={() => toggleResponsible(responsible)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{responsible}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={() => {
                      setSelectedResponsibles([]);
                      setShowResponsibleDropdown(false);
                    }}
                    className="w-full text-xs text-center text-gray-600 hover:text-gray-800 py-1"
                  >
                    Limpiar Selección
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filtro por Fecha Futura */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Calendar className="w-3 h-3 inline mr-1" />
              Próximos {getDaysFromToday()} días
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={futureDate}
                onChange={(e) => setFutureDate(e.target.value)}
                min={getTodayDate()}
                max={getMaxDate()}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => setFutureDate(getDefaultDate())}
                className="px-2 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Restablecer a 5 días"
              >
                Reset
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Máximo 15 días desde hoy
            </p>
          </div>
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
        {shouldShowCategory('contratos') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('contratos')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">1. Contratos</h2>
              <span className="ml-3 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {filteredPendingContracts.length} Por Confirmar
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
                {filteredPendingContracts.map((contract) => (
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
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">Responsable:</span> {contract.responsible}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* 2. Logística */}
        {shouldShowCategory('logistica') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('logistica')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center flex-1">
              <Truck className="w-5 h-5 text-blue-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">2. Logística</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(patioOperationsRef, 'logistica', 'patio');
                }}
                className="ml-3 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-emerald-200 transition-colors cursor-pointer"
              >
                {filteredPatioOperations.length} En Patio
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(transitOperationsRef, 'logistica', 'transito');
                }}
                className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {filteredTransitOperations.length} En Tránsito
              </button>
            </div>
            {expandedSections.logistica && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandAllLogistics();
                }}
                className="mr-2 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {expandedLogistics.patio && expandedLogistics.transito ? 'Contraer Todo' : 'Expandir Todo'}
              </button>
            )}
            {expandedSections.logistica ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.logistica && (
            <div className="px-6 pb-5 space-y-3">
              {/* En Patio de Salidas */}
              <div ref={patioOperationsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleLogistics('patio')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-bold text-gray-900">En Patio de Salidas</span>
                    <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredPatioOperations.length}
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
                      {filteredPatioOperations.map((op) => {
                        const daysOverdue = getDaysOverdue(op.eta.split('@')[0]);
                        const isOverdue = daysOverdue > 0;
                        return (
                          <div key={op.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p>
                                #Nro Op: {op.opNumber} / <span className="font-semibold">{op.quantity}dmt</span> / {op.commodity} / Cliente {op.client} / {op.contract} / Cuota {op.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                <span className="font-semibold">Ubicación:</span> {op.location} / ETA Programada  {'==>'}{op.eta}{isOverdue && `  ==>${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <span className="font-semibold">Operador:</span> {op.operator} / <span className="font-semibold">Placas:</span> {op.plate}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <span className="font-semibold">Responsable:</span> {op.responsible}
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
              <div ref={transitOperationsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleLogistics('transito')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <TruckIcon className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-bold text-gray-900">En Tránsito</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredTransitOperations.length}
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
                      {filteredTransitOperations.map((op) => {
                        const daysOverdue = getDaysOverdue(op.eta.split('@')[0]);
                        const isOverdue = daysOverdue > 0;
                        return (
                          <div key={op.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="text-sm space-y-1">
                              <p>
                                #Nro Op: {op.opNumber} / <span className="font-semibold">{op.quantity}dmt</span> / {op.commodity} / Cliente {op.client} / {op.contract} / Cuota {op.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                <span className="font-semibold">Ubicación:</span> {op.location} / ETA Programada  {'==>'}{op.eta}{isOverdue && `  ==>${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <span className="font-semibold">Operador:</span> {op.operator} / <span className="font-semibold">Placas:</span> {op.plate}
                              </p>
                              <p className="text-gray-600 text-xs">
                                <span className="font-semibold">Responsable:</span> {op.responsible}
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
        )}

        {/* 3. Ensayos & Pesos */}
        {shouldShowCategory('ensayos') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('ensayos')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center flex-1">
              <Package className="w-5 h-5 text-emerald-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">3. Ensayos & Pesos</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(unreportedWeightsRef, 'ensayos', 'weights');
                }}
                className="ml-3 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors cursor-pointer"
              >
                {filteredUnreportedWeights.length} Pesos No Reportados
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(unreportedAssaysRef, 'ensayos', 'assays');
                }}
                className="ml-2 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-orange-200 transition-colors cursor-pointer"
              >
                {filteredUnreportedAssays.length} Ensayes No Reportados
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(scheduledWeightsRef, 'ensayos', 'scheduledWeights');
                }}
                className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {filteredScheduledWeights.length} Pesos Programados
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(scheduledAssaysRef, 'ensayos', 'scheduledAssays');
                }}
                className="ml-2 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors cursor-pointer"
              >
                {filteredScheduledAssays.length} Ensayes Programados
              </button>
            </div>
            {expandedSections.ensayos && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandAllAssays();
                }}
                className="mr-2 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {expandedAssays.weights && expandedAssays.assays && expandedAssays.scheduledWeights && expandedAssays.scheduledAssays ? 'Contraer Todo' : 'Expandir Todo'}
              </button>
            )}
            {expandedSections.ensayos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.ensayos && (
            <div className="px-6 pb-5 space-y-3">
              {/* Pesos no reportados */}
              <div ref={unreportedWeightsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('weights')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Scale className="w-4 h-4 text-red-500 mr-2" />
                    <span className="font-bold text-gray-900">Pesos no Reportados</span>
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredUnreportedWeights.length}
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
                      {[...filteredUnreportedWeights].sort((a, b) => {
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
                                Embarque {weight.shipmentNumber} / <span className="font-semibold">{weight.quantity}dmt</span> / {weight.commodity} / Cliente {weight.client} / {weight.contract} / Cuota {weight.quota} / Laboratorio: {weight.laboratory}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                ETA Programada  {'==>'}{weight.etaScheduled}{isOverdue && `  ==>${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-600 text-xs mt-1">
                                <span className="font-semibold">Responsable:</span> {weight.responsible}
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
              <div ref={unreportedAssaysRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('assays')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <FlaskConical className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="font-bold text-gray-900">Ensayes no Reportados</span>
                    <span className="ml-2 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredUnreportedAssays.length}
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
                      {[...filteredUnreportedAssays].sort((a, b) => {
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
                                Embarque {assay.shipmentNumber} / <span className="font-semibold">{assay.quantity}dmt</span> / {assay.commodity} / Cliente {assay.client} / {assay.contract} / Cuota {assay.quota} / Laboratorio: {assay.laboratory}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                                ETA Programada  {'==>'}{assay.etaScheduled}{isOverdue && `  ==>${daysOverdue}d ATRASADO`}
                              </p>
                              {assay.comments && (
                                <p className="text-gray-600 text-xs">
                                  <span className="font-semibold">Comentarios:</span> {assay.comments}
                                </p>
                              )}
                              <p className="text-gray-600 text-xs mt-1">
                                <span className="font-semibold">Responsable:</span> {assay.responsible}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Pesos Programados */}
              <div ref={scheduledWeightsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('scheduledWeights')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Scale className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-bold text-gray-900">Pesos Programados (Próximos {getDaysFromToday()} días)</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredScheduledWeights.length}
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
                      {filteredScheduledWeights.map((weight) => (
                        <div key={weight.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p>
                              Embarque {weight.shipmentNumber} / <span className="font-semibold">{weight.quantity}dmt</span> / {weight.commodity} / Cliente {weight.client} / {weight.contract} / Cuota {weight.quota} / Laboratorio: {weight.laboratory}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">ETA Programada {'==>'}</span> {weight.etaScheduled}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-semibold">Responsable:</span> {weight.responsible}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ensayes Programados */}
              <div ref={scheduledAssaysRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAssays('scheduledAssays')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <FlaskConical className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-bold text-gray-900">Ensayes Programados (Próximos {getDaysFromToday()} días)</span>
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredScheduledAssays.length}
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
                      {filteredScheduledAssays.map((assay) => (
                        <div key={assay.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p>
                              Embarque {assay.shipmentNumber} / <span className="font-semibold">{assay.quantity}dmt</span> / {assay.commodity} / Cliente {assay.client} / {assay.contract} / Cuota {assay.quota} / Laboratorio: {assay.laboratory}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">ETA Programada {'==>'}</span> {assay.etaScheduled}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-semibold">Responsable:</span> {assay.responsible}
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
        )}

        {/* 4. Pagos & Cobros */}
        {shouldShowCategory('pagos') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('pagos')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center flex-1">
              <DollarSign className="w-5 h-5 text-green-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">4. Pagos & Cobros</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(overduePaymentsRef, 'pagos', 'payments');
                }}
                className="ml-3 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors cursor-pointer"
              >
                {filteredOverduePayments.length} Pagos Vencidos
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(overdueCollectionsRef, 'pagos', 'collections');
                }}
                className="ml-2 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-orange-200 transition-colors cursor-pointer"
              >
                {filteredOverdueCollections.length} Cobros Vencidos
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(scheduledPaymentsRef, 'pagos', 'scheduledPayments');
                }}
                className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {filteredScheduledPayments.length} Pagos Programados
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(scheduledCollectionsRef, 'pagos', 'scheduledCollections');
                }}
                className="ml-2 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors cursor-pointer"
              >
                {filteredScheduledCollections.length} Cobros Programados
              </button>
            </div>
            {expandedSections.pagos && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandAllPayments();
                }}
                className="mr-2 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {expandedPayments.payments && expandedPayments.collections && expandedPayments.scheduledPayments && expandedPayments.scheduledCollections ? 'Contraer Todo' : 'Expandir Todo'}
              </button>
            )}
            {expandedSections.pagos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.pagos && (
            <div className="px-6 pb-5 space-y-3">
              {/* Pagos vencidos */}
              <div ref={overduePaymentsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('payments')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="font-bold text-gray-900">Pagos Vencidos - ${filteredOverduePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredOverduePayments.length}
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
                      {[...filteredOverduePayments].sort((a, b) => {
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
                                <span className="font-semibold">&gt;</span> Embarque {payment.shipmentNumber} / <span className="font-semibold">{payment.quantity}dmt</span> / {payment.commodity} / Cliente {payment.client} / {payment.contract} / Cuota {payment.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold text-xs" : "text-gray-600 text-xs"}>
                                ETA Programada  {'==>'}{payment.etaScheduled}{daysOverdue > 0 && `  ==>${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-900 text-sm font-semibold">
                                Monto: ${payment.amount.toLocaleString()}
                              </p>
                              <p className="text-gray-700 text-xs mt-1">
                                <span className="font-semibold">Contraparte:</span> {payment.counterparty}
                              </p>
                              <p className="text-gray-600 text-xs mt-1">
                                <span className="font-semibold">Responsable:</span> {payment.responsible}
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
              <div ref={overdueCollectionsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('collections')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="font-bold text-gray-900">Cobros Vencidos - ${filteredOverdueCollections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
                    <span className="ml-2 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredOverdueCollections.length}
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
                      {[...filteredOverdueCollections].sort((a, b) => {
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
                                <span className="font-semibold">&gt;</span> Embarque {collection.shipmentNumber} / <span className="font-semibold">{collection.quantity}dmt</span> / {collection.commodity} / Cliente {collection.client} / {collection.contract} / Cuota {collection.quota}
                              </p>
                              <p className={isOverdue ? "text-red-600 font-semibold text-xs" : "text-gray-600 text-xs"}>
                                ETA Programada  {'==>'}{collection.scheduled}{daysOverdue > 0 && `  ==>${daysOverdue}d ATRASADO`}
                              </p>
                              <p className="text-gray-900 text-sm font-semibold">
                                Monto: ${collection.amount.toLocaleString()}
                              </p>
                              <p className="text-gray-700 text-xs mt-1">
                                <span className="font-semibold">Contraparte:</span> {collection.counterparty}
                              </p>
                              <p className="text-gray-600 text-xs mt-1">
                                <span className="font-semibold">Responsable:</span> {collection.responsible}
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
              <div ref={scheduledPaymentsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('scheduledPayments')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-bold text-gray-900">Pagos Programados (Próximos {getDaysFromToday()} días)</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredScheduledPayments.length}
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
                      {filteredScheduledPayments.map((payment) => (
                        <div key={payment.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-900">
                              <span className="font-semibold">Tipo:</span> {payment.type}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">&gt;</span> Embarque {payment.shipmentNumber} / <span className="font-semibold">{payment.quantity}dmt</span> / {payment.commodity} / Cliente {payment.client} / {payment.contract} / Cuota {payment.quota}
                            </p>
                            <p className="text-gray-600 text-xs">
                              <span className="font-semibold">ETA Programada {'==>'}</span> {payment.etaScheduled}
                            </p>
                            <p className="text-gray-900 text-sm font-semibold">
                              Monto: ${payment.amount.toLocaleString()}
                            </p>
                            <p className="text-gray-700 text-xs mt-1">
                              <span className="font-semibold">Contraparte:</span> {payment.counterparty}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-semibold">Responsable:</span> {payment.responsible}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cobros Programados */}
              <div ref={scheduledCollectionsRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => togglePayments('scheduledCollections')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-bold text-gray-900">Cobros Programados (Próximos {getDaysFromToday()} días)</span>
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredScheduledCollections.length}
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
                      {filteredScheduledCollections.map((collection) => (
                        <div key={collection.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-900">
                              <span className="font-semibold">Tipo:</span> {collection.type}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">&gt;</span> Embarque {collection.shipmentNumber} / <span className="font-semibold">{collection.quantity}dmt</span> / {collection.commodity} / Cliente {collection.client} / {collection.contract} / Cuota {collection.quota}
                            </p>
                            <p className="text-gray-600 text-xs">
                              <span className="font-semibold">ETA Programada {'==>'}</span> {collection.scheduled}
                            </p>
                            <p className="text-gray-900 text-sm font-semibold">
                              Monto: ${collection.amount.toLocaleString()}
                            </p>
                            <p className="text-gray-700 text-xs mt-1">
                              <span className="font-semibold">Contraparte:</span> {collection.counterparty}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-semibold">Responsable:</span> {collection.responsible}
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
        )}

        {/* 5. Fijaciones */}
        {shouldShowCategory('fijaciones') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('fijaciones')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center flex-1">
              <TrendingUp className="w-5 h-5 text-orange-600 mr-3" />
              <h2 className="text-lg font-bold text-gray-900">5. Fijaciones</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(overdueFixingsRef, 'fijaciones', 'overdue');
                }}
                className="ml-3 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors cursor-pointer"
              >
                {filteredOverdueFixings.length} Sin Fijaciones/Vencidas
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(upcomingFixingsRef, 'fijaciones', 'upcoming');
                }}
                className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {filteredUpcomingFixings.length} Próximas Fijaciones
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(gtcOrdersRef, 'fijaciones', 'gtc');
                }}
                className="ml-2 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors cursor-pointer"
              >
                {filteredGtcOrders.length} GTC Abiertas
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSubsection(expiredGtcOrdersRef, 'fijaciones', 'expiredGtc');
                }}
                className="ml-2 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors cursor-pointer"
              >
                {filteredExpiredGtcOrders.length} GTC Expiradas
              </button>
            </div>
            {expandedSections.fijaciones && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandAllFixings();
                }}
                className="mr-2 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {expandedFixings.upcoming && expandedFixings.gtc && expandedFixings.expiredGtc && expandedFixings.overdue ? 'Contraer Todo' : 'Expandir Todo'}
              </button>
            )}
            {expandedSections.fijaciones ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.fijaciones && (
            <div className="px-6 pb-5 space-y-3">
              {/* Sin Fijaciones/Periodo Vencido */}
              <div ref={overdueFixingsRef} className="bg-red-50 rounded-lg border border-red-300">
                <button
                  onClick={() => toggleFixings('overdue')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="font-bold text-red-900">Sin Fijaciones/Periodo Vencido</span>
                    <span className="ml-2 bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredOverdueFixings.length}
                    </span>
                  </div>
                  {expandedFixings.overdue ? (
                    <ChevronUp className="w-4 h-4 text-red-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-red-600" />
                  )}
                </button>

                {expandedFixings.overdue && (
                  <div className="px-4 pb-4 space-y-2">
                    {filteredOverdueFixings.map((fixing) => {
                      const isMonthAverage = fixing.terms.period.includes('Promedio Mes');
                      const daysOverdue = isMonthAverage
                        ? getDaysOverdueFromMonthAverage(fixing.terms.period)
                        : getDaysOverdue(fixing.etaScheduled);
                      return (
                        <div key={fixing.id} className="bg-white rounded-lg p-3 border border-red-200">
                          <div className="text-sm space-y-1">
                            <p className="text-gray-700">
                              Embarque {fixing.shipmentNumber} / <span className="font-semibold">{fixing.quantity}dmt</span> / {fixing.commodity} / Cliente {fixing.client} / {fixing.contract} / Cuota {fixing.quota}
                            </p>
                            <div className="mt-2 space-y-1 text-xs bg-red-50 p-2 rounded border border-red-200">
                              <p className="text-red-700 font-semibold">
                                <span className="font-semibold">Términos:</span> ({fixing.terms.metals}) {'==>'} {daysOverdue}d ATRASADO
                              </p>
                              <p className="text-gray-700">
                                {fixing.terms.quantities}
                              </p>
                              <p className="text-gray-600">
                                Leyes {fixing.terms.grades}
                              </p>
                              <p className="text-gray-600 mt-1">
                                <span className="font-semibold">Responsable:</span> {fixing.responsible}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
                      {filteredUpcomingFixings.length}
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
                    <div ref={upcomingFixingsRef} className="bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => toggleFixings('next5days')}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 text-sm">Periodo contractual próximos {getDaysFromToday()}d</span>
                        {expandedFixings.next5days ? (
                          <ChevronUp className="w-3 h-3 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                      {expandedFixings.next5days && (
                        <div className="px-3 pb-3 space-y-2">
                          {filteredUpcomingFixings.filter(f => f.periodType === 'next5days').map((fixing) => {
                            const daysOverdue = getDaysOverdue(fixing.etaScheduled);
                            const isOverdue = isEtaOverdue(fixing.etaScheduled);
                            return (
                              <div key={fixing.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-sm space-y-1">
                                  <p className="text-gray-700">
                                    Embarque {fixing.shipmentNumber} / <span className="font-semibold">{fixing.quantity}dmt</span> / {fixing.commodity} / Cliente {fixing.client} / {fixing.contract} / Cuota {fixing.quota}
                                  </p>
                                  <div className="mt-2 space-y-1 text-xs bg-white p-2 rounded">
                                    <p className="text-gray-900">
                                      <span className="font-semibold">Términos:</span> ({fixing.terms.metals})
                                    </p>
                                    <p className="text-gray-700">
                                      {fixing.terms.quantities}
                                    </p>
                                    <p className="text-gray-600">
                                      {fixing.terms.grades}
                                    </p>
                                    <p className="text-gray-600 mt-1">
                                      <span className="font-semibold">Responsable:</span> {fixing.responsible}
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
                          {filteredUpcomingFixings.filter(f => f.periodType === 'monthlyAverage').map((fixing) => {
                            const daysOverdue = getDaysOverdue(fixing.etaScheduled);
                            const isOverdue = isEtaOverdue(fixing.etaScheduled);
                            return (
                              <div key={fixing.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-sm space-y-1">
                                  <p className="text-gray-700">
                                    Embarque {fixing.shipmentNumber} / <span className="font-semibold">{fixing.quantity}dmt</span> / {fixing.commodity} / Cliente {fixing.client} / {fixing.contract} / Cuota {fixing.quota}
                                  </p>
                                  <div className="mt-2 space-y-1 text-xs bg-white p-2 rounded">
                                    <p className="text-gray-900">
                                      <span className="font-semibold">Términos:</span> ({fixing.terms.metals})
                                    </p>
                                    <p className="text-gray-700">
                                      {fixing.terms.quantities}
                                    </p>
                                    <p className="text-gray-600">
                                      {fixing.terms.grades}
                                    </p>
                                    <p className="text-gray-600 mt-1">
                                      <span className="font-semibold">Responsable:</span> {fixing.responsible}
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
              <div ref={gtcOrdersRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleFixings('gtc')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <ListChecks className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-bold text-gray-900">GTC Abiertas</span>
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredGtcOrders.length}
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
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredGtcOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-3">
                            <p className="text-gray-700 font-medium">
                              Embarque {order.shipmentNumber} / <span className="font-semibold">{order.quantity}dmt</span> / {order.commodity} / Cliente {order.client} / {order.contract} / Cuota {order.quota}
                            </p>
                            <div className="mt-3 space-y-3">
                              {order.actions.map((action, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <p className="text-gray-900 font-semibold mb-2">
                                    {action.metal} {'==>'} {action.action} {action.quantity}@{action.price} {action.period} / Exp {action.expiration} {action.exchange} / Referencia {action.reference}
                                  </p>
                                  <div className="ml-4 space-y-1 text-xs">
                                    <p className="text-gray-700">
                                      <span className="font-semibold">a)</span> GTC {action.gtcAnalysis.gtcPrice}@{action.gtcAnalysis.gtcPeriod}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-semibold">b)</span> Max {action.gtcAnalysis.maxPeriod} {'==>'} {action.gtcAnalysis.maxPrice}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-semibold">c)</span> Spreads {action.gtcAnalysis.maxPeriod}_{action.gtcAnalysis.gtcPeriod} {'==>'} {action.gtcAnalysis.spreads}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-semibold">d)</span> Max {action.gtcAnalysis.gtcPeriod} {'==>'} (b+c) = {action.gtcAnalysis.maxQP}
                                    </p>
                                    <p className={`font-semibold ${action.gtcAnalysis.execution.includes('No toco') ? 'text-gray-700' : 'text-orange-600'}`}>
                                      <span className="font-semibold">e)</span> Ejecución Max {action.gtcAnalysis.gtcPeriod} {'==>'} (d{action.gtcAnalysis.execution.includes('No toco') ? '<' : '>'}a) = "{action.gtcAnalysis.execution}"
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-gray-600 text-xs mt-3 pt-2 border-t border-gray-200">
                              <span className="font-semibold">Responsable:</span> {order.responsible}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* GTC Expiradas No Renovadas */}
              <div ref={expiredGtcOrdersRef} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleFixings('expiredGtc')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="font-bold text-gray-900">GTC Expiradas No Renovadas</span>
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {filteredExpiredGtcOrders.length}
                    </span>
                  </div>
                  {expandedFixings.expiredGtc ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedFixings.expiredGtc && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredExpiredGtcOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg p-4 border border-red-200 hover:shadow-md transition-all">
                          <div className="text-sm space-y-2">
                            <p className="text-gray-700">
                              Embarque {order.shipmentNumber} / <span className="font-semibold">{order.quantity}dmt</span> / {order.commodity} / Cliente {order.client} / {order.contract} / Cuota {order.quota}
                            </p>
                            <div className="mt-2 space-y-2">
                              <p className="font-semibold text-gray-900 text-xs">Actions:</p>
                              {order.actions.map((action, index) => {
                                const daysOverdue = getDaysOverdue(action.expiration);
                                return (
                                  <div key={index} className="text-xs bg-red-50 p-2 rounded border border-red-200">
                                    <p className="text-gray-900">
                                      <span className="font-semibold">{action.metal}</span> {'==>'}{action.action} {action.quantity}@{action.price} {action.period}
                                    </p>
                                    <p className="text-red-700 font-semibold mt-0.5">
                                      Exp {action.expiration} {'==>'} {daysOverdue}d ATRASADO
                                    </p>
                                    <p className="text-gray-600 mt-0.5">
                                      {action.exchange} / Referencia {action.reference}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-gray-600 text-xs mt-2">
                              <span className="font-semibold">Responsable:</span> {order.responsible}
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
        )}
      </div>

      {/* 6. Mercados */}
      {shouldShowCategory('mercados') && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('mercados')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center flex-1">
            <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
            <h2 className="text-lg font-bold text-gray-900">6. Mercados</h2>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.mercados ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.mercados && (
          <div className="p-6 space-y-4 border-t border-gray-200">
            {/* Análisis Técnico de Corto Plazo Precios */}
            <div className="bg-gray-50 rounded-lg">
              <button
                onClick={() => toggleMarkets('technicalAnalysis')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
              >
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
                  <h3 className="text-base font-semibold text-gray-900">
                    a) Análisis Técnico de Corto Plazo Precios
                  </h3>
                </div>
                {expandedMarkets.technicalAnalysis ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expandedMarkets.technicalAnalysis && (
                <div className="px-4 pb-4 space-y-6">
                  {mockTechnicalAnalysis.map((metalData) => (
                    <div key={metalData.metal} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-400 to-slate-500 px-4 py-3">
                        <h4 className="text-lg font-bold text-white">{metalData.metal}</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Indicador</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Valor / Estado actual</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Si el spot rompe por encima</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Si el spot rompe por debajo</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Señal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {metalData.indicators.map((indicator, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-pre-wrap">
                                  {indicator.indicator}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                                  {indicator.currentValue}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                                  {indicator.signal}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                                  {indicator.breakdownSignal}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                                  {indicator.technicalSignal}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Indicadores Económicos */}
            <div className="bg-gray-50 rounded-lg">
              <button
                onClick={() => toggleMarkets('economicIndicators')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
              >
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-purple-600 mr-2" />
                  <h3 className="text-base font-semibold text-gray-900">
                    b) Indicadores Económicos
                  </h3>
                </div>
                {expandedMarkets.economicIndicators ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expandedMarkets.economicIndicators && (
                <div className="px-4 pb-4 space-y-6">
                  {mockEconomicIndicators.map((countryData) => (
                    <div key={countryData.country} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-400 to-slate-500 px-4 py-3">
                        <h4 className="text-lg font-bold text-white">{countryData.country}</h4>
                      </div>
                      <div className="p-4">
                        <div className="mb-3 text-sm text-gray-600">
                          Para ver datos reales dirigirse a{' '}
                          <a
                            href="https://tradingeconomics.com/calendar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold underline"
                          >
                            Economic Calendar
                          </a>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-800 text-white">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha (2025)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Hora (ET aprox.)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Indicador</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Consenso (analistas)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Por qué impacta la volatilidad / efecto esperado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {countryData.indicators.map((indicator, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {indicator.date}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {indicator.time}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {indicator.indicator}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {indicator.consensus}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {indicator.impact}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

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

    </div>
  );
};

export default Dashboard;
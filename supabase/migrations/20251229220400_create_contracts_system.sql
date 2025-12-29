/*
  # Create Contracts Trading System

  ## Overview
  Creates the complete database schema for managing commercial mineral trading contracts,
  including vendors, buyers, products, countries, incoterms, and contract quotas.

  ## New Tables

  ### 1. `vendors`
  - `id` (uuid, primary key)
  - `name` (text) - Vendor company name
  - `tax_id` (text) - RUC or tax identification
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `buyers`
  - `id` (uuid, primary key)
  - `name` (text) - Buyer company name
  - `tax_id` (text) - RUC or tax identification
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `products`
  - `id` (uuid, primary key)
  - `name` (text) - Product name (e.g., Concentrado de Cobre)
  - `type` (text) - Product type/category
  - `created_at` (timestamptz)

  ### 4. `countries`
  - `id` (uuid, primary key)
  - `name` (text) - Country name
  - `code` (text) - ISO country code
  - `created_at` (timestamptz)

  ### 5. `incoterms`
  - `id` (uuid, primary key)
  - `code` (text) - Incoterm code (e.g., FOB, CIF, CFR)
  - `description` (text) - Full description
  - `created_at` (timestamptz)

  ### 6. `contracts`
  - `id` (uuid, primary key)
  - `contract_number` (text, unique) - Auto-generated contract number
  - `contract_type` (text) - 'purchase' or 'sale'
  - `vendor_id` (uuid, foreign key to vendors)
  - `buyer_id` (uuid, foreign key to buyers)
  - `product_id` (uuid, foreign key to products)
  - `country_id` (uuid, foreign key to countries)
  - `start_month` (date) - First delivery month
  - `end_month` (date) - Last delivery month
  - `incoterm_id` (uuid, foreign key to incoterms)
  - `delivery_location` (text) - Delivery place
  - `status` (text) - 'draft', 'active', 'completed', 'cancelled'
  - `created_by` (uuid) - User who created the contract
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `contract_quotas`
  - `id` (uuid, primary key)
  - `contract_id` (uuid, foreign key to contracts)
  - `month` (date) - Delivery month
  - `tmh` (numeric) - Tons wet (toneladas métricas húmedas)
  - `tms` (numeric) - Tons dry (toneladas métricas secas)
  - `h2o_percentage` (numeric) - Water/humidity percentage
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Authenticated users can view all records
  - Authenticated users can insert and update records
  - Restrictive policies based on authentication

  ## Notes
  - All tables include proper indexes for performance
  - Foreign key constraints ensure data integrity
  - Default values set for timestamps
  - Unique constraints on critical fields
*/

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text DEFAULT 'mineral_concentrate',
  created_at timestamptz DEFAULT now()
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create incoterms table
CREATE TABLE IF NOT EXISTS incoterms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number text UNIQUE NOT NULL,
  contract_type text NOT NULL CHECK (contract_type IN ('purchase', 'sale')),
  vendor_id uuid REFERENCES vendors(id) ON DELETE RESTRICT,
  buyer_id uuid REFERENCES buyers(id) ON DELETE RESTRICT,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  country_id uuid REFERENCES countries(id) ON DELETE RESTRICT,
  start_month date NOT NULL,
  end_month date NOT NULL,
  incoterm_id uuid REFERENCES incoterms(id) ON DELETE RESTRICT,
  delivery_location text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contract_quotas table
CREATE TABLE IF NOT EXISTS contract_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  month date NOT NULL,
  tmh numeric(10,2) NOT NULL DEFAULT 0,
  tms numeric(10,2) NOT NULL DEFAULT 0,
  h2o_percentage numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contract_id, month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_buyer ON contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_product ON contracts(product_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_month, end_month);
CREATE INDEX IF NOT EXISTS idx_contract_quotas_contract ON contract_quotas(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_quotas_month ON contract_quotas(month);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoterms ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Authenticated users can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for buyers
CREATE POLICY "Authenticated users can view buyers"
  ON buyers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert buyers"
  ON buyers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update buyers"
  ON buyers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for products
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for countries
CREATE POLICY "Authenticated users can view countries"
  ON countries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert countries"
  ON countries FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for incoterms
CREATE POLICY "Authenticated users can view incoterms"
  ON incoterms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert incoterms"
  ON incoterms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for contracts
CREATE POLICY "Authenticated users can view contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contracts"
  ON contracts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for contract_quotas
CREATE POLICY "Authenticated users can view quotas"
  ON contract_quotas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert quotas"
  ON contract_quotas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotas"
  ON contract_quotas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete quotas"
  ON contract_quotas FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial data
-- Countries
INSERT INTO countries (name, code) VALUES
  ('Perú', 'PE'),
  ('Chile', 'CL'),
  ('México', 'MX'),
  ('Estados Unidos', 'US'),
  ('China', 'CN'),
  ('Japón', 'JP')
ON CONFLICT (code) DO NOTHING;

-- Products
INSERT INTO products (name, type) VALUES
  ('Concentrado de Cobre', 'mineral_concentrate'),
  ('Concentrado de Zinc', 'mineral_concentrate'),
  ('Concentrado de Plomo', 'mineral_concentrate'),
  ('Concentrado de Plata', 'mineral_concentrate'),
  ('Concentrado de Oro', 'mineral_concentrate')
ON CONFLICT (name) DO NOTHING;

-- Incoterms
INSERT INTO incoterms (code, description) VALUES
  ('FOB', 'Free On Board - El vendedor entrega la mercancía a bordo del buque'),
  ('CIF', 'Cost, Insurance and Freight - El vendedor paga el costo, seguro y flete'),
  ('CFR', 'Cost and Freight - El vendedor paga el costo y flete'),
  ('EXW', 'Ex Works - El comprador recoge la mercancía en las instalaciones del vendedor'),
  ('FCA', 'Free Carrier - El vendedor entrega la mercancía al transportista'),
  ('CPT', 'Carriage Paid To - El vendedor paga el transporte'),
  ('CIP', 'Carriage and Insurance Paid To - El vendedor paga transporte y seguro'),
  ('DAP', 'Delivered At Place - El vendedor entrega en el lugar acordado'),
  ('DPU', 'Delivered at Place Unloaded - El vendedor entrega descargado'),
  ('DDP', 'Delivered Duty Paid - El vendedor entrega con todos los costos pagados')
ON CONFLICT (code) DO NOTHING;

-- Sample vendors
INSERT INTO vendors (name, tax_id) VALUES
  ('Minería Protón S.A.C.', '20123456789'),
  ('Compañía Minera del Sur', '20987654321'),
  ('Minerales Andinos S.A.', '20456789123')
ON CONFLICT (tax_id) DO NOTHING;

-- Sample buyers
INSERT INTO buyers (name, tax_id) VALUES
  ('Trader A', '30123456789'),
  ('Glencore International', '30987654321'),
  ('Trafigura Trading', '30456789123'),
  ('Peñasquito', '30789123456')
ON CONFLICT (tax_id) DO NOTHING;
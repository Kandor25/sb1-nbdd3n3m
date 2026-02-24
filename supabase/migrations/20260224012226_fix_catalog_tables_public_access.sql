/*
  # Fix Public Access to Catalog Tables

  ## Changes
  This migration updates RLS policies for catalog tables to allow public access
  since the application does not have authentication configured.
  
  ## Tables Affected
  - vendors
  - buyers
  - products
  - countries
  - incoterms
  - market_indices
  - payment_terms
  
  ## Security Changes
  - DROP existing authenticated-only policies
  - CREATE new public SELECT policies for all catalog tables
  - CREATE public INSERT/UPDATE policies for catalog management
*/

-- Vendors table
DROP POLICY IF EXISTS "Authenticated users can view vendors" ON vendors;
DROP POLICY IF EXISTS "Authenticated users can insert vendors" ON vendors;
DROP POLICY IF EXISTS "Authenticated users can update vendors" ON vendors;

CREATE POLICY "Public users can view vendors"
  ON vendors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public users can insert vendors"
  ON vendors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public users can update vendors"
  ON vendors FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Buyers table
DROP POLICY IF EXISTS "Authenticated users can view buyers" ON buyers;
DROP POLICY IF EXISTS "Authenticated users can insert buyers" ON buyers;
DROP POLICY IF EXISTS "Authenticated users can update buyers" ON buyers;

CREATE POLICY "Public users can view buyers"
  ON buyers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public users can insert buyers"
  ON buyers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public users can update buyers"
  ON buyers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Products table
DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;

CREATE POLICY "Public users can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public users can insert products"
  ON products FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public users can update products"
  ON products FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Countries table
DROP POLICY IF EXISTS "Authenticated users can view countries" ON countries;
DROP POLICY IF EXISTS "Authenticated users can insert countries" ON countries;

CREATE POLICY "Public users can view countries"
  ON countries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public users can insert countries"
  ON countries FOR INSERT
  TO public
  WITH CHECK (true);

-- Incoterms table
DROP POLICY IF EXISTS "Public users can view incoterms" ON incoterms;

CREATE POLICY "Public users can view incoterms v2"
  ON incoterms FOR SELECT
  TO public
  USING (true);

-- Market indices table
DROP POLICY IF EXISTS "Authenticated users can view market indices" ON market_indices;
DROP POLICY IF EXISTS "Authenticated users can insert market indices" ON market_indices;

CREATE POLICY "Public users can view market indices"
  ON market_indices FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public users can insert market indices"
  ON market_indices FOR INSERT
  TO public
  WITH CHECK (true);

-- Payment terms table
DROP POLICY IF EXISTS "Public users can view payment terms" ON payment_terms;

CREATE POLICY "Public users can view payment terms v2"
  ON payment_terms FOR SELECT
  TO public
  USING (true);

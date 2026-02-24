/*
  # Fix RLS Policies for Contract System

  1. Security Changes
    - Add public read/write policies for contracts and related tables
    - Enable operations without authentication for development
    
  2. Tables Affected
    - contracts
    - vendors
    - buyers
    - products
    - countries
    - incoterms
    - contract_payables
    - contract_processing
    - contract_refining_expenses
    - contract_penalties
    - contract_quotation_periods
    - payment_terms
    - manual_valuations
    - valuation_weights
    - valuation_prices
    - valuation_assays
    - valuation_assay_sensitivity
    - valuation_price_sensitivity
*/

-- Contracts
DROP POLICY IF EXISTS "Allow public read access to contracts" ON contracts;
DROP POLICY IF EXISTS "Allow public insert access to contracts" ON contracts;
DROP POLICY IF EXISTS "Allow public update access to contracts" ON contracts;

CREATE POLICY "Allow public read access to contracts"
  ON contracts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contracts"
  ON contracts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contracts"
  ON contracts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Vendors
DROP POLICY IF EXISTS "Allow public read access to vendors" ON vendors;
DROP POLICY IF EXISTS "Allow public insert access to vendors" ON vendors;
DROP POLICY IF EXISTS "Allow public update access to vendors" ON vendors;

CREATE POLICY "Allow public read access to vendors"
  ON vendors FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to vendors"
  ON vendors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to vendors"
  ON vendors FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Buyers
DROP POLICY IF EXISTS "Allow public read access to buyers" ON buyers;
DROP POLICY IF EXISTS "Allow public insert access to buyers" ON buyers;
DROP POLICY IF EXISTS "Allow public update access to buyers" ON buyers;

CREATE POLICY "Allow public read access to buyers"
  ON buyers FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to buyers"
  ON buyers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to buyers"
  ON buyers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow public insert access to products" ON products;
DROP POLICY IF EXISTS "Allow public update access to products" ON products;

CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Countries
DROP POLICY IF EXISTS "Allow public read access to countries" ON countries;
DROP POLICY IF EXISTS "Allow public insert access to countries" ON countries;

CREATE POLICY "Allow public read access to countries"
  ON countries FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to countries"
  ON countries FOR INSERT
  WITH CHECK (true);

-- Incoterms
DROP POLICY IF EXISTS "Allow public read access to incoterms" ON incoterms;

CREATE POLICY "Allow public read access to incoterms"
  ON incoterms FOR SELECT
  USING (true);

-- Contract Payables
DROP POLICY IF EXISTS "Allow public read access to contract_payables" ON contract_payables;
DROP POLICY IF EXISTS "Allow public insert access to contract_payables" ON contract_payables;
DROP POLICY IF EXISTS "Allow public update access to contract_payables" ON contract_payables;

CREATE POLICY "Allow public read access to contract_payables"
  ON contract_payables FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contract_payables"
  ON contract_payables FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_payables"
  ON contract_payables FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Contract Processing
DROP POLICY IF EXISTS "Allow public read access to contract_processing" ON contract_processing;
DROP POLICY IF EXISTS "Allow public insert access to contract_processing" ON contract_processing;
DROP POLICY IF EXISTS "Allow public update access to contract_processing" ON contract_processing;

CREATE POLICY "Allow public read access to contract_processing"
  ON contract_processing FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contract_processing"
  ON contract_processing FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_processing"
  ON contract_processing FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Contract Refining Expenses
DROP POLICY IF EXISTS "Allow public read access to contract_refining_expenses" ON contract_refining_expenses;
DROP POLICY IF EXISTS "Allow public insert access to contract_refining_expenses" ON contract_refining_expenses;
DROP POLICY IF EXISTS "Allow public update access to contract_refining_expenses" ON contract_refining_expenses;

CREATE POLICY "Allow public read access to contract_refining_expenses"
  ON contract_refining_expenses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contract_refining_expenses"
  ON contract_refining_expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_refining_expenses"
  ON contract_refining_expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Contract Penalties
DROP POLICY IF EXISTS "Allow public read access to contract_penalties" ON contract_penalties;
DROP POLICY IF EXISTS "Allow public insert access to contract_penalties" ON contract_penalties;
DROP POLICY IF EXISTS "Allow public update access to contract_penalties" ON contract_penalties;

CREATE POLICY "Allow public read access to contract_penalties"
  ON contract_penalties FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contract_penalties"
  ON contract_penalties FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_penalties"
  ON contract_penalties FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Contract Quotation Periods
DROP POLICY IF EXISTS "Allow public read access to contract_quotation_periods" ON contract_quotation_periods;
DROP POLICY IF EXISTS "Allow public insert access to contract_quotation_periods" ON contract_quotation_periods;
DROP POLICY IF EXISTS "Allow public update access to contract_quotation_periods" ON contract_quotation_periods;

CREATE POLICY "Allow public read access to contract_quotation_periods"
  ON contract_quotation_periods FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contract_quotation_periods"
  ON contract_quotation_periods FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_quotation_periods"
  ON contract_quotation_periods FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Payment Terms
DROP POLICY IF EXISTS "Allow public read access to payment_terms" ON payment_terms;
DROP POLICY IF EXISTS "Allow public insert access to payment_terms" ON payment_terms;
DROP POLICY IF EXISTS "Allow public update access to payment_terms" ON payment_terms;

CREATE POLICY "Allow public read access to payment_terms"
  ON payment_terms FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to payment_terms"
  ON payment_terms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to payment_terms"
  ON payment_terms FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Manual Valuations
DROP POLICY IF EXISTS "Allow public read access to manual_valuations" ON manual_valuations;
DROP POLICY IF EXISTS "Allow public insert access to manual_valuations" ON manual_valuations;
DROP POLICY IF EXISTS "Allow public update access to manual_valuations" ON manual_valuations;

CREATE POLICY "Allow public read access to manual_valuations"
  ON manual_valuations FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to manual_valuations"
  ON manual_valuations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to manual_valuations"
  ON manual_valuations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Valuation Weights
DROP POLICY IF EXISTS "Allow public read access to valuation_weights" ON valuation_weights;
DROP POLICY IF EXISTS "Allow public insert access to valuation_weights" ON valuation_weights;

CREATE POLICY "Allow public read access to valuation_weights"
  ON valuation_weights FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to valuation_weights"
  ON valuation_weights FOR INSERT
  WITH CHECK (true);

-- Valuation Prices
DROP POLICY IF EXISTS "Allow public read access to valuation_prices" ON valuation_prices;
DROP POLICY IF EXISTS "Allow public insert access to valuation_prices" ON valuation_prices;

CREATE POLICY "Allow public read access to valuation_prices"
  ON valuation_prices FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to valuation_prices"
  ON valuation_prices FOR INSERT
  WITH CHECK (true);

-- Valuation Assays
DROP POLICY IF EXISTS "Allow public read access to valuation_assays" ON valuation_assays;
DROP POLICY IF EXISTS "Allow public insert access to valuation_assays" ON valuation_assays;

CREATE POLICY "Allow public read access to valuation_assays"
  ON valuation_assays FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to valuation_assays"
  ON valuation_assays FOR INSERT
  WITH CHECK (true);

-- Valuation Assay Sensitivity
DROP POLICY IF EXISTS "Allow public read access to valuation_assay_sensitivity" ON valuation_assay_sensitivity;
DROP POLICY IF EXISTS "Allow public insert access to valuation_assay_sensitivity" ON valuation_assay_sensitivity;

CREATE POLICY "Allow public read access to valuation_assay_sensitivity"
  ON valuation_assay_sensitivity FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to valuation_assay_sensitivity"
  ON valuation_assay_sensitivity FOR INSERT
  WITH CHECK (true);

-- Valuation Price Sensitivity
DROP POLICY IF EXISTS "Allow public read access to valuation_price_sensitivity" ON valuation_price_sensitivity;
DROP POLICY IF EXISTS "Allow public insert access to valuation_price_sensitivity" ON valuation_price_sensitivity;

CREATE POLICY "Allow public read access to valuation_price_sensitivity"
  ON valuation_price_sensitivity FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to valuation_price_sensitivity"
  ON valuation_price_sensitivity FOR INSERT
  WITH CHECK (true);
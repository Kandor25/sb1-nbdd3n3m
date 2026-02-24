/*
  # Add Missing RLS Policies for Contract Quotas

  1. Security Changes
    - Add public read/write policies for contract_quotas table
    
  2. Tables Affected
    - contract_quotas
    - contract_quality_specs
*/

-- Contract Quotas
DROP POLICY IF EXISTS "Allow public read access to contract_quotas" ON contract_quotas;
DROP POLICY IF EXISTS "Allow public insert access to contract_quotas" ON contract_quotas;
DROP POLICY IF EXISTS "Allow public update access to contract_quotas" ON contract_quotas;

CREATE POLICY "Allow public read access to contract_quotas"
  ON contract_quotas FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contract_quotas"
  ON contract_quotas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_quotas"
  ON contract_quotas FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Contract Quality Specs
DROP POLICY IF EXISTS "Allow public read access to contract_quality_specs" ON contract_quality_specs;
DROP POLICY IF EXISTS "Allow public insert access to contract_quality_specs" ON contract_quality_specs;
DROP POLICY IF EXISTS "Allow public update access to contract_quality_specs" ON contract_quality_specs;

CREATE POLICY "Allow public read access to contract_quality_specs"
  ON contract_quality_specs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to contract_quality_specs"
  ON contract_quality_specs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_quality_specs"
  ON contract_quality_specs FOR UPDATE
  USING (true)
  WITH CHECK (true);
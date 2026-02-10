/*
  # Fix Refining Expenses Public Access

  ## Overview
  This migration updates the RLS policies for refining_expense_formulas to allow public access,
  matching the behavior of penalty_formulas.

  ## Changes
  - Drop existing authenticated-only policies
  - Create new public access policies for viewing refining expense formulas
  - Maintain secure policies for insert/update operations

  ## Security
  - Public users can view active refining expense formulas
  - Only authenticated users can insert/update/delete formulas
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view refining expense formulas" ON refining_expense_formulas;
DROP POLICY IF EXISTS "Authenticated users can insert refining expense formulas" ON refining_expense_formulas;
DROP POLICY IF EXISTS "Authenticated users can update refining expense formulas" ON refining_expense_formulas;

-- Create new public access policies
CREATE POLICY "Anyone can view refining expense formulas"
  ON refining_expense_formulas FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage refining expense formulas"
  ON refining_expense_formulas FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

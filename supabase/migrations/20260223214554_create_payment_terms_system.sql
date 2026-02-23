/*
  # Create Payment Terms System

  1. New Tables
    - `payment_terms`
      - `id` (uuid, primary key)
      - `contract_id` (uuid, foreign key to contracts)
      - `payment_type` (text) - 'provisional' or 'final'
      - `advance_percentage` (numeric) - for provisional payments
      - `known_elements` (text) - for final payments
      - `days_from_issuance` (integer) - days from issuance
      - `display_order` (integer) - order of display
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payment_terms` table
    - Add policies for public access (temporary, for development)
*/

-- Create payment_terms table
CREATE TABLE IF NOT EXISTS payment_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('provisional', 'final')),
  advance_percentage numeric CHECK (advance_percentage >= 0 AND advance_percentage <= 100),
  known_elements text,
  days_from_issuance integer NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_terms ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to payment_terms"
  ON payment_terms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to payment_terms"
  ON payment_terms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to payment_terms"
  ON payment_terms
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to payment_terms"
  ON payment_terms
  FOR DELETE
  TO public
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_terms_contract_id ON payment_terms(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_terms_display_order ON payment_terms(contract_id, display_order);
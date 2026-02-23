/*
  # Create Sampling Formulas System

  1. New Tables
    - `sampling_formulas`
      - `id` (uuid, primary key)
      - `name` (text) - Formula name (e.g., "SAMPLING", "AVERAGE", etc.)
      - `description` (text) - Formula description
      - `requires_incoterm` (boolean) - Whether this formula requires incoterm selection
      - `requires_reference` (boolean) - Whether this formula requires a text reference
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `sampling_formulas` table
    - Add policy for public read access (all users can view formulas)

  3. Initial Data
    - Insert SAMPLING formula that requires incoterm and reference
*/

-- Create sampling_formulas table
CREATE TABLE IF NOT EXISTS sampling_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  requires_incoterm boolean DEFAULT false,
  requires_reference boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sampling_formulas ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view sampling formulas"
  ON sampling_formulas
  FOR SELECT
  TO public
  USING (true);

-- Insert initial SAMPLING formula
INSERT INTO sampling_formulas (name, description, requires_incoterm, requires_reference)
VALUES 
  ('SAMPLING', 'Muestreo que requiere incoterm y referencia', true, true)
ON CONFLICT DO NOTHING;
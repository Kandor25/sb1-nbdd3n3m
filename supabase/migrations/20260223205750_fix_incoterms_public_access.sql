/*
  # Fix Incoterms Public Access

  ## Overview
  This migration updates the Row Level Security (RLS) policies for the incoterms table
  to allow public read access. Incoterms are reference data that should be accessible
  to all users without authentication.

  ## Changes
  1. Drop existing restrictive RLS policies
  2. Create new public access policy for SELECT operations
  3. Keep authenticated-only policies for INSERT, UPDATE, DELETE

  ## Security
  - SELECT: Public access (no authentication required)
  - INSERT/UPDATE/DELETE: Authenticated users only

  ## Notes
  - Incoterms are standard international trade terms and can be safely exposed publicly
  - This allows the application to load incoterms without requiring user authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view incoterms" ON incoterms;
DROP POLICY IF EXISTS "Authenticated users can insert incoterms" ON incoterms;

-- Create public read access policy
CREATE POLICY "Anyone can view incoterms"
  ON incoterms
  FOR SELECT
  USING (true);

-- Keep write operations restricted to authenticated users
CREATE POLICY "Authenticated users can insert incoterms"
  ON incoterms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update incoterms"
  ON incoterms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete incoterms"
  ON incoterms
  FOR DELETE
  TO authenticated
  USING (true);

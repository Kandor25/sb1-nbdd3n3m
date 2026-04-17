/*
  # Update Market Indices

  1. Changes
    - Rename "LBMA Gold PM (Final)" to "LBMA Gold PM"
    - Remove "LME Monthly Average"
    - Rename "LME Settlement" to "LME Cash Settlement"
    - Add new item "LBMA Gold AM/PM"

  2. Notes
    - LME Monthly Average is deleted only if no contracts reference it
    - Existing contracts referencing renamed indices are unaffected (same IDs)
*/

UPDATE market_indices
SET name = 'LBMA Gold PM'
WHERE code = 'LBMA_GOLD_PM';

DELETE FROM market_indices
WHERE code = 'LME_MONTHLY_AVERAGE';

UPDATE market_indices
SET name = 'LME Cash Settlement'
WHERE code = 'LME_SETTLEMENT';

INSERT INTO market_indices (code, name, description)
VALUES ('LBMA_GOLD_AM_PM', 'LBMA Gold AM/PM', NULL)
ON CONFLICT (code) DO NOTHING;

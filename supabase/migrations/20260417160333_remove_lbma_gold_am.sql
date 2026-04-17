/*
  # Remove LBMA Gold AM from market indices

  1. Changes
    - Delete "LBMA Gold AM" from market_indices table
*/

DELETE FROM market_indices
WHERE code = 'LBMA_GOLD_AM';

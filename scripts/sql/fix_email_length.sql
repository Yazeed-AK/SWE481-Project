-- Migration: Fix column size limits that cause long-email checkout failures
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Expand email column from VARCHAR(50) to VARCHAR(254)
--    RFC 5321 defines 254 as the maximum valid email address length
ALTER TABLE "customers" ALTER COLUMN "email" TYPE VARCHAR(254);

-- 2. Expand password column from VARCHAR(20) to VARCHAR(255)
--    Supabase Auth handles hashing, but the customers table stores a copy;
--    hashed passwords are much longer than 20 characters.
ALTER TABLE "customers" ALTER COLUMN "password" TYPE VARCHAR(255);

-- 3. Normalize existing emails to lowercase before deduplication
UPDATE "customers" SET "email" = LOWER("email") WHERE "email" != LOWER("email");

-- 4. Remove duplicate emails — keep only the row with the highest id per email
--    (i.e. the most recently registered duplicate)
DELETE FROM "customers"
WHERE id NOT IN (
  SELECT MAX(id)
  FROM "customers"
  GROUP BY LOWER("email")
);

-- 5. Add UNIQUE constraint on email (safe now that duplicates are removed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customers_email_key'
      AND conrelid = 'customers'::regclass
  ) THEN
    ALTER TABLE "customers" ADD CONSTRAINT customers_email_key UNIQUE ("email");
  END IF;
END
$$;

-- Verify: should show VARCHAR(254) and VARCHAR(255)
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'customers'
  AND column_name IN ('email', 'password');

-- Verify: should return 0 rows (no more duplicates)
SELECT LOWER("email"), COUNT(*)
FROM "customers"
GROUP BY LOWER("email")
HAVING COUNT(*) > 1;


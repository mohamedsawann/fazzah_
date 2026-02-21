-- Run this in Supabase SQL Editor to enable option & question images
-- Dashboard → SQL Editor → New query → paste and run
-- Then restart your dev server

-- 1. Add question image column (for question images)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Add new JSONB column for options (supports {text, image} objects)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS options_new JSONB DEFAULT '[]'::jsonb NOT NULL;

-- 3. Migrate existing options: TEXT[] -> JSONB
UPDATE questions q
SET options_new = COALESCE(
  (
    SELECT jsonb_agg(
      CASE 
        WHEN elem ~ '^\s*\{.*\}\s*$' THEN elem::jsonb
        ELSE jsonb_build_object('text', elem)
      END
    )
    FROM unnest(q.options) AS elem
  ),
  '[]'::jsonb
)
WHERE q.options IS NOT NULL;

-- 4. Swap columns
ALTER TABLE questions DROP COLUMN options;
ALTER TABLE questions RENAME COLUMN options_new TO options;

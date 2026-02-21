-- Run this in Supabase SQL Editor if you want to support question images
-- Dashboard → SQL Editor → New query

ALTER TABLE questions ADD COLUMN IF NOT EXISTS image TEXT;

-- Run this in Supabase SQL Editor to add question duration per game
-- Dashboard → SQL Editor → New query

ALTER TABLE games ADD COLUMN IF NOT EXISTS question_duration INTEGER NOT NULL DEFAULT 20;

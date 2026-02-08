-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Then set DATABASE_URL to your Supabase connection string (Settings → Database → Connection string → URI)

-- Games (create first; others reference it)
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(6) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  game_id VARCHAR NOT NULL REFERENCES games(id),
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  average_time INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  game_id VARCHAR NOT NULL REFERENCES games(id),
  text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  "order" INTEGER NOT NULL
);

-- Player answers
CREATE TABLE IF NOT EXISTS player_answers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id VARCHAR NOT NULL REFERENCES players(id),
  question_id VARCHAR NOT NULL REFERENCES questions(id),
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0
);

-- Site stats (single row)
CREATE TABLE IF NOT EXISTS site_stats (
  id VARCHAR PRIMARY KEY,
  visitors INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: insert default site_stats row if you use visitor tracking
INSERT INTO site_stats (id, visitors, updated_at)
VALUES ('main', 0, now())
ON CONFLICT (id) DO NOTHING;

-- Sin Jeem (سين جيم) game tables for Supabase
-- Run in Supabase SQL Editor after main schema

-- Categories (Arabic + English, optional icon)
CREATE TABLE IF NOT EXISTS sin_jeem_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions per category and difficulty (200 | 400 | 600)
CREATE TABLE IF NOT EXISTS sin_jeem_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES sin_jeem_categories(id) ON DELETE CASCADE,
  difficulty INTEGER NOT NULL CHECK (difficulty IN (200, 400, 600)),
  question_ar TEXT NOT NULL,
  question_en TEXT,
  answer_ar TEXT NOT NULL,
  answer_en TEXT,
  image_url TEXT,
  audio_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sin_jeem_questions_category ON sin_jeem_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_sin_jeem_questions_difficulty ON sin_jeem_questions(difficulty);

-- Optional: game sessions for QR viewer mode (temporary session ID)
CREATE TABLE IF NOT EXISTS sin_jeem_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code VARCHAR(8) NOT NULL UNIQUE,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  board_state JSONB NOT NULL,
  scores JSONB NOT NULL DEFAULT '{"team1":0,"team2":0}',
  current_question JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sin_jeem_sessions_code ON sin_jeem_sessions(session_code);

-- RLS: allow public read for categories and questions (game is free, no auth)
ALTER TABLE sin_jeem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sin_jeem_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sin_jeem_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sin_jeem_categories_read" ON sin_jeem_categories;
CREATE POLICY "sin_jeem_categories_read" ON sin_jeem_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "sin_jeem_questions_read" ON sin_jeem_questions;
CREATE POLICY "sin_jeem_questions_read" ON sin_jeem_questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "sin_jeem_questions_insert" ON sin_jeem_questions;
CREATE POLICY "sin_jeem_questions_insert" ON sin_jeem_questions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "sin_jeem_categories_insert" ON sin_jeem_categories;
CREATE POLICY "sin_jeem_categories_insert" ON sin_jeem_categories FOR INSERT WITH CHECK (true);

-- Sessions: allow anyone to read by session_code (for QR viewer) and insert/update for host
DROP POLICY IF EXISTS "sin_jeem_sessions_read" ON sin_jeem_sessions;
CREATE POLICY "sin_jeem_sessions_read" ON sin_jeem_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "sin_jeem_sessions_insert" ON sin_jeem_sessions;
CREATE POLICY "sin_jeem_sessions_insert" ON sin_jeem_sessions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "sin_jeem_sessions_update" ON sin_jeem_sessions;
CREATE POLICY "sin_jeem_sessions_update" ON sin_jeem_sessions FOR UPDATE USING (true);

-- Seed example category and question (run once)
INSERT INTO sin_jeem_categories (name_ar, name_en, icon)
SELECT 'مارفل', 'Marvel', '🎬'
WHERE NOT EXISTS (SELECT 1 FROM sin_jeem_categories WHERE name_ar = 'مارفل' LIMIT 1);

INSERT INTO sin_jeem_questions (category_id, difficulty, question_ar, question_en, answer_ar, answer_en)
SELECT c.id, 200,
  'من هو الشرير الرئيسي في فيلم Avengers Infinity War؟',
  'Who is the main villain in Avengers Infinity War?',
  'ثانوس', 'Thanos'
FROM sin_jeem_categories c
WHERE c.name_ar = 'مارفل'
  AND NOT EXISTS (SELECT 1 FROM sin_jeem_questions q JOIN sin_jeem_categories c2 ON q.category_id = c2.id WHERE c2.name_ar = 'مارفل' AND q.difficulty = 200)
LIMIT 1;

-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Enables Supabase Storage for game question and option images.
--
-- IMPORTANT: If images don't show when the game starts:
-- 1. Ensure the 'game-images' bucket is PUBLIC (Storage → game-images → Settings)
-- 2. Run supabase-migration-add-question-image.sql and supabase-migration-options-jsonb.sql
-- 3. Create a NEW game (games created before migrations won't have images)

-- Step 1: Create the bucket in Supabase Dashboard
-- Go to Storage → New bucket
--   Name: game-images
--   Public bucket: ON (so images can be displayed in the game)
--   File size limit: 5 MB (optional)
--   Allowed MIME types: image/png, image/jpeg, image/gif, image/webp (optional)

-- Step 2: Run the policy below (ensures public read access)
CREATE POLICY "Allow public read game-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-images');

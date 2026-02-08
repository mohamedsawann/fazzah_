# Deploying to Netlify

1. **Connect your repo** to Netlify. The build and publish settings are in `netlify.toml`.

2. **Set environment variables** in Netlify:
   - **Site settings** → **Environment variables** → **Add variable** (or **Import from .env**)
   - Add:
     - `SUPABASE_URL` = your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key

3. **Deploy.** Netlify will run `npm run build`, publish `dist/public`, and deploy the serverless function so `/api/*` works.

4. **SPA and API:**
   - `client/public/_redirects` sends `/api/*` to the serverless function and everything else to `index.html` (so routes like `/join-game` work).

No need to set `NODE_ENV`; the build produces both the static site and the API function.

# Deploying to Netlify

1. **Connect your repo** to Netlify. The build and publish settings are in `netlify.toml`.

2. **Set environment variables** in Netlify (required for the API function):
   - **Site settings** → **Environment variables** → **Add variable** → **Add a single variable**
   - Add:
     - `SUPABASE_URL` = your Supabase project URL (e.g. `https://xxxx.supabase.co`)
     - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase **service_role** key (from Supabase → Settings → API → Project API keys → `service_role`, not anon)
   - For each variable, set **Scope** to **All** (or at least “Production” and “Deploy previews”) so the serverless function can read them at runtime.
   - **Redeploy** after changing env vars (they apply only to new deploys).

3. **Deploy.** Netlify will run `npm run build`, publish `dist/public`, and deploy the serverless function so `/api/*` works.

4. **SPA and API:**
   - `client/public/_redirects` sends `/api/*` to the serverless function and everything else to `index.html` (so routes like `/join-game` work).

No need to set `NODE_ENV`; the build produces both the static site and the API function.

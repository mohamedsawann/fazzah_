# Supabase setup (API only)

The app uses **Supabase URL + API key** only (no PostgreSQL connection string).

1. **Create a project** at [supabase.com](https://supabase.com).

2. **Create the tables**  
   In the dashboard: **SQL Editor** → **New query** → paste the contents of `supabase-schema.sql` → **Run**.

3. **Get URL and API key**  
   **Settings** → **API**:
   - **Project URL** → use as `SUPABASE_URL`
   - **Project API keys** → **service_role** (secret) → use as `SUPABASE_SERVICE_ROLE_KEY`

4. **Set env vars** (e.g. in `.env` in the project root):

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Use the **service_role** key (not the anon key) so the server can read/write all tables. Keep it secret and only in server env.

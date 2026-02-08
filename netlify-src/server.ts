import "dotenv/config";
import serverless from "serverless-http";
import { createApp } from "../server/app";

let handler: ReturnType<typeof serverless> | null = null;
let initError: Error | null = null;

export default async (req: unknown, context: unknown) => {
  if (initError) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Server misconfiguration: " + initError.message,
        hint: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify → Site settings → Environment variables, then redeploy.",
      }),
    };
  }
  if (!handler) {
    try {
      const { app } = await createApp();
      handler = serverless(app);
    } catch (err) {
      initError = err instanceof Error ? err : new Error(String(err));
      return {
        statusCode: 503,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Server startup failed: " + initError.message,
          hint: "In Netlify set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use the service_role key from Supabase → Settings → API), then redeploy.",
        }),
      };
    }
  }
  return handler(req as Parameters<ReturnType<typeof serverless>>[0], context as Parameters<ReturnType<typeof serverless>>[1]);
};

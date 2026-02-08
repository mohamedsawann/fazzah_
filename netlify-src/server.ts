import "dotenv/config";
import serverless from "serverless-http";
import { createApp } from "../server/app";

let handler: ReturnType<typeof serverless> | null = null;
let initError: Error | null = null;

/** Convert Netlify Request to AWS Lambda-style event so serverless-http doesn't mutate a read-only Request */
async function requestToLambdaEvent(request: Request): Promise<Record<string, unknown>> {
  const url = new URL(request.url);
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    headers[k] = v;
  });
  let body: string | null = null;
  try {
    body = await request.text();
  } catch {
    body = null;
  }
  const queryStringParameters: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    queryStringParameters[k] = v;
  });
  return {
    path: url.pathname,
    httpMethod: request.method,
    headers,
    body: body || undefined,
    queryStringParameters: Object.keys(queryStringParameters).length ? queryStringParameters : undefined,
    isBase64Encoded: false,
  };
}

/** Convert Lambda result to Netlify Response */
function lambdaResultToResponse(result: { statusCode: number; headers?: Record<string, string>; body?: string }) {
  const headers = new Headers(result.headers as Record<string, string>);
  if (!headers.has("Content-Type") && result.body) {
    headers.set("Content-Type", "application/json");
  }
  return new Response(result.body ?? null, {
    status: result.statusCode,
    headers,
  });
}

export default async (request: Request, context: unknown) => {
  if (initError) {
    return new Response(
      JSON.stringify({
        message: "Server misconfiguration: " + initError.message,
        hint: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify → Site settings → Environment variables, then redeploy.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!handler) {
    try {
      const { app } = await createApp();
      handler = serverless(app);
    } catch (err) {
      initError = err instanceof Error ? err : new Error(String(err));
      return new Response(
        JSON.stringify({
          message: "Server startup failed: " + initError.message,
          hint: "In Netlify set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use the service_role key from Supabase → Settings → API), then redeploy.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  const event = await requestToLambdaEvent(request);
  const result = await handler(event, context as Record<string, unknown>);
  const r = result as { statusCode: number; headers?: Record<string, string>; body?: string };
  return lambdaResultToResponse(r);
};

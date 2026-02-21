import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

function log(message: string) {
  const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  console.log(`${t} [express] ${message}`);
}

/**
 * Creates the Express app with API routes only (no static, no listen).
 * Used by the main server (index.ts) and by the Netlify Function.
 */
export async function createApp(): Promise<{ app: express.Express; server: import("http").Server }> {
  const app = express();
  app.use(express.json({ limit: "10mb" })); // Allow larger payloads for image uploads
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalResJson = res.json.bind(res);
    res.json = function (bodyJson: unknown, ...args: unknown[]) {
      capturedJsonResponse = bodyJson as Record<string, unknown>;
      return originalResJson(bodyJson, ...args);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
        log(logLine);
      }
    });
    next();
  });

  const server = await registerRoutes(app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status ?? (err as { statusCode?: number }).statusCode ?? 500;
    const message = (err as Error).message ?? "Internal Server Error";
    res.status(status).json({ message });
  });

  return { app, server };
}

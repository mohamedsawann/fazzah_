import "dotenv/config";

// Suppress harmless PostCSS "from option" warning (from Tailwind/autoprefixer)
const orig = process.emitWarning;
process.emitWarning = function (msg: string | Error, ...args: unknown[]) {
  const text = typeof msg === "string" ? msg : (msg as Error).message ?? "";
  if (text.includes("PostCSS plugin") && text.includes("`from`")) return;
  return orig.apply(this, [msg, ...args] as Parameters<typeof process.emitWarning>);
};

import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  const { app, server } = await createApp();

  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "127.0.0.1";
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();

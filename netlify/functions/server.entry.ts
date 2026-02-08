import "dotenv/config";
import serverless from "serverless-http";
import { createApp } from "../../server/app";

let handler: ReturnType<typeof serverless> | null = null;

export default async (req: unknown, context: unknown) => {
  if (!handler) {
    const { app } = await createApp();
    handler = serverless(app);
  }
  return handler(req as Parameters<ReturnType<typeof serverless>>[0], context as Parameters<ReturnType<typeof serverless>>[1]);
};

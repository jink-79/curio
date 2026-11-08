import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import type { Env } from "./config/env.js";
import { AppError, errorHandler, notFound } from "./http/errors.js";
import { requestContext } from "./http/request-context.js";
import { healthRoutes } from "./modules/health/health.routes.js";

/** Builds the Express app. Pure: no listening, no connecting, so tests and Vercel share it. */
export function createApp(env: Env): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind Vercel's proxy: real client IP for rate limits later
  app.use(requestContext);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Same-origin and non-browser requests send no Origin header.
        if (!origin || env.CORS_ORIGINS.includes(origin)) cb(null, true);
        else cb(new AppError(403, "ORIGIN_NOT_ALLOWED", `Origin ${origin} is not allowed.`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (_req, res) => {
    res.json({ name: "curio-api", docs: "/api/v1/health" });
  });
  app.use("/api/v1/health", healthRoutes(env));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

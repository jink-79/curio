import { Router } from "express";
import type { Env } from "../../config/env.js";
import { dbStatus } from "../../db/connection.js";

/**
 * GET /api/v1/health
 * 200 when the server is up and the database is connected or not configured yet;
 * 503 when a database is configured but unreachable.
 */
export function healthRoutes(env: Env): Router {
  const router = Router();
  router.get("/", async (_req, res) => {
    const db = await dbStatus(env.MONGODB_URI);
    res.status(db === "unreachable" ? 503 : 200).json({
      status: db === "unreachable" ? "degraded" : "ok",
      db,
      environment: env.NODE_ENV,
      time: new Date().toISOString(),
    });
  });
  return router;
}

import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";

const app = createApp(loadEnv({ NODE_ENV: "test", CORS_ORIGINS: "https://curio.example" }));

afterAll(async () => {
  await mongoose.disconnect();
});

describe("health", () => {
  it("is ok with no database configured yet", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", db: "not_configured", environment: "test" });
  });

  it("reports degraded (503) when the configured database is unreachable", async () => {
    const broken = createApp(loadEnv({ NODE_ENV: "test", MONGODB_URI: "mongodb://127.0.0.1:1/curio" }));
    const res = await request(broken).get("/api/v1/health");
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ status: "degraded", db: "unreachable" });
  }, 15_000);
});

describe("error envelope", () => {
  it("returns NOT_FOUND with the request id for unknown routes", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: "NOT_FOUND" });
    expect(res.body.error.requestId).toBe(res.headers["x-request-id"]);
  });

  it("returns INVALID_JSON for a malformed body", async () => {
    const res = await request(app).post("/api/v1/anything").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("echoes a well-formed incoming request id and replaces a malformed one", async () => {
    const good = await request(app).get("/api/v1/health").set("X-Request-Id", "abc12345-trace");
    expect(good.headers["x-request-id"]).toBe("abc12345-trace");
    const bad = await request(app).get("/api/v1/health").set("X-Request-Id", "<script>");
    expect(bad.headers["x-request-id"]).not.toBe("<script>");
  });
});

describe("cors", () => {
  it("allows configured origins", async () => {
    const res = await request(app).get("/api/v1/health").set("Origin", "https://curio.example");
    expect(res.headers["access-control-allow-origin"]).toBe("https://curio.example");
  });

  it("rejects other origins with 403 ORIGIN_NOT_ALLOWED", async () => {
    const res = await request(app).get("/api/v1/health").set("Origin", "https://evil.example");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ORIGIN_NOT_ALLOWED");
  });
});

describe("security headers", () => {
  it("sets helmet headers and hides x-powered-by", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

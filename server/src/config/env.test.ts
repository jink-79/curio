import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

describe("loadEnv", () => {
  it("applies defaults", () => {
    const env = loadEnv({});
    expect(env).toMatchObject({ NODE_ENV: "development", PORT: 4000, CORS_ORIGINS: ["http://localhost:5173"] });
    expect(env.MONGODB_URI).toBeUndefined();
  });

  it("treats an empty MONGODB_URI as not configured", () => {
    expect(loadEnv({ MONGODB_URI: "  " }).MONGODB_URI).toBeUndefined();
  });

  it("splits CORS origins", () => {
    expect(loadEnv({ CORS_ORIGINS: "https://a.app, https://b.app ," }).CORS_ORIGINS).toEqual(["https://a.app", "https://b.app"]);
  });

  it("rejects bad values with a readable message", () => {
    expect(() => loadEnv({ MONGODB_URI: "postgres://x" })).toThrow(/MONGODB_URI: must start with mongodb/);
    expect(() => loadEnv({ PORT: "abc" })).toThrow(/PORT/);
    expect(() => loadEnv({ NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });
});

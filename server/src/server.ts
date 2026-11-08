import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";

// Local development entry point. On Vercel, api/index.ts is used instead.
const env = loadEnv();
createApp(env).listen(env.PORT, () => {
  console.log(`CURIO API on http://localhost:${env.PORT} (health: /api/v1/health, db: ${env.MONGODB_URI ? "configured" : "not configured"})`);
});

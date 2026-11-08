import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";

// Vercel serverless entry: vercel.json rewrites every path here, and the
// Express app does the routing. Env is validated once per cold start.
export default createApp(loadEnv());

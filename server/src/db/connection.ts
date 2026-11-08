import mongoose from "mongoose";

export type DbStatus = "not_configured" | "connected" | "unreachable";

/*
 * On Vercel each warm function instance reuses module state, so the
 * connection promise is cached here and shared across requests instead of
 * opening a new connection per request.
 */
let pending: Promise<typeof mongoose> | null = null;

export function connectDb(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!pending) {
    pending = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5_000,
        maxPoolSize: 5, // small pool: serverless instances are many and short-lived
      })
      .catch((err: unknown) => {
        pending = null; // let the next request retry
        throw err;
      });
  }
  return pending;
}

/** Connection state for the health check. Never throws. */
export async function dbStatus(uri: string | undefined): Promise<DbStatus> {
  if (!uri) return "not_configured";
  try {
    await connectDb(uri);
    await mongoose.connection.db?.admin().ping();
    return "connected";
  } catch {
    return "unreachable";
  }
}

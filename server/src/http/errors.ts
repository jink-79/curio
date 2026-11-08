import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

/**
 * Error envelope used by every endpoint (docs/07-api-spec.md §1):
 *   { "error": { "code", "message", "details"?, "requestId" } }
 */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", `No route for ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, _next) => {
  const requestId = res.locals.requestId as string | undefined;

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.details !== undefined ? { details: err.details } : {}), requestId },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "The request is invalid.",
        details: err.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
        requestId,
      },
    });
    return;
  }

  // Malformed JSON body from express.json().
  if (typeof err === "object" && err !== null && (err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "INVALID_JSON", message: "The request body is not valid JSON.", requestId } });
    return;
  }

  // Unknown failure: log the detail, never leak it to the client.
  console.error(JSON.stringify({ level: "error", requestId, method: req.method, path: req.originalUrl.split("?")[0], err: String(err), stack: (err as Error)?.stack }));
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong.", requestId } });
};

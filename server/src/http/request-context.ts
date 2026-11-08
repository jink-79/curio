import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

/** Gives every request an id (echoed in X-Request-Id and error bodies) and logs one line when it finishes. */
export const requestContext: RequestHandler = (req, res, next) => {
  const incoming = req.get("x-request-id");
  const requestId = incoming && /^[\w-]{8,64}$/.test(incoming) ? incoming : randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const started = performance.now();
  res.on("finish", () => {
    if (process.env.NODE_ENV === "test") return;
    console.log(
      JSON.stringify({
        level: "info",
        requestId,
        method: req.method,
        path: req.originalUrl.split("?")[0],
        status: res.statusCode,
        ms: Math.round(performance.now() - started),
      }),
    );
  });
  next();
};

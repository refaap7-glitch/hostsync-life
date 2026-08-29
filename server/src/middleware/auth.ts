import { NextFunction, Request, Response } from "express";
import { env } from "../lib/env";
import { verifyAuthToken } from "../lib/jwt";

declare global {
  // Standard pattern for augmenting Express's Request type.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Every request must come from our own Next.js server-side proxy, which
 * knows this shared secret. This keeps the Express API from being called
 * directly by arbitrary browser JS.
 */
export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  if (req.header("x-internal-key") !== env.internalApiKey) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }
  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

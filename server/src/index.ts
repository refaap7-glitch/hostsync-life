import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/error";
import { requireInternalKey } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { dashboardRouter } from "./routes/dashboard";
import { propertiesRouter } from "./routes/properties";
import { reservationsRouter } from "./routes/reservations";
import { messagesRouter } from "./routes/messages";
import { tasksRouter } from "./routes/tasks";
import { providersRouter } from "./routes/providers";
import { pricesRouter } from "./routes/prices";

if (!fs.existsSync(env.uploadsDir)) {
  fs.mkdirSync(env.uploadsDir, { recursive: true });
}

const app = express();

app.use(cors({ origin: env.webOrigin }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(env.uploadsDir)));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Every /api/* route requires the shared internal key, proving the request
// came from our own Next.js proxy rather than directly from a browser.
app.use("/api", requireInternalKey);

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/providers", providersRouter);
app.use("/api/prices", pricesRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`HostSync Lite server listening on :${env.port}`);
});

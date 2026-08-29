import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { taskNotificationAdapter } from "../adapters";
import { env } from "../lib/env";

export const tasksRouter = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadsDir,
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// --- host-authenticated endpoints --------------------------------------

tasksRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ reservation: { property: { userId: req.userId! } } }, { provider: { userId: req.userId! } }],
      },
      include: { reservation: { include: { property: true } }, provider: true },
      orderBy: { scheduledDate: "asc" },
    });
    return res.json({ tasks });
  }),
);

const createSchema = z.object({
  reservationId: z.string().optional(),
  providerId: z.string(),
  type: z.enum(["cleaning", "maintenance"]),
  scheduledDate: z.string(),
  notes: z.string().optional(),
});

tasksRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);

    const provider = await prisma.provider.findFirst({ where: { id: data.providerId, userId: req.userId! } });
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    let propertyName = "tu propiedad";
    if (data.reservationId) {
      const reservation = await prisma.reservation.findFirst({
        where: { id: data.reservationId, property: { userId: req.userId! } },
        include: { property: true },
      });
      if (!reservation) return res.status(404).json({ error: "Reservation not found" });
      propertyName = reservation.property.name;
    }

    const task = await prisma.task.create({
      data: {
        reservationId: data.reservationId,
        providerId: data.providerId,
        type: data.type,
        scheduledDate: new Date(data.scheduledDate),
        notes: data.notes,
      },
    });

    const completionLink = `${env.webOrigin}/provider/tasks/${task.id}?token=${task.accessToken}`;
    const notification = await taskNotificationAdapter.notifyProvider({
      providerName: provider.name,
      providerPhone: provider.phone,
      providerEmail: provider.email,
      taskType: data.type,
      propertyName,
      scheduledDate: new Date(data.scheduledDate).toLocaleDateString(),
      completionLink,
    });

    return res.status(201).json({ task, notification });
  }),
);

// --- public, token-gated provider endpoints -----------------------------

async function loadTaskByToken(taskId: string, token: string | undefined) {
  if (!token) return null;
  const task = await prisma.task.findFirst({
    where: { id: taskId, accessToken: token },
    include: { reservation: { include: { property: true } }, provider: true },
  });
  return task;
}

tasksRouter.get(
  "/:id/public",
  asyncHandler(async (req, res) => {
    const task = await loadTaskByToken(req.params.id, req.query.token as string | undefined);
    if (!task) return res.status(404).json({ error: "Task not found or invalid token" });
    return res.json({ task });
  }),
);

tasksRouter.put(
  "/:id/complete",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    const token = (req.query.token as string | undefined) ?? (req.body.token as string | undefined);
    const task = await loadTaskByToken(req.params.id, token);
    if (!task) return res.status(404).json({ error: "Task not found or invalid token" });

    const photoUrl = req.file ? `${env.publicUploadsUrl}/${req.file.filename}` : task.photoUrl;

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: { status: "completed", photoUrl },
    });

    return res.json({ task: updated });
  }),
);

tasksRouter.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const statusSchema = z.object({ status: z.enum(["pending", "in_progress", "completed"]) });
    const { status } = statusSchema.parse(req.body);

    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        OR: [{ reservation: { property: { userId: req.userId! } } }, { provider: { userId: req.userId! } }],
      },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const updated = await prisma.task.update({ where: { id: task.id }, data: { status } });
    return res.json({ task: updated });
  }),
);

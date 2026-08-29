import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

export const providersRouter = Router();
providersRouter.use(requireAuth);

providersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const providers = await prisma.provider.findMany({
      where: { userId: req.userId! },
      orderBy: { name: "asc" },
    });
    return res.json({ providers });
  }),
);

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
});

providersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const provider = await prisma.provider.create({ data: { ...data, userId: req.userId! } });
    return res.status(201).json({ provider });
  }),
);

const updateSchema = createSchema.partial().extend({ isActive: z.boolean().optional() });

providersRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.provider.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Provider not found" });

    const provider = await prisma.provider.update({ where: { id: req.params.id }, data });
    return res.json({ provider });
  }),
);

providersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.provider.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Provider not found" });

    await prisma.provider.delete({ where: { id: req.params.id } });
    return res.status(204).end();
  }),
);

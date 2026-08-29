import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";

export const propertiesRouter = Router();
propertiesRouter.use(requireAuth);

propertiesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const properties = await prisma.property.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ properties });
  }),
);

const createSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  platform: z.enum(["airbnb", "booking"]),
  platformId: z.string().optional(),
  maxGuests: z.number().int().positive(),
  basePrice: z.number().positive(),
});

propertiesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const property = await prisma.property.create({ data: { ...data, userId: req.userId! } });
    return res.status(201).json({ property });
  }),
);

const updateSchema = createSchema.partial();

propertiesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.property.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Property not found" });

    const property = await prisma.property.update({ where: { id: req.params.id }, data });
    return res.json({ property });
  }),
);

propertiesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.property.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Property not found" });

    await prisma.property.delete({ where: { id: req.params.id } });
    return res.status(204).end();
  }),
);

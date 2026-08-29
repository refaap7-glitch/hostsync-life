import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { generateSuggestionsForUser } from "../services/pricing";

export const pricesRouter = Router();
pricesRouter.use(requireAuth);

pricesRouter.get(
  "/suggestions",
  asyncHandler(async (req, res) => {
    const fresh = await generateSuggestionsForUser(req.userId!);

    const pending = await prisma.priceSuggestion.findMany({
      where: { property: { userId: req.userId! }, acceptedAt: null },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ suggestions: pending, newlyGenerated: fresh.length });
  }),
);

const acceptSchema = z.object({ suggestionId: z.string() });

pricesRouter.post(
  "/accept",
  asyncHandler(async (req, res) => {
    const { suggestionId } = acceptSchema.parse(req.body);

    const suggestion = await prisma.priceSuggestion.findFirst({
      where: { id: suggestionId, property: { userId: req.userId! } },
    });
    if (!suggestion) return res.status(404).json({ error: "Suggestion not found" });

    const [, updatedSuggestion] = await prisma.$transaction([
      prisma.property.update({
        where: { id: suggestion.propertyId },
        data: { basePrice: suggestion.suggestedPrice },
      }),
      prisma.priceSuggestion.update({
        where: { id: suggestion.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return res.json({ suggestion: updatedSuggestion });
  }),
);

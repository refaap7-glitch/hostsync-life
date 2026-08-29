import { prisma } from "../lib/prisma";
import { getPropertyOccupancy } from "./occupancy";

const HIGH_OCCUPANCY_THRESHOLD = 0.8;
const LOW_OCCUPANCY_THRESHOLD = 0.3;
const ADJUSTMENT_PCT = 0.1;

/**
 * Spec's simple pricing rule: occupancy > 80% -> suggest +10%,
 * occupancy < 30% -> suggest -10%, otherwise no suggestion.
 * Persists a new suggestion row and returns it (or null if none applies).
 */
export async function generatePriceSuggestion(propertyId: string) {
  const property = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
  const now = new Date();
  const occupancy = await getPropertyOccupancy(propertyId, now.getUTCFullYear(), now.getUTCMonth());
  const currentPrice = Number(property.basePrice);

  let direction: "up" | "down" | null = null;
  if (occupancy > HIGH_OCCUPANCY_THRESHOLD) direction = "up";
  else if (occupancy < LOW_OCCUPANCY_THRESHOLD) direction = "down";

  if (!direction) return null;

  const suggestedPrice =
    direction === "up" ? currentPrice * (1 + ADJUSTMENT_PCT) : currentPrice * (1 - ADJUSTMENT_PCT);
  const reason =
    direction === "up"
      ? `Ocupacion del ${Math.round(occupancy * 100)}% este mes (>80%): se sugiere subir el precio un 10%.`
      : `Ocupacion del ${Math.round(occupancy * 100)}% este mes (<30%): se sugiere bajar el precio un 10%.`;

  return prisma.priceSuggestion.create({
    data: {
      propertyId,
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      currentPrice,
      reason,
    },
  });
}

export async function generateSuggestionsForUser(userId: string) {
  const properties = await prisma.property.findMany({ where: { userId } });
  const results = [];
  for (const property of properties) {
    const suggestion = await generatePriceSuggestion(property.id);
    if (suggestion) results.push(suggestion);
  }
  return results;
}

import { prisma } from "../lib/prisma";

/**
 * Occupancy for a single property in a given month: booked nights (from
 * confirmed/completed reservations overlapping the month) / days in month.
 */
export async function getPropertyOccupancy(propertyId: string, year: number, month: number): Promise<number> {
  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 1));
  const daysInMonth = (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24);

  const reservations = await prisma.reservation.findMany({
    where: {
      propertyId,
      status: { in: ["confirmed", "completed"] },
      checkIn: { lt: monthEnd },
      checkOut: { gt: monthStart },
    },
    select: { checkIn: true, checkOut: true },
  });

  let bookedNights = 0;
  for (const r of reservations) {
    const start = r.checkIn < monthStart ? monthStart : r.checkIn;
    const end = r.checkOut > monthEnd ? monthEnd : r.checkOut;
    bookedNights += Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  return Math.min(1, bookedNights / daysInMonth);
}

async function getUserOccupancyForMonth(userId: string, year: number, month: number): Promise<number> {
  const properties = await prisma.property.findMany({ where: { userId }, select: { id: true } });
  if (properties.length === 0) return 0;

  const occupancies = await Promise.all(properties.map((p) => getPropertyOccupancy(p.id, year, month)));
  return occupancies.reduce((sum, o) => sum + o, 0) / occupancies.length;
}

/** Portfolio-wide occupancy for the current month, used on the dashboard. */
export async function getUserOccupancyThisMonth(userId: string): Promise<number> {
  const now = new Date();
  return getUserOccupancyForMonth(userId, now.getUTCFullYear(), now.getUTCMonth());
}

/** Last N months (oldest first) of portfolio-wide occupancy, for the dashboard chart. */
export async function getUserOccupancyTrend(userId: string, months = 6) {
  const now = new Date();
  const points = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const occupancy = await getUserOccupancyForMonth(userId, d.getUTCFullYear(), d.getUTCMonth());
    points.push({
      month: d.toLocaleString("es-AR", { month: "short", timeZone: "UTC" }),
      occupancy: Math.round(occupancy * 100),
    });
  }
  return points;
}

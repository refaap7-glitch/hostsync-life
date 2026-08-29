import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { getUserOccupancyThisMonth, getUserOccupancyTrend } from "../services/occupancy";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [upcomingReservations, pendingTasks, occupancy, occupancyTrend] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          property: { userId },
          checkIn: { gte: now, lte: in7Days },
          status: { not: "cancelled" },
        },
        include: { property: true },
        orderBy: { checkIn: "asc" },
      }),
      prisma.task.findMany({
        where: {
          status: { in: ["pending", "in_progress"] },
          OR: [{ reservation: { property: { userId } } }, { provider: { userId } }],
        },
        include: { reservation: { include: { property: true } }, provider: true },
        orderBy: { scheduledDate: "asc" },
      }),
      getUserOccupancyThisMonth(userId),
      getUserOccupancyTrend(userId),
    ]);

    return res.json({
      upcomingReservations,
      pendingTasks,
      occupancyThisMonth: occupancy,
      occupancyTrend,
    });
  }),
);

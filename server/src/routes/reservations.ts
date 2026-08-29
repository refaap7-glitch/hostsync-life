import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { channelAdapters } from "../adapters";

export const reservationsRouter = Router();
reservationsRouter.use(requireAuth);

reservationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const reservations = await prisma.reservation.findMany({
      where: { property: { userId: req.userId! } },
      include: { property: true, messages: { orderBy: { sentAt: "desc" } } },
      orderBy: { checkIn: "desc" },
    });
    return res.json({ reservations });
  }),
);

reservationsRouter.post(
  "/sync",
  asyncHandler(async (req, res) => {
    const properties = await prisma.property.findMany({ where: { userId: req.userId! } });
    const byPlatform: Record<"airbnb" | "booking", typeof properties> = { airbnb: [], booking: [] };
    for (const p of properties) byPlatform[p.platform].push(p);

    let created = 0;
    for (const platform of ["airbnb", "booking"] as const) {
      const props = byPlatform[platform];
      if (props.length === 0) continue;

      const remoteReservations = await channelAdapters[platform].syncReservations(
        props.map((p) => p.platformId || p.id),
      );

      for (const remote of remoteReservations) {
        const property = props.find((p) => (p.platformId || p.id) === remote.propertyPlatformId);
        if (!property) continue;

        const result = await prisma.reservation.upsert({
          where: { platformReservationId: remote.platformReservationId },
          update: {
            guestName: remote.guestName,
            guestPhone: remote.guestPhone,
            checkIn: new Date(remote.checkIn),
            checkOut: new Date(remote.checkOut),
          },
          create: {
            propertyId: property.id,
            guestName: remote.guestName,
            guestPhone: remote.guestPhone,
            checkIn: new Date(remote.checkIn),
            checkOut: new Date(remote.checkOut),
            platform,
            platformReservationId: remote.platformReservationId,
          },
        });
        if (result) created += 1;
      }
    }

    return res.json({ synced: created });
  }),
);

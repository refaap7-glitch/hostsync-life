import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { messagingAdapter } from "../adapters";

export const messagesRouter = Router();
messagesRouter.use(requireAuth);

const sendSchema = z.object({
  reservationId: z.string(),
  template: z.enum(["checkin", "checkout", "reminder"]),
});

messagesRouter.post(
  "/send",
  asyncHandler(async (req, res) => {
    const { reservationId, template } = sendSchema.parse(req.body);

    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, property: { userId: req.userId! } },
      include: { property: true },
    });
    if (!reservation) return res.status(404).json({ error: "Reservation not found" });

    const result = await messagingAdapter.sendTemplate(reservation.guestPhone, template, {
      guest_name: reservation.guestName,
      property_name: reservation.property.name,
      check_in: reservation.checkIn.toLocaleDateString(),
      check_out: reservation.checkOut.toLocaleDateString(),
    });

    const message = await prisma.message.create({
      data: { reservationId, template, status: result.status },
    });

    return res.status(201).json({ message, deliveryError: result.error });
  }),
);

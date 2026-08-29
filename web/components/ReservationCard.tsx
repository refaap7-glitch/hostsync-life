import { Calendar, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageComposerModal } from "@/components/MessageComposerModal";
import type { Reservation } from "@/lib/types";

const STATUS_VARIANT = {
  confirmed: "success",
  completed: "neutral",
  cancelled: "destructive",
} as const;

const PLATFORM_LABEL = { airbnb: "Airbnb", booking: "Booking.com" };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function ReservationCard({ reservation }: { reservation: Reservation }) {
  const lastMessage = reservation.messages?.[0];

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{reservation.guestName}</p>
            <p className="truncate text-sm text-gray-500">{reservation.property?.name}</p>
          </div>
          <Badge variant={STATUS_VARIANT[reservation.status]} className="shrink-0">{reservation.status}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users2 className="h-4 w-4 text-gray-400" />
            {PLATFORM_LABEL[reservation.platform]}
          </span>
        </div>

        {lastMessage && (
          <p className="text-xs text-gray-400">
            Ultimo mensaje: {lastMessage.template} ({lastMessage.status === "sent" ? "enviado" : "fallido"})
          </p>
        )}

        <div className="flex justify-end">
          <MessageComposerModal reservation={reservation} />
        </div>
      </CardContent>
    </Card>
  );
}

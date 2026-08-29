"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSendMessage } from "@/lib/api";
import type { Reservation } from "@/lib/types";

const TEMPLATE_LABELS: Record<string, string> = {
  checkin: "Check-in",
  checkout: "Check-out",
  reminder: "Recordatorio",
};

const TEMPLATE_PREVIEWS: Record<string, (r: Reservation) => string> = {
  checkin: (r) => `Hola ${r.guestName}! Tu check-in en ${r.property?.name ?? "la propiedad"} es el ${new Date(r.checkIn).toLocaleDateString()}.`,
  checkout: (r) => `Hola ${r.guestName}, gracias por tu estadia. El check-out es el ${new Date(r.checkOut).toLocaleDateString()}.`,
  reminder: (r) => `Hola ${r.guestName}, te recordamos tu reserva en ${r.property?.name ?? "la propiedad"}.`,
};

export function MessageComposerModal({ reservation }: { reservation: Reservation }) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<"checkin" | "checkout" | "reminder">("checkin");
  const sendMessage = useSendMessage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4" />
          Mensaje
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar mensaje a {reservation.guestName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="template">Plantilla</Label>
            <Select
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value as typeof template)}
            >
              {Object.entries(TEMPLATE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
            {TEMPLATE_PREVIEWS[template](reservation)}
          </div>

          <Button
            disabled={sendMessage.isPending}
            onClick={() =>
              sendMessage.mutate(
                { reservationId: reservation.id, template },
                { onSuccess: () => setOpen(false) },
              )
            }
          >
            {sendMessage.isPending ? "Enviando..." : "Enviar por WhatsApp"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

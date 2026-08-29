"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCreateTask, useProviders, useReservations } from "@/lib/api";

export function TaskAssignModal() {
  const [open, setOpen] = useState(false);
  const [reservationId, setReservationId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [type, setType] = useState<"cleaning" | "maintenance">("cleaning");
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const { data: providersData } = useProviders();
  const { data: reservationsData } = useReservations();
  const createTask = useCreateTask();

  const providers = providersData?.providers.filter((p) => p.isActive) ?? [];
  const reservations = reservationsData?.reservations ?? [];

  function reset() {
    setReservationId("");
    setProviderId("");
    setType("cleaning");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId) return;
    createTask.mutate(
      { reservationId: reservationId || undefined, providerId, type, scheduledDate, notes: notes || undefined },
      { onSuccess: () => { setOpen(false); reset(); } },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Asignar tarea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar tarea a un proveedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="reservation">Reserva (opcional)</Label>
            <Select id="reservation" value={reservationId} onChange={(e) => setReservationId(e.target.value)}>
              <option value="">Sin reserva asociada</option>
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.property?.name} - {r.guestName}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="provider">Proveedor</Label>
            <Select id="provider" value={providerId} onChange={(e) => setProviderId(e.target.value)} required>
              <option value="">Elegi un proveedor</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Tipo de tarea</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="cleaning">Limpieza</option>
              <option value="maintenance">Mantenimiento</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <Button type="submit" disabled={createTask.isPending || !providerId}>
            {createTask.isPending ? "Asignando..." : "Asignar y notificar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

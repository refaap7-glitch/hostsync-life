"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationCard } from "@/components/ReservationCard";
import { EmptyState } from "@/components/EmptyState";
import { CardListSkeleton } from "@/components/Skeletons";
import { useReservations, useSyncReservations } from "@/lib/api";

export default function ReservationsPage() {
  const { data, isLoading } = useReservations();
  const sync = useSyncReservations();
  const reservations = data?.reservations ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Reservas</h1>
          <p className="text-sm text-gray-500">Airbnb y Booking.com, sincronizadas en un solo lugar.</p>
        </div>
        <Button variant="outline" size="sm" disabled={sync.isPending} onClick={() => sync.mutate()}>
          <RefreshCw className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} />
          Sincronizar
        </Button>
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : reservations.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Todavia no hay reservas"
          description="Toca Sincronizar para traer las reservas de tus propiedades conectadas."
        />
      )}
    </div>
  );
}

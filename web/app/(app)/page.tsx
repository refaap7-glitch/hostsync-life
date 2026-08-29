"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationCard } from "@/components/ReservationCard";
import { TaskCard } from "@/components/TaskCard";
import { OccupancyChart } from "@/components/OccupancyChart";
import { EmptyState } from "@/components/EmptyState";
import { CardListSkeleton } from "@/components/Skeletons";
import { useDashboard } from "@/lib/api";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-gray-500">Un vistazo rapido a tus proximos dias.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ocupacion (ultimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="h-[220px] animate-pulse rounded-md bg-gray-100" />
          ) : (
            <OccupancyChart data={data.occupancyTrend} />
          )}
          <p className="mt-2 text-sm text-gray-500">
            Ocupacion de este mes: <span className="font-medium text-foreground">{Math.round((data?.occupancyThisMonth ?? 0) * 100)}%</span>
          </p>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Reservas proximas (7 dias)</h2>
        {isLoading ? (
          <CardListSkeleton />
        ) : data && data.upcomingReservations.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {data.upcomingReservations.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        ) : (
          <EmptyState title="Sin reservas proximas" description="Las reservas que empiecen en los proximos 7 dias van a aparecer aca." />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Tareas pendientes</h2>
        {isLoading ? (
          <CardListSkeleton />
        ) : data && data.pendingTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {data.pendingTasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        ) : (
          <EmptyState title="No hay tareas pendientes" description="Asigna tareas de limpieza o mantenimiento desde la seccion Tareas." />
        )}
      </section>
    </div>
  );
}

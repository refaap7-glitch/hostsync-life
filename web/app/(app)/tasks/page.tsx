"use client";

import { TaskCard } from "@/components/TaskCard";
import { TaskAssignModal } from "@/components/TaskAssignModal";
import { EmptyState } from "@/components/EmptyState";
import { CardListSkeleton } from "@/components/Skeletons";
import { useTasks } from "@/lib/api";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "pending", label: "Pendientes" },
  { status: "in_progress", label: "En progreso" },
  { status: "completed", label: "Completadas" },
];

export default function TasksPage() {
  const { data, isLoading } = useTasks();
  const tasks = data?.tasks ?? [];

  const byStatus = (status: TaskStatus): Task[] => tasks.filter((t) => t.status === status);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Tareas</h1>
          <p className="text-sm text-gray-500">Limpieza y mantenimiento con tus proveedores.</p>
        </div>
        <TaskAssignModal />
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : tasks.length === 0 ? (
        <EmptyState title="No hay tareas todavia" description="Asigna una tarea de limpieza o mantenimiento a un proveedor." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.status} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-gray-500">
                {col.label} ({byStatus(col.status).length})
              </h2>
              <div className="flex flex-col gap-3">
                {byStatus(col.status).map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

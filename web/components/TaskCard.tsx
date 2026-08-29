import { CalendarClock, Wrench, Sparkles, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useUpdateTaskStatus } from "@/lib/api";
import type { Task, TaskStatus } from "@/lib/types";

const STATUS_VARIANT: Record<TaskStatus, "warning" | "default" | "success"> = {
  pending: "warning",
  in_progress: "default",
  completed: "success",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
};

export function TaskCard({ task }: { task: Task }) {
  const updateStatus = useUpdateTaskStatus();
  const Icon = task.type === "cleaning" ? Sparkles : Wrench;
  const completionLink = `/provider/tasks/${task.id}?token=${task.accessToken}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold capitalize text-foreground">{task.type}</p>
              <p className="truncate text-sm text-gray-500">{task.reservation?.property?.name ?? "Sin propiedad asociada"}</p>
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[task.status]} className="shrink-0">{STATUS_LABEL[task.status]}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-gray-400" />
            {new Date(task.scheduledDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
          </span>
          <span>{task.provider?.name}</span>
        </div>

        {task.notes && <p className="text-sm text-gray-500">{task.notes}</p>}

        {task.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={task.photoUrl} alt="Foto de la tarea completada" className="h-32 w-full rounded-md object-cover" />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <a
            href={completionLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 py-1 text-xs text-primary hover:underline"
          >
            <Link2 className="h-3 w-3 shrink-0" />
            Link para el proveedor
          </a>

          <Select
            className="h-9 w-auto text-xs"
            value={task.status}
            onChange={(e) => updateStatus.mutate({ id: task.id, status: e.target.value as TaskStatus })}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completada</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

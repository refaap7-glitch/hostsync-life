"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Sparkles, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PublicTask {
  id: string;
  type: "cleaning" | "maintenance";
  status: "pending" | "in_progress" | "completed";
  scheduledDate: string;
  notes: string | null;
  photoUrl: string | null;
  provider?: { name: string } | null;
  reservation?: { property?: { name: string; address: string } | null } | null;
}

export default function ProviderTaskPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [task, setTask] = useState<PublicTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/tasks/${params.id}/public?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        setError("No encontramos esta tarea, o el link ya no es valido.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTask(data.task);
      setLoading(false);
    }
    load();
  }, [params.id, token]);

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    if (photo) formData.append("photo", photo);

    const res = await fetch(`/api/tasks/${params.id}/complete?token=${encodeURIComponent(token)}`, {
      method: "PUT",
      body: formData,
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error("No se pudo marcar la tarea como completada");
      return;
    }
    const data = await res.json();
    setTask(data.task);
    toast.success("Tarea marcada como completada");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary" />
          <span className="text-xl font-semibold text-foreground">HostSync Lite</span>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">Cargando tarea...</CardContent>
          </Card>
        ) : error || !task ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-red-600">{error}</CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {task.type === "cleaning" ? <Sparkles className="h-5 w-5 text-primary" /> : <Wrench className="h-5 w-5 text-primary" />}
                <CardTitle className="capitalize">{task.type}</CardTitle>
                <Badge variant={task.status === "completed" ? "success" : "warning"}>{task.status}</Badge>
              </div>
              <CardDescription>{task.reservation?.property?.name ?? "Propiedad"}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">{task.reservation?.property?.address}</p>
              <p className="text-sm text-gray-600">
                Fecha: {new Date(task.scheduledDate).toLocaleDateString("es-AR")}
              </p>
              {task.notes && <p className="text-sm text-gray-600">Notas: {task.notes}</p>}

              {task.status === "completed" ? (
                <div className="flex flex-col items-center gap-2 rounded-md bg-secondary/10 p-4 text-secondary">
                  <CheckCircle2 className="h-6 w-6" />
                  <p className="text-sm font-medium">Tarea completada, gracias!</p>
                  {task.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={task.photoUrl} alt="Foto de la tarea" className="mt-2 h-40 w-full rounded-md object-cover" />
                  )}
                </div>
              ) : (
                <form onSubmit={handleComplete} className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-foreground" htmlFor="photo">
                    Foto (opcional)
                  </label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    className="text-sm"
                  />
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Enviando..." : "Marcar como completada"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { GridSkeleton } from "@/components/Skeletons";
import { useCreateProvider, useDeleteProvider, useProviders, useUpdateProvider } from "@/lib/api";

export default function ProvidersPage() {
  const { data, isLoading } = useProviders();
  const providers = data?.providers ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Proveedores</h1>
          <p className="text-sm text-gray-500">Equipos de limpieza y mantenimiento.</p>
        </div>
        <AddProviderModal />
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : providers.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      ) : (
        <EmptyState title="No hay proveedores" description="Agrega un proveedor para poder asignarle tareas." />
      )}
    </div>
  );
}

function ProviderCard({ provider }: { provider: { id: string; name: string; phone: string; email: string | null; isActive: boolean } }) {
  const update = useUpdateProvider();
  const remove = useDeleteProvider();

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate font-semibold text-foreground">{provider.name}</p>
          <Badge variant={provider.isActive ? "success" : "neutral"} className="shrink-0">{provider.isActive ? "Activo" : "Inactivo"}</Badge>
        </div>
        <p className="truncate text-sm text-gray-500">{provider.phone}</p>
        {provider.email && <p className="truncate text-sm text-gray-500">{provider.email}</p>}
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => update.mutate({ id: provider.id, data: { isActive: !provider.isActive } })}
          >
            {provider.isActive ? "Desactivar" : "Activar"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => remove.mutate(provider.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddProviderModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const create = useCreateProvider();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      { name, phone, email: email || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setPhone("");
          setEmail("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="p-name">Nombre</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="p-phone">Telefono (WhatsApp)</Label>
            <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+549..." required />
          </div>
          <div>
            <Label htmlFor="p-email">Email (opcional)</Label>
            <Input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Guardando..." : "Guardar proveedor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

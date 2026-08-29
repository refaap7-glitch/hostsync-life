"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PriceSuggestionCard } from "@/components/PriceSuggestionCard";
import { EmptyState } from "@/components/EmptyState";
import { GridSkeleton } from "@/components/Skeletons";
import { useCreateProperty, usePriceSuggestions, useProperties } from "@/lib/api";

export default function PropertiesPage() {
  const { data, isLoading } = useProperties();
  const { data: suggestionsData } = usePriceSuggestions();
  const properties = data?.properties ?? [];
  const suggestions = suggestionsData?.suggestions ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Propiedades</h1>
          <p className="text-sm text-gray-500">Tu portfolio y sugerencias de precio.</p>
        </div>
        <AddPropertyModal />
      </div>

      {suggestions.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-foreground">Sugerencias de precio</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {suggestions.map((s) => (
              <PriceSuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Todas las propiedades</h2>
        {isLoading ? (
          <GridSkeleton />
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-1 p-4">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.address}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-500">{p.platform}</span>
                    <span className="font-semibold text-foreground">${Number(p.basePrice).toFixed(0)}/noche</span>
                  </div>
                  <p className="text-xs text-gray-400">Hasta {p.maxGuests} huespedes</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Todavia no cargaste propiedades" description="Agrega tu primera propiedad para empezar a recibir reservas." />
        )}
      </section>
    </div>
  );
}

function AddPropertyModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [platform, setPlatform] = useState<"airbnb" | "booking">("airbnb");
  const [maxGuests, setMaxGuests] = useState(2);
  const [basePrice, setBasePrice] = useState(50);
  const create = useCreateProperty();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      { name, address, platform, maxGuests, basePrice },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setAddress("");
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
          <DialogTitle>Nueva propiedad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="prop-name">Nombre</Label>
            <Input id="prop-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="prop-address">Direccion</Label>
            <Input id="prop-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="prop-platform">Plataforma</Label>
            <Select id="prop-platform" value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)}>
              <option value="airbnb">Airbnb</option>
              <option value="booking">Booking.com</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prop-guests">Huespedes max.</Label>
              <Input
                id="prop-guests"
                type="number"
                min={1}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="prop-price">Precio/noche</Label>
              <Input
                id="prop-price"
                type="number"
                min={1}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Guardando..." : "Guardar propiedad"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

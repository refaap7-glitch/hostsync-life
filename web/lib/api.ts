"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type {
  DashboardData,
  PriceSuggestion,
  Property,
  Provider,
  Reservation,
  Task,
  TaskStatus,
} from "./types";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- dashboard -----------------------------------------------------------

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardData>("/api/dashboard"),
    refetchInterval: 30_000,
  });
}

// --- properties ------------------------------------------------------------

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch<{ properties: Property[] }>("/api/properties"),
  });
}

export interface CreatePropertyInput {
  name: string;
  address: string;
  platform: "airbnb" | "booking";
  maxGuests: number;
  basePrice: number;
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePropertyInput) =>
      apiFetch<{ property: Property }>("/api/properties", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Propiedad creada");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      apiFetch<{ property: Property }>(`/api/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["priceSuggestions"] });
      toast.success("Propiedad actualizada");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/properties/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Propiedad eliminada");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// --- reservations ----------------------------------------------------------

export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: () => apiFetch<{ reservations: Reservation[] }>("/api/reservations"),
  });
}

export function useSyncReservations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ synced: number }>("/api/reservations/sync", { method: "POST" }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Sincronizadas ${data.synced} reservas`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { reservationId: string; template: "checkin" | "checkout" | "reminder" }) =>
      apiFetch<{ message: { status: string } }>("/api/messages/send", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      if (data.message.status === "sent") toast.success("Mensaje enviado");
      else toast.error("El mensaje no pudo enviarse (simulado)");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// --- providers ---------------------------------------------------------

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: () => apiFetch<{ providers: Provider[] }>("/api/providers"),
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Provider>) =>
      apiFetch<{ provider: Provider }>("/api/providers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Proveedor agregado");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Provider> }) =>
      apiFetch<{ provider: Provider }>(`/api/providers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Proveedor actualizado");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/providers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Proveedor eliminado");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// --- tasks -----------------------------------------------------------------

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<{ tasks: Task[] }>("/api/tasks"),
    refetchInterval: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { reservationId?: string; providerId: string; type: string; scheduledDate: string; notes?: string }) =>
      apiFetch<{ task: Task }>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Tarea asignada, proveedor notificado (simulado)");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      apiFetch<{ task: Task }>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// --- prices ------------------------------------------------------------

export function usePriceSuggestions() {
  return useQuery({
    queryKey: ["priceSuggestions"],
    queryFn: () => apiFetch<{ suggestions: PriceSuggestion[] }>("/api/prices/suggestions"),
  });
}

export function useAcceptPriceSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) =>
      apiFetch<{ suggestion: PriceSuggestion }>("/api/prices/accept", {
        method: "POST",
        body: JSON.stringify({ suggestionId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["priceSuggestions"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Precio actualizado");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

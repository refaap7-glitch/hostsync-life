import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

/** Server-side fetch to the Express backend, always carrying the internal key
 * plus the signed-in user's bearer token (when there is a session). */
export async function backendFetch(path: string, init: RequestInit = {}) {
  const session = await getServerSession(authOptions);
  const headers = new Headers(init.headers);
  headers.set("x-internal-key", INTERNAL_API_KEY);
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
}

/** Thin JSON proxy: forwards method + body to Express and mirrors the response back. */
export async function proxyJson(request: NextRequest, backendPath: string) {
  const hasBody = !["GET", "HEAD", "DELETE"].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  const res = await backendFetch(backendPath, { method: request.method, body });
  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

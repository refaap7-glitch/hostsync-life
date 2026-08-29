import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server-fetch";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const res = await backendFetch(`/api/tasks/${params.id}/public?token=${encodeURIComponent(token)}`);
  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

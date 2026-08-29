import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server-fetch";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const formData = await request.formData();

  const res = await backendFetch(`/api/tasks/${params.id}/complete?token=${encodeURIComponent(token)}`, {
    method: "PUT",
    body: formData,
  });
  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

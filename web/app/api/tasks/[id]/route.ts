import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/server-fetch";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return proxyJson(request, `/api/tasks/${params.id}`);
}

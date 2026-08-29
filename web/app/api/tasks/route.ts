import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/server-fetch";

export async function GET(request: NextRequest) {
  return proxyJson(request, "/api/tasks");
}

export async function POST(request: NextRequest) {
  return proxyJson(request, "/api/tasks");
}

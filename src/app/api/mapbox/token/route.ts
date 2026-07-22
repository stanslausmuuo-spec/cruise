import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({ token: env.MAPBOX_TOKEN ?? null });
}

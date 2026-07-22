import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const token = env.MAPBOX_TOKEN;
  const isValid = token && token.startsWith("pk.") && !token.includes("your_mapbox_token");
  return NextResponse.json({ token: isValid ? token : null });
}

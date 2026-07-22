import { NextResponse } from "next/server";
import { authRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const key = `${action || "auth"}:${email}`;
    const result = authRateLimit(key);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

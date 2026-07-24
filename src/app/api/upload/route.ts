import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { cookies } from "next/headers";
import { authRateLimit } from "@/lib/rate-limit";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function POST(request: Request) {
  try {
    const convex = getConvexClient();
    const cookieStore = await cookies();
    const token = cookieStore.get("__convexAuthToken");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               "unknown";

    const rateLimit = authRateLimit(`upload:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many upload requests. Please try again later." },
        { status: 429 }
      );
    }

    const uploadUrl = await convex.mutation(api.storage.generateUploadUrl, {});

    const storageId = uploadUrl.split("/").pop()!;

    return NextResponse.json({ uploadUrl, storageId });
  } catch (error) {
    console.error("Upload URL generation failed:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}

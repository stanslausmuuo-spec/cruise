import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { cookies } from "next/headers";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__convexAuthToken");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentType } = await request.json();

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!contentType || !allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const uploadUrl = await convex.mutation(api.storage.generateUploadUrl, { contentType });

    // Extract storage ID from upload URL (format: https://.../storageId)
    const storageId = uploadUrl.split("/").pop()!;

    return NextResponse.json({ uploadUrl, storageId });
  } catch (error) {
    console.error("Upload URL generation failed:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}

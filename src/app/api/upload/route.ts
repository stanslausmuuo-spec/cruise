import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { contentType } = await request.json();

    if (!contentType || !contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const uploadUrl = await convex.mutation(api.storage.generateUploadUrl, {
      contentType,
    });

    // Extract storage ID from upload URL (format: https://.../storageId)
    const storageId = uploadUrl.split("/").pop()!;

    return NextResponse.json({ uploadUrl, storageId });
  } catch (error) {
    console.error("Upload URL generation failed:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
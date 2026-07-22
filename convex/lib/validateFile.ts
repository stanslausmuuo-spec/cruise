import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function validateFile(
  ctx: QueryCtx | MutationCtx,
  storageId: string
) {
  const metadata = await ctx.storage.getMetadata(storageId);
  if (!metadata) {
    throw new Error("File not found");
  }
  if (!metadata.contentType?.startsWith("image/")) {
    throw new Error("File must be an image");
  }
  if (metadata.size > MAX_SIZE_BYTES) {
    throw new Error("File exceeds 10MB limit");
  }
}

export const validateFileValidator = v.object({
  storageId: v.string(),
});

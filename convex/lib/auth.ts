import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getCurrentUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .first();
  
  if (!user) throw new Error("User not found");
  return user;
}

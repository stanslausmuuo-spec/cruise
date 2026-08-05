import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// @convex-dev/auth JWTs carry the user ID in `subject` as `<userId>|<sessionId>`
export function userIdFromSubject(subject: string): Id<"users"> {
  return subject.split("|")[0] as Id<"users">;
}

export async function getCurrentUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db.get(userIdFromSubject(identity.subject));

  if (!user) throw new Error("User not found");
  return { ...user, roles: user.roles ?? [] };
}

export function requireAuth(ctx: MutationCtx | QueryCtx) {
  return getCurrentUser(ctx);
}

export function requireRole(ctx: MutationCtx | QueryCtx, role: "renter" | "host" | "admin") {
  return async () => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes(role)) {
      throw new Error(`Requires ${role} role`);
    }
    return user;
  };
}

export function requireAdmin(ctx: MutationCtx | QueryCtx) {
  return requireRole(ctx, "admin");
}

export function requireHost(ctx: MutationCtx | QueryCtx) {
  return requireRole(ctx, "host");
}

export function requireRenter(ctx: MutationCtx | QueryCtx) {
  return requireRole(ctx, "renter");
}

export async function getOptionalUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db.get(userIdFromSubject(identity.subject));
}

export function assertOwnership(ctx: MutationCtx | QueryCtx, resourceUserId: string, userId?: string) {
  if (!userId) {
    return getCurrentUser(ctx).then(u => {
      if (u._id !== resourceUserId) throw new Error("Not authorized");
      return u;
    });
  }
  if (userId !== resourceUserId) throw new Error("Not authorized");
  return getCurrentUser(ctx);
}
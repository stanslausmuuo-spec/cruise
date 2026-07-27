import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const createSecurityAlert = internalMutation({
  args: {
    type: v.union(
      v.literal("brute_force"),
      v.literal("suspicious_login"),
      v.literal("rate_limit_exceeded"),
      v.literal("file_upload_anomaly"),
      v.literal("payment_fraud"),
      v.literal("privilege_escalation"),
      v.literal("data_exfiltration"),
    ),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    userId: v.optional(v.id("users")),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("security_alerts", {
      ...args,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Auto-escalate critical alerts
    if (args.severity === "critical") {
      // Could add admin notification here
      console.log(`CRITICAL ALERT: ${args.type} - ${alertId}`);
    }

    return { alertId };
  },
});

export const updateAlertStatus = mutation({
  args: {
    alertId: v.id("security_alerts"),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved"), v.literal("false_positive")),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) {
      throw new Error("Admin only");
    }

    await ctx.db.patch(args.alertId, {
      status: args.status,
      resolvedBy: user._id,
      resolution: args.resolution,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getSecurityAlerts = query({
  args: {
    status: v.optional(v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved"), v.literal("false_positive"))),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) {
      throw new Error("Admin only");
    }

    let query = ctx.db.query("security_alerts").withIndex("by_status", (q) => q.eq("status", args.status ?? "open"));

    if (args.severity) {
      query = query.filter((q) => q.eq(q.field("severity"), args.severity));
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const limit = args.limit ?? 50;
    const page = await query.order("desc").paginate({ numItems: limit, cursor: null });

    return page;
  },
});

export const getSecurityStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) {
      throw new Error("Admin only");
    }

    const [open, investigating, resolved, critical] = await Promise.all([
      ctx.db.query("security_alerts").withIndex("by_status", (q) => q.eq("status", "open")).collect(),
      ctx.db.query("security_alerts").withIndex("by_status", (q) => q.eq("status", "investigating")).collect(),
      ctx.db.query("security_alerts").withIndex("by_status", (q) => q.eq("status", "resolved")).collect(),
      ctx.db.query("security_alerts").filter((q) => q.eq(q.field("severity"), "critical")).collect(),
    ]);

    return {
      open: open.length,
      investigating: investigating.length,
      resolved: resolved.length,
      critical: critical.length,
      total: open.length + investigating.length + resolved.length,
    };
  },
});

export const markAlertResolved = internalMutation({
  args: {
    alertId: v.id("security_alerts"),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, {
      status: "resolved",
      resolution: args.resolution,
      updatedAt: Date.now(),
    });
  },
});
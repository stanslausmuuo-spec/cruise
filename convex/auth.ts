import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const passwordStrengthRegex = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/,
};

function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters`);
  }
  if (!passwordStrengthRegex.hasUpperCase.test(password)) {
    throw new Error("Password must contain at least one uppercase letter");
  }
  if (!passwordStrengthRegex.hasLowerCase.test(password)) {
    throw new Error("Password must contain at least one lowercase letter");
  }
  if (!passwordStrengthRegex.hasNumber.test(password)) {
    throw new Error("Password must contain at least one number");
  }
  if (!passwordStrengthRegex.hasSpecialChar.test(password)) {
    throw new Error("Password must contain at least one special character (!@#$%^&*...)");
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email = params.email as string;
        if (!email || !email.includes("@")) {
          throw new Error("Invalid email");
        }
        return { email: email.toLowerCase() };
      },
      validatePasswordRequirements: validatePassword,
    }),
  ],
  session: {
    // 30 days total, 7 days inactive
    totalDurationMs: 30 * 24 * 60 * 60 * 1000,
    inactiveDurationMs: 7 * 24 * 60 * 60 * 1000,
  },
  signIn: {
    maxFailedAttempsPerHour: 5,
  },
  callbacks: {
    beforeSessionCreation: async (ctx, { userId }) => {
      const user = await ctx.db.get(userId);
      if (!user || user.kycStatus === "rejected") {
        throw new Error("Account is banned or not verified");
      }
    },
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    return user;
  },
});

export const registerUser = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    roles: v.array(v.union(v.literal("renter"), v.literal("host"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
      
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(user._id, {
      name: args.name,
      phone: args.phone,
      roles: args.roles,
    });
    
    return { success: true };
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    return user?.roles.includes("admin") ?? false;
  },
});

export const getPublicUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { _id: user._id, name: user.name, avatarUrl: user.avatarUrl, rating: user.rating, reviewCount: user.reviewCount, verified: user.verified };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const callerEmail = identity?.email;
    if (!callerEmail) return null;
    if (callerEmail !== args.userId) {
      const caller = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", callerEmail))
        .first();
      if (!caller?.roles.includes("admin")) return null;
    }
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { _id: user._id, name: user.name, email: user.email, verified: user.verified, avatarUrl: user.avatarUrl, rating: user.rating, reviewCount: user.reviewCount };
  },
});

export const checkEmailExists = query({
  args: { email: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    if (args.secret !== process.env.MPESA_CALLBACK_SECRET) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return { exists: !!user, _id: user?._id };
  },
});
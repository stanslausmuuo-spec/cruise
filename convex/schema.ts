import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    avatarUrl: v.optional(v.string()),
    roles: v.array(v.union(v.literal("renter"), v.literal("host"), v.literal("admin"))),
    verified: v.boolean(),
    kycStatus: v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    rating: v.number(),
    reviewCount: v.number(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  vehicles: defineTable({
    ownerId: v.id("users"),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    type: v.union(
      v.literal("sedan"),
      v.literal("suv"),
      v.literal("luxury"),
      v.literal("wedding"),
      v.literal("truck")
    ),
    transmission: v.union(v.literal("automatic"), v.literal("manual")),
    fuelType: v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric")),
    seats: v.number(),
    pricePerDay: v.number(),
    currency: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    address: v.string(),
    images: v.array(v.string()),
    blurDataUrls: v.optional(v.array(v.string())),
    description: v.string(),
    features: v.optional(v.array(v.string())),
    isVerified: v.boolean(),
    isFeatured: v.boolean(),
    featuredExpiresAt: v.optional(v.number()),
    featuredCategory: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_type", ["type"])
    .index("by_featured", ["isFeatured"])
    .index("by_active", ["isActive"])
    .index("by_active_type", ["isActive", "type"])
    .index("by_active_price", ["isActive", "pricePerDay"])
    .index("by_active_type_price", ["isActive", "type", "pricePerDay"])
    .index("by_created_at", ["createdAt"]),

  bookings: defineTable({
    vehicleId: v.id("vehicles"),
    guestId: v.id("users"),
    hostId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
    totalAmount: v.number(),
    platformFee: v.number(),
    depositAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed")
    ),
    paymentStatus: v.union(
      v.literal("unpaid"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("partial_refund")
    ),
    mobileMoneyRef: v.optional(v.string()),
    checkoutRequestId: v.optional(v.string()),
    checkInTime: v.optional(v.number()),
    checkOutTime: v.optional(v.number()),
    checkInPhotos: v.optional(v.array(v.string())),
    checkOutPhotos: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_guest", ["guestId"])
    .index("by_host", ["hostId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_status", ["status"])
    .index("by_checkout_request_id", ["checkoutRequestId"]),

  availability: defineTable({
    vehicleId: v.id("vehicles"),
    date: v.number(),
    isAvailable: v.boolean(),
    bookingId: v.optional(v.id("bookings")),
  })
    .index("by_vehicle_date", ["vehicleId", "date"])
    .index("by_booking", ["bookingId"]),

  reviews: defineTable({
    bookingId: v.id("bookings"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    type: v.union(v.literal("guest_to_host"), v.literal("host_to_guest")),
    createdAt: v.number(),
  })
    .index("by_reviewee", ["revieweeId"])
    .index("by_booking", ["bookingId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_reviewee_created", ["revieweeId", "createdAt"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    bookingId: v.optional(v.id("bookings")),
    content: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_participants", ["senderId", "receiverId"])
    .index("by_participants_reverse", ["receiverId", "senderId"])
    .index("by_conversation", ["senderId", "receiverId", "createdAt"])
    .index("by_booking", ["bookingId"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("booking_payment"),
      v.literal("pay_to_reveal"),
      v.literal("featured_listing"),
      v.literal("deposit_hold"),
      v.literal("deposit_release"),
      v.literal("payout"),
      v.literal("refund"),
      v.literal("commission")
    ),
    amount: v.number(),
    currency: v.string(),
    reference: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_reference", ["reference"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"]),

  reveals: defineTable({
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    amount: v.number(),
    checkoutRequestId: v.optional(v.string()),
    mobileMoneyRef: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_checkout_request_id", ["checkoutRequestId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("booking"),
      v.literal("message"),
      v.literal("payment"),
      v.literal("verification"),
      v.literal("system")
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.union(
      v.object({ bookingId: v.id("bookings") }),
      v.object({ messageId: v.id("messages") }),
      v.object({ bookingId: v.id("bookings"), amount: v.number(), mpesaReceipt: v.string() }),
      v.object({ vehicleId: v.id("vehicles") }),
      v.object({ documentType: v.string() }),
      v.object({ messageId: v.id("messages"), senderId: v.id("users") }),
      v.string(),
    )),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_unread", ["userId", "read"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_created", ["userId", "createdAt"]),

  disputes: defineTable({
    bookingId: v.id("bookings"),
    raisedById: v.id("users"),
    reason: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    resolution: v.optional(v.string()),
    resolutionType: v.optional(
      v.union(
        v.literal("host_refund"),
        v.literal("guest_refund"),
        v.literal("partial_split"),
        v.literal("no_fault")
      )
    ),
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_booking", ["bookingId"])
    .index("by_status", ["status"]),

  kyc_documents: defineTable({
    userId: v.id("users"),
    documentType: v.union(
      v.literal("national_id"),
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("vehicle_logbook")
    ),
    fileStorageId: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_type", ["userId", "documentType"]),

  featured_listings: defineTable({
    vehicleId: v.id("vehicles"),
    ownerId: v.id("users"),
    amount: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    category: v.optional(v.string()),
    active: v.boolean(),
    checkoutRequestId: v.optional(v.string()),
    mobileMoneyRef: v.optional(v.string()),
  })
    .index("by_active", ["active"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_checkout_request_id", ["checkoutRequestId"]),

  push_subscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  otp_verifications: defineTable({
    userId: v.optional(v.id("users")),
    email: v.string(),
    otp: v.string(),
    type: v.union(v.literal("email_verification"), v.literal("password_reset")),
    expiresAt: v.number(),
    verified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email_type", ["email", "type"])
    .index("by_otp", ["otp"]),

});

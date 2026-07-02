import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  handler: async (ctx) => {
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) return;

    const hostId = await ctx.db.insert("users", {
      name: "James Mwangi",
      email: "james@example.com",
      phone: "+254712345678",
      roles: ["host"],
      verified: true,
      kycStatus: "approved",
      rating: 4.9,
      reviewCount: 42,
      theme: "system",
      bio: "Premium car enthusiast. All vehicles well maintained.",
      location: "Nairobi, Kenya",
      createdAt: Date.now(),
    });

    const guestId = await ctx.db.insert("users", {
      name: "John Doe",
      email: "john@example.com",
      phone: "+254723456789",
      roles: ["renter", "host"],
      verified: true,
      kycStatus: "approved",
      rating: 4.8,
      reviewCount: 15,
      theme: "system",
      createdAt: Date.now(),
    });

    const adminId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@cruise.com",
      phone: "+254700000000",
      roles: ["admin"],
      verified: true,
      kycStatus: "approved",
      rating: 0,
      reviewCount: 0,
      theme: "system",
      createdAt: Date.now(),
    });

    const vehicleIds = await Promise.all(
      [
        { make: "Mercedes-Benz", model: "E-Class", year: 2023, type: "luxury" as const, pricePerDay: 8500 },
        { make: "Range Rover", model: "Velar", year: 2024, type: "suv" as const, pricePerDay: 12000 },
        { make: "BMW", model: "7 Series", year: 2024, type: "luxury" as const, pricePerDay: 15000 },
        { make: "Porsche", model: "Cayenne", year: 2023, type: "suv" as const, pricePerDay: 18000 },
        { make: "Toyota", model: "Land Cruiser", year: 2023, type: "suv" as const, pricePerDay: 9500 },
        { make: "Lexus", model: "LS 500", year: 2024, type: "luxury" as const, pricePerDay: 16000 },
      ].map((v) =>
        ctx.db.insert("vehicles", {
          ownerId: hostId,
          ...v,
          transmission: "automatic",
          fuelType: "petrol",
          seats: 5,
          currency: "KES",
          location: { lat: -1.2921, lng: 36.8219 },
          address: "Nairobi, Kenya",
          images: [],
          description: `Premium ${v.make} ${v.model} available for rent. Well maintained and verified.`,
          features: ["Bluetooth", "Climate Control", "GPS"],
          isVerified: true,
          isFeatured: v.make === "Mercedes-Benz" || v.make === "Range Rover",
          featuredExpiresAt: v.make === "Mercedes-Benz" ? Date.now() + 30 * 86400000 : undefined,
          isActive: true,
          createdAt: Date.now(),
        })
      )
    );

    await ctx.db.insert("bookings", {
      vehicleId: vehicleIds[0],
      guestId: guestId,
      hostId: hostId,
      startDate: Date.now() + 86400000,
      endDate: Date.now() + 4 * 86400000,
      totalAmount: 29325,
      platformFee: 3825,
      depositAmount: 8798,
      status: "confirmed",
      paymentStatus: "paid",
      mobileMoneyRef: "MPESA-REF-001",
      checkInPhotos: [],
      checkOutPhotos: [],
      createdAt: Date.now(),
    });

    const now = Date.now();
    for (let i = 0; i < 3; i++) {
      const startDate = now + (i + 10) * 86400000;
      await ctx.db.insert("availability", {
        vehicleId: vehicleIds[0],
        date: startDate,
        isAvailable: false,
      });
      await ctx.db.insert("availability", {
        vehicleId: vehicleIds[0],
        date: startDate + 86400000,
        isAvailable: false,
      });
      await ctx.db.insert("availability", {
        vehicleId: vehicleIds[0],
        date: startDate + 2 * 86400000,
        isAvailable: false,
      });
    }
  },
});

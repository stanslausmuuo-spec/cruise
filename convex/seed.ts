import { mutation } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { v } from "convex/values";

const sampleVehicles = [
  {
    make: "Toyota",
    model: "RAV4",
    year: 2022,
    type: "suv" as const,
    transmission: "automatic" as const,
    fuelType: "petrol" as const,
    seats: 5,
    pricePerDay: 4500,
    description: "Reliable and comfortable SUV perfect for weekend getaways and family trips around Nairobi and beyond.",
    address: "Westlands, Nairobi",
    location: { lat: -1.2676, lng: 36.8036 },
    images: [
      "https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=800",
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b7?w=800",
    ],
    features: ["Air Conditioning", "Bluetooth", "Backup Camera", "USB Charging"],
    isFeatured: true,
    isActive: true,
    isVerified: true,
  },
  {
    make: "Mercedes-Benz",
    model: "C200",
    year: 2023,
    type: "luxury" as const,
    transmission: "automatic" as const,
    fuelType: "petrol" as const,
    seats: 5,
    pricePerDay: 12000,
    description: "Elegant luxury sedan with premium leather interior, perfect for business travel and special occasions.",
    address: "Karen, Nairobi",
    location: { lat: -1.3191, lng: 36.7074 },
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
    ],
    features: ["Leather Seats", "Air Conditioning", "Premium Sound", "Sunroof"],
    isFeatured: true,
    isActive: true,
    isVerified: true,
  },
  {
    make: "Subaru",
    model: "Forester",
    year: 2021,
    type: "suv" as const,
    transmission: "automatic" as const,
    fuelType: "petrol" as const,
    seats: 5,
    pricePerDay: 5500,
    description: "Versatile all-wheel-drive SUV ideal for both city driving and adventures to Nanyuki or the Maasai Mara.",
    address: "Kilimani, Nairobi",
    location: { lat: -1.292, lng: 36.777 },
    images: [
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    ],
    features: ["All-Wheel Drive", "Air Conditioning", "Bluetooth", "Roof Rails"],
    isFeatured: false,
    isActive: true,
    isVerified: true,
  },
  {
    make: "Nissan",
    model: "X-Trail",
    year: 2022,
    type: "suv" as const,
    transmission: "automatic" as const,
    fuelType: "diesel" as const,
    seats: 7,
    pricePerDay: 6500,
    description: "Spacious 7-seater diesel SUV with excellent fuel economy. Great for family trips and group travel.",
    address: "CBD, Nairobi",
    location: { lat: -1.2864, lng: 36.8172 },
    images: [
      "https://images.unsplash.com/photo-1606611013016-969c19ba27d5?w=800",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800",
    ],
    features: ["7 Seats", "Diesel Engine", "Air Conditioning", "Bluetooth", "Cruise Control"],
    isFeatured: false,
    isActive: true,
    isVerified: true,
  },
  {
    make: "Honda",
    model: "CR-V",
    year: 2023,
    type: "suv" as const,
    transmission: "automatic" as const,
    fuelType: "petrol" as const,
    seats: 5,
    pricePerDay: 5000,
    description: "Modern and fuel-efficient SUV with advanced safety features. Smooth ride for Nairobi commute or weekend escapes.",
    address: "Mombasa Road, Nairobi",
    location: { lat: -1.2833, lng: 36.8333 },
    images: [
      "https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
    ],
    features: ["Honda Sensing", "Air Conditioning", "Bluetooth", "Apple CarPlay"],
    isFeatured: true,
    isActive: true,
    isVerified: true,
  },
  {
    make: "BMW",
    model: "X5",
    year: 2022,
    type: "luxury" as const,
    transmission: "automatic" as const,
    fuelType: "diesel" as const,
    seats: 5,
    pricePerDay: 15000,
    description: "Premium luxury SUV with powerful diesel engine and executive comfort. Perfect for airport transfers and VIP travel.",
    address: "Lavington, Nairobi",
    location: { lat: -1.2763, lng: 36.7697 },
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
    ],
    features: ["Leather Seats", "Panoramic Sunroof", "Harman Kardon Sound", "Heated Seats", "Adaptive Cruise"],
    isFeatured: true,
    isActive: true,
    isVerified: true,
  },
  {
    make: "Toyota",
    model: "Land Cruiser Prado",
    year: 2021,
    type: "suv" as const,
    transmission: "automatic" as const,
    fuelType: "diesel" as const,
    seats: 7,
    pricePerDay: 8000,
    description: "The iconic Prado — rugged, reliable, and perfect for safari trips to Tsavo, Amboseli, or the northern frontier.",
    address: "South B, Nairobi",
    location: { lat: -1.2975, lng: 36.8392 },
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
      "https://images.unsplash.com/photo-1594611606858-a6dbe0a49d8c?w=800",
    ],
    features: ["4WD", "7 Seats", "Air Conditioning", "Diff Lock", "Roof Rack", "Snorkel"],
    isFeatured: true,
    isActive: true,
    isVerified: true,
  },
  {
    make: "Toyota",
    model: "Axio",
    year: 2020,
    type: "sedan" as const,
    transmission: "automatic" as const,
    fuelType: "petrol" as const,
    seats: 5,
    pricePerDay: 3000,
    description: "Economical and compact sedan perfect for daily commutes and city errands. Excellent fuel efficiency.",
    address: "Eastleigh, Nairobi",
    location: { lat: -1.2619, lng: 36.8513 },
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
    ],
    features: ["Air Conditioning", "Bluetooth", "Fuel Efficient"],
    isFeatured: false,
    isActive: true,
    isVerified: true,
  },
];

export const seedVehicles = mutation({
  args: {
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.roles.includes("admin")) throw new Error("Admin only");

    const existing = await ctx.db.query("vehicles").first();
    if (existing) return { message: "Already seeded" };

    for (const vehicle of sampleVehicles) {
      await ctx.db.insert("vehicles", {
        ...vehicle,
        ownerId: args.ownerId,
        currency: "KES",
        createdAt: Date.now(),
      });
    }

    return { message: `Seeded ${sampleVehicles.length} vehicles` };
  },
});

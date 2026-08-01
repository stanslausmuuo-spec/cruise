export const APP_NAME = "Cruise";
export const APP_TAGLINE = "Rent cars from owners near you. Book with M-Pesa.";
export const APP_DESCRIPTION = "The premium peer-to-peer car rental marketplace. Browse, book, and drive verified vehicles with ease.";

export const PLATFORM_FEE_PERCENT = 0.15;
export const CURRENCY = "KES";

// Plan tiers — keep PLAN_AMOUNTS in convex/payments.ts in sync with these fees.
export type PlanTier = "free" | "basic" | "premium";
export type PlanPeriod = "monthly" | "annual";

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  tagline: string;
  headline: string;
  monthlyFee: number;
  annualFee: number;
  days: number;
  features: string[];
  mostPopular?: boolean;
  bestValue?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    tier: "free",
    name: "Free",
    tagline: "Your listing, live on Cruise.",
    headline: "Start for free, forever.",
    monthlyFee: 0,
    annualFee: 0,
    days: 0,
    features: [
      "Listing on Cruise",
      "Map location",
      "Verified badge (free after document check)",
    ],
  },
  {
    tier: "basic",
    name: "Basic",
    tagline: "Let buyers call you directly.",
    headline: "Your phone number shown to every buyer.",
    monthlyFee: 1000,
    annualFee: 10000,
    days: 30,
    features: [
      "Everything in Free",
      "Phone number shown to every buyer",
    ],
    mostPopular: true,
  },
  {
    tier: "premium",
    name: "Premium",
    tagline: "Be the first car they see.",
    headline: "Featured on the homepage and pinned to the top of Browse.",
    monthlyFee: 2500,
    annualFee: 25000,
    days: 30,
    features: [
      "Everything in Basic",
      "Featured on the homepage",
      "Pinned to the top of Browse",
    ],
    bestValue: true,
  },
];

export function getPlan(tier: PlanTier): PlanDefinition {
  return PLANS.find((p) => p.tier === tier) ?? PLANS[0];
}

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
};

export const VEHICLE_TYPES = ["sedan", "suv", "luxury", "wedding", "truck"] as const;
export const FUEL_TYPES = ["petrol", "diesel", "electric"] as const;
export const TRANSMISSION_TYPES = ["manual", "automatic"] as const;

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  luxury: "Luxury",
  wedding: "Wedding",
  truck: "Truck",
};

export const FUEL_TYPE_LABELS: Record<string, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  electric: "Electric",
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: "Automatic",
  manual: "Manual",
};

export const COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
] as const;

export const PRICE_RANGES = [
  { label: "Under 2,000", min: 0, max: 2000 },
  { label: "2,000 - 5,000", min: 2000, max: 5000 },
  { label: "5,000 - 10,000", min: 5000, max: 10000 },
  { label: "Above 10,000", min: 10000, max: Infinity },
] as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY: "/verify",
  VEHICLES: "/vehicles",
  VEHICLE_DETAIL: (id: string) => `/vehicles/${id}`,
  VEHICLE_BOOK: (id: string) => `/vehicles/${id}/book`,
  VEHICLE_MAP: "/vehicles/map",
  VEHICLE_NEW: "/vehicles/new",
  VEHICLE_EDIT: (id: string) => `/vehicles/${id}/edit`,
  DASHBOARD: "/dashboard",
  RENTER_TRIPS: "/dashboard/renter/trips",
  HOST_VEHICLES: "/dashboard/host/vehicles",
  HOST_EARNINGS: "/dashboard/host/earnings",
  BOOKING_DETAIL: (id: string) => `/bookings/${id}`,
  BOOKING_CHECK_IN: (id: string) => `/bookings/${id}/check-in`,
  BOOKING_CHECK_OUT: (id: string) => `/bookings/${id}/check-out`,
  MESSAGES: "/messages",
  MESSAGE_DETAIL: (id: string) => `/messages/${id}`,
  PAYMENT_PLANS: (vehicleId: string) => `/payments/plans/${vehicleId}`,
  ADMIN: "/admin",
  ADMIN_VERIFICATIONS: "/admin/verifications",
  ADMIN_DISPUTES: "/admin/disputes",
  ADMIN_LISTINGS: "/admin/listings",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  HOW_IT_WORKS: "/how-it-works",
  TRUST_SAFETY: "/trust-safety",
} as const;

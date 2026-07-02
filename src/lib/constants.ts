export const APP_NAME = "Cruise";
export const APP_TAGLINE = "Drive Luxury. Own Freedom.";
export const APP_DESCRIPTION = "The premium peer-to-peer car rental marketplace. Browse, book, and drive verified vehicles with ease.";

export const PLATFORM_FEE_PERCENT = 0.15;
export const PAY_TO_REVEAL_FEE = 100;
export const FEATURED_LISTING_FEE = 1500;
export const FEATURED_DURATION_DAYS = 7;
export const CURRENCY = "KES";

export const VEHICLE_TYPES = ["sedan", "suv", "coupe", "convertible", "hatchback", "sports", "luxury", "truck"] as const;
export const FUEL_TYPES = ["petrol", "diesel", "electric"] as const;
export const TRANSMISSION_TYPES = ["manual", "automatic", "dct", "cvt"] as const;

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
  PAYMENT_REVEAL: (vehicleId: string) => `/payments/reveal/${vehicleId}`,
  PAYMENT_FEATURED: (vehicleId: string) => `/payments/featured/${vehicleId}`,
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

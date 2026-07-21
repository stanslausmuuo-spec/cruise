export type UserRole = "renter" | "host" | "admin";
export type KycStatus = "none" | "pending" | "approved" | "rejected";
export type Theme = "light" | "dark" | "system";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  roles: UserRole[];
  verified: boolean;
  kycStatus: KycStatus;
  rating: number;
  reviewCount: number;
  theme: Theme;
  bio?: string;
  location?: string;
  createdAt: number;
}

export type VehicleType = "sedan" | "suv" | "luxury" | "wedding" | "truck";
export type Transmission = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "electric";

export interface Vehicle {
  _id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  pricePerDay: number;
  currency: string;
  location: { lat: number; lng: number };
  address: string;
  images: string[];
  blurDataUrls?: string[];
  description: string;
  features?: string[];
  isVerified: boolean;
  isFeatured: boolean;
  featuredExpiresAt?: number;
  featuredCategory?: string;
  isActive: boolean;
  createdAt: number;
}

export interface VehicleWithOwner extends Vehicle {
  owner?: User;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled" | "disputed";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "partial_refund";

export interface Booking {
  _id: string;
  vehicleId: string;
  guestId: string;
  hostId: string;
  startDate: number;
  endDate: number;
  totalAmount: number;
  platformFee: number;
  depositAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  mobileMoneyRef?: string;
  checkInTime?: number;
  checkOutTime?: number;
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  createdAt: number;
}

export interface BookingWithDetails extends Booking {
  vehicle?: Vehicle;
  guest?: User;
  host?: User;
}

export interface Review {
  _id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  type: "guest_to_host" | "host_to_guest";
  createdAt: number;
}

export interface ReviewWithUsers extends Review {
  reviewer?: User;
  reviewee?: User;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  bookingId?: string;
  content: string;
  read: boolean;
  createdAt: number;
}

export interface MessageWithUsers extends Message {
  sender?: User;
  receiver?: User;
}

export type TransactionType =
  | "booking_payment"
  | "pay_to_reveal"
  | "featured_listing"
  | "deposit_hold"
  | "deposit_release"
  | "payout"
  | "refund"
  | "commission";

export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  reference: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export type DisputeStatus = "open" | "investigating" | "resolved" | "dismissed";
export type ResolutionType = "host_refund" | "guest_refund" | "partial_split" | "no_fault";

export interface Dispute {
  _id: string;
  bookingId: string;
  raisedById: string;
  reason: string;
  status: DisputeStatus;
  resolution?: string;
  resolutionType?: ResolutionType;
  adminNotes?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface DisputeWithDetails extends Dispute {
  booking?: Booking;
  raisedBy?: User;
}

export type KycDocumentType = "national_id" | "passport" | "drivers_license" | "vehicle_logbook";
export type DocumentStatus = "pending" | "approved" | "rejected";

export interface KycDocument {
  _id: string;
  userId: string;
  documentType: KycDocumentType;
  fileStorageId: string;
  status: DocumentStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectionReason?: string;
  createdAt: number;
}

export type NotificationType = "booking" | "message" | "payment" | "verification" | "system";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?:
    | { bookingId: string }
    | { messageId: string }
    | { bookingId: string; amount: number; mpesaReceipt: string }
    | { vehicleId: string }
    | { documentType: string }
    | { messageId: string; senderId: string }
    | string;
  read: boolean;
  createdAt: number;
}

export interface VehicleFilters {
  search?: string;
  type?: VehicleType;
  transmission?: Transmission;
  county?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface BookingDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface PriceCalculation {
  pricePerDay: number;
  numberOfDays: number;
  subtotal: number;
  platformFee: number;
  total: number;
}

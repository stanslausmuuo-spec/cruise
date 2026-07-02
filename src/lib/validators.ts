import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    roles: z.array(z.enum(["renter", "host"])).min(1, "Select at least one role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(2000, "Year must be 2000 or later").max(2030),
  type: z.enum(["sedan", "suv", "luxury", "wedding", "truck"]),
  transmission: z.enum(["automatic", "manual"]),
  fuelType: z.enum(["petrol", "diesel", "electric"]),
  seats: z.number().min(1).max(15),
  pricePerDay: z.number().min(100, "Price must be at least 100"),
  address: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  features: z.array(z.string()).optional(),
});

export const bookingSchema = z.object({
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
);

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, "Review must be at least 3 characters").max(500),
});

export const disputeSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason"),
});

export const kycUploadSchema = z.object({
  documentType: z.enum(["national_id", "passport", "drivers_license", "vehicle_logbook"]),
});

export const paymentRevealSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type DisputeInput = z.infer<typeof disputeSchema>;

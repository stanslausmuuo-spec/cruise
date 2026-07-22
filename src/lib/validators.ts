import { z } from "zod";
import { VEHICLE_TYPES, TRANSMISSION_TYPES, FUEL_TYPES } from "./constants";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Password strength requirements
const passwordStrengthRegex = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must not exceed ${PASSWORD_MAX_LENGTH} characters`);
  }
  
  if (!passwordStrengthRegex.hasUpperCase.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!passwordStrengthRegex.hasLowerCase.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!passwordStrengthRegex.hasNumber.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!passwordStrengthRegex.hasSpecialChar.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*...)");
  }
  
  return errors;
}

export const strongPassword = z.string().refine(
  (password) => validatePasswordStrength(password).length === 0,
  {
    message: "Password does not meet strength requirements",
  }
);

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    confirmPassword: z.string(),
    roles: z.array(z.enum(["renter", "host"])).min(1, "Select at least one role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => validatePasswordStrength(data.password).length === 0, {
    message: "Password does not meet strength requirements",
    path: ["password"],
  });

export const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(2000, "Year must be 2000 or later").max(2030),
  type: z.enum(VEHICLE_TYPES),
  transmission: z.enum(TRANSMISSION_TYPES),
  fuelType: z.enum(FUEL_TYPES),
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

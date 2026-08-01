import { describe, it, expect } from "vitest";
import {
  validatePasswordStrength,
  strongPassword,
  loginSchema,
  registerSchema,
  vehicleSchema,
  bookingSchema,
  reviewSchema,
  disputeSchema,
  kycUploadSchema,
} from "../validators";

describe("validatePasswordStrength", () => {
  it("returns no errors for a strong password", () => {
    expect(validatePasswordStrength("Str0ng!Pass")).toEqual([]);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePasswordStrength("A1!b").join()).toContain("at least 8");
  });

  it("rejects passwords longer than 128 characters", () => {
    expect(validatePasswordStrength("A1!" + "a".repeat(130)).join()).toContain("128");
  });

  it("rejects missing uppercase", () => {
    expect(validatePasswordStrength("lower1!case").join()).toContain("uppercase");
  });

  it("rejects missing lowercase", () => {
    expect(validatePasswordStrength("UPPER1!CASE").join()).toContain("lowercase");
  });

  it("rejects missing number", () => {
    expect(validatePasswordStrength("NoNumbers!").join()).toContain("number");
  });

  it("rejects missing special character", () => {
    expect(validatePasswordStrength("NoSpecial1").join()).toContain("special");
  });

  it("collects multiple failures at once", () => {
    const errors = validatePasswordStrength("abc");
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe("strongPassword schema", () => {
  it("accepts a strong password", () => {
    expect(strongPassword.safeParse("Str0ng!Pass").success).toBe(true);
  });

  it("rejects a weak password", () => {
    expect(strongPassword.safeParse("weak").success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "whatever",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "0712345678",
    password: "Str0ng!Pass",
    confirmPassword: "Str0ng!Pass",
    roles: ["renter"],
  };

  it("accepts valid registration", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("rejects short name", () => {
    expect(registerSchema.safeParse({ ...base, name: "A" }).success).toBe(false);
  });

  it("rejects short phone number", () => {
    expect(registerSchema.safeParse({ ...base, phone: "0712" }).success).toBe(false);
  });

  it("rejects empty roles", () => {
    expect(registerSchema.safeParse({ ...base, roles: [] }).success).toBe(false);
  });

  it("rejects weak passwords", () => {
    expect(registerSchema.safeParse({ ...base, password: "weak" }).success).toBe(false);
  });
});

describe("vehicleSchema", () => {
  const base = {
    make: "Toyota",
    model: "Harrier",
    year: 2020,
    type: "suv",
    transmission: "automatic",
    fuelType: "petrol",
    seats: 5,
    pricePerDay: 5000,
    address: "Westlands, Nairobi",
    description: "A well maintained vehicle for long trips across the country.",
  };

  it("accepts a valid vehicle", () => {
    expect(vehicleSchema.safeParse(base).success).toBe(true);
  });

  it("rejects year before 2000", () => {
    expect(vehicleSchema.safeParse({ ...base, year: 1999 }).success).toBe(false);
  });

  it("rejects year after 2030", () => {
    expect(vehicleSchema.safeParse({ ...base, year: 2031 }).success).toBe(false);
  });

  it("rejects price below minimum", () => {
    expect(vehicleSchema.safeParse({ ...base, pricePerDay: 99 }).success).toBe(false);
  });

  it("rejects seat count outside 1-15", () => {
    expect(vehicleSchema.safeParse({ ...base, seats: 0 }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...base, seats: 16 }).success).toBe(false);
  });

  it("rejects unknown vehicle type", () => {
    expect(vehicleSchema.safeParse({ ...base, type: "spaceship" }).success).toBe(false);
  });

  it("rejects short description", () => {
    expect(vehicleSchema.safeParse({ ...base, description: "too short" }).success).toBe(false);
  });

  it("accepts optional features", () => {
    expect(vehicleSchema.safeParse({ ...base, features: ["GPS", "Bluetooth"] }).success).toBe(true);
  });
});

describe("bookingSchema", () => {
  it("accepts valid date range", () => {
    const result = bookingSchema.safeParse({
      startDate: new Date(2026, 0, 10),
      endDate: new Date(2026, 0, 12),
    });
    expect(result.success).toBe(true);
  });

  it("rejects end date before start date", () => {
    const result = bookingSchema.safeParse({
      startDate: new Date(2026, 0, 12),
      endDate: new Date(2026, 0, 10),
    });
    expect(result.success).toBe(false);
  });

  it("rejects equal dates", () => {
    const result = bookingSchema.safeParse({
      startDate: new Date(2026, 0, 10),
      endDate: new Date(2026, 0, 10),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing dates", () => {
    const result = bookingSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("accepts a valid review", () => {
    expect(reviewSchema.safeParse({ rating: 5, comment: "Great car!" }).success).toBe(true);
  });

  it("rejects rating below 1", () => {
    expect(reviewSchema.safeParse({ rating: 0, comment: "Great car!" }).success).toBe(false);
  });

  it("rejects rating above 5", () => {
    expect(reviewSchema.safeParse({ rating: 6, comment: "Great car!" }).success).toBe(false);
  });

  it("rejects short comment", () => {
    expect(reviewSchema.safeParse({ rating: 5, comment: "ok" }).success).toBe(false);
  });

  it("rejects comment over 500 chars", () => {
    expect(
      reviewSchema.safeParse({ rating: 5, comment: "a".repeat(501) }).success
    ).toBe(false);
  });
});

describe("disputeSchema", () => {
  it("accepts a detailed reason", () => {
    expect(disputeSchema.safeParse({ reason: "This is a long detailed reason" }).success).toBe(true);
  });

  it("rejects a vague reason", () => {
    expect(disputeSchema.safeParse({ reason: "short" }).success).toBe(false);
  });
});

describe("kycUploadSchema", () => {
  it("accepts valid document types", () => {
    for (const doc of ["national_id", "passport", "drivers_license", "vehicle_logbook"]) {
      expect(kycUploadSchema.safeParse({ documentType: doc }).success).toBe(true);
    }
  });

  it("rejects unknown document types", () => {
    expect(kycUploadSchema.safeParse({ documentType: "birth_cert" }).success).toBe(false);
  });
});

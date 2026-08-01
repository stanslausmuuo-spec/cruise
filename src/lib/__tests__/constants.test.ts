import { describe, it, expect } from "vitest";
import {
  APP_NAME,
  CURRENCY,
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  COUNTIES,
  PRICE_RANGES,
  ROUTES,
  PLANS,
  getPlan,
} from "../constants";

describe("APP_NAME", () => {
  it("is CruiseLinx", () => {
    expect(APP_NAME).toBe("CruiseLinx");
  });
});

describe("currency", () => {
  it("currency is KES", () => {
    expect(CURRENCY).toBe("KES");
  });
});

describe("PLANS", () => {
  it("has three tiers: free, basic, premium", () => {
    expect(PLANS.map((p) => p.tier)).toEqual(["free", "basic", "premium"]);
  });

  it("free tier costs nothing", () => {
    expect(PLANS[0].monthlyFee).toBe(0);
    expect(PLANS[0].annualFee).toBe(0);
  });

  it("basic tier is 1000/mo and 10000/yr (2 months free)", () => {
    expect(PLANS[1].monthlyFee).toBe(1000);
    expect(PLANS[1].annualFee).toBe(10000);
  });

  it("premium tier is 2500/mo and 25000/yr (2 months free)", () => {
    expect(PLANS[2].monthlyFee).toBe(2500);
    expect(PLANS[2].annualFee).toBe(25000);
  });

  it("basic is marked most popular", () => {
    expect(PLANS[1].mostPopular).toBe(true);
  });

  it("premium is marked best value", () => {
    expect(PLANS[2].bestValue).toBe(true);
  });

  it("getPlan returns the free plan for free tier", () => {
    expect(getPlan("free").name).toBe("Free");
  });

  it("getPlan falls back to free for unknown tiers", () => {
    expect(getPlan("free").tier).toBe("free");
  });
});

describe("VEHICLE_TYPES", () => {
  it("has all expected types", () => {
    expect(VEHICLE_TYPES).toEqual(["sedan", "suv", "luxury", "wedding", "truck"]);
  });

  it("contains sedan", () => {
    expect(VEHICLE_TYPES).toContain("sedan");
  });

  it("contains suv", () => {
    expect(VEHICLE_TYPES).toContain("suv");
  });

  it("contains luxury", () => {
    expect(VEHICLE_TYPES).toContain("luxury");
  });
});

describe("FUEL_TYPES", () => {
  it("has all fuel types", () => {
    expect(FUEL_TYPES).toEqual(["petrol", "diesel", "electric"]);
  });
});

describe("TRANSMISSION_TYPES", () => {
  it("has both transmission types", () => {
    expect(TRANSMISSION_TYPES).toEqual(["manual", "automatic"]);
  });
});

describe("COUNTIES", () => {
  it("has Kenyan counties", () => {
    expect(COUNTIES.length).toBeGreaterThan(0);
  });

  it("includes Nairobi", () => {
    expect(COUNTIES).toContain("Nairobi");
  });

  it("includes Mombasa", () => {
    expect(COUNTIES).toContain("Mombasa");
  });

  it("includes Nakuru", () => {
    expect(COUNTIES).toContain("Nakuru");
  });
});

describe("PRICE_RANGES", () => {
  it("has 4 price ranges", () => {
    expect(PRICE_RANGES).toHaveLength(4);
  });

  it("first range starts at 0", () => {
    expect(PRICE_RANGES[0].min).toBe(0);
  });

  it("last range has Infinity max", () => {
    expect(PRICE_RANGES[PRICE_RANGES.length - 1].max).toBe(Infinity);
  });
});

describe("ROUTES", () => {
  it("has HOME route", () => {
    expect(ROUTES.HOME).toBe("/");
  });

  it("has LOGIN route", () => {
    expect(ROUTES.LOGIN).toBe("/login");
  });

  it("has VEHICLES route", () => {
    expect(ROUTES.VEHICLES).toBe("/vehicles");
  });

  it("VEHICLE_DETAIL generates correct path", () => {
    expect(ROUTES.VEHICLE_DETAIL("123")).toBe("/vehicles/123");
  });

  it("VEHICLE_BOOK generates correct path", () => {
    expect(ROUTES.VEHICLE_BOOK("abc")).toBe("/vehicles/abc/book");
  });

  it("DASHBOARD route", () => {
    expect(ROUTES.DASHBOARD).toBe("/dashboard");
  });

  it("MESSAGES route", () => {
    expect(ROUTES.MESSAGES).toBe("/messages");
  });

  it("has all expected top-level routes", () => {
    const expectedKeys = [
      "HOME", "LOGIN", "REGISTER", "VEHICLES", "VEHICLE_MAP",
      "VEHICLE_NEW", "DASHBOARD", "MESSAGES", "ADMIN", "ABOUT",
      "CONTACT", "PRIVACY", "PAYMENT_PLANS",
    ];
    for (const key of expectedKeys) {
      expect(ROUTES).toHaveProperty(key);
    }
  });

  it("PAYMENT_PLANS generates correct path", () => {
    expect(ROUTES.PAYMENT_PLANS("123")).toBe("/payments/plans/123");
  });
});

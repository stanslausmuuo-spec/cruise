import { describe, it, expect } from "vitest";
import {
  APP_NAME,
  PLATFORM_FEE_PERCENT,
  PAY_TO_REVEAL_FEE,
  FEATURED_LISTING_FEE,
  FEATURED_DURATION_DAYS,
  CURRENCY,
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  COUNTIES,
  PRICE_RANGES,
  ROUTES,
} from "../constants";

describe("APP_NAME", () => {
  it("is Cruise", () => {
    expect(APP_NAME).toBe("Cruise");
  });
});

describe("platform fees", () => {
  it("platform fee is 15%", () => {
    expect(PLATFORM_FEE_PERCENT).toBe(0.15);
  });

  it("pay to reveal fee is 100", () => {
    expect(PAY_TO_REVEAL_FEE).toBe(100);
  });

  it("featured listing fee is 1500", () => {
    expect(FEATURED_LISTING_FEE).toBe(1500);
  });

  it("featured duration is 7 days", () => {
    expect(FEATURED_DURATION_DAYS).toBe(7);
  });

  it("currency is KES", () => {
    expect(CURRENCY).toBe("KES");
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
      "CONTACT", "PRIVACY",
    ];
    for (const key of expectedKeys) {
      expect(ROUTES).toHaveProperty(key);
    }
  });
});

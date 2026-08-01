import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VehicleCard } from "../vehicles/vehicle-card";
import type { Vehicle } from "@/lib/types";

const vehicle: Vehicle = {
  _id: "v123",
  make: "Toyota",
  model: "Harrier",
  year: 2020,
  type: "suv",
  transmission: "automatic",
  fuelType: "petrol",
  seats: 5,
  pricePerDay: 5000,
  address: "Westlands, Nairobi",
  description: "Well maintained family SUV",
  features: ["GPS"],
  images: ["/img1.jpg"],
  blurDataUrls: undefined,
  hostId: "h1",
  createdAt: 1737000000000,
  updatedAt: 1737000000000,
  status: "available",
  isVerified: true,
  tier: "basic",
  plan: "basic",
} as unknown as Vehicle;

describe("VehicleCard", () => {
  it("renders vehicle make and model", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText("Toyota Harrier")).toBeInTheDocument();
  });

  it("renders the price per day", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
    expect(screen.getByText("/day")).toBeInTheDocument();
  });

  it("links to the vehicle detail page", () => {
    render(<VehicleCard vehicle={vehicle} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/vehicles/v123");
  });

  it("uses a custom href when provided", () => {
    render(<VehicleCard vehicle={vehicle} href="/custom/path" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/custom/path");
  });

  it("shows the type badge", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText(/SUV/i)).toBeInTheDocument();
  });

  it("shows Verified badge for verified vehicles", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("shows Featured badge for premium tier", () => {
    render(<VehicleCard vehicle={{ ...vehicle, tier: "premium" }} />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("does not show Featured badge for non-premium", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("falls back to a placeholder image", () => {
    render(<VehicleCard vehicle={{ ...vehicle, images: [] }} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/placeholder-car.jpg");
  });

  it("provides a descriptive image alt text", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Toyota Harrier");
  });

  it("renders seat count and location", () => {
    render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText(/5 seats/)).toBeInTheDocument();
    expect(screen.getByText("Westlands, Nairobi")).toBeInTheDocument();
  });
});

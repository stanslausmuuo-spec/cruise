import { describe, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useQuery } from "convex/react";
import { expectNoAxeViolations } from "@/test/a11y";
import { Button } from "../ui/button";
import { MessageInput } from "../messaging/message-input";
import { ReviewForm } from "../reviews/review-form";
import { VehicleCard } from "../vehicles/vehicle-card";
import { Navbar } from "../layout/navbar";
import { BookingWizard } from "../booking/booking-wizard";
import type { Vehicle } from "@/lib/types";

const vehicle: Vehicle = {
  _id: "v1",
  make: "Toyota",
  model: "Harrier",
  year: 2020,
  type: "suv",
  transmission: "automatic",
  fuelType: "petrol",
  seats: 5,
  pricePerDay: 5000,
  address: "Nairobi",
  description: "Good car",
  images: ["/a.jpg"],
  hostId: "h1",
  createdAt: 1737000000000,
  updatedAt: 1737000000000,
  status: "available",
  isVerified: true,
  tier: "basic",
  plan: "basic",
} as unknown as Vehicle;

describe("Accessibility audit", () => {
  const useQueryMock = useQuery as unknown as ReturnType<typeof vi.fn>;

  it("Button has no axe violations", async () => {
    const { container } = render(<Button>Submit</Button>);
    await expectNoAxeViolations(container);
  });

  it("MessageInput has no axe violations", async () => {
    const { container } = render(<MessageInput onSend={() => {}} />);
    await expectNoAxeViolations(container);
  });

  it("ReviewForm has no axe violations", async () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReset();
    const { container } = render(<ReviewForm bookingId="b1" />);
    await expectNoAxeViolations(container, ["color-contrast"]);
  });

  it("VehicleCard has no axe violations", async () => {
    const { container } = render(<VehicleCard vehicle={vehicle} />);
    await expectNoAxeViolations(container, ["color-contrast"]);
  });

  it("BookingWizard has no axe violations", async () => {
    const { container } = render(
      <BookingWizard
        steps={[{ label: "Dates" }, { label: "Details" }, { label: "Confirm" }]}
        currentStep={1}
      />
    );
    await expectNoAxeViolations(container, ["color-contrast"]);
  });

  it("Navbar has no axe violations (logged out)", async () => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue(undefined);
    const { container } = render(<Navbar />);
    await expectNoAxeViolations(container, ["color-contrast"]);
  });

  it("Navbar has no axe violations (logged in)", async () => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue({ _id: "u1", name: "Jane", email: "j@x.com" });
    const { container } = render(<Navbar />);
    await expectNoAxeViolations(container, ["color-contrast"]);
  });
});

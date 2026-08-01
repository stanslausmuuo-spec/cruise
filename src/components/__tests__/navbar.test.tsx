import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useQuery } from "convex/react";
import { Navbar } from "../layout/navbar";

describe("Navbar", () => {
  const useQueryMock = useQuery as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useQueryMock.mockReset();
  });

  afterEach(() => {
    window.scrollY = 0;
  });

  it("renders brand and navigation links", () => {
    useQueryMock.mockReturnValue(undefined);
    render(<Navbar />);
    expect(screen.getByText("CruiseLinx")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Map" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "List Your Car" })).toBeInTheDocument();
  });

  it("shows Sign In and Get Started for logged-out users", () => {
    useQueryMock.mockReturnValue(undefined);
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get Started" })).toBeInTheDocument();
  });

  it("shows Dashboard and sign-out for logged-in users", async () => {
    useQueryMock.mockReturnValue({ _id: "u1", name: "Jane", email: "jane@x.com" });
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument()
    );
  });

  it("toggles the mobile menu", () => {
    useQueryMock.mockReturnValue(undefined);
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    fireEvent.click(toggle);
    expect(screen.getAllByText("Get Started").length).toBeGreaterThan(0);
    fireEvent.click(toggle);
  });

  it("provides theme toggle with accessible label", () => {
    useQueryMock.mockReturnValue(undefined);
    render(<Navbar />);
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });
});

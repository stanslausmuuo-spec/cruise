import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useMutation } from "convex/react";
import { ReviewForm } from "../reviews/review-form";

describe("ReviewForm", () => {
  const createReviewMock = vi.fn();

  beforeEach(() => {
    createReviewMock.mockReset();
    createReviewMock.mockResolvedValue(undefined);
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue(createReviewMock);
  });

  it("renders five star buttons and a textarea", () => {
    render(<ReviewForm bookingId="b1" />);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(5);
    expect(screen.getByPlaceholderText("Share your experience...")).toBeInTheDocument();
  });

  it("submit is disabled until rating and comment are provided", () => {
    render(<ReviewForm bookingId="b1" />);
    expect(screen.getByRole("button", { name: /Submit Review/ })).toBeDisabled();
  });

  it("enables submit after rating and comment", () => {
    render(<ReviewForm bookingId="b1" />);
    fireEvent.click(screen.getAllByRole("button")[3]);
    fireEvent.change(screen.getByPlaceholderText("Share your experience..."), {
      target: { value: "Great experience, car was clean" },
    });
    expect(screen.getByRole("button", { name: /Submit Review/ })).toBeEnabled();
  });

  it("calls createReview with the selected rating and comment", async () => {
    render(<ReviewForm bookingId="b1" onSuccess={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("button")[4]);
    fireEvent.change(screen.getByPlaceholderText("Share your experience..."), {
      target: { value: "Fantastic car, highly recommend" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Review/ }));
    await waitFor(() => {
      expect(createReviewMock).toHaveBeenCalledWith(
        expect.objectContaining({ bookingId: "b1", rating: 5 })
      );
    });
  });

  it("calls onSuccess after a successful submit", async () => {
    const onSuccess = vi.fn();
    render(<ReviewForm bookingId="b1" onSuccess={onSuccess} />);
    fireEvent.click(screen.getAllByRole("button")[4]);
    fireEvent.change(screen.getByPlaceholderText("Share your experience..."), {
      target: { value: "Fantastic car, highly recommend" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Review/ }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("does not call createReview without a rating", async () => {
    render(<ReviewForm bookingId="b1" />);
    fireEvent.change(screen.getByPlaceholderText("Share your experience..."), {
      target: { value: "Great car, would rent again" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Review/ }));
    await waitFor(() => expect(createReviewMock).not.toHaveBeenCalled());
  });
});

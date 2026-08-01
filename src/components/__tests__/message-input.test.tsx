import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageInput } from "../messaging/message-input";

describe("MessageInput", () => {
  it("renders with default placeholder", () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
  });

  it("uses a custom placeholder", () => {
    render(<MessageInput onSend={vi.fn()} placeholder="Say hi" />);
    expect(screen.getByPlaceholderText("Say hi")).toBeInTheDocument();
  });

  it("submits trimmed message and clears the field", () => {
    const onSend = vi.fn();
    const { container } = render(<MessageInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("Type a message...");
    const form = container.querySelector("form")!;
    fireEvent.change(input, { target: { value: "  Hello there  " } });
    fireEvent.submit(form);
    expect(onSend).toHaveBeenCalledWith("Hello there");
    expect(input).toHaveValue("");
  });

  it("does not send empty or whitespace-only messages", () => {
    const onSend = vi.fn();
    const { container } = render(<MessageInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("Type a message...");
    const form = container.querySelector("form")!;
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(form);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables input and button when disabled", () => {
    render(<MessageInput onSend={vi.fn()} disabled />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled();
  });

  it("submit button is disabled when the message is empty", () => {
    render(<MessageInput onSend={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("submit button becomes enabled when a message is typed", () => {
    render(<MessageInput onSend={vi.fn()} />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "hi" } });
    expect(screen.getByRole("button")).toBeEnabled();
  });
});

import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

function verifyMpesaSignature(data: string, signature: string, secret: string): boolean {
  if (!secret) return false;
  const expected = crypto.createHmac("sha512", secret).update(data).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function handleSuccessfulPayment(
  CheckoutRequestID: string,
  mpesaReceipt: string,
  amount: number,
  phone: string
) {
  // Try booking payment first
  try {
    const booking = await convex.query(api.bookings.getBookingByCheckoutRequestId, {
      checkoutRequestId: CheckoutRequestID,
    });

    if (booking) {
      await convex.mutation(api.bookings.confirmBookingPayment, {
        checkoutRequestId: CheckoutRequestID,
        mobileMoneyRef: mpesaReceipt,
      });

      await convex.mutation(api.payments.updateTransactionStatus, {
        reference: CheckoutRequestID,
        status: "completed",
        metadata: { mpesaReceipt, phone, amount },
      });

      if (booking.guestId) {
        await convex.mutation(api.notifications.create, {
          userId: booking.guestId,
          type: "payment",
          title: "Payment Confirmed",
          body: `Your payment of KES ${amount} was successful. M-Pesa Receipt: ${mpesaReceipt}`,
          data: { bookingId: booking._id },
        });
      }

      if (booking.hostId) {
        await convex.mutation(api.notifications.create, {
          userId: booking.hostId,
          type: "payment",
          title: "Booking Payment Received",
          body: `Guest paid KES ${amount} for booking ${booking._id}`,
          data: { bookingId: booking._id },
        });
      }

      console.log("Booking payment confirmed:", CheckoutRequestID);
      return;
    }
  } catch (error) {
    console.error("Failed to process booking payment:", error);
  }

  // Try reveal payment
  try {
    const reveal = await convex.query(api.payments.getRevealByCheckoutRequestId, {
      checkoutRequestId: CheckoutRequestID,
    });

    if (reveal) {
      await convex.mutation(api.payments.confirmPayToReveal, {
        checkoutRequestId: CheckoutRequestID,
        mobileMoneyRef: mpesaReceipt,
      });

      await convex.mutation(api.payments.updateTransactionStatus, {
        reference: CheckoutRequestID,
        status: "completed",
        metadata: { mpesaReceipt, phone, amount },
      });

      // Notify user
      await convex.mutation(api.notifications.create, {
        userId: reveal.userId,
        type: "payment",
        title: "Contact Revealed",
        body: `Payment of KES ${amount} successful. M-Pesa Receipt: ${mpesaReceipt}`,
        data: { vehicleId: reveal.vehicleId },
      });

      console.log("Reveal payment confirmed:", CheckoutRequestID);
      return;
    }
  } catch (error) {
    console.error("Failed to process pay-to-reveal payment:", error);
  }

  // Try featured listing payment
  try {
    const featured = await convex.query(api.payments.getFeaturedByCheckoutRequestId, {
      checkoutRequestId: CheckoutRequestID,
    });

    if (featured) {
      await convex.mutation(api.payments.confirmFeaturedPayment, {
        checkoutRequestId: CheckoutRequestID,
        mobileMoneyRef: mpesaReceipt,
      });

      await convex.mutation(api.payments.updateTransactionStatus, {
        reference: CheckoutRequestID,
        status: "completed",
        metadata: { mpesaReceipt, phone, amount },
      });

      // Notify user
      await convex.mutation(api.notifications.create, {
        userId: featured.ownerId,
        type: "payment",
        title: "Featured Listing Activated",
        body: `Your featured listing payment of KES ${amount} was successful. M-Pesa Receipt: ${mpesaReceipt}`,
        data: { vehicleId: featured.vehicleId },
      });

      console.log("Featured listing payment confirmed:", CheckoutRequestID);
      return;
    }
  } catch (error) {
    console.error("Failed to process featured listing payment:", error);
  }

  console.warn("No matching payment record found for:", CheckoutRequestID);
}

async function handleFailedPayment(
  CheckoutRequestID: string,
  ResultCode: number,
  ResultDesc: string
) {
  try {
    await convex.mutation(api.payments.updateTransactionStatus, {
      reference: CheckoutRequestID,
      status: "failed",
      metadata: { resultCode: ResultCode, resultDesc: ResultDesc },
    });
  } catch (error) {
    console.error("Failed to update failed transaction:", error);
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.text();
    const body = JSON.parse(requestBody) as MpesaCallbackBody;

    // Verify M-Pesa callback signature
    const signature = request.headers.get("X-Safaricom-Signature");
    if (!signature) {
      console.error("Missing M-Pesa callback signature");
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.DARAJA_PASSKEY || "";
    if (!verifyMpesaSignature(requestBody, signature, secret)) {
      console.error("Invalid M-Pesa callback signature");
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid signature" }, { status: 401 });
    }

    console.log("M-Pesa callback received for:", body.Body?.stkCallback?.CheckoutRequestID);

    const stkCallback = body.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback" });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    if (ResultCode === 0) {
      // Idempotency: check if this checkout has already been processed
      try {
        const existing = await convex.query(api.payments.getTransactionByReference, {
          reference: CheckoutRequestID,
        });
        if (existing && existing.status === "completed") {
          console.log("Duplicate callback ignored for:", CheckoutRequestID);
          return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
        }
      } catch {
        // If transaction lookup fails, continue processing
      }

      const metadata = CallbackMetadata?.Item || [];
      const amount = metadata.find((i) => i.Name === "Amount")?.Value as number;
      const mpesaReceipt = metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string;
      const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value as string;

      await handleSuccessfulPayment(CheckoutRequestID, mpesaReceipt, amount, phone);
    } else {
      await handleFailedPayment(CheckoutRequestID, ResultCode, ResultDesc);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal error" });
  }
}

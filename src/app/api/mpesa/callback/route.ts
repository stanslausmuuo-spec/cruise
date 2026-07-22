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

export async function POST(request: Request) {
  try {
    const requestBody = await request.text();
    const body = JSON.parse(requestBody) as MpesaCallbackBody;

    const signature = request.headers.get("X-Safaricom-Signature");
    if (!signature) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.DARAJA_PASSKEY || "";
    if (!verifyMpesaSignature(requestBody, signature, secret)) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid signature" }, { status: 401 });
    }

    const stkCallback = body.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback" });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    const metadata = CallbackMetadata?.Item || [];
    const amount = metadata.find((i) => i.Name === "Amount")?.Value as number || 0;
    const mpesaReceipt = metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string || "";
    const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value as string || "";

    await convex.mutation(api.payments.processMpesaCallback, {
      checkoutRequestId: CheckoutRequestID,
      mpesaReceipt,
      amount,
      phone,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
    });

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal error" });
  }
}

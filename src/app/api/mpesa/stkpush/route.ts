import { NextResponse } from "next/server";
import { initiateSTKPush, generateReference } from "@/lib/mpesa";
import { z } from "zod";
import { cookies } from "next/headers";

const stkPushSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number required"),
  amount: z.number().positive("Amount must be positive"),
  accountReference: z.string().max(12).optional(),
  transactionDesc: z.string().max(13).optional(),
  type: z.enum(["booking", "reveal", "featured"]),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__convexAuthToken");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = stkPushSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { phoneNumber, type, metadata } = validation.data;
    const clientAmount = validation.data.amount;

    const fixedAmounts: Record<string, number> = { reveal: 500, featured: 2000 };
    const amount = fixedAmounts[type] ?? clientAmount;

    if (!fixedAmounts[type] && (!clientAmount || clientAmount < 100)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const accountReference = validation.data.accountReference || generateReference(type.toUpperCase());
    const transactionDesc = validation.data.transactionDesc || "Cruise Payment";

    const response = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
    });

    if (response.success) {
      return NextResponse.json({
        success: true,
        checkoutRequestId: response.transactionId,
        message: response.message,
        metadata,
      });
    }

    return NextResponse.json(
      { success: false, error: response.message },
      { status: 400 }
    );
  } catch (error) {
    console.error("STK push error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { email, otp, type } = await request.json();

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: "Email, OTP, and type are required" },
        { status: 400 }
      );
    }

    if (!["email_verification", "password_reset"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid OTP type" },
        { status: 400 }
      );
    }

    // Verify OTP
    const result = await convex.mutation(api.otp.verifyOTP, {
      email,
      otp,
      type,
    });

    return NextResponse.json({
      success: true,
      userId: result.userId,
      message: "OTP verified successfully",
    });
  } catch (error: unknown) {
    console.error("OTP verify error:", error);
    const message = error instanceof Error ? error.message : "Invalid or expired OTP";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { generateOTP } from "@/lib/email";
import { authRateLimit } from "@/lib/rate-limit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    const rateLimit = authRateLimit(`otp:send:${email}:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    if (!["email_verification", "password_reset"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid OTP type" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { exists: userExists, _id: userId } = await convex.query(api.auth.checkEmailExists, { email });
    
    if (type === "email_verification" && userExists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    if (type === "password_reset" && !userExists) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Convex
    await convex.mutation(api.otp.createOTP, {
      userId,
      email,
      otp,
      type,
    });

    // Send email with OTP
    // TODO: Integrate with email service (Resend, SendGrid, etc.)

    // TODO: Integrate with email service
    // await sendOTPEmail(email, otp, type);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
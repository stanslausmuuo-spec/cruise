import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { generateOTP } from "@/lib/email";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();

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
    const user = await convex.query(api.auth.getUserByEmail, { email });
    
    if (type === "email_verification" && user) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    if (type === "password_reset" && !user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Convex
    const userId = user?._id; // undefined for new users (email_verification)
    await convex.mutation(api.otp.createOTP, {
      userId,
      email,
      otp,
      type,
    });

    // Send email with OTP
    // In production, integrate with your email service (Resend, SendGrid, etc.)
    console.log(`OTP for ${email} (${type}): ${otp}`);

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
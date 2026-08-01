import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function GET(request: Request) {
  try {
    const convex = getConvexClient();
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
    }

    const subscription = await convex.query(api.payments.getPlanByCheckoutRequestId, {
      checkoutRequestId,
    });

    if (!subscription) {
      return NextResponse.json({ activated: false });
    }

    if (subscription.active && subscription.mobileMoneyRef) {
      return NextResponse.json({
        activated: true,
        mobileMoneyRef: subscription.mobileMoneyRef,
        vehicleId: subscription.vehicleId,
      });
    }

    return NextResponse.json({ activated: false });
  } catch (error) {
    console.error("Plan status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
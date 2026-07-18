import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
    }

    const featured = await convex.query(api.payments.getFeaturedByCheckoutRequestId, {
      checkoutRequestId,
    });

    if (!featured) {
      return NextResponse.json({ activated: false });
    }

    if (featured.active && featured.mobileMoneyRef) {
      return NextResponse.json({
        activated: true,
        mobileMoneyRef: featured.mobileMoneyRef,
        vehicleId: featured.vehicleId,
      });
    }

    return NextResponse.json({ activated: false });
  } catch (error) {
    console.error("Featured status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
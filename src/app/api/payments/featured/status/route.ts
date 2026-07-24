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
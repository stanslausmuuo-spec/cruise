import { redirect } from "next/navigation";

export default async function FeaturedRedirectPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  redirect(`/payments/plans/${vehicleId}`);
}

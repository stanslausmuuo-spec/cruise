import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — CruiseLinx Car Rental",
  description:
    "CruiseLinx refund and cancellation policy. CruiseLinx never holds rental money; plans are the only payments made to CruiseLinx.",
};

const sections = [
  {
    title: "Overview",
    content:
      "CruiseLinx is a listing platform. We do not receive, hold, or transmit rental payments between Hosts and Renters. Rental money is settled directly between the parties (cash or person-to-person M-Pesa). For that reason, most cancellations on CruiseLinx do not involve any money changing hands with CruiseLinx.\n\nThe only payments made to CruiseLinx are optional Host plan purchases (Basic and Premium), which are described below.",
  },
  {
    title: "Booking Cancellations",
    content:
      "Cancelling a booking simply releases the reserved dates on the vehicle's calendar. There are no CruiseLinx-held funds to refund.\n\nRenter cancels before the Host approves: The request is withdrawn and the dates are released immediately. No obligations remain.\n\nHost declines a request: The request is cancelled and the dates are released. No obligations remain.\n\nNo response within 48 hours: Pending requests automatically expire after 48 hours and the dates are released.\n\nAfter the Host approves: The booking is confirmed and both parties are expected to honour it. If either party cancels a confirmed booking, the dates are released, but any amounts already agreed or exchanged between the parties are a matter between them. Repeated cancellations of confirmed bookings may result in account suspension.",
  },
  {
    title: "Host Plans (Basic & Premium)",
    content:
      "Host plans are paid once at purchase and do not auto-renew. Once a plan payment has been successfully processed and the plan activated, the purchase is non-refundable.\n\nWe will refund a plan purchase in the following circumstances: (a) the payment was processed but the plan was never activated due to a technical error; (b) you were charged twice for the same purchase; or (c) the charge was made without your authorisation. In these cases, contact us and we will refund the incorrect amount to your M-Pesa account within a reasonable period.",
  },
  {
    title: "How to Request a Refund",
    content:
      "Email us at hello@cruiselinx.com with your full name, phone number, the transaction reference (from your M-Pesa confirmation), and the amount charged. We will investigate and respond within 7 business days. Refunds are processed to the same M-Pesa account that made the payment.",
  },
  {
    title: "Disputes Between Hosts and Renters",
    content:
      "Because rental money does not flow through CruiseLinx, we cannot reverse or refund payments made directly between parties. If you have a dispute about a direct payment, damage, or a deposit, refer to the evidence recorded in the Service (check-in/check-out photos, booking records, chat history) and resolve it directly with the other party. We are happy to mediate with both parties' records available.",
  },
];

export default function RefundsPage() {
  return (
    <LegalDocument
      title="Refund & Cancellation Policy"
      lastUpdated="1 August 2026"
      sections={sections}
    />
  );
}

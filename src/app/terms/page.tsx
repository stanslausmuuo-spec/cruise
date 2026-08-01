import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service — CruiseLinx Car Rental",
  description:
    "The terms governing the use of CruiseLinx, the peer-to-peer car rental marketplace connecting vehicle owners with renters.",
};

const sections = [
  {
    title: "Agreement to Terms",
    content:
      "These Terms of Service (\"Terms\") govern your access to and use of the CruiseLinx platform, including our website, mobile services, and any related features (collectively, the \"Service\"). By creating an account, listing a vehicle, requesting a booking, or otherwise using the Service, you agree to be bound by these Terms. If you do not agree, you may not use the Service.\n\nThese Terms form a legally binding contract between you and CruiseLinx under the Laws of Kenya, including the Contracts Act (Cap 23) and the Kenya Information and Communications (Electronic Transactions) Act, 2011. By using the Service you confirm that you have read, understood, and accepted these Terms.",
  },
  {
    title: "Eligibility",
    content:
      "You must be at least 18 years old to use the Service. You must provide accurate, current, and complete information when registering, including a valid government-issued identity document (National ID or Passport) for verification. You may only hold one account, and you may not transfer your account to another person.",
  },
  {
    title: "The Service",
    content:
      "CruiseLinx operates an online marketplace that connects vehicle owners (\"Hosts\") with people who wish to rent vehicles (\"Renters\"). CruiseLinx is a listing and facilitation platform only. We do not own any vehicles listed on the Service, we are not a party to the rental agreement between a Host and a Renter, and we do not receive, hold, or transmit rental payments between Hosts and Renters.\n\nThe rental price is agreed between the Host and the Renter and is settled directly between them, in cash or person-to-person (such as M-Pesa), at the point of pickup unless the parties agree otherwise. CruiseLinx never handles rental money.",
  },
  {
    title: "Accounts",
    content:
      "You are responsible for safeguarding your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account. You must not use the Service to create multiple accounts, to impersonate others, or to misrepresent your identity or verification status.",
  },
  {
    title: "Host Obligations",
    content:
      "By listing a vehicle, you confirm that: (a) you own the vehicle or are lawfully authorised to rent it out; (b) the vehicle is roadworthy, insured as required by law, and meets the description, photos, and features in your listing; (c) your listing is accurate, and the price per day is stated in Kenyan Shillings (KES); (d) you will keep your availability calendar accurate; and (e) you hold a valid National ID or Passport verified through our identity checks.\n\nWhen you approve a booking request, you enter into a binding agreement with the Renter to make the vehicle available for the dates and price stated. Failure to honour an approved booking may result in suspension of your account.",
  },
  {
    title: "Renter Obligations",
    content:
      "By requesting a booking, you confirm that you hold a valid driving licence permitting you to drive the vehicle class booked, and that you are not using the Service to commit fraud or any unlawful act. You agree to: (a) return the vehicle on time and in the condition you received it; (b) pay the Host the agreed total price directly at pickup as agreed; (c) report any damage immediately; and (d) not sublet, resell, or misuse the vehicle.\n\nA booking request is not confirmed until the Host approves it. Once approved, you are bound to the rental for the dates and price stated unless cancelled in accordance with our Refund & Cancellation Policy.",
  },
  {
    title: "Booking & Confirmation",
    content:
      "When you request a booking, the dates are provisionally held and the Host is notified. The booking is confirmed only when the Host approves the request. If the Host does not respond within 48 hours, the request automatically expires and the dates are released. The Host may decline any request.\n\nThe total price displayed at booking is the rental price set by the Host. This price is paid to the Host directly and is not collected by CruiseLinx at any point.",
  },
  {
    title: "Payments",
    content:
      "Rental payments: CruiseLinx does not collect, hold, or process rental payments. Renters pay Hosts directly by a method agreed between them (e.g., cash or person-to-person M-Pesa transfer). Any disputes over rental payments are between the Host and the Renter.\n\nPlan purchases: The only payments made to CruiseLinx are for optional Host plans (see below), which are processed through M-Pesa (Safaricom). The amount charged is validated by our servers and corresponds to the plan price published at the time of purchase. If you believe you were charged incorrectly, contact us and we will investigate within a reasonable period.",
  },
  {
    title: "Host Plans (Free, Basic, Premium)",
    content:
      "CruiseLinx offers optional paid plans for Hosts: (a) Free — standard listing visibility; (b) Basic — your phone number is shown to Renters; and (c) Premium — your listing is featured on the homepage and highlighted in search results. Plan prices are published on the Service and may change for future purchases. Purchased plans do not auto-renew; they expire at the end of the paid period and your listing reverts to Free status automatically. Plans are non-refundable once activated (see our Refund & Cancellation Policy). Expiry of a plan only affects listing visibility and never affects existing or active bookings.",
  },
  {
    title: "Cancellation & Refunds",
    content:
      "Because CruiseLinx does not hold rental payments, cancellations do not involve refunds of rental money. Cancelling a booking simply releases the reserved dates. Any amounts already paid between a Host and Renter are a matter between them.\n\nRenters may cancel a pending (unapproved) booking at any time. Hosts may decline or cancel requests. Once a booking is confirmed, cancelling it may affect your standing and repeated cancellations may result in account suspension.\n\nPayments made to CruiseLinx for Host plans are refunded only in the circumstances described in our Refund & Cancellation Policy.",
  },
  {
    title: "Damage, Deposits & Disputes",
    content:
      "Check-in and check-out are documented with photographs taken through the Service. Renters and Hosts are strongly encouraged to agree on any security deposit directly between themselves; CruiseLinx does not hold deposits.\n\nIf damage is reported at check-out, the booking is marked as disputed and the evidence (check-in/check-out photos, booking records, and chat history) is made available to both parties and to CruiseLinx for facilitation. The parties are expected to resolve the matter between themselves in good faith. CruiseLinx may provide mediation and records but does not arbitrate or adjudicate monetary claims, and we are not a party to any claim between a Host and a Renter.",
  },
  {
    title: "Prohibited Conduct",
    content:
      "You may not use the Service to: (a) violate any Kenyan law or regulation; (b) commit fraud, including fake listings, fake bookings, or identity fraud; (c) post false, defamatory, or misleading content; (d) send unsolicited or spam messages; (e) attempt to circumvent verification, payments, or platform safeguards; (f) scrape, copy, or resell content from the Service; (g) harass, threaten, or abuse other users; or (h) list vehicles you are not authorised to list. We may suspend or terminate accounts that violate these rules.",
  },
  {
    title: "Intellectual Property",
    content:
      "The CruiseLinx name, logo, design, and all content on the Service are owned by CruiseLinx and protected by Kenyan and international intellectual property laws. You may not use our name, logo, or branding without our prior written consent. You retain ownership of the content you submit (such as listing photos and descriptions), and you grant us a non-exclusive, worldwide, royalty-free licence to host, display, and process that content solely to operate the Service.",
  },
  {
    title: "Privacy",
    content:
      "Our handling of personal data — including identity documents, chat messages, booking records, and payment information — is described in our Privacy Policy, which forms part of these Terms.",
  },
  {
    title: "Third-Party Services",
    content:
      "The Service relies on third-party providers, including Convex (cloud hosting), Safaricom M-Pesa (plan payments), and push-notification providers. Your use of those services is subject to their own terms and privacy policies. CruiseLinx is not liable for the acts or omissions of third-party providers.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by law: (a) CruiseLinx is a facilitator and is not liable for disputes, damages, theft, accidents, or losses arising between Hosts and Renters, including any off-platform payment arrangements; (b) the Service is provided \"as is\" without warranties of any kind; and (c) our total liability to you arising from your use of the Service is limited to the total amount you have actually paid to CruiseLinx (for example, plan purchases) in the twelve months preceding the claim. Nothing in these Terms limits liability that cannot be limited under Kenyan law.",
  },
  {
    title: "Governing Law & Dispute Resolution",
    content:
      "These Terms are governed by the laws of the Republic of Kenya. The parties will first attempt to resolve any dispute through good-faith negotiation. If the dispute is not resolved within thirty (30) days, either party may refer the matter to mediation or file proceedings in the courts of Kenya, and the parties submit to the exclusive jurisdiction of the courts of Nairobi, Kenya.",
  },
  {
    title: "Changes to These Terms",
    content:
      "We may update these Terms from time to time. When we make material changes, we will update the \"Last updated\" date and notify users through the Service. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.",
  },
  {
    title: "Severability",
    content:
      "If any provision of these Terms is held to be invalid or unenforceable, that provision will be severed and the remaining provisions will remain in full force and effect.",
  },
  {
    title: "Contact Us",
    content:
      "If you have any questions about these Terms, contact us at hello@cruiselinx.com.",
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated="1 August 2026"
      sections={sections}
    />
  );
}

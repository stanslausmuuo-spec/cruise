import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy — CruiseLinx Car Rental",
  description:
    "Read the CruiseLinx privacy policy. Learn how we collect, use, and protect your personal information on our car rental platform.",
};

const sections = [
  {
    title: "Who We Are",
    content:
      "This Privacy Policy explains how CruiseLinx (\"we\", \"us\") collects, uses, stores, and protects your personal information when you use our platform. We are committed to protecting your privacy and process personal data in accordance with the Kenya Data Protection Act, 2019 and its regulations.\n\nContact for privacy matters: privacy@cruiselinx.com.",
  },
  {
    title: "Information We Collect",
    content:
      "Account information: your name, email address, phone number, profile photo, and preferences.\n\nIdentity documents (sensitive personal data): for verification, we collect government-issued identity documents such as a National ID, Passport, or Driving Licence, and for Hosts, vehicle logbook documents.\n\nListing information: vehicle photos, descriptions, price, location, and availability.\n\nBooking information: rental dates, vehicles, and amounts agreed between parties.\n\nCommunications: the content of messages you send through our in-app chat, including read receipts.\n\nUsage information: device type, browser, IP address, and pages visited, collected automatically when you use the Service.\n\nPayment information: for Host plan purchases processed through M-Pesa, we receive the transaction reference and confirmation details. We do not store your M-Pesa PIN or full payment credentials.",
  },
  {
    title: "Legal Basis for Processing",
    content:
      "We process personal data on the following legal bases: (a) performance of a contract — to operate your account, listings, and bookings; (b) legal obligations — including identity verification and record-keeping under Kenyan law; (c) legitimate interests — to keep the platform safe, prevent fraud, and resolve disputes; and (d) consent — where we ask for it, for example for push notifications.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use your information to: (a) provide and operate the Service, including verification, listings, bookings, and messaging; (b) verify your identity and eligibility to host or rent; (c) communicate with you about bookings, payments, and service updates; (d) prevent fraud, abuse, and prohibited conduct; (e) resolve disputes between users using booking records, check-in/check-out photos, and chat history; (f) improve and secure the Service; and (g) comply with legal obligations. We never sell your personal data to third parties.",
  },
  {
    title: "Identity Documents (Sensitive Data)",
    content:
      "Identity documents are treated as sensitive personal data. They are accessed only by our verification team for the purpose of confirming your identity, are stored with restricted access, and are not shared with other users or third parties except as required by law. Verification status (approved or not) is shown to other users; the documents themselves are not.",
  },
  {
    title: "Chat & Messaging",
    content:
      "Messages sent through our in-app chat are stored on our servers so that conversation history is available to you and the other party. Because messages may be needed to resolve disputes or investigate abuse, our team can access message content in limited circumstances (for example, a dispute or a safety investigation). Push notifications may include a preview of the message content. Do not share sensitive information (such as full identity numbers or passwords) through chat.",
  },
  {
    title: "How We Share Information",
    content:
      "We share personal data only with: (a) service providers who process data on our behalf — including Convex (our cloud database provider, which stores data on servers outside Kenya, including in the United States) and Safaricom (which processes M-Pesa payments for Host plans); (b) other users, where necessary to the service — such as your name and verification status being visible to other users, and your phone number being shown to Renters when you hold a Basic or Premium plan; and (c) authorities, where required by law or in response to a valid legal request. We do not sell personal data.",
  },
  {
    title: "International Transfers",
    content:
      "Your personal data is stored on Convex cloud infrastructure, which may be located outside Kenya. By using the Service, you acknowledge that your data may be transferred to and stored in countries outside Kenya, and we take steps to ensure that such transfers are protected by appropriate safeguards.",
  },
  {
    title: "Data Retention",
    content:
      "We retain personal data only as long as necessary: (a) account data — while your account is active and for a reasonable period after closure for legal and dispute-resolution purposes; (b) identity documents — for as long as required for verification and legal compliance; (c) bookings, reviews, and dispute records — for a reasonable period after the transaction, including to support dispute resolution; (d) chat messages — while needed to operate conversations and resolve disputes; and (e) audit and security logs — as required for security purposes.",
  },
  {
    title: "Your Rights",
    content:
      "Under the Data Protection Act, 2019, you have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate data; (c) request deletion of your data, subject to legal and contractual retention requirements; (d) data portability; (e) object to processing in certain circumstances; and (f) withdraw consent where processing is based on consent.\n\nTo exercise any of these rights, email privacy@cruiselinx.com. You also have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) at odpc.go.ke.",
  },
  {
    title: "Security",
    content:
      "We protect your data using industry-standard measures: encryption in transit (TLS) for all traffic, encryption at rest for stored data, restricted access controls for sensitive records, and audit logging of sensitive actions. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Cookies & Local Storage",
    content:
      "We use browser local storage for essential functions, such as remembering your sign-in preference (the \"remember me\" option) and storing your theme preference. We do not use third-party advertising trackers.",
  },
  {
    title: "Children",
    content:
      "The Service is intended for users aged 18 and over. We do not knowingly collect personal data from children under 18. If you believe a child has provided us with personal data, contact us and we will delete it.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Material changes will be communicated through the Service, and the \"Last updated\" date will be revised. Continued use of the Service after changes take effect constitutes acceptance of the updated policy.",
  },
  {
    title: "Contact Us",
    content:
      "Questions about this policy or your data: privacy@cruiselinx.com.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="1 August 2026"
      intro="This policy describes how CruiseLinx collects, uses, stores, and protects your personal information. It covers the data you share with us when you create an account, verify your identity, list a vehicle, request a booking, and use our messaging features."
      sections={sections}
    />
  );
}

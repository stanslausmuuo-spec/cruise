import { env } from "@/lib/env";
import { DarajaProvider } from "./daraja";
import type { PaymentRequest, PaymentResponse } from "./payment-provider";

const provider = new DarajaProvider();

export async function initiateSTKPush(request: PaymentRequest): Promise<PaymentResponse> {
  if (!env.DARAJA_CONSUMER_KEY) {
    return { success: false, message: "M-Pesa payment service is currently unavailable. Please try again later." };
  }
  return provider.sendSTKPush(request);
}

export async function checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
  return provider.checkStatus(transactionId);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("7")) return "254" + cleaned;
  if (cleaned.startsWith("254")) return cleaned;
  return "254" + cleaned;
}

export function generateReference(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
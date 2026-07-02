import type { PaymentProvider, PaymentRequest, PaymentResponse } from "./payment-provider";

export class DarajaProvider implements PaymentProvider {
  private consumerKey: string;
  private consumerSecret: string;
  private baseUrl: string;
  private passkey: string;
  private shortCode: string;

  constructor() {
    this.consumerKey = process.env.DARAJA_CONSUMER_KEY || "";
    this.consumerSecret = process.env.DARAJA_CONSUMER_SECRET || "";
    this.passkey = process.env.DARAJA_PASSKEY || "";
    this.shortCode = process.env.DARAJA_SHORTCODE || "174379";
    this.baseUrl =
      process.env.DARAJA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");
    const res = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await res.json();
    return data.access_token;
  }

  async sendSTKPush(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${this.shortCode}${this.passkey}${timestamp}`
      ).toString("base64");

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(request.amount),
        PartyA: this.formatPhone(request.phoneNumber),
        PartyB: this.shortCode,
        PhoneNumber: this.formatPhone(request.phoneNumber),
        CallBackURL: `${process.env.NEXT_PUBLIC_URL}/api/mpesa/callback`,
        AccountReference: request.accountReference.slice(0, 12),
        TransactionDesc: request.transactionDesc.slice(0, 13),
      };

      const res = await fetch(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.ResponseCode === "0") {
        return {
          success: true,
          transactionId: data.CheckoutRequestID,
          message: "STK push sent. Check your phone.",
        };
      }

      return { success: false, message: data.ResponseDescription || "Payment failed" };
    } catch (error) {
      return { success: false, message: "Failed to process payment" };
    }
  }

  async checkStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = Buffer.from(
        `${this.shortCode}${this.passkey}${timestamp}`
      ).toString("base64");

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: transactionId,
      };

      const res = await fetch(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.ResultCode === "0") {
        return { success: true, transactionId, message: "Payment successful" };
      }

      return { success: false, message: data.ResultDesc || "Payment not found" };
    } catch (error) {
      return { success: false, message: "Failed to check payment status" };
    }
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
    if (cleaned.startsWith("7")) return "254" + cleaned;
    if (cleaned.startsWith("254")) return cleaned;
    return "254" + cleaned;
  }

  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

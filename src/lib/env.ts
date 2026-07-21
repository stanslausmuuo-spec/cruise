import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DARAJA_CONSUMER_KEY: z.string().min(1, "M-Pesa consumer key is required"),
    DARAJA_CONSUMER_SECRET: z.string().min(1, "M-Pesa consumer secret is required"),
    DARAJA_PASSKEY: z.string().min(1, "M-Pesa passkey is required"),
    DARAJA_SHORTCODE: z.string().min(1, "M-Pesa shortcode is required"),
    DARAJA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().url("Convex URL is required"),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
    NEXT_PUBLIC_URL: z.string().url("App URL is required"),
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  },
  runtimeEnv: {
    DARAJA_CONSUMER_KEY: process.env.DARAJA_CONSUMER_KEY,
    DARAJA_CONSUMER_SECRET: process.env.DARAJA_CONSUMER_SECRET,
    DARAJA_PASSKEY: process.env.DARAJA_PASSKEY,
    DARAJA_SHORTCODE: process.env.DARAJA_SHORTCODE,
    DARAJA_ENV: process.env.DARAJA_ENV,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
  skipValidation: process.env.NODE_ENV === "test",
});

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alerts from "../alerts.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as cleanup from "../cleanup.js";
import type * as cron from "../cron.js";
import type * as crons from "../crons.js";
import type * as disputes from "../disputes.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_sanitize from "../lib/sanitize.js";
import type * as lib_validateFile from "../lib/validateFile.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as otp from "../otp.js";
import type * as payments from "../payments.js";
import type * as push from "../push.js";
import type * as pushActions from "../pushActions.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";
import type * as vehicles from "../vehicles.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alerts: typeof alerts;
  audit: typeof audit;
  auth: typeof auth;
  bookings: typeof bookings;
  cleanup: typeof cleanup;
  cron: typeof cron;
  crons: typeof crons;
  disputes: typeof disputes;
  "lib/auth": typeof lib_auth;
  "lib/crypto": typeof lib_crypto;
  "lib/sanitize": typeof lib_sanitize;
  "lib/validateFile": typeof lib_validateFile;
  messages: typeof messages;
  notifications: typeof notifications;
  otp: typeof otp;
  payments: typeof payments;
  push: typeof push;
  pushActions: typeof pushActions;
  reviews: typeof reviews;
  seed: typeof seed;
  storage: typeof storage;
  users: typeof users;
  vehicles: typeof vehicles;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

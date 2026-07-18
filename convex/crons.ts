import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "Expire featured listings",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cron.expireFeaturedListings
);

crons.daily(
  "Auto-complete bookings",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cron.autoCompleteBookings
);

crons.daily(
  "Release deposits",
  { hourUTC: 4, minuteUTC: 0 },
  internal.cron.releaseDeposits
);

crons.daily(
  "Cleanup orphaned images",
  { hourUTC: 5, minuteUTC: 0 },
  internal.cron.cleanupOrphanedImages
);

crons.daily(
  "Cleanup expired reveals",
  { hourUTC: 6, minuteUTC: 0 },
  internal.cron.cleanupExpiredReveals
);

crons.hourly(
  "Cleanup failed transactions",
  { minuteUTC: 0 },
  internal.cron.cleanupFailedTransactions
);

export default crons;
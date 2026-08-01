import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "Downgrade expired tiers",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cron.downgradeExpiredTiers
);

crons.daily(
  "Auto-complete bookings",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cron.autoCompleteBookings
);

crons.daily(
  "Auto-expire pending booking requests",
  { hourUTC: 4, minuteUTC: 0 },
  internal.cron.autoExpirePendingBookings
);

crons.daily(
  "Cleanup orphaned images",
  { hourUTC: 5, minuteUTC: 0 },
  internal.cron.cleanupOrphanedImages
);

crons.hourly(
  "Cleanup failed transactions",
  { minuteUTC: 0 },
  internal.cron.cleanupFailedTransactions
);

export default crons;
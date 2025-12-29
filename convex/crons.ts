import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 6 PM UTC
crons.daily(
  "journal-reminders",
  { hourUTC: 18, minuteUTC: 0 },
  internal.reminderLogic.checkReminders
);

export default crons;

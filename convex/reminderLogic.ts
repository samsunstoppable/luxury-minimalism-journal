import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const checkReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.reminderLogic.getUsersToRemind);
    
    for (const user of users) {
      await ctx.runAction(internal.emails.sendReminderEmail, {
        email: user.email,
        name: user.name,
      });
    }
  },
});

export const getUsersToRemind = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0];
    const allUsers = await ctx.db.query("users").collect();
    const usersToRemind = [];

    for (const user of allUsers) {
      if (!user.notificationsEnabled || !user.email) continue;

      // Check if they've already posted today
      const entry = await ctx.db
        .query("entries")
        .withIndex("by_user_date", (q) => q.eq("userId", user._id).eq("date", today))
        .unique();

      if (!entry) {
        usersToRemind.push({ email: user.email, name: user.name });
      }
    }
    
    return usersToRemind;
  },
});

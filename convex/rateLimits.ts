import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const checkAndIncrement = internalMutation({
  args: { 
    userId: v.id("users"), 
    action: v.string(), 
    limit: v.number() 
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const date = new Date(now).toISOString().split('T')[0];
    const key = `${args.userId}_${args.action}_${date}`;

    const rateLimit = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (rateLimit) {
      if (rateLimit.count >= args.limit) {
        return { allowed: false, count: rateLimit.count };
      }
      await ctx.db.patch(rateLimit._id, {
        count: rateLimit.count + 1,
      });
      return { allowed: true, count: rateLimit.count + 1 };
    } else {
      await ctx.db.insert("rateLimits", {
        key,
        count: 1,
        lastReset: now,
      });
      return { allowed: true, count: 1 };
    }
  },
});

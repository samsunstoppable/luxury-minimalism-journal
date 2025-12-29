import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sanitizeInput, getCurrentUser } from "./utils";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    date: v.string(),
    dayNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
        // Create dev user if not exists
        const userId = await ctx.db.insert("users", {
            tokenIdentifier: "dev-user",
            name: "Dev User",
            email: "dev@local.host",
            subscriptionStatus: "free",
        });
        
        return await ctx.db.insert("entries", {
            userId: userId,
            title: sanitizeInput(args.title),
            content: sanitizeInput(args.content),
            date: args.date,
            dayNumber: args.dayNumber,
        });
    }

    const dayNumber = args.dayNumber || ( ( (await ctx.db.query("entries").withIndex("by_user", q => q.eq("userId", user._id)).collect()).length % 7 ) + 1 );

    const entryId = await ctx.db.insert("entries", {
      userId: user._id,
      title: sanitizeInput(args.title),
      content: sanitizeInput(args.content),
      date: args.date,
      dayNumber: dayNumber,
    });

    if (dayNumber === 7 && user.email) {
        await ctx.scheduler.runAfter(0, internal.emails.sendCycleCompletionEmail, {
            email: user.email,
            name: user.name || "there",
        });
    }

    return entryId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const entries = await ctx.db
      .query("entries")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return entries;
  },
});

export const update = mutation({
  args: { id: v.id("entries"), title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Not found");
    if (entry.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
        title: sanitizeInput(args.title),
        content: sanitizeInput(args.content)
    });
  },
});

export const remove = mutation({
    args: { id: v.id("entries") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");
        
        const entry = await ctx.db.get(args.id);
        if (!entry) throw new Error("Not found");
        if (entry.userId !== user._id) throw new Error("Unauthorized");
        
        await ctx.db.delete(args.id);
    }
});


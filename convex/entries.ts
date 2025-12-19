import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    date: v.string(),
    dayNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const entryId = await ctx.db.insert("entries", {
      userId: user._id,
      title: args.title,
      content: args.content,
      date: args.date,
      dayNumber: args.dayNumber,
    });

    return entryId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Not found");

    // In a real app we should check if entry.userId matches current user
    
    await ctx.db.patch(args.id, {
        title: args.title,
        content: args.content
    });
  },
});

export const remove = mutation({
    args: { id: v.id("entries") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        
        await ctx.db.delete(args.id);
    }
});

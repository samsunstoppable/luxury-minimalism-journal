import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: { sessionId: v.id("sessions"), content: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
    if (!user) throw new Error("User not found");

    await ctx.db.insert("messages", {
        sessionId: args.sessionId,
        userId: user._id,
        role: args.role,
        content: args.content,
        timestamp: Date.now(),
    });
  }
});

export const list = query({
    args: { sessionId: v.id("sessions") },
    handler: async (ctx, args) => {
        return await ctx.db.query("messages")
            .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
            .order("asc") // Chat order
            .collect();
    }
});

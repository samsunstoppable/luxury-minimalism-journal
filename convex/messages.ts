import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { sanitizeInput, getCurrentUser } from "./utils";

export const send = mutation({
  args: { sessionId: v.id("sessions"), content: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== user._id) throw new Error("Unauthorized");

    const sanitizedContent = sanitizeInput(args.content);

    await ctx.db.insert("messages", {
        sessionId: args.sessionId,
        userId: user._id,
        role: args.role,
        content: sanitizedContent,
        timestamp: Date.now(),
    });

    // Trigger AI response if it's a user message
    if (args.role === "user") {
        await ctx.scheduler.runAfter(0, api.actions.generateChatReply, {
            sessionId: args.sessionId,
            content: sanitizedContent
        });
    }
  }
});

export const saveAIMessage = mutation({
    args: { sessionId: v.id("sessions"), content: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) throw new Error("Session not found");
        
        await ctx.db.insert("messages", {
            sessionId: args.sessionId,
            userId: session.userId,
            role: "assistant",
            content: args.content,
            timestamp: Date.now(),
        });
    }
});

export const list = query({
    args: { sessionId: v.id("sessions") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) return [];

        const session = await ctx.db.get(args.sessionId);
        if (!session || session.userId !== user._id) return [];

        return await ctx.db.query("messages")
            .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
            .order("asc") // Chat order
            .collect();
    }
});


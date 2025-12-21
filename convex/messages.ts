import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const send = mutation({
  args: { sessionId: v.id("sessions"), content: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let userId;
    if (identity) {
      const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
      if (!user) throw new Error("User not found");
      userId = user._id;
    } else {
        // Fallback for local dev
        const devToken = "dev-user";
        let devUser = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", devToken)).unique();
        if (!devUser) {
             // In case session was created but user somehow missing, though unlikely if sequential
             userId = await ctx.db.insert("users", {
                tokenIdentifier: devToken,
                name: "Dev User",
                email: "dev@local.host",
                subscriptionStatus: "free",
            });
        } else {
            userId = devUser._id;
        }
    }

    await ctx.db.insert("messages", {
        sessionId: args.sessionId,
        userId: userId,
        role: args.role,
        content: args.content,
        timestamp: Date.now(),
    });

    // Trigger AI response if it's a user message
    if (args.role === "user") {
        await ctx.scheduler.runAfter(0, api.actions.generateChatReply, {
            sessionId: args.sessionId,
            content: args.content
        });
    }
  }
});

export const saveAIMessage = mutation({
    args: { sessionId: v.id("sessions"), content: v.string() },
    handler: async (ctx, args) => {
        // AI messages might not need a specific userId, or we can use the first admin/dev user
        // For now, let's fetch the session to get the owner, or just use a system/dev ID
        const session = await ctx.db.get(args.sessionId);
        if (!session) throw new Error("Session not found");
        
        await ctx.db.insert("messages", {
            sessionId: args.sessionId,
            userId: session.userId, // Attribution to session owner for now, or could be null if schema allowed
            role: "assistant",
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

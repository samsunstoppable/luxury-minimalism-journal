import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, sanitizeInput } from "./utils";

export const create = mutation({
  args: { personaId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    let userId;
    if (!user) {
        // Fallback for local dev: Use or create a "Dev User"
        const devToken = "dev-user";
        userId = await ctx.db.insert("users", {
            tokenIdentifier: devToken,
            name: "Dev User",
            email: "dev@local.host",
            subscriptionStatus: "free",
        });
    } else {
        userId = user._id;
    }

    const sessionId = await ctx.db.insert("sessions", {
        userId: userId,
        personaId: args.personaId,
        status: "pending",
        startedAt: Date.now(),
    });
    return sessionId;
  }
});

export const updateStatus = mutation({
    args: { sessionId: v.id("sessions"), status: v.string() },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");
        const session = await ctx.db.get(args.sessionId);
        if (!session || session.userId !== user._id) throw new Error("Unauthorized");

        await ctx.db.patch(args.sessionId, { status: args.status });
    }
});

export const saveTranscript = mutation({
    args: { sessionId: v.id("sessions"), transcript: v.string() },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");
        const session = await ctx.db.get(args.sessionId);
        if (!session || session.userId !== user._id) throw new Error("Unauthorized");

        await ctx.db.patch(args.sessionId, { transcript: sanitizeInput(args.transcript) });
    }
});

export const appendTranscript = mutation({
    args: { sessionId: v.id("sessions"), text: v.string() },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");
        const session = await ctx.db.get(args.sessionId);
        if (!session || session.userId !== user._id) throw new Error("Unauthorized");

        const newTranscript = (session.transcript || "") + "\n\n" + sanitizeInput(args.text);
        await ctx.db.patch(args.sessionId, { transcript: newTranscript });
    }
});

export const saveAnalysis = mutation({
    args: { sessionId: v.id("sessions"), analysis: v.string() },
    handler: async (ctx, args) => {
        // This is typically called by an action. Ownership check should still apply if possible.
        const session = await ctx.db.get(args.sessionId);
        if (!session) throw new Error("Session not found");
        
        await ctx.db.patch(args.sessionId, { 
            analysis: args.analysis,
            status: "completed",
            completedAt: Date.now()
        });
    }
});

export const get = query({
    args: { sessionId: v.id("sessions") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) return null;
        const session = await ctx.db.get(args.sessionId);
        if (!session || session.userId !== user._id) return null;
        return session;
    }
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user) return [];

        return await ctx.db
            .query("sessions")
            .withIndex("by_user", q => q.eq("userId", user._id))
            .order("desc")
            .collect();
    }
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAudio = mutation({
    args: { sessionId: v.id("sessions"), storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");
        const session = await ctx.db.get(args.sessionId);
        if (!session || session.userId !== user._id) throw new Error("Unauthorized");

        const url = await ctx.storage.getUrl(args.storageId);
        await ctx.db.patch(args.sessionId, { audioUrl: url || undefined });
        return url;
    }
});


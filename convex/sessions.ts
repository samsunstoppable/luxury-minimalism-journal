import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: { personaId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
    if (!user) throw new Error("User not found");

    const sessionId = await ctx.db.insert("sessions", {
        userId: user._id,
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
        await ctx.db.patch(args.sessionId, { status: args.status });
    }
});

export const saveTranscript = mutation({
    args: { sessionId: v.id("sessions"), transcript: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sessionId, { transcript: args.transcript });
    }
});

export const appendTranscript = mutation({
    args: { sessionId: v.id("sessions"), text: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) throw new Error("Session not found");
        const newTranscript = (session.transcript || "") + "\n\n" + args.text;
        await ctx.db.patch(args.sessionId, { transcript: newTranscript });
    }
});

export const saveAnalysis = mutation({
    args: { sessionId: v.id("sessions"), analysis: v.string() },
    handler: async (ctx, args) => {
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
        return await ctx.db.get(args.sessionId);
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
        const url = await ctx.storage.getUrl(args.storageId);
        await ctx.db.patch(args.sessionId, { audioUrl: url || undefined });
        return url;
    }
});

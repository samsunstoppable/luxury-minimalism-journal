import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const getByToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.token))
      .unique();
  },
});

export const updateSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
    status: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});

export const updateSummary = mutation({
  args: { userId: v.id("users"), summary: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { summary: args.summary });
  }
});

export const updateDefaultPersona = mutation({
  args: { personaId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { defaultPersonaId: args.personaId });
  }
});

export const updateNotificationSettings = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { notificationsEnabled: args.enabled });
  }
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { onboardingCompleted: true });
  }
});

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }

    // If it's a new identity, create a new `User`.
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name!,
      email: identity.email!,
      subscriptionStatus: "free",
      notificationsEnabled: true,
      onboardingCompleted: false,
    });

    // Send Welcome Email
    await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
        email: identity.email!,
        name: identity.name!,
    });

    return userId;
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    // 1. Delete Entries
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // 2. Delete Sessions and their Messages
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const session of sessions) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      await ctx.db.delete(session._id);
    }

    // 3. Delete Daily Chats and their Messages
    const dailyChats = await ctx.db
      .query("dailyChats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const chat of dailyChats) {
      const messages = await ctx.db
        .query("dailyChatMessages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .collect();
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      await ctx.db.delete(chat._id);
    }

    // 4. Delete Rate Limits
    const rateLimits = await ctx.db
      .query("rateLimits")
      .collect();
    for (const rl of rateLimits) {
        if (rl.key.startsWith(user._id)) {
            await ctx.db.delete(rl._id);
        }
    }

    // 5. Finally delete the user
    await ctx.db.delete(user._id);
  },
});

export const exportData = action({
  args: {},
  handler: async (ctx) => {
    const user: any = await ctx.runQuery(api.users.get, {});
    if (!user) throw new Error("Unauthorized");

    const entries = await ctx.runQuery(api.entries.list, {});
    const sessions = await ctx.runQuery(api.sessions.list, {});
    
    const fullSessions = [];
    for (const session of sessions) {
        const messages = await ctx.runQuery(api.messages.list, { sessionId: session._id });
        fullSessions.push({ ...session, messages });
    }

    const dailyChats = await ctx.runQuery(api.dailyChats.list, {});
    const fullDailyChats = [];
    for (const chat of dailyChats) {
        const messages = await ctx.runQuery(api.dailyChats.listMessages, { chatId: chat._id });
        fullDailyChats.push({ ...chat, messages });
    }

    return {
        user,
        entries,
        sessions: fullSessions,
        dailyChats: fullDailyChats,
        exportedAt: new Date().toISOString()
    };
  },
});

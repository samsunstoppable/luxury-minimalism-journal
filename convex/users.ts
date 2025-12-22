import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

export const getByToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.token))
      .unique();
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
       // Fallback for local dev
        const devToken = "dev-user";
        const devUser = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", devToken)).unique();
        if (!devUser) return null;
        return devUser;
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
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name!,
      email: identity.email!,
      subscriptionStatus: "free",
    });
  },
});

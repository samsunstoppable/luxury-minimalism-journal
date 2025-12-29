import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, sanitizeInput } from "./utils";

export const create = mutation({
  args: { entryId: v.id("entries"), personaId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== user._id) throw new Error("Unauthorized");

    const chatId = await ctx.db.insert("dailyChats", {
      userId: user._id,
      entryId: args.entryId,
      personaId: args.personaId,
      createdAt: Date.now(),
    });

    return chatId;
  },
});

export const get = query({
  args: { chatId: v.id("dailyChats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return null;
    return chat;
  },
});

export const getByEntry = query({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== user._id) return null;

    return await ctx.db
      .query("dailyChats")
      .withIndex("by_entry", (q) => q.eq("entryId", args.entryId))
      .unique();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("dailyChats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const listMessages = query({
  args: { chatId: v.id("dailyChats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return [];

    return await ctx.db
      .query("dailyChatMessages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: { chatId: v.id("dailyChats"), content: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    const messageId = await ctx.db.insert("dailyChatMessages", {
      chatId: args.chatId,
      role: args.role,
      content: sanitizeInput(args.content),
      timestamp: Date.now(),
    });
    return messageId;
  },
});

export const saveAIMessage = mutation({
  args: { chatId: v.id("dailyChats"), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("dailyChatMessages", {
      chatId: args.chatId,
      role: "assistant",
      content: args.content,
      timestamp: Date.now(),
    });
  },
});


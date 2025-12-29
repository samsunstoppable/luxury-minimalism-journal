import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk ID
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()), // "free", "active", "past_due"
    subscriptionId: v.optional(v.string()), // Polar subscription ID
    summary: v.optional(v.string()), // AI-generated summary of the user
    defaultPersonaId: v.optional(v.string()), // Default mentor persona for daily chats
    notificationsEnabled: v.optional(v.boolean()),
    onboardingCompleted: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),

  entries: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    content: v.string(),
    date: v.string(), // ISO date string YYYY-MM-DD
    dayNumber: v.optional(v.number()), // 1-7
    cycleId: v.optional(v.string()), // To group 7-day cycles
  })
  .index("by_user", ["userId"])
  .index("by_user_date", ["userId", "date"]),

  sessions: defineTable({
    userId: v.id("users"),
    personaId: v.string(), // "jung", "jesus", etc.
    status: v.string(), // "pending", "interviewing", "analyzing", "completed"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    audioUrl: v.optional(v.string()), // URL to the voice interview recording
    transcript: v.optional(v.string()), // Text of the interview
    analysis: v.optional(v.string()), // The "Drastic Diagnosis"
  }).index("by_user", ["userId"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"), // Author
    role: v.string(), // "user" or "assistant"
    content: v.string(),
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]),

  dailyChats: defineTable({
    userId: v.id("users"),
    entryId: v.id("entries"), // Links to the specific journal entry
    personaId: v.string(), // "jung", "seneca", etc.
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_entry", ["entryId"]),

  dailyChatMessages: defineTable({
    chatId: v.id("dailyChats"),
    role: v.string(), // "user" or "assistant"
    content: v.string(),
    timestamp: v.number(),
  }).index("by_chat", ["chatId"]),

  rateLimits: defineTable({
    key: v.string(), // userId_action_date
    count: v.number(),
    lastReset: v.number(),
  }).index("by_key", ["key"]),
});

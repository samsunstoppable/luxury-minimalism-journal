"use node";
import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
});

export const createCheckout = action({
  args: {
    priceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.users.getByToken, {
      token: identity.tokenIdentifier,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const priceId = args.priceId || process.env.POLAR_PRICE_ID;
    if (!priceId) throw new Error("Price ID required");

    const checkout = await polar.checkouts.create({
      products: [priceId],
      successUrl: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}?payment=success`,
      metadata: {
        userId: user._id,
      },
    });

    return { url: checkout.url };
  },
});

export const handleWebhook = action({
  args: {
    signature: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Verify signature using args.signature and process.env.POLAR_WEBHOOK_SECRET
    // For now, we proceed to parse the payload.
    
    const event: any = JSON.parse(args.payload);

    if (event.type === "subscription.created" || event.type === "subscription.updated" || event.type === "subscription.active") {
       const subscription = event.data;
       const userId = subscription.metadata?.userId;
       
       if (userId) {
           await ctx.runMutation(internal.users.updateSubscription, {
             userId: userId as any,
             subscriptionId: subscription.id,
             status: subscription.status,
           });
       }
    }
  }
});

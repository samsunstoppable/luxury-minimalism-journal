import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const signature = request.headers.get("Webhook-Signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    try {
      await ctx.runAction(internal.polar.handleWebhook, {
        payload,
        signature,
      });
    } catch (e) {
      console.error(e);
      return new Response("Webhook failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;

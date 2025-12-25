import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const signature = request.headers.get("webhook-signature") || request.headers.get("Webhook-Signature");
    const timestamp = request.headers.get("webhook-timestamp") || request.headers.get("Webhook-Timestamp");
    const id = request.headers.get("webhook-id") || request.headers.get("Webhook-Id");

    if (!signature || !timestamp || !id) {
      return new Response("Missing required headers", { status: 400 });
    }

    try {
      await ctx.runAction(api.polar.handleWebhook, {
        payload,
        headers: {
          "webhook-signature": signature,
          "webhook-timestamp": timestamp,
          "webhook-id": id,
        },
      });
    } catch (e) {
      console.error(e);
      return new Response("Webhook failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;

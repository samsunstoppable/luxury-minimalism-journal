import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing");
        return;
    }

    try {
      await resend.emails.send({
        from: "Journal <onboarding@resend.dev>",
        to: args.email,
        subject: "Welcome to Your Subconscious Journey",
        html: `
          <h1>Welcome, ${args.name}</h1>
          <p>Thank you for joining our luxury minimalist journal. Your journey into the subconscious begins now.</p>
          <p>Write for seven days, and then consult with your AI-powered guides.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}">Begin Writing</a>
        `,
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  },
});

export const sendReminderEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) return;

    try {
      await resend.emails.send({
        from: "Journal <reminders@resend.dev>",
        to: args.email,
        subject: "A Moment for Reflection",
        html: `
          <p>Hi ${args.name},</p>
          <p>This is a gentle reminder to take a moment today to capture your thoughts in your journal.</p>
          <p>Even a few sentences can reveal profound patterns over time.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}">Open Your Journal</a>
        `,
      });
    } catch (error) {
      console.error("Failed to send reminder email:", error);
    }
  },
});

export const sendCycleCompletionEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) return;

    try {
      await resend.emails.send({
        from: "Journal <analysis@resend.dev>",
        to: args.email,
        subject: "Your 7-Day Cycle is Complete",
        html: `
          <h1>Insights Await</h1>
          <p>Congratulations ${args.name}, you've completed a full 7-day cycle of journaling.</p>
          <p>Your AI guides are now ready to help you analyze the patterns that have emerged this week.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/journal">View Your Analysis</a>
        `,
      });
    } catch (error) {
      console.error("Failed to send cycle completion email:", error);
    }
  },
});

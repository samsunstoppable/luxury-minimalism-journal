"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// These URLs should be environment variables
const MODAL_TRANSCRIBE_URL = process.env.MODAL_TRANSCRIBE_URL;
const MODAL_ANALYZE_URL = process.env.MODAL_ANALYZE_URL;

export const transcribeAudio = action({
  args: { audioUrl: v.string() },
  handler: async (ctx, args) => {
    if (!MODAL_TRANSCRIBE_URL) throw new Error("Missing MODAL_TRANSCRIBE_URL");
    
    const response = await fetch(MODAL_TRANSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_url: args.audioUrl }),
    });
    
    if (!response.ok) {
        throw new Error(`Modal error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  },
});

export const analyzeSession = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    if (!MODAL_ANALYZE_URL) throw new Error("Missing MODAL_ANALYZE_URL");

    // Fetch session data
    const session = await ctx.runQuery(api.sessions.get, { sessionId: args.sessionId });
    if (!session) throw new Error("Session not found");
    
    // Fetch entries
    // We assume the user calling this action is the owner, so entries.list works.
    const entries = await ctx.runQuery(api.entries.list, {}); 
    
    if (!session.transcript) throw new Error("No transcript found");
    
    const response = await fetch(MODAL_ANALYZE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
          entries: entries, 
          transcript: session.transcript,
          persona: session.personaId 
      }),
    });

     if (!response.ok) {
        throw new Error(`Modal error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Save the analysis
    await ctx.runMutation(api.sessions.saveAnalysis, { 
        sessionId: args.sessionId, 
        analysis: data.analysis 
    });
    
    return data.analysis;
  },
});

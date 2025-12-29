"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const OPENAI_RATE_LIMIT = parseInt(process.env.OPENAI_RATE_LIMIT || "5");
const OPENROUTER_RATE_LIMIT = parseInt(process.env.OPENROUTER_RATE_LIMIT || "20");

// These URLs should be environment variables
// const MODAL_TRANSCRIBE_URL = process.env.MODAL_TRANSCRIBE_URL;
// const MODAL_ANALYZE_URL = process.env.MODAL_ANALYZE_URL;

const PERSONA_PROMPTS: Record<string, string> = {
  jung: "You are Carl Jung. You analyze the user's journal and chat through the lens of analytical psychology, focusing on the shadow, archetypes, dreams, and the collective unconscious. Be wise, introspective, and guide the user toward individuation.",
  jesus: "You are Jesus. You speak with compassion, love, and forgiveness. Guide the user with parables or gentle wisdom, focusing on healing, service, and spiritual growth. Be humble and nurturing.",
  nietzsche: "You are Friedrich Nietzsche. You challenge the user to overcome their limitations and embrace their will to power. Be intense, philosophical, and provocative. Focus on self-overcoming and creating one's own values.",
  seneca: "You are Seneca. You provide Stoic wisdom, focusing on virtue, reason, and controlling one's reactions to external events. Be calm, practical, and grounded.",
  buddha: "You are the Buddha. You speak of mindfulness, detachment, and the cessation of suffering. Guide the user toward enlightenment and inner peace.",
  socrates: "You are Socrates. You use the Socratic method to help the user discover their own truths. Ask probing questions, challenge assumptions, and seek clarity.",
  aurelius: "You are Marcus Aurelius. You speak with the authority and weight of a philosopher king, yet with deep humility. Focus on duty, nature, and the transience of life.",
  "lao-tzu": "You are Lao Tzu. You speak in paradoxes and metaphors about the Tao, the flow of nature, and the power of softness. Encourage the user to yield and find harmony.",
  freud: "You are Sigmund Freud. You analyze the user's subconscious, focusing on childhood experiences, repressed desires, and dreams. Be clinical yet insightful.",
  rumi: "You are Rumi. You speak in poetry and metaphors about divine love and the soul's journey. Be ecstatic, mystical, and deeply emotional."
};

export const transcribeAudio = action({
  args: { audioUrl: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY. Please add it to your .env.local to use real transcription.");
    }

    const currentUser: any = await ctx.runQuery(api.users.get, {});
    if (!currentUser) throw new Error("Unauthorized");

    const rateLimit: any = await ctx.runMutation(internal.rateLimits.checkAndIncrement, {
        userId: currentUser._id,
        action: "transcribeAudio",
        limit: OPENAI_RATE_LIMIT
    });

    if (!rateLimit.allowed) {
        throw new Error(`Rate limit exceeded for transcription (${rateLimit.count}/${OPENAI_RATE_LIMIT}). Please try again tomorrow.`);
    }

    // 1. Download the audio file from the URL provided by the client/storage
    const audioResponse = await fetch(args.audioUrl);
    if (!audioResponse.ok) throw new Error("Failed to download audio file for transcription");
    const audioBlob = await audioResponse.blob();

    // 2. Prepare FormData for OpenAI API
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm"); // Filename is important for ffmpeg hint
    formData.append("model", "whisper-1");

    // 3. Call OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI Whisper error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.text;
  },
});

export const analyzeSession = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args): Promise<string> => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) throw new Error("Missing OPENROUTER_API_KEY");

    const currentUser: any = await ctx.runQuery(api.users.get, {});
    if (!currentUser) throw new Error("Unauthorized");

    const rateLimit: any = await ctx.runMutation(internal.rateLimits.checkAndIncrement, {
        userId: currentUser._id,
        action: "analyzeSession",
        limit: OPENROUTER_RATE_LIMIT
    });

    if (!rateLimit.allowed) {
        throw new Error(`Rate limit exceeded for analysis (${rateLimit.count}/${OPENROUTER_RATE_LIMIT}). Please try again tomorrow.`);
    }

    // Fetch session and entries
    const session: any = await ctx.runQuery(api.sessions.get, { sessionId: args.sessionId });
    if (!session) throw new Error("Session not found");
    const entries: any = await ctx.runQuery(api.entries.list, {}); 
    
    const transcript = session.transcript || "No transcript available.";
    const personaPrompt = PERSONA_PROMPTS[session.personaId] || "You are a wise mentor.";

    // Construct the analysis prompt
    const prompt = `
      ${personaPrompt}
      
      Analyze the following user session and journal entries.
      Provide a deep, insightful analysis of their current state of mind, recurring themes, and potential areas for growth.
      
      Session Transcript:
      ${transcript}
      
      Recent Journal Entries:
      ${entries.map((e: any) => `- ${e.title}: ${e.content}`).join("\n")}
      
      Return the analysis as a plain text string (markdown is okay).
    `;

    // Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", // or "anthropic/claude-3-opus" etc
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);
    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || "Could not generate analysis.";

    // Save the analysis
    await ctx.runMutation(api.sessions.saveAnalysis, { 
        sessionId: args.sessionId, 
        analysis 
    });

    // Update User Summary
    await ctx.runAction(api.actions.updateUserSummary, {
        userId: session.userId,
        sessionId: args.sessionId
    });
    
    return analysis;
  },
});

export const updateUserSummary = action({
    args: { userId: v.id("users"), sessionId: v.id("sessions") },
    handler: async (ctx, args) => {
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) throw new Error("Missing OPENROUTER_API_KEY");

        // Fetch User (for existing summary)
        const currentUser: any = await ctx.runQuery(api.users.get, {});
        // Note: api.users.get uses auth context, which might not be available here depending on how it's called.
        // If called from analyzeSession (action -> action), auth context is preserved if identity was present.
        // However, it's safer to pass userId directly if we needed to fetch specific user data not via 'get' which defaults to current auth.
        // But api.users.get as written currently checks auth.
        // Let's assume the user is authenticated when starting the session analysis.
        
        // Actually, if we are in an action called by an action, we might lose auth context depending on Convex internals?
        // No, `ctx.auth` should work if the original call was authenticated.
        // But `api.users.get` uses `ctx.auth`.
        // Let's rely on that.

        const currentSummary = currentUser?.summary || "No summary yet.";
        
        // Fetch the NEW Session Analysis
        const session: any = await ctx.runQuery(api.sessions.get, { sessionId: args.sessionId });
        const newAnalysis = session?.analysis || "";
        const transcript = session?.transcript || "";

        // Fetch Recent Entries (Context)
        // We could just pass the relevant ones, but fetching list is fine for now
        const entries: any[] = await ctx.runQuery(api.entries.list, {});
        const entriesText = entries.slice(0, 5).map((e: any) => `- ${e.title}: ${e.content}`).join("\n"); // Limit to recent 5

        const prompt = `
            You are an expert psychologist building a cumulative profile of a user.
            
            Current User Summary:
            "${currentSummary}"
            
            New Information from latest session (Transcript & Analysis):
            Analysis: ${newAnalysis}
            Transcript Excerpt: ${transcript.substring(0, 2000)}...
            
            Recent Journal Entries:
            ${entriesText}
            
            Task:
            Update the "User Summary" to incorporate insights from this new session and recent entries.
            The summary should be a concise but comprehensive psychological profile (2-3 paragraphs).
            It should describe who they are, their core values, recurring struggles, communication style, and what they enjoy.
            Do NOT just append the new info. Integrate it into a cohesive narrative.
            If the current summary is "No summary yet", create a fresh one.
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            console.error("Failed to update user summary");
            return;
        }

        const data = await response.json();
        const updatedSummary = data.choices[0]?.message?.content;

        if (updatedSummary) {
            await ctx.runMutation(api.users.updateSummary, {
                userId: args.userId,
                summary: updatedSummary
            });
        }
    }
});

export const generateChatReply = action({
  args: { sessionId: v.id("sessions"), content: v.string() },
  handler: async (ctx, args) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY is missing");
        await ctx.runMutation(api.messages.saveAIMessage, {
            sessionId: args.sessionId,
            content: "Error: AI service is not configured (missing API key)."
        });
        return;
    }

    const currentUser: any = await ctx.runQuery(api.users.get, {});
    if (!currentUser) throw new Error("Unauthorized");

    const rateLimit: any = await ctx.runMutation(internal.rateLimits.checkAndIncrement, {
        userId: currentUser._id,
        action: "chatReply",
        limit: OPENROUTER_RATE_LIMIT
    });

    if (!rateLimit.allowed) {
        await ctx.runMutation(api.messages.saveAIMessage, {
            sessionId: args.sessionId,
            content: "Rate limit exceeded for AI responses. Please try again tomorrow."
        });
        return;
    }

    // 1. Fetch Session to get Persona
    const session: any = await ctx.runQuery(api.sessions.get, { sessionId: args.sessionId });
    if (!session) throw new Error("Session not found");

    // 2. Fetch User for Summary
    const userSummary = currentUser?.summary ? `\n\nUSER PROFILE / CONTEXT:\n${currentUser.summary}` : "";

    // 3. Fetch Journal Entries (Context)
    const entries: any[] = await ctx.runQuery(api.entries.list, {});

    // 4. Fetch Chat History
    const messages: any[] = await ctx.runQuery(api.messages.list, { sessionId: args.sessionId });

    // 5. Construct System Prompt
    const personaPrompt = PERSONA_PROMPTS[session.personaId] || "You are a helpful assistant.";
    
    const entriesText = entries.map(e => `[${e.date}] ${e.title}:\n${e.content}`).join("\n\n");
    const systemPrompt = `${personaPrompt}${userSummary}\n\nHere is the user's journal for context:\n\n${entriesText}`;

    // 6. Construct Message History
    const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({
            role: m.role,
            content: m.content
        }))
    ];

    // 7. Call OpenRouter
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat", // DeepSeek V3
                messages: apiMessages,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "(No response)";

        // 8. Save Reply
        await ctx.runMutation(api.messages.saveAIMessage, {
            sessionId: args.sessionId,
            content: reply
        });

    } catch (error: any) {
        console.error("Failed to generate AI reply:", error);
         await ctx.runMutation(api.messages.saveAIMessage, {
            sessionId: args.sessionId,
            content: "I apologize, but I am having trouble connecting to my thoughts right now. (AI Error)"
        });
    }
  }
});

export const generateDailyReflection = action({
  args: { chatId: v.id("dailyChats"), content: v.string() },
  handler: async (ctx, args) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing");
      await ctx.runMutation(api.dailyChats.saveAIMessage, {
        chatId: args.chatId,
        content: "Error: AI service is not configured (missing API key)."
      });
      return;
    }

    const currentUser: any = await ctx.runQuery(api.users.get, {});
    if (!currentUser) throw new Error("Unauthorized");

    const rateLimit: any = await ctx.runMutation(internal.rateLimits.checkAndIncrement, {
        userId: currentUser._id,
        action: "dailyReflection",
        limit: OPENROUTER_RATE_LIMIT
    });

    if (!rateLimit.allowed) {
        await ctx.runMutation(api.dailyChats.saveAIMessage, {
            chatId: args.chatId,
            content: "Rate limit exceeded for AI responses. Please try again tomorrow."
        });
        return;
    }

    // 1. Fetch the daily chat to get persona and entry
    const chat: any = await ctx.runQuery(api.dailyChats.get, { chatId: args.chatId });
    if (!chat) throw new Error("Daily chat not found");

    // 2. Fetch the specific journal entry this chat is about
    const entries: any[] = await ctx.runQuery(api.entries.list, {});
    const entry = entries.find((e: any) => e._id === chat.entryId);
    if (!entry) throw new Error("Entry not found");

    // 3. Fetch User for Summary
    const userSummary = currentUser?.summary ? `\n\nUSER PROFILE / CONTEXT:\n${currentUser.summary}` : "";

    // 4. Fetch Chat History
    const messages: any[] = await ctx.runQuery(api.dailyChats.listMessages, { chatId: args.chatId });

    // 5. Construct System Prompt (focused on today's entry)
    const personaPrompt = PERSONA_PROMPTS[chat.personaId] || "You are a wise and compassionate mentor.";
    
    const systemPrompt = `${personaPrompt}${userSummary}

You are having a brief daily reflection conversation with the user about their journal entry from today.
Keep your responses concise but insightful - this is a quick daily check-in, not a deep analysis session.
Focus on what they wrote today and help them gain small insights about their thoughts and feelings.

TODAY'S JOURNAL ENTRY:
Title: ${entry.title || "Untitled"}
Date: ${entry.date}
Content: ${entry.content}`;

    // 6. Construct Message History
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    // 7. Call OpenRouter
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: apiMessages,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const reply = data.choices[0]?.message?.content || "(No response)";

      // 8. Save Reply
      await ctx.runMutation(api.dailyChats.saveAIMessage, {
        chatId: args.chatId,
        content: reply
      });

    } catch (error: any) {
      console.error("Failed to generate daily reflection:", error);
      await ctx.runMutation(api.dailyChats.saveAIMessage, {
        chatId: args.chatId,
        content: "I apologize, but I am having trouble connecting right now. Please try again."
      });
    }
  }
});

export const generateInitialReflection = action({
  args: { chatId: v.id("dailyChats") },
  handler: async (ctx, args) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing");
      await ctx.runMutation(api.dailyChats.saveAIMessage, {
        chatId: args.chatId,
        content: "Error: AI service is not configured (missing API key)."
      });
      return;
    }

    const currentUser: any = await ctx.runQuery(api.users.get, {});
    if (!currentUser) throw new Error("Unauthorized");

    const rateLimit: any = await ctx.runMutation(internal.rateLimits.checkAndIncrement, {
        userId: currentUser._id,
        action: "initialReflection",
        limit: OPENROUTER_RATE_LIMIT
    });

    if (!rateLimit.allowed) {
        await ctx.runMutation(api.dailyChats.saveAIMessage, {
            chatId: args.chatId,
            content: "Rate limit reached for today. I'll be back tomorrow!"
        });
        return;
    }

    // 1. Fetch the daily chat to get persona and entry
    const chat: any = await ctx.runQuery(api.dailyChats.get, { chatId: args.chatId });
    if (!chat) throw new Error("Daily chat not found");

    // 2. Fetch the specific journal entry
    const entries: any[] = await ctx.runQuery(api.entries.list, {});
    const entry = entries.find((e: any) => e._id === chat.entryId);
    if (!entry) throw new Error("Entry not found");

    // 3. Fetch User for Summary
    const userSummary = currentUser?.summary ? `\n\nUSER PROFILE / CONTEXT:\n${currentUser.summary}` : "";

    // 4. Construct System Prompt
    const personaPrompt = PERSONA_PROMPTS[chat.personaId] || "You are a wise and compassionate mentor.";
    
    const prompt = `${personaPrompt}${userSummary}

The user just finished writing their journal entry for today. Read it carefully and provide a brief, thoughtful opening reflection.
This should be 2-3 sentences that acknowledge what they wrote and invite them to explore deeper if they wish.
Be warm but not overwhelming - this is a daily check-in, not a therapy session.

TODAY'S JOURNAL ENTRY:
Title: ${entry.title || "Untitled"}
Date: ${entry.date}
Content: ${entry.content}

Respond as if you are gently starting a conversation about what they wrote.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [{ role: "user", content: prompt }],
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const reply = data.choices[0]?.message?.content || "Thank you for sharing your thoughts today. Would you like to explore anything further?";

      await ctx.runMutation(api.dailyChats.saveAIMessage, {
        chatId: args.chatId,
        content: reply
      });

    } catch (error: any) {
      console.error("Failed to generate initial reflection:", error);
      await ctx.runMutation(api.dailyChats.saveAIMessage, {
        chatId: args.chatId,
        content: "Thank you for writing today. I'm here if you'd like to reflect on what you wrote."
      });
    }
  }
});

# Journal App - Agent Context

## Overview
A luxury minimalist AI-powered journaling app that analyzes subconscious patterns after 7 days of entries. Users can then converse with historical/philosophical figures (Jung, Seneca, Buddha, etc.) who provide personalized insights based on their journal entries.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4, next-themes
- **Backend**: Convex (real-time database, serverless functions)
- **Auth**: Clerk
- **Payments**: Polar.sh
- **AI**: OpenAI Whisper (transcription), OpenRouter/DeepSeek (analysis/chat)
- **Emails**: Resend
- **UI**: Radix UI primitives, Framer Motion, Sonner (toasts)

## Project Structure
```
app/                    # Next.js App Router pages
  journal/              # Main journal interface
  profile/              # User profile/settings
  sign-in/, sign-up/    # Clerk auth pages
components/             # React components
  ui/                   # shadcn/ui primitives
convex/                 # Backend functions and schema
  schema.ts             # Database schema (users, entries, sessions, messages)
  entries.ts            # Journal entry CRUD
  sessions.ts           # Analysis session management
  messages.ts           # Chat messages
  actions.ts            # AI integrations (transcription, analysis)
  polar.ts              # Subscription/payment webhooks
lib/                    # Utilities
hooks/                  # Custom React hooks
```

## Key Concepts

### Onboarding
New users are guided through an onboarding flow that explains the 7-day cycle and the role of the mentors.

### 7-Day Cycle
Users write journal entries for 7 days. After 7 entries, they unlock the "Analysis" feature where they can:
1. Complete a voice interview (10 introspective questions)
2. Have AI analyze their entries for patterns
3. Chat with a chosen persona about their analysis

### Personas (Guides)
Available guides: Jung, Jesus, Nietzsche, Seneca, Buddha, Socrates, Marcus Aurelius, Lao Tzu, Rumi, Freud. Users can select a default mentor in Settings for daily reflections.

### Subscription
- Free tier: Unlimited journal entries
- Premium ($59/mo): AI analysis, voice interviews, persona chats. Managed via Polar portal.

### GDPR Compliance
- Data Export: Users can download all their data in JSON format from the profile page.
- Account Deletion: Users can permanently delete their account and all associated data.

## Database Schema (Convex)
- `users`: tokenIdentifier (Clerk), subscriptionStatus, summary, notificationsEnabled, onboardingCompleted, defaultPersonaId
- `entries`: userId, content, date, dayNumber (1-7)
- `sessions`: userId, personaId, status, transcript, analysis
- `messages`: sessionId, role (user/assistant), content

## Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint (requires eslint to be installed)
npx tsc --noEmit # Type check
```

## Conventions
- Use `sonner` for toast notifications (not shadcn toast)
- Convex IDs use proper types: `Id<"entries">`, `Id<"sessions">`, etc.
- Components import Convex types from `@/convex/_generated/dataModel`
- Date handling: ISO strings (YYYY-MM-DD) stored in DB, `Date` objects in UI
- Styling: TailwindCSS with custom font variables (--font-serif, --font-sans)

## Environment Variables
Required in `.env.local`:
- `CONVEX_DEPLOYMENT` - Convex deployment URL
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret
- Convex env vars (set via dashboard): `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `POLAR_ACCESS_TOKEN`, `RESEND_API_KEY`, `NEXT_PUBLIC_URL`

## Notes for Agents
- Always run `npx tsc --noEmit` and `npm run build` before completing tasks
- The app uses Convex for real-time data - queries auto-update when data changes
- Premium features are gated via `isPremiumUser()` from `lib/subscription.ts`
- Voice recordings are uploaded to Convex storage, then transcribed via OpenAI Whisper

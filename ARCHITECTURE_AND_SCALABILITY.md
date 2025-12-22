# System Architecture & Scalability Report

## 1. Systems Architecture

The application follows a **Serverless, Event-Driven Architecture**. It leverages modern edge-computing and managed backend-as-a-service components to minimize operational overhead.

### High-Level Data Flow

```mermaid
graph TD
    %% User Devices
    User[User / Client Browser]
    
    %% Frontend Layer (Vercel)
    subgraph Frontend [Next.js App (Vercel)]
        UI[React UI Components]
        NextAPI[Next.js API Routes]
    end

    %% Auth Layer
    Auth[Clerk Auth]

    %% Backend Layer (Convex)
    subgraph Backend [Convex Cloud]
        Query[Queries (Read Data)]
        Mutation[Mutations (Write Data)]
        Action[Actions (External API Calls)]
        DB[(Real-time Database)]
        Scheduler[Scheduler / Cron]
    end

    %% AI Services Layer
    subgraph AI_Services [AI Service Providers]
        Whisper[OpenAI Whisper (Transcription)]
        LLM[OpenRouter / DeepSeek (Analysis & Chat)]
    end

    %% Connections
    User -->|HTTPS| UI
    UI -->|Auth| Auth
    UI <-->|WebSocket / HTTPS| Query
    UI -->|HTTPS| Mutation
    UI -->|HTTPS| Action

    Query <--> DB
    Mutation <--> DB
    Action -->|API Call| Whisper
    Action -->|API Call| LLM
    Action -->|Save Result| Mutation

    %% Authentication Flow
    Auth -.->|JWT Token| Backend
```

### Component Breakdown

1.  **Frontend (Next.js on Vercel)**:
    *   **Role**: Renders the UI, manages client state, and handles routing.
    *   **Interaction**: Connects to Convex via WebSockets for real-time data updates (no manual polling required).

2.  **Authentication (Clerk)**:
    *   **Role**: Manages user identity, sessions, and security.
    *   **Integration**: Issues JWTs that Convex validates automatically to secure data access.

3.  **Backend (Convex)**:
    *   **Role**: The "brain" of the application. It replaces a traditional SQL/NoSQL database and backend API server.
    *   **Functions**:
        *   `Queries`: Pure, cached, read-only functions (extremely fast).
        *   `Mutations`: Transactional writes to the database.
        *   `Actions`: Async functions that can call external APIs (like OpenAI) without blocking the database.
    *   **Database**: A reactive, relational-like document store.

4.  **AI Layer (OpenAI & OpenRouter)**:
    *   **Role**: Provides intelligence.
    *   **Whisper**: Transcribes voice journal entries.
    *   **OpenRouter (DeepSeek/Claude)**: Analyzes journal entries and powers the persona-based chat.

---

## 2. Scalability Analysis

The system is built on highly scalable serverless infrastructure, but the **throughput is primarily limited by the AI API rate limits**.

### Capacity Estimates

| Component | Scalability Level | Theoretical Limit | Bottleneck Factor |
| :--- | :--- | :--- | :--- |
| **Frontend (Vercel)** | **High** | Millions of requests/day | Global Edge Network handles traffic easily. |
| **Database (Convex)** | **High** | 10k+ concurrent transactions | Automatic horizontal scaling. |
| **Real-time Sync** | **High** | 10k+ concurrent connected clients | Websockets scale well; `Queries` are cached. |
| **AI Transcription** | **Medium** | OpenAI Tier Dependent (e.g., 50-100 RPM) | **Primary Bottleneck.** Audio processing is heavy. |
| **AI Analysis (LLM)** | **Medium** | OpenRouter Tier Dependent (e.g., 100-200 RPM) | **Secondary Bottleneck.** Token generation takes time. |

### How Many Users Can It Handle?

**Current State (Estimated w/ Standard API Tiers):**

*   **Concurrent Active Users (Chatting/Writing)**: ~500 - 1,000 users simultaneously.
*   **Daily Active Users (DAU)**: ~10,000+ users/day.

**Why these numbers?**
1.  **Database & UI**: Convex and Vercel can easily handle 100k+ users. The limiting factor is not the app infrastructure.
2.  **Voice Mode**: Transcribing audio files (Whisper) is resource-intensive. If 1,000 users upload 5-minute audio clips simultaneously, you will likely hit OpenAI's Rate Limits (RPM) or Token Limits (TPM).
3.  **Chat Mode**: LLM inference is slower than database reads. Long wait times might occur if thousands of users trigger complex analyses at the exact same second.

### Scaling Strategy (To handle 1M+ Users)

1.  **Queueing**: Ensure all AI actions are asynchronous. Convex `Actions` already handle this, but you might need to implement a dedicated job queue pattern if the queue gets too long.
2.  **Rate Limiting**: Implement application-level rate limiting (e.g., "Max 50 messages/hour per user") to prevent a single user from draining your API quota.
3.  **Enterprise API Tiers**: Upgrade OpenAI/OpenRouter accounts to higher usage tiers to increase RPM/TPM limits.
4.  **Caching**: Cache AI responses for identical inputs (already partially done, but can be improved for "Analysis" of the same day).

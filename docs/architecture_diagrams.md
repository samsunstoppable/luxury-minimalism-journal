# System Architecture

```mermaid
graph TD
    User[User / Browser]
    
    subgraph "Frontend (Next.js)"
        UI[React UI]
        Chat[Chat Component]
    end
    
    subgraph "Backend (Convex)"
        DB[(Convex DB)]
        Sessions[Sessions Mutation]
        Messages[Messages Mutation]
        Actions[Convex Actions]
    end
    
    subgraph "AI Compute (Modal)"
        Analysis[Analysis Endpoint]
        Transcribe[Transcribe Endpoint]
    end

    User --> UI
    UI --> Chat
    
    Chat -->|1. Send Message| Messages
    Messages -->|2. Store| DB
    
    Messages -.->|3. Trigger AI Reply| Actions
    Actions -.->|4. Call LLM (Pending)| Analysis
```

# User Flow

```mermaid
sequenceDiagram
    actor User
    participant App as Next.js App
    participant DB as Convex DB
    participant AI as Modal / AI Service

    User->>App: Clicks "Begin Analysis"
    App->>DB: createSession (Dev User)
    DB-->>App: sessionId
    App->>User: Show Chat Interface
    
    User->>App: Type "Hello"
    App->>DB: messages.send("Hello")
    DB->>DB: Save User Message
    DB->>App: Update UI (User msg)
    
    DB->>AI: generateChatReply (Action)
    AI->>AI: Generate Response (Stub)
    AI->>DB: saveAIMessage("Response")
    DB->>App: Update UI (AI msg)
```

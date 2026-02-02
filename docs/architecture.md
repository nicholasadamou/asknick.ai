# Architecture Documentation

This document provides a comprehensive overview of the Ask My AI chat application architecture.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Service Layer](#service-layer)
- [State Management](#state-management)
- [API Architecture](#api-architecture)
- [Frontend Architecture](#frontend-architecture)

## High-Level Architecture

The application follows a multi-component architecture inspired by Ask Frankie, with clear separation of concerns between different system components.

```mermaid
graph TD
    A[User Chat Interface] --> B[Message Router]
    B --> C[Conversation State Manager]
    B --> D[AI Agent OpenAI]
    D --> E[Knowledge Base Search]
    D --> F[Response Generator]
    F --> C
    F --> G[Next Steps Menu]
    G --> A
    F --> A
    C --> B

    style A fill:#3b82f6,color:#fff
    style B fill:#8b5cf6,color:#fff
    style C fill:#ec4899,color:#fff
    style D fill:#10b981,color:#fff
    style E fill:#f59e0b,color:#fff
    style F fill:#06b6d4,color:#fff
    style G fill:#6366f1,color:#fff
```

## Component Architecture

### Frontend Components

```mermaid
graph LR
    A[page.tsx] --> B[SuggestedQuestions]
    A --> C[ContextDrawer]
    A --> D[NextStepsMenu]
    A --> E[MermaidDiagram]

    D --> F[ScheduleCallModal]
    D --> G[DownloadResumeModal]
    D --> H[SuggestQuestionModal]
    D --> I[ReportIssueModal]

    F --> J[Modal Base]
    G --> J
    H --> J
    I --> J

    style A fill:#3b82f6,color:#fff
    style D fill:#8b5cf6,color:#fff
    style J fill:#ec4899,color:#fff
```

### Backend Services

```mermaid
graph TB
    A[API Route /api/chatbot] --> B[MessageRouter]
    B --> C[ConversationStateManager]
    B --> D[KnowledgeBaseSearch]
    B --> E[ResponseGenerator]

    E --> F[OpenAI Assistants API]
    D --> F

    C --> G[(In-Memory State)]

    style A fill:#3b82f6,color:#fff
    style B fill:#8b5cf6,color:#fff
    style C fill:#ec4899,color:#fff
    style D fill:#f59e0b,color:#fff
    style E fill:#06b6d4,color:#fff
    style F fill:#10b981,color:#fff
    style G fill:#6366f1,color:#fff
```

## Data Flow

### Message Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Chat Interface
    participant API as API Route
    participant Router as Message Router
    participant State as Conversation State
    participant KB as Knowledge Base
    participant Gen as Response Generator
    participant OpenAI as OpenAI Assistant

    User->>UI: Send message
    UI->>API: POST /api/chatbot
    API->>Router: routeMessage()

    Router->>State: getOrCreateState()
    State-->>Router: Conversation state

    Router->>State: addMessage(user, message)
    Router->>KB: search(message, threadId)
    KB-->>Router: Knowledge results

    Router->>Gen: generate(threadId, message, context)
    Gen->>OpenAI: Create thread message
    Gen->>OpenAI: Create run

    loop Poll for completion
        Gen->>OpenAI: Check run status
        OpenAI-->>Gen: Status update
    end

    OpenAI-->>Gen: Completed response
    Gen->>State: addMessage(assistant, response)
    Gen-->>Router: Response data

    Router-->>API: Stream response
    API-->>UI: JSON stream
    UI-->>User: Display response
```

### Context Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Drawer as Context Drawer
    participant Storage as Session Storage
    participant API as API Route
    participant State as Conversation State

    User->>Drawer: Enter LinkedIn/Company info
    Drawer->>Storage: Save context
    Drawer->>API: Send with next message

    API->>State: updateContext(threadId, context)
    State->>State: Merge with existing context

    Note over API,State: Context used in all future messages

    API->>State: getState(threadId)
    State-->>API: Full context + history
```

## Service Layer

### MessageRouter Service

**Responsibilities:**
- Route incoming messages to appropriate handlers
- Coordinate between different services
- Manage thread lifecycle
- Handle errors and timeouts

**Key Methods:**
```typescript
routeMessage(message: string, threadId?: string, context?: Context)
getConversationHistory(threadId: string)
```

### ConversationStateManager Service

**Responsibilities:**
- Track conversation state across messages
- Store user context (LinkedIn, job details)
- Maintain message history
- Cleanup old conversations

**Key Methods:**
```typescript
getOrCreateState(threadId: string, context?: Context)
addMessage(threadId: string, role: string, content: string)
updateContext(threadId: string, context: Context)
getRecentHistory(threadId: string, count: number)
cleanup(maxAge: number)
```

### KnowledgeBaseSearch Service

**Responsibilities:**
- Interface with knowledge base
- Search uploaded files (via OpenAI)
- Retrieve assistant information
- Extensible for custom search implementations

**Key Methods:**
```typescript
search(query: string, threadId: string)
getAssistantInfo()
listKnowledgeFiles()
```

### ResponseGenerator Service

**Responsibilities:**
- Generate AI responses
- Handle context injection
- Poll OpenAI for completion
- Extract and clean responses

**Key Methods:**
```typescript
generate(threadId: string, message: string, context?: Context)
```

## State Management

### Client-Side State

```mermaid
graph LR
    A[Session Storage] --> B[Chat Messages]
    A --> C[Thread ID]
    A --> D[Context Data]

    E[React State] --> F[Input Value]
    E --> G[Loading State]
    E --> H[Messages Array]

    style A fill:#3b82f6,color:#fff
    style E fill:#8b5cf6,color:#fff
```

**Session Storage:**
- `chat-messages`: Array of message objects
- `chat-thread-id`: Current OpenAI thread ID
- `chat-context`: User context (LinkedIn, company)

**React State:**
- `messages`: Current conversation messages
- `inputValue`: Current input field value
- `isLoading`: Loading state for API calls
- `threadId`: Active thread ID
- `context`: Current user context

### Server-Side State

```mermaid
graph TB
    A[ConversationStateManager] --> B[Thread Cache]
    A --> C[State Map]

    C --> D[Thread ID]
    C --> E[Context Object]
    C --> F[Message History]
    C --> G[Metadata]

    G --> H[Start Time]
    G --> I[Last Activity]
    G --> J[Message Count]

    style A fill:#3b82f6,color:#fff
    style C fill:#8b5cf6,color:#fff
    style G fill:#ec4899,color:#fff
```

## API Architecture

### Endpoint: POST /api/chatbot

**Request:**
```json
{
  "message": "string",
  "threadId": "string (optional)",
  "context": {
    "linkedInProfile": "string (optional)",
    "jobUrl": "string (optional)",
    "additionalContext": "string (optional)"
  }
}
```

**Response Stream:**
```json
{
  "response": "string",
  "threadId": "string"
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

### Request Flow

```mermaid
graph TD
    A[Client Request] --> B{Validate Input}
    B -->|Invalid| C[Return 400 Error]
    B -->|Valid| D{Check Assistant ID}
    D -->|Missing| E[Return 500 Error]
    D -->|Present| F[Initialize MessageRouter]

    F --> G[Route Message]
    G --> H{Success?}
    H -->|No| I[Return Error Stream]
    H -->|Yes| J[Return Response Stream]

    style A fill:#3b82f6,color:#fff
    style F fill:#8b5cf6,color:#fff
    style G fill:#ec4899,color:#fff
```

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TB
    A[layout.tsx] --> B[page.tsx]

    B --> C[Header]
    B --> D[Main Chat Area]
    B --> E[Input Area]
    B --> F[Context Drawer]

    C --> G[Title]
    C --> H[Clear Button]
    C --> I[NextStepsMenu]

    D --> J{Has Messages?}
    J -->|No| K[SuggestedQuestions]
    J -->|Yes| L[Message List]

    L --> M[User Messages]
    L --> N[Assistant Messages]
    N --> O[ReactMarkdown]
    O --> P[MermaidDiagram]

    I --> Q[ScheduleCallModal]
    I --> R[DownloadResumeModal]
    I --> S[SuggestQuestionModal]
    I --> T[ReportIssueModal]

    style A fill:#3b82f6,color:#fff
    style B fill:#8b5cf6,color:#fff
    style I fill:#ec4899,color:#fff
```

### UI State Flow

```mermaid
stateDiagram-v2
    [*] --> EmptyChat
    EmptyChat --> ShowingSuggestions
    ShowingSuggestions --> UserTyping
    UserTyping --> MessageSending
    MessageSending --> WaitingForResponse
    WaitingForResponse --> ShowingResponse
    ShowingResponse --> ReadyForInput
    ReadyForInput --> UserTyping
    ReadyForInput --> ClearChat
    ClearChat --> EmptyChat

    ReadyForInput --> NextStepsOpen
    NextStepsOpen --> ModalOpen
    ModalOpen --> ReadyForInput

    ReadyForInput --> ContextDrawerOpen
    ContextDrawerOpen --> ReadyForInput
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Markdown**: React Markdown + GFM
- **Diagrams**: Mermaid
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **AI**: OpenAI Assistants API
- **State**: In-memory (Map-based)
- **Streaming**: ReadableStream API

### Development
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier
- **Type Checking**: TypeScript

## Deployment Architecture

```mermaid
graph TB
    A[User Browser] --> B[Vercel Edge Network]
    B --> C[Next.js App]

    C --> D[Static Pages]
    C --> E[API Routes]

    E --> F[OpenAI API]
    E --> G[In-Memory State]

    F --> H[Assistant]
    H --> I[Knowledge Base Files]

    style A fill:#3b82f6,color:#fff
    style B fill:#8b5cf6,color:#fff
    style C fill:#ec4899,color:#fff
    style F fill:#10b981,color:#fff
```

## Security Considerations

1. **API Key Management**
   - OpenAI API key stored in environment variables
   - Never exposed to client-side code

2. **Input Validation**
   - All user inputs validated before processing
   - Message content sanitized

3. **Rate Limiting**
   - Implemented via Vercel function limits
   - 60-second max duration per request

4. **State Isolation**
   - Each thread has isolated state
   - No cross-thread data leakage

5. **Session Management**
   - Client-side session storage (not cookies)
   - No persistent user tracking

## Performance Optimizations

1. **Streaming Responses**
   - JSON streaming for faster perceived response time
   - Immediate user feedback

2. **State Caching**
   - Thread IDs cached in memory
   - Reduces OpenAI API calls

3. **Conversation Cleanup**
   - Automatic cleanup of old conversations
   - Prevents memory bloat

4. **Component Lazy Loading**
   - Modal components loaded on demand
   - Reduced initial bundle size

5. **Mermaid Rendering**
   - Client-side only rendering
   - No SSR overhead

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants)
- [Mermaid Diagram Syntax](https://mermaid.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

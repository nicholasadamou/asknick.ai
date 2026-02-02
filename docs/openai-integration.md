# OpenAI Integration

Guide to OpenAI Assistant API integration in AskMyAI.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Architecture](#architecture)
- [Services](#services)
- [Thread Management](#thread-management)
- [Best Practices](#best-practices)

---

## Overview

AskMyAI uses the OpenAI Assistants API to provide intelligent, context-aware responses. The integration includes:

- Thread-based conversations
- Knowledge base integration
- Context-aware responses
- Multi-component architecture

---

## Setup

### 1. Create OpenAI Account

Sign up at [platform.openai.com](https://platform.openai.com)

### 2. Get API Key

1. Navigate to API Keys
2. Create new secret key
3. Copy key (starts with `sk-`)

### 3. Create Assistant

```bash
curl https://api.openai.com/v1/assistants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "model": "gpt-4-turbo-preview",
    "name": "AskMyAI Assistant",
    "instructions": "You are a helpful career and interview preparation assistant."
  }'
```

### 4. Configure Environment

```env
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...
```

---

## Architecture

### Service Layers

```
API Route → MessageRouter → ResponseGenerator → OpenAI API
              ↓
    ConversationStateManager
              ↓
    KnowledgeBaseSearch
```

### Components

| Service | Purpose |
|---------|---------|
| **MessageRouter** | Routes messages and coordinates services |
| **ResponseGenerator** | Handles AI response generation |
| **ConversationStateManager** | Manages conversation state |
| **KnowledgeBaseSearch** | Searches knowledge base (placeholder) |

---

## Services

### MessageRouter

**File:** `src/services/MessageRouter.ts`

**Purpose:** Central routing for all messages

```typescript
export class MessageRouter {
  async routeMessage(
    message: string,
    clientThreadId?: string,
    context?: Context
  ): Promise<{
    response: string;
    threadId: string;
    success: boolean;
  }> {
    // Get or create thread
    let threadId = clientThreadId || await this.createThread();
    
    // Update conversation state
    conversationStateManager.updateContext(threadId, context);
    
    // Generate response
    const result = await this.responseGenerator.generate(
      threadId,
      message,
      context
    );
    
    return result;
  }
}
```

### ResponseGenerator

**File:** `src/services/ResponseGenerator.ts`

**Purpose:** Generate AI responses with context

```typescript
export class ResponseGenerator {
  async generate(
    threadId: string,
    message: string,
    context?: Context
  ): Promise<{ response: string; success: boolean }> {
    // Format message with context
    let messageContent = this.formatMessageWithContext(message, context);
    
    // Add to thread
    await this.openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messageContent,
    });
    
    // Create run
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: this.assistantId,
    });
    
    // Poll for completion
    const result = await this.pollRunStatus(run.id, threadId);
    
    return result;
  }
}
```

### ConversationStateManager

**File:** `src/services/ConversationStateManager.ts`

**Purpose:** Track conversation metadata

Features:
- Message counting
- Context tracking
- Conversation history
- State persistence

---

## Thread Management

### Thread Lifecycle

```
Create Thread → Add Messages → Create Run → Poll Status → Get Response
```

### Thread Creation

```typescript
const thread = await openai.beta.threads.create();
const threadId = thread.id; // Save for later use
```

### Adding Messages

```typescript
await openai.beta.threads.messages.create(threadId, {
  role: "user",
  content: "Your message here",
});
```

### Running Assistant

```typescript
const run = await openai.beta.threads.runs.create(threadId, {
  assistant_id: assistantId,
});
```

### Polling for Completion

```typescript
let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
  thread_id: threadId,
});

while (runStatus.status === "queued" || runStatus.status === "in_progress") {
  await new Promise(resolve => setTimeout(resolve, 1000));
  runStatus = await openai.beta.threads.runs.retrieve(run.id, {
    thread_id: threadId,
  });
}
```

### Retrieving Response

```typescript
const messages = await openai.beta.threads.messages.list(threadId);
const assistantMessage = messages.data.find(msg => msg.role === "assistant");
const response = assistantMessage.content[0].text.value;
```

---

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await responseGenerator.generate(threadId, message);
} catch (error) {
  logger.error("OpenAI API error:", error);
  return {
    response: "I'm having trouble responding. Please try again.",
    success: false,
  };
}
```

### 2. Timeout Handling

```typescript
const MAX_ATTEMPTS = 50; // 50 seconds
let attempts = 0;

while (runStatus.status === "in_progress") {
  if (attempts >= MAX_ATTEMPTS) {
    return { error: "Request timeout" };
  }
  await sleep(1000);
  attempts++;
}
```

### 3. Context Formatting

```typescript
const contextParts: string[] = [];

if (context.greenhouseJobDescription) {
  contextParts.push(`Job Description:\n${context.greenhouseJobDescription}`);
}

if (contextParts.length > 0) {
  messageContent = `Context:\n${contextParts.join("\n\n")}\n\nQuestion: ${message}`;
}
```

### 4. Thread Caching

```typescript
const threadCache = new Map<string, string>();

if (clientThreadId && threadCache.has(clientThreadId)) {
  threadId = clientThreadId;
} else {
  const thread = await openai.beta.threads.create();
  threadId = thread.id;
  threadCache.set(threadId, threadId);
}
```

### 5. Rate Limiting

Monitor and respect OpenAI rate limits:
- Implement exponential backoff
- Cache responses when appropriate
- Monitor token usage

---

## Related Documentation

- [Chat System](./chat-system.md)
- [API Routes](./api-routes.md)
- [Context Drawer](./context-drawer.md)

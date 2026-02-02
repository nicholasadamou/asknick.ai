# Chat System

The chat system is the core of AskMyAI, handling all user interactions with the AI assistant. It manages message flow, session persistence, and real-time updates.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Message Flow](#message-flow)
- [Session Management](#session-management)
- [Components](#components)
- [Hooks](#hooks)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Overview

The chat system provides:

- Real-time messaging with the AI assistant
- Message history persistence across page refreshes
- Loading states and error handling
- Context-aware responses
- Keyboard shortcuts for efficiency
- Responsive design for mobile and desktop

### Key Features

- **Session Persistence** - Chat history stored in browser session storage
- **Context Integration** - Seamlessly integrates with the Context Drawer
- **Error Recovery** - Graceful error handling with user-friendly messages
- **Streaming Support** - Ready for streaming responses (currently non-streaming)
- **Thread Management** - Maintains conversation continuity with OpenAI threads

---

## Architecture

### Component Hierarchy

```
Page (src/app/page.tsx)
├── ChatHeader
├── ChatMessages
│   ├── ChatMessage (user messages)
│   ├── ChatMessage (assistant messages)
│   └── SuggestedQuestions
├── ChatInput
│   ├── ContextDrawer
│   └── NextStepsMenu
└── Modals
    ├── StartNewChatModal
    ├── KeyboardShortcutsDialog
    └── MobileMenu
```

### Data Flow

```
User Input → useChatLogic → API Request → OpenAI → Response → UI Update
     ↓                           ↓
 Context Drawer          Session Storage
```

---

## Message Flow

### 1. User Sends Message

```typescript
// src/app/page.tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  sendMessage(inputValue);  // From useChatLogic hook
};
```

### 2. Message Processing

```typescript
// src/hooks/useChatLogic.ts
const sendMessage = async (content: string) => {
  // Create user message
  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: content.trim(),
    timestamp: new Date(),
  };
  
  // Add to UI immediately
  setMessages(prev => [...prev, userMessage]);
  
  // Process files if any
  const serializableContext = await processFiles(context);
  
  // Send to API
  const response = await fetch("/api/chatbot", {
    method: "POST",
    body: JSON.stringify({
      message: content.trim(),
      threadId,
      context: serializableContext,
    }),
  });
};
```

### 3. API Processing

```typescript
// src/app/api/chatbot/route.ts
export async function POST(req: NextRequest) {
  // Extract request data
  const { message, threadId, context } = await req.json();
  
  // Route through MessageRouter
  const result = await messageRouter.routeMessage(
    message,
    threadId,
    context
  );
  
  // Return response
  return new Response(
    JSON.stringify({
      response: result.response,
      threadId: result.threadId,
    })
  );
}
```

### 4. Response Display

```typescript
// Response is parsed and added to messages
if (data.response) {
  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content: data.response,
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, assistantMessage]);
}
```

---

## Session Management

### Session Storage Keys

| Key | Purpose | Data Type |
|-----|---------|-----------|
| `chat-messages` | Message history | `Message[]` |
| `chat-thread-id` | OpenAI thread ID | `string` |
| `chat-context` | User context | `Context` |

### Persistence

Messages are automatically saved to session storage:

```typescript
// Save messages
useEffect(() => {
  if (messages.length > 0) {
    sessionStorage.setItem("chat-messages", JSON.stringify(messages));
  }
}, [messages]);

// Save thread ID
useEffect(() => {
  if (threadId) {
    sessionStorage.setItem("chat-thread-id", threadId);
  }
}, [threadId]);
```

### Restoration

On page load, the chat state is restored:

```typescript
useEffect(() => {
  const savedMessages = sessionStorage.getItem("chat-messages");
  const savedThreadId = sessionStorage.getItem("chat-thread-id");
  
  if (savedMessages) {
    const parsed = JSON.parse(savedMessages);
    setMessages(
      parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    );
  }
  
  if (savedThreadId) {
    setThreadId(savedThreadId);
  }
}, []);
```

### Clearing Session

```typescript
const clearChat = () => {
  setMessages([]);
  setThreadId(null);
  sessionStorage.removeItem("chat-messages");
  sessionStorage.removeItem("chat-thread-id");
};
```

---

## Components

### ChatHeader

**Location:** `src/components/chat/ChatHeader.tsx`

**Purpose:** Displays app title and new chat button

**Features:**
- App branding
- New chat button (conditionally shown)
- Responsive design

### ChatMessages

**Location:** `src/components/chat/ChatMessages.tsx`

**Purpose:** Displays message history

**Features:**
- Scrollable message list
- Auto-scroll to bottom
- Empty state with suggested questions
- Loading indicator
- Message grouping by role

**Props:**
```typescript
interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSuggestedQuestion: (question: string) => void;
}
```

### ChatMessage

**Location:** `src/components/chat/ChatMessage.tsx`

**Purpose:** Renders individual messages

**Features:**
- Different styling for user vs assistant
- Markdown rendering
- Code syntax highlighting
- Mermaid diagram support
- Timestamp display

**Props:**
```typescript
interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
```

### ChatInput

**Location:** `src/components/chat/ChatInput.tsx`

**Purpose:** Message input interface

**Features:**
- Text input field
- Send button
- Context drawer integration
- Mobile menu button
- Disabled state during loading
- Enter to send

**Props:**
```typescript
interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  context: Context;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isContextDrawerOpen?: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onContextChange: (context: Context) => void;
  onContextDrawerToggle?: () => void;
  onMobileMenuOpen: () => void;
}
```

---

## Hooks

### useChatLogic

**Location:** `src/hooks/useChatLogic.ts`

**Purpose:** Core chat state management

**State:**
```typescript
{
  messages: Message[];          // Chat history
  inputValue: string;           // Current input
  isLoading: boolean;           // Loading state
  threadId: string | null;      // OpenAI thread
  context: Context;             // User context
}
```

**Actions:**
```typescript
{
  setInputValue: (value: string) => void;
  setContext: (context: Context) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}
```

**File Processing:**

The hook handles file processing before sending:

```typescript
// PDF extraction
if (file.type === 'application/pdf') {
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Extract text...
  }
}

// Text file reading
else if (file.type.startsWith('text/')) {
  const reader = new FileReader();
  reader.readAsText(file);
}
```

---

## Error Handling

### Network Errors

```typescript
try {
  const response = await fetch("/api/chatbot", {...});
  
  if (!response.ok || !response.body) {
    throw new Error("Failed to get response");
  }
} catch (error) {
  const errorMsg: Message = {
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content: "I apologize, but I'm having trouble responding right now. Please try again later.",
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, errorMsg]);
}
```

### API Errors

```typescript
// Check for error in response
if (data.error) {
  hasError = true;
  errorMessage = data.error;
  throw new Error(errorMessage);
}
```

### File Processing Errors

```typescript
try {
  // Process PDF
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  // ...
} catch (error) {
  console.error('PDF parsing error:', error);
  return `File: ${file.name} (PDF - could not extract text)`;
}
```

---

## Keyboard Shortcuts

### Global Shortcuts

- **Cmd/Ctrl + K** - Start new chat (with confirmation)
- **Cmd/Ctrl + L** - Toggle context drawer
- **Cmd/Ctrl + Enter** - Send message (when typing)
- **?** - Show keyboard shortcuts dialog

### Context Drawer Shortcuts

When drawer is open:
- **1-6** - Switch between tabs
- **← / →** - Navigate tabs
- **Cmd/Ctrl + Backspace** - Clear all context

### Implementation

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    
    // Cmd/Ctrl + K: Clear conversation
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (messages.length > 0) {
        setIsStartNewChatModalOpen(true);
      }
    }
    
    // Cmd/Ctrl + L: Toggle context drawer
    if ((e.metaKey || e.ctrlKey) && e.key === "l") {
      e.preventDefault();
      setIsContextDrawerOpen(prev => !prev);
    }
    
    // Cmd/Ctrl + Enter: Send message
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isTyping && inputValue.trim()) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };
  
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [messages.length, inputValue, sendMessage]);
```

---

## Best Practices

### 1. State Management

- Keep messages in a single source of truth
- Use session storage for persistence
- Update UI optimistically (add user message immediately)

### 2. Error Handling

- Always provide user-friendly error messages
- Log errors for debugging
- Gracefully degrade when features fail
- Show loading states

### 3. Performance

- Debounce auto-scroll for smooth UX
- Lazy load heavy libraries (PDF.js)
- Minimize re-renders with proper memoization

### 4. User Experience

- Auto-scroll to latest message
- Show typing indicators
- Disable input during loading
- Clear visual feedback for all actions

### 5. Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

---

## Message Format

### Message Type

```typescript
interface Message {
  id: string;               // Unique identifier
  role: "user" | "assistant";  // Message sender
  content: string;          // Message text (supports markdown)
  timestamp: Date;          // When message was sent
}
```

### Markdown Support

Messages support full markdown syntax:

- **Bold**, *italic*, `code`
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Links
- Blockquotes
- Tables
- Mermaid diagrams

### Example Message

```typescript
{
  id: "1706790000000",
  role: "assistant",
  content: "Here's how to prepare for your interview:\n\n1. **Research the company**\n2. Practice common questions\n3. Prepare questions to ask\n\n```javascript\nconst prepare = () => {\n  console.log('You got this!');\n};\n```",
  timestamp: new Date("2024-02-01T10:00:00Z")
}
```

---

## Suggested Questions

### Purpose

Help users get started with relevant questions based on context.

### Implementation

```typescript
// src/components/chat/ChatMessages.tsx
{messages.length === 0 && !isLoading && (
  <SuggestedQuestions onQuestionClick={onSuggestedQuestion} />
)}
```

### Default Questions

```typescript
const suggestedQuestions = [
  "What should I include in my resume?",
  "How do I prepare for a technical interview?",
  "Can you review my cover letter?",
  "What are common interview questions?",
];
```

### Dynamic Questions

Questions can be customized based on context:

```typescript
if (context.greenhouseJobDescription) {
  questions.push("Help me tailor my resume for this job");
}

if (context.uploadedFiles?.length > 0) {
  questions.push("Review my uploaded documents");
}
```

---

## Thread Management

### OpenAI Threads

Each conversation has a unique thread ID that maintains context across messages.

### Thread Lifecycle

1. **Creation** - First message creates a new thread
2. **Reuse** - Subsequent messages use the same thread
3. **Persistence** - Thread ID saved to session storage
4. **Clearing** - New chat creates a new thread

### Thread Caching

```typescript
// src/services/MessageRouter.ts
const threadCache = new Map<string, string>();

async routeMessage(message, clientThreadId) {
  let threadId: string;
  
  if (clientThreadId && threadCache.has(clientThreadId)) {
    threadId = clientThreadId;
  } else {
    const thread = await this.openai.beta.threads.create();
    threadId = thread.id;
    threadCache.set(threadId, threadId);
  }
}
```

---

## Troubleshooting

### Messages Not Persisting

Check session storage:
```typescript
console.log(sessionStorage.getItem("chat-messages"));
```

### Thread Not Maintaining Context

Verify thread ID is being sent:
```typescript
console.log("Thread ID:", threadId);
```

### Loading State Stuck

Check for unhandled errors:
```typescript
try {
  // Send message...
} finally {
  setIsLoading(false);  // Always reset loading state
}
```

### Auto-scroll Not Working

Ensure ref is properly attached:
```typescript
<div ref={messagesEndRef} />
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
```

---

## Related Documentation

- [Context Drawer](./context-drawer.md)
- [API Routes](./api-routes.md)
- [File Processing](./file-processing.md)
- [OpenAI Integration](./openai-integration.md)

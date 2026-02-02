# API Routes

Complete reference for all API endpoints in AskMyAI.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Chat API](#chat-api)
- [Job Board APIs](#job-board-apis)
- [Utility APIs](#utility-apis)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Overview

AskMyAI provides several API endpoints for different functionalities:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chatbot` | POST | Main chat interface with AI |
| `/api/fetch-greenhouse` | POST | Fetch job descriptions from Greenhouse |
| `/api/auth/linkedin/callback` | GET | LinkedIn OAuth callback |
| `/api/suggest-question` | POST | Submit feature suggestions |
| `/api/schedule-call` | POST | Schedule consultation calls |
| `/api/report-issue` | POST | Report bugs or issues |

### Base URL

All API routes are prefixed with `/api` and are relative to the application's base URL.

---

## Authentication

### LinkedIn OAuth

**Endpoint:** `/api/auth/linkedin/callback`

**Method:** `GET`

**Purpose:** Handles LinkedIn OAuth callback after user authorization.

**Parameters:**
```typescript
{
  code: string;          // Authorization code from LinkedIn
  state: string;         // State parameter for CSRF protection
}
```

**Response:**
```typescript
{
  redirect: string;      // Redirect URL with profile data
  profile: {
    name: string;
    email?: string;
  }
}
```

**Environment Variables Required:**
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`

---

## Chat API

### Send Message

**Endpoint:** `/api/chatbot`

**Method:** `POST`

**Purpose:** Send a message to the AI assistant and receive a response.

**Headers:**
```typescript
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```typescript
{
  message: string;              // User's message
  threadId?: string;            // Optional: OpenAI thread ID for context
  context?: {                   // Optional: Additional context
    linkedInProfile?: string;
    jobUrl?: string;
    greenhouseJobDescription?: string;
    pastedText?: string;
    uploadedImages?: string;    // Processed image metadata
    uploadedFiles?: string;     // Processed file content
  };
}
```

**Response:**
```typescript
{
  response: string;       // AI assistant's response
  threadId: string;       // Thread ID for continued conversation
}
```

**Error Response:**
```typescript
{
  error: string;          // Error message
}
```

**Example:**
```typescript
const response = await fetch("/api/chatbot", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "How should I prepare for an interview?",
    context: {
      greenhouseJobDescription: "Senior Software Engineer at Tech Corp...",
    },
  }),
});

const data = await response.json();
console.log(data.response);  // AI's response
console.log(data.threadId);  // Save for next message
```

**Configuration:**
- Max Duration: 60 seconds
- Requires: `OPENAI_API_KEY`, `OPENAI_ASSISTANT_ID`

---

## Job Board APIs

### Fetch Greenhouse Job

**Endpoint:** `/api/fetch-greenhouse`

**Method:** `POST`

**Purpose:** Fetch and parse job description from a Greenhouse URL.

**Request Body:**
```typescript
{
  url: string;  // Greenhouse job board URL
}
```

**Response:**
```typescript
{
  jobDescription: string;   // Formatted job description
  jobTitle?: string;        // Extracted job title
  company?: string;         // Company name
  location?: string;        // Job location
}
```

**Error Response:**
```typescript
{
  error: string;  // Error message
}
```

**Example:**
```typescript
const response = await fetch("/api/fetch-greenhouse", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://job-boards.greenhouse.io/company/jobs/123",
  }),
});

const data = await response.json();
console.log(data.jobDescription);
```

**Validation:**
- URL must contain "greenhouse.io"
- Extracts: title, company, location, description

---

## Utility APIs

### Suggest Question

**Endpoint:** `/api/suggest-question`

**Method:** `POST`

**Purpose:** Submit a suggested question or feature request.

**Request Body:**
```typescript
{
  question: string;      // Suggested question
  context?: string;      // Additional context
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```typescript
await fetch("/api/suggest-question", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: "Can you add support for Indeed job listings?",
    context: "I use Indeed frequently for job searching",
  }),
});
```

### Schedule Call

**Endpoint:** `/api/schedule-call`

**Method:** `POST`

**Purpose:** Schedule a consultation call.

**Request Body:**
```typescript
{
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Requires:** Resend API key (`RESEND_API_KEY`)

### Report Issue

**Endpoint:** `/api/report-issue`

**Method:** `POST`

**Purpose:** Report a bug or technical issue.

**Request Body:**
```typescript
{
  description: string;           // Issue description
  debugInfo?: Record<string, unknown>;  // Optional debug data
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Requires:** Resend API key (`RESEND_API_KEY`)

---

## Error Handling

### Standard Error Response

All APIs return errors in a consistent format:

```typescript
{
  error: string;     // Human-readable error message
  status: number;    // HTTP status code (in response headers)
}
```

### Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Missing required parameters, invalid URL format |
| 401 | Unauthorized | Missing or invalid API keys |
| 404 | Not Found | Could not extract job information |
| 500 | Internal Server Error | Server-side processing error |

### Error Handling Example

```typescript
try {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error("API Error:", error);
  // Handle error appropriately
}
```

---

## Rate Limiting

### Current Limits

Currently, there are no explicit rate limits enforced by the application. However, be mindful of:

- **OpenAI Rate Limits** - Subject to your OpenAI API tier
- **Vercel Limits** - Function execution time (60s max for Pro)
- **Third-party Services** - LinkedIn, Resend have their own limits

### Best Practices

1. **Implement Debouncing** - Avoid rapid-fire requests
2. **Cache Responses** - Store job descriptions client-side
3. **Handle Errors** - Implement exponential backoff for retries
4. **Monitor Usage** - Track API call patterns

### Future Enhancements

Planned rate limiting features:
- Per-user rate limits
- API key authentication
- Request quotas
- Usage analytics

---

## API Workflow Diagrams

### Chat Flow

```
Client                API                 MessageRouter      OpenAI
  |                    |                       |                |
  |--POST /chatbot---->|                       |                |
  |                    |--routeMessage()------>|                |
  |                    |                       |--createThread->|
  |                    |                       |<--threadId-----|
  |                    |                       |--addMessage--->|
  |                    |                       |--createRun---->|
  |                    |                       |--poll status-->|
  |                    |                       |<--response-----|
  |                    |<--result--------------|                |
  |<--JSON response----|                       |                |
```

### Job Board Fetch Flow

```
Client                API                 External Site
  |                    |                       |
  |--POST /fetch-X---->|                       |
  |                    |--fetch(url)---------->|
  |                    |<--HTML----------------|
  |                    |                       |
  |                    |--parse with cheerio   |
  |                    |--extract data         |
  |                    |--format response      |
  |                    |                       |
  |<--JSON response----|                       |
```

---

## Environment Variables

### Required

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...

# LinkedIn OAuth (Optional)
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Services (Optional)
RESEND_API_KEY=re_...
```

### Configuration File

Create `.env.local` in project root:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_assistant_id

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your_resend_key
```

---

## Testing APIs

### Using cURL

```bash
# Test chatbot
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me?",
    "context": {
      "linkedInProfile": "John Doe"
    }
  }'

# Test Greenhouse fetch
curl -X POST http://localhost:3000/api/fetch-greenhouse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://job-boards.greenhouse.io/..."}'
```

### Using JavaScript

```javascript
// Test chatbot API
async function testChat() {
  const response = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Test message",
    }),
  });

  const data = await response.json();
  console.log(data);
}

testChat();
```

---

## Related Documentation

- [Chat System](./chat-system.md)
- [Context Drawer](./context-drawer.md)
- [OpenAI Integration](./openai-integration.md)
- [File Processing](./file-processing.md)

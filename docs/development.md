# Development Guide

Complete guide for developing and contributing to AskMyAI.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Common Tasks](#common-tasks)

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** or **yarn**
- **Git**
- **VS Code** (recommended) or your preferred editor

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/askmyai.git
cd askmyai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Add your API keys to .env.local
# Edit .env.local with your OpenAI credentials

# 5. Start development server
npm run dev

# 6. Open in browser
# Visit http://localhost:3000
```

### Environment Variables

Create `.env.local` in project root:

```env
# OpenAI (Required)
OPENAI_API_KEY=sk-your-key-here
OPENAI_ASSISTANT_ID=asst-your-id-here

# LinkedIn OAuth (Optional)
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Service (Optional)
RESEND_API_KEY=re-your-key-here
```

---

## Development Environment

### VS Code Setup

**Recommended Extensions:**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

**Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Git Hooks

Set up pre-commit hooks (optional):

```bash
# Install husky
npm install --save-dev husky

# Set up hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

---

## Project Structure

```
askmyai/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── chatbot/
│   │   │   ├── fetch-*/
│   │   │   └── ...
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── chat/              # Chat components
│   │   ├── context-drawer/    # Context drawer tabs
│   │   └── modals/            # Modal components
│   ├── hooks/                 # Custom React hooks
│   │   └── useChatLogic.ts
│   ├── services/              # Business logic
│   │   ├── MessageRouter.ts
│   │   ├── ResponseGenerator.ts
│   │   └── ...
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript types
├── docs/                      # Documentation
├── public/                    # Static assets
├── .env.local                 # Environment variables (local)
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

### Key Directories

- **`src/app/`** - Next.js pages and API routes
- **`src/components/`** - Reusable React components
- **`src/hooks/`** - Custom hooks for state/logic
- **`src/services/`** - Backend services and business logic
- **`src/types/`** - TypeScript type definitions

---

## Development Workflow

### Running the Development Server

```bash
# Start dev server
npm run dev

# Server runs on http://localhost:3000
# API available at http://localhost:3000/api/*
```

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Type Checking

```bash
# Run TypeScript type checker
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## Code Standards

### TypeScript

- **Use explicit types** for function parameters and returns
- **Avoid `any`** - use `unknown` if type is truly unknown
- **Use interfaces** for object types
- **Export types** from `src/types/`

**Example:**
```typescript
// Good
interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  // ...
}

// Bad
export function ChatMessage(props: any) {
  // ...
}
```

### React Components

- **Use functional components** with hooks
- **Use TypeScript** for props
- **Destructure props** in function signature
- **Use `"use client"`** directive for client components

**Example:**
```typescript
"use client";

import { useState } from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Styling

- **Use Tailwind CSS** for styling
- **Follow existing patterns** in the codebase
- **Use dark mode classes**: `dark:` prefix
- **Responsive design**: `sm:`, `md:`, `lg:` prefixes

**Example:**
```tsx
<div className="rounded-lg bg-white px-4 py-3 dark:bg-gray-900 sm:px-6 sm:py-4">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
    Title
  </h2>
</div>
```

### File Naming

- **Components**: PascalCase (e.g., `ChatMessage.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useChatLogic.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `chat.ts` containing `Message` interface)

---

## Common Tasks

### Adding a New API Route

1. **Create route file:**
   ```bash
   mkdir src/app/api/my-endpoint
   touch src/app/api/my-endpoint/route.ts
   ```

2. **Implement route:**
   ```typescript
   import { NextRequest, NextResponse } from "next/server";

   export async function POST(req: NextRequest) {
     try {
       const body = await req.json();
       
       // Your logic here
       
       return NextResponse.json({ success: true });
     } catch (error) {
       return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
       );
     }
   }
   ```

3. **Test endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/my-endpoint \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Adding a New Component

1. **Create component file:**
   ```bash
   touch src/components/MyComponent.tsx
   ```

2. **Implement component:**
   ```typescript
   "use client";

   interface MyComponentProps {
     title: string;
   }

   export function MyComponent({ title }: MyComponentProps) {
     return (
       <div>
         <h1>{title}</h1>
       </div>
     );
   }
   ```

3. **Use component:**
   ```typescript
   import { MyComponent } from "@/components/MyComponent";

   <MyComponent title="Hello" />
   ```

### Adding a New Job Board Tab

See [Context Drawer Documentation](./context-drawer.md#adding-new-tabs) for detailed instructions.

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages (carefully)
npm update

# Rebuild and test
npm run build
```

### Debugging

**Server-side:**
```typescript
// Use console.log or logger
import { logger } from "@/lib/logger";

logger.debug("Debug info", { data });
logger.error("Error occurred", error);
```

**Client-side:**
```typescript
// Use browser console
console.log("Debug:", data);

// React DevTools
// Install React Developer Tools browser extension
```

**API Routes:**
```bash
# Check logs in terminal where dev server is running
# Or use Vercel logs for production
vercel logs --follow
```

---

## Testing Workflow

### Manual Testing

1. **Start dev server:** `npm run dev`
2. **Test in browser:** http://localhost:3000
3. **Check console** for errors
4. **Test features:**
   - Chat functionality
   - Context drawer
   - File uploads
   - API endpoints

### API Testing

```bash
# Test chatbot API
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "context": {
      "linkedInProfile": "Test User"
    }
  }'

# Test job board fetch
curl -X POST http://localhost:3000/api/fetch-greenhouse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://job-boards.greenhouse.io/example/jobs/123"}'
```

---

## Git Workflow

### Branch Naming

- **Features**: `feature/description`
- **Bugs**: `fix/description`
- **Docs**: `docs/description`

### Commit Messages

Follow conventional commits:

```
feat: add greenhouse job board integration
fix: resolve PDF parsing error
docs: update API documentation
refactor: simplify context drawer logic
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test locally
4. Commit changes
5. Push to GitHub
6. Create Pull Request
7. Request review
8. Address feedback
9. Merge after approval

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## Related Documentation

- [Deployment Guide](./deployment.md)
- [Testing Guide](./testing.md)
- [Architecture](./architecture.md)
- [API Routes](./api-routes.md)

# Context Drawer System

The Context Drawer is a powerful feature that allows users to provide personalized context to the AI agent. This context enriches conversations by giving the AI additional information about the user's situation, job applications, documents, and more.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tab System](#tab-system)
- [Data Flow](#data-flow)
- [File Processing](#file-processing)
- [Adding New Tabs](#adding-new-tabs)
- [API Reference](#api-reference)

---

## Overview

The Context Drawer appears at the bottom of the chat interface and provides five different tabs for users to input various types of context:

1. **LinkedIn** - Professional profile information
2. **Greenhouse** - Job descriptions from Greenhouse
3. **Text** - Free-form text input
4. **Images** - Image uploads
5. **Files** - Document uploads (PDFs, text files, etc.)

All context data is stored in the browser's session storage and sent to the AI with every message.

---

## Architecture

### Component Structure

```
src/components/
├── ContextDrawer.tsx              # Main drawer component
└── context-drawer/
    ├── JobBoardTab.tsx            # Reusable job board tab component
    ├── LinkedInTab.tsx            # LinkedIn-specific tab
    ├── GreenhouseTab.tsx          # Greenhouse tab (uses JobBoardTab)
    ├── TextTab.tsx                # Free-form text input
    ├── ImagesTab.tsx              # Image upload tab
    ├── FilesTab.tsx               # File upload tab
    ├── TabButton.tsx              # Tab button component
    └── DragDropUpload.tsx         # Drag-and-drop upload component
```

### State Management

The Context Drawer manages its own state internally but exposes it to parent components through callbacks:

```typescript
interface ContextDrawerProps {
  context: Context;                    // Current context from parent
  onContextChange: (context: Context) => void;  // Callback when context changes
  isOpen?: boolean;                    // Optional controlled open state
  onToggle?: () => void;               // Optional toggle callback
}
```

### Context Type Definition

```typescript
// src/types/chat.ts
export interface Context {
  linkedInProfile?: string;
  jobUrl?: string;
  greenhouseJobDescription?: string;
  pastedText?: string;
  uploadedImages?: File[] | string;   // File[] in frontend, string when sent to API
  uploadedFiles?: File[] | string;    // File[] in frontend, string when sent to API
}
```

---

## Tab System

### Tab Types

The drawer supports five tab types:

```typescript
type TabType = "linkedin" | "greenhouse" | "other" | "images" | "files";
```

### Keyboard Shortcuts

Users can quickly navigate tabs using keyboard shortcuts:

- **1** - LinkedIn tab
- **2** - Greenhouse tab
- **3** - Text tab
- **4** - Images tab
- **5** - Files tab
- **← / →** - Navigate between tabs
- **Cmd/Ctrl + L** - Toggle drawer open/close
- **Cmd/Ctrl + Backspace** - Clear all context (when drawer is open)

### Tab Indicators

Each tab button displays a visual indicator when it contains data:

```typescript
<TabButton
  isActive={activeTab === "greenhouse"}
  onClick={() => setActiveTab("greenhouse")}
  icon={<Briefcase className="h-4 w-4" />}
  label="Greenhouse"
  hasContext={!!greenhouseJobDescription}  // Shows dot indicator
/>
```

---

## Data Flow

### 1. User Input → Component State

When users enter data in any tab:

```typescript
// Example: Greenhouse job description
<GreenhouseTab
  jobDescription={greenhouseJobDescription}
  onJobDescriptionChange={setGreenhouseJobDescription}  // Updates local state
  onClear={() => setGreenhouseJobDescription("")}
/>
```

### 2. Component State → Context Object

The drawer combines all tab states into a single context object:

```typescript
useEffect(() => {
  const newContext: Context = {
    linkedInProfile: name || undefined,
    jobUrl: company || undefined,
    greenhouseJobDescription: greenhouseJobDescription || undefined,
    pastedText: pastedText || undefined,
    uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined,
    uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
  };
  
  onContextChange(newContext);  // Send to parent
}, [name, company, greenhouseJobDescription, pastedText, uploadedImages, uploadedFiles]);
```

### 3. Context → Session Storage

Context is persisted to session storage (excluding File objects):

```typescript
const storableContext = {
  linkedInProfile: name || undefined,
  jobUrl: company || undefined,
  greenhouseJobDescription: greenhouseJobDescription || undefined,
  pastedText: pastedText || undefined,
  // Files can't be stored in session storage
};
sessionStorage.setItem("chat-context", JSON.stringify(storableContext));
```

### 4. Context → Chat Hook

The context flows up to the `useChatLogic` hook:

```typescript
// src/hooks/useChatLogic.ts
const [context, setContext] = useState<Context>({});

// Parent component passes setContext as onContextChange callback
<ContextDrawer 
  context={context} 
  onContextChange={setContext}
/>
```

### 5. Message Sending → File Processing

When sending a message, files are processed into serializable format:

```typescript
const sendMessage = async (content: string) => {
  // Process PDFs
  if (file.type === 'application/pdf') {
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    // Extract text from all pages...
  }
  
  // Process text files
  else if (file.type.startsWith('text/')) {
    const reader = new FileReader();
    reader.readAsText(file);
  }
  
  // Create serializable context
  const serializableContext = {
    ...context,
    uploadedImages: processedImages,  // String metadata
    uploadedFiles: processedFiles,    // String with content
  };
};
```

### 6. Context → API Request

The processed context is sent with every message:

```typescript
const response = await fetch("/api/chatbot", {
  method: "POST",
  body: JSON.stringify({
    message: content.trim(),
    threadId,
    context: serializableContext,  // All context included
  }),
});
```

### 7. API → Response Generator

The API extracts and formats context for the AI:

```typescript
// src/services/ResponseGenerator.ts
if (context) {
  const contextParts: string[] = [];
  
  if (context.linkedInProfile) {
    contextParts.push(`LinkedIn Profile: ${context.linkedInProfile}`);
  }
  if (context.greenhouseJobDescription) {
    contextParts.push(`Greenhouse Job Description:\n${context.greenhouseJobDescription}`);
  }
  if (context.uploadedFiles) {
    contextParts.push(`Uploaded Files:\n${context.uploadedFiles}`);
  }
  
  messageContent = `Context Information:\n${contextParts.join("\n\n")}\n\nQuestion: ${message}`;
}
```

### 8. Final Message to AI

The AI receives a formatted message with all context:

```
Context Information:
LinkedIn Profile: John Doe

Greenhouse Job Description:
Job Title: Full Stack Developer
Company: Tech Corp
...

Uploaded Files:
File: resume.pdf (PDF, 2 pages)
Content:
[Full text extracted from PDF]

File: cover-letter.txt
Content:
Dear Hiring Manager...

Question: Can you help me tailor my resume for these positions?
```

---

## File Processing

### Supported File Types

| File Type | Processing Method | Output |
|-----------|------------------|---------|
| **PDF** (`.pdf`) | PDF.js text extraction | Full text content from all pages |
| **Text** (`.txt`, `.md`) | FileReader.readAsText() | Full text content |
| **JSON** (`.json`) | FileReader.readAsText() | Full JSON content |
| **CSV** (`.csv`) | FileReader.readAsText() | Full CSV content |
| **Images** (`.jpg`, `.png`, etc.) | FileReader.readAsDataURL() | Metadata only (name, type) |
| **Other** | N/A | Metadata only (name, type, size) |

### PDF Text Extraction

PDFs are processed using Mozilla's PDF.js library:

```typescript
const pdfjsLib = await import('pdfjs-dist');

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Load PDF
const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

// Extract text from each page
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map(item => item.str).join(' ');
  fullText += pageText + '\n';
}
```

### Text File Processing

Text files are read directly:

```typescript
const reader = new FileReader();
reader.onload = (e) => {
  resolve(`File: ${file.name}\nContent:\n${e.target?.result}`);
};
reader.readAsText(file);
```

### Error Handling

If a file can't be processed, metadata is sent instead:

```typescript
try {
  // Process file...
} catch (error) {
  console.error('File processing error:', error);
  return `File: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`;
}
```

---

## Adding New Tabs

### Method 1: Using JobBoardTab (Recommended for Job Sites)

If you're adding a new job board, use the reusable `JobBoardTab` component:

1. **Create API endpoint** for fetching job data:

```typescript
// src/app/api/fetch-[jobsite]/route.ts
export async function POST(req: NextRequest) {
  const { url } = await req.json();
  
  // Fetch and parse job listing
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Extract job info
  const jobTitle = $('h1.job-title').text();
  const jobDescription = $('.job-description').text();
  
  return NextResponse.json({
    jobDescription: `Job Title: ${jobTitle}\n\n${jobDescription}`,
    jobTitle,
  });
}
```

2. **Create tab component** using `JobBoardTab`:

```typescript
// src/components/context-drawer/NewJobSiteTab.tsx
import { Briefcase } from "lucide-react";
import { JobBoardTab } from "./JobBoardTab";

export function NewJobSiteTab({ 
  jobDescription, 
  onJobDescriptionChange, 
  onClear 
}: JobBoardTabProps) {
  return (
    <JobBoardTab
      jobDescription={jobDescription}
      onJobDescriptionChange={onJobDescriptionChange}
      onClear={onClear}
      icon={Briefcase}
      title="Job Site Name"
      placeholder="Paste job description from Job Site..."
      apiEndpoint="/api/fetch-newjobsite"
      urlPlaceholder="Paste Job Site URL..."
    />
  );
}
```

3. **Add to ContextDrawer**:

```typescript
// Add state
const [newJobSiteDescription, setNewJobSiteDescription] = useState("");

// Add to TabType
type TabType = "linkedin" | "greenhouse" | "newjobsite" | "other" | "images" | "files";

// Add tab button
<TabButton
  isActive={activeTab === "newjobsite"}
  onClick={() => setActiveTab("newjobsite")}
  icon={<Briefcase className="h-4 w-4" />}
  label="New Job Site"
  hasContext={!!newJobSiteDescription}
/>

// Add tab content
{activeTab === "newjobsite" && (
  <NewJobSiteTab
    jobDescription={newJobSiteDescription}
    onJobDescriptionChange={setNewJobSiteDescription}
    onClear={() => setNewJobSiteDescription("")}
  />
)}
```

4. **Update context type**:

```typescript
// src/types/chat.ts
export interface Context {
  // ... existing fields
  newJobSiteDescription?: string;
}
```

5. **Include in context object**:

```typescript
const newContext: Context = {
  // ... existing fields
  newJobSiteDescription: newJobSiteDescription || undefined,
};
```

### Method 2: Custom Tab Component

For specialized tabs with unique functionality:

```typescript
// src/components/context-drawer/CustomTab.tsx
export function CustomTab({ data, onDataChange }: CustomTabProps) {
  return (
    <div className="space-y-4">
      {/* Your custom UI */}
    </div>
  );
}
```

Then follow steps 3-5 above to integrate into the drawer.

---

## API Reference

### ContextDrawer Props

```typescript
interface ContextDrawerProps {
  context: Context;                    // Current context state
  onContextChange: (context: Context) => void;  // Callback when context changes
  isOpen?: boolean;                    // Optional: Control open state externally
  onToggle?: () => void;               // Optional: Callback when toggled
}
```

### Context Type

```typescript
interface Context {
  linkedInProfile?: string;            // User's name from LinkedIn
  jobUrl?: string;                     // Company name from LinkedIn
  greenhouseJobDescription?: string;   // Job description from Greenhouse
  pastedText?: string;                 // Free-form text input
  uploadedImages?: File[] | string;    // Images (File[] in UI, string in API)
  uploadedFiles?: File[] | string;     // Files (File[] in UI, string in API)
}
```

### JobBoardTab Props

```typescript
interface JobBoardTabProps {
  jobDescription: string;              // Current job description
  onJobDescriptionChange: (value: string) => void;  // Update callback
  onClear: () => void;                 // Clear callback
  icon: LucideIcon;                    // Icon component
  title: string;                       // Tab title
  placeholder: string;                 // Textarea placeholder
  apiEndpoint: string;                 // API endpoint for fetching
  urlPlaceholder?: string;             // URL input placeholder
}
```

### Session Storage Keys

- `chat-context` - Stores serializable context data (text only)
- `chat-messages` - Stores chat message history
- `chat-thread-id` - Stores OpenAI thread ID

---

## Best Practices

### 1. State Management

- Keep File objects in component state
- Convert to strings before sending to API
- Don't store Files in session storage

### 2. Error Handling

- Always catch file processing errors
- Provide fallback to metadata-only output
- Log errors for debugging

### 3. Performance

- Use dynamic imports for heavy libraries (e.g., PDF.js)
- Process files only when sending messages
- Limit file size if needed

### 4. User Experience

- Show loading states during file processing
- Provide clear error messages
- Include character/file counts
- Support keyboard navigation

### 5. Type Safety

- Use type guards for File[] vs string checks
- Properly type all context fields
- Export shared types from central location

---

## Troubleshooting

### Context Not Persisting

Check that session storage is working:
```typescript
console.log(sessionStorage.getItem("chat-context"));
```

### Files Not Processing

Verify file type detection:
```typescript
console.log(file.type, file.name);
```

### PDF Extraction Failing

Check browser console for PDF.js errors:
```typescript
console.error('PDF parsing error:', error);
```

### Context Not Sent to AI

Verify context in API request:
```typescript
// In useChatLogic.ts
console.log('Sending context:', serializableContext);
```

---

## Future Enhancements

Potential improvements to the Context Drawer system:

1. **Image OCR** - Extract text from images
2. **DOCX Support** - Parse Word documents
3. **Context Templates** - Save/load context presets
4. **Context Preview** - Show formatted context before sending
5. **File Size Limits** - Enforce maximum file sizes
6. **Batch Processing** - Process multiple files simultaneously
7. **Cloud Storage** - Persist files beyond session
8. **Context Analytics** - Track which context is most useful

---

## Related Documentation

- [Chat System](./chat-system.md)
- [API Routes](./api-routes.md)
- [File Processing](./file-processing.md)
- [OpenAI Integration](./openai-integration.md)

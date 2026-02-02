# File Processing

Comprehensive guide to file handling and processing in AskMyAI.

## Table of Contents

- [Overview](#overview)
- [Supported File Types](#supported-file-types)
- [PDF Processing](#pdf-processing)
- [Text File Processing](#text-file-processing)
- [Image Processing](#image-processing)
- [Implementation Details](#implementation-details)
- [Best Practices](#best-practices)

---

## Overview

AskMyAI processes uploaded files to extract content that can be used as context for AI conversations. Files are processed client-side before being sent to the API.

### Processing Flow

```
File Upload → Type Detection → Content Extraction → Serialization → API Request
```

### Key Features

- **PDF Text Extraction** - Extract text from all pages
- **Text File Reading** - Read plain text, markdown, JSON, CSV
- **Image Metadata** - Capture image information
- **Error Handling** - Graceful fallbacks for unsupported formats
- **No File Storage** - All processing happens in-browser

---

## Supported File Types

| File Type | Extension | Processing Method | Output |
|-----------|-----------|-------------------|--------|
| PDF | `.pdf` | PDF.js extraction | Full text content |
| Plain Text | `.txt` | FileReader API | Full content |
| Markdown | `.md` | FileReader API | Full content |
| JSON | `.json` | FileReader API | Full content |
| CSV | `.csv` | FileReader API | Full content |
| Images | `.jpg`, `.png`, `.gif`, etc. | FileReader API | Metadata only |
| Other | Any | N/A | Metadata only |

---

## PDF Processing

### Library Used

**PDF.js** - Mozilla's PDF rendering library

```bash
npm install pdfjs-dist
```

### Implementation

```typescript
// Dynamic import for code splitting
const pdfjsLib = await import('pdfjs-dist');

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Read file as ArrayBuffer
const arrayBuffer = await file.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);

// Load PDF
const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

// Extract text from all pages
let fullText = '';
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  const pageText = textContent.items
    .map((item: any) => item.str)
    .join(' ');
  fullText += pageText + '\n';
}
```

### Output Format

```
File: resume.pdf (PDF, 3 pages)
Content:
John Doe
Software Engineer
...
```

### Error Handling

```typescript
try {
  // PDF processing...
} catch (error) {
  console.error('PDF parsing error:', error);
  return `File: ${file.name} (PDF - could not extract text, ${(file.size / 1024).toFixed(2)} KB)`;
}
```

### Limitations

- Scanned PDFs without OCR may not extract text
- Password-protected PDFs may fail
- Complex layouts might have formatting issues
- Large PDFs (>10MB) may be slow to process

---

## Text File Processing

### Supported Types

- Plain text (`.txt`)
- Markdown (`.md`)
- JSON (`.json`)
- CSV (`.csv`)
- Any file with `text/*` MIME type

### Implementation

```typescript
if (file.type.startsWith('text/') || 
    file.name.endsWith('.txt') || 
    file.name.endsWith('.md') ||
    file.name.endsWith('.json') ||
    file.name.endsWith('.csv')) {
  
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(`File: ${file.name}\nContent:\n${e.target?.result}`);
    };
    reader.readAsText(file);
  });
}
```

### Output Format

```
File: cover-letter.txt
Content:
Dear Hiring Manager,

I am writing to express my interest...
```

### Character Encoding

Files are read as UTF-8 by default. For other encodings, consider preprocessing.

---

## Image Processing

### Supported Formats

All browser-supported image formats:
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)
- BMP (`.bmp`)

### Current Implementation

Images are currently processed for metadata only:

```typescript
const imagePromises = context.uploadedImages.map(async (file) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(`Image: ${file.name} (${file.type})`);
    };
    reader.readAsDataURL(file);
  });
});
```

### Output Format

```
Image: headshot.jpg (image/jpeg)
Image: certificate.png (image/png)
```

### Future Enhancements

Planned image processing features:
- **OCR** - Extract text from images (Tesseract.js)
- **Base64 Encoding** - Send image data to vision models
- **Image Analysis** - Use vision APIs for context
- **Thumbnail Generation** - Create previews

---

## Implementation Details

### File Processing Hook

**Location:** `src/hooks/useChatLogic.ts`

```typescript
const sendMessage = async (content: string) => {
  // Process images
  let processedImages: string | undefined;
  if (context.uploadedImages && Array.isArray(context.uploadedImages)) {
    const imagePromises = context.uploadedImages.map(/* ... */);
    const images = await Promise.all(imagePromises);
    processedImages = images.join('\n');
  }
  
  // Process files
  let processedFiles: string | undefined;
  if (context.uploadedFiles && Array.isArray(context.uploadedFiles)) {
    const filePromises = context.uploadedFiles.map(/* ... */);
    const files = await Promise.all(filePromises);
    processedFiles = files.join('\n\n');
  }
  
  // Create serializable context
  const serializableContext = {
    ...context,
    uploadedImages: processedImages,
    uploadedFiles: processedFiles,
  };
};
```

### Type Detection

```typescript
// PDF detection
if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
  // Process as PDF
}

// Text file detection
else if (file.type.startsWith('text/') || 
         file.name.endsWith('.txt') ||
         file.name.endsWith('.md') ||
         file.name.endsWith('.json') ||
         file.name.endsWith('.csv')) {
  // Process as text
}

// Default: metadata only
else {
  return `File: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`;
}
```

### Parallel Processing

Multiple files are processed in parallel using `Promise.all`:

```typescript
const filePromises = context.uploadedFiles.map(async (file) => {
  // Process each file
});

const files = await Promise.all(filePromises);
const processedFiles = files.join('\n\n');
```

---

## Best Practices

### 1. File Size Limits

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  alert(`File ${file.name} is too large (max 10MB)`);
  return;
}
```

### 2. Type Validation

```typescript
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'image/*'
];

if (!ALLOWED_TYPES.some(type => 
  type.includes('*') 
    ? file.type.startsWith(type.split('/')[0])
    : file.type === type
)) {
  alert('Unsupported file type');
  return;
}
```

### 3. Error Handling

Always provide fallbacks:

```typescript
try {
  const content = await processFile(file);
  return content;
} catch (error) {
  console.error(`Error processing ${file.name}:`, error);
  // Return metadata as fallback
  return `File: ${file.name} (${file.type}, ${formatFileSize(file.size)})`;
}
```

### 4. User Feedback

Show loading states during processing:

```typescript
const [isProcessing, setIsProcessing] = useState(false);

const handleFileUpload = async (files: File[]) => {
  setIsProcessing(true);
  try {
    await processFiles(files);
  } finally {
    setIsProcessing(false);
  }
};
```

### 5. Memory Management

Clean up object URLs after use:

```typescript
const objectUrl = URL.createObjectURL(file);
// Use objectUrl...
URL.revokeObjectURL(objectUrl); // Clean up
```

---

## Troubleshooting

### PDF Not Extracting Text

**Possible Causes:**
- Scanned PDF without OCR layer
- Password-protected PDF
- Corrupted PDF file

**Solutions:**
- Run PDF through OCR first
- Remove password protection
- Try a different PDF

### Text File Showing Garbled Characters

**Possible Causes:**
- Non-UTF-8 encoding
- Binary file misidentified as text

**Solutions:**
- Convert file to UTF-8
- Check file type detection logic

### Large Files Causing Slow Processing

**Possible Causes:**
- File too large for client-side processing
- Multiple large files processed simultaneously

**Solutions:**
- Implement file size limits
- Process files sequentially for large files
- Show progress indicators

### Memory Issues

**Possible Causes:**
- Processing too many files at once
- Not cleaning up object URLs

**Solutions:**
- Limit concurrent file processing
- Implement `URL.revokeObjectURL()`
- Consider chunked processing for large files

---

## Related Documentation

- [Context Drawer](./context-drawer.md)
- [Chat System](./chat-system.md)
- [API Routes](./api-routes.md)

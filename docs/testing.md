# Testing Guide

Guide to testing AskMyAI features and functionality.

## Table of Contents

- [Overview](#overview)
- [Manual Testing](#manual-testing)
- [API Testing](#api-testing)
- [Component Testing](#component-testing)
- [Integration Testing](#integration-testing)
- [Test Checklist](#test-checklist)

---

## Overview

Currently, AskMyAI primarily uses manual testing. This guide covers comprehensive testing procedures.

### Testing Levels

1. **Manual Testing** - Browser-based feature testing
2. **API Testing** - Endpoint validation with curl/Postman
3. **Component Testing** - React component verification
4. **Integration Testing** - End-to-end workflow testing

---

## Manual Testing

### Setup

```bash
# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Chat System Testing

**Basic Chat:**
1. ✅ Send a simple message
2. ✅ Verify AI response appears
3. ✅ Check message formatting (markdown, code blocks)
4. ✅ Verify timestamps display correctly

**Message History:**
1. ✅ Send multiple messages
2. ✅ Refresh page
3. ✅ Verify messages persist
4. ✅ Click "New Chat"
5. ✅ Verify messages clear

**Error Handling:**
1. ✅ Disconnect internet
2. ✅ Send message
3. ✅ Verify error message displays
4. ✅ Reconnect and retry

### Context Drawer Testing

**LinkedIn Tab:**
1. ✅ Open context drawer (Cmd/Ctrl + L)
2. ✅ Navigate to LinkedIn tab (press 1)
3. ✅ Enter name and company
4. ✅ Verify data persists on refresh
5. ✅ Clear and verify empty

**Greenhouse Tab:**
1. ✅ Navigate to Greenhouse tab (press 3)
2. ✅ Paste Greenhouse URL
3. ✅ Click "Fetch"
4. ✅ Verify job description populates
5. ✅ Test error handling with invalid URL

**Text Tab:**
1. ✅ Navigate to Text tab (press 4)
2. ✅ Paste text content
3. ✅ Verify character count
4. ✅ Test paste button
5. ✅ Test clear button

**Images Tab:**
1. ✅ Navigate to Images tab (press 5)
2. ✅ Upload image (drag & drop)
3. ✅ Upload image (click to select)
4. ✅ Verify thumbnail displays
5. ✅ Remove image
6. ✅ Upload multiple images

**Files Tab:**
1. ✅ Navigate to Files tab (press 6)
2. ✅ Upload PDF file
3. ✅ Upload text file (.txt, .md)
4. ✅ Verify file info displays
5. ✅ Remove file
6. ✅ Upload multiple files

### File Processing Testing

**PDF Files:**
```
Test with:
1. Simple PDF (single page)
2. Multi-page PDF
3. Scanned PDF (may fail - expected)
4. Large PDF (>5MB)
```

**Text Files:**
```
Test with:
1. Plain .txt file
2. Markdown .md file
3. JSON file
4. CSV file
```

**Send Message with Files:**
1. ✅ Upload PDF resume
2. ✅ Add job description in Greenhouse tab
3. ✅ Ask "Review my resume for this job"
4. ✅ Verify AI references both documents

### Keyboard Shortcuts Testing

1. ✅ Cmd/Ctrl + K - New chat modal
2. ✅ Cmd/Ctrl + L - Toggle drawer
3. ✅ Cmd/Ctrl + Enter - Send message
4. ✅ 1-6 keys - Switch tabs (drawer open)
5. ✅ ← → arrows - Navigate tabs
6. ✅ Cmd/Ctrl + Backspace - Clear context

### Responsive Design Testing

**Desktop (1920x1080):**
1. ✅ Layout displays correctly
2. ✅ All features accessible
3. ✅ Context drawer opens properly

**Tablet (768x1024):**
1. ✅ Layout adjusts
2. ✅ Touch interactions work
3. ✅ Drawer fits screen

**Mobile (375x667):**
1. ✅ Mobile layout activates
2. ✅ Mobile menu button visible
3. ✅ Drawer takes full width
4. ✅ Input field accessible

### Dark Mode Testing

1. ✅ Toggle dark mode (system or manual)
2. ✅ Verify all components update
3. ✅ Check contrast/readability
4. ✅ Test across all tabs

---

## API Testing

### Using curl

**Chatbot API:**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should I include in my resume?",
    "context": {
      "linkedInProfile": "John Doe",
      "greenhouseJobDescription": "Senior Software Engineer..."
    }
  }'
```

**Expected Response:**
```json
{
  "response": "Based on the job description...",
  "threadId": "thread_abc123"
}
```

**Fetch Greenhouse:**
```bash
curl -X POST http://localhost:3000/api/fetch-greenhouse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://job-boards.greenhouse.io/company/jobs/123"}'
```

**Expected Response:**
```json
{
  "jobDescription": "Job Title: ...\nCompany: ...",
  "jobTitle": "Software Engineer",
  "company": "Tech Corp"
}
```

**Suggest Question:**
```bash
curl -X POST http://localhost:3000/api/suggest-question \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Add Indeed integration",
    "context": "Would be useful for job hunting"
  }'
```

### Using Postman

1. **Import Collection:**
   - Create requests for each endpoint
   - Save as collection
   - Export/share with team

2. **Environment Variables:**
   ```json
   {
     "base_url": "http://localhost:3000",
     "api_key": "your-test-key"
   }
   ```

3. **Test Scripts:**
   ```javascript
   // Postman test script
   pm.test("Status code is 200", function () {
     pm.response.to.have.status(200);
   });

   pm.test("Response has threadId", function () {
     var jsonData = pm.response.json();
     pm.expect(jsonData).to.have.property('threadId');
   });
   ```

---

## Component Testing

### Testing Checklist

**ChatMessage Component:**
- [ ] Renders user messages (right-aligned, blue)
- [ ] Renders assistant messages (left-aligned, gray)
- [ ] Markdown renders correctly
- [ ] Code blocks have syntax highlighting
- [ ] Timestamps display
- [ ] Long messages wrap properly

**ContextDrawer Component:**
- [ ] Opens/closes on toggle
- [ ] Tabs switch correctly
- [ ] Data persists between tabs
- [ ] Clear all works
- [ ] Context summary shows correct counts
- [ ] Keyboard shortcuts work

**ChatInput Component:**
- [ ] Input field accepts text
- [ ] Send button enables when text present
- [ ] Send button disabled when loading
- [ ] Enter key sends message
- [ ] Input clears after send

---

## Integration Testing

### End-to-End Workflows

**Workflow 1: Job Application Preparation**
```
1. Open app
2. Open context drawer
3. Navigate to Greenhouse tab
4. Paste job URL
5. Fetch job description
6. Navigate to Files tab
7. Upload resume PDF
8. Close drawer
9. Ask: "How well does my resume match this job?"
10. Verify AI response references both resume and job description
```

**Workflow 2: Interview Preparation**
```
1. Add job description (Greenhouse tab)
2. Add company name (LinkedIn tab)
3. Ask: "What interview questions should I prepare for?"
4. Get response
5. Ask follow-up: "How should I answer the first question?"
6. Verify conversation continuity
```

**Workflow 3: Resume Review**
```
1. Upload resume (Files tab)
2. Upload cover letter (Files tab)
3. Ask: "Review my resume and cover letter"
4. Verify both documents are processed
5. Make edits based on feedback
6. Upload revised resume
7. Ask: "How is this version?"
```

---

## Test Checklist

### Pre-Deployment Testing

**Core Functionality:**
- [ ] Chat sends and receives messages
- [ ] Message history persists
- [ ] New chat clears history
- [ ] Loading states display
- [ ] Error messages display

**Context Features:**
- [ ] LinkedIn tab saves data
- [ ] Greenhouse tab fetch works
- [ ] Text tab accepts input
- [ ] Images upload successfully
- [ ] Files upload and process
- [ ] PDFs extract text
- [ ] Context clears completely

**API Endpoints:**
- [ ] /api/chatbot returns responses
- [ ] /api/fetch-greenhouse works
- [ ] Error handling returns proper codes
- [ ] Environment variables loaded

**UI/UX:**
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Dark mode works
- [ ] Keyboard shortcuts work
- [ ] Accessibility (ARIA labels)

**Performance:**
- [ ] Pages load quickly
- [ ] No console errors
- [ ] File uploads < 30s
- [ ] API responses < 60s
- [ ] No memory leaks (test long sessions)

---

## Regression Testing

After making changes, test:

**Affected Features:**
- [ ] Direct changes work as expected
- [ ] Related features still work
- [ ] No new console errors
- [ ] No TypeScript errors

**Critical Paths:**
- [ ] Basic chat still works
- [ ] Context drawer opens/closes
- [ ] File uploads work
- [ ] API calls succeed

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Performance Testing

### Load Testing

```bash
# Using Apache Bench (simple)
ab -n 100 -c 10 http://localhost:3000/

# Using autocannon (better for Node.js)
npx autocannon -c 10 -d 30 http://localhost:3000/api/chatbot
```

### Memory Testing

1. Open Chrome DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Use app for 10 minutes
5. Take another snapshot
6. Compare for memory leaks

---

## Troubleshooting Tests

### Test Fails Checklist

1. ✅ Environment variables set?
2. ✅ Dependencies installed?
3. ✅ Dev server running?
4. ✅ Network connected?
5. ✅ Browser cache cleared?
6. ✅ Correct Node.js version?

### Common Issues

**"API key not configured"**
- Check `.env.local` exists
- Verify `OPENAI_API_KEY` is set
- Restart dev server

**"Module not found"**
- Run `npm install`
- Clear `.next` folder
- Restart dev server

**"Port already in use"**
- Kill process on port 3000
- Use different port: `npm run dev -- -p 3001`

---

## Related Documentation

- [Development Guide](./development.md)
- [API Routes](./api-routes.md)
- [Chat System](./chat-system.md)
- [Context Drawer](./context-drawer.md)

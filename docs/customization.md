# Customization Guide

This guide shows you how to personalize Ask My AI to create your own custom AI assistant (e.g., "Ask Nick", "Ask Matt", "Ask Lindsey").

## Quick Start (5 Minutes)

### Step 1: Update Site Configuration

Edit **`src/config/site.ts`** and change these values:

```typescript
export const siteConfig = {
  // 1️⃣ Change to your name
  name: "Nick", // ← Change this!

  // 2️⃣ Update page title
  title: "Ask Nick | AI-Powered Chat Assistant",

  // 3️⃣ Update description
  description: "Chat with an AI version of Nick. Ask about experience, skills, projects, and more.",

  // 4️⃣ Customize welcome message
  welcomeHeading: "Chat with an AI version of Nick",
  welcomeSubheading: "Ask me about my experience, skills, projects.",

  // 5️⃣ Update your URLs
  url: "https://asknick.vercel.app",
  linkedInUrl: "https://linkedin.com/in/nicholas-adamou",

  // 6️⃣ Email subject prefix
  emailSubjectPrefix: "Ask Nick",

  // 7️⃣ SEO keywords
  keywords: ["AI", "Chat", "Assistant", "Portfolio", "Nick", "Software Engineer"],
};
```

### Step 2: Update OpenAI Assistant

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to your Assistant
3. Update the instructions with your personal information:

```
You are Nick's AI assistant. You help answer questions about Nick's:
- Professional experience at [Your Companies]
- Technical skills in [Your Skills]
- Projects like [Your Projects]
- Educational background at [Your School]
...
```

4. Upload your resume and any relevant documents

### Step 3: Update Suggested Questions

Edit **`src/components/SuggestedQuestions.tsx`**:

```typescript
const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    category: "GET TO KNOW ME",
    icon: <User className="h-5 w-5 text-blue-500" />,
    questions: [
      "Tell me about yourself",
      "What are you looking for in your next role?", // ← Customize these!
    ],
  },
  {
    category: "TECHNICAL SKILLS",
    icon: <Code className="h-5 w-5 text-blue-500" />,
    questions: [
      "What technologies do you specialize in?", // ← Add your skills!
      "Tell me about a complex system you've built",
    ],
  },
  // Add more categories...
];
```

### Step 4: Add Your Resume

1. **Add your resume files** to **`public/resumes/`**:

```bash
public/resumes/
  ├── my-resume.pdf
  └── my-resume-extended.pdf  # Optional: add more variants
```

2. **Update the config** in **`src/config/site.ts`**:

```typescript
export const siteConfig = {
  // ... other config
  
  resumes: [
    {
      title: "Standard Resume",
      subtitle: "Software Engineer",
      description: "Full stack software engineer resume",
      filename: "my-resume.pdf", // ← Change this to your filename
    },
    // Add more resume variants:
    {
      title: "Extended Resume",
      subtitle: "Detailed Experience",
      description: "Comprehensive resume with all projects",
      filename: "my-resume-extended.pdf",
    },
  ],
};
```

That's it! The download modal will automatically show all your resume options.

## Examples

See **`src/config/site.example.ts`** for complete examples:

### Ask Nick (Software Engineer)
```typescript
name: "Nick",
welcomeHeading: "Chat with an AI version of Nick",
keywords: ["AI", "Chat", "Portfolio", "Nick", "Software Engineer"],
```

### Ask Matt (Career Coach)
```typescript
name: "Matt",
welcomeHeading: "Chat with Matt's AI",
keywords: ["AI", "Chat", "Career Coach", "Leadership", "Matt"],
```

### Ask Lindsey (Product Designer)
```typescript
name: "Lindsey",
welcomeHeading: "Chat with Lindsey",
keywords: ["AI", "Chat", "Product Design", "UX", "Lindsey"],
```

## What Gets Customized?

When you update `src/config/site.ts`, it automatically changes:

| Location | What Changes |
|----------|-------------|
| **Browser Tab** | Page title |
| **Header** | "Ask [Your Name]" |
| **Welcome Screen** | Heading and subheading |
| **Meta Tags** | SEO title, description, keywords |
| **OpenGraph** | Social media preview cards |
| **Emails** | Bug report and question suggestion subjects |

## Advanced Customization

### Update LinkedIn Profile Link

Edit **`src/components/NextStepsMenu.tsx`**:

```typescript
// Find the LinkedIn menu item and update the URL
{
  icon: Linkedin,
  label: "View LinkedIn Profile",
  onClick: () => window.open(siteConfig.linkedInUrl, "_blank"),
},
```

### Change Theme Colors

Edit **`tailwind.config.ts`**:

```typescript
colors: {
  accent: "#3b82f6", // ← Change primary accent color
  // Add your custom colors here
}
```

### Update Social Media Image

Replace **`public/og-image.png`** with your own image:
- Recommended size: 1200 × 630 pixels
- Format: PNG or JPG
- Shows in LinkedIn, Twitter, Facebook previews

### Add Custom Menu Items

Edit **`src/components/NextStepsMenu.tsx`** to add new actions:

```typescript
const menuItems: MenuItem[] = [
  // Add your custom items
  {
    icon: YourIcon,
    label: "Your Custom Action",
    onClick: () => {
      // Your custom logic
    },
  },
  // ...existing items
];
```

## Testing Your Customization

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Check these areas:
   - ✅ Browser tab shows your name
   - ✅ Header says "Ask [Your Name]"
   - ✅ Welcome message is personalized
   - ✅ Suggested questions are relevant
   - ✅ Bug report emails have correct subject

3. Test OpenGraph preview:
   - Share your URL on LinkedIn/Twitter
   - Verify preview shows correct title and image

## Deployment Checklist

Before deploying your customized version:

- [ ] Updated `src/config/site.ts` with your information
- [ ] Uploaded your resume to OpenAI Assistant
- [ ] Customized suggested questions
- [ ] Replaced resume files in `public/resumes/`
- [ ] Updated `OPENAI_ASSISTANT_ID` in environment variables
- [ ] Replaced `public/og-image.png` with your image
- [ ] Updated LinkedIn URL in NextStepsMenu
- [ ] Set production URL in `siteConfig.url`
- [ ] Tested all features work correctly

## Need Help?

- Check [Development Guide](./development.md) for development setup
- See [Deployment Guide](./deployment.md) for deploying to production
- Review [Architecture](./architecture.md) to understand the system

## Share Your Customization!

Built your own "Ask [Your Name]" assistant? We'd love to see it! Consider:
- Sharing on Twitter/LinkedIn with #AskMyAI
- Contributing improvements back to the template
- Helping others customize their own versions

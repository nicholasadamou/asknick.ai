# Resume Files

Place your resume PDF files in this directory.

## Quick Setup

1. **Add your resume files** to this directory:
   ```
   public/resumes/
   ├── my-resume.pdf
   ├── my-resume-extended.pdf
   └── my-portfolio.pdf
   ```

2. **Update the configuration** in `src/config/site.ts`:
   ```typescript
   resumes: [
     {
       title: "Standard Resume",
       subtitle: "Software Engineer",
       description: "Full stack software engineer resume",
       filename: "my-resume.pdf",
     },
     {
       title: "Extended Resume",
       subtitle: "Detailed Experience",
       description: "Comprehensive resume with all projects",
       filename: "my-resume-extended.pdf",
     },
   ],
   ```

3. **That's it!** Your resumes will be available in the "Download Resume" modal.

## Examples

**Single Resume:**
```typescript
resumes: [
  {
    title: "Resume",
    subtitle: "Product Designer",
    description: "UX/UI design experience",
    filename: "resume.pdf",
  },
],
```

**Multiple Variants:**
```typescript
resumes: [
  {
    title: "Software Engineer Resume",
    subtitle: "Full Stack Developer",
    description: "Comprehensive software engineering resume",
    filename: "engineer-resume.pdf",
  },
  {
    title: "Tech Lead Resume",
    subtitle: "Leadership & Architecture",
    description: "Resume focused on technical leadership",
    filename: "tech-lead-resume.pdf",
  },
],
```

## More Info

See **[Customization Guide](../../docs/customization.md#step-4-add-your-resume)** for complete instructions.

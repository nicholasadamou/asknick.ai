# Resend Setup Guide

This document explains how to set up Resend for all email features in Ask My AI:
- Bug reports (Report Issue modal)
- Question suggestions (Suggest Question modal)
- Future email notifications

## Prerequisites

- A Resend account ([sign up at resend.com](https://resend.com))
- A verified domain (or use Resend's test domain for development)

## Setup Steps

### 1. Get Your Resend API Key

1. Sign up or log in to [Resend](https://resend.com)
2. Navigate to **API Keys** in your dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Ask My AI Bug Reports")
5. Select **Sending access**
6. Copy the API key

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email addresses
RESEND_FROM_EMAIL=bugs@yourdomain.com
NOTIFICATION_EMAIL=your-email@example.com
```

**Important Notes:**
- `RESEND_FROM_EMAIL`: Must be from a domain you've verified with Resend
- `NOTIFICATION_EMAIL`: Your email where bug reports will be sent
- For development, you can use `onboarding@resend.dev` as the from address (Resend's test email)

### 3. Verify Your Domain (Production)

For production use, you need to verify your domain:

1. Go to **Domains** in your Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually takes a few minutes)

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app and click **Report Issue**

3. Fill out the form with a test bug report

4. Click **Send Report**

5. Check your notification email inbox for the bug report

## Email Features

### Bug Reports (`/api/report-issue`)

The bug report email includes:

- **Issue Description**: The user's description of the problem
- **Debug Information**: 
  - User Agent
  - Timestamp
  - URL where the issue occurred
  - Screen size
- **Next Steps**: Suggested actions for handling the bug

The email is styled with:
- Responsive HTML design
- Orange/amber theme to match the bug icon
- Plain text fallback for email clients that don't support HTML

### Question Suggestions (`/api/suggest-question`)

The question suggestion email includes:
- **Suggested Question**: The user's question
- **Additional Context**: Optional context about why they're asking
- **Next Steps**: Recommendations for implementing the answer
- **Implementation Tips**: Actionable items for adding to your knowledge base

The email is styled with:
- Responsive HTML design
- Blue theme to match the lightbulb icon
- Plain text fallback

## API Endpoints

### Bug Reports

The endpoint `/api/report-issue` handles:
- Validation of required fields
- Formatting bug report data
- Sending emails via Resend
- Error handling and logging

### Question Suggestions

The endpoint `/api/suggest-question` handles:
- Validation of required fields (question)
- Formatting question suggestion data
- Sending emails via Resend
- Error handling and logging

## Development vs Production

### Development
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Resend's test email
NOTIFICATION_EMAIL=your-email@example.com
```

### Production
```bash
# .env.production
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=bugs@yourdomain.com  # Your verified domain
NOTIFICATION_EMAIL=support@yourdomain.com
```

## Advanced Configuration

### Multiple Recipients

To send to multiple email addresses:

```typescript
// In src/app/api/report-issue/route.ts
to: [
  process.env.NOTIFICATION_EMAIL,
  "developer@example.com",
  "support@example.com"
].filter(Boolean) as string[],
```

### Add CC/BCC

```typescript
cc: ["manager@example.com"],
bcc: ["archive@example.com"],
```

### Custom Reply-To

```typescript
replyTo: "support@yourdomain.com",
```

### Add Attachments

If you want to include screenshots or logs:

```typescript
attachments: [
  {
    filename: "screenshot.png",
    content: base64Screenshot,
  },
],
```

## Integration with Issue Trackers

You can extend the API to automatically create issues in your tracker:

### GitHub Issues

```typescript
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

await octokit.issues.create({
  owner: "your-username",
  repo: "your-repo",
  title: `Bug Report: ${description.substring(0, 50)}...`,
  body: `
## Description
${description}

## Debug Info
- User Agent: ${debugInfo.userAgent}
- URL: ${debugInfo.url}
- Screen: ${debugInfo.screenSize}
- Time: ${debugInfo.timestamp}
  `,
  labels: ["bug", "user-reported"],
});
```

### Linear

```typescript
import { LinearClient } from "@linear/sdk";

const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

await linear.issueCreate({
  teamId: "TEAM_ID",
  title: `Bug: ${description.substring(0, 50)}...`,
  description: description,
  priority: 2,
  labelIds: ["BUG_LABEL_ID"],
});
```

### Jira

```typescript
import fetch from "node-fetch";

await fetch(`https://your-domain.atlassian.net/rest/api/3/issue`, {
  method: "POST",
  headers: {
    "Authorization": `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    fields: {
      project: { key: "PROJECT_KEY" },
      summary: `Bug: ${description.substring(0, 50)}...`,
      description: description,
      issuetype: { name: "Bug" },
    },
  }),
});
```

## Rate Limiting

Resend has rate limits depending on your plan:
- **Free**: 100 emails/day
- **Pro**: 50,000 emails/month
- **Enterprise**: Custom limits

For high-traffic sites, consider:
1. Implementing rate limiting on the client side
2. Using a queue system (e.g., Bull, BullMQ)
3. Storing reports in a database and sending digest emails

## Monitoring

Track bug report submissions:

```typescript
// Add to your analytics
analytics.track("Bug Report Submitted", {
  timestamp: new Date().toISOString(),
  emailSent: !!data?.id,
});
```

## Troubleshooting

**Email not received:**
- Check spam folder
- Verify API key is correct
- Check Resend logs in dashboard
- Verify from email domain is verified

**API errors:**
- Check environment variables are set
- Verify Resend API key has sending permissions
- Check server logs for detailed error messages

**Debug information not captured:**
- Ensure modal is opened in a browser context (not SSR)
- Check browser console for JavaScript errors

## Testing Checklist

### Bug Reports
- [ ] Bug report email received
- [ ] Email includes description
- [ ] Debug info is accurate
- [ ] Success message displays
- [ ] Error handling works
- [ ] Form clears after submission
- [ ] Modal closes automatically
- [ ] Works on mobile devices

### Question Suggestions
- [ ] Question suggestion email received
- [ ] Email includes question
- [ ] Optional context is included when provided
- [ ] Success message displays
- [ ] Error handling works
- [ ] Form clears after submission
- [ ] Modal closes automatically
- [ ] Form validation works (minimum 5 characters)

## Cost Estimation

Resend Pricing (as of setup):
- Free tier: 3,000 emails/month, 100/day
- Pro: $20/month for 50,000 emails
- Business: $80/month for 250,000 emails

For most applications, the free tier is sufficient for bug reports.

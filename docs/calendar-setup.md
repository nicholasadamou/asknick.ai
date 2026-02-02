# Calendar Integration Setup

This document explains how to set up the calendar booking integration for the "Schedule a Call" feature.

## Calendly Integration (Recommended)

### Setup Steps

1. **Create a Calendly Account**
   - Sign up at [calendly.com](https://calendly.com)
   - Set up your availability and meeting types

2. **Update Your Calendly Username**
   - Edit `src/components/modals/ScheduleCallModal.tsx`
   - Update line 30 with your Calendly username:
     ```typescript
     const calendlyUsername = "your-username"; // Replace with your actual Calendly username
     ```

3. **Configure Custom Questions (Optional)**
   - In your Calendly settings, add custom questions to match the form fields:
     - Question 1: "Company"
     - Question 2: "Role"
     - Question 3: "Additional Notes"
   - These will be pre-filled when users book through the modal

4. **Test the Integration**
   - Click "Schedule a Call" in your app
   - Fill out the form and submit
   - Verify the Calendly page opens with pre-filled information

## Alternative: Cal.com Integration

If you prefer Cal.com instead of Calendly:

1. Replace the Calendly URL in `ScheduleCallModal.tsx`:
   ```typescript
   const baseUrl = `https://cal.com/your-username`;
   ```

2. Cal.com uses the same URL parameter format for pre-filling forms

## Analytics & Tracking

The modal sends scheduling data to `/api/schedule-call` for logging. You can extend this endpoint to:

### 1. Save to Database
```typescript
// In src/app/api/schedule-call/route.ts
import { db } from "@/lib/db";

await db.scheduleRequests.create({
  data: {
    name: body.name,
    email: body.email,
    company: body.company,
    role: body.role,
    notes: body.notes,
    timestamp: new Date(body.timestamp),
  },
});
```

### 2. Send Email Notifications

Using a service like SendGrid or Resend:

```typescript
import { sendEmail } from "@/lib/email";

await sendEmail({
  to: "your-email@example.com",
  subject: "New Call Scheduling Request",
  html: `
    <h2>New Scheduling Request</h2>
    <p><strong>Name:</strong> ${body.name}</p>
    <p><strong>Email:</strong> ${body.email}</p>
    <p><strong>Company:</strong> ${body.company}</p>
    <p><strong>Role:</strong> ${body.role}</p>
    <p><strong>Notes:</strong> ${body.notes}</p>
  `,
});
```

### 3. Analytics Integration

Send to your analytics platform:

```typescript
// Mixpanel
mixpanel.track("Schedule Call Initiated", {
  email: body.email,
  company: body.company,
  role: body.role,
});

// Google Analytics
gtag("event", "schedule_call", {
  email: body.email,
  company: body.company,
});
```

## Environment Variables

Add these to your `.env.local` file if needed:

```bash
# Calendly
NEXT_PUBLIC_CALENDLY_USERNAME=your-username

# Email notifications (if using)
SENDGRID_API_KEY=your-sendgrid-key
NOTIFICATION_EMAIL=your-email@example.com

# Analytics (if using)
MIXPANEL_TOKEN=your-mixpanel-token
```

## Customization

### Change Button Text
Edit line 109 in `ScheduleCallModal.tsx`:
```typescript
<button>Book the Call</button>
```

### Add More Form Fields
1. Update the `ScheduleCallFormData` type in `src/types/chat.ts`
2. Add input fields in the modal
3. Include the new fields in the URL parameters

### Custom Success Message
Add a toast notification after successful submission:
```typescript
import { toast } from "sonner"; // or your preferred toast library

toast.success("Calendly opened! Complete your booking in the new tab.");
```

## Testing

1. Test with valid data - should open Calendly with pre-filled fields
2. Test with empty fields - Calendly should still open
3. Check console logs to verify API logging works
4. Test on mobile devices to ensure new tab opens correctly

## Troubleshooting

**Calendly page doesn't open**
- Check browser popup blockers
- Verify the Calendly username is correct
- Check browser console for errors

**Fields not pre-filled**
- Ensure URL parameters match your Calendly question IDs
- Check the network tab to see the generated URL

**API endpoint fails**
- Check server logs
- Verify the request body structure
- Test the endpoint directly with curl or Postman

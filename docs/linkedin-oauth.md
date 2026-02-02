# LinkedIn OAuth Integration

This document explains how to set up LinkedIn OAuth for profile import functionality.

## Overview

The LinkedIn import feature uses **LinkedIn's official OAuth 2.0 API**, which is:
- ✅ **FREE** to use
- ✅ **Official** LinkedIn integration  
- ✅ **Compliant** with LinkedIn's Terms of Service
- ✅ **Simple** to set up
- ✅ **No API costs**

Users can click "Sign in with LinkedIn" to import their name from their LinkedIn profile.

## Why OAuth Instead of Scraping?

**Proxycurl was shut down** in July 2026 after LinkedIn filed a federal lawsuit. Other scraping services like ScrapIn cost $1,000+ for credits.

LinkedIn OAuth is the official, free, and compliant way to access LinkedIn data. It's the same technology used by thousands of apps that have "Sign in with LinkedIn" buttons.

## Setup

### 1. Create a LinkedIn App

1. Go to https://www.linkedin.com/developers/
2. Click "Create app"
3. Fill in the required fields:
   - **App name**: Your app name
   - **LinkedIn Page**: Create or select a LinkedIn page (required)
   - **App logo**: Upload a logo (will appear on OAuth consent screen)
4. Click "Create app"

### 2. Configure OAuth Settings

1. Go to the "Auth" tab of your app
2. Add your OAuth redirect URL:
   - For development: `http://localhost:3000/api/auth/linkedin/callback`
   - For production: `https://yourdomain.com/api/auth/linkedin/callback`

3. Note your credentials from the "Auth" tab:
   - Client ID
   - Client Secret

### 3. Request "Sign In with LinkedIn" Product

1. Go to the "Products" tab
2. Select "Sign In with LinkedIn using OpenID Connect"
3. Click "Request access" (usually instant approval)

### 4. Configure Environment Variables

Add to `.env.local`:

```bash
# LinkedIn OAuth (both server and client)
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here

# Client-side (publicly exposed)
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For production**, change `NEXT_PUBLIC_APP_URL` to your production URL.

### 5. Restart Development Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Usage

1. Open the application
2. Click "Add context for personalized responses"
3. In the LinkedIn tab, click "Sign in with LinkedIn"
4. Authorize the app on LinkedIn's consent screen
5. Your name will be automatically filled

## How It Works

### OAuth Flow

1. User clicks "Sign in with LinkedIn"
2. App redirects to LinkedIn's authorization page
3. User logs in and authorizes the app
4. LinkedIn redirects back to your app with an authorization code
5. App exchanges the code for an access token
6. App fetches user profile data using the access token
7. Profile data is displayed in the form

### API Endpoints

#### GET `/api/auth/linkedin/callback`

Handles the OAuth callback from LinkedIn.

**Query Parameters:**
- `code` - Authorization code from LinkedIn
- `state` - CSRF protection token

**Response:**
- Redirects to `/?linkedin_auth=success&profile=<encoded_data>`

## What Data Is Collected?

LinkedIn OAuth provides:
- ✅ Name (first + last)
- ✅ Email address
- ✅ Profile picture URL

This implementation currently only imports the user's name. You can extend it to use email or other data as needed.

## Security

- OAuth state parameter prevents CSRF attacks
- Client Secret is never exposed to the browser
- Access tokens are exchanged server-side only
- Redirect URLs must be pre-registered
- Users must explicitly authorize your app

## Cost

**FREE** - LinkedIn OAuth is completely free to use for the "Sign In with LinkedIn" product.

## Limitations

- Only imports the authenticated user's own data
- Cannot import other people's profiles
- Cannot extract job postings (LinkedIn doesn't provide this via OAuth)
- Rate limits apply (but are generous for profile access)

## Troubleshooting

### "Invalid redirect_uri" Error

- Ensure the redirect URI in your code matches exactly what you registered
- Include the protocol (`http://` or `https://`)
- Don't include trailing slashes unless registered with them

### "LinkedIn OAuth is not configured" Alert

- Verify `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` is set in `.env.local`
- Restart your development server after adding environment variables
- Check that the variable name is correct (must start with `NEXT_PUBLIC_`)

### OAuth Fails Silently

- Check browser console for errors
- Verify Client ID and Client Secret are correct
- Ensure "Sign In with LinkedIn" product is approved
- Check that redirect URL is registered in LinkedIn app settings

### Profile Data Not Importing

- Verify the OAuth callback route exists at `/api/auth/linkedin/callback/route.ts`
- Check that environment variables `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` are set
- Look at server logs for errors

## Production Deployment

When deploying to production:

1. Update redirect URL in LinkedIn app to your production URL
2. Set `NEXT_PUBLIC_APP_URL` to your production domain
3. Never commit `.env.local` to version control
4. Use your hosting provider's environment variable settings

Example for Vercel:
```bash
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Files

- `src/components/context-drawer/LinkedInTab.tsx` - OAuth button and callback handler
- `src/app/api/auth/linkedin/callback/route.ts` - OAuth callback endpoint
- `.env` - Environment variable template

## Support

- LinkedIn Developer Documentation: https://learn.microsoft.com/en-us/linkedin/
- OAuth 2.0 Flow: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow
- FAQ: https://developer.linkedin.com/support/faq

## Advantages Over Scraping

| Feature | OAuth (This Implementation) | Scraping Services |
|---------|----------------------------|-------------------|
| Cost | FREE | $1,000+ |
| Legal | ✅ Official | ⚠️ Risky |
| Data Freshness | Real-time | Varies |
| Setup Time | 10 minutes | Varies |
| Maintenance | None | High |
| Risk | None | Legal liability |

---

**Last Updated**: February 2026  
**Status**: Active and fully functional

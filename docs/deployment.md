# Deployment Guide

Complete guide to deploying AskMyAI to production.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

AskMyAI is a Next.js application optimized for deployment on Vercel. This guide covers the complete deployment process.

### Deployment Options

- **Vercel** (Recommended) - Zero-config Next.js deployment
- **Docker** - Containerized deployment
- **Self-hosted** - Manual Node.js deployment

---

## Prerequisites

### Required Accounts

1. **Vercel Account** - [vercel.com](https://vercel.com)
2. **OpenAI Account** - [platform.openai.com](https://platform.openai.com)
3. **GitHub Account** - For repository access

### Optional Services

- **LinkedIn Developer** - For OAuth integration
- **Resend** - For email notifications
- **Cal.com** - For scheduling integration

---

## Vercel Deployment

### Method 1: Deploy via Vercel Dashboard

1. **Connect Repository**
   ```
   1. Go to vercel.com/new
   2. Import your Git repository
   3. Select the repository: askmyai
   4. Configure project settings
   ```

2. **Configure Build Settings**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables**
   
   Go to Project Settings → Environment Variables and add:

   ```env
   # OpenAI (Required)
   OPENAI_API_KEY=sk-...
   OPENAI_ASSISTANT_ID=asst_...
   
   # LinkedIn OAuth (Optional)
   LINKEDIN_CLIENT_ID=...
   LINKEDIN_CLIENT_SECRET=...
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   
   # Email Service (Optional)
   RESEND_API_KEY=re_...
   ```

4. **Deploy**
   ```
   Click "Deploy"
   Wait for build to complete
   ```

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Add environment variables
vercel env add OPENAI_API_KEY
vercel env add OPENAI_ASSISTANT_ID
# ... add other variables

# Redeploy with new env vars
vercel --prod
```

### Automatic Deployments

Once connected to Git:
- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on push to any branch
- **Pull Requests**: Creates preview deployments

---

## Environment Variables

### Production Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key (sk-...) |
| `OPENAI_ASSISTANT_ID` | ✅ Yes | Assistant ID (asst_...) |
| `LINKEDIN_CLIENT_ID` | ❌ No | LinkedIn OAuth client ID |
| `LINKEDIN_CLIENT_SECRET` | ❌ No | LinkedIn OAuth secret |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Recommended | App URL (for OAuth redirects) |
| `RESEND_API_KEY` | ❌ No | Resend email API key |

### Setting Environment Variables

**Via Vercel Dashboard:**
```
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add each variable
4. Select environments (Production, Preview, Development)
5. Save
```

**Via Vercel CLI:**
```bash
# Add for all environments
vercel env add OPENAI_API_KEY

# Add for specific environment
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview
```

### Verifying Environment Variables

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

---

## Post-Deployment

### 1. Verify Deployment

Check that your app is running:
```bash
# Visit your deployment URL
https://your-app.vercel.app

# Test the API
curl https://your-app.vercel.app/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### 2. Configure Custom Domain (Optional)

**Via Vercel Dashboard:**
```
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records:
   - Type: A or CNAME
   - Name: @ or subdomain
   - Value: cname.vercel-dns.com
4. Wait for DNS propagation
```

**DNS Configuration:**
```
# For root domain (example.com)
Type: A
Name: @
Value: 76.76.21.21

# For subdomain (app.example.com)
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### 3. Update OAuth Redirect URLs

If using LinkedIn OAuth:
```
1. Go to LinkedIn Developer Console
2. Update redirect URL:
   https://your-app.vercel.app/api/auth/linkedin/callback
3. Update NEXT_PUBLIC_APP_URL environment variable
4. Redeploy
```

### 4. Configure CORS (if needed)

Add to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ];
  },
};
```

### 5. Set Up Monitoring

**Vercel Analytics:**
```
1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. Add to your app:
   npm install @vercel/analytics
```

**Error Tracking:**
```javascript
// Add to src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Clear cache and rebuild
vercel --force

# Or locally:
rm -rf .next node_modules
npm install
npm run build
```

**Error: "Environment variable not found"**
```bash
# Solution: Check environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME
```

### Runtime Errors

**Error: "OpenAI API key not configured"**
```
1. Verify OPENAI_API_KEY is set in Vercel
2. Redeploy: vercel --prod
3. Check logs: vercel logs
```

**Error: "Assistant not configured"**
```
1. Verify OPENAI_ASSISTANT_ID is set
2. Check assistant exists in OpenAI dashboard
3. Redeploy
```

### Performance Issues

**Slow API responses:**
```
1. Check OpenAI API status
2. Review function timeout settings (default: 60s)
3. Optimize context size
4. Consider caching strategies
```

**High memory usage:**
```
1. Review file processing limits
2. Optimize PDF parsing
3. Consider serverless function limits
```

### Viewing Logs

```bash
# View real-time logs
vercel logs --follow

# View logs for specific deployment
vercel logs [deployment-url]

# Filter by function
vercel logs --filter /api/chatbot
```

---

## Docker Deployment (Alternative)

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t askmyai .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_ASSISTANT_ID=asst_... \
  askmyai
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_ASSISTANT_ID=${OPENAI_ASSISTANT_ID}
      - NODE_ENV=production
    restart: unless-stopped
```

---

## Self-Hosted Deployment

### Requirements

- Node.js 20+
- npm or yarn
- Process manager (PM2 recommended)

### Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/askmyai.git
cd askmyai

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local
# Edit .env.local with your values

# 4. Build
npm run build

# 5. Install PM2
npm install -g pm2

# 6. Start with PM2
pm2 start npm --name "askmyai" -- start

# 7. Configure PM2 to start on boot
pm2 startup
pm2 save
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] API keys rotated regularly
- [ ] CORS configured appropriately
- [ ] Rate limiting implemented (if needed)
- [ ] OAuth redirect URLs whitelisted
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies updated regularly

---

## Performance Optimization

### Edge Functions

Consider using Vercel Edge Functions for faster response times:

```javascript
// src/middleware.ts
export const config = {
  runtime: 'edge',
};
```

### Caching

Implement caching for job descriptions:

```javascript
// In API routes
export const revalidate = 3600; // Cache for 1 hour
```

### Image Optimization

Use Next.js Image component:

```javascript
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={200} 
  height={200} 
  alt="Logo" 
/>
```

---

## Related Documentation

- [Development Guide](./development.md)
- [API Routes](./api-routes.md)
- [OpenAI Integration](./openai-integration.md)

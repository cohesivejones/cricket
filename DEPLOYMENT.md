# Deployment Guide - Cloudflare

This guide walks you through deploying the Cricket Scoreboard app to Cloudflare (Workers + Pages).

## Prerequisites

1. **Cloudflare Account**: Sign up at https://cloudflare.com (free tier is fine)
2. **Wrangler CLI**: Already installed in the project
3. **GitHub Account**: For Cloudflare Pages (or use direct upload)

## Step 1: Set Up Cloudflare Account

1. Sign up/login at https://dash.cloudflare.com
2. Note your **Account ID** from the dashboard

## Step 2: Authenticate Wrangler

```bash
cd backend
npx wrangler login
```

This will open a browser to authorize Wrangler with your Cloudflare account.

## Step 3: Create KV Namespace

```bash
cd backend

# Create production KV namespace
npx wrangler kv:namespace create "SESSIONS"
```

You'll get output like:
```
[[kv_namespaces]]
binding = "SESSIONS"
id = "abc123def456...m "
```

**Copy the `id` value!**

## Step 4: Update wrangler.toml

Edit `backend/wrangler.toml`:

```toml
name = "cricket-scoreboard-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_KV_NAMESPACE_ID_HERE"  # ← Paste the ID from Step 3

[build]
command = "npm run build"
```

## Step 5: Deploy Backend (Cloudflare Workers)

```bash
cd backend
npm run deploy
```

You'll see output like:
```
✨ Success! Uploaded cricket-scoreboard-api
🌎 https://cricket-scoreboard-api.YOUR-SUBDOMAIN.workers.dev
```

**Copy this URL!** You'll need it for the frontend.

**Test the backend:**
```bash
curl https://cricket-scoreboard-api.YOUR-SUBDOMAIN.workers.dev/api/session
# Should return 404 (expected - need to POST first)
```

## Step 6: Configure Frontend for Production

Edit `frontend/vite.config.js` and add the base URL:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  },
  // Add this for production
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(
      process.env.VITE_API_BASE || ''
    )
  }
})
```

Edit `frontend/src/utils/api.ts`:

```typescript
// Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_BASE || '/api'
```

## Step 7: Deploy Frontend - Option A (GitHub + Cloudflare Pages)

### 7a. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 7b. Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages" in the sidebar
3. Click "Create application" → "Pages" → "Connect to Git"
4. Select your GitHub repository
5. Configure build settings:

**Build Settings:**
- **Build command**: `cd frontend && npm install && npm run build`
- **Build output directory**: `frontend/dist`
- **Root directory**: `/` (leave as project root)

**Environment Variables:**
- Click "Add variable"
- Name: `VITE_API_BASE`
- Value: `https://cricket-scoreboard-api.YOUR-SUBDOMAIN.workers.dev`
  (Use the URL from Step 5)

6. Click "Save and Deploy"

### 7c. Wait for Deployment

Cloudflare will build and deploy your app. First deployment takes 2-5 minutes.

You'll get a URL like:
```
https://cricket-scoreboard-xyz.pages.dev
```

## Step 7: Deploy Frontend - Option B (Direct Upload)

If you don't want to use GitHub:

```bash
cd frontend

# Build the app
npm run build

# Set API URL as environment variable
export VITE_API_BASE=https://cricket-scoreboard-api.YOUR-SUBDOMAIN.workers.dev

# Rebuild with production API URL
npm run build

# Deploy directly
npx wrangler pages deploy dist --project-name cricket-scoreboard
```

## Step 8: Test Your Deployment

1. Visit your Cloudflare Pages URL
2. Click "New Game"
3. Add players and start playing
4. Copy the URL and open in a new tab/browser
5. Both tabs should sync in real-time!

## Verification Checklist

✅ Backend deployed and accessible
```bash
curl https://cricket-scoreboard-api.YOUR-SUBDOMAIN.workers.dev/api/session
# Should return JSON error (expected)
```

✅ Frontend deployed and loading
- Visit your Pages URL
- Should see landing page

✅ Frontend can connect to backend
- Create a game
- Check browser console (F12) for API errors
- Should see no CORS errors

✅ Multi-tab sync works
- Open game in 2 tabs
- Changes in one appear in the other (within 3 seconds)

✅ Refresh persistence works
- Play some darts
- Refresh page
- Game state should persist

## Troubleshooting

### CORS Errors

If you see CORS errors in console:

1. Check that `VITE_API_BASE` is set correctly in Cloudflare Pages env vars
2. Verify backend has CORS headers (already configured in `backend/src/index.ts`)
3. Redeploy backend: `cd backend && npm run deploy`

### "Failed to fetch" Errors

1. Verify backend URL is correct
2. Test backend directly with curl
3. Check KV namespace is bound correctly in wrangler.toml
4. Check browser console for actual error

### Games Not Persisting

1. Verify KV namespace is created and bound
2. Check wrangler.toml has correct KV namespace ID
3. Redeploy backend
4. Clear browser cache and try again

### Build Failures

If frontend build fails on Cloudflare Pages:

1. Check build command is: `cd frontend && npm install && npm run build`
2. Check output directory is: `frontend/dist`
3. Check that all dependencies are in package.json (not devDependencies for required runtime deps)

## Custom Domain (Optional)

### For Frontend (Pages)

1. In Cloudflare Pages dashboard
2. Go to "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (must be on Cloudflare DNS)
5. Follow prompts to add DNS records

### For Backend (Workers)

1. In Workers dashboard
2. Go to your worker → "Triggers"
3. Click "Add Custom Domain"
4. Enter subdomain (e.g., `api.yourdomain.com`)
5. Update frontend `VITE_API_BASE` to use new domain
6. Redeploy frontend

## Updating Your Deployment

### Backend Changes

```bash
cd backend
npm run deploy
```

### Frontend Changes

**If using GitHub:**
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Cloudflare auto-deploys from GitHub
```

**If using direct upload:**
```bash
cd frontend
npm run build
npx wrangler pages deploy dist
```

## Monitoring

### Check Logs

**Backend logs:**
```bash
cd backend
npx wrangler tail
```

**Frontend logs:**
- Browser console (F12)
- Cloudflare Pages dashboard → Analytics

### Analytics

- **Workers**: Dashboard → Workers & Pages → Analytics
- **Pages**: Dashboard → Workers & Pages → Your Project → Analytics

## Cost Estimate (Free Tier)

With Cloudflare Free Tier:
- **Workers**: 100,000 requests/day
- **KV**: 100,000 reads/day, 1,000 writes/day  
- **Pages**: Unlimited bandwidth

**Your Usage:**
- Each active user = ~28,800 API calls/day (3s polling)
- Supports 3+ concurrent users easily
- Hundreds of games stored

You'll stay well within free tier limits! 🎉

## Support

- Cloudflare Docs: https://developers.cloudflare.com
- Workers: https://developers.cloudflare.com/workers
- Pages: https://developers.cloudflare.com/pages
- KV: https://developers.cloudflare.com/kv

## Next Steps

1. ✅ Backend deployed
2. ✅ Frontend deployed  
3. ✅ Test multiplayer functionality
4. 🎮 Share with friends and play!

Enjoy your Cricket Darts Scoreboard! 🎯

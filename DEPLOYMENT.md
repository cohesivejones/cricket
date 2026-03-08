# Deployment Guide - Cloudflare

This guide walks you through deploying the Cricket Scoreboard app to Cloudflare Workers (backend) and Cloudflare Pages (frontend).

## Prerequisites

1. **Cloudflare Account**: Sign up at https://cloudflare.com (free tier is fine)
2. **GitHub Account**: Your code should be pushed to GitHub
3. **Wrangler CLI**: Already installed in the project

## Part 1: Deploy Backend (Cloudflare Workers)

### Step 1: Authenticate Wrangler

```bash
cd backend
npx wrangler login
```

This opens a browser to authorize Wrangler with your Cloudflare account.

### Step 2: Create KV Namespace

```bash
npx wrangler kv:namespace create "SESSIONS"
```

You'll get output like:
```
[[kv_namespaces]]
binding = "SESSIONS"
id = "3466eafd42b74cfbb092fce2a3e6f85a"
```

**Copy the `id` value!**

### Step 3: Update wrangler.toml

Edit `backend/wrangler.toml` and add your KV namespace ID:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_KV_NAMESPACE_ID_HERE"  # ← Paste the ID from Step 2
```

### Step 4: Register workers.dev Subdomain

```bash
npm run deploy
```

When prompted: `Would you like to register a workers.dev subdomain now?`
- Type `yes`
- Choose a subdomain name (e.g., `my-cricket-app`)

### Step 5: Backend Deployed! ✅

You'll see:
```
✨ Success! Uploaded cricket-scoreboard-api
🌎 https://cricket-scoreboard-api.MY-SUBDOMAIN.workers.dev
```

**Example:** `https://cricket-scoreboard-api.my-cricket-app.workers.dev`

**Test it:**
```bash
curl https://cricket-scoreboard-api.MY-SUBDOMAIN.workers.dev/api/session
# Should return: {"error":"Not found"}  ← This is correct!
```

## Part 2: Deploy Frontend (Cloudflare Pages)

### Step 6: Push Code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 7: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Click **"Workers & Pages"** in the sidebar
3. Click **"Create application"** → **"Pages"** tab → **"Connect to Git"**
4. Select your GitHub repository
5. Click **"Begin setup"**

### Step 8: Configure Build Settings

**Project name:** `cricket-scoreboard` (or any name)

**Production branch:** `main` (or `master`)

**Build settings:**
- **Framework preset**: None (or Vite if available)
- **Build command**: `cd frontend && npm install && npm run build`
- **Build output directory**: `frontend/dist` ← **Important!**

### Step 9: Add Environment Variable

Click **"Add variable"** and add:

- **Variable name**: `VITE_API_BASE`
- **Variable value**: `https://cricket-scoreboard-api.MY-SUBDOMAIN.workers.dev/api`

⚠️ **Important:** Include `/api` at the end! 

**Example:** `https://cricket-scoreboard-api.my-cricket-app.workers.dev/api`

### Step 10: Deploy

Click **"Save and Deploy"**

Deployment takes 2-5 minutes. You'll get a URL like:
```
https://cricket-scoreboard-ABC.pages.dev
```

## Part 3: Verify Deployment

### ✅ Checklist:

1. **Visit your Pages URL** (e.g., `https://cricket-scoreboard-ABC.pages.dev`)
2. **Add players** on the landing page
3. **Click "Create Game"**
4. **Check browser console** (F12) - should be no errors
5. **Play some darts** - game should work!
6. **Refresh page** - game state should persist
7. **Open in new tab** - should see same game
8. **Share URL** with friend - they should see same game

## Troubleshooting

### Error: POST .../api/session 404

**Symptom:** Console shows `POST https://...workers.dev//session 404`  
**Problem:** Missing `/api` in VITE_API_BASE or double slashes

**Fix:**
1. Go to Cloudflare Pages dashboard
2. Settings → Environment variables
3. Update `VITE_API_BASE` to include `/api`:
   ```
   https://cricket-scoreboard-api.MY-SUBDOMAIN.workers.dev/api
   ```
4. Deployments → Retry deployment

### Error: CORS

**Symptom:** CORS policy errors in console

**Fix:**
1. Verify `VITE_API_BASE` is set correctly
2. Redeploy backend: `cd backend && npm run deploy`
3. Clear browser cache and retry

### Games Not Persisting

**Fix:**
1. Verify KV namespace is bound in `wrangler.toml`
2. Redeploy backend
3. Clear browser cache

### Build Output Directory Error

**Symptom:** `Output directory "dist" not found`

**Fix:**
1. Cloudflare Pages Settings → Builds & deployments
2. Change **Build output directory** to: `frontend/dist`
3. Save and retry deployment

## Updating Your Deployment

### Update Backend

```bash
cd backend
npm run deploy
```

### Update Frontend

Just push to GitHub - Cloudflare auto-deploys:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

## Custom Domain (Optional)

### For Backend (Workers)

1. Workers dashboard → Your worker → Triggers
2. Click "Add Custom Domain"
3. Enter subdomain (e.g., `cricket.yourdomain.com`)
4. Update `VITE_API_BASE` in Pages env vars to new domain
5. Redeploy frontend

### For Frontend (Pages)

1. Pages dashboard → Custom domains
2. Click "Set up a custom domain"
3. Enter domain (must be on Cloudflare DNS)
4. Follow DNS setup prompts

## Monitoring

**Backend logs:**
```bash
cd backend
npx wrangler tail
```

**Frontend logs:**
- Browser console (F12)
- Cloudflare Pages dashboard → Analytics

## Cost (Free Tier)

Cloudflare Free Tier limits:
- **Workers**: 100,000 requests/day
- **KV**: 100,000 reads/day, 1,000 writes/day
- **Pages**: Unlimited bandwidth

Your usage:
- Each user = ~28,800 API calls/day (3s polling)
- Supports **3+ concurrent users** easily
- Hundreds of games stored

**You'll stay within free tier!** 🎉

## Example Configuration

**Your Actual URLs:**
- Backend: `https://cricket-scoreboard-api.my-cricket-app.workers.dev`
- Frontend: `https://cricket-57v.pages.dev`
- VITE_API_BASE: `https://cricket-scoreboard-api.my-cricket-app.workers.dev/api`

## Next Steps

1. ✅ Backend deployed
2. ✅ Frontend deployed
3. ✅ Test the game
4. 🎮 Share with friends!

Enjoy your Cricket Darts Scoreboard! 🎯

# Vercel Deployment Guide (Frontend Only)

> **Important**: The backend (FastAPI + SSE) **cannot** run on Vercel due to:
> - 10s/60s function timeout (simulations run longer)
> - No persistent WebSocket/SSE support in serverless
> - In-memory simulation state doesn't work across invocations

**Deploy backend separately** to Render, Railway, or Fly.io, then point Vercel frontend to it.

---

## Quick Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. **Push to GitHub** (already done on branch `vasista`)

2. **Import in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `Vasista-surya/Crypto_birthday_attack`
   - **Root Directory**: `frontend` ⚠️ Critical!
   - Framework Preset: `Vite` (auto-detected)

3. **Configure Environment Variables**:
   ```
   VITE_API_BASE = https://your-backend-domain.com/api
   ```
   Replace with your actual backend URL (see Backend Deployment below).

4. **Deploy** → Vercel builds and deploys automatically.

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: birthday-attack-lab
# - Directory: ./
# - Override settings? No
```

---

## Backend Deployment (Required)

### Render (Easiest for FastAPI + SSE)

1. **Create Render Account** → New Web Service
2. **Connect GitHub** → Select `Vasista-surya/Crypto_birthday_attack`
3. **Settings**:
   ```
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. **Environment Variables**:
   ```
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   ```
5. **Deploy** → Get URL like `https://birthday-attack-lab-api.onrender.com`

### Railway

```bash
# Install CLI
npm i -g @railway/cli
railway login

# In backend directory
cd backend
railway init
railway add --environment CORS_ORIGINS=https://your-vercel-app.vercel.app
railway up
```

### Fly.io

```bash
# In backend directory
cd backend
fly launch
# Select region, yes to PostgreSQL (optional), deploy
fly deploy
```

---

## Connect Frontend to Backend

1. **Get backend URL** (e.g., `https://birthday-attack-lab-api.onrender.com`)

2. **Update Vercel Environment Variable**:
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - `VITE_API_BASE` = `https://birthday-attack-lab-api.onrender.com/api`
   - **Redeploy** (trigger new deployment)

3. **Verify**:
   - Open Vercel URL
   - Check browser console for API calls
   - Test: Module 2 (Simulation) → Start 8-bit search

---

## Vercel-Specific Configuration

### `frontend/vercel.json` (Already Created)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-domain.com/api/$1"
    }
  ]
}
```

**Note**: The `rewrites` only works for same-origin proxying. For cross-origin (Vercel → Render), set `VITE_API_BASE` directly in the frontend code. The rewrite is a fallback.

### Update API Client for Production

The API client already uses `import.meta.env.VITE_API_BASE`:

```typescript
// frontend/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
```

---

## Custom Domain (Optional)

1. **Vercel Dashboard** → Project → Settings → Domains
2. **Add** `birthday-lab.yourdomain.com`
3. **Configure DNS** (CNAME to `cname.vercel-dns.com`)
4. **Update CORS** in backend:
   ```
   CORS_ORIGINS=https://birthday-lab.yourdomain.com
   ```
5. **Redeploy backend** and **frontend**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `VITE_API_BASE` not working | Must be set in Vercel Dashboard, not `.env`; redeploy after change |
| CORS errors | Backend `CORS_ORIGINS` must match Vercel URL exactly (including `https://`) |
| SSE fails on Render | Render free tier spins down after 15min inactivity; upgrade or use Railway |
| Build fails | Ensure Node 20+ in Vercel settings; check `package.json` engines |
| API calls to `/api` fail | Set `VITE_API_BASE` to full backend URL, not relative |

---

## Cost Estimate

| Service | Tier | Cost |
|---------|------|------|
| **Vercel (Frontend)** | Hobby | Free |
| **Render (Backend)** | Free | Free (spins down) |
| **Railway (Backend)** | Hobby | $5/mo |
| **Fly.io (Backend)** | Shared | ~$5/mo |

**Recommended**: Vercel (free) + Railway ($5/mo) for always-on backend with SSE support.

---

## Vercel Deployment Checklist

- [ ] Frontend builds locally (`cd frontend && npm run build`)
- [ ] Backend deployed and accessible (test `/api/health`)
- [ ] `VITE_API_BASE` set in Vercel env vars
- [ ] Backend `CORS_ORIGINS` includes Vercel URL
- [ ] Frontend deployed to Vercel
- [ ] Simulation works end-to-end (8-bit test)
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS working on both
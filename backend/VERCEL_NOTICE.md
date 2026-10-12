# Backend Deployment Notes

## ⚠️ Vercel Not Recommended for Backend

This FastAPI backend uses:
- **Server-Sent Events (SSE)** for real-time simulation streaming
- **In-memory simulation state** (SimulationManager)
- **Long-running simulations** (can take seconds to minutes)

Vercel's serverless functions have:
- ❌ 10s/60s max execution timeout (simulations run longer)
- ❌ No persistent WebSocket/SSE support
- ❌ No in-memory state across invocations
- ❌ Cold starts break SSE connections

## Recommended Backend Platforms

| Platform | SSE Support | Cost | Setup |
|----------|-------------|------|-------|
| **Railway** | ✅ Native | $5/mo | `railway up` |
| **Render** | ✅ Native | Free* | Web Service |
| **Fly.io** | ✅ Native | ~$5/mo | `fly deploy` |

*Render free tier spins down after 15min inactivity

## Quick Deploy Commands

### Railway (Recommended)
```bash
npm i -g @railway/cli
railway login
railway init
railway add --environment CORS_ORIGINS=https://your-frontend.vercel.app
railway up
```

### Render
1. Connect GitHub → New Web Service
2. Root: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Env: `CORS_ORIGINS=https://your-frontend.vercel.app`

### Fly.io
```bash
fly launch
fly deploy
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CORS_ORIGINS` | Yes | Comma-separated frontend URLs |
| `API_HOST` | No | Default: 0.0.0.0 |
| `API_PORT` | No | Default: 8000 (use `$PORT` on platforms) |

## Health Check

```bash
curl https://your-backend.railway.app/api/health
# {"status":"ok","service":"Birthday Attack Lab API","version":"1.0.0"}
```
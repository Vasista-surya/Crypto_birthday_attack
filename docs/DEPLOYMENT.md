# Deployment Guide

This guide covers deploying the Birthday Attack Lab to various platforms.

## 🚀 Vercel (Frontend) + Render/Railway (Backend) — Recommended

**Fastest path to production**: Frontend on Vercel (free), Backend on Railway ($5/mo) or Render (free tier).

> ⚠️ **Backend cannot run on Vercel** — FastAPI + SSE requires long-lived connections and in-memory state. Deploy backend separately.

### Quick Vercel Deploy

1. **Backend First** → Deploy to [Railway](#railway-backend) or [Render](#render-backend)
2. **Frontend to Vercel** → See [docs/VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

```bash
# 1. Backend (Railway example)
cd backend
railway login && railway init && railway up

# 2. Frontend
cd frontend
vercel --prod
# Set VITE_API_BASE=https://your-backend.railway.app/api in Vercel dashboard
```

See [docs/VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for step-by-step.

---

## Quick Start (Local Development)

```bash
# Clone and navigate
git clone https://github.com/Vasista-surya/Crypto_birthday_attack
cd Crypto_birthday_attack

# Start all services
docker-compose up -d

# Access:
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

## Production Deployment Options

### Option 1: Single Server (Docker Compose)

**Prerequisites**: Linux server with Docker & Docker Compose installed

```bash
# 1. Clone repository
git clone https://github.com/Vasista-surya/Crypto_birthday_attack
cd Crypto_birthday_attack

# 2. Configure environment
cp .env.example .env
# Edit .env with your production domains

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Set up reverse proxy (nginx/Traefik) for SSL termination
# See "SSL/TLS Setup" below
```

### Option 2: Separate Frontend/Backend Deployments

#### Backend (FastAPI) - Deploy to Render/Railway/Fly.io

**Render:**
1. Connect GitHub repo to Render
2. Create "Web Service" 
3. Build Command: `pip install -r backend/requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `CORS_ORIGINS=https://your-frontend-domain.com`

**Railway:**
1. `railway login && railway init`
2. `railway add` → Select GitHub repo
3. Set root directory to `backend`
4. Environment: `CORS_ORIGINS=https://your-frontend-domain.com`

**Fly.io:**
1. `fly launch` in backend directory
2. `fly deploy`

#### Frontend (React/Vite) - Deploy to Vercel/Netlify

**Vercel:**
1. Import GitHub repo in Vercel
2. Set Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_BASE=https://your-backend-domain.com/api`

**Netlify:**
1. Connect repo, set base directory to `frontend`
2. Build command: `npm run build`
3. Publish directory: `dist`
3. Add redirect rule for SPA (`/* /index.html 200`)
4. Environment: `VITE_API_BASE=https://your-backend-domain.com/api`

### Option 3: Kubernetes (Advanced)

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: birthday-lab-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: birthday-lab-backend
  template:
    metadata:
      labels:
        app: birthday-lab-backend
    spec:
      containers:
      - name: backend
        image: your-registry/birthday-lab-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: CORS_ORIGINS
          value: "https://your-frontend-domain.com"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: birthday-lab-backend
spec:
  selector:
    app: birthday-lab-backend
  ports:
  - port: 8000
    targetPort: 8000
```

## SSL/TLS Setup

### Using Let's Encrypt with nginx (Single Server)

```nginx
# /etc/nginx/sites-available/birthday-lab
server {
    listen 80;
    server_name your-domain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

```bash
# Get certificates
sudo certbot certonly --webroot -w /var/www/certbot -d your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Using Platform-Managed SSL (Vercel/Netlify/Render)

These platforms automatically provision SSL certificates. Just add your custom domain in their dashboard.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `CORS_ORIGINS` | Comma-separated list of allowed origins | Yes (prod) |
| `VITE_API_BASE` | Frontend API base URL | Yes |
| `API_HOST` | Backend bind address | No (default: 0.0.0.0) |
| `API_PORT` | Backend port | No (default: 8000) |

## Health Checks

- Backend: `GET /api/health` → `{"status": "ok", "service": "Birthday Attack Lab API"}`
- Frontend: `GET /` → Returns index.html (200 OK)

## Monitoring & Logging

### Recommended Stack
- **Logs**: Loki + Grafana or Datadog
- **Metrics**: Prometheus + Grafana
- **Uptime**: UptimeRobot / Pingdom

### Key Metrics to Monitor
- API response times (p50, p95, p99)
- SSE connection count
- Simulation success/failure rates
- Memory usage (especially for >24 bit simulations)

## Scaling Considerations

1. **Backend**: Stateless - scale horizontally behind load balancer
2. **SSE Connections**: Each simulation holds a connection; plan capacity
3. **Memory**: 32-bit simulation needs ~65K entries; 24-bit needs ~4K
4. **Rate Limiting**: Implement per-IP limits on `/api/simulations`

## Backup & Recovery

- No persistent data (stateless design)
- Configuration in Git + environment variables
- Container images in registry for rollback

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSE disconnects | Increase proxy read timeout (`proxy_read_timeout 86400`) |
| CORS errors | Check `CORS_ORIGINS` matches frontend URL exactly |
| Build fails | Ensure Node 20+ and Python 3.11+ |
| Memory OOM | Lower max bits or increase container memory limit |

## Security Checklist

- [ ] HTTPS enforced everywhere
- [ ] CORS restricted to known domains
- [ ] Rate limiting on simulation endpoints
- [ ] Max bits capped at 32 (enforced in code)
- [ ] No secrets in repository
- [ ] Regular dependency updates (`npm audit`, `pip-audit`)

## Verification Checklist (Post-Deploy)

- [ ] Frontend loads at https://your-domain.com
- [ ] API docs accessible at https://your-domain.com/api/docs
- [ ] Health check returns 200: https://your-domain.com/api/health
- [ ] Simulation starts and streams progress (8-bit test)
- [ ] Collision found shows "Full SHA-256 digests are different" banner
- [ ] Compare page works with two messages
- [ ] Theory charts render correctly
- [ ] Real World cases display with callouts
- [ ] Knowledge check quiz functions
- [ ] Dark/light theme toggle works
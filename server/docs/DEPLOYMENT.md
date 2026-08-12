# Deployment Guide

## Platform Requirements

- Node.js 18+ (tested on 24)
- Supabase project (PostgreSQL)
- Africa's Talking account (for production SMS)
- HTTPS termination (required for JWT cookies / secure headers)

---

## Render (Recommended)

### 1. Create a Web Service

- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Root Directory**: `server` (if repo has multiple folders) or repo root

### 2. Environment Variables

Add all variables from [ENVIRONMENT.md](ENVIRONMENT.md) in the Render dashboard.

Critical production vars:
```
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...          # generate with: openssl rand -hex 32
AFRICASTALKING_USERNAME=...
AFRICASTALKING_API_KEY=...
AFRICASTALKING_SENDER_ID=...
FLUTTERWAVE_...         # if using payments
CORS_ORIGINS=https://your-frontend.example.com
```

### 3. Health Check

Render uses `/api/health` automatically. No extra config needed.

### 4. Custom Domain (Optional)

Add your domain in Render → Settings → Custom Domains. Update `CORS_ORIGINS` and `FLUTTERWAVE_CALLBACK_URL` accordingly.

---

## Fly.io

### 1. `fly.toml`

```toml
app = "kora-server"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "5001"

[http_service]
  internal_port = 5001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

### 2. Dockerfile (repo root)

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server ./server
EXPOSE 5001
CMD ["node", "server/index.js"]
```

### 3. Secrets

```bash
fly secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... JWT_SECRET=... AFRICASTALKING_USERNAME=... AFRICASTALKING_API_KEY=... AFRICASTALKING_SENDER_ID=...
```

### 4. Deploy

```bash
fly deploy
```

---

## Railway

1. Connect GitHub repo
2. Set root directory to `server`
3. Add all env vars in Variables tab
4. Railway auto-detects `npm start`

---

## Docker (Generic)

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server ./server
ENV NODE_ENV=production PORT=5001
EXPOSE 5001
CMD ["node", "server/index.js"]
```

Build & run:
```bash
docker build -t kora-server .
docker run -p 5001:5001 --env-file .env kora-server
```

---

## Database Migration

Run the SQL in `server/migrations/001_initial_schema.sql` against your Supabase project **before** first deploy:

1. Open Supabase Dashboard → SQL Editor
2. Paste the migration contents
3. Click "Run"

Or via CLI:
```bash
psql "postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres" -f server/migrations/001_initial_schema.sql
```

---

## Frontend (Vercel) Integration

The frontend proxies `/api/*` to the backend via `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend.example.com/api/:path*" }
  ]
}
```

Ensure the backend `CORS_ORIGINS` includes your Vercel domain.

---

## Health & Monitoring

- **Health**: `GET /api/health` → `{ "ok": true, "paymentMode": "..." }`
- **Logs**: Structured JSON lines (stdout). Works with Render/Fly/GCP log viewers.
- **Metrics**: Add a `/metrics` endpoint if needed (Prometheus).

---

## Graceful Shutdown

The server handles `SIGTERM` / `SIGINT`:

```js
// index.js
server.close(() => process.exit(0));
setTimeout(() => process.exit(1), 10000).unref();
```

Render/Fly send `SIGTERM` on deploy/restart — in-flight requests finish within 10s.

---

## Rollback

All platforms support instant rollback to the previous deployment. Database migrations are additive (no destructive changes in 001), so rollback is safe.

---

## Checklist Before Go-Live

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is 32+ random chars
- [ ] Supabase service role key set
- [ ] Africa's Talking production credentials (not sandbox)
- [ ] Sender ID registered in AT dashboard
- [ ] `CORS_ORIGINS` includes frontend domain
- [ ] `FLUTTERWAVE_CALLBACK_URL` correct
- [ ] Migration 001 applied
- [ ] Health endpoint returns 200
- [ ] Test OTP send/verify in production
- [ ] Logs show structured JSON
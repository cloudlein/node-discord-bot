# Deployment & Infrastructure Guide

This guide covers preparing, containerizing, running, and monitoring the Game Community Bot platform in production environments.

---

## Production Checklist

- [ ] Set `NODE_ENV=production`.
- [ ] Configure all mandatory variables in `.env` (Discord tokens, Supabase service keys, API secrets).
- [ ] Execute all Supabase database migrations (`001_create_games.sql` through `012_create_retry_jobs.sql`).
- [ ] Deploy Discord application slash commands (`npm run deploy-commands`).
- [ ] Compile TypeScript into JavaScript bundle (`npm run build`).
- [ ] Initialize process manager (PM2 or systemd) for high-availability restarts.
- [ ] Place the Express REST API behind a reverse proxy (e.g., Nginx, Cloudflare, Caddy) with HTTPS enabled.
- [ ] Enable log aggregation and uptime monitoring for `/api/v1/health`.

---

## Container Deployment (Docker)

Use the multi-stage `Dockerfile` below for minimal image footprint and hardened runtime security:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
USER node
CMD ["node", "dist/index.js"]
```

Build and execute container:
```bash
docker build -t game-community-bot:latest .
docker run -d --name game-bot --env-file .env -p 3000:3000 game-community-bot:latest
```

---

## Process Management (PM2)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'game-community-bot',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '512M',
    error_file: 'logs/error.log',
    out_file: 'logs/output.log',
  }]
};
```

Run with PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## Hosting Recommendations

| Provider | Platform Tier | Supabase Database | Cost / Tier |
|---|---|---|---|
| Railway | Bot + API container | Supabase Managed | ~$5 / month |
| Fly.io | Bot + API container | Supabase Managed | ~$3 / month |
| VPS (Hetzner / DigitalOcean) | Full Docker Compose | Supabase Managed | ~$4 - $6 / month |
| AWS EC2 (t3.micro) | Linux systemd | Supabase Managed | Free tier eligible |

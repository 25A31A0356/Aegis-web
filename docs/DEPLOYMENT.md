# AEGIS Deployment & Infrastructure Specification

This document details the deployment architecture, containerization configuration, continuous integration pipelines, and environment management for the AEGIS ecosystem.

## 1. Production Deployment Topology

```mermaid
graph TD
    ClientTraffic[Citizen Mobile App & Web Command Center Traffic] --> Cloudflare[Cloudflare Edge DNS / CDN / DDoS Shield]
    Cloudflare --> NginxLB[Nginx Reverse Proxy & SSL Termination]
    
    subgraph Container_Cluster [Docker Engine / Kubernetes Node]
        NginxLB --> FastAPIServer1[FastAPI Server Replica 1 :8000]
        NginxLB --> FastAPIServer2[FastAPI Server Replica 2 :8000]
        FastAPIServer1 --> RedisCache[Redis 7.0 Cache & Pub/Sub :6379]
        FastAPIServer2 --> RedisCache
        FastAPIServer1 --> PostgresDB[(PostgreSQL 15 + PostGIS :5432)]
        FastAPIServer2 --> PostgresDB
    end

    subgraph Synoptic_Worker [Background Processing Daemon]
        CronJob[Celery / Asyncio Synoptic Task] --> ExternalWeather[IMD / JTWC / NASA Feeds]
        ExternalWeather --> CronJob
        CronJob --> PostgresDB
        CronJob --> RedisCache
    end
```

---

## 2. Containerized Service Composition (`docker-compose.yml`)

The platform is fully orchestrated via Docker Compose for uniform staging and production environments:

| Service | Image Base | Port Mapping | Storage Volume | Environment Configuration |
|---|---|---|---|---|
| `aegis-backend` | `python:3.11-slim` | `8000:8000` | `./server:/app` | `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` |
| `aegis-web` | `node:20-alpine` (Nginx prod) | `80:80` | `./web/dist:/usr/share/nginx/html` | `VITE_API_URL`, `VITE_WS_URL` |
| `aegis-postgres` | `postgis/postgis:15-3.3-alpine` | `5432:5432` | `pgdata:/var/lib/postgresql/data` | `POSTGRES_DB=aegis_db` |
| `aegis-redis` | `redis:7.0-alpine` | `6379:6379` | `redisdata:/data` | `REDIS_PASSWORD` |

---

## 3. Environment Configuration & Secret Management

All sensitive parameters are defined in `.env` files (never committed to source control):

```bash
# Backend Environment Configuration (.env)
AEGIS_ENV=production
AEGIS_DEBUG=False
AEGIS_PORT=8000
AEGIS_HOST=0.0.0.0

# Database & Cache
DATABASE_URL=postgresql+asyncpg://aegis_admin:${POSTGRES_PASSWORD}@postgres:5432/aegis_db
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

# Security & JWT
AEGIS_JWT_SECRET_KEY=${SECURE_RANDOM_SECRET_KEY}
AEGIS_JWT_ALGORITHM=HS256
AEGIS_ACCESS_TOKEN_EXPIRE_MINUTES=15
AEGIS_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Policy
AEGIS_CORS_ORIGINS=https://aegis.gov.in,https://admin.aegis.gov.in
```

---

## 4. Continuous Integration & Build Pipeline

1. **Linting & Code Quality**:
   - Web: `npm run lint` with strict TypeScript compiler checks (`tsc --noEmit`).
   - Backend: `flake8`, `black`, `mypy --strict`.
2. **Automated Testing Gate**:
   - `pytest` suite for API integration and emergency state machine.
   - `vitest` suite for web component and state management testing.
3. **Container Build & Registry Push**:
   - Docker multi-stage builds optimize production images down to < 120MB.

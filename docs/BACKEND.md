# AEGIS ALERT — Backend Service & Engine Architecture

## 1. Technical Stack

- **Runtime**: Python 3.11+
- **Web Framework**: FastAPI 0.115 (Asynchronous ASGI)
- **Data Validation & Serialization**: Pydantic v2
- **Database Layer**: SQLAlchemy 2.0 ORM + Alembic (Migrations)
- **Local DB**: SQLite (egis_local.db with WAL mode)
- **Production DB**: PostgreSQL 16 with PostGIS spatial extension
- **Task Scheduling**: APScheduler for ingestion jobs & 2-hour synoptic cycles
- **Security**: Passlib (bcrypt), PyJWT (HS256 tokens), SSRF Protection middleware

---

## 2. Request Lifecycle & Middleware Pipeline

`mermaid
flowchart TD
    Req[Incoming HTTP / WebSocket Request] --> CORS[CORS Middleware]
    CORS --> SSRF[SSRF & Security Header Validator]
    SSRF --> Auth[Authentication & JWT Dependency]
    Auth --> Router[APIRouter Dispatch /api/v1/*]
    Router --> Validation[Pydantic Schema Validation]
    Validation --> Service[Business Service Layer]
    Service --> DB[(Database Session / SQLAlchemy)]
    Service --> Cache[(Redis Cache Engine)]
    DB --> Resp[JSON Response / Stream]
    Resp --> Client[Client Application]
`

---

## 3. Core Engine Implementations

### 1. 2-Hour Synoptic Meteorological Engine (synopticEngine.ts & Backend Ingestion)
- Aligns observations with WMO standard 2-hour intervals (-18h, -12h, -6h, NOW, +6h, +12h, LANDFALL).
- Invalidation countdown automatically synchronizes state without full page refreshes.

### 2. Cyclone Spline & Gale Radii Interpolator (cycloneService.ts)
- Implements continuous Catmull-Rom spline interpolation through active eye centers.
- Generates forecast cone polygons and gale radius circles (210 km gale, 90 km eye core).

### 3. SOS Triage & Proximity Engine (sosService.ts & ackend/app/api/v1/sos.py)
- Calculates geodesic distances using the Haversine formula.
- Prioritizes victims by battery depletion rate and occupant count.

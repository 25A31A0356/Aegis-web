# AEGIS ALERT — System Architecture & Engineering Blueprint

## 1. System Context & Overview

AEGIS Alert is an Autonomous Emergency Geospatial Intelligence and Multi-Hazard Early Warning Platform designed for the Indian subcontinent. The system ingests high-frequency meteorological observations, satellite imagery, Doppler radar data, and citizen distress beacons to deliver real-time risk intelligence, automated SOS triage, and life-saving standard operating procedures.

`mermaid
flowchart TD
    subgraph Users [Users & Field Operators]
        Citizen[Citizen / Public User]
        Victim[Victim in Distress]
        Responder[NDRF / SDRF First Responder]
        Authority[SEOC / DEOC Administrator]
    end

    subgraph ClientLayer [Client Applications]
        MobileApp[AEGIS Mobile App - React Native / Expo]
        WebDashboard[AEGIS Web GIS Dashboard - React 19 / Leaflet]
    end

    subgraph APILayer [API Gateway & Ingestion Layer]
        FastAPI[FastAPI Gateway - Port 8000]
        WS[WebSocket Real-Time Dispatch /ws]
        TRPC[tRPC Compatibility Layer]
    end

    subgraph CoreEngine [Core Intelligence & Business Logic]
        SynopticEngine[2-Hour Synoptic Met Engine]
        CycloneTracker[IMD Cyclone Spline & Gale Radii Engine]
        SOSTriage[SOS Triage & Haversine Distance Engine]
        AIDisasterSentinel[Context-Aware Disaster AI Sentinel]
        HazardCorrelation[Multi-Hazard Correlation Engine]
    end

    subgraph DataStorage [Persistence & Cache]
        Postgres[(PostgreSQL 16 + PostGIS / SQLite)]
        RedisCache[(Redis Cache & Pub/Sub)]
    end

    subgraph ExternalFeeds [Authoritative Meteorological & Hazard Feeds]
        IMD[IMD RSMC Cyclone & Doppler Radar]
        ISRO[ISRO MOSDAC Satellite Rasters]
        NOAA[NOAA CPC Temperature Departure Grids]
        NDMA[NDMA SACHET Disaster Feeds]
        CWC[CWC River Basin Flood Feeds]
    end

    Citizen --> MobileApp
    Victim --> MobileApp
    Responder --> MobileApp
    Authority --> WebDashboard

    MobileApp -->|HTTP/REST & tRPC| FastAPI
    MobileApp -->|Live Telemetry| WS
    WebDashboard -->|REST API| FastAPI
    WebDashboard -->|Event Stream| WS

    FastAPI --> TRPC
    FastAPI --> SynopticEngine
    FastAPI --> CycloneTracker
    FastAPI --> SOSTriage
    FastAPI --> AIDisasterSentinel
    FastAPI --> HazardCorrelation

    SynopticEngine --> Postgres
    CycloneTracker --> Postgres
    SOSTriage --> Postgres
    HazardCorrelation --> Postgres
    FastAPI --> RedisCache

    ExternalFeeds --> SynopticEngine
    ExternalFeeds --> HazardCorrelation
`

---

## 2. Component Inventory

| Component | Responsibility | Technical Stack | Communication | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Client** | Edge telemetry collection, offline SOS queueing, multilingual UI, safe check-in | React Native, Expo 52, TypeScript, NativeWind | REST, WebSocket, tRPC | IMPLEMENTED |
| **Web Command Center** | Multi-layer GIS exploration, 7 research maps, SOS triage console, NDMA safety hub | React 19, Vite, Leaflet, Tailwind CSS v4 | REST, WebSocket | IMPLEMENTED |
| **Backend Gateway** | Central API routing, data normalization, RBAC authorization, telemetry persistence | FastAPI 0.115, Python 3.11, Pydantic v2 | HTTP, WSS | IMPLEMENTED |
| **Synoptic Engine** | 2-hour observation cycle cadence synchronization, cache invalidation timer | Python / TypeScript Client Engine | In-Memory / Polling | IMPLEMENTED |
| **Cyclone Engine** | Eye coordinate interpolation, gale radius computation, forecast cone polygon builder | TypeScript / Python Math Spline | In-Memory Calculation | IMPLEMENTED |
| **SOS Triage Engine** | Geodesic Haversine proximity calculation, battery/signal priority weighting | FastAPI / SQLAlchemy | Asynchronous Task | IMPLEMENTED |
| **Disaster AI Sentinel** | Context-aware threat scoring (0-100), natural language safety recommendations | FastAPI Rule Engine + Gemini API Adapter | REST | IMPLEMENTED |
| **Database Tier** | Relational entity persistence, geo-coordinates, incident audit logs | PostgreSQL 16 + PostGIS (Production) / SQLite (Local) | SQLAlchemy ORM | IMPLEMENTED |

---

## 3. End-to-End Data Flow

`mermaid
sequenceDiagram
    autonumber
    participant Sensor as Meteorological Sensors & Satellites
    participant Ingestion as Ingestion Adapters (IMD/MOSDAC/NOAA)
    participant Engine as Synoptic & Correlation Engine
    participant DB as Relational Database
    participant Gateway as FastAPI Service
    participant Client as Web / Mobile Applications

    Sensor->>Ingestion: Raw Satellite Rasters, Radar dBZ, Cyclone Bulletins
    Ingestion->>Engine: Normalized JSON & Spatial Coordinates
    Engine->>Engine: Run 2-Hour Synoptic Harmonization & Threat Matrix
    Engine->>DB: Upsert Hazards, Contours & Telemetry Records
    Client->>Gateway: GET /api/v1/weather & /api/v1/cyclones
    Gateway->>DB: Query Active Hazard Corridors
    DB-->>Gateway: Entity Records
    Gateway-->>Client: JSON Response with Geospatial GeoJSON
    Client->>Client: Render Leaflet Vector Overlays & Telemetry Cards
`

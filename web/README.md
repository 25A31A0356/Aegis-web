# AEGIS Web — Autonomous Emergency Geospatial Intelligence Dashboard

[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**AEGIS Web** is the flagship web application for the AEGIS Alert disaster intelligence and multi-hazard response ecosystem. It provides an intuitive, high-performance geospatial command center featuring 7 specialized meteorological research maps, real-time Cyclone ARNAB telemetry, dedicated SOS distress beacon dispatch, and NDMA SACHET verified safety SOPs.

---

## 📑 Table of Contents

1. [Architectural Overview & Flow](#-architectural-overview--flow)
2. [Technical Approach & Engine Design](#-technical-approach--engine-design)
3. [Geospatial Architecture & 7 Simple Maps](#-geospatial-architecture--7-simple-maps)
4. [Dedicated SOS Maps & Rescue Triage Console](#-dedicated-sos-maps--rescue-triage-console)
5. [NDMA SACHET Disaster Safety Hub](#-ndma-sachet-disaster-safety-hub)
6. [Core Capabilities & Operational Use Cases](#-core-capabilities--operational-use-cases)
7. [Scientific Grounding & Institutional References](#-scientific-grounding--institutional-references)
8. [Local Development & Build](#-local-development--build)

---

## 🔄 Architectural Overview & Flow

AEGIS Web connects high-frequency meteorological feeds, satellite raster layers, and real-time citizen distress signals into an interactive React 19 GIS interface:

`mermaid
flowchart TD
    subgraph Data Layer [Telemetry Ingestion & Meteorological Feeds]
        IMD[IMD RSMC Cyclone Track & RSMC Bulletins]
        DWR[IMD Doppler Weather Radar Reflectivity dBZ]
        ISRO[ISRO MOSDAC / NASA GIBS Satellite Rasters]
        NOAA[NOAA CPC Temperature Departure Grids]
        CITIZEN[Citizen SOS Beacons & Battery Telemetry]
    end

    subgraph Service & Engine Layer [Client-Side State & Synoptic Synchronization]
        SYNOPTIC[2-Hour Synoptic Engine]
        CYCLONE[Cyclone Interpolation & Spline Generator]
        THERMAL[Continuous Temperature Contour Builder]
        SOS_SVC[SOS Triage & Haversine Distance Engine]
    end

    subgraph Web GIS UI [React 19 Interactive Geospatial Dashboard]
        RESEARCH[Research Maps: 7 Clean Meteorological Layers]
        SOS_MAPS[Dedicated SOS Maps: Victim Radar Beacons & Speed Dial]
        SAFETY_HUB[NDMA SACHET Safety Hub: 7 Hazard Action Cards]
        PROFILE_MODAL[Victim Profile & Dispatch Modal]
    end

    IMD --> CYCLONE
    DWR --> RESEARCH
    ISRO --> RESEARCH
    NOAA --> THERMAL
    CITIZEN --> SOS_SVC

    CYCLONE --> SYNOPTIC
    THERMAL --> SYNOPTIC
    SYNOPTIC --> RESEARCH

    SOS_SVC --> SOS_MAPS
    SOS_MAPS --> PROFILE_MODAL
`

---

## 🛠️ Technical Approach & Engine Design

### 1. 2-Hour Synoptic Meteorological Engine
- Synchronizes tropical storm, wind vector fields, and atmospheric pressure conditions on standard **World Meteorological Organization (WMO)** 2-hour synoptic intervals (-18h, -12h, -6h, NOW, +6h, +12h, LANDFALL).
- Automatic countdown timer triggers real-time data cache invalidation and client-side map layer re-rendering without page refreshes.

### 2. High-Precision Geo-Spatial Interpolation
- **Cyclone Tracking Spline**: Real-time eye coordinates, sustained wind speeds, central pressure, gale radius circles, and the **Cone of Uncertainty polygon** are interpolated smoothly through cyclone.center to maintain 100% physical continuity.
- **Continuous Temperature Anomaly Contours**: Closed coordinate polygons across all meteorological subdivisions of India (NOAA CPC / IMD NCC format) visualize real-time surface temperature departures (from severe heatwaves >+5°C to convective cloud cooling <-3°C).

### 3. Isolated Rescue Triage Architecture
- SOS distress beacons are strictly segregated into **SOS Maps** to eliminate cognitive overload and map clutter during time-critical emergency operations.

---

## 🗺️ Geospatial Architecture & 7 Simple Maps

AEGIS Web features 7 dedicated, clearly named meteorological research layers:

1. **cyclone maps**: Real-time tracking of active cyclonic systems (**Very Severe Cyclonic Storm ARNAB** in Bay of Bengal) with cone of uncertainty, gale radii (210 km), inner eye core (90 km), and 2-hour synoptic track splines.
2. **wind maps**: Full-India atmospheric streamline vector fields, warning corridors, and live station anemometers.
3. **weather maps**: State-by-state dropdown selector and district meteorological telemetry nodes.
4. **doppler maps**: IMD Doppler Weather Radar (DWR) precipitation reflectivity (dBZ) composite overlays.
5. **satellite maps**: Multispectral daily satellite imagery channels.
6. **	hermal anomaly maps**: Continuous synoptic temperature departure contour polygons (NOAA CPC / IMD NCC style) with interactive thermal radiance overlays.
7. **street maps**: High-contrast, clean geographical navigation base layer.

---

## 🚨 Dedicated SOS Maps & Rescue Triage Console

The **SOS Maps** tab (/maps) is dedicated to active emergency dispatch:
- **Live Citizen Distress Beacons**: Real-time GPS coordinates with animated radar pulse indicators.
- **Triage Filter System**: Filter by severity (Critical, Warning, Moderate) and State (Andhra Pradesh, Odisha, Tamil Nadu, Kerala, etc.).
- **Victim Profile Inspection Modal**: Displays battery status, signal strength, medical priority, occupant count, and direct telephone dispatch buttons.
- **Emergency Speed-Dial Desk**: Direct 1-tap connection to 112, 1078, 1070, 108, and 1554.

---

## 🛡️ NDMA SACHET Disaster Safety Hub

The **Safety Hub** (/safety) delivers authoritative, life-saving disaster action protocols for 7 core hazard domains with real disaster imagery:

| Hazard Protocol | Verified Authority | Official Safety Video Action |
| :--- | :--- | :--- |
| **Flood Disaster Safety** | NDMA SACHET | [Watch Flood Safety Video](https://sachet.ndma.gov.in/DosDont) |
| **Cyclone & Gale Storm Safety** | NDMA SACHET | [Watch Cyclone Safety Video](https://sachet.ndma.gov.in/DosDont) |
| **Earthquake & Seismic Hazard** | NDMA SACHET | [Watch Earthquake Safety Video](https://sachet.ndma.gov.in/DosDont) |
| **Landslide & Debris Flow Safety** | NDMA SACHET | [Watch Landslide Safety Video](https://sachet.ndma.gov.in/DosDont) |
| **Road Safety & Highway Hazards** | MoRTH | [Watch Road Safety Video](https://morth.nic.in/road-safety) |
| **Lightning & Severe Thunderstorm** | NDMA SACHET | [Watch Lightning Safety Video](https://sachet.ndma.gov.in/DosDont) |
| **Ocean & Coastal Maritime Hazards** | NDMA SACHET | [Watch Coastal Safety Video](https://sachet.ndma.gov.in/DosDont) |

---

## 🌟 Core Capabilities & Operational Use Cases

1. **State & District Emergency Operations Centers (SEOC / DEOC)**: Rapid situational assessment during cyclone landfall or heavy precipitation events.
2. **National Disaster Response Force (NDRF) & First Responders**: Accurate triage and geolocation of stranded victims using battery and headcount telemetry.
3. **Coastal Fishermen & Maritime Operators**: Real-time gale radii visualization and ocean hazard warnings.
4. **General Public**: Multilingual safety protocols, go-bag checklists, and direct one-touch SOS triggering.

---

## 📚 Scientific Grounding & Institutional References

1. **National Disaster Management Authority (NDMA)**: [SACHET Multi-Hazard Early Warning Portal](https://sachet.ndma.gov.in/)
2. **India Meteorological Department (IMD)**: [RSMC Tropical Cyclones New Delhi & Mausam Portal](https://mausam.imd.gov.in/)
3. **ISRO MOSDAC**: [INSAT-3DR Multispectral Satellite & Land Surface Temperature](https://mosdac.gov.in/)
4. **NOAA Climate Prediction Center (CPC)**: [Global Temperature & Precipitation Anomalies](https://www.cpc.ncep.noaa.gov/)
5. **Ministry of Road Transport and Highways (MoRTH)**: [National Road Safety Guidelines](https://morth.nic.in/road-safety)
6. **Leaflet & OpenStreetMap**: [Open Geospatial Consortium Standards](https://www.openstreetmap.org/)

---

## 🚀 Local Development & Build

`ash
# Clone the repository
git clone https://github.com/25A31A0356/Aegis-web.git
cd Aegis-web

# Install dependencies
npm install

# Run the development server
npm run dev
# App will run at http://localhost:5173

# Build production bundle
npm run build
`

---

## 📄 License
This project is licensed under the MIT License.
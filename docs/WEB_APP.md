# AEGIS ALERT — Web Application Architecture & GIS Dashboard

## 1. Technical Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 + Lucide Icons + Material Symbols
- **Mapping Engine**: Leaflet 1.9 + React-Leaflet + NASA GIBS Tile Servers + OpenStreetMap
- **State Management**: React Context (LocationContext, SOSContext, NotificationContext)
- **Internationalization**: 10 Indian Languages (en, hi, 	e, 	a, n, mr, gu, ml, kn, or)

`mermaid
flowchart TD
    WebAccess[Access Web Dashboard] --> Dashboard[Live Situation Command Center /]
    
    Dashboard --> ResearchMaps[Research Maps /maps/research]
    Dashboard --> SOSMaps[Dedicated SOS Maps /maps]
    Dashboard --> SafetyHub[NDMA Safety Hub /safety]
    Dashboard --> Hazards[Hazard Matrix /hazards]
    Dashboard --> Forecasts[Atmospheric Matrix & Timeline /forecasts]
    Dashboard --> Reports[Citizen Reports Triage /reports]
    Dashboard --> SOSConsole[SOS Beacon Dispatch Desk /sos]
    
    subgraph SevenMaps [7 Clean Meteorological Layers]
        CycloneMap[cyclone maps: Storm ARNAB Track & Radii]
        WindMap[wind maps: Streamline Vector Fields]
        WeatherMap[weather maps: State & District Telemetry]
        DopplerMap[doppler maps: DWR Radar Reflectivity]
        SatMap[satellite maps: Multispectral Imaging]
        ThermalMap[thermal anomaly maps: Isothermal Contours]
        StreetMap[street maps: High-contrast Navigation]
    end
    
    ResearchMaps --> SevenMaps
    SOSMaps --> VictimProfile[Victim Profile Modal + Speed-Dial Dispatch]
    SafetyHub --> HazardModal[7 Hazard Action Protocols + Video SOPs]
`

---

## 2. Geospatial Architecture: The 7 Simple Maps

1. **cyclone maps**: Real-time tracking of active cyclonic systems (**Very Severe Cyclonic Storm ARNAB** in Bay of Bengal) with cone of uncertainty, gale radii (210 km), inner eye core (90 km), and 2-hour synoptic track splines.
2. **wind maps**: Full-India atmospheric streamline vector fields, warning corridors, and live station anemometers.
3. **weather maps**: State-by-state dropdown selector and district meteorological telemetry nodes.
4. **doppler maps**: IMD Doppler Weather Radar (DWR) precipitation reflectivity (dBZ) composite overlays.
5. **satellite maps**: Multispectral daily satellite imagery channels.
6. **	hermal anomaly maps**: Continuous synoptic temperature departure contour polygons (NOAA CPC / IMD NCC style) with interactive thermal radiance overlays.
7. **street maps**: High-contrast, clean geographical navigation base layer.

---

## 3. Dedicated SOS Maps & Rescue Triage Console

The **SOS Maps** tab (/maps) is dedicated to active emergency dispatch:
- **Live Citizen Distress Beacons**: Real-time GPS coordinates with animated radar pulse indicators.
- **Triage Filter System**: Filter by severity (Critical, Warning, Moderate) and State (Andhra Pradesh, Odisha, Tamil Nadu, etc.).
- **Victim Profile Inspection Modal**: Displays battery status, signal strength, medical priority, occupant count, and direct telephone dispatch buttons.
- **Emergency Speed-Dial Desk**: Direct 1-tap connection to 112, 1078, 1070, 108, and 1554.

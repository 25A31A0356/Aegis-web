# AEGIS ALERT — Mobile Application Engineering Architecture

## 1. Technical Stack & Environment

- **Framework**: React Native 0.76 with Expo SDK 52
- **Router**: Expo Router (File-based navigation)
- **Language**: TypeScript 5.7
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context (useAegisData, useDeviceGps, useAegisCommunityReports, useAegisSosResponder)
- **Local Storage**: @react-native-async-storage/async-storage
- **Location Engine**: expo-location (High-accuracy GPS provider)
- **Sensors & Haptics**: expo-haptics, expo-notifications

`mermaid
flowchart TD
    Launch[App Launch & Permission Check] --> CheckGPS[GPS Accuracy & Location Detection]
    CheckGPS --> Home[Home Dashboard / Main Telemetry]
    
    Home -->|Tab 1: Home| DynamicTelemetry[Live Weather & 2h Synoptic Countdown]
    Home -->|Tab 2: Guides| HazardSOPs[NDMA SACHET Action Guides & Do's/Don'ts]
    Home -->|Tab 3: Reports| IncidentReport[Submit Incident Report + Media + GPS]
    Home -->|Tab 4: Safe| SafeCheckIn[Safe Check-in & Family Status Broadcast]
    Home -->|Tab 5: Ask AI| DisasterAI[Contextual Emergency Q&A Sentinel]
    
    Home -->|Top Action| SOSBeacon[Emergency SOS Beacon Dispatch]
    SOSBeacon --> CheckNetwork{Network Status?}
    CheckNetwork -->|Online| DispatchLive[Immediate WebSocket/REST Dispatch]
    CheckNetwork -->|Offline| QueueLocal[Store in Offline Queue + Retry Engine]
    QueueLocal -->|On Reconnect| DispatchLive
    
    Home -->|Nav Action| TacticalMap[Live Real-time GIS & Evacuation Routes]
    Home -->|Nav Action| HazardDirectory[All Hazards Directory & State Filters]
    Home -->|Nav Action| GPSDiagnostics[GPS Precision & Sat Telemetry Monitor]
`

---

## 2. Screen Inventory & Data Dependencies

| Route | Component | Purpose | Data Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| pp/(tabs)/index.tsx | Home Dashboard | Core situational awareness, weather metrics, 2h timer, nearby alerts | useAegisData, useDeviceGps | IMPLEMENTED |
| pp/(tabs)/guide.tsx | Disaster Guides | NDMA SACHET verified safety SOPs (Flood, Cyclone, Earthquake, Landslide, etc.) | Local Guide Dataset | IMPLEMENTED |
| pp/(tabs)/reports.tsx | Citizen Reports | Incident reporting with photo upload, category selection, and GPS tagging | useAegisCommunityReports | IMPLEMENTED |
| pp/(tabs)/safe.tsx | Safe Check-in | Mark self safe, manage emergency contacts, notify family network | Local Storage / API | IMPLEMENTED |
| pp/(tabs)/ask.tsx | Ask AEGIS AI | AI conversational assistant for disaster triage and emergency questions | /api/v1/ai/chat | IMPLEMENTED |
| pp/(tabs)/beacon.tsx | SOS Beacon | 1-touch distress broadcast with battery telemetry & headcount | useAegisSosResponder | IMPLEMENTED |
| pp/map.tsx | Tactical Map | Real-time evacuation routes, shelter markers, hazard perimeters | 
eact-native-maps / Web GIS | IMPLEMENTED |
| pp/hazards.tsx | Hazard Directory | State-filtered catalogue of all active warnings | /api/v1/hazards | IMPLEMENTED |
| pp/gps-diagnostics.tsx | GPS Diagnostics | Satellite count, HDOP accuracy meter, raw coordinate inspector | expo-location | IMPLEMENTED |
| pp/notifications.tsx | Alerts Center | Push alert history and critical severity broadcasts | /api/v1/notifications | IMPLEMENTED |

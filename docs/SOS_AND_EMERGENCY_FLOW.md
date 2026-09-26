# AEGIS SOS & Emergency Distress Flow Specification

This document details the end-to-end mission-critical lifecycle of an SOS distress signal from citizen trigger on mobile to control room triage and field responder dispatch.

## 1. End-to-End Emergency Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Victim as Citizen / Victim
    participant Mobile as AEGIS Mobile App
    participant Storage as Local SQLite / WatermelonDB
    participant Backend as FastAPI Emergency Dispatch
    participant Redis as Redis Pub/Sub & Buffer
    participant Web as Web Command Center (NDRF/SDRF)
    actor Responder as Field Rescue Team

    Victim->>Mobile: Long-Press SOS (3-Second Guard)
    Mobile->>Mobile: Gather GPS (WGS84), Battery %, Device Info
    Mobile->>Storage: Store Beacon with Status 'QUEUED_LOCAL'
    
    alt Device is Online (Cellular / Wi-Fi)
        Mobile->>Backend: POST /api/v1/sos/trigger {payload}
        Backend->>Backend: Persist to PostgreSQL `sos_beacons`
        Backend->>Redis: Publish to channel `sos:events:new`
        Redis->>Web: WebSocket Broadcast `SOS_TRIGGERED`
        Web->>Web: Visual & Audio Beacon Alert on Live GIS Map
        Backend-->>Mobile: 201 Created {beacon_id, status: 'ACKNOWLEDGED'}
        Mobile->>Storage: Update Status to 'ACKNOWLEDGED'
    else Device is Offline / Jammed
        Mobile->>Storage: Mark Beacon 'OFFLINE_RETRY_PENDING'
        Mobile->>Mobile: Launch Background Network Sync Daemon
        Note over Mobile,Storage: Polling network connectivity every 5s
        Mobile-->>Victim: Visual confirmation: Distress saved locally; will auto-sync upon signal
    end

    Web->>Web: Commander assigns NDRF Team Bravo
    Web->>Backend: POST /api/v1/sos/dispatch {beacon_id, responder_id}
    Backend->>Redis: Publish `sos:dispatch:assigned`
    Redis->>Responder: Push Notification & Tactical Routing Coords
    Responder->>Backend: PATCH /api/v1/sos/status {beacon_id, status: 'RESCUED'}
    Backend->>Web: Real-Time Map Update: Beacon Green / Resolved
    Backend->>Mobile: Push Notification: "Rescue Team on Site / Resolved"
```

---

## 2. Emergency Payload Schema

When a distress signal is triggered, the mobile client compiles a comprehensive telemetry payload:

```json
{
  "emergency_id": "c71a39f1-d0b8-4c8e-a220-3b91a921d194",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "telemetry": {
    "latitude": 17.6868,
    "longitude": 83.2185,
    "gps_accuracy_meters": 4.2,
    "altitude_meters": 12.0,
    "heading_degrees": 135.0,
    "speed_mps": 0.0
  },
  "device_status": {
    "battery_percentage": 14,
    "is_charging": false,
    "network_type": "4G_LTE",
    "signal_strength_bars": 1
  },
  "emergency_details": {
    "category": "CYCLONE_TRAPPED",
    "description": "Roof damaged by Cyclone Arnab wind gusts, water rising rapidly.",
    "affected_individuals_count": 4,
    "medical_attention_required": true
  },
  "triggered_timestamp_utc": "2026-09-26T14:15:30Z"
}
```

---

## 3. False Alarm Prevention & Cancellation Protocols

1. **3-Second Guard**: Accidental taps do not trigger an SOS. The button requires a sustained 3-second long-press with haptic vibration feedback and visual countdown.
2. **Cancellation Window**: A 10-second grace cancellation window appears immediately after trigger, allowing the user to abort before field responder dispatch protocols are escalated.
3. **PIN / Biometric Cancellation**: Canceling an active SOS requires entering user PIN or biometric verification to prevent unauthorized cancellation under duress.

---

## 4. Triage Priorities & Severity Scoring

The backend triage engine assigns immediate numerical priorities (P1 - P4):

| Priority Level | Criteria | Response SLA | Action Required |
|---|---|---|---|
| **P1 - Catastrophic** | Battery < 15%, Medical Emergency = True, Inside Cyclone Eye/Isotach > 120km/h | < 15 Minutes | Direct NDRF helicopter / marine boat dispatch |
| **P2 - Critical** | Trapped individuals count > 3, Water rising, Inside Red Hazard Zone | < 30 Minutes | SDRF tactical ground unit alert |
| **P3 - Severe** | Structural damage, safe ground, non-life-threatening medical | < 60 Minutes | Local civil defense & medical dispatch |
| **P4 - Moderate** | Supply shortage, road blockage, safe shelter | < 2 Hours | Relief shelter coordination |

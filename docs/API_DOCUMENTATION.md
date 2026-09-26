# AEGIS ALERT ? REST API & WebSocket Specification

All endpoints are prefixed with `/api/v1`.

---

## 1. Location & Geocoding Endpoints

### `POST /api/v1/location/precision`
- **Purpose**: Ingest high-accuracy GPS telemetry and resolve district boundaries.
- **Authentication**: Optional (Anonymous allowed for emergency GPS beacons).
- **Request Headers**:
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "latitude": 17.6868,
  "longitude": 83.2185,
  "accuracy_m": 8.5,
  "altitude_m": 12.0
}
```
- **Response**: `200 OK`
```json
{
  "status": "success",
  "district": "Visakhapatnam",
  "state": "Andhra Pradesh",
  "hazard_risk_level": "MODERATE",
  "nearest_shelter_km": 1.4
}
```

---

## 2. Cyclone & Meteorological Endpoints

### `GET /api/v1/cyclones/active`
- **Purpose**: Retrieve active tropical cyclone tracking data, storm center, track points, and gale radii.
- **Authentication**: Public
- **Response**: `200 OK`
```json
{
  "cyclones": [
    {
      "id": "cyclone-arnab",
      "name": "ARNAB",
      "intensity": "Very Severe Cyclonic Storm",
      "basin": "Bay of Bengal",
      "center": [16.8, 86.4],
      "max_wind_kmh": 130,
      "central_pressure_hpa": 978,
      "gale_radius_km": 210,
      "track": [
        {"lat": 14.5, "lng": 89.0, "time": "-18h", "wind_kmh": 65},
        {"lat": 16.8, "lng": 86.4, "time": "NOW", "wind_kmh": 130},
        {"lat": 18.2, "lng": 84.8, "time": "+12h", "wind_kmh": 145}
      ]
    }
  ]
}
```

---

## 3. SOS Beacon & Distress Dispatch Endpoints

### `POST /api/v1/sos`
- **Purpose**: Register an emergency distress beacon.
- **Authentication**: Optional (Tokens accepted if logged in).
- **Request Body**:
```json
{
  "latitude": 17.7231,
  "longitude": 83.3012,
  "accuracy_m": 10.0,
  "battery_pct": 14,
  "occupant_count": 4,
  "severity": "CRITICAL",
  "medical_emergency": true,
  "contact_phone": "+919876543210"
}
```
- **Response**: `201 Created`
```json
{
  "beacon_id": "beacon-ap-vizag-001",
  "status": "DISPATCHED",
  "assigned_team": "NDRF 10th Battalion",
  "created_at": "2026-09-26T13:45:00Z"
}
```

### `GET /api/v1/sos/active`
- **Purpose**: Retrieve active distress beacons for command center triage.
- **Authentication**: Required (`RESPONDER` or `ADMIN` role).
- **Response**: `200 OK` with array of active victim beacons and status flags.

---

## 4. Citizen Community Incident Reports

### `POST /api/v1/reports`
- **Purpose**: Submit citizen-witnessed disaster incident report with optional media evidence.
- **Request Format**: `multipart/form-data`
  - `hazard_type`: `FLOOD` | `LANDSLIDE` | `ROAD_BLOCKAGE` | `CYCLONE_DAMAGE`
  - `severity`: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
  - `latitude`: `17.6868`
  - `longitude`: `83.2185`
  - `description`: Detailed field notes
  - `file`: Image/Video binary evidence
- **Response**: `201 Created` with verified incident tracking ID.

---

## 5. Real-Time WebSocket Hub

### `WS /api/v1/ws`
- **Purpose**: Real-time bidirectional event streaming for active hazard bulletins and distress beacon updates.
- **Message Types**:
  - `SOS_BROADCAST`: New distress beacon emitted.
  - `SYNOPTIC_UPDATE`: New 2-hour observation cycle published.
  - `HAZARD_ALERT`: Critical severity broadcast to connected clients.

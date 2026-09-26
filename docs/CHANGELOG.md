# AEGIS Platform Changelog

All notable changes to the AEGIS Disaster Response Platform are documented in this file in accordance with [Keep a Changelog](https://keepachangelog.com/).

## [1.2.0] - 2026-09-26

### Added
- Comprehensive technical documentation suite across `docs/` adhering to Smart India Hackathon engineering standards.
- 10 standalone Mermaid architecture and sequence diagrams under `docs/diagrams/`.
- 7 simple-named hazard research maps: Cyclone Map, Doppler Radar Map, Thermal Anomaly Map, Wind Hazard Map, Satellite Map, Precipitation Map, and Seismic Map.
- Official NDMA SACHET safety guidelines (Do's & Don'ts) for 7 hazard categories integrated directly into mobile and web client modals.
- Real-time Cyclone Arnab tracking with 2-hour synoptic steps, Catmull-Rom spline wind contours (65-180 km/h), and Bay of Bengal trajectory alignment.

### Changed
- Refactored Web Command Center to enforce container isolation for each GIS research map, eliminating DOM canvas bleeding.
- Standardized SOS distress beacon payload to include battery percentage, medical distress flags, and GPS HDOP precision accuracy.
- Upgraded backend dispatch router to FastAPI ASGI with native Redis Pub/Sub broadcast.

### Fixed
- Fixed Doppler Radar 250km surveillance ring coordinate alignment over coastal radar stations.
- Resolved GPS coordinate drift on mobile client by adding HDOP threshold validation (< 30m).
- Fixed offline SOS queue flush logic to use exponential backoff with random jitter.

---

## [1.1.0] - 2026-09-21

### Added
- Core FastAPI backend microservice architecture with PostgreSQL PostGIS and Redis integration.
- Leaflet interactive map component on Web Command Center with dark tactical theme.
- Mobile React Native application scaffold with Expo Location and WatermelonDB offline storage.
- Real-time WebSocket gateway for immediate SOS triage event broadcasting.

---

## [1.0.0] - 2026-09-15
- Initial prototype release for Smart India Hackathon internal evaluation.

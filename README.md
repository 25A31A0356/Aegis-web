# 🛡️ AEGIS ALERT — Web Platform

> **Advanced Multi-Hazard Public Safety, Meteorological Forecasting, and Emergency Response Intelligence Platform.**

AEGIS ALERT Web is a high-performance, real-time command center and public situational awareness platform designed to monitor meteorological conditions, track natural and human-induced hazards across India and worldwide, visualize live GIS telemetry, triage emergency SOS beacons, and provide actionable life-saving safety guidance.

---

## 🌟 Key Features

### 1. 📊 Command Center Dashboard
- **Real-Time Meteorological Telemetry**: Temperature, precipitation probability, wind velocity & direction vectors, barometric pressure, UV index, and Air Quality Index (AQI).
- **Interactive Leaflet GIS National Risk Map**: Doppler radar reflectivity overlays, cyclone trajectory & cone of uncertainty, active SOS distress beacons, and safe relief shelters.
- **State & UT Risk Matrix**: Comprehensive risk ranking, active hazard counters, primary threats, and State Disaster Management Authority (SDMA) emergency helplines for all 28 States and 8 Union Territories.

### 2. 🗺️ Fullscreen GIS Situational Explorer
- Multi-layer vector toggles: **Doppler Radar**, **Cyclone Tracks**, **Flood Inundation Zones**, **Active SOS Beacons**, and **Safe Shelters**.
- Base map switcher: **Light**, **Dark (Night Ops)**, **Satellite Imagery**, and **Terrain / Topo**.
- Geographic scope selector: **India National Grid | South & East Asia | Worldwide Watch**.

### 3. 📈 Predictive Forecasts & Atmospheric Modeling
- **7-Stage Timeline Slider**: `Now` → `+3h` → `+6h` → `+12h` → `Tomorrow` → `3 Days` → `7 Days`.
- **24-Hour Convective Curves**: Interactive Recharts plots for temperature, precipitation chance, and wind velocity.
- **Multi-Hazard Risk Index**: Machine learning ensemble confidence ratings for cyclones, extreme rainfall, urban flooding, heatwaves, and air quality degradation.

### 4. ⚠️ Multi-Hazard Intelligence Repository
- Comprehensive hazard catalog covering Cyclones, Floods, Heatwaves, Earthquakes, Landslides, and Industrial incidents.
- Event lifecycle tracker, severity badges (Critical, Warning, Moderate, Normal), and step-by-step **What Should I Do?** safety advice cards.

### 5. 🚨 Emergency SOS Dispatch & Response Hub
- Real-time distress beacon triage queue dispatched from the AEGIS mobile ecosystem.
- **Emergency Navigation Route Simulator**: Computes live responder driving routes, priority corridors, distance, estimated time of arrival (ETA), and turn-by-turn guidance steps.

### 6. 📰 Intelligence Stream
- Multi-agency verified event bulletins from **IMD**, **CWC**, **INCOIS**, **NDMA**, and **SDMAs**.

### 7. 📱 Mobile-Synced Safety Account & Settings (Slide-Over Drawer)
- **Identity & Emergency Profile**: Configurable user profile (Aarav Sharma), blood group selector, household member count, and encrypted medical notes.
- **Family & Emergency Contacts**: Automated distress dispatch notification list with direct call triggers and contact management.
- **9-Language Support**: English, हिंदी (Hindi), తెలుగు (Telugu), தமிழ் (Tamil), বাংলা (Bengali), मराठी (Marathi), ಕನ್ನಡ (Kannada), മലയാളം (Malayalam), and ગુજરાતી (Gujarati).
- **Theme & Sensor Toggles**: Dark/Light appearance, push alerts, and GPS live routing.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Mapping & GIS**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (or yarn / pnpm)

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/25A31A0356/Aegis-web.git

# Navigate into the project folder
cd Aegis-web

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Security & Privacy
- Client-side data storage aligns with hardware-backed encryption models.
- No PII is logged or exposed in public feeds.

---

## 📄 License
MIT License. Developed for Public Safety & Disaster Preparedness.

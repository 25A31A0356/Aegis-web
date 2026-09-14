import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HazardItem } from '../../types/hazard';
import { StateRiskData, SafeShelter, GeoScope } from '../../types/location';
import { SOSBeacon } from '../../types/sos';
import { SimulatedRoute } from '../../services/routingService';
import {
  AlertTriangle,
  Radio,
  Wind,
  Droplets,
  Flame,
  Shield,
  PhoneCall,
  Eye,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';

// Fix Leaflet Default Icon issue in bundled React apps
const createSvgIcon = (color: string, label: string, isPulsing: boolean = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${isPulsing ? `<div class="pulse-ring" style="border-color: ${color}; background-color: ${color}20;"></div>` : ''}
        <div style="background-color: ${color};" class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
          ${label}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const createSOSIcon = () => {
  return L.divIcon({
    className: 'custom-sos-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-9 h-9 rounded-full bg-red-600/30 animate-ping"></div>
        <div class="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-elevated flex items-center justify-center text-white text-xs font-bold font-mono">
          SOS
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createShelterIcon = () => {
  return L.divIcon({
    className: 'custom-shelter-marker',
    html: `
      <div class="w-5 h-5 rounded-md bg-indigo-600 border border-white shadow flex items-center justify-center text-white text-[9px] font-bold">
        🏠
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

// Map Recenter Controller
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export interface MapLayersState {
  weatherRadar: boolean;
  isobarWinds: boolean;
  floodInundation: boolean;
  cycloneTrack: boolean;
  wildfireHotspots: boolean;
  earthquakes: boolean;
  sosBeacons: boolean;
  safeShelters: boolean;
  baseLayer: 'light' | 'dark' | 'satellite' | 'terrain';
}

interface IndiaSafetyMapProps {
  hazards: HazardItem[];
  states: StateRiskData[];
  sosBeacons: SOSBeacon[];
  shelters: SafeShelter[];
  activeRoute?: SimulatedRoute | null;
  layers: MapLayersState;
  selectedState?: StateRiskData | null;
  onSelectState?: (state: StateRiskData) => void;
  onSelectHazard?: (hazardId: string) => void;
  onSelectSOS?: (sosId: string) => void;
  scope?: GeoScope;
  heightClass?: string;
}

export const IndiaSafetyMap: React.FC<IndiaSafetyMapProps> = ({
  hazards,
  states,
  sosBeacons,
  shelters,
  activeRoute,
  layers,
  selectedState,
  onSelectState,
  onSelectHazard,
  onSelectSOS,
  scope = 'india',
  heightClass = 'h-[580px]',
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.5, 79.5]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  useEffect(() => {
    if (selectedState) {
      setMapCenter(selectedState.centerCoordinates);
      setMapZoom(7);
    } else if (scope === 'india') {
      setMapCenter([21.5, 79.5]);
      setMapZoom(5);
    } else if (scope === 'asia') {
      setMapCenter([22.0, 95.0]);
      setMapZoom(4);
    } else if (scope === 'global') {
      setMapCenter([20.0, 50.0]);
      setMapZoom(3);
    }
  }, [selectedState, scope]);

  // Tile URL based on base layer (100% Free Open GIS, zero API token required)
  const tileUrl =
    layers.baseLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : layers.baseLayer === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : layers.baseLayer === 'terrain'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    layers.baseLayer === 'satellite'
      ? 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
      : '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  // Simulated Cyclone Track Points for Cyclone Vayu
  const cycloneTrackCoords: [number, number][] = [
    [16.2, 86.8], // Past T-24h
    [17.8, 86.2], // Past T-12h
    [19.2, 85.9], // Current Center
    [20.5, 85.5], // Forecast +12h (Landfall Puri)
    [21.8, 85.2], // Forecast +24h (Inland Cuttack/Balasore)
  ];

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-100`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapRecenter center={mapCenter} zoom={mapZoom} />

        {/* Base Tile Layer with CARTO/Esri open subdomains */}
        <TileLayer
          url={tileUrl}
          attribution={tileAttribution}
          maxZoom={19}
          subdomains={['a', 'b', 'c', 'd']}
        />

        {/* 1. Doppler Weather Radar Simulated Heat Layer */}
        {layers.weatherRadar && (
          <>
            {/* Bay of Bengal / Odisha Heavy Convective Core */}
            <Circle
              center={[19.6, 85.8]}
              radius={180000}
              pathOptions={{
                color: '#DC2626',
                fillColor: '#DC2626',
                fillOpacity: 0.28,
                weight: 2,
                dashArray: '4, 4',
              }}
            />
            <Circle
              center={[19.6, 85.8]}
              radius={90000}
              pathOptions={{
                color: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: 0.42,
                weight: 1,
              }}
            />

            {/* Telangana / Hyderabad Thunderstorm Radar Core */}
            <Circle
              center={[17.4, 78.5]}
              radius={75000}
              pathOptions={{
                color: '#D97706',
                fillColor: '#F59E0B',
                fillOpacity: 0.32,
                weight: 1.5,
              }}
            />

            {/* Mumbai / Konkan Monsoon Plume */}
            <Circle
              center={[19.1, 73.0]}
              radius={85000}
              pathOptions={{
                color: '#0284C7',
                fillColor: '#38BDF8',
                fillOpacity: 0.30,
                weight: 1.5,
              }}
            />

            {/* Assam Brahmaputra Downpour Zone */}
            <Circle
              center={[26.8, 93.5]}
              radius={120000}
              pathOptions={{
                color: '#DC2626',
                fillColor: '#DC2626',
                fillOpacity: 0.25,
                weight: 1.5,
              }}
            />
          </>
        )}

        {/* 2. Cyclone Projected Track & Wind Swell Cone */}
        {layers.cycloneTrack && (
          <>
            <Polyline
              positions={cycloneTrackCoords}
              pathOptions={{
                color: '#DC2626',
                weight: 4,
                dashArray: '6, 6',
                lineCap: 'round',
              }}
            />
            {/* Cone of Uncertainty */}
            <Circle
              center={[20.5, 85.5]}
              radius={135000}
              pathOptions={{
                color: '#D97706',
                fillColor: '#FEF08A',
                fillOpacity: 0.2,
                weight: 1,
              }}
            />
          </>
        )}

        {/* 3. State Risk Markers */}
        {states.map((st) => {
          const color =
            st.riskLevel === 'critical'
              ? '#DC2626'
              : st.riskLevel === 'warning'
              ? '#D97706'
              : st.riskLevel === 'moderate'
              ? '#F59E0B'
              : '#10B981';

          return (
            <Marker
              key={st.id}
              position={st.centerCoordinates}
              icon={createSvgIcon(color, st.id, st.riskLevel === 'critical')}
              eventHandlers={{
                click: () => onSelectState && onSelectState(st),
              }}
            >
              <Popup>
                <div className="p-3 max-w-xs font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                    <div className="font-bold text-sm text-slate-900">{st.name}</div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        st.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : st.riskLevel === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {st.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    <strong>Primary Threat:</strong> {st.primaryThreat}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2.5">
                    <div>
                      <span className="text-slate-400 block text-[10px]">TEMP / COND</span>
                      <span className="font-semibold text-slate-800">{st.currentTemp}°C</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ACTIVE HAZARDS</span>
                      <span className="font-semibold text-slate-800">{st.activeHazardsCount} active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectState && onSelectState(st)}
                    className="w-full bg-slate-900 hover:bg-red-600 text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View State Risk Brief</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Active Hazard Incident & Warning Pins */}
        {hazards.map((hz) => {
          const color =
            hz.severity === 'critical'
              ? '#DC2626'
              : hz.severity === 'warning'
              ? '#D97706'
              : '#0284C7';

          return (
            <React.Fragment key={hz.id}>
              {/* Hazard Impact Radius Ring */}
              {hz.location.radiusKm && (
                <Circle
                  center={hz.location.coordinates}
                  radius={hz.location.radiusKm * 1000}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.12,
                    weight: 1.5,
                  }}
                />
              )}

              <Marker
                position={hz.location.coordinates}
                icon={createSvgIcon(color, hz.nature[0].toUpperCase(), hz.severity === 'critical')}
                eventHandlers={{
                  click: () => onSelectHazard && onSelectHazard(hz.id),
                }}
              >
                <Popup>
                  <div className="p-3 max-w-sm font-sans">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          hz.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {hz.nature.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{hz.id}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 mb-1 leading-snug">
                      {hz.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3 mb-2">
                      {hz.headline}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono border-t border-slate-100 pt-1.5 flex items-center justify-between">
                      <span>{hz.location.district}, {hz.location.state}</span>
                      <button
                        onClick={() => onSelectHazard && onSelectHazard(hz.id)}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Full Details →
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 5. SOS Beacons (Pulsing Mobile Emergency Beacons) */}
        {layers.sosBeacons &&
          sosBeacons.map((sos) => (
            <Marker
              key={sos.id}
              position={sos.coordinates}
              icon={createSOSIcon()}
              eventHandlers={{
                click: () => onSelectSOS && onSelectSOS(sos.id),
              }}
            >
              <Popup>
                <div className="p-3 max-w-xs font-sans">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                      {sos.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {sos.triageStatus}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mb-1">
                    {sos.emergencyTitle}
                  </h4>
                  <div className="text-[11px] text-slate-600 mb-2">
                    📍 {sos.locationName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono bg-red-50 p-2 rounded border border-red-100 mb-2">
                    Persons trapped: <strong>{sos.personsCount}</strong> • Battery: {sos.batteryPercent}% • GPS ±{sos.gpsAccuracyMeters}m
                  </div>
                  <button
                    onClick={() => onSelectSOS && onSelectSOS(sos.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Open Dispatch Triage
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 6. Evacuation Shelters & Relief Camps */}
        {layers.safeShelters &&
          shelters.map((sh) => (
            <Marker key={sh.id} position={sh.coordinates} icon={createShelterIcon()}>
              <Popup>
                <div className="p-2.5 max-w-xs font-sans">
                  <span className="text-[9px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                    {sh.type}
                  </span>
                  <div className="font-bold text-xs text-slate-900 mt-1 mb-0.5">{sh.name}</div>
                  <div className="text-[10px] text-slate-500 mb-1.5">{sh.locationName}</div>
                  <div className="text-[10px] font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                    Capacity: <strong>{sh.currentOccupancy} / {sh.capacityPersons}</strong> ({Math.round((sh.currentOccupancy / sh.capacityPersons) * 100)}% full)
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 7. Active Emergency Navigation Routing Polyline */}
        {activeRoute && (
          <>
            <Polyline
              positions={activeRoute.waypoints}
              pathOptions={{
                color: '#0284C7',
                weight: 5,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: '8, 8',
              }}
            />
            {/* Responder Start Pin */}
            <Marker
              position={activeRoute.originCoordinates}
              icon={createSvgIcon('#0284C7', '🚑', true)}
            />
          </>
        )}
      </MapContainer>

      {/* Floating Tactical Overlay Badge */}
      <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-subtle flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-800 font-mono tracking-tight">
          GIS SATELLITE RADAR : LIVE
        </span>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">| CRS: EPSG:3857</span>
      </div>
    </div>
  );
};

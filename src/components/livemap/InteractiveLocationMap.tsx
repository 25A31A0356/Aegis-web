import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  MapPin,
  Crosshair,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertOctagon,
  Droplets,
  Wind,
  Zap,
  Flame,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { TechnicalLayerType } from './TechnicalLayerSwitcher';
import { HazardMarkerPopup } from './HazardMarkerPopup';
import { MapService } from '../../services/mapService';
import { LocationService, NearbyActivityItem, SavedLocationItem } from '../../services/locationService';

interface InteractiveLocationMapProps {
  centerCoordinates: [number, number];
  locationName: string;
  activeTechnicalLayer: TechnicalLayerType;
  hazards: NearbyActivityItem[];
  selectedHazard: NearbyActivityItem | null;
  onSelectHazard: (hazard: NearbyActivityItem) => void;
  onSelectCoordinates: (coords: [number, number], name: string) => void;
  onUseCurrentGPS: () => void;
  onViewSafetyGuide?: (slug: string) => void;
  heightClass?: string;
}

// Controller to smoothly animate map center when props change
const MapCenterController: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom, map]);
  return null;
};

// Custom Marker Pin Generators
const createHazardPinIcon = (type: string, severity: string) => {
  let color = '#E94B68'; // Critical Red default
  let iconHtml = '⚠️';

  switch (type) {
    case 'Flood':
    case 'Heavy Rain':
      color = severity.toLowerCase() === 'critical' ? '#E94B68' : '#18C3D0';
      iconHtml = '🌊';
      break;
    case 'Cyclone':
      color = '#F4C84A';
      iconHtml = '🌀';
      break;
    case 'Lightning':
      color = '#F4C84A';
      iconHtml = '⚡';
      break;
    case 'Fire':
      color = '#E94B68';
      iconHtml = '🔥';
      break;
    case 'Earthquake':
      color = '#E94B68';
      iconHtml = '⚡';
      break;
    case 'Road Blockage':
    case 'Landslide':
    default:
      color = '#E94B68';
      iconHtml = '⛔';
      break;
  }

  return L.divIcon({
    className: 'agies-hazard-pin',
    html: `
      <div class="relative flex flex-col items-center justify-center -translate-y-4 cursor-pointer group">
        <div class="absolute -top-1 w-9 h-9 rounded-full animate-ping opacity-30" style="background-color: ${color};"></div>
        <div class="w-8 h-8 rounded-full border-2 border-white shadow-float flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110" style="background-color: ${color};">
          <span>${iconHtml}</span>
        </div>
        <div class="w-2 h-2 rotate-45 -mt-1 shadow-sm" style="background-color: ${color};"></div>
      </div>
    `,
    iconSize: [32, 36],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const createActiveLocationPinIcon = (label: string) => {
  return L.divIcon({
    className: 'agies-center-pin',
    html: `
      <div class="relative flex flex-col items-center justify-center -translate-y-4 cursor-pointer">
        <div class="absolute -top-2 w-10 h-10 rounded-full bg-[#18C3D0]/35 animate-ping"></div>
        <div class="w-8 h-8 rounded-2xl bg-[#075B8A] border-2 border-[#18C3D0] shadow-float flex items-center justify-center text-white">
          <svg class="w-4 h-4 text-[#18C3D0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#18C3D0"/>
          </svg>
        </div>
        <span class="mt-0.5 px-2 py-0.5 rounded-full bg-[#075B8A] text-[#18C3D0] text-[9px] font-mono font-bold tracking-tight shadow-xs whitespace-nowrap">
          ${label}
        </span>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const createLightningFlashIcon = () => {
  return L.divIcon({
    className: 'agies-lightning-flash',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-[#F4C84A]/50 animate-ping"></div>
        <div class="w-6 h-6 rounded-full bg-[#F4C84A] border-2 border-white shadow-md flex items-center justify-center text-[#075B8A] font-bold text-xs">
          ⚡
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const InteractiveLocationMap: React.FC<InteractiveLocationMapProps> = ({
  centerCoordinates,
  locationName,
  activeTechnicalLayer,
  hazards,
  selectedHazard,
  onSelectHazard,
  onSelectCoordinates,
  onUseCurrentGPS,
  onViewSafetyGuide,
  heightClass = 'h-[580px]',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(11);

  const tileProvider = MapService.getTileProvider(
    activeTechnicalLayer === 'satellite' ? 'satellite' : 'streets'
  );

  const radarCells = MapService.getRadarStormCells(centerCoordinates);
  const lightningStrikes = MapService.getRegionalLightningStrikes(centerCoordinates);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    try {
      const results = await LocationService.searchLocation(trimmed);
      if (results && results.length > 0) {
        const top = results[0];
        onSelectCoordinates(top.coordinates, top.name);
      } else {
        // Fallback offset around query
        onSelectCoordinates(
          [centerCoordinates[0] + 0.015, centerCoordinates[1] + 0.015],
          trimmed
        );
      }
    } catch {
      onSelectCoordinates(
        [centerCoordinates[0] + 0.015, centerCoordinates[1] + 0.015],
        trimmed
      );
    }
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#DCEBED] p-5 shadow-card font-sans space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#DCEBED]">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#075B8A]" />
            <h3 className="font-extrabold text-sm text-[#075B8A] uppercase tracking-wider font-sans">
              Location Map
            </h3>
          </div>
          <p className="text-[11px] text-[#708696] mt-0.5">
            Choose a location to center the map • Active: <strong className="text-[#18364A]">{locationName}</strong>
          </p>
        </div>

        {/* Search Field & GPS Button */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#708696] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian city or area..."
              className="w-full bg-[#F4F8FA] border border-[#DCEBED] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#18364A] placeholder:text-[#708696] focus:outline-none focus:border-[#18C3D0] focus:ring-1 focus:ring-[#18C3D0]"
            />
          </form>

          <button
            type="button"
            onClick={onUseCurrentGPS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDFAFC] hover:bg-[#18C3D0] text-[#075B8A] hover:text-[#075B8A] text-xs font-bold border border-[#AEEBF0] transition-colors shadow-xs shrink-0 cursor-pointer"
            title="Center on My GPS Location"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#075B8A]" />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[#DCEBED] shadow-inner`}>
        <MapContainer
          center={centerCoordinates}
          zoom={zoom}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <MapCenterController center={centerCoordinates} zoom={zoom} />

          {/* Tile Layer (OSM or Esri Satellite) */}
          <TileLayer
            key={tileProvider.id}
            url={tileProvider.url}
            attribution={tileProvider.attribution}
            maxZoom={tileProvider.maxZoom || 19}
          />

          {/* Active Center Location Marker */}
          <Marker
            position={centerCoordinates}
            icon={createActiveLocationPinIcon(locationName)}
          >
            <Popup>
              <div className="p-2 text-xs font-sans text-[#18364A]">
                <strong className="text-[#075B8A] block font-bold">{locationName}</strong>
                <span className="text-[10.5px] text-[#708696] font-mono">
                  Coordinates: {centerCoordinates[0].toFixed(4)}°N, {centerCoordinates[1].toFixed(4)}°E
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Radar Reflectivity Rings Overlay */}
          {activeTechnicalLayer === 'radar' &&
            radarCells.map((cell) => {
              const { fill, stroke } = MapService.getRadarIntensityColor(cell.intensity);
              return (
                <Circle
                  key={cell.id}
                  center={cell.center}
                  radius={cell.radiusMeters}
                  pathOptions={{
                    color: stroke,
                    fillColor: fill,
                    fillOpacity: cell.intensity === 'heavy' ? 0.45 : cell.intensity === 'moderate' ? 0.3 : 0.18,
                    weight: 1.5,
                  }}
                >
                  <Tooltip permanent={false}>
                    <div className="text-[10px] font-mono">
                      <strong>{cell.intensity.toUpperCase()} RADAR CELL</strong>
                      <div>Reflectivity: {cell.dbz} dBZ</div>
                      <div>Moving: {cell.movementHeading} @ {cell.speedKmh} km/h</div>
                    </div>
                  </Tooltip>
                </Circle>
              );
            })}

          {/* Lightning Flash Strikes Overlay */}
          {activeTechnicalLayer === 'lightning' &&
            lightningStrikes.map((lt) => (
              <Marker
                key={lt.id}
                position={lt.coordinates}
                icon={createLightningFlashIcon()}
              >
                <Tooltip permanent={false}>
                  <div className="text-[10px] font-mono">
                    <strong>LIGHTNING DISCHARGE</strong>
                    <div>Energy: {lt.peakCurrentKa} kA ({lt.type})</div>
                    <div>Recorded: {lt.timestamp}</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}

          {/* Hazard Markers */}
          {hazards.map((hz) => (
            <Marker
              key={hz.id}
              position={hz.coordinates}
              icon={createHazardPinIcon(hz.hazardType, hz.severity)}
              eventHandlers={{
                click: () => onSelectHazard(hz),
              }}
            >
              <Popup className="agies-leaflet-popup">
                <HazardMarkerPopup
                  hazard={hz}
                  onViewSafetyGuide={onViewSafetyGuide}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Map Overlay Badge */}
        <div className="absolute top-3 left-3 z-400 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#DCEBED] shadow-card text-[11px] font-mono text-[#075B8A] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#18C3D0] animate-ping" />
          <span>Layer: <strong>{activeTechnicalLayer.toUpperCase()}</strong></span>
          <span className="text-[#708696]">• {hazards.length} Active Pins</span>
        </div>
      </div>
    </div>
  );
};

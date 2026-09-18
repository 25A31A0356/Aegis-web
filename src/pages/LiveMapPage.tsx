import React, { useState, useEffect } from 'react';
import { LiveMapHeader } from '../components/livemap/LiveMapHeader';
import { InteractiveLocationMap } from '../components/livemap/InteractiveLocationMap';
import { TechnicalLayerSwitcher, TechnicalLayerType } from '../components/livemap/TechnicalLayerSwitcher';
import { SavedLocationsList } from '../components/livemap/SavedLocationsList';
import { NearbyActivityFeed } from '../components/livemap/NearbyActivityFeed';
import { useLocation } from '../context/LocationContext';
import { LocationService, SavedLocationItem, NearbyActivityItem } from '../services/locationService';

interface LiveMapPageProps {
  onNavigate: (tab: string) => void;
  onSelectHazardById?: (id: string) => void;
}

export const LiveMapPage: React.FC<LiveMapPageProps> = ({
  onNavigate,
  onSelectHazardById,
}) => {
  const {
    selectedLocation,
    savedLocations,
    selectLocationItem,
    saveLocationItem,
    removeLocationItem,
    requestCurrentGPS,
    weather,
  } = useLocation();

  const currentCenter = selectedLocation?.coordinates || [19.0760, 72.8777];
  const activeLocationName = selectedLocation?.name || weather?.cityName || 'Mumbai';

  // Technical Layer State
  const [activeLayer, setActiveLayer] = useState<TechnicalLayerType>('radar');
  const [isRadarPlaying, setIsRadarPlaying] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Nearby Activity & Map Hazard Pins
  const [nearbyActivities, setNearbyActivities] = useState<NearbyActivityItem[]>(() =>
    LocationService.getNearbyActivity(currentCenter)
  );
  const [selectedHazard, setSelectedHazard] = useState<NearbyActivityItem | null>(null);

  // Synchronize nearby activities whenever center coordinates change
  useEffect(() => {
    setNearbyActivities(LocationService.getNearbyActivity(currentCenter));
  }, [currentCenter[0], currentCenter[1]]);

  const handleSelectSavedLocation = (loc: SavedLocationItem) => {
    selectLocationItem(loc);
  };

  const handleAddLocation = (locData: Omit<SavedLocationItem, 'id'>) => {
    saveLocationItem(locData);
  };

  const handleRemoveLocation = (id: string) => {
    removeLocationItem(id);
  };

  const handleUseCurrentGPS = async () => {
    await requestCurrentGPS();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNearbyActivities(LocationService.getNearbyActivity(currentCenter));
      setIsRefreshing(false);
    }, 600);
  };

  const handleViewSafetyGuide = (slug: string) => {
    onNavigate('safety');
  };

  return (
    <div className="max-w-[1720px] mx-auto space-y-6 font-sans">
      {/* 1. Page Header with Title, Subtitle, and Live Status Pill */}
      <LiveMapHeader
        lastUpdated="Updated 2 min ago"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Main Grid: Left = Location Map | Right = Technical Layers & Nearby Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Location Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <InteractiveLocationMap
            centerCoordinates={currentCenter}
            locationName={activeLocationName}
            activeTechnicalLayer={activeLayer}
            hazards={nearbyActivities}
            selectedHazard={selectedHazard}
            onSelectHazard={(h) => setSelectedHazard(h)}
            onSelectCoordinates={(coords, name) => {
              selectLocationItem({
                id: `coord-${coords[0].toFixed(2)}-${coords[1].toFixed(2)}`,
                name,
                stateName: selectedLocation?.stateName || 'India',
                district: name,
                stateId: selectedLocation?.stateId || 'IN',
                coordinates: coords,
                riskScore: selectedLocation?.riskScore || 70,
                riskLevel: selectedLocation?.riskLevel || 'High',
              });
            }}
            onUseCurrentGPS={handleUseCurrentGPS}
            onViewSafetyGuide={handleViewSafetyGuide}
            heightClass="h-[620px]"
          />
        </div>

        {/* RIGHT COLUMN: Technical Layers & Nearby Activity Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Technical Map Layers (Satellite / Radar / Lightning) */}
          <TechnicalLayerSwitcher
            activeLayer={activeLayer}
            onSelectLayer={(l) => setActiveLayer(l)}
            isRadarPlaying={isRadarPlaying}
            onToggleRadarPlay={() => setIsRadarPlaying(!isRadarPlaying)}
          />

          {/* Nearby Activity Card (Newest First) */}
          <NearbyActivityFeed
            activities={nearbyActivities}
            onSelectActivity={(act) => {
              setSelectedHazard(act);
            }}
            onViewSafetyGuide={handleViewSafetyGuide}
          />
        </div>
      </div>

      {/* 3. Below the Map: Saved Locations Manager */}
      <SavedLocationsList
        savedLocations={savedLocations}
        selectedLocationId={selectedLocation?.id || null}
        onSelectLocation={handleSelectSavedLocation}
        onAddLocation={handleAddLocation}
        onRemoveLocation={handleRemoveLocation}
      />
    </div>
  );
};

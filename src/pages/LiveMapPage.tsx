import React, { useState, useEffect } from 'react';
import { LiveMapHeader } from '../components/livemap/LiveMapHeader';
import { InteractiveLocationMap } from '../components/livemap/InteractiveLocationMap';
import { TechnicalLayerSwitcher, TechnicalLayerType } from '../components/livemap/TechnicalLayerSwitcher';
import { SavedLocationsList } from '../components/livemap/SavedLocationsList';
import { NearbyActivityFeed } from '../components/livemap/NearbyActivityFeed';
import { useLocation } from '../context/LocationContext';
import { LocationService, SavedLocationItem, NearbyActivityItem } from '../services/locationService';
import { RealtimeService, RealtimeEvent } from '../services/realtimeService';
import { ApiClient } from '../services/apiClient';

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

  // Nearby Activity & Map Hazard Pins (deduplicated by ID)
  const [nearbyActivities, setNearbyActivities] = useState<NearbyActivityItem[]>(() =>
    LocationService.getNearbyActivity(currentCenter)
  );
  const [selectedHazard, setSelectedHazard] = useState<NearbyActivityItem | null>(null);

  // Helper to convert community report into NearbyActivityItem
  const convertReportToNearbyItem = (rep: any, center: [number, number]): NearbyActivityItem | null => {
    if (!rep || !rep.location?.lat || !rep.location?.lng) return null;
    const dist = LocationService.calculateDistanceKm(center, [rep.location.lat, rep.location.lng]);

    return {
      id: rep.trackingId || rep.id,
      hazardType: rep.hazardType || 'Other',
      title: rep.title || `Citizen Incident: ${rep.hazardType}`,
      locationName: `${rep.location.address || rep.location.city || 'Local Sector'}, ${rep.location.state || 'India'}`,
      distanceKm: dist,
      timestamp: rep.submittedAt ? new Date(rep.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
      severity: rep.severity === 'critical' ? 'Critical' : rep.severity === 'high' ? 'Warning' : 'Watch',
      coordinates: [rep.location.lat, rep.location.lng],
      source: `Citizen Report (${rep.trackingId || 'Verified'})`,
      status: rep.status === 'verified' ? 'Verified by Ops' : rep.status === 'dispatched' ? 'Dispatched' : 'Pending Review',
      recommendedAction: rep.description || 'Proceed with caution in vicinity.',
      safetyGuideSlug: 'floods',
    };
  };

  const loadAndMergeActivities = async (center: [number, number]) => {
    const baseItems = LocationService.getNearbyActivity(center);

    try {
      const reports = await ApiClient.get<any[]>('/reports', { limit: 50 }, { skipCache: true, timeoutMs: 3500 });
      if (Array.isArray(reports)) {
        const reportItems: NearbyActivityItem[] = [];
        reports.forEach((rep) => {
          const item = convertReportToNearbyItem(rep, center);
          if (item) reportItems.push(item);
        });

        // Merge and deduplicate by item.id
        const map = new Map<string, NearbyActivityItem>();
        [...reportItems, ...baseItems].forEach((it) => {
          if (!map.has(it.id)) {
            map.set(it.id, it);
          }
        });

        setNearbyActivities(Array.from(map.values()));
        return;
      }
    } catch {
      // quiet fallback
    }

    setNearbyActivities(baseItems);
  };

  // Synchronize nearby activities whenever center coordinates change
  useEffect(() => {
    loadAndMergeActivities(currentCenter);
  }, [currentCenter[0], currentCenter[1]]);

  // Listen for real-time community report broadcasts
  useEffect(() => {
    const unsubReportCreated = RealtimeService.on('REPORT_CREATED', (evt: RealtimeEvent) => {
      const rep = evt.data;
      const item = convertReportToNearbyItem(rep, currentCenter);
      if (item) {
        setNearbyActivities((prev) => {
          const filtered = prev.filter((p) => p.id !== item.id);
          return [item, ...filtered];
        });
      }
    });

    const unsubReportUpdated = RealtimeService.on('REPORT_UPDATED', (evt: RealtimeEvent) => {
      const rep = evt.data;
      const item = convertReportToNearbyItem(rep, currentCenter);
      if (item) {
        setNearbyActivities((prev) => {
          return prev.map((p) => (p.id === item.id ? item : p));
        });
      }
    });

    return () => {
      unsubReportCreated();
      unsubReportUpdated();
    };
  }, [currentCenter]);

  // Check URL param ?reportId=... or ?hazardId=... to auto-focus pin
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const targetReportId = urlParams.get('reportId') || urlParams.get('hazardId');

    if (targetReportId && nearbyActivities.length > 0) {
      const matched = nearbyActivities.find((a) => a.id === targetReportId || a.id.includes(targetReportId));
      if (matched) {
        setSelectedHazard(matched);
      }
    }
  }, [nearbyActivities]);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAndMergeActivities(currentCenter);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleViewSafetyGuide = (slug: string) => {
    onNavigate('safety');
  };

  return (
    <div className="max-w-[1720px] mx-auto space-y-6 font-sans">
      {/* 1. Page Header with Title, Subtitle, and Live Status Pill */}
      <LiveMapHeader
        lastUpdated="Telemetry Synchronized"
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

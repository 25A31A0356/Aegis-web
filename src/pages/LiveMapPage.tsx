import React, { useState, useEffect } from 'react';
import { IndiaSafetyMap, MapLayersState } from '../components/map/IndiaSafetyMap';
import { MapLayerControls } from '../components/map/MapLayerControls';
import { MapLegend } from '../components/map/MapLegend';
import { GeoScopeSelector } from '../components/map/GeoScopeSelector';
import { StateDetailDrawer } from '../components/map/StateDetailDrawer';
import { HazardDetailModal } from '../components/hazards/HazardDetailModal';
import { HazardService } from '../services/hazardService';
import { DEMO_STATES } from '../data/demoStates';
import { DEMO_SHELTERS } from '../data/demoShelters';
import { useLocation } from '../context/LocationContext';
import { useSOS } from '../context/SOSContext';
import { GeoScope, StateRiskData } from '../types/location';
import { HazardItem } from '../types/hazard';
import { Radio, Layers, Compass, Crosshair, Navigation } from 'lucide-react';

interface LiveMapPageProps {
  onNavigate: (tab: string) => void;
  onSelectHazardById?: (id: string) => void;
}

export const LiveMapPage: React.FC<LiveMapPageProps> = ({
  onNavigate,
  onSelectHazardById,
}) => {
  const { selectedState, setSelectedStateById, userCoordinates } = useLocation();
  const { beacons, activeRoute } = useSOS();

  const [hazards, setHazards] = useState<HazardItem[]>(() => HazardService.getAllHazards());
  const [activeModalHazard, setActiveModalHazard] = useState<HazardItem | null>(null);
  const [activeDrawerState, setActiveDrawerState] = useState<StateRiskData | null>(null);

  useEffect(() => {
    HazardService.fetchLiveHazards().then(setHazards).catch(console.error);
    const unsubscribe = HazardService.subscribe(() => {
      setHazards(HazardService.getAllHazards());
    });
    return unsubscribe;
  }, []);

  const [mapLayers, setMapLayers] = useState<MapLayersState>({
    weatherRadar: true,
    isobarWinds: true,
    floodInundation: true,
    cycloneTrack: true,
    wildfireHotspots: false,
    earthquakes: true,
    sosBeacons: true,
    safeShelters: true,
    baseLayer: 'light',
  });

  const handleSelectHazard = (hazardId: string) => {
    const hz = HazardService.getHazardById(hazardId);
    if (hz) setActiveModalHazard(hz);
  };

  const handleSelectState = (st: StateRiskData) => {
    setActiveDrawerState(st);
    setSelectedStateById(st.id);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 font-sans">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h1 className="font-extrabold text-base text-slate-900 font-mono uppercase tracking-wider">
              GIS Situational & Geospatial Hazard Explorer (India Grid)
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Doppler Weather Radar • Cyclone Trajectories • Inundation Layers • Active Beacons
          </p>
        </div>

        {/* Scope Selector */}
        <GeoScopeSelector />
      </div>

      {/* Main Fullscreen GIS Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Center Canvas */}
        <div className="lg:col-span-9 space-y-4">
          <IndiaSafetyMap
            hazards={hazards}
            states={DEMO_STATES}
            sosBeacons={beacons}
            shelters={DEMO_SHELTERS}
            activeRoute={activeRoute}
            layers={mapLayers}
            selectedState={selectedState}
            userLocation={userCoordinates}
            onSelectState={handleSelectState}
            onSelectHazard={handleSelectHazard}
            onSelectSOS={(id) => onNavigate('sos')}
            scope="india"
            heightClass="h-[680px]"
          />

          <MapLegend />
        </div>

        {/* Map Layers & Tools Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <MapLayerControls layers={mapLayers} setLayers={setMapLayers} />

          {/* Quick Stats Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card text-xs font-mono">
            <h4 className="font-bold text-slate-900 uppercase mb-2 border-b border-slate-100 pb-1.5">
              Live Layer Telemetry
            </h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Active Radar Cells:</span>
                <strong className="text-slate-900">04 Clusters</strong>
              </div>
              <div className="flex justify-between">
                <span>Flood Catchments:</span>
                <strong className="text-sky-600">Brahmaputra, Godavari</strong>
              </div>
              <div className="flex justify-between">
                <span>Cyclone Storm Surge:</span>
                <strong className="text-red-600">Puri Coast (1.8m)</strong>
              </div>
              <div className="flex justify-between">
                <span>Safe Shelters:</span>
                <strong className="text-emerald-600">8 Active (11,000 Cap)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Detail Drawer */}
      <StateDetailDrawer
        state={activeDrawerState}
        onClose={() => setActiveDrawerState(null)}
        onSelectHazard={handleSelectHazard}
        onNavigate={onNavigate}
      />

      {/* Hazard Deep Dive Modal */}
      <HazardDetailModal
        hazard={activeModalHazard}
        onClose={() => setActiveModalHazard(null)}
      />
    </div>
  );
};

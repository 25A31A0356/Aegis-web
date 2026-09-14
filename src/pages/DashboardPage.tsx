import React, { useState } from 'react';
import { WeatherHeroCard } from '../components/dashboard/WeatherHeroCard';
import { MetricsBar } from '../components/dashboard/MetricsBar';
import { QuickActionGrid } from '../components/dashboard/QuickActionGrid';
import { StateRiskMatrix } from '../components/dashboard/StateRiskMatrix';
import { IndiaSafetyMap, MapLayersState } from '../components/map/IndiaSafetyMap';
import { MapLayerControls } from '../components/map/MapLayerControls';
import { MapLegend } from '../components/map/MapLegend';
import { StateDetailDrawer } from '../components/map/StateDetailDrawer';
import { HazardDetailModal } from '../components/hazards/HazardDetailModal';
import { HazardService } from '../services/hazardService';
import { DEMO_STATES } from '../data/demoStates';
import { DEMO_SHELTERS } from '../data/demoShelters';
import { useLocation } from '../context/LocationContext';
import { useSOS } from '../context/SOSContext';
import { HazardItem } from '../types/hazard';
import { StateRiskData } from '../types/location';
import { Radio, AlertTriangle, Layers, Compass, ArrowRight } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onSelectHazardById?: (id: string) => void;
  onFilterHazardsCategory?: (category: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectHazardById,
  onFilterHazardsCategory,
}) => {
  const { selectedState, setSelectedStateById } = useLocation();
  const { beacons, activeRoute } = useSOS();

  const [hazards, setHazards] = useState<HazardItem[]>(() => HazardService.getAllHazards());
  const [activeModalHazard, setActiveModalHazard] = useState<HazardItem | null>(null);
  const [activeDrawerState, setActiveDrawerState] = useState<StateRiskData | null>(null);

  React.useEffect(() => {
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
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* 1. Meteorological Telemetry Hero */}
      <WeatherHeroCard />

      {/* 2. Operational Metrics Overview Bar */}
      <MetricsBar onNavigate={onNavigate} />

      {/* 3. Primary Command Center Map & GIS Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <h2 className="font-extrabold text-sm text-slate-900 font-mono uppercase tracking-wider">
                Interactive National Situational GIS Map
              </h2>
            </div>
            <button
              onClick={() => onNavigate('live-map')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Fullscreen GIS Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <IndiaSafetyMap
            hazards={hazards}
            states={DEMO_STATES}
            sosBeacons={beacons}
            shelters={DEMO_SHELTERS}
            activeRoute={activeRoute}
            layers={mapLayers}
            selectedState={selectedState}
            onSelectState={handleSelectState}
            onSelectHazard={handleSelectHazard}
            onSelectSOS={(id) => onNavigate('sos')}
            heightClass="h-[540px]"
          />

          <MapLegend />
        </div>

        {/* Right Sidebar: Layer Controls & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <MapLayerControls layers={mapLayers} setLayers={setMapLayers} />

          {/* Live Incident Focus Card */}
          <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-card">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-100">
              <span className="text-[10px] font-mono font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                CRITICAL FOCUS • RED ALERT
              </span>
              <span className="text-[10px] font-mono text-slate-400">IMD CYCLONE DESK</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 mb-1">
              Severe Cyclone "VAYU" Landfall Warning
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Puri-Gopalpur coastal corridor under mandatory storm-surge evacuations. Sustained winds 125 km/h.
            </p>
            <button
              onClick={() => handleSelectHazard('HAZ-2026-CYC-01')}
              className="w-full bg-slate-900 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
            >
              View Full Cyclone Action Plan
            </button>
          </div>

          {/* Active Citizen SOS Dispatch Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-[10px] font-mono font-bold uppercase bg-slate-900 text-sky-400 px-2 py-0.5 rounded">
                MOBILE SOS BEACONS (4 ACTIVE)
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">100% DISPATCHED</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Citizens in flood-stranded and critical medical emergencies receiving live rescue routing.
            </p>
            <button
              onClick={() => onNavigate('sos')}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open Emergency SOS Triage Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Quick Emergency Navigation Grid */}
      <div>
        <div className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-3">
          Specialized Multi-Hazard Toolkits
        </div>
        <QuickActionGrid
          onNavigate={onNavigate}
          onFilterHazards={onFilterHazardsCategory}
        />
      </div>

      {/* 5. Comprehensive State Vulnerability Matrix Table */}
      <StateRiskMatrix
        states={DEMO_STATES}
        onSelectState={handleSelectState}
      />

      {/* State Detail Briefing Drawer */}
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
        onViewOnMap={() => onNavigate('live-map')}
      />
    </div>
  );
};

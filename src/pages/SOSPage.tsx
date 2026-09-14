import React, { useState, useEffect } from 'react';
import { SOSTriageCard } from '../components/sos/SOSTriageCard';
import { SOSDetailDrawer } from '../components/sos/SOSDetailDrawer';
import { SOSRouteSimulator } from '../components/sos/SOSRouteSimulator';
import { IndiaSafetyMap, MapLayersState } from '../components/map/IndiaSafetyMap';
import { useSOS } from '../context/SOSContext';
import { useLocation } from '../context/LocationContext';
import { HazardService } from '../services/hazardService';
import { DEMO_STATES } from '../data/demoStates';
import { DEMO_SHELTERS } from '../data/demoShelters';
import { SOSBeacon } from '../types/sos';
import { HazardItem } from '../types/hazard';
import { PhoneCall, ShieldAlert, ShieldCheck, Navigation, PlusCircle, Search, Filter, Radio, Trash2 } from 'lucide-react';
import { SOSService } from '../services/sosService';

interface SOSPageProps {
  preSelectedSOSId?: string | null;
}

export const SOSPage: React.FC<SOSPageProps> = ({ preSelectedSOSId }) => {
  const {
    beacons,
    selectedBeacon,
    activeRoute,
    setSelectedBeacon,
    updateBeaconTriage,
    triggerEmergencyRouteSimulation,
    clearActiveRoute,
    createNewSOSBeacon,
  } = useSOS();

  const { weather, userCoordinates } = useLocation();
  const [hazards, setHazards] = useState<HazardItem[]>(() => HazardService.getAllHazards());

  const [triageFilter, setTriageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  useEffect(() => {
    HazardService.fetchLiveHazards().then(setHazards).catch(console.error);
    const unsubscribe = HazardService.subscribe(() => {
      setHazards(HazardService.getAllHazards());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (preSelectedSOSId) {
      const match = beacons.find((b) => b.id === preSelectedSOSId);
      if (match) {
        setSelectedBeacon(match);
        setIsDetailDrawerOpen(true);
      }
    }
  }, [preSelectedSOSId, beacons, setSelectedBeacon]);

  const filteredBeacons = beacons.filter((b) => {
    if (triageFilter !== 'all' && b.triageStatus !== triageFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.emergencyTitle.toLowerCase().includes(q) ||
        b.locationName.toLowerCase().includes(q) ||
        b.district.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeBeaconsCount = beacons.filter(
    (b) => b.triageStatus !== 'resolved' && b.triageStatus !== 'cancelled'
  ).length;

  const mapLayers: MapLayersState = {
    weatherRadar: false,
    isobarWinds: false,
    floodInundation: true,
    cycloneTrack: false,
    wildfireHotspots: false,
    earthquakes: false,
    sosBeacons: true,
    safeShelters: true,
    baseLayer: 'light',
  };

  const handleTriggerRealGPSBeacon = () => {
    const coords: [number, number] = userCoordinates || [weather.coordinates[0], weather.coordinates[1]];
    const created = createNewSOSBeacon({
      emergencyType: 'flash_flood_stranding',
      emergencyTitle: `Emergency Distress Beacon (${weather.cityName})`,
      locationName: `Near ${weather.cityName} Sector`,
      district: weather.cityName,
      state: weather.stateName,
      coordinates: coords,
      personsCount: 1,
    });
    setSelectedBeacon(created);
    setIsDetailDrawerOpen(true);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${activeBeaconsCount > 0 ? 'bg-red-600 animate-ping' : 'bg-emerald-500'}`} />
            <h1 className="font-extrabold text-base text-slate-900 font-mono uppercase tracking-wider">
              Emergency SOS Beacon & Citizen Distress Response Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-Time GPS Triangulation • Instant Multi-Agency Dispatch (India Grid)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {beacons.length > 0 && (
            <button
              onClick={() => {
                SOSService.clearAllBeacons();
                clearActiveRoute();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors border border-slate-200"
              title="Clear all local test beacons"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Beacons</span>
            </button>
          )}

          <button
            onClick={handleTriggerRealGPSBeacon}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all font-mono"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Trigger Distress Signal (My GPS)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: SOS Beacon Triage Cards on Left + Map & Routing on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Triage List & Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-card flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SOS ID, district, or emergency..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Status Filter */}
            <select
              value={triageFilter}
              onChange={(e) => setTriageFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono text-slate-700 focus:outline-none"
            >
              <option value="all">All Triage</option>
              <option value="incoming">Incoming</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="dispatching">Dispatching</option>
              <option value="on_scene">On Scene</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Cards List or Clear State */}
          {filteredBeacons.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 font-sans">
                Sector Status: 100% Clear (0 Active Distresses)
              </h3>
              <p className="text-xs text-slate-500 font-mono leading-relaxed max-w-sm mx-auto">
                No active distress beacons registered. When a real emergency signal is triggered, it will immediately appear with GPS coordinates and dispatch routing here.
              </p>
              <button
                onClick={handleTriggerRealGPSBeacon}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Test Emergency Distress from My GPS</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredBeacons.map((beacon) => (
                <SOSTriageCard
                  key={beacon.id}
                  beacon={beacon}
                  isSelected={selectedBeacon?.id === beacon.id}
                  onSelect={(b) => {
                    setSelectedBeacon(b);
                    setIsDetailDrawerOpen(true);
                  }}
                  onUpdateStatus={(id, st) => updateBeaconTriage(id, st)}
                  onSimulateRoute={(b) => triggerEmergencyRouteSimulation(b)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Map & Emergency Navigation Route Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Navigation Route Simulator Banner */}
          {activeRoute && selectedBeacon && (
            <SOSRouteSimulator
              route={activeRoute}
              beacon={selectedBeacon}
              onClose={clearActiveRoute}
            />
          )}

          {/* Dispatch Live Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-mono text-xs">
              <span className="font-bold text-slate-900 uppercase">
                Live Distress Dispatch GIS Tracking (India Grid)
              </span>
              <span className={activeBeaconsCount > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                {activeBeaconsCount > 0 ? `${activeBeaconsCount} Active Beacon(s)` : 'Sector Clear (0 Distresses)'}
              </span>
            </div>

            <IndiaSafetyMap
              hazards={hazards}
              states={DEMO_STATES}
              sosBeacons={beacons}
              shelters={DEMO_SHELTERS}
              activeRoute={activeRoute}
              layers={mapLayers}
              userLocation={userCoordinates}
              onSelectSOS={(id) => {
                const match = beacons.find((b) => b.id === id);
                if (match) {
                  setSelectedBeacon(match);
                  setIsDetailDrawerOpen(true);
                }
              }}
              scope="india"
              heightClass="h-[520px]"
            />
          </div>
        </div>
      </div>

      {/* SOS Detail Briefing Drawer */}
      <SOSDetailDrawer
        beacon={selectedBeacon}
        onClose={() => setIsDetailDrawerOpen(false)}
        onUpdateStatus={(id, st, notes) => updateBeaconTriage(id, st, notes)}
        onSimulateRoute={(b) => triggerEmergencyRouteSimulation(b)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { SOSTriageCard } from '../components/sos/SOSTriageCard';
import { SOSDetailDrawer } from '../components/sos/SOSDetailDrawer';
import { SOSRouteSimulator } from '../components/sos/SOSRouteSimulator';
import { IndiaSafetyMap, MapLayersState } from '../components/map/IndiaSafetyMap';
import { useSOS } from '../context/SOSContext';
import { DEMO_HAZARDS } from '../data/demoHazards';
import { DEMO_STATES } from '../data/demoStates';
import { DEMO_SHELTERS } from '../data/demoShelters';
import { SOSBeacon } from '../types/sos';
import { PhoneCall, ShieldAlert, Navigation, PlusCircle, Search, Filter } from 'lucide-react';

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

  const [triageFilter, setTriageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

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

  const handleSimulateNewBeacon = () => {
    const locations = [
      { name: 'Gachibowli Outer Ring Road', district: 'Hyderabad', state: 'Telangana', coords: [17.4401, 78.3489] as [number, number] },
      { name: 'Marine Drive Coastal Seawall', district: 'Mumbai', state: 'Maharashtra', coords: [18.9438, 72.8234] as [number, number] },
      { name: 'Kottayam Meenachil Basin', district: 'Kottayam', state: 'Kerala', coords: [9.5916, 76.5222] as [number, number] },
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const created = createNewSOSBeacon({
      emergencyType: 'flash_flood_stranding',
      emergencyTitle: `Citizen Distress Call (${loc.district})`,
      locationName: loc.name,
      district: loc.district,
      state: loc.state,
      coordinates: loc.coords,
      personsCount: Math.floor(2 + Math.random() * 3),
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
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h1 className="font-extrabold text-base text-slate-900 font-mono uppercase tracking-wider">
              Emergency SOS Response & Dispatch Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-Time Distress Telemetry Ingested from AEGIS Mobile Ecosystem
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-2">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{activeBeaconsCount} ACTIVE DISTRESS BEACONS</span>
          </div>

          <button
            onClick={handleSimulateNewBeacon}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate Mobile SOS</span>
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

          {/* Cards List */}
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
                Live Distress Dispatch GIS Tracking
              </span>
              <span className="text-slate-400">Pulsing Beacons Active</span>
            </div>

            <IndiaSafetyMap
              hazards={DEMO_HAZARDS}
              states={DEMO_STATES}
              sosBeacons={beacons}
              shelters={DEMO_SHELTERS}
              activeRoute={activeRoute}
              layers={mapLayers}
              onSelectSOS={(id) => {
                const match = beacons.find((b) => b.id === id);
                if (match) {
                  setSelectedBeacon(match);
                  setIsDetailDrawerOpen(true);
                }
              }}
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

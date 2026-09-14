import React from 'react';
import { Layers, Radio, Wind, Droplets, Flame, AlertOctagon, PhoneCall, Building, Eye, Map as MapIcon } from 'lucide-react';
import { MapLayersState } from './IndiaSafetyMap';

interface MapLayerControlsProps {
  layers: MapLayersState;
  setLayers: React.Dispatch<React.SetStateAction<MapLayersState>>;
}

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({ layers, setLayers }) => {
  const toggleLayer = (key: keyof Omit<MapLayersState, 'baseLayer'>) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setBase = (base: MapLayersState['baseLayer']) => {
    setLayers((prev) => ({ ...prev, baseLayer: base }));
  };

  const layerItems = [
    { key: 'weatherRadar' as const, label: 'Doppler Radar', icon: Radio, color: 'text-red-500' },
    { key: 'cycloneTrack' as const, label: 'Cyclone Track', icon: Wind, color: 'text-amber-500' },
    { key: 'floodInundation' as const, label: 'Flood Zones', icon: Droplets, color: 'text-sky-500' },
    { key: 'sosBeacons' as const, label: 'SOS Beacons', icon: PhoneCall, color: 'text-red-600', badge: 'Live' },
    { key: 'safeShelters' as const, label: 'Safe Shelters', icon: Building, color: 'text-indigo-500' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-card font-sans">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            GIS Overlays
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Multi-Layer Vector</span>
      </div>

      {/* Layer Checkbox Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const isActive = layers[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleLayer(item.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* Base Map Selector */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span className="text-[11px] font-mono text-slate-500 font-semibold">Base Map:</span>
        <div className="flex items-center gap-1">
          {(['light', 'dark', 'satellite', 'terrain'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setBase(mode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition-colors ${
                layers.baseLayer === mode
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

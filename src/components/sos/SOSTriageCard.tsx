import React from 'react';
import { SOSBeacon, SOSTriageStatus } from '../../types/sos';
import {
  PhoneCall,
  MapPin,
  BatteryCharging,
  Users,
  Clock,
  Navigation,
  CheckCircle,
  AlertOctagon,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface SOSTriageCardProps {
  beacon: SOSBeacon;
  isSelected: boolean;
  onSelect: (beacon: SOSBeacon) => void;
  onUpdateStatus: (id: string, newStatus: SOSTriageStatus) => void;
  onSimulateRoute: (beacon: SOSBeacon) => void;
}

export const SOSTriageCard: React.FC<SOSTriageCardProps> = ({
  beacon,
  isSelected,
  onSelect,
  onUpdateStatus,
  onSimulateRoute,
}) => {
  const getStatusBadge = () => {
    switch (beacon.triageStatus) {
      case 'incoming':
        return 'bg-red-600 text-white animate-pulse';
      case 'acknowledged':
        return 'bg-amber-500 text-white';
      case 'dispatching':
        return 'bg-sky-600 text-white';
      case 'on_scene':
        return 'bg-purple-600 text-white';
      case 'resolved':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div
      onClick={() => onSelect(beacon)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer font-sans ${
        isSelected
          ? 'bg-red-50/40 border-red-500 shadow-elevated ring-1 ring-red-500/30'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-card'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
            {beacon.id}
          </span>
          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${getStatusBadge()}`}>
            {beacon.triageStatus}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>{new Date(beacon.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Title & Location */}
      <h4 className="font-extrabold text-xs text-slate-900 leading-snug mb-1">
        {beacon.emergencyTitle}
      </h4>
      <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-3">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{beacon.locationName}</span>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[10px] mb-3 text-center">
        <div>
          <span className="text-slate-400 block">SOULS</span>
          <span className="font-bold text-slate-900">{beacon.personsCount} Pers</span>
        </div>
        <div>
          <span className="text-slate-400 block">BATTERY</span>
          <span className={`font-bold ${beacon.batteryPercent < 20 ? 'text-red-600' : 'text-slate-900'}`}>
            {beacon.batteryPercent}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">GPS FIX</span>
          <span className="font-bold text-slate-900">±{beacon.gpsAccuracyMeters}m</span>
        </div>
      </div>

      {/* Assigned Unit if available */}
      {beacon.assignedUnit && (
        <div className="p-2 rounded-lg bg-sky-50 border border-sky-100 text-[11px] mb-3 flex items-center justify-between text-sky-900 font-medium">
          <div className="truncate">
            <span className="font-bold">Unit:</span> {beacon.assignedUnit.unitName}
          </div>
          <span className="font-mono text-xs font-extrabold text-sky-700 shrink-0 ml-1">
            ETA {beacon.assignedUnit.etaMinutes}m
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
        {beacon.triageStatus === 'incoming' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(beacon.id, 'acknowledged');
            }}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
          >
            Acknowledge
          </button>
        )}

        {(beacon.triageStatus === 'acknowledged' || beacon.triageStatus === 'incoming') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(beacon.id, 'dispatching');
            }}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
          >
            Dispatch Unit
          </button>
        )}

        {beacon.triageStatus === 'dispatching' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(beacon.id, 'on_scene');
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
          >
            Mark On-Scene
          </button>
        )}

        {beacon.triageStatus === 'on_scene' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(beacon.id, 'resolved');
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
          >
            Mark Resolved
          </button>
        )}

        {/* Get Emergency Route Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSimulateRoute(beacon);
          }}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 border border-slate-200 transition-colors"
          title="Compute Emergency Navigation Driving Path"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

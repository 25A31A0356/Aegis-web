import React, { useState } from 'react';
import { SOSBeacon, SOSTriageStatus } from '../../types/sos';
import {
  X,
  PhoneCall,
  MapPin,
  Clock,
  Shield,
  Send,
  Battery,
  AlertTriangle,
  Users,
  Navigation,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface SOSDetailDrawerProps {
  beacon: SOSBeacon | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: SOSTriageStatus, notes?: string) => void;
  onSimulateRoute: (beacon: SOSBeacon) => void;
}

export const SOSDetailDrawer: React.FC<SOSDetailDrawerProps> = ({
  beacon,
  onClose,
  onUpdateStatus,
  onSimulateRoute,
}) => {
  const [operatorNote, setOperatorNote] = useState('');

  if (!beacon) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorNote.trim()) return;
    onUpdateStatus(beacon.id, beacon.triageStatus, operatorNote.trim());
    setOperatorNote('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 max-w-full flex pl-10">
      <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col font-sans animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                {beacon.id}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {beacon.triageStatus}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white leading-snug">
              {beacon.emergencyTitle}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Caller: {beacon.anonymousAlias} ({beacon.phoneMasked})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Location & GPS Fix */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
              Distress Beacon Fix
            </div>
            <div className="text-xs font-semibold text-slate-900 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{beacon.locationName}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2 grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-100 text-center">
              <div>
                <span className="text-slate-400 block">LAT/LNG</span>
                <span className="font-bold text-slate-800 truncate block">
                  {beacon.coordinates[0].toFixed(3)}, {beacon.coordinates[1].toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">ACCURACY</span>
                <span className="font-bold text-slate-800">±{beacon.gpsAccuracyMeters}m</span>
              </div>
              <div>
                <span className="text-slate-400 block">BATTERY</span>
                <span className={`font-bold ${beacon.batteryPercent < 20 ? 'text-red-600' : 'text-slate-800'}`}>
                  {beacon.batteryPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Medical & Situational Notes */}
          {(beacon.medicalConditions || beacon.specialNeeds) && (
            <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200 text-xs">
              <div className="text-[10px] font-mono uppercase font-bold text-red-700 mb-1">
                Medical & Situational Assessment
              </div>
              {beacon.medicalConditions && (
                <div className="text-slate-800 mb-1">
                  <strong>Medical Conditions:</strong> {beacon.medicalConditions}
                </div>
              )}
              {beacon.specialNeeds && (
                <div className="text-slate-800">
                  <strong>Special Extraction Needs:</strong> {beacon.specialNeeds}
                </div>
              )}
            </div>
          )}

          {/* Triage Action Transitions */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-2">
              Dispatch State Machine
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {(['acknowledged', 'dispatching', 'on_scene', 'resolved'] as SOSTriageStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(beacon.id, st)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      beacon.triageStatus === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Mark {st.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Emergency Driving Route Simulator Trigger */}
          <div>
            <button
              onClick={() => onSimulateRoute(beacon)}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Generate Emergency Response Route</span>
            </button>
          </div>

          {/* Triage Log Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Dispatch & Audit Log
            </h4>
            <div className="border-l-2 border-slate-200 ml-3 space-y-3.5 pl-3 py-1">
              {beacon.timeline.map((evt, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white ring-1 ring-slate-300" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{evt.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">By: {evt.actor}</div>
                  {evt.notes && (
                    <div className="text-slate-600 text-[11px] mt-0.5 bg-slate-50 p-1.5 rounded border border-slate-100">
                      {evt.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Operator Dispatch Note Form */}
          <form onSubmit={handleAddNote} className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-700 font-mono mb-1.5">
              Add Dispatcher / Incident Note
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                placeholder="Log unit radio update or medical note..."
                className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertTriangle, MapPin, PhoneCall, Building, ChevronRight, ShieldAlert } from 'lucide-react';
import { DEMO_HAZARDS } from '../../data/demoHazards';
import { DEMO_STATES } from '../../data/demoStates';
import { DEMO_SOS_BEACONS } from '../../data/demoSOS';
import { DEMO_SHELTERS } from '../../data/demoShelters';
import { useLocation } from '../../context/LocationContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onSelectHazard?: (hazardId: string) => void;
  onSelectSOS?: (sosId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectHazard,
  onSelectSOS,
}) => {
  const [query, setQuery] = useState('');
  const { setSelectedCity, setSelectedStateById } = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Filter Hazards
  const matchingHazards = q
    ? DEMO_HAZARDS.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.categoryName.toLowerCase().includes(q) ||
          h.location.state.toLowerCase().includes(q) ||
          h.location.district.toLowerCase().includes(q)
      ).slice(0, 4)
    : DEMO_HAZARDS.slice(0, 3);

  // Filter States & Cities
  const matchingStates = q
    ? DEMO_STATES.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.capital.toLowerCase().includes(q) ||
          s.id.toLowerCase() === q ||
          s.keyDistricts.some((d) => d.name.toLowerCase().includes(q))
      ).slice(0, 4)
    : DEMO_STATES.slice(0, 4);

  // Filter SOS Beacons
  const matchingSOS = q
    ? DEMO_SOS_BEACONS.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.emergencyTitle.toLowerCase().includes(q) ||
          b.district.toLowerCase().includes(q) ||
          b.state.toLowerCase().includes(q)
      )
    : DEMO_SOS_BEACONS.slice(0, 2);

  // Filter Shelters
  const matchingShelters = q
    ? DEMO_SHELTERS.filter(
        (sh) =>
          sh.name.toLowerCase().includes(q) ||
          sh.state.toLowerCase().includes(q) ||
          sh.district.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hazards, Indian cities, states, SOS IDs, or shelters..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-mono bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-6 divide-y divide-slate-100">
          {/* Hazards Section */}
          {matchingHazards.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Active Hazards & Advisories ({matchingHazards.length})
              </div>
              <div className="space-y-1.5">
                {matchingHazards.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      if (onSelectHazard) onSelectHazard(item.id);
                      onNavigate('hazards');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          item.severity === 'critical'
                            ? 'bg-red-500 animate-pulse'
                            : item.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-sky-500'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{item.location.state} • {item.location.district}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded">
                            {item.categoryName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* States & Urban Centers Section */}
          {matchingStates.length > 0 && (
            <div className="pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                States & Monitored Regions ({matchingStates.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingStates.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStateById(st.id);
                      onClose();
                      onNavigate('dashboard');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-sky-600">
                        {st.name} ({st.id})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Capital: {st.capital} • {st.populationCrores} Cr Pop
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        st.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : st.riskLevel === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {st.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SOS Distress Beacons */}
          {matchingSOS.length > 0 && (
            <div className="pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                Emergency SOS Beacons ({matchingSOS.length})
              </div>
              <div className="space-y-1.5">
                {matchingSOS.map((sos) => (
                  <div
                    key={sos.id}
                    onClick={() => {
                      if (onSelectSOS) onSelectSOS(sos.id);
                      onClose();
                      onNavigate('sos');
                    }}
                    className="p-2.5 rounded-xl hover:bg-red-50/50 border border-slate-100 hover:border-red-200 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {sos.id}
                        </span>
                        <span>{sos.emergencyTitle}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sos.locationName} • Triage: {sos.triageStatus.toUpperCase()}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shelters */}
          {matchingShelters.length > 0 && (
            <div className="pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                Evacuation Shelters & Relief Camps
              </div>
              <div className="space-y-1.5">
                {matchingShelters.map((sh) => (
                  <div
                    key={sh.id}
                    onClick={() => {
                      onClose();
                      onNavigate('live-map');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-900">{sh.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {sh.district}, {sh.state} • Cap: {sh.capacityPersons}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {sh.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Navigate with ↵ or click item</span>
          <span>Index: 8 Hazards • 28 States • 4 SOS • 8 Shelters</span>
        </div>
      </div>
    </div>
  );
};

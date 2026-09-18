import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertTriangle, MapPin, PhoneCall, Building, ChevronRight, ShieldAlert, Sparkles } from 'lucide-react';
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
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#075B8A]/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-[24px] shadow-float border border-[#DCEBED] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#DCEBED] bg-[#F4F8FA]">
          <Search className="w-5 h-5 text-[#075B8A] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hazards, Indian cities, states, SOS IDs, or shelters..."
            className="w-full bg-transparent text-xs sm:text-sm text-[#18364A] placeholder:text-[#708696] focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#708696] hover:text-[#18364A]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-[10px] font-mono bg-white hover:bg-[#EEF5F8] text-[#708696] px-2 py-1 rounded-lg border border-[#DCEBED]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-5 divide-y divide-[#DCEBED]/60">
          {/* Hazards Section */}
          {matchingHazards.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#708696] font-mono mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F4C84A]" />
                <span>Active Hazards & Advisories ({matchingHazards.length})</span>
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
                    className="p-3 rounded-2xl hover:bg-[#F4F8FA] border border-transparent hover:border-[#18C3D0] cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          item.severity === 'critical'
                            ? 'bg-[#E94B68] animate-pulse'
                            : item.severity === 'warning'
                            ? 'bg-[#F4C84A]'
                            : 'bg-[#18C3D0]'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold text-[#18364A] group-hover:text-[#075B8A] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10.5px] text-[#708696] flex items-center gap-2 mt-0.5 font-mono">
                          <span>{item.location.state} • {item.location.district}</span>
                          <span>•</span>
                          <span className="bg-[#EDFAFC] text-[#075B8A] px-1.5 py-0.5 rounded text-[9px] font-bold">
                            {item.categoryName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#708696] group-hover:text-[#075B8A] transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* States & Urban Centers Section */}
          {matchingStates.length > 0 && (
            <div className="pt-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#708696] font-mono mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#075B8A]" />
                <span>States & Monitored Regions ({matchingStates.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingStates.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStateById(st.id);
                      onClose();
                      onNavigate('homepage');
                    }}
                    className="p-3 rounded-2xl hover:bg-[#F4F8FA] border border-[#DCEBED] hover:border-[#18C3D0] cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#18364A] group-hover:text-[#075B8A]">
                        {st.name} ({st.id})
                      </div>
                      <div className="text-[10px] text-[#708696] font-mono">
                        Capital: {st.capital} • {st.populationCrores} Cr Pop
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                        st.riskLevel === 'critical'
                          ? 'bg-[#FEF1F3] text-[#E94B68] border-[#FDC8D1]'
                          : st.riskLevel === 'warning'
                          ? 'bg-[#FFFBF0] text-[#B78809] border-[#FDE8A4]'
                          : 'bg-[#EFFCF6] text-[#1E8A63] border-[#B7F1DC]'
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
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#708696] font-mono mb-2 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#E94B68]" />
                <span>Emergency SOS Beacons ({matchingSOS.length})</span>
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
                    className="p-3 rounded-2xl hover:bg-[#FEF1F3]/40 border border-[#DCEBED] hover:border-[#E94B68] cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#18364A] flex items-center gap-2">
                        <span className="font-mono text-[#E94B68] bg-[#FEF1F3] border border-[#FDC8D1] px-1.5 py-0.5 rounded text-[9px] font-bold">
                          {sos.id}
                        </span>
                        <span>{sos.emergencyTitle}</span>
                      </div>
                      <div className="text-[10.5px] text-[#708696] mt-0.5 font-mono">
                        {sos.locationName} • Triage: {sos.triageStatus.toUpperCase()}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#708696] group-hover:text-[#E94B68]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shelters */}
          {matchingShelters.length > 0 && (
            <div className="pt-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#708696] font-mono mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#075B8A]" />
                <span>Evacuation Shelters & Relief Camps</span>
              </div>
              <div className="space-y-1.5">
                {matchingShelters.map((sh) => (
                  <div
                    key={sh.id}
                    onClick={() => {
                      onClose();
                      onNavigate('live-map');
                    }}
                    className="p-3 rounded-2xl hover:bg-[#F4F8FA] border border-[#DCEBED] cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#18364A]">{sh.name}</div>
                      <div className="text-[10px] text-[#708696] font-mono">
                        {sh.district}, {sh.state} • Cap: {sh.capacityPersons}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-[#EDFAFC] text-[#075B8A] border border-[#AEEBF0] px-2 py-0.5 rounded-full font-bold">
                      {sh.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#F4F8FA] border-t border-[#DCEBED] text-[10px] text-[#708696] flex items-center justify-between font-mono">
          <span>Navigate with ↵ or click item</span>
          <span>Index: 8 Hazards • 28 States • 4 SOS • 8 Shelters</span>
        </div>
      </div>
    </div>
  );
};

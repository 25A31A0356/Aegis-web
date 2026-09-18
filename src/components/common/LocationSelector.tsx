import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ChevronDown,
  Check,
  Search,
  AlertTriangle,
  X,
  Compass,
  Bookmark,
  Building,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { INDIAN_CITIES_REGISTRY, LocationSearchResult, SavedLocationItem } from '../../services/locationService';

interface LocationSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const {
    selectedLocation,
    weather,
    selectedState,
    savedLocations,
    isGpsActive,
    isLoadingLocation,
    locationError,
    clearLocationError,
    requestCurrentGPS,
    searchAndSelectLocation,
    selectLocationItem,
  } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  const filteredCities = INDIAN_CITIES_REGISTRY.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCity = (city: LocationSearchResult) => {
    selectLocationItem(city);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectSaved = (saved: SavedLocationItem) => {
    selectLocationItem(saved);
    setIsOpen(false);
  };

  const handleUseCurrentGPS = async () => {
    await requestCurrentGPS();
    if (!locationError) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-[#F4F8FA] border border-[#DCEBED] text-xs font-semibold text-[#18364A] shadow-subtle transition-all duration-150 cursor-pointer"
        title="Switch Location & Weather Station"
      >
        <MapPin className="w-3.5 h-3.5 text-[#E94B68] shrink-0" />
        <div className="text-left">
          <div className="font-bold text-[11px] leading-tight text-[#18364A] flex items-center gap-1.5">
            <span>{selectedLocation?.name || weather.cityName}</span>
            {isGpsActive && (
              <span className="text-[8.5px] font-mono uppercase bg-[#18C3D0]/20 text-[#075B8A] px-1 py-0.2 rounded font-bold">
                GPS
              </span>
            )}
          </div>
          {variant === 'full' && (
            <div className="text-[10px] text-[#708696] font-mono leading-none mt-0.5">
              {weather.temp}°C • {weather.condition}
            </div>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#708696]" />
      </button>

      {/* Popover Dropdown Dialog */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 sm:w-88 bg-white rounded-[22px] shadow-elevated border border-[#DCEBED] py-3 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header & Tabs */}
          <div className="px-3.5 pb-2.5 border-b border-[#DCEBED] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#075B8A] uppercase font-mono">
              <Compass className="w-4 h-4 text-[#18C3D0]" />
              <span>Select Location</span>
            </div>

            <div className="flex items-center gap-1 bg-[#F4F8FA] p-0.5 rounded-lg border border-[#DCEBED]">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#075B8A] text-white shadow-xs'
                    : 'text-[#708696] hover:text-[#18364A]'
                }`}
              >
                Stations
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-[#075B8A] text-white shadow-xs'
                    : 'text-[#708696] hover:text-[#18364A]'
                }`}
              >
                Saved ({savedLocations.length})
              </button>
            </div>
          </div>

          {/* Friendly Geolocation Error Banner if permission denied / unavailable */}
          {locationError && (
            <div className="mx-3 my-2 p-2.5 bg-[#FFF2F4] border border-[#FFD3DA] rounded-xl text-xs text-[#18364A] space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[#E94B68]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{locationError.message}</span>
                </div>
                <button
                  onClick={clearLocationError}
                  className="text-[#708696] hover:text-[#18364A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10.5px] text-[#708696] leading-tight">
                {locationError.friendlyAdvice}
              </p>
            </div>
          )}

          {/* GPS Button */}
          <div className="p-3 pb-2">
            <button
              onClick={handleUseCurrentGPS}
              disabled={isLoadingLocation}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isGpsActive
                  ? 'bg-[#EDFAFC] text-[#075B8A] border border-[#18C3D0]'
                  : 'bg-[#075B8A] hover:bg-[#0B6E9E] text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Navigation className={`w-4 h-4 text-[#18C3D0] ${isLoadingLocation ? 'animate-spin' : ''}`} />
                <span>{isLoadingLocation ? 'Acquiring GPS Signal...' : isGpsActive ? 'Live GPS Active' : 'Use Current Location'}</span>
              </div>
              <span className="text-[9px] font-mono uppercase bg-white/20 px-1.5 py-0.5 rounded">
                High Accuracy
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#708696] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indian city, district or state..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F4F8FA] border border-[#DCEBED] rounded-full text-xs text-[#18364A] placeholder:text-[#708696] focus:outline-none focus:border-[#18C3D0]"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-52 overflow-y-auto px-2 space-y-1">
            {activeTab === 'saved' ? (
              savedLocations.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#708696]">
                  No saved locations yet. You can add places from the Live Map.
                </div>
              ) : (
                savedLocations.map((saved) => (
                  <button
                    key={saved.id}
                    onClick={() => handleSelectSaved(saved)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between hover:bg-[#F4F8FA] transition-colors ${
                      selectedLocation?.id === saved.id
                        ? 'bg-[#EDFAFC] font-bold text-[#075B8A]'
                        : 'text-[#18364A]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#18364A]">{saved.name}</div>
                      <div className="text-[10px] text-[#708696] font-mono">
                        {saved.district}, {saved.stateName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#18C3D0]/20 text-[#075B8A]">
                        {saved.riskLevel}
                      </span>
                      {selectedLocation?.id === saved.id && (
                        <Check className="w-3.5 h-3.5 text-[#18C3D0]" />
                      )}
                    </div>
                  </button>
                ))
              )
            ) : filteredCities.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#708696]">
                No matching city or region found. Try searching another name.
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSelectCity(city)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between hover:bg-[#F4F8FA] transition-colors ${
                    selectedLocation?.id === city.id
                      ? 'bg-[#EDFAFC] font-bold text-[#075B8A]'
                      : 'text-[#18364A]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#18364A]">{city.name}</div>
                    <div className="text-[10px] text-[#708696]">
                      {city.district}, {city.stateName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        city.riskLevel === 'Critical'
                          ? 'bg-[#E94B68]/15 text-[#E94B68]'
                          : city.riskLevel === 'High'
                          ? 'bg-[#F4C84A]/30 text-[#946800]'
                          : 'bg-[#45C79A]/20 text-[#0B6E4F]'
                      }`}
                    >
                      {city.riskLevel}
                    </span>
                    {selectedLocation?.id === city.id && (
                      <Check className="w-3.5 h-3.5 text-[#18C3D0]" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

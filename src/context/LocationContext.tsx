import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_STATES } from '../data/demoStates';
import { DEMO_CITY_WEATHER } from '../data/demoWeather';
import { StateRiskData } from '../types/location';
import { WeatherTelemetry } from '../types/weather';
import { WeatherService, CITY_COORDINATES } from '../services/weatherService';

interface LocationContextType {
  selectedCityKey: string;
  weather: WeatherTelemetry;
  selectedState: StateRiskData | undefined;
  statesList: StateRiskData[];
  userCoordinates: [number, number] | null;
  isGpsActive: boolean;
  setSelectedCity: (cityKey: string) => void;
  setSelectedStateById: (stateId: string) => void;
  detectCurrentLocation: () => void;
  resetToNational: () => void;
  isNationalOverview: boolean;
  isLoadingWeather: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('hyderabad');
  const [selectedStateId, setSelectedStateId] = useState<string | null>('TS');
  const [isNationalOverview, setIsNationalOverview] = useState<boolean>(false);
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherTelemetry>(
    () => DEMO_CITY_WEATHER['hyderabad']
  );
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  const selectedState = DEMO_STATES.find((s) => s.id === selectedStateId);

  // Auto-detect Real User GPS on mount
  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;

    setIsLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoordinates([lat, lng]);
        setIsGpsActive(true);

        try {
          // Fetch live Open-Meteo telemetry for exact user GPS
          const liveGpsWeather = await WeatherService.fetchLiveWeatherByCoordinates(lat, lng);
          if (liveGpsWeather) {
            setWeather(liveGpsWeather);
          }
        } catch (err) {
          console.warn('[LocationContext] GPS weather fetch failed:', err);
        } finally {
          setIsLoadingWeather(false);
        }
      },
      (err) => {
        console.info('[LocationContext] Geolocation not granted or timed out. Defaulting to India national hub:', err.message);
        setIsLoadingWeather(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Reactive live weather fetch whenever city selector changes
  useEffect(() => {
    if (isGpsActive && userCoordinates) {
      return; // Prioritize real GPS
    }

    let isMounted = true;
    const loadWeather = async () => {
      setIsLoadingWeather(true);
      const initial = DEMO_CITY_WEATHER[selectedCityKey] || DEMO_CITY_WEATHER['hyderabad'];
      setWeather(initial);

      try {
        const live = await WeatherService.fetchLiveCityWeather(selectedCityKey);
        if (isMounted && live) {
          setWeather(live);
        }
      } catch {
        // keep fallback
      } finally {
        if (isMounted) setIsLoadingWeather(false);
      }
    };

    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [selectedCityKey, isGpsActive, userCoordinates]);

  const setSelectedCity = (cityKey: string) => {
    const key = cityKey.toLowerCase();
    setSelectedCityKey(key);
    setIsGpsActive(false);
    setIsNationalOverview(false);

    if (key === 'hyderabad') setSelectedStateId('TS');
    else if (key === 'delhi') setSelectedStateId('DL');
    else if (key === 'mumbai') setSelectedStateId('MH');
    else if (key === 'bhubaneswar') setSelectedStateId('OD');
    else if (key === 'guwahati') setSelectedStateId('AS');
    else if (key === 'kochi') setSelectedStateId('KL');
    else if (key === 'kolkata') setSelectedStateId('WB');
    else if (key === 'chennai') setSelectedStateId('TN');
    else if (key === 'bengaluru') setSelectedStateId('KA');
    else if (key === 'jaipur') setSelectedStateId('RJ');
  };

  const setSelectedStateById = (stateId: string) => {
    setSelectedStateId(stateId);
    setIsGpsActive(false);
    setIsNationalOverview(false);
    const state = DEMO_STATES.find((s) => s.id === stateId);
    if (state) {
      const capitalKey = state.capital.split(' ')[0].toLowerCase();
      if (CITY_COORDINATES[capitalKey]) {
        setSelectedCity(capitalKey);
      }
    }
  };

  const resetToNational = () => {
    setIsNationalOverview(true);
    setSelectedStateId(null);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCityKey,
        weather,
        selectedState,
        statesList: DEMO_STATES,
        userCoordinates,
        isGpsActive,
        setSelectedCity,
        setSelectedStateById,
        detectCurrentLocation,
        resetToNational,
        isNationalOverview,
        isLoadingWeather,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

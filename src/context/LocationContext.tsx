import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_STATES } from '../data/demoStates';
import { DEMO_CITY_WEATHER } from '../data/demoWeather';
import { StateRiskData } from '../types/location';
import { WeatherTelemetry } from '../types/weather';
import { WeatherService } from '../services/weatherService';

interface LocationContextType {
  selectedCityKey: string;
  weather: WeatherTelemetry;
  selectedState: StateRiskData | undefined;
  statesList: StateRiskData[];
  setSelectedCity: (cityKey: string) => void;
  setSelectedStateById: (stateId: string) => void;
  resetToNational: () => void;
  isNationalOverview: boolean;
  isLoadingWeather: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('hyderabad');
  const [selectedStateId, setSelectedStateId] = useState<string | null>('TS');
  const [isNationalOverview, setIsNationalOverview] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherTelemetry>(
    () => DEMO_CITY_WEATHER['hyderabad']
  );
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  const selectedState = DEMO_STATES.find((s) => s.id === selectedStateId);

  // Reactive live weather fetch whenever city changes
  useEffect(() => {
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
  }, [selectedCityKey]);

  const setSelectedCity = (cityKey: string) => {
    const key = cityKey.toLowerCase();
    setSelectedCityKey(key);
    setIsNationalOverview(false);

    // Auto-map state
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
    setIsNationalOverview(false);
    const state = DEMO_STATES.find((s) => s.id === stateId);
    if (state) {
      const capitalKey = state.capital.split(' ')[0].toLowerCase();
      if (DEMO_CITY_WEATHER[capitalKey]) {
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
        setSelectedCity,
        setSelectedStateById,
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
